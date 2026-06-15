import AppError from './AppError.js';

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = null) {
    super(message, 403, details);
  }
}

export default ForbiddenError;
