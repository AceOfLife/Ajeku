module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'amenities');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'amenities', {
      type: Sequelize.STRING, // Change this if you want a different type
      allowNull: true,
    });
  },
};
