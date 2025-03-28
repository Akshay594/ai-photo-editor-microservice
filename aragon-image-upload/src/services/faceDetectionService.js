const { RekognitionClient, DetectFacesCommand } = require('@aws-sdk/client-rekognition');
const config = require('../../config');

// Initialize the Rekognition client
const rekognition = new RekognitionClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

const faceDetectionService = {
  /**
   * Detect faces in an image
   * @param {Buffer} imageBuffer - Image buffer
   * @returns {Promise<Object>} - Face detection results
   */
  detectFaces: async (imageBuffer) => {
    try {
      const params = {
        Image: {
          Bytes: imageBuffer
        },
        Attributes: ['DEFAULT']
      };

      const command = new DetectFacesCommand(params);
      const response = await rekognition.send(command);
      
      console.log(`Face detection: Found ${response.FaceDetails.length} faces`);
      
      return {
        faceCount: response.FaceDetails.length,
        faces: response.FaceDetails.map(face => ({
          confidence: face.Confidence,
          boundingBox: face.BoundingBox,
          // Calculate face size as percentage of image
          sizePercentage: face.BoundingBox.Width * face.BoundingBox.Height * 100
        }))
      };
    } catch (error) {
      console.error('Error detecting faces:', error);
      throw new Error(`Face detection failed: ${error.message}`);
    }
  },
  
  /**
   * Validate face detection results
   * @param {Object} faceResults - Face detection results
   * @returns {Object} - Validation result with valid flag and reason
   */
  validateFaces: (faceResults) => {
    // No faces detected
    if (faceResults.faceCount === 0) {
      return {
        valid: false,
        reason: 'No faces detected in the image'
      };
    }
    
    // Multiple faces detected
    if (faceResults.faceCount > 1) {
      return {
        valid: false,
        reason: `Multiple faces detected (${faceResults.faceCount}). Only one face allowed`
      };
    }
    
    // Check if the single face is too small
    const face = faceResults.faces[0];
    if (face.sizePercentage < config.imageValidation.minFaceSize) {
      return {
        valid: false,
        reason: `Face is too small (${face.sizePercentage.toFixed(2)}% of image). Minimum required: ${config.imageValidation.minFaceSize}%`
      };
    }
    
    // Face validation passed
    return {
      valid: true,
      reason: null
    };
  }
};

module.exports = faceDetectionService;