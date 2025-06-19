'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SalesGoals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      month: {
        type: Sequelize.STRING,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      goal_land: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      goal_building: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      goal_rent: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SalesGoals');
  }
};
