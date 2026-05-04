const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// ============================================================
// GET /api/citas/paciente/:id
// Un paciente solo puede ver sus propias citas.
// Un admin o psicólogo puede ver las de cualquiera.
// ============================================================
router.get("/paciente/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  const { id: idSolicitante, rol } = req.usuario.usuario;

  // IDOR: solo el propio paciente, un psicólogo o admin pueden acceder
  if (rol === "paciente" && String(idSolicitante) !== String(id)) {
    return res.status(403).json({ error: "No tienes permiso para ver las citas de otro paciente." });
  }

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID de paciente inválido." });
  }

  try {
    const result = await pool.query(
      `SELECT
          c.id, c.fecha, c.hora, c.estado,
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
    console.error("Error al obtener citas del paciente:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ============================================================
// GET /api/citas/psicologo/:id
// Un psicólogo solo puede ver SUS citas.
// Un admin puede ver las de cualquiera.
// ============================================================
router.get("/psicologo/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  const { id: idSolicitante, rol } = req.usuario.usuario;

  if (rol === "psicologo" && String(idSolicitante) !== String(id)) {
    return res.status(403).json({ error: "No tienes permiso para ver las citas de otro psicólogo." });
  }
  if (rol === "paciente") {
    return res.status(403).json({ error: "Acceso denegado." });
  }

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID de psicólogo inválido." });
  }

  try {
    const result = await pool.query(
      `SELECT
          c.id, c.fecha, c.hora, c.estado,
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
    console.error("Error al obtener citas del psicólogo:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ============================================================
// GET /api/citas/fechas/:psicologoId
// Disponible para cualquier usuario autenticado (para agendar)
// ============================================================
router.get("/fechas/:psicologoId", verificarToken, async (req, res) => {
  const { psicologoId } = req.params;

  if (isNaN(psicologoId)) {
    return res.status(400).json({ error: "psicologoId inválido." });
  }

  try {
    const result = await pool.query(
      `SELECT DISTINCT TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha
       FROM disponibilidad
       WHERE psicologo_id = $1 AND ocupado = FALSE
       ORDER BY fecha ASC`,
      [psicologoId]
    );
    res.json(result.rows.map((r) => r.fecha));
  } catch (error) {
    console.error("Error al obtener fechas disponibles:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ============================================================
// GET /api/citas/:psicologoId/:fecha
// Disponible para cualquier usuario autenticado
// ============================================================
router.get("/:psicologoId/:fecha", verificarToken, async (req, res) => {
  const { psicologoId, fecha } = req.params;

  if (isNaN(psicologoId)) {
    return res.status(400).json({ error: "psicologoId inválido." });
  }

  try {
    const result = await pool.query(
      `SELECT hora_inicio
       FROM disponibilidad
       WHERE psicologo_id = $1 AND fecha = $2 AND ocupado = FALSE
       ORDER BY hora_inicio ASC`,
      [psicologoId, fecha]
    );
    res.json(result.rows.map((row) => row.hora_inicio.slice(0, 5)));
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ============================================================
// POST /api/citas/configurar
// Solo psicólogos y admin pueden configurar horarios
// ============================================================
router.post(
  "/configurar",
  verificarToken,
  verificarRol("psicologo", "admin"),
  async (req, res) => {
    const { psicologoId, fecha, horas } = req.body;
    const { id: idSolicitante, rol } = req.usuario.usuario;

    // Un psicólogo solo puede configurar SUS propios horarios
    if (rol === "psicologo" && String(idSolicitante) !== String(psicologoId)) {
      return res.status(403).json({ error: "Solo puedes configurar tus propios horarios." });
    }

    if (!psicologoId || !fecha) {
      return res.status(400).json({ error: "psicologoId y fecha son obligatorios." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "DELETE FROM disponibilidad WHERE psicologo_id = $1 AND fecha = $2 AND ocupado = FALSE",
        [psicologoId, fecha]
      );

      if (Array.isArray(horas) && horas.length > 0) {
        for (const hora of horas) {
          await client.query(
            "INSERT INTO disponibilidad (psicologo_id, fecha, hora_inicio, ocupado) VALUES ($1, $2, $3, FALSE)",
            [psicologoId, fecha, hora]
          );
        }
      }

      await client.query("COMMIT");
      res.json({ mensaje: "Horarios actualizados." });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error al guardar horarios:", err.message);
      res.status(500).json({ error: "Error interno del servidor." });
    } finally {
      client.release();
    }
  }
);

// ============================================================
// POST /api/citas/reservar
// Solo pacientes pueden reservar citas
// ============================================================
router.post(
  "/reservar",
  verificarToken,
  verificarRol("paciente"),
  async (req, res) => {
    const { pacienteId, psicologoId, fecha, hora } = req.body;
    const idSolicitante = req.usuario.usuario.id;

    // IDOR: un paciente solo puede reservar a nombre propio
    if (String(idSolicitante) !== String(pacienteId)) {
      return res.status(403).json({ error: "No puedes reservar una cita a nombre de otro paciente." });
    }

    if (!pacienteId || !psicologoId || !fecha || !hora) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "INSERT INTO citas (paciente_id, psicologo_id, fecha, hora, estado) VALUES ($1, $2, $3, $4, 'confirmada')",
        [pacienteId, psicologoId, fecha, hora]
      );

      const updateResult = await client.query(
        "UPDATE disponibilidad SET ocupado = TRUE WHERE psicologo_id = $1 AND fecha = $2 AND hora_inicio = $3",
        [psicologoId, fecha, hora]
      );

      if (updateResult.rowCount === 0) {
        throw new Error("Horario no disponible.");
      }

      await client.query("COMMIT");
      res.json({ mensaje: "Cita agendada correctamente." });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error al reservar:", err.message);
      // No exponemos err.message al cliente — podría revelar info interna
      res.status(500).json({ error: "No se pudo agendar la cita. Intenta de nuevo." });
    } finally {
      client.release();
    }
  }
);

// ============================================================
// PUT /api/citas/cancelar/:id
// El paciente dueño de la cita o un admin/psicólogo pueden cancelar
// ============================================================
router.put("/cancelar/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  const { id: idSolicitante, rol } = req.usuario.usuario;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID de cita inválido." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cita = await client.query("SELECT * FROM citas WHERE id = $1", [id]);

    if (cita.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    const citaData = cita.rows[0];

    // IDOR: solo el paciente dueño, su psicólogo o admin pueden cancelar
    const esDueno = String(citaData.paciente_id) === String(idSolicitante);
    const esPsicologo = rol === "psicologo" && String(citaData.psicologo_id) === String(idSolicitante);
    const esAdmin = rol === "admin";

    if (!esDueno && !esPsicologo && !esAdmin) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "No tienes permiso para cancelar esta cita." });
    }

    if (citaData.estado === "cancelada") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Esta cita ya fue cancelada." });
    }

    await client.query("UPDATE citas SET estado = 'cancelada' WHERE id = $1", [id]);
    await client.query(
      "UPDATE disponibilidad SET ocupado = FALSE WHERE psicologo_id = $1 AND fecha = $2 AND hora_inicio = $3",
      [citaData.psicologo_id, citaData.fecha, citaData.hora]
    );

    await client.query("COMMIT");
    res.json({ mensaje: "Cita cancelada correctamente." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al cancelar:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    client.release();
  }
});

module.exports = router;
