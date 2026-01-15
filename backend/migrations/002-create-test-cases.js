const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('test_cases', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      validation_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM('P1', 'P2', 'P3'),
        allowNull: false,
        defaultValue: 'P2',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'PASSED', 'FAILED', 'NA'),
        defaultValue: 'PENDING',
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      },
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('test_cases', {
      fields: ['plan_id'],
      type: 'foreign key',
      name: 'fk_cases_plan',
      references: {
        table: 'plans',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Add index for foreign key
    await queryInterface.addIndex('test_cases', ['plan_id'], {
      name: 'fk_cases_plan'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('test_cases');
  },
};
