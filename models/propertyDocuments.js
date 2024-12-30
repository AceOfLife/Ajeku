// module.exports = (sequelize, DataTypes) => {
//     const PropertyDocument = sequelize.define('PropertyDocument', {
//       document_url: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//     });
  
//     PropertyDocument.associate = function(models) {
//       // Each document belongs to a property
//       PropertyDocument.belongsTo(models.Property, {
//         foreignKey: 'property_id',
//         as: 'property',
//       });
//     };
  
//     return PropertyDocument;
//   };
  
// 30/12/24

module.exports = (sequelize, DataTypes) => {
    const PropertyDocument = sequelize.define('PropertyDocument', {
      document_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      property_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Properties', // Reference to the Property table
          key: 'id',
        },
        allowNull: false,
      },
    });
  
    // Define associations
    PropertyDocument.associate = function(models) {
      // PropertyDocument belongs to Property
      PropertyDocument.belongsTo(models.Property, { foreignKey: 'property_id', as: 'property' });
    };
  
    return PropertyDocument;
  };
  