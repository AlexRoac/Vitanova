require("dotenv").config(); 
const { Pool } = require("pg");


const pool = new Pool({
<<<<<<< HEAD
  user: "postgres",
  password: "admin",
  host: "localhost", 
  port: 5432,
  database: "vitanova"
=======
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,    
  host: "localhost",                 
  port: 5432,                         
>>>>>>> 40d3f7e97bc9f268b386c95de3fee031cbcd3aa9
});

// Verificación automática de la conexión
pool.connect()
  .then(() => {
    // Usamos la variable también en el console.log para confirmar a dónde nos conectamos
    console.log(`✅ Conectado exitosamente a PostgreSQL (Base de datos: ${process.env.DB_NAME})`);
  })
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos PostgreSQL:", err.stack);
  });

module.exports = pool;