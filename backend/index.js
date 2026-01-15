// Cargar variables de entorno
require('dotenv').config();

const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");

const plansRouter = require("./routes/plans");
const testCasesRouter = require("./routes/testCases");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (req, res, next) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

app.delete("/api/cleanup", async (req, res, next) => {
  try {
    await sequelize.transaction(async (t) => {
      await sequelize.models.TestCase.destroy({ 
        where: {},
        truncate: true,
        cascade: true,
        transaction: t
      });
      
      await sequelize.models.Plan.destroy({ 
        where: {},
        truncate: true,
        cascade: true,
        transaction: t
      });
    });
    
    res.json({ 
      message: "Database cleaned successfully",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

app.use("/api/plans", plansRouter);
app.use("/api/test-cases", testCasesRouter);



app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  void next;

  const status = err.statusCode || err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;
  res.status(status).json({ message });
});

const port = Number(process.env.PORT || 4000);

// Sincronizar base de datos y iniciar servidor
sequelize.sync({ force: false }).then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
    console.log('Database synchronized');
  });
}).catch(error => {
  console.error('Error syncing database:', error);
});
