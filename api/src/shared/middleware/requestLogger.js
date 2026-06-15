import logger from '../../config/logger.js';

function requestLogger(req, res, next) {
  if (req.originalUrl === '/health') return next();

  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const message = `${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`;

    if (res.statusCode >= 500) {
      logger.error(message);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn(message);
      return;
    }

    logger.info(message);
  });

  return next();
}

export default requestLogger;
