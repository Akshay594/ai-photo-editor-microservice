const express = require('express');
const imageController = require('../controllers/imageController');
const { uploadSingle, uploadMultiple } = require('../middleware/fileUpload');

const router = express.Router();

// Upload a single image
router.post('/upload', uploadSingle, imageController.uploadImage);

// Upload multiple images
router.post('/upload/multiple', uploadMultiple, imageController.uploadMultipleImages);

// Get user's images
router.get('/:userId', imageController.getUserImages);

// Get a pre-signed URL for an image
router.get('/url/:imageId', imageController.getImageUrl);

// Delete an image
router.delete('/:imageId', imageController.deleteImage);

module.exports = router;