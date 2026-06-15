import logger from '../../config/logger.js';

class ErrorHandler {
  static normalize(error) {
    if (error.name === 'CastError') {
      return {
        statusCode: 400,
        message: 'Invalid resource id',
        details: null,
      };
    }

    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        message: Object.values(error.errors).map(err => err.message).join(', ') || 'Validation Error',
        details: error.errors,
      };
    }

    if (error.code === 11000) {
      return {
        statusCode: 409,
        message: 'Duplicate value already exists',
        details: error.keyValue || null,
      };
    }

    return {
      statusCode: error.statusCode || 500,
      message: error.isOperational ? error.message : 'Internal server error',
      details: error.details || null,
    };
  }

  static handle(error, req, res, _next) {
    const normalized = ErrorHandler.normalize(error);

    if (normalized.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} failed: ${error.message || 'Unhandled application error'}`);
    }

    res.status(normalized.statusCode).json({
      success: false,
      message: normalized.message,
      details: normalized.details,
    });
  }
}

const errorHandler = ErrorHandler.handle;

export { ErrorHandler };
export default errorHandler;
