// models/transaction.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {});

  Transaction.associate = function(models) {
    Transaction.belongsTo(models.User, {
      foreignKey: 'client_id',
      as: 'client',
    });
    Transaction.belongsTo(models.Property, {
      foreignKey: 'property_id',
      as: 'property',
    });
  };

  return Transaction;
};


// 'use strict';

// module.exports = (sequelize, DataTypes) => {
//   const Transaction = sequelize.define('Transaction', {
//     id: {  
//       type: DataTypes.INTEGER,
//       autoIncrement: true,  // ✅ Ensures it auto-increments
//       primaryKey: true,  // ✅ Marks it as the primary key
//       allowNull: false,
//     },
//     user_id: {  // ✅ Ensure this field exists
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "Users", // ✅ References Users table
//         key: "id",
//       },
//     },
//     property_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "Properties",
//         key: "id",
//       },
//     },
//     price: {
//       type: DataTypes.DECIMAL,
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     transaction_date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     }
//   }, {});

//   Transaction.associate = function(models) {
//     Transaction.belongsTo(models.User, {
//       foreignKey: 'user_id',  
//       as: 'user',
//     });
//     Transaction.belongsTo(models.Property, {
//       foreignKey: 'property_id',
//       as: 'property',
//     });
//   };

//   return Transaction;
// };
