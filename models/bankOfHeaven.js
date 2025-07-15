// models/bankOfHeaven.js

// module.exports = (sequelize, DataTypes) => {
//     const BankOfHeaven = sequelize.define('BankOfHeaven', {
//       current_balance: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//         defaultValue: 0.0,
//       },
//       expenses_per_week: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//         defaultValue: 0.0,
//       },
//       income_per_week: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//         defaultValue: 0.0,
//       },
//       transactions: {
//         type: DataTypes.JSON,
//         allowNull: true,
//       },
//     });
  
//     return BankOfHeaven;
//   };

// module.exports = (sequelize, DataTypes) => {
//   const BankOfHeaven = sequelize.define(
//     'BankOfHeaven',
//     {
//       current_balance: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//         defaultValue: 0.0,
//       },
//       expenses_per_month: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//         defaultValue: 0.0,
//       },
//       income_per_week: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//         defaultValue: 0.0,
//       },
//       transactions: {
//         type: DataTypes.JSON,
//         allowNull: true,
//       },
//     },
//     {
//       tableName: 'BankOfHeaven', // 
//       timestamps: true,
//     }
//   );

//   return BankOfHeaven;
// };

// module.exports = (sequelize, DataTypes) => {
//   return sequelize.define('BankOfHeaven', {
//     current_balance: {
//       type: DataTypes.DECIMAL(15, 2), // Better precision than FLOAT
//       defaultValue: 0.00
//     },
//     income_per_month: { // Changed from income_per_week
//       type: DataTypes.DECIMAL(15, 2),
//       defaultValue: 0.00
//     },
//     expenses_per_month: {
//       type: DataTypes.DECIMAL(15, 2),
//       defaultValue: 0.00
//     },
//     transactions: {
//       type: DataTypes.JSONB, // Changed to JSONB for better performance
//       defaultValue: []
//     }
//   }, {
//     tableName: 'BankOfHeaven',
//     timestamps: true
//   });
// };

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('BankOfHeaven', {
    current_balance: DataTypes.DECIMAL(15, 2),
    income_per_month: DataTypes.DECIMAL(15, 2),
    expenses_per_month: DataTypes.DECIMAL(15, 2),
    transactions: DataTypes.JSONB,
    // Add these new fields
    previous_month_data: {
      type: DataTypes.JSONB,
      defaultValue: {
        income: 0,
        expenses: 0,
        balance: 0
      }
    },
    percentage_changes: {
      type: DataTypes.JSONB,
      defaultValue: {
        income: 0,
        expenses: 0,
        balance: 0
      }
    }
  }, {
    tableName: 'BankOfHeaven',
    timestamps: true
  });
};