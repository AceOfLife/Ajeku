// config/multerConfig.js
const multer = require('multer');
const path = require('path');

// Set up Multer to handle the file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'tmp/'); // Store files in the 'tmp/' folder
    },
    filename: (req, file, cb) => {
        // Give a unique name to each uploaded file (using timestamp)
        cb(null, Date.now() + path.extname(file.originalname)); // Adding extension
    },
});

const upload = multer({ storage: storage }).array('images', 10); // Upload up to 10 files with the field name 'images'

module.exports = upload;
