// // models/transaction.js
// 'use strict';

// module.exports = (sequelize, DataTypes) => {
//   const Transaction = sequelize.define('Transaction', {
//     client_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     property_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
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
//       foreignKey: 'client_id',
//       as: 'client',
//     });
//     Transaction.belongsTo(models.Property, {
//       foreignKey: 'property_id',
//       as: 'property',
//     });
//   };

//   return Transaction;
// };

// 'use strict';

// module.exports = (sequelize, DataTypes) => {
//   const Transaction = sequelize.define('Transaction', {
//     id: {  
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//       allowNull: false,
//     },
//     user_id: {  // ✅ Fix: Use user_id instead of client_id
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "Users",
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
//       foreignKey: 'user_id',  // ✅ Fix: Use user_id
//       as: 'user',
//     });
//     Transaction.belongsTo(models.Property, {
//       foreignKey: 'property_id',
//       as: 'property',
//     });
//   };

//   return Transaction;
// };


module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Properties', key: 'id' }
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' }
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    payment_type: {
      type: DataTypes.ENUM(
        'full',
        'outright',
        'fractional',
        'fractionalInstallment',
        'installment',
        'rental'
      ),
      allowNull: false
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    slot_id: {  // NEW FIELD
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'FractionalOwnerships', key: 'id' }
    }
  }, {
    tableName: 'Transactions',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    underscored: false
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
    Transaction.belongsTo(models.Property, { 
      foreignKey: 'property_id',
      as: 'property'
    });
    Transaction.belongsTo(models.User, {
      foreignKey: 'client_id',
      as: 'client'
    });
    
  };

  return Transaction;
};