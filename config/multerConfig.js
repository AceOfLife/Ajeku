const multer = require('multer');
const cloudinary = require('./cloudinaryConfig');
const { v2: cloudinaryUploader } = cloudinary; // Assuming you're using Cloudinary's v2 API

// Set up Multer to handle the file upload
const storage = multer.memoryStorage(); // Store the file in memory instead of disk

const upload = multer({ storage: storage }).array('images', 15); // Upload up to 10 files with the field name 'images'

// Add Cloudinary upload directly within the controller
async function uploadImagesToCloudinary(files) {
    const uploadPromises = files.map(file =>
        cloudinaryUploader.uploader.upload_stream({ folder: 'property_images' }, (error, result) => {
            if (error) throw error;
            return result.secure_url;
        })
    );

    files.forEach(file => {
        const stream = cloudinaryUploader.uploader.upload_stream({ folder: 'property_images' }, (error, result) => {
            if (error) throw error;
            return result.secure_url;
        });
        
        stream.end(file.buffer);  // Upload image from memory
    });

    // Returns URLs for each image uploaded
    return Promise.all(uploadPromises);
}

module.exports = { upload, uploadImagesToCloudinary };
