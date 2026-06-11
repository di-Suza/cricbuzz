import bcrypt from 'bcryptjs';

import { ConflictError, UnauthorizedError } from '../../shared/errors/index.js';
import jwtTokenService from '../../shared/utils/jwtToken.js';
import userRepository from '../users/user.repository.js';
import authSessionService from './session/authSession.service.js';

class AuthService {
  constructor(repository = userRepository) {
    this.repository = repository;
  }

  signAccessToken(user) {
    return jwtTokenService.signAccessToken(user);
  }

  signRefreshToken(user) {
    return jwtTokenService.signRefreshToken(user);
  }

  sanitizeUser(user) {
    const data = user.toObject ? user.toObject() : { ...user };
    delete data.password;
    delete data.__v;
    return data;
  }

  async register(payload, req) {
    const existingUser = await this.repository.findByEmail(payload.email);

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const password = await bcrypt.hash(payload.password, 10);
    const user = await this.repository.create({ ...payload, password });

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    await authSessionService.createSession(user, refreshToken, req);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(payload, req) {
    const user = await this.repository.findByEmail(payload.email, { withPassword: true });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    await authSessionService.createSession(user, refreshToken, req);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }
}

const authService = new AuthService();

export { AuthService };
export default authService;
