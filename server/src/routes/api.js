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

// express 5 leaves req.body undefined without a json body (expressjs/express#6432)
router.use((req, res, next) => {
  req.body ??= {};
  next();
});

router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.get('/events', eventsController.stream);

// json 404 for unknown /api paths instead of the spa
router.use(() => {
  throw HttpError.notFound(CONFIG.ERRORS.ROUTE_NOT_FOUND);
});

export default router;
