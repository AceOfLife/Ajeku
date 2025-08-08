'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'is_sold', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // For existing records, set is_sold = false if null
    await queryInterface.sequelize.query(
      'UPDATE "Properties" SET is_sold = false WHERE is_sold IS NULL;'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'is_sold');
  }
};