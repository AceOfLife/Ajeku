module.exports = (sequelize, DataTypes) => {
  const FractionalOwnership = sequelize.define('FractionalOwnership', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Properties',
        key: 'id',
      },
    },
    slots_purchased: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_relisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    relist_price: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  });

  FractionalOwnership.associate = (models) => {
    FractionalOwnership.belongsTo(models.User, { foreignKey: 'user_id' });
    FractionalOwnership.belongsTo(models.Property, { foreignKey: 'property_id' });
  };

  return FractionalOwnership;
};