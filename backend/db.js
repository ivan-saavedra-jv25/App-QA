const mysql = require("mysql2/promise");
const dbConfig = require("./config/db.config");

const pool = mysql.createPool({
  host: process.env.DB_HOST || dbConfig.HOST,
  port: Number(process.env.DB_PORT || dbConfig.PORT || 3306),
  user: process.env.DB_USER || dbConfig.USER,
  password: process.env.DB_PASSWORD || dbConfig.PASSWORD,
  database: process.env.DB_NAME || dbConfig.DB,
  waitForConnections: true,
  connectionLimit: (dbConfig.pool && dbConfig.pool.max) || 5,
  queueLimit: 0
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = {
  pool,
  query
};
