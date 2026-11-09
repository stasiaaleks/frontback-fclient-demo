import CONFIG from '../constants/config.js';
import HttpError from '../errors/httpError.js';

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    throw HttpError.unauthorized(CONFIG.ERRORS.AUTH_REQUIRED);
  }
  next();
};

export default requireAuth;
