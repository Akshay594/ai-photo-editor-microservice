const sharp = require('sharp');
const path = require('path');
const crypto = require('crypto');
const config = require('../../config');

const imageProcessor = {
  /**
   * Process image and get metadata
   * @param {Buffer} buffer - Image buffer
   * @param {string} originalName - Original file name
   * @returns {Promise<Object>} - Image metadata and processed buffer
   */
  processImage: async (buffer, originalName) => {
    const ext = path.extname(originalName).toLowerCase();
    let processedBuffer = buffer;
    let metadata;
    
    try {
      // Convert HEIC to JPEG if needed
      if (ext === '.heic' || ext === '.heif') {
        processedBuffer = await sharp(buffer)
          .jpeg({ quality: 90 })
          .toBuffer();
        
        metadata = await sharp(processedBuffer).metadata();
        metadata.format = 'jpeg';
      } else {
        metadata = await sharp(buffer).metadata();
      }
      
      return {
        processedBuffer,
        metadata,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  },
  
  /**
   * Generate similarity hash for image
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<string>} - Similarity hash
   */
  generateSimilarityHash: async (buffer) => {
    try {
      // Resize to small thumbnail and convert to grayscale for perceptual hashing
      const resizedBuffer = await sharp(buffer)
        .resize(32, 32, { fit: 'cover' })
        .grayscale()
        .raw()
        .toBuffer();
      
      // Create binary string from pixels based on average brightness
      const pixelArray = new Uint8Array(resizedBuffer);
      const avgBrightness = pixelArray.reduce((sum, value) => sum + value, 0) / pixelArray.length;
      
      // Create a binary string where 1 = brighter than average, 0 = darker
      let binaryString = '';
      for (const pixel of pixelArray) {
        binaryString += pixel >= avgBrightness ? '1' : '0';
      }
      
      // Create a hash from the binary string
      return crypto.createHash('md5').update(binaryString).digest('hex');
    } catch (error) {
      console.error('Error generating similarity hash:', error);
      // Return a random hash if processing fails
      return crypto.randomBytes(16).toString('hex');
    }
  },
  
  /**
   * Detect image blurriness using Laplacian variance
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<number>} - Blurriness score (higher = sharper)
   */
  detectBlurriness: async (buffer) => {
    try {
      // Convert to grayscale and get raw pixel data
      const { data, info } = await sharp(buffer)
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const width = info.width;
      const height = info.height;
      const pixels = new Uint8Array(data);
      
      // Laplacian kernel approximation
      let laplacianSum = 0;
      let validPixels = 0;
      
      // Process inner pixels to avoid boundary issues
      for (let y = 2; y < height - 2; y++) {
        for (let x = 2; x < width - 2; x++) {
          const idx = y * width + x;
          
          // Apply a simple Laplacian kernel (4*center - neighbors)
          const center = pixels[idx];
          const top = pixels[idx - width];
          const bottom = pixels[idx + width];
          const left = pixels[idx - 1];
          const right = pixels[idx + 1];
          
          // Calculate local variance using Laplacian approximation
          const laplacian = Math.abs(4 * center - top - bottom - left - right);
          laplacianSum += laplacian;
          validPixels++;
        }
      }
      
      // Calculate average Laplacian value
      let blurScore = validPixels > 0 ? laplacianSum / validPixels : 0;
      
      // Normalize based on image size for more consistent results across resolutions
      // Sqrt of pixel count gives a good normalization factor
      const normalizationFactor = Math.sqrt(width * height) / 500;
      blurScore = blurScore * (normalizationFactor > 0.5 ? normalizationFactor : 0.5);
      
      console.log(`Blur detection: raw score=${blurScore.toFixed(2)}, dimensions=${width}x${height}`);
      
      return blurScore;
    } catch (error) {
      console.error('Error detecting blurriness:', error);
      // Return a high value to avoid rejecting images when detection fails
      return 100;
    }
  },
  
  /**
   * Resize image if needed
   * @param {Buffer} buffer - Image buffer
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @returns {Promise<Buffer>} - Resized image buffer or original if no resize needed
   */
  resizeIfNeeded: async (buffer, maxWidth, maxHeight) => {
    if (!maxWidth || !maxHeight) return buffer;
    
    try {
      const metadata = await sharp(buffer).metadata();
      
      // If image is already smaller than max dimensions, return original
      if (metadata.width <= maxWidth && metadata.height <= maxHeight) {
        return buffer;
      }
      
      // Resize image while maintaining aspect ratio
      return await sharp(buffer)
        .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();
    } catch (error) {
      console.error('Error resizing image:', error);
      return buffer;
    }
  }
};

module.exports = imageProcessor;