// models/client.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Assuming you have a Users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  }, {});

  Client.associate = function(models) {
    Client.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user', // This will allow you to access the user details
    });
    // Other associations can be added as needed
  };

  return Client;
};
