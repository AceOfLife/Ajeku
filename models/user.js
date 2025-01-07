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
const bcrypt = require('bcryptjs');

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
      type: DataTypes.STRING, 
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING, 
      allowNull: true,
      validate: {
        isIn: [['male', 'female', 'other']],
      },
    },
  }, {
    hooks: {
      // Hash the password before creating or updating the user
      beforeCreate: async (user, options) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10); // Salt rounds: 10 is commonly used
        }
      },
      beforeUpdate: async (user, options) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  });

  // Adding instance method to the model
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);  // Compare the candidate password with stored password
  };

  User.associate = function(models) {
    User.hasMany(models.Transaction, { foreignKey: 'client_id', as: 'transactions' });
    User.hasMany(models.Property, { foreignKey: 'agent_id', as: 'properties' });
  };

  return User;
};
