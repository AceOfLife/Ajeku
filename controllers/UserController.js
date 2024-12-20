// const { User } = require('../models');
// // const bcrypt = require('bcrypt');
// const bcrypt = require('bcryptjs');

// exports.createUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // 1. Hash the password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 2. Create the new user with the hashed password
//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role
//     });

//     res.status(201).json(newUser);
//   } catch (error) {
//     res.status(400).json({ message: 'Error creating user', error });
//   }
// };


// User controller with edit

// const { User } = require('../models');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const { sendEmail } = require('../config/emailService'); // Assuming email service setup

// // Create user (Sign Up)
// exports.createUser = async (req, res) => {
//   const { name, email, password, role } = req.body;

//   try {
//     // Hash the password before saving it
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the user
//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || 'client', // Default role is 'client'
//     });

//     // Generate JWT token
//     const token = jwt.sign({ userId: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.status(201).json({
//       message: 'User created successfully',
//       token,
//       user: newUser,
//     });
//   } catch (error) {
//     res.status(400).json({ message: 'Error creating user', error });
//   }
// };

// // Login user
// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Find user by email
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Compare the password with the stored hash
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error logging in', error });
//   }
// };

// // Edit profile (Update user details)
// exports.editProfile = async (req, res) => {
//   const userId = req.user.userId; // JWT userId
//   const { name, email } = req.body;

//   try {
//     // Find user by ID
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Update user details
//     user.name = name || user.name;
//     user.email = email || user.email;
//     await user.save();

//     res.status(200).json({
//       message: 'Profile updated successfully',
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating profile', error });
//   }
// };

// // Change password
// exports.changePassword = async (req, res) => {
//   const userId = req.user.userId; // JWT userId
//   const { oldPassword, newPassword } = req.body;

//   try {
//     // Find user by ID
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Compare old password
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Incorrect old password' });
//     }

//     // Hash the new password and update it
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({
//       message: 'Password changed successfully',
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error changing password', error });
//   }
// };

// // Forgot password (Send reset token)
// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     // Find user by email
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(400).json({ message: 'Email not found' });
//     }

//     // Generate password reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetTokenExpiration = Date.now() + 3600000; // 1 hour expiry

//     // Save the reset token and expiration time
//     user.resetToken = resetToken;
//     user.resetTokenExpiration = resetTokenExpiration;
//     await user.save();

//     // Send password reset email with the reset link
//     const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
//     await sendEmail({
//       to: email,
//       subject: 'Reset your password',
//       text: `Click the following link to reset your password: ${resetLink}`,
//     });

//     res.status(200).json({ message: 'Password reset email sent' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error sending reset email', error });
//   }
// };

// // Reset password (using reset token)
// exports.resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     // Find user by reset token and check expiration
//     const user = await User.findOne({ where: { resetToken: token, resetTokenExpiration: { [Op.gt]: Date.now() } } });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     // Hash the new password and save it
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     user.resetToken = null; // Clear the reset token
//     user.resetTokenExpiration = null; // Clear the expiration
//     await user.save();

//     res.status(200).json({ message: 'Password reset successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error resetting password', error });
//   }
// };


//User management 20/12

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../config/emailService'); // Assuming email service setup

// Create user (Sign Up)
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'client', // Default role is 'client'
    });

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: newUser,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
};

// Edit profile (Update user details)
exports.editProfile = async (req, res) => {
  const userId = req.user.userId; // JWT userId
  const { name, email } = req.body;

  try {
    // Find user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const userId = req.user.userId; // JWT userId
  const { oldPassword, newPassword } = req.body;

  try {
    // Find user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    // Hash the new password and update it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
  }
};

// Forgot password (Send reset token)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour expiry

    // Save the reset token and expiration time
    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    // Send password reset email with the reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      text: `Click the following link to reset your password: ${resetLink}`,
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset email', error });
  }
};

// Reset password (using reset token)
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user by reset token and check expiration
    const user = await User.findOne({ where: { resetToken: token, resetTokenExpiration: { [Op.gt]: Date.now() } } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null; // Clear the reset token
    user.resetTokenExpiration = null; // Clear the expiration
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
};
