const CONFIG = {
  PORT: process.env.PORT || 3003,
  MONGODB_URI: process.env.MONGODB_URI,
  LOCK_TTL_MS: (Number(process.env.LOCK_TTL_MINUTES) || 5) * 60 * 1000,
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  SESSION: {
    SECRET: process.env.SESSION_SECRET,
    COOKIE_NAME: 'sid',
    MAX_AGE_MS: (Number(process.env.SESSION_TTL_HOURS) || 8) * 60 * 60 * 1000,
    COLLECTION: 'sessions'
  },

  // required on mutations, cross-site forms can't send it
  CSRF_HEADER: { NAME: 'X-Requested-With', VALUE: 'XMLHttpRequest' },

  SSE: {
    EVENT: 'articles-changed',
    HEARTBEAT_MS: 25 * 1000
  },

  COLLECTIONS: {
    ARTICLES: 'articles',
    USERS: 'users'
  },

  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },

  ERRORS: {
    REQUIRED_FIELDS: 'Title, author and content are required',
    INVALID_TAGS: 'Tags must be an array of strings',
    CREDENTIALS_REQUIRED: 'Username and password are required',
    INVALID_CREDENTIALS: 'Invalid username or password',
    AUTH_REQUIRED: 'You must be logged in',
    CSRF: 'Missing X-Requested-With header',
    ARTICLE_NOT_FOUND: 'Article not found',
    ROUTE_NOT_FOUND: 'Route not found',
    LOCK_REQUIRED: 'You must hold the lock on this article to change it',
    NOT_EDITABLE: 'Only draft articles can be edited',
    LOCKED_BY: (owner, until) => `Article is locked by ${owner} until ${until} UTC`,
    INVALID_TRANSITION: (action, from) => `Cannot ${action}: article must be ${from}`,
    CONCURRENT_MODIFICATION: 'Article was modified concurrently, try again',
    DB_NOT_INITIALIZED: 'Database not initialized. Call connectDB first.'
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    LOCKED: 423,
    INTERNAL_SERVER_ERROR: 500
  }
};

export default CONFIG;
