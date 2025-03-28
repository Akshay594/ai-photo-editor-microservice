require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // AWS S3 Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET
  },
  
  // Image Validation Rules
  imageValidation: {
    // Size constraints (in bytes)
    maxFileSize: 120 * 1024 * 1024, // 120MB max file size
    
    // Dimension constraints (in pixels)
    minWidth: 300,
    minHeight: 300,
    maxWidth: 5000,  // Optional maximum width
    maxHeight: 5000, // Optional maximum height
    
    // Format validation
    allowedTypes: [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/heic',
      'image/heif'
    ],
    
    // Similarity detection
    similarityThreshold: 85, // Percentage similarity for rejecting duplicates (0-100)
    
    // Blur detection
    blurThreshold: 5, // Laplacian variance threshold (lower = more strict)
    
    // Face detection
    minFaceSize: 5, // Minimum face size as percentage of image area
    maxFaceCount: 1 // Maximum number of faces allowed
  }
};