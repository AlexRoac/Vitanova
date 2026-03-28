const express = require("express");
const router = express.Router();
const pool = require("../db");

// OBTENER TODOS LOS USUARIOS
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

// ELIMINAR UN USUARIO
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

// GUARDAR LOS NUEVOS ROLES
router.put("/usuarios/actualizar-roles", async (req, res) => {
  const { usuarios } = req.body; 

  try {
    await Promise.all(
      usuarios.map(async (user) => {
        // Importante: Aqui actualizamos id_rol
        // React nos mandara el numero del rol segun el select
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