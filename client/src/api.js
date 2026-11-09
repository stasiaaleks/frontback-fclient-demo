// The only place that talks to the server. Every call:
// - sends the session cookie (same origin)
// - adds X-Requested-With, which the server requires on mutations (CSRF guard)
// - throws an Error carrying the server's { error } message
async function request(method, path, body) {
  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}

const articlePath = (id, action = '') => `/articles/${encodeURIComponent(id)}${action}`;

export const api = {
  me: () => request('GET', '/auth/me'),
  login: (username, password) => request('POST', '/auth/login', { username, password }),
  logout: () => request('POST', '/auth/logout'),

  getArticles: () => request('GET', '/articles'),
  getArticle: (id) => request('GET', articlePath(id)),
  createArticle: (fields) => request('POST', '/articles', fields),
  updateArticle: (id, fields) => request('PUT', articlePath(id), fields),
  deleteArticle: (id) => request('DELETE', articlePath(id)),

  lock: (id) => request('POST', articlePath(id, '/lock')),
  unlock: (id) => request('DELETE', articlePath(id, '/lock')),
  publish: (id) => request('POST', articlePath(id, '/publish')),
  unpublish: (id) => request('POST', articlePath(id, '/unpublish')),
  archive: (id) => request('POST', articlePath(id, '/archive'))
};

export const EVENTS_URL = '/api/events';
export const ARTICLES_CHANGED = 'articles-changed';
