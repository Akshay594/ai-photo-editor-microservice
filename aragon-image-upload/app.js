const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const imageRoutes = require('./src/routes/imageRoutes');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize Express app
const app = express();

// Apply middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API routes
app.use('/api/images', imageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'image-upload-service' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler middleware (should be last)
app.use(errorHandler);

module.exports = app;