const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/documentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { upload } = require('../config/multerConfig'); // Destructure the pre-configured middleware

// For document uploads (using the existing images upload config)
router.post('/upload', 
  authenticate,
  (req, res, next) => {
    // Temporarily change the field name expectation
    req.body.images = req.body.documents; // Map documents field to images
    next();
  },
  upload, // Use the pre-configured middleware
  (req, res, next) => {
    // Map back to expected field name if needed
    req.files = req.files.map(file => ({
      ...file,
      fieldname: 'documents' // Change fieldname back if your controller expects it
    }));
    next();
  },
  DocumentController.uploadDocuments
);