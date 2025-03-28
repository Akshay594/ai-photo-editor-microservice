const imageService = require('../services/imageService');
const s3Service = require('../services/s3Service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const imageController = {
  /**
   * Upload a single image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  uploadImage: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      // For demo purposes, we're using a fixed userId
      // In a real application, this would come from authentication
      const userId = req.body.userId || 'demo-user';
      
      const result = await imageService.processUpload(req.file, userId);
      
      // If the image was accepted, ensure we have a fresh URL
      if (result.status === 'ACCEPTED') {
        result.s3Url = s3Service.getSignedUrl(result.s3Key);
      }
      
      return res.status(201).json({
        success: true,
        data: result,
        message: result.status === 'ACCEPTED' 
          ? 'Image uploaded successfully' 
          : `Image rejected: ${result.rejectionReason}`
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Upload multiple images
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  uploadMultipleImages: async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      // For demo purposes, we're using a fixed userId
      const userId = req.body.userId || 'demo-user';
      
      // Process each file and collect results
      const results = await Promise.all(
        req.files.map(file => imageService.processUpload(file, userId))
      );
      
      // Update URLs for accepted images to ensure they're fresh
      const resultsWithFreshUrls = results.map(image => {
        if (image.status === 'ACCEPTED' && image.s3Key) {
          return {
            ...image,
            s3Url: s3Service.getSignedUrl(image.s3Key)
          };
        }
        return image;
      });
      
      // Count accepted and rejected images
      const accepted = resultsWithFreshUrls.filter(img => img.status === 'ACCEPTED').length;
      const rejected = resultsWithFreshUrls.length - accepted;
      
      return res.status(201).json({
        success: true,
        data: resultsWithFreshUrls,
        summary: {
          total: resultsWithFreshUrls.length,
          accepted,
          rejected
        },
        message: `Uploaded ${resultsWithFreshUrls.length} images: ${accepted} accepted, ${rejected} rejected`
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get user images
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getUserImages: async (req, res, next) => {
    try {
      const userId = req.params.userId || 'demo-user';
      const { status } = req.query;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      
      const result = await imageService.getUserImages(userId, status, page, limit);
      
      return res.status(200).json({
        success: true,
        data: result.images,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get a pre-signed URL for an image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getImageUrl: async (req, res, next) => {
    try {
      const { imageId } = req.params;
      const userId = req.query.userId || 'demo-user';
      
      // Find the image
      const image = await prisma.image.findUnique({
        where: { id: imageId }
      });
      
      if (!image || image.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Image not found or unauthorized'
        });
      }
      
      // Generate a fresh pre-signed URL
      const signedUrl = s3Service.getSignedUrl(image.s3Key);
      
      return res.status(200).json({
        success: true,
        data: {
          url: signedUrl,
          expiresIn: '24 hours'
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Delete an image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  deleteImage: async (req, res, next) => {
    try {
      const { imageId } = req.params;
      const userId = req.body.userId || 'demo-user';
      
      const success = await imageService.deleteImage(imageId, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Image not found or unauthorized'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = imageController;