'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Properties', 'annual_rent', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Properties', 'annual_rent');
  }
};
