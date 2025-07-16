// models/client.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // This must match exactly how it's defined in PostgreSQL
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('Unverified', 'Verified'),
      defaultValue: 'Unverified',
      allowNull: false,
    },
  }, {
    tableName: 'Clients', // Explicitly set to match your PostgreSQL table
    underscored: true // To handle snake_case columns properly
  });

  Client.associate = function(models) {
    Client.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Client;
};