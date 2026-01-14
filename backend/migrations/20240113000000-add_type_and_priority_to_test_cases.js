'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('test_cases', 'validation_type', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'description'
    });

    await queryInterface.addColumn('test_cases', 'priority', {
      type: Sequelize.ENUM('P1', 'P2', 'P3'),
      allowNull: false,
      defaultValue: 'P2',
      after: 'validation_type'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('test_cases', 'validation_type');
    await queryInterface.removeColumn('test_cases', 'priority');
  }
};
