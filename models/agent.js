// models/agent.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Agent = sequelize.define('Agent', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    license_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {});

  Agent.associate = function(models) {
    Agent.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    // You can add associations like Properties managed by this agent
    Agent.hasMany(models.Property, {
      foreignKey: 'agent_id',
      as: 'properties',
    });
  };

  return Agent;
};
