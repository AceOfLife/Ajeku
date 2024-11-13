'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      client_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // This should match the model name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Adjust based on your needs
      },
      property_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Properties', // This should match the model name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Adjust based on your needs
      },
      price: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transactions');
  },
};

