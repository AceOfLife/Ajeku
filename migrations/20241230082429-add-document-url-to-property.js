'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'document_url', {
      type: Sequelize.STRING, // Assuming you want to store the URL as a string
      allowNull: true, // Set to true since the document may not always be uploaded
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'document_url');
  }
};
