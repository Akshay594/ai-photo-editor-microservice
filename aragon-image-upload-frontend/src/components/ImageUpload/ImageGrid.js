import React from 'react';
import ImageItem from './ImageItem';

const ImageGrid = ({ 
  images, 
  onDeleteImage, 
  title = "Images",
  emptyMessage = "No images yet" 
}) => {
  if (!images || images.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="mt-2 p-6 bg-gray-50 rounded-lg text-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        {title}
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({images.length})
        </span>
      </h3>
      
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map(image => (
          <ImageItem 
            key={image.id} 
            image={image} 
            onDelete={onDeleteImage}
            className="aspect-square" 
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;