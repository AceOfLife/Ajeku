'use strict';
module.exports = (sequelize, DataTypes) => {
  const InstallmentOwnership = sequelize.define('InstallmentOwnership', {
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
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {});

  InstallmentOwnership.associate = function(models) {
    InstallmentOwnership.belongsTo(models.User, { foreignKey: 'user_id' });
    InstallmentOwnership.belongsTo(models.Property, { foreignKey: 'property_id', as: 'property' });
  };

  return InstallmentOwnership;
};
