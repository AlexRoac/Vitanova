const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 1. Configuración de CORS robusta
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  'https://vitanova.vercel.app',
  'http://localhost:3000'
].filter(Boolean); // Esto elimina valores undefined si la env no existe

app.use(cors({
  origin: function (origin, callback) {
    // permitir peticiones sin origen (como Postman o apps móviles)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS bloqueado por el servidor'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Cabeceras de seguridad para Google Auth (¡Importante!)
app.use((req, res, next) => {
  res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(express.json());

// 3. Rutas
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/usuarios")); 
app.use('/api/notas', require('./routes/notas'));
app.use('/api/disponibilidad', require('./routes/disponibilidad'));
app.use('/api/citas', require('./routes/citas'));

app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando en la nube", status: "OK" });
});

// 4. Manejo de errores global (Para que no crashee el contenedor)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// 5. Puerto dinámico para Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' ayuda a Railway a exponer el puerto
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});