import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import CONFIG from './constants/config.js';
import apiRoutes from './routes/api.js';
import errorHandler from './middleware/errorHandler.js';
import HttpError from './errors/httpError.js';

const CLIENT_DIST = fileURLToPath(new URL('../../client/dist', import.meta.url));

// Builds the app without connecting to anything, so tests can pass an in-memory session store
export const createApp = ({ sessionStore } = {}) => {
  const app = express();

  // Behind an HTTPS reverse proxy: trust its X-Forwarded-Proto, otherwise the Secure cookie is never sent
  if (CONFIG.IS_PRODUCTION) {
    app.set('trust proxy', 1);
  }

  // Default helmet CSP is self-only (scripts, styles, fetch/EventSource), which is exactly
  // what the Vite build needs: one bundled JS file and one CSS file served from this origin.
  // upgrade-insecure-requests only makes sense behind HTTPS, so it is kept for production only.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: { upgradeInsecureRequests: CONFIG.IS_PRODUCTION ? [] : null }
    }
  }));

  app.use(session({
    name: CONFIG.SESSION.COOKIE_NAME,
    secret: CONFIG.SESSION.SECRET,
    store: sessionStore,
    resave: false,
    // No cookie until login, so anonymous readers don't create sessions
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: CONFIG.IS_PRODUCTION,
      maxAge: CONFIG.SESSION.MAX_AGE_MS
    }
  }));

  app.use('/api', apiRoutes);

  // After `make build` the same server also serves the React app.
  // Any other GET returns index.html so client-side routes like /admin survive a reload.
  if (existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile('index.html', { root: CLIENT_DIST });
    });
  }

  app.use(() => {
    throw HttpError.notFound(CONFIG.ERRORS.ROUTE_NOT_FOUND);
  });

  app.use(errorHandler);

  return app;
};
