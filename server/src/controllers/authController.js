import { promisify } from 'node:util';
import AuthService from '../services/authService.js';
import CONFIG from '../constants/config.js';

class AuthController {
  service = new AuthService();

  login = async (req, res) => {
    const user = await this.service.login(req.body.username, req.body.password);
    // New session id after login, so an id planted before login (session fixation) is useless
    await promisify(req.session.regenerate).call(req.session);
    req.session.user = user;
    res.json({ user });
  };

  logout = async (req, res) => {
    await promisify(req.session.destroy).call(req.session);
    res.clearCookie(CONFIG.SESSION.COOKIE_NAME);
    res.status(CONFIG.HTTP_STATUS.NO_CONTENT).end();
  };

  // 200 with null instead of 401, so the browser can ask "who am I" without a console error
  me = async (req, res) => {
    res.json({ user: req.session.user ?? null });
  };
}

export default AuthController;
