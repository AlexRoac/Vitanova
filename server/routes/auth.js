const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND activo = true",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "Usuario no existe" });
    }

    const user = result.rows[0];

    
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    res.json({
      msg: "Login exitoso",
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;