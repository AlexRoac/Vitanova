const transporter = require("../utils/mailer");

/**
 * cancelarCitasPsicologo
 * Cancela todas las citas futuras confirmadas de un psicólogo,
 * libera su disponibilidad y notifica a cada paciente por email.
 *
 * @param {import("pg").PoolClient} client  - Cliente de transacción activo
 * @param {number|string} psicologoId       - ID del psicólogo
 * @returns {Promise<number>}               - Número de citas canceladas
 */
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
    // 1. Cancelar la cita
    await client.query("UPDATE citas SET estado = 'cancelada' WHERE id = $1", [cita.id]);

    // 2. Liberar el slot de disponibilidad
    await client.query(
      `UPDATE disponibilidad
       SET ocupado = FALSE
       WHERE psicologo_id = $1 AND fecha = $2 AND hora_inicio = $3`,
      [psicologoId, cita.fecha, cita.hora]
    );

    // 3. Notificar al paciente (fallo silencioso — no aborta la transacción)
    try {
      const fechaFormateada = new Date(cita.fecha).toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
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

module.exports = { cancelarCitasPsicologo };