import express from 'express';
import ArticleController from '../controllers/articleController.js';
import requireAuth from '../middleware/requireAuth.js';

const controller = new ArticleController();
const router = express.Router();

// Reads are public (the service hides non-published articles from anonymous users),
// every change needs a logged-in user
router.route('/')
  .get(controller.getAll)
  .post(requireAuth, controller.create);

router.route('/:id')
  .get(controller.getById)
  .put(requireAuth, controller.update)
  .delete(requireAuth, controller.delete);

router.route('/:id/lock')
  .post(requireAuth, controller.lock)
  .delete(requireAuth, controller.unlock);

router.post('/:id/publish', requireAuth, controller.publish);
router.post('/:id/unpublish', requireAuth, controller.unpublish);
router.post('/:id/archive', requireAuth, controller.archive);

export default router;
