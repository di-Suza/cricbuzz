class ResponseCache {
  constructor() {
    this.store = new Map();
  }

  middleware(ttlSeconds) {
    return (req, res, next) => {
      if (req.method !== 'GET') return next();

      const key = req.originalUrl;
      const cached = this.store.get(key);

      if (cached && cached.expiresAt > Date.now()) {
        return res.status(cached.statusCode).json(cached.body);
      }

      if (cached) this.store.delete(key);

      const originalJson = res.json.bind(res);

      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.store.set(key, {
            body,
            statusCode: res.statusCode,
            expiresAt: Date.now() + ttlSeconds * 1000,
          });
        }

        return originalJson(body);
      };

      return next();
    };
  }

  clear() {
    this.store.clear();
  }
}

const responseCache = new ResponseCache();

const responseCacheMiddleware = responseCache.middleware.bind(responseCache);

export { ResponseCache, responseCache };
export default responseCacheMiddleware;
