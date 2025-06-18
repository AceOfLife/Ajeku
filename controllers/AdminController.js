const { Property, User, Transaction } = require('../models'); 
const bcryptjs = require('bcryptjs');
const { uploadImagesToCloudinary } = require('../config/multerConfig');
const { Op } = require('sequelize');

const AdminController = {};

// ✅ Update Admin Profile
AdminController.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, address, contactNumber, city, state, gender } = req.body;
    const adminId = req.user.id;

    const admin = await User.findOne({ where: { id: adminId } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.firstName = firstName || admin.firstName;
    admin.lastName = lastName || admin.lastName;
    admin.email = email || admin.email;
    admin.address = address || admin.address;
    admin.contactNumber = contactNumber || admin.contactNumber;
    admin.city = city || admin.city;
    admin.state = state || admin.state;
    admin.gender = gender ? gender.toLowerCase() : admin.gender;

    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadImagesToCloudinary(req.files);
      const profileImageUrl = uploadedImages[0];
      admin.profileImage = profileImageUrl;
    }

    await admin.save();

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

// ✅ Change Admin Password
AdminController.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Old password, new password, and confirm password are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const admin = await User.findByPk(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    const isPasswordValid = await bcryptjs.compare(oldPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Old password is incorrect.' });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: 'Password successfully updated.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error while changing password.' });
  }
};

// ✅ Get Admin Profile
AdminController.getProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await User.findByPk(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

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

// ✅ Admin Dashboard Stats
AdminController.getAdminStats = async (req, res) => {
  try {
    const [totalProperties, totalRevenueData, totalAgents, totalCustomers] = await Promise.all([
      Property.count(),
      Transaction.sum('price', { where: { status: 'success' } }),
      User.count({ where: { role: 'agent' } }),
      User.count({ where: { role: 'client' } }),
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
};

module.exports = AdminController;
