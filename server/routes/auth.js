const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken"); // <-- Importamos jsonwebtoken

// ==========================================
// RUTA DE LOGIN (POST /api/auth/login)
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscamos al usuario por email y verificamos que su cuenta esté activa
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND activo = true",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "Usuario no existe o la cuenta está inactiva" });
    }

    const user = result.rows[0];

    // Comparamos la contraseña enviada con el hash guardado en la BD
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    // --- GENERAR EL TOKEN JWT ---
    // Creamos un payload con el id del usuario
    const payload = {
      usuario: { id: user.id_usuario }
    };

    // Firmamos el token (puedes cambiar "mi_secreto_super_seguro" por otra frase)
    const token = jwt.sign(payload, "mi_secreto_super_seguro", { expiresIn: "2h" });

    // Login exitoso: Devolvemos los datos básicos del usuario y el TOKEN
    res.json({
      msg: "Login exitoso",
      token: token, // <-- Enviamos el token al frontend
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
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
    // Si desde el frontend mandan un string vacío "", a Postgres no le gusta en un campo DATE. 
    // Lo convertimos a null si viene vacío.
    const fechaNacimientoValida = fecha_nacimiento ? fecha_nacimiento : null;

    // 5. Insertar el nuevo usuario en la base de datos con todos sus datos del perfil
    const newUser = await pool.query(
      `INSERT INTO usuarios 
      (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, ocupacion, genero, estado_civil) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id_usuario, nombre, apellido, email`,
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

module.exports = router;