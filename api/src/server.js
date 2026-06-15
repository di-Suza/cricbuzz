import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { Server as SocketIOServer } from 'socket.io';

import app from './app.js';
import { connectDB } from './config/db.js';
import env from './config/env.js';
import logger from './config/logger.js';
import socketGateway from './sockets/socketGateway.js';

function getSocketCorsOrigin() {
  if (env.CORS_ORIGIN === '*') return true;

  const origins = new Set(env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean));

  if (env.NODE_ENV === 'development') {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
  }

  return Array.from(origins);
}

class HttpServer {
  constructor(expressApp = app) {
    this.app = expressApp;
    this.port = env.PORT;
    this.httpServer = http.createServer(this.app);
    this.io = null;
  }

  attachSocketServer() {
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: getSocketCorsOrigin(),
        credentials: true,
        methods: ['GET', 'POST'],
      },
    });

    socketGateway.init(this.io);
  }

  async start() {
    try {
      this.attachSocketServer();
      await connectDB();

      this.httpServer.listen(this.port, () => {
        logger.info({ port: this.port }, 'Server started');
      });
    } catch (error) {
      logger.error({ error }, 'Failed to start server');
      process.exit(1);
    }
  }
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const server = new HttpServer();
  server.start();
}

export default HttpServer;
