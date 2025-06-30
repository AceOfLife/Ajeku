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
require('dotenv').config();

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived refresh token

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate access token (short-lived)
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

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token in database
    await User.update(
      { refresh_token: refreshToken },
      { where: { id: user.id } }
    );

    // Set secure HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add this new refresh token endpoint
const refreshToken = async (req, res) => {
  // Get token from either cookies or body
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ 
      message: 'Refresh token missing. Please provide it in cookies or request body.' 
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

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
    res.status(403).json({ message: 'Invalid refresh token' });
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