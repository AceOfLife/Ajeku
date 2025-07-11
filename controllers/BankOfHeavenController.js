const { BankOfHeaven, Transaction, Property } = require('../models');
const { Op } = require('sequelize');

// // Fetch the current financial data
// exports.getBankSummary = async (req, res) => {
//   try {
//     // 1. Get stored bank data
//     const bankSummary = await BankOfHeaven.findOne();
//     if (!bankSummary) {
//       return res.status(404).json({ message: 'Bank of Heaven data not found' });
//     }

//     // 2. Calculate current balance (all-time income - all-time expenses)
//     const allTransactions = await Transaction.findAll();
//     const total_income = allTransactions.reduce(
//       (sum, tx) => sum + parseFloat(tx.price || 0), 
//       0
//     );

//     const total_expenses = (await BankOfHeaven.sum('expenses_per_month')) || 0;
//     const current_balance = total_income - total_expenses;

//     // 3. Return data with calculated balance
//     res.json({
//       ...bankSummary.toJSON(),
//       current_balance, // Override with fresh calculation
//       total_income,
//       total_expenses
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Error retrieving Bank of Heaven data',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

exports.getBankSummary = async (req, res) => {
  try {
    const bankData = await BankOfHeaven.findOne();
    if (!bankData) return res.status(404).json({ message: 'Not found' });

    const allTransactions = await Transaction.findAll();
    const total_income = allTransactions.reduce((sum, tx) => 
      sum + parseFloat(tx.price), 0);

    res.json({
      ...bankData.toJSON(),
      current_balance: parseFloat(bankData.current_balance.toFixed(2)),
      expenses_per_month: parseFloat(bankData.expenses_per_month.toFixed(2)),
      total_income: parseFloat(total_income.toFixed(2)),
      total_expenses: parseFloat(bankData.expenses_per_month.toFixed(2))
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// exports.updateBankSummary = async (req, res) => {
//   try {
//     const { expenses } = req.body;
//     const now = new Date();
//     const lastMonth = new Date(now);
//     lastMonth.setMonth(now.getMonth() - 1);

//     // 1. Calculate MONTHLY INCOME (last 30 days)
//     const monthlyIncomeTransactions = await Transaction.findAll({
//       where: {
//         transaction_date: { [Op.between]: [lastMonth, now] }
//       }
//     });
//     const income_per_month = monthlyIncomeTransactions.reduce(
//       (sum, tx) => sum + parseFloat(tx.price || 0), 
//       0
//     );

//     // 2. Calculate MONTHLY EXPENSES (from req.body)
//     const expenses_per_month = expenses.reduce(
//       (sum, e) => sum + parseFloat(e.amount || 0), 
//       0
//     );

//     // 3. Get ALL-TIME TOTALS
//     const allTransactions = await Transaction.findAll();
//     const total_income = allTransactions.reduce(
//       (sum, tx) => sum + parseFloat(tx.price || 0), 
//       0
//     );
//     const total_expenses = (await BankOfHeaven.sum('expenses_per_month')) || 0;

//     // 4. Calculate CURRENT BALANCE
//     const current_balance = total_income - (total_expenses + expenses_per_month);

//     // 5. Update Bank Record
//     const [bankSummary] = await BankOfHeaven.upsert({
//       current_balance,
//       income_per_month,
//       expenses_per_month, // Now tracking monthly instead of weekly
//       transactions: expenses
//     }, { returning: true });

//     res.status(200).json({
//       success: true,
//       data: {
//         current_balance: bankSummary.current_balance,
//         income_this_month: bankSummary.income_per_month,
//         expenses_this_month: bankSummary.expenses_per_month,
//         all_time_income: total_income,
//         all_time_expenses: total_expenses + expenses_per_month
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error updating bank summary',
//       error: process.env.NODE_ENV === 'development' ? error : undefined 
//     });
//   }
// };

exports.updateBankSummary = async (req, res) => {
  try {
    const { expenses } = req.body;
    
    // 1. Get current bank data
    const [bankData] = await BankOfHeaven.findOrCreate({
      where: { id: 1 },
      defaults: { current_balance: 0 }
    });

    // 2. Calculate all-time values
    const allTransactions = await Transaction.findAll();
    const total_income = allTransactions.reduce((sum, tx) => 
      sum + parseFloat(tx.price), 0);

    // 3. Process new expenses
    const newExpenses = expenses.reduce((sum, e) => 
      sum + parseFloat(e.amount), 0);
    
    // 4. Update transactions array (appends new expenses)
    const updatedTransactions = [
      ...(bankData.transactions || []),
      ...expenses
    ];

    // 5. Calculate new values
    const updatedExpenses = parseFloat(bankData.expenses_per_month || 0) + newExpenses;
    const current_balance = total_income - updatedExpenses;

    // 6. Save updates
    await bankData.update({
      current_balance,
      expenses_per_month: updatedExpenses,
      transactions: updatedTransactions,
      income_per_month: await calculateMonthlyIncome() // Implement this function
    });

    res.json({
      success: true,
      data: {
        current_balance: parseFloat(current_balance.toFixed(2)),
        expenses_this_month: parseFloat(newExpenses.toFixed(2)),
        all_time_income: parseFloat(total_income.toFixed(2)),
        all_time_expenses: parseFloat(updatedExpenses.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating bank summary'
    });
  }
};

async function calculateMonthlyIncome() {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const monthlyTransactions = await Transaction.findAll({
    where: {
      transaction_date: { [Op.gte]: lastMonth }
    }
  });
  
  return monthlyTransactions.reduce((sum, tx) => 
    sum + parseFloat(tx.price), 0);
}