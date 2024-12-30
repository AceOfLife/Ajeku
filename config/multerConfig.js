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


// 30/12/2024

// // config/multerConfig.js
// const multer = require('multer');
// const cloudinary = require('./cloudinaryConfig');  // Cloudinary config

// // Use memory storage to store files in memory before uploading them
// const storage = multer.memoryStorage();

// // Define upload configurations
// const upload = multer({ 
//   storage: storage 
// }).array('images', 15); // Allow uploading up to 15 images

// // Define upload configuration for documents
// const uploadDocuments = multer({ 
//   storage: storage 
// }).array('documents', 10); // Allow uploading up to 10 documents

// // Function to upload images to Cloudinary
// async function uploadImagesToCloudinary(files) {
//   const uploadPromises = files.map(file =>
//     new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { folder: 'property_images' }, // Folder in Cloudinary
//         (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(result.secure_url); // Return the Cloudinary URL
//           }
//         }
//       );
//       stream.end(file.buffer); // Upload image buffer to Cloudinary
//     })
//   );

//   return Promise.all(uploadPromises);
// }

// // Function to upload documents to Cloudinary
// async function uploadDocumentsToCloudinary(files) {
//   const uploadPromises = files.map(file =>
//     new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { folder: 'property_documents' }, // Folder in Cloudinary
//         (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(result.secure_url); // Return the Cloudinary URL
//           }
//         }
//       );
//       stream.end(file.buffer); // Upload document buffer to Cloudinary
//     })
//   );

//   return Promise.all(uploadPromises);
// }

// module.exports = { upload, uploadImagesToCloudinary, uploadDocuments, uploadDocumentsToCloudinary };



// New one

const multer = require('multer');
const cloudinary = require('./cloudinaryConfig');  // Cloudinary config

// Use memory storage to store files in memory before uploading them
const storage = multer.memoryStorage();

// Handle images (up to 15 files under 'images' field)
const upload = multer({ 
  storage: storage 
}).array('images', 15);  // Field name: 'images', allowing 15 files

// Handle documents (up to 10 files under 'documents' field)
const uploadDocuments = multer({ 
  storage: storage 
}).array('documents', 10);  // Field name: 'documents', allowing 10 files

// Function to upload images to Cloudinary
async function uploadImagesToCloudinary(files) {
  const uploadPromises = files.map(file =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'property_images' }, // Folder in Cloudinary
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url); // Return the Cloudinary URL
          }
        }
      );
      stream.end(file.buffer); // Upload image buffer to Cloudinary
    })
  );

  return Promise.all(uploadPromises);
}

// Function to upload documents to Cloudinary
async function uploadDocumentsToCloudinary(files) {
  const uploadPromises = files.map(file =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'property_documents' }, // Folder in Cloudinary
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url); // Return the Cloudinary URL
          }
        }
      );
      stream.end(file.buffer); // Upload document buffer to Cloudinary
    })
  );

  return Promise.all(uploadPromises);
}

module.exports = { upload, uploadImagesToCloudinary, uploadDocuments, uploadDocumentsToCloudinary };
