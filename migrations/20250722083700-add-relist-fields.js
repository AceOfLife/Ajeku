'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addColumn('FractionalOwnerships', 'is_relisted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('FractionalOwnerships', 'relist_price', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Properties', 'is_relisted');
    await queryInterface.removeColumn('Properties', 'original_owner_id');
    await queryInterface.removeColumn('FractionalOwnerships', 'is_relisted');
    await queryInterface.removeColumn('FractionalOwnerships', 'relist_price');
  }
};