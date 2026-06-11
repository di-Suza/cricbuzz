import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import env from '../../config/env.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors/index.js';
import userRepository from '../users/user.repository.js';

class AuthService {
  constructor(repository = userRepository) {
    this.repository = repository;
  }

  signToken(user) {
    return jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
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
      token: this.signToken(user),
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
      token: this.signToken(user),
    };
  }
}

const authService = new AuthService();

export { AuthService };
export default authService;
