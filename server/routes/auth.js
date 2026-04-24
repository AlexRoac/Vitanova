const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");

// LIBRERÍAS DE GOOGLE (¡Nuevas!)
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================================
// RUTA DE LOGIN (POST /api/auth/login)
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscamos al usuario por email y HACEMOS UN JOIN para traer el nombre de su rol
    const result = await pool.query(
      `SELECT u.*, r.nombre_rol 
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.email = $1 AND u.activo = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "Contraseña o usuario incorrectos" });
    }

    const user = result.rows[0];

    // 2. Comparamos la contraseña enviada con el hash guardado en la BD
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(400).json({ msg: "Contraseña o usuario incorrectos" });
    }

    // --- GENERAR EL TOKEN JWT ---
    // 3. Creamos un payload con el id del usuario Y SU ROL
    const payload = {
      usuario: { 
        id: user.id_usuario,
        rol: user.nombre_rol // Agregamos el rol al token por seguridad
      }
    };

    // Firmamos el token (puedes cambiar "mi_secreto_super_seguro" por otra frase)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    // 4. Login exitoso: Devolvemos los datos básicos del usuario, el TOKEN y EL ROL
    res.json({
      msg: "Login exitoso",
      token: token, // <-- Enviamos el token al frontend
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.nombre_rol, // <-- ¡Enviamos el rol a React!
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error del servidor al iniciar sesión" });
  }
});

// ==========================================
// RUTA DE REGISTRO (POST /api/auth/register)
// ==========================================
router.post("/register", async (req, res) => {
  try {
    // 1. Desestructuramos TODOS los datos que vienen del frontend (Paso 1 y Paso 2)
    const { 
      email, 
      password, 
      nombre, 
      apellido, 
      telefono, 
      fecha_nacimiento, 
      ocupacion, 
      genero, 
      estado_civil 
    } = req.body;

    // 2. Verificar si el usuario ya existe con ese email
    const userExist = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ msg: "El correo electrónico ya está registrado" });
    }

    // 3. Encriptar la contraseña (Hashing)
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Preparar la fecha de nacimiento
    const fechaNacimientoValida = fecha_nacimiento ? fecha_nacimiento : null;

    // 5. Insertar el nuevo usuario en la base de datos
    // NOTA: No enviamos "id_rol" aquí. PostgreSQL automáticamente le asignará "1" (paciente) 
    // gracias al DEFAULT 1 que configuramos en la base de datos.
    const newUser = await pool.query(
      `INSERT INTO usuarios 
      (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, ocupacion, genero, estado_civil) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id_usuario, nombre, apellido, email, id_rol`,
      [
        email, 
        password_hash, 
        nombre, 
        apellido, 
        telefono, 
        fechaNacimientoValida, 
        ocupacion, 
        genero, 
        estado_civil
      ]
    );

    // 6. Enviar respuesta de éxito al frontend
    res.status(201).json({
      msg: "Registro exitoso",
      user: newUser.rows[0],
    });

  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ msg: "Error interno del servidor al registrar usuario" });
  }
});

// ==========================================
// RUTA DE GOOGLE (POST /api/auth/google)
// ==========================================
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    // 1. Verificamos el token con la librería de Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // Obtenemos los datos del correo de Google
    const payloadGoogle = ticket.getPayload();
    const { email, given_name, family_name } = payloadGoogle;

    // 2. Buscamos si el usuario ya existe en tu BD (Hacemos JOIN para el rol)
    let result = await pool.query(
      `SELECT u.*, r.nombre_rol 
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.email = $1`,
      [email]
    );

    let user;

    // 3. Si NO existe, lo creamos (Find or Create)
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

    user = result.rows[0];

    // Verificar si el administrador desactivó esta cuenta
    if (user.activo === false) {
      return res.status(403).json({ msg: "Esta cuenta está desactivada. Contacta soporte." });
    }

    // 4. Creamos el JWT exactamente igual que en el login manual
    const payload = {
      usuario: { 
        id: user.id_usuario,
        rol: user.nombre_rol 
      }
    };

    const sessionToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    // --- NUEVO: VALIDACIÓN DE PERFIL COMPLETO ---
    // Checamos si el usuario tiene un teléfono guardado (y que no sea null ni vacío)
    const perfilCompleto = user.telefono !== null && user.telefono !== "";

    // 5. Devolvemos la respuesta agregando la bandera "perfil_completo"
    res.json({
      msg: "Login con Google exitoso",
      token: sessionToken, 
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.nombre_rol,
        perfil_completo: perfilCompleto // <-- Enviamos la bandera a React
      },
    });

  } catch (error) {
    console.error("Error en validación de Google:", error);
    res.status(401).json({ msg: "Token de Google inválido o caducado" });
  }
});

// ==========================================
// RUTA PARA COMPLETAR PERFIL (PUT /api/auth/completar-perfil/:id)
// ==========================================
router.put("/completar-perfil/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { telefono, fecha_nacimiento, ocupacion, genero, estado_civil } = req.body;

    // Actualizamos al usuario en la base de datos
    const updateQuery = await pool.query(
      `UPDATE usuarios 
       SET telefono = $1, 
           fecha_nacimiento = $2, 
           ocupacion = $3, 
           genero = $4, 
           estado_civil = $5 
       WHERE id_usuario = $6 
       RETURNING *`,
      [telefono, fecha_nacimiento, ocupacion, genero, estado_civil, id]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json({ msg: "Perfil actualizado correctamente", user: updateQuery.rows[0] });

  } catch (error) {
    console.error("Error al completar el perfil:", error);
    res.status(500).json({ msg: "Error interno del servidor al actualizar perfil" });
  }
});

module.exports = router;