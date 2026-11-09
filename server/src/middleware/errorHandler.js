import CONFIG from '../constants/config.js';

// Express's built-in error handler replies with an HTML page
// API clients expect JSON
const errorHandler = (err, req, res, next) => {
  // express.json() marks malformed bodies with a 4xx status
  const statusCode = err.statusCode || err.status || CONFIG.HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isServerError = statusCode >= CONFIG.HTTP_STATUS.INTERNAL_SERVER_ERROR;
  if (isServerError) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: isServerError ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
};

export default errorHandler;
