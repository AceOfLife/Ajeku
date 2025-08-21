'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Properties', 'original_owner_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // or whatever your user table is called
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Properties', 'original_owner_id');
  }
};