// migrations/YYYYYYYYYYYYYY-add-fk-to-rental-bookings.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('rental_bookings', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_rental_bookings_user_id',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('rental_bookings', {
      fields: ['property_id'],
      type: 'foreign key',
      name: 'fk_rental_bookings_property_id',
      references: {
        table: 'Properties',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('rental_bookings', 'fk_rental_bookings_user_id');
    await queryInterface.removeConstraint('rental_bookings', 'fk_rental_bookings_property_id');
  }
};