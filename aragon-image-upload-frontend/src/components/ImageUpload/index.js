import React, { useState, useEffect } from 'react';
import DropZone from './DropZone';
import ProgressBar from './ProgressBar';
import ImageGrid from './ImageGrid';
import Alert from '../UI/Alert';
import Spinner from '../UI/Spinner';
import Button from '../UI/Button';
import { uploadImage, getUserImages, deleteImage } from '../../services/api';

const REQUIRED_IMAGES = 6;
const MAX_IMAGES = 10;

const ImageUpload = ({ userId = 'test-user' }) => {
  const DELETED_IMAGES_STORAGE_KEY = `deleted-images-${userId || 'test-user'}`;

  const [acceptedImages, setAcceptedImages] = useState([]);
  const [rejectedImages, setRejectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize deletedImageIds from localStorage
  const [deletedImageIds, setDeletedImageIds] = useState(() => {
    try {
      const saved = localStorage.getItem(DELETED_IMAGES_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error("Error loading deleted image IDs from storage:", e);
      return new Set();
    }
  });

  // Save deletedImageIds to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        DELETED_IMAGES_STORAGE_KEY, 
        JSON.stringify([...deletedImageIds])
      );
    } catch (e) {
      console.error("Error saving deleted image IDs to storage:", e);
    }
  }, [deletedImageIds]);

  // Fetch user's images on component mount or when deletedImageIds changes
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);

        // Fetch accepted images
        const acceptedResponse = await getUserImages(userId, 'ACCEPTED');
        const acceptedData = acceptedResponse.data || [];

        // Filter out any images that have been deleted locally
        const filteredAccepted = acceptedData.filter(img => !deletedImageIds.has(img.id));
        setAcceptedImages(filteredAccepted);

        // Fetch rejected images
        const rejectedResponse = await getUserImages(userId, 'REJECTED');
        const rejectedData = rejectedResponse.data || [];

        // Filter out any images that have been deleted locally
        const filteredRejected = rejectedData.filter(img => !deletedImageIds.has(img.id));
        setRejectedImages(filteredRejected);

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load your images. Please try again.');
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [userId, deletedImageIds]);

  // Handle files upload
  const handleFilesAccepted = async (files) => {
    if (acceptedImages.length >= MAX_IMAGES) {
      setError(`You can only upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const remainingSlots = MAX_IMAGES - acceptedImages.length;
    const filesToUpload = files.slice(0, remainingSlots);

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload files one by one with progress tracking
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        try {
          setUploadProgress(i);
          const result = await uploadImage(file, userId);

          // Check if upload was successful and image was accepted
          if (result.success) {
            if (result.data.status === 'ACCEPTED') {
              setAcceptedImages(prev => [...prev, result.data]);
              successCount++;
            } else {
              setRejectedImages(prev => [...prev, result.data]);
              errorCount++;
            }
          } else {
            errorCount++;
          }
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          errorCount++;
        }
      }

      // Show success message
      if (successCount > 0) {
        setSuccess(`Successfully uploaded ${successCount} image${successCount !== 1 ? 's' : ''}!`);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      }

      // Show error message if any
      if (errorCount > 0) {
        setError(`${errorCount} image${errorCount !== 1 ? 's' : ''} could not be uploaded or ${errorCount !== 1 ? 'were' : 'was'} rejected.`);
      }
    } catch (err) {
      setError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId) => {
    if (!imageId) {
      setError('Cannot delete image: Missing image ID');
      return;
    }

    try {
      console.log('Deleting image with ID:', imageId);
      setIsLoading(true);

      // First, update local state to make the UI responsive immediately
      setAcceptedImages(prev => prev.filter(img => img.id !== imageId));
      setRejectedImages(prev => prev.filter(img => img.id !== imageId));

      // Then attempt the server deletion
      const response = await deleteImage(imageId, userId);

      if (response && response.success) {
        // Add the ID to our deleted set
        setDeletedImageIds(prev => new Set([...prev, imageId]));

        setSuccess('Image deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response?.message || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Error deleting image:', err);

      // Add to deletedImageIds anyway to ensure it doesn't reappear
      // This way, even if the backend fails, the image stays hidden
      setDeletedImageIds(prev => new Set([...prev, imageId]));

      if (err.response && err.response.status === 404) {
        // Image not found, which is okay - it's already gone
        setSuccess('Image removed successfully.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Show error but keep the image removed from UI
        setError(`Server error while deleting image. The image will remain hidden.`);
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear all images and start fresh
  const handleStartFresh = () => {
    if (window.confirm('Are you sure you want to start fresh? This will clear your current image selection.')) {
      try {
        // Clear the localStorage entry
        localStorage.removeItem(DELETED_IMAGES_STORAGE_KEY);
        
        // Reset the deletedImageIds state
        setDeletedImageIds(new Set());
        
        // Reset the images state
        setAcceptedImages([]);
        setRejectedImages([]);
        
        // Show success message
        setSuccess('All images have been cleared. You can now start fresh!');
        
        // Refetch images from server (this will repopulate the lists)
        setIsLoading(true);
      } catch (e) {
        console.error("Error clearing images:", e);
        setError("Failed to clear images. Please try again.");
      }
    }
  };
  
  // Function to delete all visible images
  const handleDeleteAllImages = async () => {
    if (window.confirm('Are you sure you want to delete ALL your images? This cannot be undone.')) {
      setIsLoading(true);
      
      // Combine all visible images
      const allImages = [...acceptedImages, ...rejectedImages];
      
      if (allImages.length === 0) {
        setSuccess('No images to delete.');
        setIsLoading(false);
        return;
      }
      
      try {
        let successCount = 0;
        let errorCount = 0;
        
        // Delete images one by one
        for (const image of allImages) {
          try {
            await deleteImage(image.id, userId);
            setDeletedImageIds(prev => new Set([...prev, image.id]));
            successCount++;
          } catch (err) {
            console.error(`Error deleting image ${image.id}:`, err);
            // Still mark as deleted locally
            setDeletedImageIds(prev => new Set([...prev, image.id]));
            errorCount++;
          }
        }
        
        // Update state
        setAcceptedImages([]);
        setRejectedImages([]);
        
        // Show results
        setSuccess(`Deleted ${successCount} images successfully${errorCount > 0 ? ` (${errorCount} failed but were removed locally)` : ''}.`);
      } catch (err) {
        console.error('Error in bulk deletion:', err);
        setError('Some images could not be deleted from the server, but they have been removed from your view.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const totalUploaded = acceptedImages.length;
  const isComplete = totalUploaded >= REQUIRED_IMAGES;
  const canContinue = isComplete && !isUploading;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => window.history.back()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </Button>
        </div>
        <img 
          src="/logo.png" 
          alt="Aragon.ai" 
          className="h-8"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/120x30?text=Aragon.ai';
          }}
        />
      </div>
      
      {/* Progress */}
      <div className="mb-8">
        <ProgressBar current={totalUploaded} total={MAX_IMAGES} />
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-1">
          <div className="sticky top-8">
            <h2 className="text-2xl font-bold mb-4">Upload photos</h2>
            <p className="text-gray-600 mb-6">
              Now the fun begins! Select at least {REQUIRED_IMAGES} of your best photos. Uploading a mix of close-ups, selfies and mid-range shots can help the AI better capture your face and body type.
            </p>
            
            {/* Upload area */}
            <DropZone 
              onFilesAccepted={handleFilesAccepted} 
              disabled={isUploading || totalUploaded >= MAX_IMAGES}
            />
            
            {/* Success/Error messages */}
            {error && (
              <Alert 
                type="error" 
                className="mt-4"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert 
                type="success" 
                className="mt-4"
                onClose={() => setSuccess(null)}
              >
                {success}
              </Alert>
            )}
            
            {/* Continue button */}
            <div className="mt-6">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!canContinue}
                onClick={() => alert('Continue to next step!')}
              >
                {isComplete ? 'Continue' : `Add at least ${REQUIRED_IMAGES - totalUploaded} more photos`}
              </Button>
              
              {!isComplete && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You need at least {REQUIRED_IMAGES} photos to continue
                </p>
              )}
            </div>

            {/* Management Options */}
            <div className="mt-4 flex flex-col space-y-2">
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 mb-2">Management Options:</p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-1/2 text-xs"
                    onClick={handleStartFresh}
                  >
                    Start Fresh
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-1/2 text-xs"
                    onClick={handleDeleteAllImages}
                    disabled={acceptedImages.length === 0 && rejectedImages.length === 0}
                  >
                    Delete All Images
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column */}
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Accepted images */}
              <ImageGrid
                images={acceptedImages}
                onDeleteImage={handleDeleteImage}
                title="Accepted Photos"
                emptyMessage="No accepted photos yet. Upload some!"
              />
              
              {/* Rejected images */}
              <ImageGrid
                images={rejectedImages}
                onDeleteImage={handleDeleteImage}
                title="Rejected Photos"
                emptyMessage="No rejected photos yet. Images that don't meet our requirements will appear here."
              />
            </>
          )}
          
          {/* Upload in progress indicator */}
          {isUploading && (
            <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center space-x-3 max-w-xs animate-in slide-in-from-right">
              <Spinner size="sm" />
              <span className="text-sm font-medium">
                Uploading image {uploadProgress + 1} of {Math.min(MAX_IMAGES - acceptedImages.length, uploadProgress + 1)}...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;