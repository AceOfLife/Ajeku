// controllers/ClientController.js
const { Client, User, UserDocument, Notification, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { upload, uploadImagesToCloudinary, uploadDocumentsToCloudinary } = require('../config/multerConfig');


// 30th June 2025
// exports.getAllClients = async (req, res) => {
//   try {
//     // Include the associated User model to fetch the user's profile fields
//     const clients = await Client.findAll({
//       include: [{
//         model: User,
//         as: 'user',  // as defined in the Client.associate method
//         attributes: ['firstName', 'lastName', 'email', 'address', 'contactNumber', 'city', 'state', 'gender', 'profileImage' ] // Include all new fields
//       }]
//     });

//     // Map over the clients to include user details in the response
//     const clientsWithUserDetails = clients.map(client => ({
//       id: client.id,
//       user_id: client.user_id,
//       firstName: client.user.firstName,
//       lastName: client.user.lastName,
//       email: client.user.email,
//       address: client.user.address,
//       contactNumber: client.user.contactNumber,
//       city: client.user.city,
//       state: client.user.state,
//       gender: client.user.gender,
//       profileImage: client.user.profileImage,
//       status: client.status,  // Add the status here
//       createdAt: client.createdAt,
//       updatedAt: client.updatedAt
//     }));

//     res.status(200).json(clientsWithUserDetails);
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving clients', error });
//   }
// };

exports.getAllClients = async (req, res) => {
  try {
    // 1. Fetch all clients with their associated user data
    const clients = await Client.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: [
          'firstName', 
          'lastName', 
          'email', 
          'address', 
          'contactNumber', 
          'city', 
          'state', 
          'gender', 
          'profileImage'
        ]
      }],
      order: [['createdAt', 'DESC']] // Newest clients first
    });

    // 2. Extract user IDs for document fetching
    const clientUserIds = clients.map(client => client.user_id);

    // 3. Fetch documents in a single optimized query
    let userDocuments = [];
    if (clientUserIds.length > 0) {
      try {
        const documentWhere = {
          userId: clientUserIds,
          ...(!req.user.isAdmin) // Only approved for non-admins
        };

        userDocuments = await UserDocument.findAll({
          where: documentWhere,
          attributes: [
            'id',
            'userId',
            'documentType',
            'frontUrl',
            'backUrl',
            'status',
            ...(req.user.isAdmin ? [
              'verifiedAt',
              'verifiedBy',
              'adminNotes'
            ] : [])
          ],
          include: req.user.isAdmin ? [{
            model: User,
            as: 'verifier',
            attributes: ['firstName', 'lastName']
          }] : []
        });
      } catch (docError) {
        console.error('Document fetch error:', docError);
        // Continue with empty documents rather than failing entire request
      }
    }

    // 4. Organize documents by user ID for efficient mapping
    const documentsByUserId = userDocuments.reduce((acc, doc) => {
      const docData = {
        id: doc.id,
        type: doc.documentType,
        frontUrl: doc.frontUrl,
        backUrl: doc.backUrl,
        status: doc.status,
        ...(req.user.isAdmin && {
          verifiedAt: doc.verifiedAt,
          verifiedBy: doc.verifier ? 
            `${doc.verifier.firstName} ${doc.verifier.lastName}` : 
            null,
          adminNotes: doc.adminNotes
        })
      };

      acc[doc.userId] = acc[doc.userId] || [];
      acc[doc.userId].push(docData);
      return acc;
    }, {});

    // 5. Construct final response with merged data
    const response = clients.map(client => {
      const user = client.user || {};
      return {
        id: client.id,
        user_id: client.user_id,
        status: client.status,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        // User details
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        contactNumber: user.contactNumber,
        city: user.city,
        state: user.state,
        gender: user.gender,
        profileImage: user.profileImage,
        // Documents
        documents: documentsByUserId[client.user_id] || []
      };
    });

    // 6. Send successful response
    res.status(200).json({
      success: true,
      count: response.length,
      data: response
    });

  } catch (error) {
    console.error('Client retrieval failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve clients',
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        ...(error.errors && { details: error.errors.map(e => e.message) })
      } : undefined
    });
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

