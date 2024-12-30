const multer = require('multer');
const cloudinary = require('./cloudinaryConfig'); // Import Cloudinary configuration

// console.log('Cloudinary:', cloudinary);  // Log to check if cloudinary is correctly imported

const storage = multer.memoryStorage(); // Store the file in memory instead of disk
const upload = multer({ storage: storage }).array('images', 15); // Upload up to 15 files with the field name 'images'

// Upload configuration for documents (multiple documents)
const uploadDocuments = multer({ storage: storage }).array('documents', 10); // Allow up to 10 documents

async function uploadImagesToCloudinary(files) {
    const uploadPromises = files.map(file =>
        new Promise((resolve, reject) => {
            // Log to check if cloudinary.uploader is available
            console.log('Cloudinary uploader:', cloudinary.uploader);

            const stream = cloudinary.uploader.upload_stream(
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

    return Promise.all(uploadPromises);
}

async function uploadDocumentsToCloudinary(files) {
    const uploadPromises = files.map(file =>
        new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'property_documents' },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.secure_url); // Return the document's secure URL
                    }
                }
            );
            stream.end(file.buffer);
        })
    );

    return Promise.all(uploadPromises);
}

module.exports = { upload, uploadImagesToCloudinary, uploadDocuments, uploadDocumentsToCloudinary };
