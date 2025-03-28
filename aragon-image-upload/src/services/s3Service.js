const AWS = require('aws-sdk');
const config = require('../../config');
const { v4: uuidv4 } = require('uuid');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

const s3 = new AWS.S3();

const s3Service = {
  /**
   * Generate a pre-signed URL for an existing S3 object
   * @param {string} key - S3 key
   * @returns {Promise<string>} - Pre-signed URL
   */
  getSignedUrl: (key) => {
    const signedUrlExpireSeconds = 60 * 60 * 24; // 24 hours
    
    const url = s3.getSignedUrl('getObject', {
      Bucket: config.aws.bucket,
      Key: key,
      Expires: signedUrlExpireSeconds
    });
    
    return url;
  },
  /**
   * Upload a file to S3
   * @param {Buffer} buffer - File buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type
   * @returns {Promise<{key: string, url: string}>} - S3 key and URL
   */
  uploadFile: async (buffer, fileName, mimeType) => {
    const key = `uploads/${uuidv4()}-${fileName}`;
    
    const params = {
      Bucket: config.aws.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType
      // Removed ACL: 'public-read' since bucket doesn't allow ACLs
    };
    
    const result = await s3.upload(params).promise();
    
    // Generate a pre-signed URL that's valid for 24 hours
    const signedUrlExpireSeconds = 60 * 60 * 24;
    
    const url = s3.getSignedUrl('getObject', {
      Bucket: config.aws.bucket,
      Key: key,
      Expires: signedUrlExpireSeconds
    });
    
    return {
      key,
      url
    };
  },
  
  /**
   * Delete a file from S3
   * @param {string} key - S3 key
   * @returns {Promise<void>}
   */
  deleteFile: async (key) => {
    const params = {
      Bucket: config.aws.bucket,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
  }
};

module.exports = s3Service;