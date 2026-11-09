import MongoStore from 'connect-mongo';
import CONFIG from './constants/config.js';
import { connectDB, getClient } from './db/connection.js';
import { createApp } from './app.js';

// The example value is public, so a session cookie signed with it could be forged
if (!CONFIG.SESSION.SECRET || CONFIG.SESSION.SECRET === 'change-me') {
  console.error('Set SESSION_SECRET to a long random string, see .env.example');
  process.exit(1);
}

try {
  await connectDB();

  // Sessions live in MongoDB, so logins survive a server restart
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
