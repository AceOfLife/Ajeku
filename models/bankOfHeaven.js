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

module.exports = (sequelize, DataTypes) => {
  const BankOfHeaven = sequelize.define(
    'BankOfHeaven',
    {
      current_balance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      expenses_per_month: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      income_per_week: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      transactions: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: 'BankOfHeaven', // 
      timestamps: true,
    }
  );

  return BankOfHeaven;
};

  