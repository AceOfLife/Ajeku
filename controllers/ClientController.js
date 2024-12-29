// controllers/ClientController.js
const { Client, User } = require('../models');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

exports.getAllClients = async (req, res) => {
  try {
    // Include the associated User model to fetch the user's profile fields
    const clients = await Client.findAll({
      include: [{
        model: User,
        as: 'user',  // as defined in the Client.associate method
        attributes: ['firstName', 'lastName', 'email', 'address', 'contactNumber', 'city', 'state'] // Include all new fields
      }]
    });

    // Map over the clients to include user details in the response
    const clientsWithUserDetails = clients.map(client => ({
      id: client.id,
      user_id: client.user_id,
      firstName: client.user.firstName,
      lastName: client.user.lastName,
      email: client.user.email,
      address: client.user.address,
      contactNumber: client.user.contactNumber,
      city: client.user.city,
      state: client.user.state,
      status: client.status,  // Add the status here
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    }));

    res.status(200).json(clientsWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving clients', error });
  }
};


exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the client by ID, including the associated user details
    const client = await Client.findOne({
      where: { id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'address', 'contactNumber', 'city', 'state'] // Fetching all the new fields from User
      }]
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Prepare the response, including the client's user details
    const clientWithUserDetails = {
      id: client.id,
      user_id: client.user_id,
      firstName: client.user.firstName,
      lastName: client.user.lastName,
      email: client.user.email,
      address: client.user.address,
      contactNumber: client.user.contactNumber,
      city: client.user.city,
      state: client.user.state,
      status: client.status,  // Add the status here
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    };

    res.status(200).json(clientWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving client', error });
  }
};

exports.createClient = [
  // Validation middleware
  // check('name').notEmpty().withMessage('Name is required'),
  check('firstName').notEmpty().withMessage('First name is required'),
  check('lastName').notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Enter a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'client',
      });

      // Create the client record using the new user's ID
      const newClient = await Client.create({
        user_id: newUser.id,
      });

      res.status(201).json({ user: newUser, client: newClient });
    } catch (error) {
      res.status(500).json({ message: 'Error creating client', error });
    }
  },
];

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

// 29/12/2024

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, address, contactNumber, city, state } = req.body;

    // Find the user associated with the client
    const client = await Client.findOne({
      where: { id },
      include: [{
        model: User,
        as: 'user',
      }],
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const user = client.user;

    // Update the user's profile
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.address = address || user.address;
    user.contactNumber = contactNumber || user.contactNumber;
    user.city = city || user.city;
    user.state = state || user.state;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        contactNumber: user.contactNumber,
        city: user.city,
        state: user.state,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

// controllers/ClientController.js
exports.updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // New status value from request body

    // Check if the user is an admin (this should be done in middleware, but also ensure here)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, only admins can change the status' });
    }

    // Validate the status value
    if (status !== 'Unverified' && status !== 'Verified') {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find the client by ID and update the status
    const client = await Client.findOne({
      where: { id },
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.status = status;
    await client.save();

    res.status(200).json({
      message: 'Client status updated successfully',
      client: {
        id: client.id,
        status: client.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating client status', error });
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
