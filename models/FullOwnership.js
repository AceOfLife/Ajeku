// models/FullOwnership.js
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
  }, {
    tableName: 'FullOwnerships', 
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  FullOwnership.associate = (models) => {
    FullOwnership.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
    FullOwnership.belongsTo(models.Property, { 
      foreignKey: 'property_id',
      as: 'property'
    });
  };

  return FullOwnership;
};