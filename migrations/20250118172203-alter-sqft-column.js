module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Properties', 'sqft', {
      type: Sequelize.STRING,
      allowNull: true, // This allows null values
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Properties', 'sqft', {
      type: Sequelize.INTEGER, // Assuming it was originally an INTEGER
      allowNull: false, // Ensure it cannot be null if rolling back
    });
  }
};
