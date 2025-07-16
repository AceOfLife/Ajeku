// // models/client.js
// 'use strict';

// module.exports = (sequelize, DataTypes) => {
//   const Client = sequelize.define('Client', {
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'Users', // Assuming you have a Users table
//         key: 'id',
//       },
//       onUpdate: 'CASCADE',
//       onDelete: 'CASCADE',
//     },
//     status: {
//       type: DataTypes.ENUM('Unverified', 'Verified'),
//       defaultValue: 'Unverified',
//       allowNull: false,
//     },
//   }, {});

//   Client.associate = function(models) {
//     Client.belongsTo(models.User, {
//       foreignKey: 'user_id',
//       as: 'user', // This will allow you to access the user details
//     });
//     // Other associations can be added as needed
//   };

//   return Client;
// };

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('Unverified', 'Verified'),
      defaultValue: 'Unverified',
      allowNull: false,
    },
  }, {
    tableName: 'Clients', // Explicit table name
    underscored: true // For snake_case fields
  });

  Client.associate = function(models) {
    Client.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Client;
};