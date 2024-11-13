const { User } = require('../models');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Create the new user with the hashed password
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
};
