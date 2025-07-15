// const { BankOfHeaven, Transaction, Property, sequelize } = require('../models');
// const { Op } = require('sequelize');

// // // Fetch the current financial data
// // exports.getBankSummary = async (req, res) => {
// //   try {
// //     // 1. Get stored bank data
// //     const bankSummary = await BankOfHeaven.findOne();
// //     if (!bankSummary) {
// //       return res.status(404).json({ message: 'Bank of Heaven data not found' });
// //     }

// //     // 2. Calculate current balance (all-time income - all-time expenses)
// //     const allTransactions = await Transaction.findAll();
// //     const total_income = allTransactions.reduce(
// //       (sum, tx) => sum + parseFloat(tx.price || 0), 
// //       0
// //     );

// //     const total_expenses = (await BankOfHeaven.sum('expenses_per_month')) || 0;
// //     const current_balance = total_income - total_expenses;

// //     // 3. Return data with calculated balance
// //     res.json({
// //       ...bankSummary.toJSON(),
// //       current_balance, // Override with fresh calculation
// //       total_income,
// //       total_expenses
// //     });

// //   } catch (error) {
// //     res.status(500).json({ 
// //       message: 'Error retrieving Bank of Heaven data',
// //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
// //     });
// //   }
// // };

// // exports.getBankSummary = async (req, res) => {
// //   try {
// //     // 1. Get raw data without Sequelize instance methods
// //     const bankData = await BankOfHeaven.findOne({
// //       where: { id: 1 },
// //       raw: true, // Crucial for direct JSON response
// //       attributes: [
// //         'id',
// //         'current_balance',
// //         'expenses_per_month',
// //         'income_per_month',
// //         'transactions',
// //         'createdAt',
// //         'updatedAt'
// //       ]
// //     });

// //     if (!bankData) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Bank record not found'
// //       });
// //     }

// //     // 2. Calculate all-time income safely
// //     let total_income = 0;
// //     try {
// //       const allTransactions = await Transaction.findAll({
// //         attributes: ['price'],
// //         raw: true
// //       });
// //       total_income = allTransactions.reduce((sum, tx) => 
// //         sum + parseFloat(tx.price || 0), 0);
// //     } catch (calcError) {
// //       console.error('Income calculation error:', calcError);
// //       // Use stored income if calculation fails
// //       total_income = parseFloat(bankData.income_per_month) || 0;
// //     }

// //     // 3. Prepare response with guaranteed number types
// //     const response = {
// //       ...bankData,
// //       current_balance: Number(bankData.current_balance),
// //       expenses_per_month: Number(bankData.expenses_per_month),
// //       income_per_month: Number(bankData.income_per_month),
// //       total_income: Number(total_income.toFixed(2)),
// //       total_expenses: Number(bankData.expenses_per_month) // Already includes all-time
// //     };

// //     res.json({
// //       success: true,
// //       data: response
// //     });

// //   } catch (error) {
// //     console.error('Server Error:', {
// //       message: error.message,
// //       stack: error.stack,
// //       query: error.sql
// //     });
    
// //     res.status(500).json({
// //       success: false,
// //       message: 'Server error',
// //       ...(process.env.NODE_ENV === 'development' && {
// //         debug: {
// //           error: error.message,
// //           stack: error.stack
// //         }
// //       })
// //     });
// //   }
// // };

// // 15/07/2025

// exports.getBankSummary = async (req, res) => {
//   try {
//     const bankData = await BankOfHeaven.findOne({
//       where: { id: 1 },
//       raw: true
//     });

//     if (!bankData) {
//       return res.status(404).json({
//         success: false,
//         message: 'Bank record not found'
//       });
//     }

//     // Calculate all-time income safely
//     let total_income = 0;
//     try {
//       const allTransactions = await Transaction.findAll({
//         attributes: ['price'],
//         raw: true
//       });
//       total_income = allTransactions.reduce((sum, tx) => 
//         sum + parseFloat(tx.price || 0), 0);
//     } catch (calcError) {
//       console.error('Income calculation error:', calcError);
//       total_income = parseFloat(bankData.income_per_month) || 0;
//     }

