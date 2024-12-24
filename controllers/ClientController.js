// controllers/ClientController.js
const { Client } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for authentication

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving clients', error });
  }
};

// exports.createClient = async (req, res) => {
//   try {
//     const newClient = await Client.create(req.body);
//     res.status(201).json(newClient);
//   } catch (error) {
//     res.status(400).json({ message: 'Error creating client', error });
//   }
// };

// Register a new client
exports.createClient = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create the corresponding client entry
    const newClient = await Client.create({ user_id: newUser.id });

    // Optionally, generate a JWT token for the user
    const token = jwt.sign({ userId: newUser.id }, 'your_secret_key', { expiresIn: '1h' });

    res.status(201).json({ message: 'Client created successfully', token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating client', error: error.message });
  }
};

// exports.updateClient = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [updated] = await Client.update(req.body, { where: { id } });
    
//     if (updated) {
//       const updatedClient = await Client.findOne({ where: { id } });
//       res.status(200).json(updatedClient);
//     } else {
//       res.status(404).json({ message: 'Client not found' });
//     }
//   } catch (error) {
//     res.status(400).json({ message: 'Error updating client', error });
//   }
// };

// Update client profile
exports.updateProfile = async (req, res) => {
  const { userId } = req.body; // Assume userId is passed to identify the client
  const { name, location, number_of_rooms } = req.body;

  try {
    // Find the client by userId (assuming userId is available from a JWT token or session)
    const client = await Client.findOne({
      where: { user_id: userId },
      include: [{ model: User, as: 'user' }] // Include the User model to access user data
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update client and user profile
    const updatedUser = await client.user.update({ name });
    const updatedClient = await client.update({ location, number_of_rooms });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
      client: updatedClient,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Change client password
exports.changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    // Find the client by userId
    const client = await Client.findOne({
      where: { user_id: userId },
      include: [{ model: User, as: 'user' }]
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const user = client.user;

    // Check if old password matches
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};



exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Client.destroy({ where: { id } });
    
    if (deleted) {
      res.status(204).json({ message: 'Client deleted' });
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error });
  }
};
