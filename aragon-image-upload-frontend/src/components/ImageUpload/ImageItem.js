import React, { useState } from 'react';
import { getImageUrl } from '../../services/api';

const ImageItem = ({ image, onDelete, className = '' }) => {
  const [imgSrc, setImgSrc] = useState(image.s3Url);
  const [isLoading, setIsLoading] = useState(false);

  // Handle image loading error - likely due to expired URL
  const handleImageError = async () => {
    if (isLoading || !image.id) return;
    
    try {
      setIsLoading(true);
      // Fetch a fresh URL from the server
      const freshUrl = await getImageUrl(image.id);
      setImgSrc(freshUrl);
    } catch (error) {
      console.error('Failed to refresh image URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative rounded-lg overflow-hidden group ${className}`}>
      {/* Show loader when refreshing URL */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-aragon-primary rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Image */}
      <img 
        src={imgSrc} 
        alt={image.originalName} 
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
      
      {/* Delete button */}
      <button
        onClick={() => onDelete(image.id)}
        className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-full text-gray-600 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Delete image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Rejected overlay with reason */}
      {image.status === 'REJECTED' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-3">
          <div className="text-white text-sm text-center">
            <p className="font-bold mb-1">Rejected</p>
            <p>{image.rejectionReason}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageItem;