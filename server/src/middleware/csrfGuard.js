import CONFIG from '../constants/config.js';
import HttpError from '../errors/httpError.js';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// extra csrf layer on top of SameSite=strict: cross-site forms can't set custom headers
const csrfGuard = (req, res, next) => {
  const { NAME, VALUE } = CONFIG.CSRF_HEADER;
  if (!SAFE_METHODS.includes(req.method) && req.get(NAME) !== VALUE) {
    throw HttpError.forbidden(CONFIG.ERRORS.CSRF);
  }
  next();
};

export default csrfGuard;
