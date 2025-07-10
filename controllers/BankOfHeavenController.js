const { BankOfHeaven, Transaction, Property } = require('../models');
const { Op } = require('sequelize');

// Fetch the current financial data
// Fetch the current financial data
exports.getBankSummary = async (req, res) => {
  try {
    // Get bank summary without transactions association
    const bankSummary = await BankOfHeaven.findOne();

    if (!bankSummary) {
      return res.status(404).json({ 
        success: false,
        message: 'Bank of Heaven data not found' 
      });
    }

    // Get recent transactions separately
    const recentTransactions = await Transaction.findAll({
      attributes: ['id', 'price', 'transaction_date', 'payment_type'],
      limit: 50,
      order: [['transaction_date', 'DESC']],
      where: { status: 'success' }
    });

    // Calculate totals from all transactions
    const allTransactions = await Transaction.findAll({
      where: { status: 'success' }
    });
    const totalIncome = allTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.price || 0), 0
    );

    res.status(200).json({
      success: true,
      data: {
        ...bankSummary.toJSON(),
        total_income: totalIncome,
        transaction_count: allTransactions.length,
        recent_transactions: recentTransactions
      }
    });

  } catch (error) {
    console.error('Error fetching bank summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving Bank of Heaven data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateBankSummary = async (req, res) => {
  try {
    const { expenses } = req.body;
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    // 1. Get all transactions for rental properties in date range
    const allTransactions = await Transaction.findAll({
      where: {
        transaction_date: {
          [Op.between]: [lastWeek, now]
        }
      },
      include: [{
        model: Property,
        as: 'property', // Must match your association alias
        where: { isRental: true },
        attributes: []
      }]
    });

    // 2. Filter to only rental payments (checking metadata)
    const rentalTransactions = allTransactions.filter(tx => 
      tx.metadata && tx.metadata.payment_type === 'rental'
    );

    // 3. Calculate weekly income
    const income_per_week = rentalTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.price || 0), 
      0
    );

    // 4. Get all-time rental income
    const allTimeTransactions = await Transaction.findAll({
      include: [{
        model: Property,
        as: 'property',
        where: { isRental: true },
        attributes: []
      }]
    });

    const allTimeRentalTransactions = allTimeTransactions.filter(tx => 
      tx.metadata && tx.metadata.payment_type === 'rental'
    );

    const total_income = allTimeRentalTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.price || 0), 
      0
    );

    // 5. Calculate expenses
    const expenses_per_week = expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount || 0), 
      0
    );

    // 6. Get historical expenses
    const total_expenses = (await BankOfHeaven.sum('expenses_per_week')) || 0;
    const current_balance = total_income - total_expenses;

    // 7. Update or create bank summary
    const [bankSummary] = await BankOfHeaven.upsert({
      current_balance,
      expenses_per_week,
      income_per_week,
      transactions: expenses
    }, {
      returning: true
    });

    // 8. Return success response
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
