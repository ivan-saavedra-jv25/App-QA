const { Sequelize } = require('sequelize');
const Plan = require('./Plan');
const TestCase = require('./TestCase');
const dbConfig = require('../config/db.config');

// Configuración de la base de datos usando db.config.js
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  }
);

// Inicializar modelos
const models = {
  Plan: Plan(sequelize),
  TestCase: TestCase(sequelize),
};

// Setup associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Agregar método updateProgress al modelo Plan
models.Plan.prototype.updateProgress = async function() {
  const { TestCase } = models;
  
  const stats = await TestCase.findAll({
    where: { plan_id: this.id },
    attributes: [
      'status',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['status'],
    raw: true,
  });

  const result = {
    PENDING: 0,
    PASSED: 0,
    FAILED: 0,
    NA: 0,
  };

  stats.forEach(stat => {
    result[stat.status] = parseInt(stat.count);
  });

  const total = Object.values(result).reduce((sum, count) => sum + count, 0);
  const completed = total - result.PENDING;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  let newStatus = this.status;
  
  if (progress === 100 && total > 0) {
    newStatus = 'COMPLETED';
  } else if (progress > 0 && this.status === 'PENDING') {
    newStatus = 'IN_PROGRESS';
  } else if (progress > 0 && this.status === 'COMPLETED') {
    newStatus = 'IN_PROGRESS';
  }
  
  if (newStatus !== this.status) {
    await this.update({ status: newStatus });
  }
};

module.exports = {
  sequelize,
  ...models,
};
