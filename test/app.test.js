import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { app } from '../app.js';
import { createUser, createPost, deletePost, getUserByUsername } from '../db.js';

function getSessionCookie(response) {
  const cookie = response.headers.get('set-cookie');
  return cookie ? cookie.split(';')[0] : '';
}

test('owner-or-admin route should allow a case-insensitive username match', async () => {
  const username = 'testuser';
  const password = 'pass123';

  if (!getUserByUsername(username)) {
    createUser({ username, passwordHash: bcrypt.hashSync(password, 10) });
  }

  const createdId = createPost({
    author: 'TESTUSER',
    date: '12 Sep 2026',
    title: 'Case test title',
    body: 'Case test body',
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const loginRes = await fetch(`http://localhost:${port}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `uid=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      redirect: 'manual',
    });

    const cookie = getSessionCookie(loginRes);
    assert.ok(cookie, 'login should set a session cookie');

    const editRes = await fetch(`http://localhost:${port}/post/${createdId}/edit`, {
      headers: { Cookie: cookie },
      redirect: 'manual',
    });

    assert.equal(editRes.status, 200, 'route should allow same username in different casing');
  } finally {
    deletePost(createdId);
    server.close();
  }
});
