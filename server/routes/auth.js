const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { verificarToken } = require("../middlewares/auth");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================================================
// HELPERS DE VALIDACIÓN
// ============================================================

/**
 * Valida formato básico de email.
 * Usamos regex sencillo; para producción considera usar la librería 'validator'.
 */
const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Valida que la contraseña tenga al menos 8 caracteres.
 * Puedes agregar más reglas (mayúscula, número, símbolo) según tus requisitos.
 */
const esPasswordValida = (password) =>
  typeof password === "string" && password.trim().length >= 8;

// ============================================================
// POST /api/auth/login
// ============================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validación de entrada ---
    if (!email || !password) {
      return res.status(400).json({ msg: "Email y contraseña son obligatorios." });
    }
    if (!esEmailValido(email)) {
      return res.status(400).json({ msg: "Formato de email inválido." });
    }

    const result = await pool.query(
      `SELECT u.*, r.nombre_rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.email = $1 AND u.activo = true`,
      [email]
    );

    // NOTA DE SEGURIDAD: respuesta genérica para no revelar si el email existe
    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "Credenciales incorrectas." });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({ msg: "Credenciales incorrectas." });
    }

    const payload = {
      usuario: {
        id: user.id_usuario,
        rol: user.nombre_rol,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({
      msg: "Login exitoso",
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.nombre_rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ msg: "Error interno del servidor." });
  }
});

// ============================================================
// POST /api/auth/register
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      apellido,
      telefono,
      fecha_nacimiento,
      ocupacion,
      genero,
      estado_civil,
    } = req.body;

    // --- Validación de entrada ---
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ msg: "Nombre, apellido, email y contraseña son obligatorios." });
    }
    if (!esEmailValido(email)) {
      return res.status(400).json({ msg: "Formato de email inválido." });
    }
    if (!esPasswordValida(password)) {
      return res.status(400).json({ msg: "La contraseña debe tener al menos 8 caracteres." });
    }
    if (nombre.trim().length < 2 || apellido.trim().length < 2) {
      return res.status(400).json({ msg: "Nombre y apellido deben tener al menos 2 caracteres." });
    }

    // Verificar si el email ya existe
    const userExist = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE email = $1",
      [email]
    );
    if (userExist.rows.length > 0) {
      return res.status(400).json({ msg: "El correo electrónico ya está registrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const fechaNacimientoValida = fecha_nacimiento || null;

    const newUser = await pool.query(
      `INSERT INTO usuarios
        (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, ocupacion, genero, estado_civil)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id_usuario, nombre, apellido, email, id_rol`,
      [
        email,
        password_hash,
        nombre.trim(),
        apellido.trim(),
        telefono || null,
        fechaNacimientoValida,
        ocupacion || null,
        genero || null,
        estado_civil || null,
      ]
    );

    res.status(201).json({
      msg: "Registro exitoso",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ msg: "Error interno del servidor." });
  }
});

// ============================================================
// POST /api/auth/google
// ============================================================
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ msg: "Token de Google requerido." });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payloadGoogle = ticket.getPayload();
    const { email, given_name, family_name } = payloadGoogle;

    let result = await pool.query(
      `SELECT u.*, r.nombre_rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      await pool.query(
        `INSERT INTO usuarios (email, nombre, apellido, password_hash, activo)
         VALUES ($1, $2, $3, $4, $5)`,
        [email, given_name || "Usuario", family_name || "", "GOOGLE_AUTH", true]
      );

      result = await pool.query(
        `SELECT u.*, r.nombre_rol
         FROM usuarios u
         JOIN roles r ON u.id_rol = r.id_rol
         WHERE u.email = $1`,
        [email]
      );
    }

    const user = result.rows[0];

    if (user.activo === false) {
      return res.status(403).json({ msg: "Esta cuenta está desactivada. Contacta soporte." });
    }

    const payload = {
      usuario: {
        id: user.id_usuario,
        rol: user.nombre_rol,
      },
    };

    const sessionToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    const perfilCompleto = user.telefono !== null && user.telefono !== "";

    res.json({
      msg: "Login con Google exitoso",
      token: sessionToken,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.nombre_rol,
        perfil_completo: perfilCompleto,
      },
    });
  } catch (error) {
    console.error("Error en validación de Google:", error);
    res.status(401).json({ msg: "Token de Google inválido o caducado." });
  }
});

// ============================================================
// PUT /api/auth/completar-perfil
//
// CORRECCIÓN CRÍTICA (IDOR):
//  - Antes: recibía :id desde la URL → cualquiera podía editar a otro usuario
//  - Ahora: requiere JWT válido y toma el id del propio token
//  - El parámetro :id del URL fue ELIMINADO completamente
// ============================================================
router.put("/completar-perfil", verificarToken, async (req, res) => {
  try {
    // El id viene del JWT verificado, NUNCA del cliente
    const id = req.usuario.usuario.id;

    const { telefono, fecha_nacimiento, ocupacion, genero, estado_civil } = req.body;

    // Validación básica
    if (!telefono) {
      return res.status(400).json({ msg: "El teléfono es obligatorio." });
    }

    const updateQuery = await pool.query(
      `UPDATE usuarios
       SET telefono      = $1,
           fecha_nacimiento = $2,
           ocupacion     = $3,
           genero        = $4,
           estado_civil  = $5
       WHERE id_usuario = $6
       RETURNING id_usuario, nombre, apellido, email, telefono`,
      [telefono, fecha_nacimiento || null, ocupacion || null, genero || null, estado_civil || null, id]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado." });
    }

    res.json({ msg: "Perfil actualizado correctamente", user: updateQuery.rows[0] });
  } catch (error) {
    console.error("Error al completar perfil:", error);
    res.status(500).json({ msg: "Error interno del servidor." });
  }
});

module.exports = router;
