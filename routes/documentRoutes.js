const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/documentController');
const { authenticate } = require('../middlewares/authMiddleware');
const upload = require('../config/multerConfig');

router.post('/upload', 
  authenticate,
  upload.array('documents', 2), // Max 2 files
  DocumentController.uploadDocuments
);

module.exports = router;