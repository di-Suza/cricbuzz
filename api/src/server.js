import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { Server as SocketIOServer } from 'socket.io';

import app from './app.js';
import { connectDB } from './config/db.js';
import env from './config/env.js';
import socketGateway from './sockets/socketGateway.js';

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
        origin: env.CORS_ORIGIN,
      },
    });

    socketGateway.init(this.io);
  }

  async start() {
    try {
      this.attachSocketServer();
      await connectDB();

      this.httpServer.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
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
