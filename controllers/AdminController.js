const { User } = require('../models'); // Assuming Sequelize is being used

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
    if (req.files && req.files.length > 0) {
      admin.profileImage = req.files[0].secure_url; // Assuming the image URL is returned by Cloudinary
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
