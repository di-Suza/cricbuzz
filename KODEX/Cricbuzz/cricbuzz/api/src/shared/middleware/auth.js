import { ForbiddenError, UnauthorizedError } from '../errors/index.js';
import jwtTokenService from '../utils/jwtToken.js';

class AuthMiddleware {
  static authenticate(req, _res, next) {
    try {
      const header = req.headers.authorization || '';
      const [scheme, token] = header.split(' ');

      if (scheme !== 'Bearer' || !token) {
        throw new UnauthorizedError('Missing bearer token');
      }

      req.user = jwtTokenService.verifyAccessToken(token);
      return next();
    } catch (error) {
      if (error.isOperational) return next(error);
      return next(new UnauthorizedError('Invalid or expired token'));
    }
  }

  static authorize(...allowedRoles) {
    return function authorizeRequest(req, _res, next) {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      if (!allowedRoles.includes(req.user.role)) {
        return next(new ForbiddenError('You do not have permission to access this resource'));
      }

      return next();
    };
  }
}

const authenticate = AuthMiddleware.authenticate;
const authorize = AuthMiddleware.authorize;

export { AuthMiddleware, authenticate, authorize };
