const { PrismaClient } = require('@prisma/client');
const s3Service = require('./s3Service');
const imageProcessor = require('../utils/imageProcessor');
const validators = require('../utils/validators');
const faceDetectionService = require('./faceDetectionService');
const path = require('path');

const prisma = new PrismaClient();

const imageService = {
  /**
   * Process and validate uploaded image
   * @param {Object} file - Multer file object
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Processing result
   */
  processUpload: async (file, userId) => {
    try {
      // Generate a unique temporary key
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Initial record creation with PROCESSING status
      const initialRecord = await prisma.image.create({
        data: {
          userId,
          originalName: file.originalname,
          fileName: path.basename(file.originalname),
          fileSize: file.size,
          fileType: file.mimetype,
          s3Key: tempId, // Unique temporary value
          s3Url: tempId, // Unique temporary value
          status: 'PROCESSING'
        }
      });
      
      // Process image and get metadata
      const { 
        processedBuffer, 
        metadata, 
        width, 
        height,
        format 
      } = await imageProcessor.processImage(file.buffer, file.originalname);
      
      // First, detect faces in the image
      const faceResults = await faceDetectionService.detectFaces(processedBuffer);
      
      // Validate face detection results as the primary check
      const faceValidation = faceDetectionService.validateFaces(faceResults);
      
      // If face validation fails, reject the image immediately
      if (!faceValidation.valid) {
        // Create S3 record anyway for reference/debugging
        const { key, url } = await s3Service.uploadFile(
          processedBuffer,
          file.originalname,
          format === 'heic' ? 'image/jpeg' : file.mimetype
        );
        
        // Update record with rejection
        const rejectedImage = await prisma.image.update({
          where: { id: initialRecord.id },
          data: {
            s3Key: key,
            s3Url: url, // Store the URL for now but will be refreshed when needed
            width,
            height,
            status: 'REJECTED',
            rejectionReason: faceValidation.reason
          }
        });
        
        return rejectedImage;
      }
      
      // If face validation passes, proceed with other validations
      
      // Upload processed image to S3
      const { key, url } = await s3Service.uploadFile(
        processedBuffer,
        file.originalname,
        format === 'heic' ? 'image/jpeg' : file.mimetype
      );
      
      // Generate similarity hash
      const similarityHash = await imageProcessor.generateSimilarityHash(processedBuffer);
      
      // Calculate blurriness score
      const blurValue = await imageProcessor.detectBlurriness(processedBuffer);
      
      // Run all other validations
      const validations = [
        validators.validateFormat(file.mimetype, file.originalname),
        validators.validateDimensions(width, height),
        await validators.validateSimilarity(similarityHash, processedBuffer, userId),
        validators.validateSharpness(blurValue)
      ];
      
      // Check if any validation failed
      const failedValidation = validations.find(v => !v.valid);
      
      let status = 'ACCEPTED';
      let rejectionReason = null;
      
      if (failedValidation) {
        status = 'REJECTED';
        rejectionReason = failedValidation.reason;
      }
      
      // Update record with processing results
      const updatedImage = await prisma.image.update({
        where: { id: initialRecord.id },
        data: {
          s3Key: key,
          s3Url: url, // Store the initial URL but will be refreshed when needed
          width,
          height,
          status,
          rejectionReason,
          similarityHash
        }
      });
      
      // For accepted and rejected images, ensure we return the latest pre-signed URL
      updatedImage.s3Url = s3Service.getSignedUrl(key);
      
      return updatedImage;
      
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  },
  
  /**
   * Get user's images with pagination
   * @param {string} userId - User ID
   * @param {string} status - Filter by status
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Paginated results
   */
  getUserImages: async (userId, status = null, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const where = { userId };
    if (status) {
      where.status = status;
    }
    
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.image.count({ where })
    ]);
    
    // Generate fresh pre-signed URLs for all ACCEPTED and REJECTED images
    const imagesWithFreshUrls = images.map(image => {
      if ((image.status === 'ACCEPTED' || image.status === 'REJECTED') && image.s3Key) {
        // Generate a fresh pre-signed URL for this image
        const freshUrl = s3Service.getSignedUrl(image.s3Key);
        return { ...image, s3Url: freshUrl };
      }
      return image;
    });
    
    return {
      images: imagesWithFreshUrls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },
  
  /**
   * Delete an image
   * @param {string} imageId - Image ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<boolean>} - Success status
   */
  deleteImage: async (imageId, userId) => {
    const image = await prisma.image.findUnique({ 
      where: { id: imageId }
    });
    
    if (!image || image.userId !== userId) {
      return false;
    }
    
    // Delete from S3 first
    await s3Service.deleteFile(image.s3Key);
    
    // Then delete from database
    await prisma.image.delete({
      where: { id: imageId }
    });
    
    return true;
  }
};

module.exports = imageService;