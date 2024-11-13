
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients', // This references the Clients table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Agents', // This references the Agents table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'received', 'read'),
      allowNull: false,
      defaultValue: 'sent',
    },
  }, {});

  Message.associate = function(models) {
    Message.belongsTo(models.Client, {
      foreignKey: 'sender_id',
      as: 'sender', // This will allow you to access the sender details
    });
    Message.belongsTo(models.Agent, {
      foreignKey: 'recipient_id',
      as: 'recipient', // This will allow you to access the recipient details
    });
  };

  return Message;
};
