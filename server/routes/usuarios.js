const express = require("express");
const router = express.Router();
const pool = require("../db");

// 1. OBTENER TODOS LOS USUARIOS (General)
router.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_usuario AS id, nombre, email, id_rol AS rol, apellido, telefono, fecha_nacimiento, genero FROM usuarios ORDER BY id_usuario ASC"
    );
    res.json(result.rows); 
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 2. NUEVA RUTA: OBTENER SOLO PSICÓLOGOS (Para el Dropdown del Paciente)
router.get("/psicologos", async (req, res) => {
  try {
    // Filtramos por id_rol = 2 que es el rol de psicólogo
    const result = await pool.query(
      "SELECT id_usuario, nombre, apellido FROM usuarios WHERE id_rol = 2 ORDER BY nombre ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener psicólogos:", error);
    res.status(500).json({ error: "Error al obtener la lista de especialistas" });
  }
});

// 3. ELIMINAR UN USUARIO
router.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params; 
  try {
    await pool.query("DELETE FROM usuarios WHERE id_usuario = $1", [id]);
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

// 4. GUARDAR LOS NUEVOS ROLES
router.put("/usuarios/actualizar-roles", async (req, res) => {
  const { usuarios } = req.body; 
  try {
    await Promise.all(
      usuarios.map(async (user) => {
        await pool.query(
          "UPDATE usuarios SET id_rol = $1 WHERE id_usuario = $2", 
          [user.rol, user.id]
        );
      })
    );
    res.json({ mensaje: "Roles actualizados correctamente" });
  } catch (error) {
    console.error("Error al actualizar roles:", error);
    res.status(500).json({ error: "Error al actualizar los roles" });
  }
});

module.exports = router;