require("dotenv").config();
const { Pool } = require("pg");

// Si existe DATABASE_URL (Railway), la usamos directamente. 
// Si no, usamos el objeto con localhost (Tu PC).
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // REQUERIDO para Railway
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: "localhost",
        port: 5432,
      }
);

pool.connect()
  .then(() => {
    console.log(`✅ Conectado a PostgreSQL`);
  })
  .catch((err) => {
    console.error("❌ Error de conexión:", err.stack);
  });

module.exports = pool;