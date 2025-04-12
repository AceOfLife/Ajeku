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
    });
  
    FractionalOwnership.associate = (models) => {
      FractionalOwnership.belongsTo(models.User, { foreignKey: 'user_id' });
      FractionalOwnership.belongsTo(models.Property, { foreignKey: 'property_id' });
    };
  
    return FractionalOwnership;
  };
  