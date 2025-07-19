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
  const { name, email, password, role = 'client' } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Check for existing user
    const existingUser = await User.findOne({ 
      where: { email },
      transaction
    });
    
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    }, { transaction });

    // For clients only
    if (role === 'client') {
      await Client.create({
        user_id: newUser.id,
        status: 'Unverified'
      }, { transaction });
    }

    // Create notifications
    const [userNotification, adminNotifications] = await Promise.all([
      // User notification
      Notification.create({
        user_id: newUser.id,
        title: role === 'client' ? 'Welcome!' : 'Account Created',
        message: role === 'client' 
          ? `Hi ${name}, your client account was created!` 
          : `Your ${role} account is ready`,
        type: 'user_signup',
        is_read: false
      }, { transaction }),

      // Admin notifications (only for clients)
      role === 'client' ? Notification.bulkCreate(
        (await User.findAll({ 
          where: { role: 'admin' },
          attributes: ['id'],
          transaction
        })).map(admin => ({
          user_id: admin.id,
          title: 'New Client Signup',
          message: `${name} (${email}) just registered`,
          type: 'admin_alert',
          is_read: false
        })),
        { transaction }
      ) : Promise.resolve([])
    ]);

    // Real-time notifications
    const io = req.app.get('socketio');
    if (io) {
      try {
        // To new user
        io.to(`user_${newUser.id}`).emit('new_notification', {
          id: userNotification.id,
          title: userNotification.title,
          message: userNotification.message,
          type: userNotification.type,
          created_at: userNotification.created_at
        });

        // To admins (if client)
        if (role === 'client') {
          adminNotifications.forEach(notif => {
            io.to(`user_${notif.user_id}`).emit('new_notification', {
              id: notif.id,
              title: notif.title,
              message: notif.message,
              type: notif.type,
              created_at: notif.created_at
            });
          });
        }
      } catch (socketError) {
        console.error('Socket emission error:', socketError);
      }
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
    console.error('Signup error:', {
      message: error.message,
      stack: error.stack,
      body: req.body
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