//     // Format percentage changes
//     const formatPercentage = (value) => {
//       const num = parseFloat(value || 0);
//       return num > 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
//     };

//     res.json({
//       success: true,
//       data: {
//         ...bankData,
//         current_balance: Number(bankData.current_balance),
//         income_per_month: Number(bankData.income_per_month),
//         expenses_per_month: Number(bankData.expenses_per_month),
//         total_income: Number(total_income.toFixed(2)),
//         total_expenses: Number(bankData.expenses_per_month),
//         percentage_changes: {
//           income: formatPercentage(bankData.percentage_changes?.income),
//           expenses: formatPercentage(bankData.percentage_changes?.expenses),
//           balance: formatPercentage(bankData.percentage_changes?.balance)
//         },
//         previous_month_comparison: bankData.previous_month_data
//       }
//     });

//   } catch (error) {
//     console.error('Server Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };

// // exports.updateBankSummary = async (req, res) => {
// //   try {
// //     const { expenses } = req.body;
// //     const now = new Date();
// //     const lastMonth = new Date(now);
// //     lastMonth.setMonth(now.getMonth() - 1);

// //     // 1. Calculate MONTHLY INCOME (last 30 days)
// //     const monthlyIncomeTransactions = await Transaction.findAll({
// //       where: {
// //         transaction_date: { [Op.between]: [lastMonth, now] }
// //       }
// //     });
// //     const income_per_month = monthlyIncomeTransactions.reduce(
// //       (sum, tx) => sum + parseFloat(tx.price || 0), 
// //       0
// //     );

// //     // 2. Calculate MONTHLY EXPENSES (from req.body)
// //     const expenses_per_month = expenses.reduce(
// //       (sum, e) => sum + parseFloat(e.amount || 0), 
// //       0
// //     );

// //     // 3. Get ALL-TIME TOTALS
// //     const allTransactions = await Transaction.findAll();
// //     const total_income = allTransactions.reduce(
// //       (sum, tx) => sum + parseFloat(tx.price || 0), 
// //       0
// //     );
// //     const total_expenses = (await BankOfHeaven.sum('expenses_per_month')) || 0;

// //     // 4. Calculate CURRENT BALANCE
// //     const current_balance = total_income - (total_expenses + expenses_per_month);

// //     // 5. Update Bank Record
// //     const [bankSummary] = await BankOfHeaven.upsert({
// //       current_balance,
// //       income_per_month,
// //       expenses_per_month, // Now tracking monthly instead of weekly
// //       transactions: expenses
// //     }, { returning: true });

// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         current_balance: bankSummary.current_balance,
// //         income_this_month: bankSummary.income_per_month,
// //         expenses_this_month: bankSummary.expenses_per_month,
// //         all_time_income: total_income,
// //         all_time_expenses: total_expenses + expenses_per_month
// //       }
// //     });

// //   } catch (error) {
// //     res.status(500).json({ 
// //       success: false, 
// //       message: 'Error updating bank summary',
// //       error: process.env.NODE_ENV === 'development' ? error : undefined 
// //     });
// //   }
// // };

// // exports.updateBankSummary = async (req, res) => {
// //   try {
// //     const { expenses } = req.body;
    
// //     // 1. Get current bank data
// //     const [bankData] = await BankOfHeaven.findOrCreate({
// //       where: { id: 1 },
// //       defaults: { current_balance: 0 }
// //     });

// //     // 2. Calculate all-time values
// //     const allTransactions = await Transaction.findAll();
// //     const total_income = allTransactions.reduce((sum, tx) => 
// //       sum + parseFloat(tx.price), 0);

// //     // 3. Process new expenses
// //     const newExpenses = expenses.reduce((sum, e) => 
// //       sum + parseFloat(e.amount), 0);
    
// //     // 4. Update transactions array (appends new expenses)
// //     const updatedTransactions = [
// //       ...(bankData.transactions || []),
// //       ...expenses
// //     ];

// //     // 5. Calculate new values
// //     const updatedExpenses = parseFloat(bankData.expenses_per_month || 0) + newExpenses;
// //     const current_balance = total_income - updatedExpenses;

