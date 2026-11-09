import { MongoClient } from 'mongodb';
import CONFIG from '../constants/config.js';

let client = null;
let dbInstance = null;

export const connectDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }
  client = new MongoClient(CONFIG.MONGODB_URI);
  await client.connect();
  dbInstance = client.db();
  console.log('Connected to MongoDB');
  return dbInstance;
};

export const getDB = () => {
  if (!dbInstance) {
    throw new Error(CONFIG.ERRORS.DB_NOT_INITIALIZED);
  }
  return dbInstance;
};

// The session store reuses this connection instead of opening its own
export const getClient = () => {
  getDB();
  return client;
};

export const closeDB = async () => {
  await client?.close();
  client = null;
  dbInstance = null;
};
