// models/Client.js
const { DataTypes } = require('sequelize');
const User = require('./user');  // Import User model

const Client = sequelize.define('Client', {
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User, // Reference to User model
      key: 'id',
    },
  },
  address: {
    type: DataTypes.STRING, // Add address field
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING, // Add phone_number field
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING, // Add city field
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING, // Add state field
    allowNull: true,
  },
});

module.exports = Client;
