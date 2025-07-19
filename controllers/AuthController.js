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

// const signup = async (req, res) => {
//   const { name, email, password, role } = req.body;

//   try {
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email already in use' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     if (role === 'client') {
//       const newUser = await User.create({
//         name,
//         email,
//         password: hashedPassword,
//         role
//       });

//       await Client.create({
//         user_id: newUser.id,
//         status: 'Unverified'
//       });

//       return res.status(201).json({
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role
//       });
//     }

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role
//     });

//     res.status(201).json({
//       id: newUser.id,
//       name: newUser.name,
//       email: newUser.email,
//       role: newUser.role
//     });
//   } catch (error) {
//     console.error('Signup error:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// Added notification

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const transaction = await sequelize.transaction();

  try {
    console.log('Starting signup transaction for', email);
    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'client') {
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      }, { transaction });

      await Client.create({
        user_id: newUser.id,
        status: 'Unverified'
      }, { transaction });

      console.log('Attempting user notification for', newUser.id);
      await NotificationHelper.createNotification({
        userId: newUser.id,
        title: 'Welcome!',
        message: `Hi ${name}, your client account has been created successfully!`,
        type: 'user_signup'
      }, transaction);
      console.log('User notification created for', newUser.id);

      console.log('Attempting admin notifications for', newUser.id);
      await NotificationHelper.notifyAdmins({
        title: 'New Client Registration',
        message: `New client signed up: ${email}`,
        type: 'admin_alert',
        relatedEntityId: newUser.id
      }, transaction);
      console.log('Admin notifications created for', newUser.id);

      await transaction.commit();
      console.log('Transaction committed for', newUser.id);

      const io = req.app.get('socketio');
      if (io) {
        const admins = await User.findAll({ where: { role: 'admin' } });
        io.to(`user_${newUser.id}`).emit('new_notification', {
          event: 'user_signup',
          data: { userId: newUser.id, email: newUser.email, name: newUser.name }
        });
        admins.forEach(admin => {
          io.to(`user_${admin.id}`).emit('new_notification', {
            event: 'new_client_signup',
            data: { userId: newUser.id, email: newUser.email, name: newUser.name }
          });
        });
      }

      return res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    }, { transaction });

    console.log('Attempting notification for non-client', newUser.id);
    await NotificationHelper.createNotification({
      userId: newUser.id,
      title: 'Account Created',
      message: `Your ${role} account is ready`,
      type: 'user_signup'
    }, transaction);
    console.log('Notification created for non-client', newUser.id);

    await transaction.commit();
    console.log('Transaction committed for', newUser.id);

    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${newUser.id}`).emit('new_notification', {
        event: 'user_signup',
        data: { userId: newUser.id, email: newUser.email, name: newUser.name }
      });
    }

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Signup error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  login,
  signup
};