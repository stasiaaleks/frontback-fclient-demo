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

// no db connection here, tests pass their own session store
export const createApp = ({ sessionStore } = {}) => {
  const app = express();

  // behind an https proxy, otherwise the secure cookie is never sent
  if (CONFIG.IS_PRODUCTION) {
    app.set('trust proxy', 1);
  }

  // default helmet csp (self only) fits the vite build
  // upgrade-insecure-requests only in prod
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
    // no cookie until login
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: CONFIG.IS_PRODUCTION,
      maxAge: CONFIG.SESSION.MAX_AGE_MS
    }
  }));

  app.use('/api', apiRoutes);

  // serve the built react app, fall back to index.html so /admin survives a reload
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
