import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateFile, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../utils/fileValidation';
import Button from '../UI/Button';

const DropZone = ({ onFilesAccepted, disabled = false }) => {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle validated files
    const validatedFiles = acceptedFiles.filter(file => {
      const { valid } = validateFile(file);
      return valid;
    });

    if (validatedFiles.length > 0) {
      onFilesAccepted(validatedFiles);
    }

    // Handle rejected files if needed
    if (rejectedFiles.length > 0) {
      console.warn('Some files were rejected:', rejectedFiles);
    }
  }, [onFilesAccepted]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif']
    },
    maxSize: MAX_FILE_SIZE,
    disabled
  });

  const dropzoneClasses = `
    border-2 border-dashed rounded-lg p-6 
    transition-all duration-200 ease-in-out
    text-center cursor-pointer
    ${isDragActive ? 'border-aragon-primary bg-aragon-primary/5' : 'border-gray-300 hover:border-aragon-primary/70'}
    ${isDragAccept ? 'border-green-500 bg-green-50' : ''}
    ${isDragReject ? 'border-red-500 bg-red-50' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <div
      {...getRootProps()}
      className={dropzoneClasses}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center space-y-3">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 text-gray-400"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        
        <div className="text-sm text-gray-600">
          {isDragActive ? (
            isDragAccept ? (
              <p>Drop the files here...</p>
            ) : (
              <p className="text-red-500">Some files will be rejected!</p>
            )
          ) : (
            <div>
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="mt-1 text-xs">PNG, JPG, HEIC up to 120MB</p>
            </div>
          )}
        </div>
        
        <Button 
          variant="primary" 
          size="md"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation(); 
            document.querySelector('input[type="file"]').click();
          }}
        >
          Upload files
        </Button>
      </div>
    </div>
  );
};

export default DropZone;