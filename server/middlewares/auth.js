const jwt = require("jsonwebtoken");

// Validación temprana: si no existe JWT_SECRET el servidor no debe arrancar
if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: La variable de entorno JWT_SECRET no está definida.");
  console.error("   Agrega JWT_SECRET a tu archivo .env antes de iniciar el servidor.");
  process.exit(1);
}

/**
 * verificarToken
 * Extrae y valida el JWT del header Authorization: Bearer <token>
 * Si es válido, adjunta el payload decodificado en req.usuario
 * Si no, responde 401 o 403 y corta la cadena de middlewares.
 */
const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ msg: "Acceso denegado. Se requiere autenticación." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuarioDecodificado) => {
    if (err) {
      return res.status(403).json({ msg: "Token inválido o expirado. Inicia sesión de nuevo." });
    }
    req.usuario = usuarioDecodificado; // { usuario: { id, rol } }
    next();
  });
};

/**
 * verificarRol(...rolesPermitidos)
 * Factory que devuelve un middleware que comprueba el rol del usuario
 * directamente desde el JWT (nunca desde el body ni desde localStorage).
 *
 */
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    // req.usuario lo pone verificarToken; si no existe, el orden de middlewares es incorrecto
    if (!req.usuario || !req.usuario.usuario) {
      return res.status(401).json({ msg: "Token no procesado. Usa verificarToken antes de verificarRol." });
    }

    const rolUsuario = req.usuario.usuario.rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        msg: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}.`,
      });
    }

    next();
  };
};

module.exports = { verificarToken, verificarRol };
