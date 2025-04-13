'use strict';
module.exports = (sequelize, DataTypes) => {
  const InstallmentPayment = sequelize.define('InstallmentPayment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {});

  InstallmentPayment.associate = function(models) {
    InstallmentPayment.belongsTo(models.User, { foreignKey: 'user_id' });
    InstallmentPayment.belongsTo(models.Property, { foreignKey: 'property_id' });
  };

  return InstallmentPayment;
};
