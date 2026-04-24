const express = require('express');
const router = express.Router();
const pool = require('../db');
const transporter = require('../utils/mailer'); 

// ==========================================
// 1. OBTENER CITAS DE UN PACIENTE ESPECÍFICO
// ==========================================
router.get('/paciente/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT 
                c.id, 
                c.fecha, 
                c.hora, 
                c.estado, 
                u.nombre AS nombre_psicologo, 
                u.apellido AS apellido_psicologo
            FROM citas c
            JOIN usuarios u ON c.psicologo_id = u.id_usuario
            WHERE c.paciente_id = $1
            ORDER BY c.fecha DESC, c.hora DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error SQL detallado:", error.message);
        res.status(500).json({ error: "Error al obtener el historial de citas" });
    }
});

router.get('/psicologo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT 
                c.id, 
                c.fecha, 
                c.hora, 
                c.estado, 
                u.nombre AS nombre_paciente, 
                u.apellido AS apellido_paciente
            FROM citas c
            JOIN usuarios u ON c.paciente_id = u.id_usuario
            WHERE c.psicologo_id = $1
            ORDER BY c.fecha DESC, c.hora DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error SQL detallado:", error.message);
        res.status(500).json({ error: "Error al obtener el historial de citas" });
    }
});

// ==========================================
// 2. OBTENER HORARIOS DISPONIBLES (AHORA ESTÁ ABAJO)
// ==========================================
router.get('/:psicologoId/:fecha', async (req, res) => {
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

// ==========================================
// 3. GUARDAR O EDITAR HORARIOS (Vista Psicólogo)
// ==========================================
router.post('/configurar', async (req, res) => {
    const { psicologoId, fecha, horas } = req.body; 
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

// ==========================================
// 4. RESERVAR CITA + ENVÍO DE EMAILS
// ==========================================
router.post('/reservar', async (req, res) => {
    const { pacienteId, psicologoId, fecha, hora } = req.body;
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

// ==========================================
// 5. CANCELAR CITA + ENVÍO DE EMAILS
// ==========================================
router.put('/cancelar/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const citaResult = await client.query(
            `SELECT 
                c.paciente_id, c.psicologo_id, c.fecha, c.hora,
                pac.nombre AS paciente_nombre, pac.email AS paciente_email,
                psi.nombre AS psicologo_nombre, psi.email AS psicologo_email
             FROM citas c
             JOIN usuarios pac ON c.paciente_id = pac.id_usuario
             JOIN usuarios psi ON c.psicologo_id = psi.id_usuario
             WHERE c.id = $1`,
            [id]
        );

        if (citaResult.rowCount === 0) {
            throw new Error("Cita no encontrada");
        }

        const datosCita = citaResult.rows[0];

        await client.query(
            "UPDATE citas SET estado = 'cancelada' WHERE id = $1",
            [id]
        );

        await client.query(
            "UPDATE disponibilidad SET ocupado = FALSE WHERE psicologo_id = $1 AND fecha = $2 AND hora_inicio = $3",
            [datosCita.psicologo_id, datosCita.fecha, datosCita.hora]
        );

        await client.query('COMMIT');

        const fechaFormat = new Date(datosCita.fecha).toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        const mailOptions = {
            from: `"Vitanova Psicología" <${process.env.EMAIL_USER}>`,
            to: `${datosCita.paciente_email}, ${datosCita.psicologo_email}`,
            subject: "🚨 Cita Cancelada - Vitanova",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #e74c3c;">Cita Cancelada</h2>
                    <p>Hola, les informamos que la siguiente sesión ha sido cancelada:</p>
                    <hr />
                    <p><strong>Paciente:</strong> ${datosCita.paciente_nombre}</p>
                    <p><strong>Psicólogo:</strong> Psic. ${datosCita.psicologo_nombre}</p>
                    <p><strong>Fecha:</strong> ${fechaFormat}</p>
                    <p><strong>Hora:</strong> ${datosCita.hora.slice(0, 5)} hrs</p>
                    <hr />
                    <p style="font-size: 0.9em; color: #7f8c8d;">El horario ha sido liberado automáticamente en la plataforma para que pueda ser utilizado nuevamente.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error("Error al enviar email de cancelación:", error);
            else console.log("Emails de cancelación enviados correctamente:", info.response);
        });

        res.json({ mensaje: "Cita cancelada y notificaciones enviadas correctamente" });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al cancelar cita:", error.message);
        res.status(500).json({ error: "No se pudo cancelar la cita" });
    } finally {
        client.release();
    }
});

module.exports = router;