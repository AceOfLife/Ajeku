// controllers/BankOfHeavenController.js

const { BankOfHeaven } = require('../models');

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

// Create or update the financial data (Balance, Expenses, Income)
exports.updateBankSummary = async (req, res) => {
  try {
    const { current_balance, expenses_per_week, income_per_week, transactions } = req.body;

    let bankSummary = await BankOfHeaven.findOne();

    if (!bankSummary) {
      // Create a new Bank of Heaven entry if it doesn't exist
      bankSummary = await BankOfHeaven.create({
        current_balance,
        expenses_per_week,
        income_per_week,
        transactions,
      });
    } else {
      // Update existing Bank of Heaven entry
      await bankSummary.update({
        current_balance,
        expenses_per_week,
        income_per_week,
        transactions,
      });
    }

    res.status(200).json({ message: 'Bank summary updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating Bank of Heaven data' });
  }
};
