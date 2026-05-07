require("dotenv").config();
const { Pool } = require("pg");

// Opciones comunes de rendimiento y resiliencia para ambos entornos
const poolConfig = {
  max: 10,                          // máximo de conexiones simultáneas
  connectionTimeoutMillis: 5000,    // 5 s para obtener una conexión del pool
  idleTimeoutMillis: 30000,         // 30 s antes de cerrar una conexión inactiva
  allowExitOnIdle: false,           // no cerrar el pool al quedarse sin peticiones
};

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        ...poolConfig,
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: "localhost",
        port: 5432,
        ...poolConfig,
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