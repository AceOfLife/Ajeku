// controllers/BankOfHeavenController.js

// const { BankOfHeaven } = require('../models');

// // Fetch the current financial data
// exports.getBankSummary = async (req, res) => {
//   try {
//     const bankSummary = await BankOfHeaven.findOne();
//     if (!bankSummary) {
//       return res.status(404).json({ message: 'Bank of Heaven data not found' });
//     }
//     res.json(bankSummary);
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving Bank of Heaven data' });
//   }
// };

// // Create or update the financial data (Balance, Expenses, Income)
// exports.updateBankSummary = async (req, res) => {
//   try {
//     const { current_balance, expenses_per_week, income_per_week, transactions } = req.body;

//     let bankSummary = await BankOfHeaven.findOne();

//     if (!bankSummary) {
//       // Create a new Bank of Heaven entry if it doesn't exist
//       bankSummary = await BankOfHeaven.create({
//         current_balance,
//         expenses_per_week,
//         income_per_week,
//         transactions,
//       });
//     } else {
//       // Update existing Bank of Heaven entry
//       await bankSummary.update({
//         current_balance,
//         expenses_per_week,
//         income_per_week,
//         transactions,
//       });
//     }

//     res.status(200).json({ message: 'Bank summary updated successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating Bank of Heaven data' });
//   }
// };


const { BankOfHeaven, Transaction } = require('../models');
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

// Update Bank of Heaven data
exports.updateBankSummary = async (req, res) => {
  try {
    const { expenses } = req.body; // Only accepting expenses as input
    const now = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);

    // Calculate total income in the last 7 days
    const income_per_week = await Transaction.sum('price', {
      where: {
        transaction_date: {
          [Op.between]: [lastWeek, now],
        },
      },
    }) || 0;

    // Calculate total expenses in the last 7 days
    const expenses_per_week = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate total income from all transactions
    const total_income = await Transaction.sum('price') || 0;

    // Calculate total expenses from all recorded expenses
    const total_expenses = await BankOfHeaven.sum('expenses_per_week') || 0;

    // Calculate current balance
    const current_balance = total_income - total_expenses;

    let bankSummary = await BankOfHeaven.findOne();

    if (!bankSummary) {
      // Create a new record if it doesn't exist
      bankSummary = await BankOfHeaven.create({
        current_balance,
        expenses_per_week,
        income_per_week,
        transactions: expenses, // Store the new expenses
      });
    } else {
      // Update existing record
      await bankSummary.update({
        current_balance,
        expenses_per_week,
        income_per_week,
        transactions: expenses, // Store the new expenses
      });
    }

    res.status(200).json({ message: 'Bank summary updated successfully', bankSummary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Bank of Heaven data' });
  }
};
