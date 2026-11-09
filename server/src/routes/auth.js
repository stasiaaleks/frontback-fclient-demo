import express from 'express';
import AuthController from '../controllers/authController.js';

const controller = new AuthController();
const router = express.Router();

router.post('/login', controller.login);
// No requireAuth: logging out with an already expired session must still succeed
router.post('/logout', controller.logout);
router.get('/me', controller.me);

export default router;
