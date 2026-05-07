const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verificarToken, verificarRol } = require("../middlewares/auth");
const { cancelarCitasPsicologo } = require("../services/citasService");

// ============================================================
// GET /api/usuarios
// Solo admin puede ver todos los usuarios
// ============================================================
router.get(
  "/usuarios",
  verificarToken,
  verificarRol("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id_usuario AS id, nombre, apellido, email, id_rol AS rol,
                telefono, fecha_nacimiento, genero
         FROM usuarios
         ORDER BY id_usuario ASC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  }
);

// ============================================================
// GET /api/usuarios/pacientes
// Solo psicólogos pueden ver la lista de pacientes (id_rol = 1)
// ============================================================
router.get(
  "/usuarios/pacientes",
  verificarToken,
  verificarRol("psicologo"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id_usuario, nombre, apellido, email,
                telefono, fecha_nacimiento, genero
         FROM usuarios
         WHERE id_rol = 1
         ORDER BY nombre ASC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  }
);

// ============================================================
// GET /api/psicologos
// Cualquier usuario autenticado puede ver la lista de psicólogos
// (necesario para que el paciente agende cita)
// ============================================================
router.get(
  "/psicologos",
  verificarToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id_usuario, nombre, apellido
         FROM usuarios
         WHERE id_rol = 2
         ORDER BY nombre ASC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener psicólogos:", error);
      res.status(500).json({ error: "Error al obtener la lista de especialistas." });
    }
  }
);

// ============================================================
// DELETE /api/usuarios/:id
// Solo admin puede eliminar usuarios
// ============================================================
router.delete(
  "/usuarios/:id",
  verificarToken,
  verificarRol("admin"),
  async (req, res) => {
    const { id } = req.params;

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: "ID de usuario inválido." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const usuarioResult = await client.query(
        "SELECT id_rol FROM usuarios WHERE id_usuario = $1",
        [id]
      );

      if (usuarioResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      // [SEGURIDAD] Impedir eliminar al último administrador desde la API
      if (String(usuarioResult.rows[0].id_rol) === "3") {
        const adminCount = await client.query(
          "SELECT COUNT(*) FROM usuarios WHERE id_rol = 3"
        );
        if (parseInt(adminCount.rows[0].count) <= 1) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: "No puedes eliminar al único administrador del sistema." });
        }
      }

      let citasCanceladas = 0;
      if (String(usuarioResult.rows[0].id_rol) === "2") {
        citasCanceladas = await cancelarCitasPsicologo(client, id);
      }

      await client.query("DELETE FROM usuarios WHERE id_usuario = $1", [id]);
      await client.query("COMMIT");

      res.json({ mensaje: "Usuario eliminado correctamente", citasCanceladas });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error al eliminar usuario:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    } finally {
      client.release();
    }
  }
);

// ============================================================
// PUT /api/usuarios/actualizar-roles
// Solo admin puede cambiar roles
// ============================================================
router.put(
  "/usuarios/actualizar-roles",
  verificarToken,
  verificarRol("admin"),
  async (req, res) => {
    const { usuarios } = req.body;

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de usuarios." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      let totalCitasCanceladas = 0;

      for (const user of usuarios) {
        if (!user.id || !user.rol) continue;

        const actual = await client.query(
          "SELECT id_rol FROM usuarios WHERE id_usuario = $1",
          [user.id]
        );
        if (actual.rowCount === 0) continue;

        const rolActual = String(actual.rows[0].id_rol);
        const rolNuevo  = String(user.rol);

        // [SEGURIDAD] Impedir degradar al último administrador
        if (rolActual === "3" && rolNuevo !== "3") {
          const adminCount = await client.query(
            "SELECT COUNT(*) FROM usuarios WHERE id_rol = 3"
          );
          if (parseInt(adminCount.rows[0].count) <= 1) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "No puedes quitarle el rol al único administrador del sistema." });
          }
        }

        if (rolActual === "2" && rolNuevo !== "2") {
          totalCitasCanceladas += await cancelarCitasPsicologo(client, user.id);
        }

        await client.query(
          "UPDATE usuarios SET id_rol = $1 WHERE id_usuario = $2",
          [user.rol, user.id]
        );
      }

      await client.query("COMMIT");
      res.json({ mensaje: "Roles actualizados correctamente", citasCanceladas: totalCitasCanceladas });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error al actualizar roles:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    } finally {
      client.release();
    }
  }
);

module.exports = router;