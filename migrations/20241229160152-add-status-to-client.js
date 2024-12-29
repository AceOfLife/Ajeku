// migrations/YYYYMMDDHHMMSS-add-status-to-client.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Clients', 'status', {
      type: Sequelize.ENUM('Unverified', 'Verified'),
      defaultValue: 'Unverified',  // Default value is 'Unverified'
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Clients', 'status');
  }
};
