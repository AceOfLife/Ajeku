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


// 29/12/2024

// models/user.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { // Keeping the name field
      type: DataTypes.STRING,
      allowNull: false, // Ensure it is required
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'agent', 'client'),
      defaultValue: 'client',
    },
    profileImage: {
      type: DataTypes.STRING, // Store image URL or path
      allowNull: true, // Image is optional
    },
    gender: {
      type: DataTypes.STRING, 
      allowNull: true, 
      validate: {
        isIn: [['male', 'female', 'other']], // Optional restriction to these values
      },
    },
  }, {
    hooks: {
      beforeCreate: (user, options) => {
        if (user.gender) {
          user.gender = user.gender.toLowerCase(); // Convert to lowercase before saving
        }
      },
      beforeUpdate: (user, options) => {
        if (user.gender) {
          user.gender = user.gender.toLowerCase(); // Convert to lowercase before updating
        }
      },
    },
  });

  User.associate = function(models) {
    User.hasMany(models.Transaction, { foreignKey: 'client_id', as: 'transactions' });
    User.hasMany(models.Property, { foreignKey: 'agent_id', as: 'properties' });
  };

  return User;
};
