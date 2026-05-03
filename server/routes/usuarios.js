const express = require("express");
const router = express.Router();
const pool = require("../db");
const transporter = require("../utils/mailer");

// ─── Utilidad: cancelar todas las citas futuras de un psicólogo ───────────────
// Cancela citas con estado 'confirmada', libera disponibilidad y notifica pacientes.
async function cancelarCitasPsicologo(client, psicologoId) {
  // Obtener citas confirmadas futuras del psicólogo
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

  // Cancelar las citas y liberar disponibilidad
  for (const cita of citas) {
    await client.query(
      "UPDATE citas SET estado = 'cancelada' WHERE id = $1",
      [cita.id]
    );

    await client.query(
      `UPDATE disponibilidad
       SET ocupado = FALSE
       WHERE psicologo_id = $1 AND fecha = $2 AND hora_inicio = $3`,
      [psicologoId, cita.fecha, cita.hora]
    );

    // Notificar al paciente por email
    try {
      const fechaFormateada = new Date(cita.fecha).toLocaleDateString("es-MX", {
        weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
      });
      const horaFormateada = cita.hora.slice(0, 5);

      await transporter.sendMail({
        from: `"Vitanova" <${process.env.EMAIL_USER}>`,
        to: cita.email_paciente,
        subject: "Tu cita ha sido cancelada — Vitanova",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:auto">
            <h2 style="color:#60A6BF">Aviso de cancelación de cita</h2>
            <p>Hola <strong>${cita.nombre_paciente}</strong>,</p>
            <p>Tu cita con el/la psicólogo/a <strong>${cita.nombre_psicologo} ${cita.apellido_psicologo}</strong>
               programada para el <strong>${fechaFormateada}</strong> a las <strong>${horaFormateada}</strong>
               ha sido cancelada por cambios administrativos.</p>
            <p>Por favor, agenda una nueva cita con otro especialista disponible.</p>
            <p style="color:#888;font-size:12px">— Equipo Vitanova</p>
          </div>
        `
      });
    } catch (emailError) {
      // El email falla silenciosamente; la cancelación ya fue guardada
      console.error(`Error al enviar email a ${cita.email_paciente}:`, emailError.message);
    }
  }

  return citas.length;
}
// ─────────────────────────────────────────────────────────────────────────────

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

// 2. OBTENER SOLO PSICÓLOGOS (Para el Dropdown del Paciente)
router.get("/psicologos", async (req, res) => {
  try {
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
// Si el usuario era psicólogo, cancela sus citas futuras antes de eliminarlo.
router.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar si el usuario era psicólogo (id_rol = 2)
    const usuarioResult = await client.query(
      "SELECT id_rol FROM usuarios WHERE id_usuario = $1",
      [id]
    );

    if (usuarioResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let citasCanceladas = 0;
    if (String(usuarioResult.rows[0].id_rol) === "2") {
      citasCanceladas = await cancelarCitasPsicologo(client, id);
    }

    await client.query("DELETE FROM usuarios WHERE id_usuario = $1", [id]);

    await client.query("COMMIT");

    res.json({
      mensaje: "Usuario eliminado correctamente",
      citasCanceladas
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  } finally {
    client.release();
  }
});

// 4. GUARDAR LOS NUEVOS ROLES
// Si algún usuario cambia DE psicólogo a otro rol, cancela sus citas futuras.
router.put("/usuarios/actualizar-roles", async (req, res) => {
  const { usuarios } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let totalCitasCanceladas = 0;

    for (const user of usuarios) {
      // Verificar rol actual en BD antes de actualizarlo
      const actual = await client.query(
        "SELECT id_rol FROM usuarios WHERE id_usuario = $1",
        [user.id]
      );

      if (actual.rowCount === 0) continue;

      const rolActual = String(actual.rows[0].id_rol);
      const rolNuevo  = String(user.rol);

      // Si era psicólogo y ahora deja de serlo → cancelar sus citas
      if (rolActual === "2" && rolNuevo !== "2") {
        const canceladas = await cancelarCitasPsicologo(client, user.id);
        totalCitasCanceladas += canceladas;
      }

      await client.query(
        "UPDATE usuarios SET id_rol = $1 WHERE id_usuario = $2",
        [user.rol, user.id]
      );
    }

    await client.query("COMMIT");

    res.json({
      mensaje: "Roles actualizados correctamente",
      citasCanceladas: totalCitasCanceladas
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar roles:", error);
    res.status(500).json({ error: "Error al actualizar los roles" });
  } finally {
    client.release();
  }
});

module.exports = router;