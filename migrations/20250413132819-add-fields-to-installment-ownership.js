'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('InstallmentOwnerships', 'total_months', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    await queryInterface.addColumn('InstallmentOwnerships', 'months_paid', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('InstallmentOwnerships', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'ongoing'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('InstallmentOwnerships', 'total_months');
    await queryInterface.removeColumn('InstallmentOwnerships', 'months_paid');
    await queryInterface.removeColumn('InstallmentOwnerships', 'status');
  }
};
