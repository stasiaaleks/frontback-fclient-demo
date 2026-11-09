import CONFIG from '../constants/config.js';
import HttpError from '../errors/httpError.js';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Second layer next to the SameSite=strict cookie: a cross-site <form> can't set custom headers,
// and a cross-site fetch with one needs a CORS preflight, which this server never allows
const csrfGuard = (req, res, next) => {
  const { NAME, VALUE } = CONFIG.CSRF_HEADER;
  if (!SAFE_METHODS.includes(req.method) && req.get(NAME) !== VALUE) {
    throw HttpError.forbidden(CONFIG.ERRORS.CSRF);
  }
  next();
};

export default csrfGuard;
