// // models/user.js
// 'use strict';

// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define('User', {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     role: {
//       type: DataTypes.ENUM('admin', 'agent', 'client'),
//       defaultValue: 'client',
//     },
//   }, {});

//   User.associate = function(models) {
//     User.hasMany(models.Transaction, { foreignKey: 'client_id', as: 'transactions' });
//     User.hasMany(models.Property, { foreignKey: 'agent_id', as: 'properties' });
//   };

//   return User;
// };


// New User Management

// models/user.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'agent', 'client'),
      defaultValue: 'client',
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,  // Token for resetting password
    },
    resetTokenExpiration: {
      type: DataTypes.DATE,
      allowNull: true,  // Expiry time for the reset token
    },
  }, {});

  User.associate = function(models) {
    User.hasMany(models.Transaction, { foreignKey: 'client_id', as: 'transactions' });
    User.hasMany(models.Property, { foreignKey: 'agent_id', as: 'properties' });
  };

  return User;
};
