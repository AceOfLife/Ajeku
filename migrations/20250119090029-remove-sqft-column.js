module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'sqft');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'sqft', {
      type: Sequelize.STRING,  // Assuming you want to add it back as STRING
      allowNull: true,
    });
  }
};
