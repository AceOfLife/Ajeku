module.exports = (sequelize, DataTypes) => {
  const FractionalOwnership = sequelize.define('FractionalOwnership', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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
  }, {
    tableName: 'FractionalOwnerships',
    timestamps: true
  });

  FractionalOwnership.associate = function(models) {
    FractionalOwnership.belongsTo(models.User, { foreignKey: 'user_id' });
    FractionalOwnership.belongsTo(models.Property, { foreignKey: 'property_id' });
    FractionalOwnership.hasMany(models.Transaction, {
      foreignKey: 'slot_id',
      as: 'transactions'
    });
  };

  return FractionalOwnership;
};