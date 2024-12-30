module.exports = (sequelize, DataTypes) => {
    const PropertyDocument = sequelize.define('PropertyDocument', {
      document_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    PropertyDocument.associate = function(models) {
      // Each document belongs to a property
      PropertyDocument.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property',
      });
    };
  
    return PropertyDocument;
  };
  