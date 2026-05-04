require("dotenv").config();

const REQUIRED_ENV_VARS = [
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "EMAIL_USER",
  "EMAIL_PASS",
];

const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`\n❌ FATAL: Faltan variables de entorno requeridas:`);
  missing.forEach((v) => console.error(`   - ${v}`));
  console.error(`\nAgrégalas a tu archivo .env y reinicia el servidor.\n`);
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// ─── 1. Cabeceras de seguridad (Helmet) ─────────────────────────────────────
// Establece: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
// Strict-Transport-Security, Referrer-Policy y más.
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Necesario para Google Auth
  })
);

// ─── 2. CORS ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://vitanova.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / apps sin origen
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS bloqueado por el servidor"), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── 3. Rate Limiting ───────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // máximo 10 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: "Demasiados intentos. Espera 15 minutos antes de intentarlo de nuevo.",
  },
});

// Límite general para el resto de la API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minuto
  max: 100,                   // máximo 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: "Demasiadas peticiones. Intenta más tarde.",
  },
});

// Aplicar límite a auth primero, luego el general
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", apiLimiter);

// ─── 4. Body parser ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Limita el tamaño del body para prevenir ataques

// ─── 5. Rutas ───────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/usuarios"));
app.use("/api/notas", require("./routes/notas"));
app.use("/api/disponibilidad", require("./routes/disponibilidad"));
app.use("/api/citas", require("./routes/citas"));

app.get("/", (req, res) => {
  res.json({ mensaje: "Backend funcionando", status: "OK" });
});

// ─── 6. Manejo global de errores ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor." });
});

// ─── 7. Inicio del servidor ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

// ─── 8. Cierre graceful (Railway envía SIGTERM al detener el contenedor) ────
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM recibido. Cerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor cerrado correctamente.");
    // El pool de pg se cierra cuando el proceso termina
    process.exit(0);
  });
});
