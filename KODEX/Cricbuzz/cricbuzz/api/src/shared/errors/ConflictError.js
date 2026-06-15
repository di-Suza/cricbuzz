import AppError from './AppError.js';

class ConflictError extends AppError {
  constructor(message = 'Conflict', details = null) {
    super(message, 409, details);
  }
}

export default ConflictError;
