// controllers/TransactionController.js  Initial one
// const { Transaction } = require('../models');

// exports.getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await Transaction.findAll();
//     res.status(200).json(transactions);
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving transactions', error });
//   }
// };

// exports.createTransaction = async (req, res) => {
//   try {
//     const newTransaction = await Transaction.create(req.body);
//     res.status(201).json(newTransaction);
//   } catch (error) {
//     res.status(400).json({ message: 'Error creating transaction', error });
//   }
// };

const { Transaction, Property, User, sequelize } = require('../models');
const { Op } = require("sequelize");


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



exports.createTransaction = async (req, res) => {
    try {
        const { user_id, property_id, amount, payment_type, status, reference } = req.body;

        // Validate user
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate property
        const property = await Property.findByPk(property_id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Create transaction record
        const transaction = await Transaction.create({
            user_id,
            property_id,
            amount,
            payment_type,
            status,
            reference
        });

        res.status(201).json({ message: "Transaction recorded successfully", transaction });
    } catch (error) {
        console.error("Transaction Creation Error:", error);
        res.status(500).json({ message: "Error creating transaction", error });
    }
};

exports.getAllTransactions = async (req, res) => {
  try {
      const transactions = await Transaction.findAll({
          include: [
              {
                  model: User,
                  as: 'user',  // ✅ Use the correct alias
                  attributes: ['id', 'name', 'email'], // Fetch only relevant fields
              },
              {
                  model: Property,
                  as: 'property',  // ✅ Use the correct alias
                  attributes: ['id', 'name', 'location', 'price'], // Fetch only relevant fields
              }
          ],
          order: [['createdAt', 'DESC']], // Order by latest transactions
      });

      return res.status(200).json({ transactions });
  } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: "Error fetching transactions", error });
  }
};

// Fetch a single transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
      const { id } = req.params; // Get the transaction ID from request parameters

      if (!id) {
          return res.status(400).json({ message: "Transaction ID is required" });
      }

      const transaction = await Transaction.findOne({
          where: { id },
          include: [
              {
                  model: User,
                  as: "user",
                  attributes: ["id", "name", "email"],
              },
              {
                  model: Property,
                  as: "property",
                  attributes: ["id", "name", "location", "price"],
              },
          ],
      });

      if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
      }

      return res.status(200).json({ transaction });
  } catch (error) {
      console.error("Error fetching transaction by ID:", error);
      return res.status(500).json({ message: "Error fetching transaction", error });
  }
};

// exports.getRevenueStats = async (req, res) => {
//   try {
//     const { period } = req.query; // "daily", "weekly", or "monthly"
    
//     let groupByFormat;
//     if (period === "daily") groupByFormat = "YYYY-MM-DD";
//     else if (period === "weekly") groupByFormat = "YYYY-WW"; // Year + Week number
//     else groupByFormat = "YYYY-MM"; // Default to monthly (YYYY-MM)

//     const revenueData = await Transaction.findAll({
//       attributes: [
//         [sequelize.fn("DATE_TRUNC", period, sequelize.col("transaction_date")), "date"],
//         [sequelize.fn("SUM", sequelize.col("price")), "total_revenue"],
//       ],
//       where: { status: "successful" },
//       group: [sequelize.fn("DATE_TRUNC", period, sequelize.col("transaction_date"))],
//       order: [["date", "ASC"]],
//     });

//     return res.json({ success: true, data: revenueData });
//   } catch (error) {
//     console.error("Error fetching revenue stats:", error);
//     res.status(500).json({ message: "Error fetching revenue stats", error });
//   }
// };


// For date 

exports.getRevenueStats = async (req, res) => {
  try {
    const { period } = req.query;

    if (!["daily", "weekly", "monthly"].includes(period)) {
      return res.status(400).json({ message: "Invalid period. Use daily, weekly, or monthly." });
    }

    let dateTrunc;
    if (period === "daily") dateTrunc = "day";
    else if (period === "weekly") dateTrunc = "week";
    else dateTrunc = "month"; // Default to monthly

    const revenueData = await Transaction.findAll({
      attributes: [
        [sequelize.fn("DATE_TRUNC", dateTrunc, sequelize.col("transaction_date")), "date"],
        [sequelize.fn("SUM", sequelize.col("price")), "total_revenue"],
      ],
      where: { status: "success" },
      group: [sequelize.fn("DATE_TRUNC", dateTrunc, sequelize.col("transaction_date"))],
      order: [[sequelize.fn("DATE_TRUNC", dateTrunc, sequelize.col("transaction_date")), "ASC"]],
    });

    return res.json({ success: true, data: revenueData });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    res.status(500).json({ message: "Error fetching transaction", error });
  }
};
