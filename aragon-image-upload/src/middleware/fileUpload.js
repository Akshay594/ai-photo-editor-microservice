const multer = require('multer');
const path = require('path');
const config = require('../../config');

// Set up multer memory storage
const storage = multer.memoryStorage();

// Comprehensive file filter to validate file types
const fileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedMimeTypes = config.imageValidation.allowedTypes;
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  
  // Handle HEIC files which might not have correct MIME types in all browsers
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.heic' || ext === '.heif') {
    // Manually set mimetype for HEIC files
    file.mimetype = 'image/heic';
    cb(null, true);
    return;
  }
  
  // Additional check for JPG files with incorrect MIME
  if (ext === '.jpg' || ext === '.jpeg') {
    file.mimetype = 'image/jpeg';
    cb(null, true);
    return;
  }
  
  // Additional check for PNG files with incorrect MIME
  if (ext === '.png') {
    file.mimetype = 'image/png';
    cb(null, true);
    return;
  }
  
  // Reject all other file types
  cb(new Error(`File type not allowed. Allowed types: JPG, PNG, HEIC`), false);
};

// Initialize multer with configurations
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.imageValidation.maxFileSize
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${config.imageValidation.maxFileSize / (1024 * 1024)}MB`
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    // An unknown error occurred
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // No error, continue
  next();
};

module.exports = {
  uploadSingle: [upload.single('image'), handleMulterError],
  uploadMultiple: [upload.array('images', 10), handleMulterError]
};