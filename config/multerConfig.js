// const multer = require('multer');
// const cloudinary = require('./cloudinaryConfig'); // Import Cloudinary configuration

// console.log('Cloudinary:', cloudinary);  // Log to check if cloudinary is correctly imported

// const storage = multer.memoryStorage(); // Store the file in memory instead of disk
// const upload = multer({ storage: storage }).array('images', 15); // Upload up to 15 files with the field name 'images'

// async function uploadImagesToCloudinary(files) {
//     const uploadPromises = files.map(file =>
//         new Promise((resolve, reject) => {
//             // Log to check if cloudinary.uploader is available
//             console.log('Cloudinary uploader:', cloudinary.uploader);

//             const stream = cloudinary.uploader.upload_stream(
//                 { folder: 'property_images' }, 
//                 (error, result) => {
//                     if (error) {
//                         reject(error); // Reject the promise if an error occurs
//                     } else {
//                         resolve(result.secure_url); // Resolve with the secure URL of the uploaded image
//                     }
//                 }
//             );
            
//             stream.end(file.buffer); // End the stream with the image buffer
//         })
//     );

//     return Promise.all(uploadPromises);
// }

// module.exports = { upload, uploadImagesToCloudinary };


// 30/12/24

const multer = require('multer');
const cloudinary = require('./cloudinaryConfig');

console.log('Cloudinary:', cloudinary);  // Log to check if cloudinary is correctly imported

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage }).fields([
  { name: 'images', maxCount: 15 }, // Upload up to 15 images
  { name: 'documents', maxCount: 10 } // Upload up to 10 documents
]);

async function uploadImagesToCloudinary(files) {
    const uploadPromises = files.map(file =>
        new Promise((resolve, reject) => {
            console.log('Cloudinary uploader:', cloudinary.uploader);
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'property_images' }, 
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.secure_url);
                    }
                }
            );
            stream.end(file.buffer);
        })
    );

    return Promise.all(uploadPromises);
}

async function uploadDocumentsToCloudinary(files) {
    const uploadPromises = files.map(file =>
        new Promise((resolve, reject) => {
            console.log('Cloudinary uploader:', cloudinary.uploader);
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'property_documents' }, 
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({ url: result.secure_url, name: file.originalname });
                    }
                }
            );
            stream.end(file.buffer);
        })
    );

    return Promise.all(uploadPromises);
}

module.exports = { upload, uploadImagesToCloudinary, uploadDocumentsToCloudinary };