// module.exports = (sequelize, DataTypes) => {
//   const UserDocument = sequelize.define('UserDocument', {
//     documentType: {
//       type: DataTypes.ENUM('DRIVER_LICENSE', 'PASSPORT', 'NATIONAL_ID'),
//       allowNull: false
//     },
//     frontUrl: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     backUrl: {
//       type: DataTypes.STRING
//     },
//     status: {
//       type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
//       defaultValue: 'PENDING'
//     },
//     adminNotes: {
//       type: DataTypes.TEXT
//     }
//   }, {});

//   UserDocument.associate = function(models) {
//     UserDocument.belongsTo(models.User, {
//       foreignKey: 'userId',
//       as: 'user'
//     });
//   };

//   return UserDocument;
// };

module.exports = (sequelize, DataTypes) => {
  const UserDocument = sequelize.define('UserDocument', {
    documentType: {
      type: DataTypes.ENUM('DRIVER_LICENSE', 'PASSPORT', 'NATIONAL_ID'),
      allowNull: false
    },
    frontUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    backUrl: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    adminNotes: {
      type: DataTypes.TEXT
    },
    userId: {  // Explicitly define the foreign key field
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    verifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'UserDocuments', // Explicit table name
    underscored: false, // Disable automatic snake_case conversion
    timestamps: true // Enable createdAt and updatedAt
  });

  UserDocument.associate = function(models) {
    UserDocument.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });
    
    UserDocument.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifier'
    });
  };

  return UserDocument;
};