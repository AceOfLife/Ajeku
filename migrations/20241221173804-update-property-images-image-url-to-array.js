'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('PropertyImages', 'image_url', {
      type: Sequelize.ARRAY(Sequelize.STRING),  // Change to array of strings
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('PropertyImages', 'image_url', {
      type: Sequelize.STRING,  // Revert back to a single string
      allowNull: false,
    });
  }
};
