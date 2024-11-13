'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true, // This makes the imageUrl optional for now
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'imageUrl');
  }
};
