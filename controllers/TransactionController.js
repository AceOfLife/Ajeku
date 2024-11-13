// controllers/TransactionController.js
const { Transaction } = require('../models');

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving transactions', error });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const newTransaction = await Transaction.create(req.body);
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: 'Error creating transaction', error });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Transaction.update(req.body, { where: { id } });

    if (updated) {
      const updatedTransaction = await Transaction.findOne({ where: { id } });
      res.status(200).json(updatedTransaction);
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating transaction', error });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Transaction.destroy({ where: { id } });

    if (deleted) {
      res.status(204).json({ message: 'Transaction deleted' });
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
};
