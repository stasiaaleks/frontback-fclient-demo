import express from 'express';
import CONFIG from '../constants/config.js';
import HttpError from '../errors/httpError.js';
import csrfGuard from '../middleware/csrfGuard.js';
import articleRoutes from './articles.js';
import authRoutes from './auth.js';
import EventsController from '../controllers/eventsController.js';

const eventsController = new EventsController();
const router = express.Router();
router.use(csrfGuard);
router.use(express.json());

// Express 5 leaves req.body undefined when there is no JSON body,
// which would turn `req.body.username` into a 500 instead of a 400
// https://github.com/expressjs/express/issues/6432
router.use((req, res, next) => {
  req.body ??= {};
  next();
});

router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.get('/events', eventsController.stream);

// Unknown /api paths answer with JSON 404 instead of falling through to the SPA
router.use(() => {
  throw HttpError.notFound(CONFIG.ERRORS.ROUTE_NOT_FOUND);
});

export default router;
