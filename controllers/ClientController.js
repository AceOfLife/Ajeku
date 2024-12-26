// controllers/ClientController.js
const { Client, User } = require('../models');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// exports.getAllClients = async (req, res) => {
//   try {
//     const clients = await Client.findAll();
//     res.status(200).json(clients);
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving clients', error });
//   }
// };

exports.getAllClients = async (req, res) => {
  try {
    // Include the associated User model to fetch name and email
    const clients = await Client.findAll({
      include: [{
        model: User,
        as: 'user',  // as defined in the Client.associate method
        attributes: ['name', 'email'] // Only fetch name and email from User
      }]
    });

    // Map over the clients to include user details in the response
    const clientsWithUserDetails = clients.map(client => ({
      id: client.id,
      user_id: client.user_id,
      name: client.user.name,
      email: client.user.email,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    }));

    res.status(200).json(clientsWithUserDetails);
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

exports.createClient = [
  // Validation middleware
  check('name').notEmpty().withMessage('Name is required'),
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

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Client.update(req.body, { where: { id } });
    
    if (updated) {
      const updatedClient = await Client.findOne({ where: { id } });
      res.status(200).json(updatedClient);
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating client', error });
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
