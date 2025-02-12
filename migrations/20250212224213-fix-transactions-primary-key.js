module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn("Transactions", "id", {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
      });
  },
  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn("Transactions", "id");
  }
};
