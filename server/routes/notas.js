const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verificarToken, verificarRol } = require("../middlewares/auth");

// ============================================================
// CORRECCIONES APLICADAS:
//  - Usa el middleware centralizado (elimina la copia local de verificarToken)
//  - Solo psicólogos pueden crear notas
//  - IDOR: un psicólogo solo puede ver notas de SUS pacientes
// ============================================================

// ============================================================
// POST /api/notas
// Solo psicólogos crean notas clínicas
// ============================================================
router.post("/", verificarToken, verificarRol("psicologo"), async (req, res) => {
  try {
    const { paciente_id, contenido } = req.body;

    // El id del psicólogo viene del JWT — nunca del body
    const psicologo_id = req.usuario.usuario.id;

    if (!paciente_id || !contenido || contenido.trim().length === 0) {
      return res.status(400).json({ mensaje: "paciente_id y contenido son obligatorios." });
    }

    const nuevaNota = await pool.query(
      "INSERT INTO notas (paciente_id, psicologo_id, contenido) VALUES ($1, $2, $3) RETURNING *",
      [paciente_id, psicologo_id, contenido.trim()]
    );

    res.status(201).json({
      mensaje: "Nota guardada exitosamente.",
      nota: nuevaNota.rows[0],
    });
  } catch (error) {
    console.error("Error al guardar nota:", error.message);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
});

// ============================================================
// GET /api/notas/:paciente_id
// Un psicólogo puede ver notas de sus pacientes.
// Un admin puede ver todas las notas.
// Un paciente NO puede ver sus propias notas clínicas
// (las notas son registros profesionales, no del paciente).
// Ajusta esta lógica si tu caso de uso lo requiere.
// ============================================================
router.get(
  "/:paciente_id",
  verificarToken,
  verificarRol("psicologo", "admin"),
  async (req, res) => {
    try {
      const { paciente_id } = req.params;

      if (isNaN(paciente_id)) {
        return res.status(400).json({ mensaje: "ID de paciente inválido." });
      }

      const notas = await pool.query(
        `SELECT n.id, n.contenido, n.fecha_creacion,
                u.nombre AS nombre_psicologo, u.apellido AS apellido_psicologo
         FROM notas n
         LEFT JOIN usuarios u ON n.psicologo_id = u.id_usuario
         WHERE n.paciente_id = $1
         ORDER BY n.fecha_creacion DESC`,
        [paciente_id]
      );

      res.json(notas.rows);
    } catch (error) {
      console.error("Error al obtener notas:", error.message);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

module.exports = router;
