const multer = require('multer');
const cloudinary = require('./cloudinaryConfig'); // Import the cloudinary configuration
const { v2: cloudinaryUploader } = cloudinary; // Destructure the v2 uploader from the cloudinary instance

// Set up Multer to handle file uploads using memory storage
const storage = multer.memoryStorage(); // Store the file in memory instead of disk

const upload = multer({ storage: storage }).array('images', 15); // Upload up to 15 files with the field name 'images'

// Function to upload images to Cloudinary
async function uploadImagesToCloudinary(files) {
    const uploadPromises = files.map(file =>
        new Promise((resolve, reject) => {
            // Upload image from memory buffer to Cloudinary
            const stream = cloudinaryUploader.uploader.upload_stream(
                { folder: 'property_images' }, 
                (error, result) => {
                    if (error) {
                        reject(error); // Reject the promise if an error occurs
                    } else {
                        resolve(result.secure_url); // Resolve with the secure URL of the uploaded image
                    }
                }
            );
            
            stream.end(file.buffer); // End the stream with the image buffer
        })
    );

    // Wait for all images to be uploaded and return their URLs
    return Promise.all(uploadPromises);
}

module.exports = { upload, uploadImagesToCloudinary };
