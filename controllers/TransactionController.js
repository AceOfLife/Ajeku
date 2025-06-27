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


// 27th June 2025

// exports.getRevenueStats = async (req, res) => {
//   try {
//     const { period } = req.query;

//     if (!["daily", "weekly", "monthly"].includes(period)) {
//       return res.status(400).json({ message: "Invalid period. Use daily, weekly, or monthly." });
//     }

//     let dateTrunc;
//     if (period === "daily") dateTrunc = "day";
//     else if (period === "weekly") dateTrunc = "week";
//     else dateTrunc = "month"; // Default to monthly

//     const revenueData = await Transaction.findAll({
//       attributes: [
//         [sequelize.fn("DATE_TRUNC", dateTrunc, sequelize.col("transaction_date")), "date"],
//         [sequelize.fn("SUM", sequelize.col("price")), "total_revenue"],
//       ],
//       where: { status: "success" },
//       group: [sequelize.fn("DATE_TRUNC", dateTrunc, sequelize.col("transaction_date"))],
//       order: [[sequelize.fn("DATE_TRUNC", dateTrunc, sequelize.col("transaction_date")), "ASC"]],
//     });

//     return res.json({ success: true, data: revenueData });
//   } catch (error) {
//     console.error("Error fetching revenue stats:", error);
//     res.status(500).json({ message: "Error fetching transaction", error });
//   }
// };

exports.getRevenueStats = async (req, res) => {
  try {
    const { Op } = require("sequelize");
    const { period } = req.query;
    const now = new Date();

    if (!["daily", "weekly", "monthly"].includes(period)) {
      return res.status(400).json({ message: "Invalid period. Use daily, weekly, or monthly." });
    }

    let data = [];

    if (period === "daily") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const transactions = await Transaction.findAll({
        where: {
          status: "success",
          transaction_date: { [Op.gte]: startOfMonth },
        },
        attributes: [
          [sequelize.fn("DATE", sequelize.col("transaction_date")), "date"],
          [sequelize.fn("SUM", sequelize.col("price")), "total"]
        ],
        group: [sequelize.fn("DATE", sequelize.col("transaction_date"))],
        raw: true,
      });

      const dateMap = {};
      transactions.forEach(t => {
        dateMap[new Date(t.date).getDate()] = parseFloat(t.total);
      });

      for (let day = 1; day <= daysInMonth; day++) {
        data.push(dateMap[day] || 0);
      }
    }

    else if (period === "weekly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const transactions = await Transaction.findAll({
        where: {
          status: "success",
          transaction_date: { [Op.gte]: startOfMonth },
        },
        attributes: [
          [sequelize.fn("DATE_TRUNC", "week", sequelize.col("transaction_date")), "week"],
          [sequelize.fn("SUM", sequelize.col("price")), "total"]
        ],
        group: [sequelize.fn("DATE_TRUNC", "week", sequelize.col("transaction_date"))],
        order: [[sequelize.fn("DATE_TRUNC", "week", sequelize.col("transaction_date")), "ASC"]],
        raw: true,
      });

      data = transactions.map(t => parseFloat(t.total));
    }

    else if (period === "monthly") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const transactions = await Transaction.findAll({
        where: {
          status: "success",
          transaction_date: { [Op.gte]: startOfYear },
        },
        attributes: [
          [sequelize.fn("DATE_TRUNC", "month", sequelize.col("transaction_date")), "month"],
          [sequelize.fn("SUM", sequelize.col("price")), "total"]
        ],
        group: [sequelize.fn("DATE_TRUNC", "month", sequelize.col("transaction_date"))],
        order: [[sequelize.fn("DATE_TRUNC", "month", sequelize.col("transaction_date")), "ASC"]],
        raw: true,
      });

      const monthMap = {};
      transactions.forEach(t => {
        const monthIndex = new Date(t.month).getMonth();
        monthMap[monthIndex] = parseFloat(t.total);
      });

      for (let m = 0; m <= now.getMonth(); m++) {
        data.push(monthMap[m] || 0);
      }
    }

    return res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    res.status(500).json({ message: "Error fetching transaction", error });
  }
};


