// 29/12/2024

// models/user.js
'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { // Keeping the name field
      type: DataTypes.STRING,
      allowNull: false, // Ensure it is required
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'agent', 'client'),
      defaultValue: 'client',
    },
    profileImage: {
      type: DataTypes.STRING, // Store image URL or path
      allowNull: true, // Image is optional
    },
    referralSource: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING, 
      allowNull: true, 
      validate: {
        isIn: [['male', 'female', 'other']], // Optional restriction to these values
      },
    },
  }, {
    hooks: {
      // Convert gender to lowercase before validation
      beforeValidate: (user, options) => {
        if (user.gender) {
          user.gender = user.gender.toLowerCase(); // Convert gender to lowercase
        }
      },
    },
  });

  User.associate = function(models) {
    User.hasMany(models.Transaction, { foreignKey: 'user_id', as: 'transactions' });
    User.hasMany(models.Property, { foreignKey: 'agent_id', as: 'properties' });
    User.hasMany(models.UserDocument, { foreignKey: 'userId', as: 'documents' });
  };

  return User;
};
