import jwt from 'jsonwebtoken';

import env from '../../config/env.js';

class JwtTokenService {
  constructor(config = env) {
    this.config = config;
    this.privateKey = null;
    this.publicKey = null;
  }

  decodeBase64Key(value, envName) {
    if (!value || value.startsWith('base64_encoded_')) {
      throw new Error(`${envName} must contain a base64 encoded PEM key`);
    }

    const decodedKey = Buffer.from(value, 'base64').toString('utf8').trim();

    if (!decodedKey.includes('-----BEGIN') || !decodedKey.includes('-----END')) {
      throw new Error(`${envName} must decode to a valid PEM key`);
    }

    return decodedKey;
  }

  getPrivateKey() {
    if (!this.privateKey) {
      this.privateKey = this.decodeBase64Key(this.config.JWT_PRIVATE_KEY_BASE64, 'JWT_PRIVATE_KEY_BASE64');
    }

    return this.privateKey;
  }

  getPublicKey() {
    if (!this.publicKey) {
      this.publicKey = this.decodeBase64Key(this.config.JWT_PUBLIC_KEY_BASE64, 'JWT_PUBLIC_KEY_BASE64');
    }

    return this.publicKey;
  }

  buildPayload(user, tokenType) {
    return {
      id: user._id?.toString?.() || user.id,
      role: user.role,
      email: user.email,
      tokenType,
    };
  }

  signAccessToken(user) {
    return jwt.sign(this.buildPayload(user, 'access'), this.getPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: this.config.ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  signRefreshToken(user) {
    return jwt.sign(this.buildPayload(user, 'refresh'), this.getPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: this.config.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  verifyAccessToken(token) {
    const payload = jwt.verify(token, this.getPublicKey(), {
      algorithms: ['RS256'],
    });

    if (payload.tokenType !== 'access') {
      throw new Error('Invalid token type');
    }

    return payload;
  }

  verifyRefreshToken(token) {
    const payload = jwt.verify(token, this.getPublicKey(), {
      algorithms: ['RS256'],
    });

    if (payload.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return payload;
  }
}

const jwtTokenService = new JwtTokenService();

export { JwtTokenService };
export default jwtTokenService;
