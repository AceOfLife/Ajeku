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
const NotificationHelper = require('../utils/notificationHelper');
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
  const io = req.app.get('socketio'); // Get Socket.io instance

  const transaction = await sequelize.transaction();
  try {
    // Existing validation
    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    }, { transaction });

    // Create client record if needed
    if (role === 'client') {
      await Client.create({
        user_id: newUser.id,
        status: 'Unverified'
      }, { transaction });
    }

    // 1. Create USER notification (same pattern as your working endpoint)
    const userNotification = await Notification.create({
      user_id: newUser.id,
      title: role === 'client' ? 'Welcome!' : 'Account Created',
      message: role === 'client' 
        ? `Hi ${name}, your client account has been created!` 
        : `Your ${role} account is ready`,
      type: 'user_signup',
      is_read: false
    }, { transaction });

    // 2. Create ADMIN notifications (only for client signups)
    if (role === 'client') {
      const admins = await User.findAll({ 
        where: { role: 'admin' },
        transaction
      });

      await Promise.all(admins.map(admin => 
        Notification.create({
          user_id: admin.id,
          title: 'New Client Registration',
          message: `New client: ${name} (${email})`,
          type: 'admin_alert',
          is_read: false
        }, { transaction })
      ));
    }

    await transaction.commit();

    // REAL-TIME NOTIFICATIONS (same pattern as your working endpoint)
    if (io) {
      // Send to new user
      io.to(`user_${newUser.id}`).emit('new_notification', {
        event: 'user_signup',
        data: userNotification
      });

      // Send to admins if client
      if (role === 'client') {
        const admins = await User.findAll({ where: { role: 'admin' } });
        admins.forEach(admin => {
          io.to(`user_${admin.id}`).emit('new_notification', {
            event: 'admin_alert',
            data: {
              title: 'New Client Registration',
              message: `New client: ${name} (${email})`
            }
          });
        });
      }
    }

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newEmail.email,
      role: newUser.role
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Server error during signup',
      error: error.message 
    });
  }
};

module.exports = {
  login,
  signup
};