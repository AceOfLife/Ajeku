// migrations/XXXXXXXXXXXXXX-create-rental-bookings.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rental_bookings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      property_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rooms_booked: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      amount_paid: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes without foreign key constraints
    await queryInterface.addIndex('rental_bookings', ['user_id']);
    await queryInterface.addIndex('rental_bookings', ['property_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('rental_bookings');
  }
};