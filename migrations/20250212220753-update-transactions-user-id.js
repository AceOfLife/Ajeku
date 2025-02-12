module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn("Transactions", "client_id");
      await queryInterface.addColumn("Transactions", "user_id", {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: "Users",
              key: "id"
          }
      });
  },
  down: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn("Transactions", "client_id", {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: "Clients",
              key: "id"
          }
      });
      await queryInterface.removeColumn("Transactions", "user_id");
  }
};
