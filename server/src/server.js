import MongoStore from 'connect-mongo';
import CONFIG from './constants/config.js';
import { connectDB, getClient } from './db/connection.js';
import { createApp } from './app.js';

// the example secret is public, don't run with it
if (!CONFIG.SESSION.SECRET || CONFIG.SESSION.SECRET === 'change-me') {
  console.error('Set SESSION_SECRET to a long random string, see .env.example');
  process.exit(1);
}

try {
  await connectDB();

  // sessions in mongo survive restarts
  const sessionStore = MongoStore.create({
    client: getClient(),
    collectionName: CONFIG.SESSION.COLLECTION,
    ttl: CONFIG.SESSION.MAX_AGE_MS / 1000
  });

  createApp({ sessionStore }).listen(CONFIG.PORT, () => {
    console.log(`Server running on http://localhost:${CONFIG.PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
