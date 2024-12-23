// migrations/YYYYMMDDHHMMSS-add-client-profile-fields.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Clients', 'address', {
      type: Sequelize.STRING,
      allowNull: true, // Or false depending on your business logic
    });
    await queryInterface.addColumn('Clients', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clients', 'state', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Clients', 'address');
    await queryInterface.removeColumn('Clients', 'phone_number');
    await queryInterface.removeColumn('Clients', 'city');
    await queryInterface.removeColumn('Clients', 'state');
  }
};
