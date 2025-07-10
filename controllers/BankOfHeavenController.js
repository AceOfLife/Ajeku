const { BankOfHeaven, Transaction, Property } = require('../models');
const { Op } = require('sequelize');

// Fetch the current financial data
exports.getBankSummary = async (req, res) => {
  try {
    const bankSummary = await BankOfHeaven.findOne();
    if (!bankSummary) {
      return res.status(404).json({ message: 'Bank of Heaven data not found' });
    }
    res.json(bankSummary);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Bank of Heaven data' });
  }
};

exports.updateBankSummary = async (req, res) => {
  try {
    const { expenses } = req.body;
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    // 1. Get all transactions in date range (removed rental property filter)
    const weeklyTransactions = await Transaction.findAll({
      where: {
        transaction_date: {
          [Op.between]: [lastWeek, now]
        }
      }
    });

    // 2. Calculate weekly income from all transactions
    const income_per_week = weeklyTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.price || 0), 
      0
    );

    // 3. Get all-time income from all transactions
    const allTimeTransactions = await Transaction.findAll();
    
    const total_income = allTimeTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.price || 0), 
      0
    );

    // 4. Calculate expenses
    const expenses_per_week = expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount || 0), 
      0
    );

    // 5. Get historical expenses
    const total_expenses = (await BankOfHeaven.sum('expenses_per_week')) || 0;
    const current_balance = total_income - total_expenses;

    // 6. Update or create bank summary
    const [bankSummary] = await BankOfHeaven.upsert({
      current_balance,
      expenses_per_week,
      income_per_week,
      transactions: expenses
    }, {
      returning: true
    });

    // 7. Return success response
    res.status(200).json({
      success: true,
      message: 'Bank summary updated successfully',
      data: {
        current_balance: bankSummary.current_balance,
        weekly_income: bankSummary.income_per_week,
        weekly_expenses: bankSummary.expenses_per_week,
        all_time_income: total_income,
        all_time_expenses: total_expenses,
        updated_at: bankSummary.updatedAt
      }
    });

  } catch (error) {
    console.error('Bank update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bank summary',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};