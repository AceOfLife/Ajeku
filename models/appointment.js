// models/appointment.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients', // Assuming Clients model is created
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Properties',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'canceled'),
      allowNull: false,
    },
  }, {});

  Appointment.associate = function(models) {
    Appointment.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });
    Appointment.belongsTo(models.Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
  };

  return Appointment;
};
