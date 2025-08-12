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
      defaultValue: 1
    },
    is_relisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    relist_price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'FractionalOwnerships',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  FractionalOwnership.associate = (models) => {
    FractionalOwnership.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
    FractionalOwnership.belongsTo(models.Property, { 
      foreignKey: 'property_id',
      as: 'property'
    });
    FractionalOwnership.hasMany(models.Transaction, {
      foreignKey: 'slot_id',
      as: 'transactions'
    });
  };

  return FractionalOwnership;
};