module.exports = {
  HOST: "localhost",
  PORT: 3306,
  USER: "ivan.dev",
  PASSWORD: "root",
  DB: "DBQA",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};