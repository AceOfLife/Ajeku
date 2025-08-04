module.exports = (sequelize, DataTypes) => {
  const FullOwnership = sequelize.define('FullOwnership', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Properties', key: 'id' }
    },
    purchase_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    purchase_amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    }
  });

  FullOwnership.associate = (models) => {
    FullOwnership.belongsTo(models.User, { foreignKey: 'user_id' });
    FullOwnership.belongsTo(models.Property, { foreignKey: 'property_id' });
  };

  return FullOwnership;
};