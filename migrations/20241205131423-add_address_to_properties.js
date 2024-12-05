'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'address', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'No address',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'address');
  },
};
