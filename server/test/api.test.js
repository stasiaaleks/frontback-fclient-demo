import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

// These checks are rejected before any database call, so they run without MongoDB
// (express-session falls back to its in-memory store)
// CONFIG reads env at import time, so set it before importing the app
process.env.SESSION_SECRET ??= 'test-secret';
const { createApp } = await import('../src/app.js');
const app = createApp();

test('mutation without X-Requested-With is rejected as CSRF', async () => {
  const res = await request(app).post('/api/articles').send({ title: 'x' });
  assert.equal(res.status, 403);
});

test('mutation without a session is rejected', async () => {
  const res = await request(app)
    .post('/api/articles')
    .set('X-Requested-With', 'XMLHttpRequest')
    .send({ title: 'x' });
  assert.equal(res.status, 401);
});

test('anonymous /me returns null user', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { user: null });
});

test('unknown api route is a JSON 404', async () => {
  const res = await request(app).get('/api/nope');
  assert.equal(res.status, 404);
  assert.ok(res.body.error);
});
