// models/review.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients', // Assuming you have a Clients model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Properties', // Assuming you have a Properties model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Agents', // Assuming you have an Agents model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Allow null if agent is removed
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {});

  Review.associate = function(models) {
    Review.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });
    Review.belongsTo(models.Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
    Review.belongsTo(models.Agent, {
      foreignKey: 'agent_id',
      as: 'agent',
    });
  };

  return Review;
};
