// // controllers/AuthController.js 29th June, 2025 Originally working from day one
// const { User } = require('../models'); // Import User model
// const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
// const jwt = require('jsonwebtoken'); // Import JWT for token generation
// require('dotenv').config(); // Load environment variables

// // User login
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if user exists in the database
//     const user = await User.findOne({ where: { email } });

//     // If user is not found
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }

//     // Compare provided password with hashed password in the database
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }

//     // Generate a JWT token (including the user's role)
//     const token = jwt.sign(
//       { 
//         id: user.id, 
//         name: user.name, 
//         email: user.email,  // Ensure email is in the token for future use
//         role: user.role 
//       },
//       process.env.JWT_SECRET, // Use the secret from environment variables
//       { expiresIn: '1h' } // Token expiration time
//     );

//     // Return the token and user details (including role)
//     res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role // Include the user's role
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// // User signup
// const signup = async (req, res) => {
//   const { name, email, password, role } = req.body;

//   try {
//     // Check if the user already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email already in use' });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the user in the database
//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role
//     });

//     // Send the new user as a response
//     res.status(201).json(newUser);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// module.exports = {
//   login,
//   signup
// };

// controllers/AuthController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../models');
require('dotenv').config();

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived refresh token

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'name', 'email', 'role', 'password'] 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. Generate tokens with secure secrets
    const accessToken = jwt.sign(
      { 
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // 4. Store refresh token with transaction
    const transaction = await sequelize.transaction();
    try {
      const [affectedCount] = await User.update(
        { refresh_token: refreshToken },
        { 
          where: { id: user.id },
          transaction
        }
      );

      if (affectedCount === 0) {
        throw new Error('Failed to update refresh token');
      }

      await transaction.commit();
    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }

    // 5. Set secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      domain: process.env.COOKIE_DOMAIN || '.ajeku-mu.vercel.app',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // 6. Respond (remove password from response)
    const userData = user.get({ plain: true });
    delete userData.password;

    res.json({
      accessToken,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Add this new refresh token endpoint
const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return res.status(401).json({ 
      message: 'Refresh token missing',
      solution: 'Include in cookies or request body' 
    });
  }

  try {
    // Verify token structure first
    if (!token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)) {
      throw new Error('Malformed token');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({
      where: { id: decoded.id },
      attributes: ['id', 'refresh_token']
    });

    if (!user || user.refresh_token !== token) {
      console.warn(`Token mismatch for user ${decoded.id}`);
      return res.status(403).json({ 
        message: 'Invalid refresh token',
        solution: 'Please login again' 
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    console.error('Refresh token error:', error.message);
    
    const response = {
      message: 'Invalid refresh token',
      status: 'token_invalid'
    };

    if (error.name === 'TokenExpiredError') {
      response.message = 'Refresh token expired';
      response.status = 'token_expired';
    }

    res.status(403).json(response);
  }
};

const signup = async (req, res) => {
  // Keep your existing signup implementation exactly the same
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add logout functionality
const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(204).end();
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await User.update(
      { refresh_token: null },
      { where: { id: decoded.id } }
    );

    res.clearCookie('refreshToken');
    res.status(204).end();
  } catch (error) {
    res.status(204).end();
  }
};

module.exports = {
  login,
  signup,
  refreshToken,
  logout
};