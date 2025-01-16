module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'fractional_slots', {
      type: Sequelize.INTEGER,
      allowNull: true, // Nullable for non-fractional properties
      defaultValue: 0, // Default value of 0 if not fractional
    });

    await queryInterface.addColumn('Properties', 'price_per_slot', {
      type: Sequelize.FLOAT,
      allowNull: true, // Nullable for non-fractional properties
      defaultValue: 0, // Default value of 0 if not fractional
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'fractional_slots');
    await queryInterface.removeColumn('Properties', 'price_per_slot');
  }
};
