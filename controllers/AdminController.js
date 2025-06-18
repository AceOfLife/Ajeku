const { Property, User, Transaction } = require('../models'); 
const bcryptjs = require('bcryptjs');
const { upload, uploadImagesToCloudinary, uploadDocumentsToCloudinary } = require('../config/multerConfig');
const { Op } = require('sequelize');


exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, address, contactNumber, city, state, gender } = req.body;
    const adminId = req.user.id; // Get the logged-in admin's ID from the authenticated user

    // Find the admin's user record
    const admin = await User.findOne({ where: { id: adminId } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update admin profile fields
    admin.firstName = firstName || admin.firstName;
    admin.lastName = lastName || admin.lastName;
    admin.email = email || admin.email;
    admin.address = address || admin.address;
    admin.contactNumber = contactNumber || admin.contactNumber;
    admin.city = city || admin.city;
    admin.state = state || admin.state;
    admin.gender = gender ? gender.toLowerCase() : admin.gender; // Ensure gender is lowercase

    // If there is a new profile image uploaded, update it
    // if (req.files && req.files.length > 0) {
    //   admin.profileImage = req.files[0].secure_url; // Assuming the image URL is returned by Cloudinary
    // }

    // If profile image is uploaded, handle the file and save the URL
    if (req.files && req.files.length > 0) {
        const uploadedImages = await uploadImagesToCloudinary(req.files);
        const profileImageUrl = uploadedImages[0]; // Assuming only one image for profile
        admin.profileImage = profileImageUrl; // Save the Cloudinary URL to the profileImage field
      }

    await admin.save(); // Save the updated admin record

    res.status(200).json({
      message: 'Admin profile updated successfully',
      user: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        address: admin.address,
        contactNumber: admin.contactNumber,
        city: admin.city,
        state: admin.state,
        gender: admin.gender,
        profileImage: admin.profileImage,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error });
  }
};


// Function to change the admin password
exports.changePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
  
      // Ensure that all required fields are provided
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Old password, new password, and confirm password are required.' });
      }
  
      // Check if the new password and confirm password match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New password and confirm password do not match.' });
      }
  
      // Validate that the new password meets your criteria (e.g., length)
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
      }
  
      // Get the admin user from the database (assuming `req.user.id` holds the logged-in admin's ID)
      const admin = await User.findByPk(req.user.id);
  
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found.' });
      }

      
  
      // Check if the old password matches the stored hashed password in the database
      const isPasswordValid = await bcryptjs.compare(oldPassword, admin.password); // Assuming password is hashed in the DB
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Old password is incorrect.' });
      }
  
      // Hash the new password before saving it
      const hashedPassword = await bcryptjs.hash(newPassword, 10); // Salt rounds: 10 is commonly used
  
      // Update the admin's password in the database
      admin.password = hashedPassword;
      await admin.save();
  
      res.status(200).json({ message: 'Password successfully updated.' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Server error while changing password.' });
    }
  };


// Get admin profile 

exports.getProfile = async (req, res) => {
    try {
      // Get the logged-in user's ID from the request
      const adminId = req.user.id;
  
      // Fetch the admin's profile information from the database
      const admin = await User.findByPk(adminId);
  
      // If no admin is found, return a 404 error
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Return the admin profile information (excluding sensitive information like password)
      const adminProfile = {
        id: admin.id,
        name: admin.name,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        address: admin.address,
        contactNumber: admin.contactNumber,
        city: admin.city,
        state: admin.state,
        gender: admin.gender,
        profileImage: admin.profileImage,
      };
  
      res.status(200).json({ admin: adminProfile });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Error fetching profile', error });
    }
  };

module.exports = {
  async getAdminStats(req, res) {
    try {
      const [totalProperties, totalRevenueData, totalAgents, totalCustomers] = await Promise.all([
        Property.count(),

        Transaction.sum('price', {
          where: {
            status: 'success',
          },
        }),

        User.count({
          where: {
            role: 'agent',
          },
        }),

        User.count({
          where: {
            role: 'client',
          },
        }),
      ]);

      res.status(200).json({
        totalProperties,
        totalRevenue: totalRevenueData || 0,
        totalAgents,
        totalCustomers,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch admin statistics', error });
    }
  },
};
