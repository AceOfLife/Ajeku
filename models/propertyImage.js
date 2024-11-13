// models/propertyImage.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const PropertyImage = sequelize.define('PropertyImage', {
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Properties',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {});

  PropertyImage.associate = function(models) {
    PropertyImage.belongsTo(models.Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
  };

  return PropertyImage;
};
