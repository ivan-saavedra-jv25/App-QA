const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('test_case_examples', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      test_case_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      example_type: {
        type: DataTypes.ENUM('TEXT', 'IMAGE_URL', 'FILE_SET'),
        allowNull: false,
      },
      input_json: {
        type: DataTypes.JSON,
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

    await queryInterface.addConstraint('test_case_examples', {
      fields: ['test_case_id'],
      type: 'foreign key',
      name: 'fk_examples_test_case',
      references: {
        table: 'test_cases',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('test_case_examples', ['test_case_id'], {
      name: 'idx_examples_test_case_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('test_case_examples');
  },
};
