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
    }
  }, {});

  UserDocument.associate = function(models) {
    UserDocument.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UserDocument;
};