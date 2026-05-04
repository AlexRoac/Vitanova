const express = require('express');
const router = express.Router();
const pool = require('../db');
const transporter = require('../utils/mailer');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.get('/:psicologoId/:fecha', verificarToken, async (req, res) => {
    const { psicologoId, fecha } = req.params;
    try {
        const result = await pool.query(
            "SELECT hora_inicio FROM disponibilidad WHERE psicologo_id = $1 AND fecha = $2 AND ocupado = FALSE ORDER BY hora_inicio ASC",
            [psicologoId, fecha]
        );
        const horas = result.rows.map(row => row.hora_inicio.slice(0, 5));
        res.json(horas);
    } catch (err) {
        console.error("Error al obtener disponibilidad:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.post('/configurar', verificarToken, verificarRol('psicologo', 'admin'), async (req, res) => {
    const { psicologoId, fecha, horas } = req.body;
    const { id: idSolicitante, rol } = req.usuario.usuario;

    if (rol === 'psicologo' && String(idSolicitante) !== String(psicologoId)) {
        return res.status(403).json({ error: 'Solo puedes configurar tus propios horarios.' });
    }

    if (!psicologoId || !fecha) {
        return res.status(400).json({ error: 'psicologoId y fecha son obligatorios.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            "DELETE FROM disponibilidad WHERE psicologo_id = $1 AND fecha = $2 AND ocupado = FALSE",
            [psicologoId, fecha]
        );

        if (horas && horas.length > 0) {
            for (let hora of horas) {
                await client.query(
                    "INSERT INTO disponibilidad (psicologo_id, fecha, hora_inicio, ocupado) VALUES ($1, $2, $3, FALSE)",
                    [psicologoId, fecha, hora]
                );
            }
        }
        await client.query('COMMIT');
        res.json({ mensaje: "Horarios actualizados correctamente" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error al guardar horarios:", err);
        res.status(500).json({ error: "Error al guardar los horarios" });
    } finally {
        client.release();
    }
});

// 3. RESERVAR CITA 
router.post('/reservar', verificarToken, verificarRol('paciente', 'admin'), async (req, res) => {
    const { pacienteId, psicologoId, fecha, hora } = req.body;
    const { id: idSolicitante, rol } = req.usuario.usuario;

    if (rol === 'paciente' && String(idSolicitante) !== String(pacienteId)) {
        return res.status(403).json({ error: 'No puedes reservar una cita a nombre de otro paciente.' });
    }

    if (!pacienteId || !psicologoId || !fecha || !hora) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            "INSERT INTO citas (paciente_id, psicologo_id, fecha, hora, estado) VALUES ($1, $2, $3, $4, 'confirmada')",
            [pacienteId, psicologoId, fecha, hora]
        );

        const updateResult = await client.query(
            "UPDATE disponibilidad SET ocupado = TRUE WHERE psicologo_id = $1 AND fecha = $2 AND hora_inicio = $3",
            [psicologoId, fecha, hora]
        );

        if (updateResult.rowCount === 0) {
            throw new Error("El horario ya no está disponible");
        }

        const infoQuery = await client.query(
            `SELECT 
                (SELECT email FROM usuarios WHERE id_usuario = $1) AS email_paciente,
                (SELECT email FROM usuarios WHERE id_usuario = $2) AS email_psicologo,
                (SELECT nombre || ' ' || apellido FROM usuarios WHERE id_usuario = $2) AS nombre_psicologo,
                (SELECT nombre FROM usuarios WHERE id_usuario = $1) AS nombre_paciente
            `, [pacienteId, psicologoId]
        );

        const { email_paciente, email_psicologo, nombre_psicologo, nombre_paciente } = infoQuery.rows[0];

        await client.query('COMMIT');

        const mailOptions = {
            from: `"Vitanova Psicología" <${process.env.EMAIL_USER}>`,
            to: `${email_paciente}, ${email_psicologo}`,
            subject: "🗓️ Confirmación de Cita - Vitanova",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #2c3e50;">¡Cita Agendada con Éxito!</h2>
                    <p>Hola, se ha confirmado una nueva sesión en la plataforma:</p>
                    <hr />
                    <p><strong>Paciente:</strong> ${nombre_paciente}</p>
                    <p><strong>Psicólogo:</strong> ${nombre_psicologo}</p>
                    <p><strong>Fecha:</strong> ${fecha}</p>
                    <p><strong>Hora:</strong> ${hora} hrs</p>
                    <hr />
                    <p style="font-size: 0.9em; color: #7f8c8d;">Recuerden estar presentes 5 minutos antes de la sesión.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error("Error al enviar email:", error);
            else console.log("Emails enviados correctamente:", info.response);
        });

        res.json({ mensaje: "✅ Cita agendada y notificaciones enviadas" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error al reservar:", err);
        res.status(500).json({ error: "No se pudo agendar la cita." });
    } finally {
        client.release();
    }
});

module.exports = router;