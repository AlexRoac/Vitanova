const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "mundo131626%",
  host: "localhost", 
  port: 5432,
  database: "vitanova"
});

// Verificación automática de la conexión al iniciar el servidor
pool.connect()
  .then(() => {
    console.log("✅ Conectado exitosamente a PostgreSQL (Base de datos: vitanova)");
  })
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos PostgreSQL:", err.stack);
  });

module.exports = pool;