// 27th June 2025

// exports.getCustomerMap = async (req, res) => {
//   try {
//     const { Op, fn, col } = require("sequelize");

//     const getCustomerCount = async (interval) => {
//       return await Transaction.count({
//         where: {
//           status: "success",
//           transaction_date: {
//             [Op.gte]: fn("date_trunc", interval, col("transaction_date")),
//           },
//         },
//         distinct: true,
//         col: "user_id",
//       });
//     };

//     const data = {
//       daily: await getCustomerCount("day"),
//       weekly: await getCustomerCount("week"),
//       monthly: await getCustomerCount("month"),
//     };

//     return res.json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching customer map:", error);
//     res.status(500).json({ message: "Error fetching customer map", error });
//   }
// };

// 19th June 2025
// exports.getRecentCustomers = async (req, res) => {
//   try {
//       const transactions = await Transaction.findAll({
//           where: { status: "success" },
//           include: [
//               {
//                   model: User,
//                   as: "user",
//                   attributes: ["id", "name", "email"],
//               },
//               {
//                   model: Property,
//                   as: "property",
//                   attributes: ["id", "name", "location"],
//               },
//           ],
//           order: [["createdAt", "DESC"]],
//           limit: 5,
//       });

//       return res.status(200).json({ success: true, data: transactions });
//   } catch (error) {
//       console.error("Error fetching recent customers:", error);
//       return res.status(500).json({ message: "Error fetching recent customers", error });
//   }
// };

exports.getCustomerMap = async (req, res) => {
  try {
    const { Op, fn, col, literal } = require("sequelize");
    const { Transaction } = require("../models");

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (June = 5)

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // === Daily Transactions for current month ===
    const daily = await Promise.all(
      Array.from({ length: daysInMonth }, async (_, i) => {
        const day = i + 1;
        const start = new Date(year, month, day);
        const end = new Date(year, month, day + 1);

        const count = await Transaction.count({
          where: {
            status: "success",
            transaction_date: {
              [Op.gte]: start,
              [Op.lt]: end
            }
          }
        });
        return count;
      })
    );

    // === Weekly Transactions for current month ===
    const firstDayOfMonth = new Date(year, month, 1);
    const weeksInMonth = Math.ceil((firstDayOfMonth.getDay() + daysInMonth) / 7);

    const weekly = await Promise.all(
      Array.from({ length: weeksInMonth }, async (_, i) => {
        const start = new Date(year, month, 1 + i * 7);
        const end = new Date(year, month, 1 + (i + 1) * 7);

        const count = await Transaction.count({
          where: {
            status: "success",
            transaction_date: {
              [Op.gte]: start,
              [Op.lt]: end
            }
          }
        });
        return count;
      })
    );

    // === Monthly Transactions for current year ===
    const monthly = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const start = new Date(year, i, 1);
        const end = new Date(year, i + 1, 1);

        const count = await Transaction.count({
          where: {
            status: "success",
            transaction_date: {
              [Op.gte]: start,
              [Op.lt]: end
            }
          }
        });
        return count;
      })
    );

    return res.json({ success: true, data: { daily, weekly, monthly: monthly.slice(0, month + 1) } });
  } catch (error) {
    console.error("Error fetching customer map:", error);
    res.status(500).json({ message: "Error fetching customer map", error });
  }
};

// 27th June 2025

// exports.getRecentCustomers = async (req, res) => {
//   try {
//     const twoWeeksAgo = new Date();
//     twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

