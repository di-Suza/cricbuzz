import bcrypt from 'bcryptjs';

import { ConflictError, UnauthorizedError } from '../../shared/errors/index.js';
import jwtTokenService from '../../shared/utils/jwtToken.js';
import userRepository from '../users/user.repository.js';
import authSessionService from './session/authSession.service.js';

class AuthService {
  constructor(repository = userRepository, sessionService = authSessionService) {
    this.repository = repository;
    this.sessionService = sessionService;
  }

  signAccessToken(user) {
    return jwtTokenService.signAccessToken(user);
  }

  sanitizeUser(user) {
    const data = user.toObject ? user.toObject() : { ...user };
    delete data.password;
    delete data.__v;
    return data;
  }

  async register(payload) {
    const existingUser = await this.repository.findByEmail(payload.email);

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const password = await bcrypt.hash(payload.password, 10);
    const user = await this.repository.create({ ...payload, password });

    return {
      user: this.sanitizeUser(user),
      accessToken: this.signAccessToken(user),
    };
  }

  async login(payload) {
    const user = await this.repository.findByEmail(payload.email, { withPassword: true });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      user: this.sanitizeUser(user),
      accessToken: this.signAccessToken(user),
    };
  }

  async refresh(refreshToken) {
    const session = await this.sessionService.findValidSession(refreshToken);
    const user = await this.repository.findById(session.userId);

    if (!user) {
      throw new UnauthorizedError('Refresh session user is invalid');
    }

    return {
      accessToken: this.signAccessToken(user),
    };
  }
}

const authService = new AuthService();

export { AuthService };
export default authService;
