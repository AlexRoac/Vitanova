const express = require('express');
const router = express.Router();
const pool = require('../db'); // Asegúrate de que esta ruta apunte a tu archivo db.js

// 1. OBTENER HORARIOS DISPONIBLES (Para el psicólogo o el paciente)
router.get('/:psicologoId/:fecha', async (req, res) => {
    const { psicologoId, fecha } = req.params;
    try {
        // Solo buscamos las horas que NO están ocupadas y las ordenamos
        const result = await pool.query(
            "SELECT hora_inicio FROM disponibilidad WHERE psicologo_id = $1 AND fecha = $2 AND ocupado = FALSE ORDER BY hora_inicio ASC",
            [psicologoId, fecha]
        );
        
        // Formateamos para enviar solo la hora (ej: "09:00")
        const horas = result.rows.map(row => row.hora_inicio.slice(0, 5));
        res.json(horas);
    } catch (err) {
        console.error("Error al obtener disponibilidad:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 2. GUARDAR O EDITAR HORARIOS (Para la vista del psicólogo)
router.post('/configurar', async (req, res) => {
    const { psicologoId, fecha, horas } = req.body; 
    // Ejemplo de 'horas': ["09:00", "10:00", "11:00"]

    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Iniciamos una transacción segura

        // PASO A: Limpiar los horarios anteriores de ese día.
        // ¡OJO! Solo borramos los que tienen ocupado = FALSE. Si ya hay una cita agendada, no se toca.
        await client.query(
            "DELETE FROM disponibilidad WHERE psicologo_id = $1 AND fecha = $2 AND ocupado = FALSE",
            [psicologoId, fecha]
        );

        // PASO B: Insertar las nuevas horas que el psicólogo dejó marcadas
        if (horas && horas.length > 0) {
            const insertPromises = horas.map(hora => 
                client.query(
                    "INSERT INTO disponibilidad (psicologo_id, fecha, hora_inicio, ocupado) VALUES ($1, $2, $3, FALSE)",
                    [psicologoId, fecha, hora]
                )
            );
            await Promise.all(insertPromises);
        }

        await client.query('COMMIT'); // Guardamos todo en la base de datos
        res.json({ mensaje: "Horarios actualizados correctamente" });
    } catch (err) {
        await client.query('ROLLBACK'); // Si falla algo, deshacemos los cambios para no romper la BD
        console.error("Error al guardar horarios:", err);
        res.status(500).json({ error: "Error al guardar los horarios" });
    } finally {
        client.release(); // Liberamos la conexión
    }
});

module.exports = router;