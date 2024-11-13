'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'type', {
      type: Sequelize.ENUM('Rooms', 'Workspace'),
      allowNull: false,
      defaultValue: 'Rooms', // Default value to avoid null errors
    });
    await queryInterface.addColumn('Properties', 'amenities', {
      type: Sequelize.ENUM('Furnished', 'Unfurnished'),
      allowNull: false,
      defaultValue: 'Furnished', // Default value to avoid null errors
    });
    await queryInterface.addColumn('Properties', 'area', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Unknown', // Default value to avoid null errors
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'type');
    await queryInterface.removeColumn('Properties', 'amenities');
    await queryInterface.removeColumn('Properties', 'area');
  },
};
