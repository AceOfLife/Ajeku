module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'isRental', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'isRental');
  }
};
