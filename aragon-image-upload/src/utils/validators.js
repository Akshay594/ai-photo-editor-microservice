const { PrismaClient } = require('@prisma/client');
const config = require('../../config');
const imageProcessor = require('./imageProcessor');
const path = require('path');

const prisma = new PrismaClient();

const validators = {
  /**
   * Validate image format
   * @param {string} mimeType - File MIME type
   * @param {string} originalName - Original file name
   * @returns {Object} - Validation result
   */
  validateFormat: (mimeType, originalName) => {
    // Check MIME type first
    const isValidMime = config.imageValidation.allowedTypes.includes(mimeType);
    
    // If MIME type is not valid, check file extension as fallback for HEIC files
    if (!isValidMime) {
      const ext = path.extname(originalName).toLowerCase();
      if (ext === '.heic' || ext === '.heif') {
        return { valid: true, reason: null };
      }
      return {
        valid: false,
        reason: `Unsupported file format. Allowed types: JPG, PNG, HEIC`
      };
    }
    
    return { valid: true, reason: null };
  },
  
  /**
   * Validate image dimensions
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Object} - Validation result
   */
  validateDimensions: (width, height) => {
    // Check minimum dimensions
    if (width < config.imageValidation.minWidth || height < config.imageValidation.minHeight) {
      return {
        valid: false,
        reason: `Image dimensions too small. Minimum: ${config.imageValidation.minWidth}x${config.imageValidation.minHeight}px, Actual: ${width}x${height}px`
      };
    }
    
    // Check maximum dimensions if configured
    if (config.imageValidation.maxWidth && config.imageValidation.maxHeight) {
      if (width > config.imageValidation.maxWidth || height > config.imageValidation.maxHeight) {
        return {
          valid: false,
          reason: `Image dimensions too large. Maximum: ${config.imageValidation.maxWidth}x${config.imageValidation.maxHeight}px, Actual: ${width}x${height}px`
        };
      }
    }
    
    return { valid: true, reason: null };
  },
  
  /**
   * Check if image is too similar to existing ones
   * @param {string} similarityHash - Image similarity hash
   * @param {Buffer} imageBuffer - Image buffer for pixelmatch comparison if needed
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Validation result
   */
  validateSimilarity: async (similarityHash, imageBuffer, userId) => {
    // First pass: Use hash comparison for quick check (more efficient)
    const existingImages = await prisma.image.findMany({
      where: {
        userId,
        status: 'ACCEPTED'
      },
      select: {
        id: true,
        similarityHash: true
      }
    });
    
    // No existing images, so can't be a duplicate
    if (existingImages.length === 0) {
      return { valid: true, reason: null };
    }
    
    // Calculate hash similarity with existing images
    for (const image of existingImages) {
      if (!image.similarityHash) continue;
      
      const similarity = calculateHashSimilarity(similarityHash, image.similarityHash);
      console.log(`Hash similarity with ${image.id}: ${similarity}%`);
      
      // If very high similarity detected, reject
      if (similarity >= config.imageValidation.similarityThreshold) {
        return {
          valid: false,
          reason: `Image too similar to an existing one (${similarity.toFixed(1)}% match)`
        };
      }
    }
    
    return { valid: true, reason: null };
  },
  
  /**
   * Validate image sharpness
   * @param {number} blurValue - Laplacian variance score
   * @returns {Object} - Validation result
   */
  validateSharpness: (blurValue) => {
    // Using a calibrated threshold based on testing
    const threshold = config.imageValidation.blurThreshold;
    const isValid = blurValue >= threshold;
    
    console.log(`Blur validation: score=${blurValue.toFixed(2)}, threshold=${threshold}, isValid=${isValid}`);
    
    return {
      valid: isValid,
      reason: isValid ? null : `Image is too blurry (score: ${blurValue.toFixed(2)}, minimum: ${threshold})`
    };
  }
};

/**
 * Calculate similarity between two hash strings
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {number} - Similarity percentage (0-100)
 */
function calculateHashSimilarity(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) {
    return 0;
  }
  
  let matchingChars = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) {
      matchingChars++;
    }
  }
  
  return (matchingChars / hash1.length) * 100;
}

module.exports = validators;