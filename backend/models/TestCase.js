const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TestCase = sequelize.define('TestCase', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'plans',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 150],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    validation_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100],
      },
    },
    priority: {
      type: DataTypes.ENUM('P1', 'P2', 'P3'),
      defaultValue: 'P2',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PASSED', 'FAILED', 'NA'),
      defaultValue: 'PENDING',
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'test_cases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeUpdate: (testCase) => {
        testCase.updated_at = new Date();
      },
      afterUpdate: async (testCase) => {
        // Actualizar el estado del plan basado en el progreso
        const Plan = sequelize.models.Plan;
        const plan = await Plan.findByPk(testCase.plan_id);
        if (plan) {
          await plan.updateProgress();
        }
      },
      afterCreate: async (testCase) => {
        // Actualizar el estado del plan a IN_PROGRESS si hay test cases
        const Plan = sequelize.models.Plan;
        const plan = await Plan.findByPk(testCase.plan_id);
        if (plan && plan.status === 'PENDING') {
          await plan.update({ status: 'IN_PROGRESS' });
        }
      },
    },
  });

  TestCase.associate = (models) => {
    TestCase.belongsTo(models.Plan, {
      foreignKey: 'plan_id',
      as: 'plan',
    });
  };

  return TestCase;
};
