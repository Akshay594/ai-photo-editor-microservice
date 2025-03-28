// Maximum file size in bytes (120 MB)
export const MAX_FILE_SIZE = 120 * 1024 * 1024;

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif'
];

// Validate file type
export const isValidFileType = (file) => {
  if (!file) return false;
  
  // Check MIME type first
  if (ALLOWED_FILE_TYPES.includes(file.type)) {
    return true;
  }
  
  // Check file extension as fallback
  const fileName = file.name.toLowerCase();
  if (
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif')
  ) {
    return true;
  }
  
  return false;
};

// Validate file size
export const isValidFileSize = (file) => {
  return file && file.size <= MAX_FILE_SIZE;
};

// Get formatted file size in MB
export const getFormattedFileSize = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

// Comprehensive file validation
export const validateFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }
  
  if (!isValidFileType(file)) {
    errors.push('Invalid file type. Allowed types: JPG, PNG, HEIC/HEIF');
  }
  
  if (!isValidFileSize(file)) {
    errors.push(`File too large. Maximum size is ${getFormattedFileSize(MAX_FILE_SIZE)}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  validateFile,
  isValidFileType,
  isValidFileSize,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
};