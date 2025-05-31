// // middlewares/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const jwtSecret = process.env.JWT_SECRET || 'your_very_secure_secret_key'; // Use environment variable for secret

// module.exports = {
//   authenticate: (req, res, next) => {
//     const token = req.header('Authorization');
//     console.log('Received token:', token); // Debugging log to check received token format
//     console.log('JWT Secret:', jwtSecret); // Debugging log to confirm secret

//     if (!token) {
//       return res.status(401).json({ message: 'Access denied. No token provided.' });
//     }

//     try {
//       // Check if the token includes the "Bearer" prefix
//       const formattedToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      
//       // Decode the token using the secret
//       const decoded = jwt.verify(formattedToken, jwtSecret);
//       console.log('Decoded token:', decoded); // Debugging log for decoded content
      
//       // Attach decoded user info to req.user
//       req.user = decoded;
//       next(); // Proceed to the next middleware or route handler
//     } catch (ex) {
//       console.error('Token verification failed:', ex.message); // Log error details for troubleshooting
//       return res.status(400).json({ message: 'Invalid token' });
//     }
//   },

//   authorizeAdmin: (req, res, next) => {
//     // Check if the authenticated user has an 'admin' role
//     if (req.user && req.user.role === 'admin') {
//       next(); // Proceed to the route
//     } else {
//       return res.status(403).json({ message: 'Access denied. Admins only.' });
//     }
//   }
// };


//Updated

// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'your_very_secure_secret_key'; // Use environment variable for secret

module.exports = {
  // Authentication middleware to verify JWT and attach user to the request
  authenticate: (req, res, next) => {
    const token = req.header('Authorization');
    console.log('Received token:', token); // Debugging log to check received token format

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      // Check if the token includes the "Bearer" prefix
      const formattedToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      
      // Decode the token using the secret
      const decoded = jwt.verify(formattedToken, jwtSecret);
      console.log('Decoded token:', decoded); // Debugging log for decoded content
      
      // Attach decoded user info to req.user
      req.user = decoded;
      next(); // Proceed to the next middleware or route handler
    } catch (ex) {
      console.error('Token verification failed:', ex.message); // Log error details for troubleshooting
      return res.status(400).json({ message: 'Invalid token' });
    }
  },

  // Authorization middleware for admin users only
  authorizeAdmin: (req, res, next) => {
    // Check if the authenticated user has an 'admin' role
    if (req.user && req.user.role === 'admin') {
      next(); // Proceed to the route
    } else {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  },

  // General role-based authorization middleware
  // Can be used for other roles, e.g., agent, client
  authorizeRole: (allowedRoles) => {
    return (req, res, next) => {
      if (req.user && allowedRoles.includes(req.user.role)) {
        next(); // Proceed to the route
      } else {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
    };
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
          attributes: ["id", "name"], // Property name
        },
      ],
      attributes: ["id", "price", "status", "createdAt"], // Required fields
      order: [["createdAt", "DESC"]],
    });

    const formattedTransactions = transactions.map((transaction) => ({
      transactionId: transaction.id,
      propertyName: transaction.property?.name || "Unknown",
      amountPaid: transaction.price,
      status: transaction.status,
      date: transaction.createdAt.toISOString().split("T")[0],
    }));

    return res.status(200).json({ success: true, transactions: formattedTransactions });
  } catch (error) {
    console.error("Error fetching user transaction history:", error);
    return res.status(500).json({ message: "Error fetching transaction history", error });
  }
};


