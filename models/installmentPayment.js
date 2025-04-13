'use strict';
module.exports = (sequelize, DataTypes) => {
  const InstallmentPayment = sequelize.define('InstallmentPayment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ownership_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount_paid: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    payment_month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {});

  InstallmentPayment.associate = function(models) {
    InstallmentPayment.belongsTo(models.User, { foreignKey: 'user_id' });
    InstallmentPayment.belongsTo(models.Property, { foreignKey: 'property_id' });
    InstallmentPayment.belongsTo(models.InstallmentOwnership, { foreignKey: 'ownership_id' });
  };

  return InstallmentPayment;
};
