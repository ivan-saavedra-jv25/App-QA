module.exports = {
  HOST: process.env.DB_HOST || "mysql",
  PORT: process.env.DB_PORT || 3306,
  USER: process.env.DB_USER || "ivan.dev",
  PASSWORD: process.env.DB_PASSWORD || "root",
  DB: process.env.DB_NAME || "DBQA",
  dialect: process.env.DB_DIALECT || "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};