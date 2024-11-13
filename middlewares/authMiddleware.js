// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'your_very_secure_secret_key'; // Use environment variable for secret

module.exports = {
  authenticate: (req, res, next) => {
    const token = req.header('Authorization');
    console.log('Received token:', token); // Debugging log to check received token format
    console.log('JWT Secret:', jwtSecret); // Debugging log to confirm secret

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

  authorizeAdmin: (req, res, next) => {
    // Check if the authenticated user has an 'admin' role
    if (req.user && req.user.role === 'admin') {
      next(); // Proceed to the route
    } else {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  }
};
