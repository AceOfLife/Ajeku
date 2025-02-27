module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Properties', 'interior_area', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Properties', 'interior_area', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
