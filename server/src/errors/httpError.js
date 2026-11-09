import CONFIG from '../constants/config.js';

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }

  static badRequest(message) {
    return new HttpError(CONFIG.HTTP_STATUS.BAD_REQUEST, message);
  }

  static unauthorized(message) {
    return new HttpError(CONFIG.HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message) {
    return new HttpError(CONFIG.HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message) {
    return new HttpError(CONFIG.HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message) {
    return new HttpError(CONFIG.HTTP_STATUS.CONFLICT, message);
  }

  static locked(message) {
    return new HttpError(CONFIG.HTTP_STATUS.LOCKED, message);
  }
}

export default HttpError;
