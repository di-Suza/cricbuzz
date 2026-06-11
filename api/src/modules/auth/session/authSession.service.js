import crypto from 'node:crypto';

import env from '../../../config/env.js';
import { UnauthorizedError } from '../../../shared/errors/index.js';
import jwtTokenService from '../../../shared/utils/jwtToken.js';
import authSessionRepository from './authSession.repository.js';

class AuthSessionService {
  constructor(repository = authSessionRepository) {
    this.repository = repository;
  }

  hashRefreshToken(refreshToken) {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
  }

  getRequestMeta(req) {
    return {
      userAgent: req?.headers?.['user-agent'] || null,
      ipAddress: req?.ip || req?.socket?.remoteAddress || null,
    };
  }

  getRefreshTokenExpiryDate() {
    return new Date(Date.now() + env.REFRESH_COOKIE_MAX_AGE_MS);
  }

  createSession(user, refreshToken, req = null) {
    const { userAgent, ipAddress } = this.getRequestMeta(req);

    return this.repository.create({
      userId: user._id || user.id,
      refreshTokenHash: this.hashRefreshToken(refreshToken),
      role: user.role,
      userAgent,
      ipAddress,
      expiresAt: this.getRefreshTokenExpiryDate(),
    });
  }

  async findValidSession(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    try {
      jwtTokenService.verifyRefreshToken(refreshToken);
    } catch (_error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const session = await this.repository.findActiveByRefreshTokenHash(this.hashRefreshToken(refreshToken));

    if (!session) {
      throw new UnauthorizedError('Refresh session is invalid or expired');
    }

    return session;
  }

  revokeSession(refreshToken, reason = 'LOGOUT') {
    if (!refreshToken) {
      return null;
    }

    return this.repository.revokeByRefreshTokenHash(this.hashRefreshToken(refreshToken), reason);
  }

  revokeAllUserSessions(userId, reason = 'LOGOUT_ALL') {
    return this.repository.revokeAllByUserId(userId, reason);
  }

  deleteExpiredSessions() {
    return this.repository.deleteExpiredSessions();
  }
}

const authSessionService = new AuthSessionService();

export { AuthSessionService };
export default authSessionService;
