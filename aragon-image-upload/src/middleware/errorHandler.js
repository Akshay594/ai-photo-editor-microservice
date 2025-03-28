const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Handle multer errors
    if (err.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
        error: err.code
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors
      });
    }
    
    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError' || 
        err.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    // Default error response
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  };
  
  module.exports = errorHandler;