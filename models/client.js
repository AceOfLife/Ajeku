// // models/client.js
// 'use strict';

// module.exports = (sequelize, DataTypes) => {
//   const Client = sequelize.define('Client', {
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'Users', // Assuming you have a Users table
//         key: 'id',
//       },
//       onUpdate: 'CASCADE',
//       onDelete: 'CASCADE',
//     },
//   }, {});

//   Client.associate = function(models) {
//     Client.belongsTo(models.User, {
//       foreignKey: 'user_id',
//       as: 'user', // This will allow you to access the user details
//     });
//     // Other associations can be added as needed
//   };

//   return Client;
// };


// models/Client.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Import the User model

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