// //     // 6. Save updates
// //     await bankData.update({
// //       current_balance,
// //       expenses_per_month: updatedExpenses,
// //       transactions: updatedTransactions,
// //       income_per_month: await calculateMonthlyIncome() // Implement this function
// //     });

// //     res.json({
// //       success: true,
// //       data: {
// //         current_balance: parseFloat(current_balance.toFixed(2)),
// //         expenses_this_month: parseFloat(newExpenses.toFixed(2)),
// //         all_time_income: parseFloat(total_income.toFixed(2)),
// //         all_time_expenses: parseFloat(updatedExpenses.toFixed(2))
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Update error:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Error updating bank summary'
// //     });
// //   }
// // };

// // async function calculateMonthlyIncome() {
// //   const lastMonth = new Date();
// //   lastMonth.setMonth(lastMonth.getMonth() - 1);
  
// //   const monthlyTransactions = await Transaction.findAll({
// //     where: {
// //       transaction_date: { [Op.gte]: lastMonth }
// //     }
// //   });
  
// //   return monthlyTransactions.reduce((sum, tx) => 
// //     sum + parseFloat(tx.price), 0);
// // }

// // 15/07/2025

// exports.updateBankSummary = async (req, res) => {
//   let t;
//   try {
//     t = await sequelize.transaction();
//     const { expenses } = req.body;
    
//     const [bankData] = await BankOfHeaven.findOrCreate({
//       where: { id: 1 },
//       defaults: { current_balance: 0 },
//       transaction: t
//     });

//     const previousValues = {
//       income: bankData.income_per_month || 0,
//       expenses: bankData.expenses_per_month || 0,
//       balance: bankData.current_balance || 0
//     };

//     const allTransactions = await Transaction.findAll({ transaction: t });
//     const total_income = allTransactions.reduce((sum, tx) => 
//       sum + parseFloat(tx.price), 0);

//     const newExpenses = expenses.reduce((sum, e) => 
//       sum + parseFloat(e.amount), 0);
    
//     const monthlyIncome = await calculateMonthlyIncome(t);

//     const calculatePercentageChange = (current, previous) => {
//       if (previous === 0) return 0;
//       return ((current - previous) / previous) * 100;
//     };

//     const percentageChanges = {
//       income: calculatePercentageChange(monthlyIncome, previousValues.income),
//       expenses: calculatePercentageChange(newExpenses, previousValues.expenses),
//       balance: calculatePercentageChange(
//         total_income - (bankData.expenses_per_month + newExpenses),
//         previousValues.balance
//       )
//     };

//     await bankData.update({
//       current_balance: total_income - (bankData.expenses_per_month + newExpenses),
//       income_per_month: monthlyIncome,
//       expenses_per_month: bankData.expenses_per_month + newExpenses,
//       transactions: [...(bankData.transactions || []), ...expenses],
//       previous_month_data: previousValues,
//       percentage_changes: percentageChanges
//     }, { transaction: t });

//     await t.commit();

//     return res.json({
//       success: true,
//       data: {
//         current_balance: parseFloat(bankData.current_balance.toFixed(2)),
//         expenses_this_month: parseFloat(newExpenses.toFixed(2)),
//         income_this_month: parseFloat(monthlyIncome.toFixed(2)),
//         all_time_income: parseFloat(total_income.toFixed(2)),
//         all_time_expenses: parseFloat((bankData.expenses_per_month + newExpenses).toFixed(2)),
//         percentage_changes: {
//           income: parseFloat(percentageChanges.income.toFixed(1)) + '%',
//           expenses: parseFloat(percentageChanges.expenses.toFixed(1)) + '%',
//           balance: parseFloat(percentageChanges.balance.toFixed(1)) + '%'
//         }
//       }
//     });

//   } catch (error) {
//     if (t && !t.finished) {
//       await t.rollback();
//     }
//     console.error('Update error:', error);
//     return res.status(500).json({ 
//       success: false,
//       message: 'Error updating bank summary'
//     });
//   }
// };

