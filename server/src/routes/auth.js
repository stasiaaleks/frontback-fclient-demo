import express from 'express';
import AuthController from '../controllers/authController.js';

const controller = new AuthController();
const router = express.Router();

router.post('/login', controller.login);
// no requireAuth: logout should work with an expired session too
router.post('/logout', controller.logout);
router.get('/me', controller.me);

export default router;
