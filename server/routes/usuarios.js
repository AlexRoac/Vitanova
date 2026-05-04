const express = require("express");
const router = express.Router();
const pool = require("../db");
const transporter = require("../utils/mailer");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// ─── Utilidad: cancelar citas futuras de un psicólogo ────────────────────────
async function cancelarCitasPsicologo(client, psicologoId) {
  const citasResult = await client.query(
    `SELECT c.id, c.fecha, c.hora, c.paciente_id,
            u.email AS email_paciente, u.nombre AS nombre_paciente,
            p.nombre AS nombre_psicologo, p.apellido AS apellido_psicologo
     FROM citas c
     JOIN usuarios u ON c.paciente_id = u.id_usuario
     JOIN usuarios p ON c.psicologo_id = p.id_usuario
     WHERE c.psicologo_id = $1
       AND c.estado = 'confirmada'
       AND c.fecha >= CURRENT_DATE`,
    [psicologoId]
  );

  const citas = citasResult.rows;
  if (citas.length === 0) return 0;

  for (const cita of citas) {
    await client.query("UPDATE citas SET estado = 'cancelada' WHERE id = $1", [cita.id]);
    await client.query(
      `UPDATE disponibilidad
       SET ocupado = FALSE
       WHERE psicologo_id = $1 AND fecha = $2 AND hora_inicio = $3`,
      [psicologoId, cita.fecha, cita.hora]
    );

    try {
      const fechaFormateada = new Date(cita.fecha).toLocaleDateString("es-MX", {
        weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
      });
      await transporter.sendMail({
        from: `"Vitanova" <${process.env.EMAIL_USER}>`,
        to: cita.email_paciente,
        subject: "Tu cita ha sido cancelada — Vitanova",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:auto">
            <h2 style="color:#60A6BF">Aviso de cancelación de cita</h2>
            <p>Hola <strong>${cita.nombre_paciente}</strong>,</p>
            <p>Tu cita con <strong>${cita.nombre_psicologo} ${cita.apellido_psicologo}</strong>
               el <strong>${fechaFormateada}</strong> a las <strong>${cita.hora.slice(0, 5)}</strong>
               ha sido cancelada por cambios administrativos.</p>
            <p>Por favor agenda una nueva cita con otro especialista.</p>
            <p style="color:#888;font-size:12px">— Equipo Vitanova</p>
          </div>`,
      });
    } catch (emailError) {
      console.error(`Error al enviar email a ${cita.email_paciente}:`, emailError.message);
    }
  }

  return citas.length;
}

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