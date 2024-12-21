const multer = require('multer');
const cloudinary = require('./cloudinaryConfig'); // Import the entire cloudinary config
// No need for destructuring since cloudinary.uploader is already available directly

// Set up Multer to handle file uploads using memory storage
const storage = multer.memoryStorage(); // Store the file in memory instead of disk

const upload = multer({ storage: storage }).array('images', 15); // Upload up to 15 files with the field name 'images'

// Function to upload images to Cloudinary
async function uploadImagesToCloudinary(files) {
    const uploadPromises = files.map(file =>
        new Promise((resolve, reject) => {
            // Upload image from memory buffer to Cloudinary
            const stream = cloudinary.uploader.upload_stream( // Directly use cloudinary.uploader
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
