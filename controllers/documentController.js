const { UserDocument } = require('../models');
// const { uploadImagesToCloudinary } = require('../utils/cloudinary');
const {uploadImagesToCloudinary} = require('../config/multerConfig');

exports.uploadDocuments = async (req, res) => {
  try {
    const { documentType } = req.body;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No documents uploaded' 
      });
    }

    // Upload to Cloudinary
    const uploadedUrls = await uploadImagesToCloudinary(req.files);
    
    // Create document record
    const document = await UserDocument.create({
      userId,
      documentType,
      frontUrl: uploadedUrls[0],
      backUrl: uploadedUrls[1] || null,
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: 'Documents uploaded successfully',
      document: {
        id: document.id,
        type: document.documentType,
        frontUrl: document.frontUrl,
        backUrl: document.backUrl,
        status: document.status
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Document upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.verifyDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, adminNotes } = req.body;

    // Input validation
    const allowedStatuses = ['verified', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: verified, rejected'
      });
    }

    const document = await UserDocument.findByPk(documentId);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Update and save
    document.status = status;
    document.adminNotes = adminNotes || null;
    document.verifiedBy = req.user.id; // Track which admin verified
    document.verifiedAt = new Date();
    await document.save();

    return res.json({
      success: true,
      message: `Document ${status}`,
      document: {
        id: document.id,
        status: document.status,
        verifiedBy: document.verifiedBy,
        verifiedAt: document.verifiedAt
      }
    });

  } catch (error) {
    console.error('Admin document verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};