const express = require('express');
const router = express.Router();
const pool = require('../db'); // Importamos tu conexión a PostgreSQL
const jwt = require('jsonwebtoken');

// 1. Middleware para desencriptar el Token
// (Si ya tienes una función igual en otro archivo, puedes importarla en lugar de crearla aquí)
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Obtenemos el token después de la palabra "Bearer"

    if (!token) return res.status(401).json({ mensaje: "Acceso denegado. No hay token." });

    // Cambia 'tu_secreto' por la variable de entorno que uses en tu .env para el JWT
    jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto', (err, usuarioDecodificado) => {
        if (err) return res.status(403).json({ mensaje: "Token inválido o expirado." });
        
        req.usuario = usuarioDecodificado; // Guardamos la info del psicólogo en la petición
        next();
    });
};

// 2. Ruta POST para guardar la nota (http://localhost:5000/api/notas)
router.post('/', verificarToken, async (req, res) => {
    try {
        // Sacamos lo que nos mandó React
        const { paciente_id, contenido } = req.body;
        
        // ¡LA MAGIA AQUÍ! Sacamos el ID del psicólogo directamente del token desencriptado
        // OJO: Si al crear tu token usaste "id" en lugar de "id_usuario", cámbialo aquí abajo.
        const psicologo_id = req.usuario.usuario.id;

        if (!paciente_id || !contenido) {
            return res.status(400).json({ mensaje: "Faltan datos para crear la nota." });
        }

        // Insertamos en PostgreSQL usando $1, $2, $3 por seguridad (evita inyección SQL)
        const nuevaNota = await pool.query(
            "INSERT INTO notas (paciente_id, psicologo_id, contenido) VALUES ($1, $2, $3) RETURNING *",
            [paciente_id, psicologo_id, contenido]
        );

        res.status(201).json({
            mensaje: "Nota guardada exitosamente",
            nota: nuevaNota.rows[0]
        });

    } catch (error) {
        console.error("Error al guardar la nota:", error.message);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
});

router.get('/:paciente_id', verificarToken, async (req, res) => {
    try {
        const { paciente_id } = req.params;

        // Buscamos las notas y hacemos JOIN para traer el nombre del psicólogo
        const notas = await pool.query(
            `SELECT n.id, n.contenido, n.fecha_creacion, 
                    u.nombre AS nombre_psicologo, u.apellido AS apellido_psicologo
             FROM notas n
             LEFT JOIN usuarios u ON n.psicologo_id = u.id_usuario
             WHERE n.paciente_id = $1
             ORDER BY n.fecha_creacion DESC`, // Las más recientes primero
            [paciente_id]
        );

        res.json(notas.rows);

    } catch (error) {
        console.error("Error al obtener las notas:", error);
        res.status(500).json({ mensaje: "Error del servidor al obtener notas" });
    }
});

module.exports = router;