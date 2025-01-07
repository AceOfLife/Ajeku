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
        attributes: ['firstName', 'lastName', 'email', 'address', 'contactNumber', 'city', 'state', 'gender', 'profileImage' ] // Include all new fields
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
      gender: client.user.gender,
      profileImage: client.user.profileImage,
      status: client.status,  // Add the status here
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    }));

    res.status(200).json(clientsWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving clients', error });
  }
};


// exports.getClient = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the client by ID, including the associated user details
//     const client = await Client.findOne({
//       where: { id },
//       include: [{
//         model: User,
//         as: 'user',
//         attributes: ['firstName', 'lastName', 'email', 'address', 'contactNumber', 'city', 'state'] // Fetching all the new fields from User
//       }]
//     });

//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }

//     // Prepare the response, including the client's user details
//     const clientWithUserDetails = {
//       id: client.id,
//       user_id: client.user_id,
//       firstName: client.user.firstName,
//       lastName: client.user.lastName,
//       email: client.user.email,
//       address: client.user.address,
//       contactNumber: client.user.contactNumber,
//       city: client.user.city,
//       state: client.user.state,
//       status: client.status,  // Add the status here
//       createdAt: client.createdAt,
//       updatedAt: client.updatedAt
//     };

//     res.status(200).json(clientWithUserDetails);
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving client', error });
//   }
// };

// 04/01/2025

exports.getClient = async (req, res) => {
  try {
    let clientId = req.params.id; // Extract client ID from URL
    const userId = req.user.id;   // Assuming you're using a session or token to store the logged-in user's info
    
    // If the user is an admin, they can fetch any client's profile by ID
    // If not, we'll automatically fetch their own profile based on their user ID
    if (!req.user.isAdmin) {
      // If the user is not an admin, set clientId to their own user_id (for self-profile)
      clientId = userId;
    }

    // Find the client by ID, including the associated user details
    const client = await Client.findOne({
      where: { user_id: clientId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'address', 'contactNumber', 'city', 'state', 'gender', 'profileImage'] // Fetching user details
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
      gender: client.user.gender,
      profileImage: client.user.profileImage,
      status: client.status,
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

// exports.updateProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { firstName, lastName, email, address, contactNumber, city, state } = req.body;

//     // Find the user associated with the client
//     const client = await Client.findOne({
//       where: { id },
//       include: [{
//         model: User,
//         as: 'user',
//       }],
//     });

//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }

//     const user = client.user;

//     // If profile image is uploaded, handle the file and save the URL
//     if (req.files && req.files.length > 0) {
//       // Upload images to Cloudinary and retrieve their secure URLs
//       const uploadedImages = await uploadImagesToCloudinary(req.files);
//       const profileImageUrl = uploadedImages[0]; // Assuming only one image for profile
//       user.profileImage = profileImageUrl;  // Save the Cloudinary URL to the profileImage field
//     }

//     // Update the user's profile
//     user.firstName = firstName || user.firstName;
//     user.lastName = lastName || user.lastName;
//     user.email = email || user.email;
//     user.address = address || user.address;
//     user.contactNumber = contactNumber || user.contactNumber;
//     user.city = city || user.city;
//     user.state = state || user.state;

//     await user.save();

//     res.status(200).json({
//       message: 'Profile updated successfully',
//       user: {
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         address: user.address,
//         contactNumber: user.contactNumber,
//         city: user.city,
//         state: user.state,
//         profileImage: user.profileImage,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating profile', error });
//   }
// };

// 06/01/2025

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, address, contactNumber, city, state, gender } = req.body;

    // Find the client associated with the authenticated user (using req.user.id)
    const client = await Client.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: User,
        as: 'user',
      }],
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const user = client.user;

    console.log('Uploaded files:', req.files);

    // If profile image is uploaded, handle the file and save the URL
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadImagesToCloudinary(req.files);
      const profileImageUrl = uploadedImages[0]; // Assuming only one image for profile
      user.profileImage = profileImageUrl; // Save the Cloudinary URL to the profileImage field
    }

    // Update the user's profile fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.address = address || user.address;
    user.contactNumber = contactNumber || user.contactNumber;
    user.city = city || user.city;
    user.state = state || user.state;
    user.gender = gender || user.gender;

    await user.save(); // Save the updated user details

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
        gender: user.gender,
        profileImage: user.profileImage, // Return the Cloudinary image URL
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error); 
    res.status(500).json({ message: 'Error updating profile', error: error.message });
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


// Change password

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Check if both current and new passwords are provided
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'Current password, new password, and confirm new password are required' });
    }

    // Ensure the new password and confirm new password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New password and confirm new password must match' });
    }

    // Validate the new password (you can add more complex validations here if needed)
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find the user by their ID (authenticated user)
    const user = await User.findByPk(req.user.id);  // Assuming req.user contains the authenticated user's ID

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);  // Assuming password is stored in hashed form
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10);  // Salt rounds: 10 is commonly used

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
  }
};