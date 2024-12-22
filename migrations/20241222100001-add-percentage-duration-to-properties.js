// migration file: YYYYMMDDHHMMSS-add-percentage-duration-to-properties.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'percentage', {
      type: Sequelize.STRING, // Add percentage as a string
      allowNull: true, // Set to false if you want it to be mandatory
    });

    await queryInterface.addColumn('Properties', 'duration', {
      type: Sequelize.STRING, // Add duration as a string
      allowNull: true, // Set to false if you want it to be mandatory
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'percentage');
    await queryInterface.removeColumn('Properties', 'duration');
  }
};
