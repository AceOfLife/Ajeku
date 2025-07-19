// // controllers/AuthController.js
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

const { User, Client, Notification, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id']
      }],
      raw: false
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.client && { clientId: user.client.id })
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.client && { clientId: user.client.id })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // [1] Check existing user
    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Email already in use' });
    }

    // [2] Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    }, { transaction });

    // [3] For clients only
    if (role === 'client') {
      await Client.create({
        user_id: newUser.id,
        status: 'Unverified'
      }, { transaction });
    }

    // [4] DEBUG: Verify connection
    console.log('Database connection:', sequelize.connectionManager.config);

    // [5] Create notifications with RAW query as last resort
    await sequelize.query(
      `INSERT INTO notifications 
       (user_id, title, message, type, is_read, created_at, updated_at) 
       VALUES (?, ?, ?, ?, false, NOW(), NOW())`,
      {
        replacements: [
          newUser.id,
          'Welcome!',
          `Hi ${name}, your account was created!`,
          'user_signup'
        ],
        transaction
      }
    );

    // [6] Create admin notifications
    if (role === 'client') {
      const [admins] = await sequelize.query(
        `SELECT id FROM "Users" WHERE role = 'admin'`,
        { transaction }
      );

      await Promise.all(admins.map(admin => 
        sequelize.query(
          `INSERT INTO notifications 
           (user_id, title, message, type, is_read, created_at, updated_at) 
           VALUES (?, ?, ?, ?, false, NOW(), NOW())`,
          {
            replacements: [
              admin.id,
              'New Client',
              `${name} (${email}) registered`,
              'admin_alert'
            ],
            transaction
          }
        )
      ));
    }

    await transaction.commit();
    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

  } catch (error) {
    await transaction.rollback();
    console.error('SIGNUP ERROR DETAILS:', {
      message: error.message,
      stack: error.stack,
      query: error.sql,
      parameters: error.parameters
    });
    res.status(500).json({ 
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

module.exports = {
  login,
  signup
};