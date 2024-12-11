'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PropertyImages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      property_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Properties', // Referencing the 'Properties' table
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE', // Ensure images are deleted when the property is deleted
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false, // The image URL cannot be null
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PropertyImages');
  }
};
