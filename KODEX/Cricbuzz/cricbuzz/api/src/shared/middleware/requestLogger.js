import pinoHttp from 'pino-http';

import logger from '../../config/logger.js';

const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
  customLogLevel(_req, res, error) {
    if (error || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} completed with ${res.statusCode}`;
  },
  customErrorMessage(req, res) {
    return `${req.method} ${req.url} failed with ${res.statusCode}`;
  },
});

export default requestLogger;
