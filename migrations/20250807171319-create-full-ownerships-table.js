// migrations/XXXX-create-full-ownerships-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FullOwnerships', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        allowNull: false
      },
      property_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Properties', key: 'id' },
        allowNull: false
      },
      purchase_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      purchase_amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('FullOwnerships', ['user_id']);
    await queryInterface.addIndex('FullOwnerships', ['property_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('FullOwnerships');
  }
};