import AppError from './AppError.js';

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, details);
  }
}

export default UnauthorizedError;
