const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "vitanova_db",
  password: "mundo131626%",
  port: 5432,
});

module.exports = pool;