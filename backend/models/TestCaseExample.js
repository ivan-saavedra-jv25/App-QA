const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TestCaseExample = sequelize.define('TestCaseExample', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    test_case_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_cases',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'test_case_examples',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeUpdate: (example) => {
        example.updated_at = new Date();
      },
    },
  });

  TestCaseExample.associate = (models) => {
    TestCaseExample.belongsTo(models.TestCase, {
      foreignKey: 'test_case_id',
      as: 'testCase',
    });
  };

  return TestCaseExample;
};
