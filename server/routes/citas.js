const express = require('express');
const router = express.Router();
const pool = require('../db');
const transporter = require('../utils/mailer'); 

// ==========================================
// 1. OBTENER CITAS DE UN PACIENTE
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
        console.error("Error SQL:", error.message);
        res.status(500).json({ error: "Error al obtener citas" });
    }
});

// ==========================================
// 2. OBTENER CITAS DE UN PSICÓLOGO
// ==========================================
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
        console.error("Error SQL:", error.message);
        res.status(500).json({ error: "Error al obtener citas" });
    }
});

// ==========================================
// 🔥 3. FECHAS DISPONIBLES (IMPORTANTE ARRIBA)
// ==========================================
router.get('/fechas/:psicologoId', async (req, res) => {
    const { psicologoId } = req.params;

    if (isNaN(psicologoId)) {
        return res.status(400).json({ error: "psicologoId inválido" });
    }

    try {
        const result = await pool.query(
            `SELECT DISTINCT 
                TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha
             FROM disponibilidad 
             WHERE psicologo_id = $1 
             AND ocupado = FALSE
             ORDER BY fecha ASC`,
            [psicologoId]
        );

        res.json(result.rows.map(r => r.fecha));

    } catch (error) {
        console.error("💥 ERROR FECHAS:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. DISPONIBILIDAD POR DÍA
// ==========================================
router.get('/:psicologoId/:fecha', async (req, res) => {
    const { psicologoId, fecha } = req.params;

    // ✅ Validación para evitar errores como "fechas"
    if (isNaN(psicologoId)) {
        return res.status(400).json({ error: "psicologoId inválido" });
    }

    try {
        const result = await pool.query(
            `SELECT hora_inicio 
             FROM disponibilidad 
             WHERE psicologo_id = $1 
             AND fecha = $2 
             AND ocupado = FALSE 
             ORDER BY hora_inicio ASC`,
            [psicologoId, fecha]
        );
        
        const horas = result.rows.map(row => row.hora_inicio.slice(0, 5));
        res.json(horas);

    } catch (err) {
        console.error("Error disponibilidad:", err.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ==========================================
// 5. CONFIGURAR HORARIOS (PSICÓLOGO)
// ==========================================
router.post('/configurar', async (req, res) => {
    const { psicologoId, fecha, horas } = req.body; 
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            `DELETE FROM disponibilidad 
             WHERE psicologo_id = $1 
             AND fecha = $2 
             AND ocupado = FALSE`,
            [psicologoId, fecha]
        );

        if (horas && horas.length > 0) {
            for (let hora of horas) {
                await client.query(
                    `INSERT INTO disponibilidad 
                     (psicologo_id, fecha, hora_inicio, ocupado) 
                     VALUES ($1, $2, $3, FALSE)`,
                    [psicologoId, fecha, hora]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ mensaje: "Horarios actualizados" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error guardar horarios:", err.message);
        res.status(500).json({ error: "Error al guardar horarios" });

    } finally {
        client.release();
    }
});

// ==========================================
// 6. RESERVAR CITA
// ==========================================
router.post('/reservar', async (req, res) => {
    const { pacienteId, psicologoId, fecha, hora } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            `INSERT INTO citas 
             (paciente_id, psicologo_id, fecha, hora, estado) 
             VALUES ($1, $2, $3, $4, 'confirmada')`,
            [pacienteId, psicologoId, fecha, hora]
        );

        const updateResult = await client.query(
            `UPDATE disponibilidad 
             SET ocupado = TRUE 
             WHERE psicologo_id = $1 
             AND fecha = $2 
             AND hora_inicio = $3`,
            [psicologoId, fecha, hora]
        );

        if (updateResult.rowCount === 0) {
            throw new Error("Horario no disponible");
        }

        await client.query('COMMIT');

        res.json({ mensaje: "✅ Cita agendada" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error reservar:", err.message);
        res.status(500).json({ error: err.message });

    } finally {
        client.release();
    }
});

// ==========================================
// 7. CANCELAR CITA
// ==========================================
router.put('/cancelar/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const cita = await client.query(
            "SELECT * FROM citas WHERE id = $1",
            [id]
        );

        if (cita.rowCount === 0) {
            throw new Error("Cita no encontrada");
        }

        const { psicologo_id, fecha, hora } = cita.rows[0];

        await client.query(
            "UPDATE citas SET estado = 'cancelada' WHERE id = $1",
            [id]
        );

        await client.query(
            `UPDATE disponibilidad 
             SET ocupado = FALSE 
             WHERE psicologo_id = $1 
             AND fecha = $2 
             AND hora_inicio = $3`,
            [psicologo_id, fecha, hora]
        );

        await client.query('COMMIT');

        res.json({ mensaje: "Cita cancelada" });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error cancelar:", error.message);
        res.status(500).json({ error: error.message });

    } finally {
        client.release();
    }
});

module.exports = router;