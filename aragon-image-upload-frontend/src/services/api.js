import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const uploadImage = async (file, userId = 'demo-user') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('userId', userId);

  try {
    const response = await api.post('/images/upload', formData);
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (files, userId = 'demo-user') => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  formData.append('userId', userId);

  try {
    const response = await api.post('/images/upload/multiple', formData);
    return response.data;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

export const getUserImages = async (userId = 'demo-user', status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await api.get(`/images/${userId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error getting user images:', error);
    throw error;
  }
};

export const getImageUrl = async (imageId, userId = 'demo-user') => {
  try {
    const response = await api.get(`/images/url/${imageId}`, {
      params: { userId }
    });
    return response.data.data.url;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
};

export const deleteImage = async (imageId, userId = 'demo-user') => {
  try {
    const response = await api.delete(`/images/${imageId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export default {
  uploadImage,
  uploadMultipleImages,
  getUserImages,
  deleteImage
};