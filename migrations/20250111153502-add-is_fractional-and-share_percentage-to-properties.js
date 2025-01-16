'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding 'is_fractional' column to the 'Properties' table
    await queryInterface.addColumn('Properties', 'is_fractional', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,  // Default value is 'false'
      allowNull: false,     // This column cannot be null
    });

    // Adding 'share_percentage' column to the 'Properties' table
    await queryInterface.addColumn('Properties', 'share_percentage', {
      type: Sequelize.FLOAT,
      defaultValue: 0,      // Default value is '0'
      allowNull: false,     // This column cannot be null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Removing the 'is_fractional' column
    await queryInterface.removeColumn('Properties', 'is_fractional');

    // Removing the 'share_percentage' column
    await queryInterface.removeColumn('Properties', 'share_percentage');
  }
};
