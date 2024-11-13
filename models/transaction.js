// models/transaction.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {});

  Transaction.associate = function(models) {
    Transaction.belongsTo(models.User, {
      foreignKey: 'client_id',
      as: 'client',
    });
    Transaction.belongsTo(models.Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
  };

  return Transaction;
};
