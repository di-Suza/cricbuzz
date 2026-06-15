import { createClient } from 'redis';

import env from './env.js';
import logger from './logger.js';

class RedisConnection {
  constructor() {
    this.client = null;
    this.connectPromise = null;
    this.disabledUntil = 0;
  }

  isConfigured() {
    return Boolean(env.REDIS_URL);
  }

  createClient() {
    const client = createClient({
      url: env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error('Redis connection retry limit exceeded');
          return Math.min(retries * 100, 3000);
        }
      }
    });

    client.on('error', () => {
      logger.warn('Redis connection issue, cache fallback will be used');
    });

    return client;
  }

  async getClient() {
    if (!this.isConfigured()) return null;
    if (Date.now() < this.disabledUntil) return null;

    if (!this.client) {
      this.client = this.createClient();
    }

    if (this.client.isOpen) return this.client;

    if (!this.connectPromise) {
      this.connectPromise = this.client
        .connect()
        .then(() => {
          logger.info('Redis connected');
          return this.client;
        })
        .catch(() => {
          logger.warn('Redis unavailable, using in-memory cache fallback');
          this.disabledUntil = Date.now() + 30_000;
          return null;
        })
        .finally(() => {
          this.connectPromise = null;
        });
    }

    return this.connectPromise;
  }
}

const redisConnection = new RedisConnection();

export { RedisConnection };
export default redisConnection;
