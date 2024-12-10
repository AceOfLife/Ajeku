'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the 'description' column to the 'Properties' table
    await queryInterface.addColumn('Properties', 'description', {
      type: Sequelize.STRING,  // You can adjust the type (e.g., TEXT) if necessary
      allowNull: true,         // 'description' is optional
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the change by removing the 'description' column
    await queryInterface.removeColumn('Properties', 'description');
  }
};
