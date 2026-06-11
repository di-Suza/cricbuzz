import { NotFoundError } from '../errors/index.js';

class NotFoundMiddleware {
  static handle(req, _res, next) {
    next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
  }
}

const notFound = NotFoundMiddleware.handle;

export { NotFoundMiddleware };
export default notFound;
