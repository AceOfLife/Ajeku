// controllers/ClientController.js
const { Client, User, UserDocument } = require('../models');
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
    // Include the associated User model to fetch the user's profile fields
    const clients = await Client.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'address', 'contactNumber', 'city', 'state', 'gender', 'profileImage']
      }]
    });

    // Get all client user IDs for batch document fetching
    const clientUserIds = clients.map(client => client.user_id);

    // Fetch all documents for these users in one query (if model exists)
    let userDocuments = [];
    if (UserDocument && clientUserIds.length > 0) {
      try {
        const whereCondition = {};
        
        if (!req.user.isAdmin) {
          whereCondition.status = 'APPROVED';
        }

        userDocuments = await UserDocument.findAll({
          where: {
            userId: clientUserIds,
            ...whereCondition
          },
          attributes: req.user.isAdmin 
            ? ['id', 'userId', 'type', 'url', 'status', 'verifiedAt', 'verifiedBy', 'adminNotes']
            : ['id', 'userId', 'type', 'url', 'status']
        });
      } catch (docError) {
        console.error('Note: Error fetching documents -', docError.message);
      }
    }

    // Group documents by user ID for efficient lookup
    const documentsByUserId = {};
    userDocuments.forEach(doc => {
      if (!documentsByUserId[doc.userId]) {
        documentsByUserId[doc.userId] = [];
      }
      const docData = {
        id: doc.id,
        type: doc.type,
        url: doc.url,
        status: doc.status
      };
      if (req.user.isAdmin) {
        docData.verifiedAt = doc.verifiedAt;
        docData.verifiedBy = doc.verifiedBy;
        docData.adminNotes = doc.adminNotes;
      }
      documentsByUserId[doc.userId].push(docData);
    });

    // Map over the clients to include user details and documents
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
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      documents: documentsByUserId[client.user_id] || [] // Add documents array
    }));

    res.status(200).json(clientsWithUserDetails);
  } catch (error) {
    console.error('Error retrieving clients:', error);
    res.status(500).json({ 
      message: 'Error retrieving clients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      updatedAt: client.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving client', error: error.message });
  }
};



// 07/07/
// exports.getClient = async (req, res) => {
//   try {
//     let clientId = req.params.id;
//     const userId = req.user.id;

//     if (!req.user.isAdmin) {
//       clientId = userId;
//     }

//     // First try to find by client ID (primary key)
//     let client = await Client.findOne({
//       where: { id: clientId },
//       include: [{
//         model: User,
//         as: 'user',
//         attributes: ['firstName', 'lastName', 'email', 'address', 'contactNumber', 'city', 'state', 'gender', 'profileImage']
//       }]
//     });

//     // If not found by ID, try by user_id
//     if (!client) {
//       client = await Client.findOne({
//         where: { user_id: clientId },
//         include: [{
//           model: User,
//           as: 'user',
//           attributes: ['firstName', 'lastName', 'email', 'address', 'contactNumber', 'city', 'state', 'gender', 'profileImage']
//         }]
//       });
//     }

//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }

//     // NEW: Fetch documents separately to avoid modifying original query
//     const documents = req.user.isAdmin 
//       ? await UserDocument.findAll({ where: { userId: client.user_id } })
//       : await UserDocument.findAll({ 
//           where: { 
//             userId: client.user_id,
//             status: 'APPROVED'
//           }
//         });

//     // Original response structure + NEW documents field
//     const response = {
//       // ALL ORIGINAL FIELDS (unchanged)
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
//       status: client.status,
//       createdAt: client.createdAt,
//       updatedAt: client.updatedAt,
      
//       // NEW FIELD (added at the end)
//       documents: documents.map(doc => ({
//         id: doc.id,
//         type: doc.type,
//         url: doc.url,
//         status: doc.status,
//         ...(req.user.isAdmin && { 
//           verifiedAt: doc.verifiedAt,
//           verifiedBy: doc.verifiedBy,
//           adminNotes: doc.adminNotes
//         })
//       }))
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error('Error retrieving client:', error);
//     res.status(500).json({ 
//       message: 'Error retrieving client',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
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
    const io = req.app.get('socketio');
    const { sequelize } = req.app.get('db'); // Get sequelize from app context
    const t = await sequelize.transaction();

    try {
      // 1. Check if email exists
      const existingUser = await db.User.findOne({ 
        where: { email },
        transaction: t 
      });
      
      if (existingUser) {
        await t.rollback();
        return res.status(400).json({ message: 'Email is already registered' });
      }

      // 2. Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Create user
      const newUser = await db.User.create({
        name,
        email,
        password: hashedPassword,
        role: 'client',
      }, { transaction: t });

      // 4. Create client record
      const newClient = await db.Client.create({
        user_id: newUser.id,
      }, { transaction: t });

      // 5. Create notifications
      const [clientNotification, adminNotifications] = await Promise.all([
        // Client notification
        db.Notification.create({
          user_id: newUser.id,
          title: 'Welcome!',
          message: `Hi ${name}, your client account was successfully created.`,
          type: 'user_signup',
          is_read: false
        }, { transaction: t }),
        
        // Admin notifications
        (async () => {
          const admins = await db.User.findAll({ 
            where: { role: 'admin' },
            transaction: t 
          });
          
          return admins.length > 0 
            ? Promise.all(admins.map(admin => 
                db.Notification.create({
                  user_id: admin.id,
                  title: 'New Client Registration',
                  message: `New client: ${name} (${email})`,
                  type: 'admin_alert',
                  is_read: false
                }, { transaction: t })
              ))
            : [];
        })()
      ]);

      // Commit transaction
      await t.commit();

      // 6. Real-time notifications
      if (io) {
        // To client
        io.to(`user_${newUser.id}`).emit('new_notification', {
          event: 'user_signup',
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

      // 7. Return response
      return res.status(201).json({ 
        success: true,
        user: _.pick(newUser, ['id', 'name', 'email', 'role']),
        client: _.pick(newClient, ['id', 'user_id', 'status']),
        notifications: {
          client: _.pick(clientNotification, ['id', 'title', 'type']),
          admins: adminNotifications.map(n => _.pick(n, ['id', 'title', 'type']))
        }
      });

    } catch (error) {
      await t.rollback();
      console.error('Client creation error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error.errors && { errors: error.errors.map(e => e.message) })
      });

      return res.status(500).json({ 
        success: false,
        message: 'Error creating client',
        ...(process.env.NODE_ENV === 'development' && {
          error: {
            name: error.name,
            message: error.message,
            ...(error.errors && { errors: error.errors.map(e => e.message) })
          }
        })
      });
    }
  }
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