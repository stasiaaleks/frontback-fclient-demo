import CONFIG from '../constants/config.js';

// json errors instead of express's default html page
const errorHandler = (err, req, res, _next) => {
  // express.json() sets a 4xx status on bad bodies
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
