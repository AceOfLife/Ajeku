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

// exports.updateTransaction = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [updated] = await Transaction.update(req.body, { where: { id } });

//     if (updated) {
//       const updatedTransaction = await Transaction.findOne({ where: { id } });
//       res.status(200).json(updatedTransaction);
//     } else {
//       res.status(404).json({ message: 'Transaction not found' });
//     }
//   } catch (error) {
//     res.status(400).json({ message: 'Error updating transaction', error });
//   }
// };

// exports.deleteTransaction = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Transaction.destroy({ where: { id } });

//     if (deleted) {
//       res.status(204).json({ message: 'Transaction deleted' });
//     } else {
//       res.status(404).json({ message: 'Transaction not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting transaction', error });
//   }
// };


// exports.verifyPayment = async (req, res) => {
//   try {
//       const { reference } = req.query;

//       if (!reference) {
//           return res.status(400).json({ message: "Transaction reference is required" });
//       }

//       // Verify transaction from PayStack
//       const response = await axios.get(
//           `https://api.paystack.co/transaction/verify/${reference}`,
//           {
//               headers: {
//                   Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//               }
//           }
//       );

//       const paymentData = response.data.data;

//       if (paymentData.status !== "success") {
//           return res.status(400).json({ message: "Payment verification failed" });
//       }

//       // Extract metadata
//       const { user_id, property_id, payment_type } = paymentData.metadata;

//       // Create transaction in database
//       const transaction = await Transaction.create({
//           client_id: user_id,
//           property_id: property_id,
//           price: paymentData.amount / 100, // Convert from kobo
//           status: "successful",
//           transaction_date: new Date(),
//       });

//       res.status(200).json({ message: "Payment verified and transaction recorded", transaction });
//   } catch (error) {
//       console.error("Payment Verification Error:", error.response ? error.response.data : error.message);
//       res.status(500).json({ message: 'Error verifying payment', error });
//   }
// };


const { Transaction, Property, User } = require('../models');

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
            include: [{ model: Property }, { model: User }]
        });
        res.status(200).json({ transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Error fetching transactions", error });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByPk(id, {
            include: [{ model: Property }, { model: User }]
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ transaction });
    } catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({ message: "Error fetching transaction", error });
    }
};