//     const transactions = await Transaction.findAll({
//       where: {
//         status: "success",
//         createdAt: {
//           [Op.gte]: twoWeeksAgo,
//         },
//       },
//       include: [
//         {
//           model: User,
//           as: "user",
//           attributes: ["id", "name", "email"],
//         },
//         {
//           model: Property,
//           as: "property",
//           attributes: ["id", "name", "location"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//       limit: 10,
//     });

//     return res.status(200).json({ success: true, data: transactions });
//   } catch (error) {
//     console.error("Error fetching recent customers:", error);
//     return res.status(500).json({ message: "Error fetching recent customers", error });
//   }
// };

exports.getRecentCustomers = async (req, res) => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const transactions = await Transaction.findAll({
      where: {
        status: "success",
        createdAt: {
          [Op.gte]: twoWeeksAgo,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "role", "profileImage"], // Only essential user fields
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    // Extract only user data
    const users = transactions
      .map(t => t.user)
      .filter((u, index, self) => u && self.findIndex(x => x.name === u.name && x.role === u.role) === index); // Deduplicate

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching recent customers:", error);
    return res.status(500).json({ message: "Error fetching recent customers", error });
  }
};




// exports.getTransactionHistory = async (req, res) => {
//   try {
//     const transactions = await Transaction.findAll({
//       include: [
//         {
//           model: User,
//           as: "user",
//           attributes: ["id", "name", "email"], // Customer details
//         },
//         {
//           model: Property,
//           as: "property",
//           attributes: ["id", "name", "location", "price"], // Property details
//         },
//       ],
//       order: [["createdAt", "DESC"]], // Sort by latest transactions
//     });

//     return res.status(200).json({ success: true, transactions });
//   } catch (error) {
//     console.error("Error fetching transaction history:", error);
//     return res.status(500).json({ message: "Error fetching transaction history", error });
//   }
// };


// controllers/TransactionController.js
// const { Transaction, User, Property } = require('../models');

exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'user', // Buyer (User To)
          attributes: ['id', 'name']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'type', 'address', 'agent_id'],
          include: [
            {
              model: User,
              as: 'agent', // Seller (User From)
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      attributes: ['id', 'price', 'status', 'transaction_date'],
      order: [['transaction_date', 'DESC']]
    });

    const formattedTransactions = transactions.map(transaction => ({
      transactionId: transaction.id,
      userFrom: transaction.property?.agent?.name || 'Unknown',
      userTo: transaction.user?.name || 'Unknown',
      realtyType: transaction.property?.type || 'N/A',
      address: transaction.property?.address || 'N/A',
      date: transaction.transaction_date.toISOString().split('T')[0],
      status: transaction.status
    }));

    return res.status(200).json({ success: true, transactions: formattedTransactions });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return res.status(500).json({ message: "Error fetching transaction history", error });
  }
};


// Get transaction history for the currently logged-in user
exports.getUserTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from token by middleware

    const transactions = await Transaction.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["id", "name", "type", "address", "agent_id", "listed_by"],
          include: [
            {
              model: User,
              as: "agent",
              attributes: ["id", "name"]
            }
          ]
        }
      ],
      attributes: ["id", "price", "status", "transaction_date"],
      order: [["transaction_date", "DESC"]]
    });

    const formattedTransactions = transactions.map((transaction) => {
      const isAdmin = transaction.property?.listed_by?.toLowerCase() === "admin";
      const userFrom = isAdmin
        ? "Ajeku"
        : transaction.property?.agent?.name || "Unknown";

      return {
        transactionId: transaction.id,
        userFrom,
        propertyName: transaction.property?.name || "Unknown",
        realtyType: transaction.property?.type || "N/A",
        address: transaction.property?.address || "N/A",
        amountPaid: transaction.price,
        status: transaction.status,
        date: transaction.transaction_date.toISOString().split("T")[0],
      };
    });

    return res.status(200).json({ success: true, transactions: formattedTransactions });
  } catch (error) {
    console.error("Error fetching user transaction history:", error);
    return res.status(500).json({ message: "Error fetching transaction history", error });
  }
};


