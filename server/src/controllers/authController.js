import { promisify } from 'node:util';
import AuthService from '../services/authService.js';
import CONFIG from '../constants/config.js';

class AuthController {
  service = new AuthService();

  login = async (req, res) => {
    const user = await this.service.login(req.body.username, req.body.password);
    // new session id after login (session fixation)
    await promisify(req.session.regenerate).call(req.session);
    req.session.user = user;
    res.json({ user });
  };

  logout = async (req, res) => {
    await promisify(req.session.destroy).call(req.session);
    res.clearCookie(CONFIG.SESSION.COOKIE_NAME);
    res.status(CONFIG.HTTP_STATUS.NO_CONTENT).end();
  };

  // 200 with null instead of 401, avoids a console error in the browser
  me = async (req, res) => {
    res.json({ user: req.session.user ?? null });
  };
}

export default AuthController;
