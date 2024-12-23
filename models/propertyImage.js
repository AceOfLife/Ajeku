//Updated for PropertyImage Table

module.exports = (sequelize, DataTypes) => {
  const PropertyImage = sequelize.define('PropertyImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Properties',
        key: 'id',
      },
    },
    image_url: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
  }, {
    timestamps: true, // Sequelize will handle 'createdAt' and 'updatedAt'
  });

  PropertyImage.associate = (models) => {
    // Define the relationship between PropertyImage and Property
    PropertyImage.belongsTo(models.Property, {
      foreignKey: 'property_id',
      as: 'property', // Alias for the relationship
    });
  };

  return PropertyImage;
};