//30/06/2025

exports.getClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    // 1. Fetch the client with user data
    const client = await Client.findByPk(clientId, {
      include: [{
        model: User,
        as: 'user',
        attributes: [
          'firstName', 'lastName', 'email',
          'address', 'contactNumber', 'city',
          'state', 'gender', 'profileImage'
        ]
      }]
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // 2. Fetch ALL documents for this client
    let userDocuments = [];
    try {
      userDocuments = await UserDocument.findAll({
        where: { userId: client.user_id },
        attributes: [
          'id',
          'documentType',
          'frontUrl',
          'backUrl',
          'status',
          ...(req.user.isAdmin ? [
            'verifiedAt',
            'verifiedBy',
            'adminNotes'
          ] : [])
        ],
        include: req.user.isAdmin ? [{
          model: User,
          as: 'verifier',
          attributes: ['firstName', 'lastName']
        }] : []
      });
    } catch (docError) {
      console.error('Document fetch error:', docError);
      // Continue with empty documents array
    }

    // 3. Format documents (maintaining same structure as getAllClients)
    const documents = userDocuments.map(doc => ({
      id: doc.id,
      type: doc.documentType,
      frontUrl: doc.frontUrl,
      backUrl: doc.backUrl,
      status: doc.status,
      ...(req.user.isAdmin && {
        verifiedAt: doc.verifiedAt,
        verifiedBy: doc.verifier ? 
          `${doc.verifier.firstName} ${doc.verifier.lastName}` : null,
        adminNotes: doc.adminNotes
      })
    }));

    // 4. Return response with exact same structure as before, plus documents
    res.status(200).json({
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
      updatedAt: client.updatedAt,
      documents: documents // Added this line while keeping all other fields identical
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving client', 
      error: error.message 
    });
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
    const io = req.app.get('socketio'); // Get Socket.io instance if available

    const transaction = await sequelize.transaction(); // Start transaction
    try {
      // Check if email already exists
      const existingUser = await User.findOne({ 
        where: { email },
        transaction 
      });
      if (existingUser) {
        await transaction.rollback();
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
      }, { transaction });

      // Create the client record
      const newClient = await Client.create({
        user_id: newUser.id,
      }, { transaction });

      // 1. Create client welcome notification (using 'system' type temporarily)
      const clientNotification = await Notification.create({
        user_id: newUser.id,
        title: 'Welcome!',
        message: `Hi ${name}, your client account was successfully created.`,
        type: 'system', // Using existing enum value
        is_read: false
      }, { transaction });

      // 2. Notify admins about new client (using existing 'admin_alert' type)
      const admins = await User.findAll({ 
        where: { role: 'admin' },
        transaction 
      });
      
      const adminNotifications = await Promise.all(
        admins.map(admin => 
          Notification.create({
            user_id: admin.id,
            title: 'New Client Registration',
            message: `New client: ${name} (${email})`,
            type: 'admin_alert', // Existing valid type
            is_read: false
          }, { transaction })
        )
      );

      // Commit transaction if everything succeeds
      await transaction.commit();

      // 3. Real-time notifications (only after successful commit)
      if (io) {
        // To client
        io.to(`user_${newUser.id}`).emit('new_notification', {
          event: 'system', // Matches the notification type
          data: clientNotification
        });

        // To admins
        adminNotifications.forEach(notification => {
          io.to(`user_${notification.user_id}`).emit('new_notification', {
            event: 'admin_alert',
            data: notification
          });
        });
      }

      // Return original response (unchanged structure)
      res.status(201).json({ 
        user: newUser, 
        client: newClient 
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Client creation error:', error);
      res.status(500).json({ 
        message: 'Error creating client',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
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