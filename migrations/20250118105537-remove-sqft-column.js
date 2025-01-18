'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Properties', 'sqft');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Properties', 'sqft', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "0",
    });
  }
};
