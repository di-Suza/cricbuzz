import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import env from '../../config/env.js';

const securityHeaders = helmet({
  crossOriginResourcePolicy: {
    policy: 'cross-origin',
  },
});

const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

export { apiRateLimiter, securityHeaders };
