const multer = require('multer');
const cloudinary = require('./cloudinaryConfig');

console.log('Cloudinary:', cloudinary);

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).fields([
  { name: 'images', maxCount: 15 }, // File field for images
  { name: 'isInstallment', maxCount: 1 }, // Non-file field
  { name: 'duration', maxCount: 1 }, // Non-file field
  { name: 'name', maxCount: 1 },
  { name: 'size', maxCount: 1 },
  { name: 'price', maxCount: 1 },
  { name: 'agent_id', maxCount: 1 },
  { name: 'type', maxCount: 1 },
  { name: 'location', maxCount: 1 },
  { name: 'area', maxCount: 1 },
  { name: 'number_of_baths', maxCount: 1 },
  { name: 'number_of_rooms', maxCount: 1 },
  { name: 'address', maxCount: 1 },
  { name: 'description', maxCount: 1 },
  { name: 'payment_plan', maxCount: 1 },
  { name: 'year_built', maxCount: 1 },
  { name: 'special_features', maxCount: 1 },
  { name: 'appliances', maxCount: 1 },
  { name: 'features', maxCount: 1 },
  { name: 'interior_area', maxCount: 1 },
  { name: 'parking', maxCount: 1 },
  { name: 'material', maxCount: 1 },
  { name: 'date_on_market', maxCount: 1 },
  { name: 'ownership', maxCount: 1 },
  { name: 'kitchen', maxCount: 1 },
  { name: 'heating', maxCount: 1 },
  { name: 'cooling', maxCount: 1 },
  { name: 'type_and_style', maxCount: 1 },
  { name: 'lot', maxCount: 1 },
  { name: 'percentage', maxCount: 1 },
  { name: 'is_fractional', maxCount: 1 },
  { name: 'fractional_slots', maxCount: 1 },
  { name: 'isRental', maxCount: 1 }
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

module.exports = { upload, uploadImagesToCloudinary };