const { BankOfHeaven, Transaction, Property, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper function to calculate monthly income
async function calculateMonthlyIncome(transaction) {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const monthlyTransactions = await Transaction.findAll({
    where: {
      transaction_date: { 
        [Op.gte]: lastMonth 
      }
    },
    transaction
  });
  
  return monthlyTransactions.reduce((sum, tx) => 
    sum + parseFloat(tx.price || 0), 0);
}

exports.getBankSummary = async (req, res) => {
  try {
    const bankData = await BankOfHeaven.findOne({
      where: { id: 1 },
      raw: true,
      attributes: [
        'id',
        'current_balance',
        'expenses_per_month',
        'income_per_month',
        'transactions',
        'createdAt',
        'updatedAt',
        'previous_month_data',
        'percentage_changes'
      ]
    });

    if (!bankData) {
      return res.status(404).json({
        success: false,
        message: 'Bank record not found'
      });
    }

    let total_income = 0;
    try {
      const allTransactions = await Transaction.findAll({
        attributes: ['price'],
        raw: true
      });
      total_income = allTransactions.reduce((sum, tx) => 
        sum + parseFloat(tx.price || 0), 0);
    } catch (calcError) {
      console.error('Income calculation error:', calcError);
      total_income = parseFloat(bankData.income_per_month) || 0;
    }

    const formatPercentage = (value) => {
      const num = parseFloat(value || 0);
      return num > 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
    };

    res.json({
      success: true,
      data: {
        ...bankData,
        current_balance: Number(bankData.current_balance),
        expenses_per_month: Number(bankData.expenses_per_month),
        income_per_month: Number(bankData.income_per_month),
        total_income: Number(total_income.toFixed(2)),
        total_expenses: Number(bankData.expenses_per_month),
        percentage_changes: bankData.percentage_changes ? {
          income: formatPercentage(bankData.percentage_changes.income),
          expenses: formatPercentage(bankData.percentage_changes.expenses),
          balance: formatPercentage(bankData.percentage_changes.balance)
        } : null,
        previous_month_comparison: bankData.previous_month_data || null
      }
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateBankSummary = async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();
    const { expenses } = req.body;
    
    const [bankData] = await BankOfHeaven.findOrCreate({
      where: { id: 1 },
      defaults: { current_balance: 0 },
      transaction: t
    });

    const previousValues = {
      income: bankData.income_per_month || 0,
      expenses: bankData.expenses_per_month || 0,
      balance: bankData.current_balance || 0
    };

    const allTransactions = await Transaction.findAll({ transaction: t });
    const total_income = allTransactions.reduce((sum, tx) => 
      sum + parseFloat(tx.price || 0), 0);

    const newExpenses = expenses.reduce((sum, e) => 
      sum + parseFloat(e.amount || 0), 0);
    
    const monthlyIncome = await calculateMonthlyIncome(t);

    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const percentageChanges = {
      income: calculatePercentageChange(monthlyIncome, previousValues.income),
      expenses: calculatePercentageChange(newExpenses, previousValues.expenses),
      balance: calculatePercentageChange(
        total_income - (bankData.expenses_per_month + newExpenses),
        previousValues.balance
      )
    };

    await bankData.update({
      current_balance: total_income - (bankData.expenses_per_month + newExpenses),
      income_per_month: monthlyIncome,
      expenses_per_month: bankData.expenses_per_month + newExpenses,
      transactions: [...(bankData.transactions || []), ...expenses],
      previous_month_data: previousValues,
      percentage_changes: percentageChanges
    }, { transaction: t });

    await t.commit();

    res.json({
      success: true,
      data: {
        current_balance: parseFloat(bankData.current_balance.toFixed(2)),
        expenses_this_month: parseFloat(newExpenses.toFixed(2)),
        income_this_month: parseFloat(monthlyIncome.toFixed(2)),
        all_time_income: parseFloat(total_income.toFixed(2)),
        all_time_expenses: parseFloat((bankData.expenses_per_month + newExpenses).toFixed(2)),
        percentage_changes: {
          income: parseFloat(percentageChanges.income.toFixed(1)) + '%',
          expenses: parseFloat(percentageChanges.expenses.toFixed(1)) + '%',
          balance: parseFloat(percentageChanges.balance.toFixed(1)) + '%'
        }
      }
    });

  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }
    console.error('Update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating bank summary'
    });
  }
};

module.exports = {
  getBankSummary,
  updateBankSummary
};