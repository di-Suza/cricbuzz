import mongoose from 'mongoose';

import env from './env.js';
import logger from './logger.js';

class Database {
  constructor() {
    this.connection = null;
  }

  getUri() {
    return env.MONGODB_URI;
  }

  async connect() {
    if (this.connection && mongoose.connection.readyState === 1) {
      return this.connection;
    }

    this.connection = await mongoose.connect(this.getUri());
    logger.info({ host: mongoose.connection.host }, 'MongoDB connected');
    return this.connection;
  }

  async disconnect() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      this.connection = null;
    }
  }
}




const database = new Database();
const disconnectDB = database.disconnect.bind(database);
const connectDB = database.connect.bind(database);


export { connectDB, Database, disconnectDB };
export default database;
