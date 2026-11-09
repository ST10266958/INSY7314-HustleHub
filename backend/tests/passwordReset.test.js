jest.mock('../src/models/userModel');
jest.mock('../src/utils/audit', () => ({ audit: jest.fn() }));
jest.mock('../src/utils/mailer', () => ({ sendPasswordResetEmail: jest.fn().mockResolvedValue() }));

const crypto = require('crypto');
const request = require('supertest');
const app = require('../src/app');
const userStore = require('../src/models/userModel');
const { audit } = require('../src/utils/audit');
const { sendPasswordResetEmail } = require('../src/utils/mailer');
const { AUDIT_EVENTS } = require('../src/constants/auditEvents');
const { ids } = require('./helpers');

const user = { id: ids.client, email: 'client@example.com', role: 'client' };
const validToken = 'a'.repeat(64);
const newPassword = 'N3wStrongPass';

beforeEach(() => {
  jest.clearAllMocks();
  sendPasswordResetEmail.mockResolvedValue();
});

describe('POST /api/auth/forgot-password', () => {
  test('stores only a hash of the token and emails the raw token', async () => {
    userStore.findByEmail.mockResolvedValue(user);

    const res = await request(app).post('/api/auth/forgot-password').send({ email: user.email });

    expect(res.status).toBe(200);
    const [, storedHash, expires] = userStore.setResetToken.mock.calls[0];
    const [, emailedToken] = sendPasswordResetEmail.mock.calls[0];
    expect(emailedToken).toMatch(/^[a-f0-9]{64}$/);
    expect(storedHash).toBe(crypto.createHash('sha256').update(emailedToken).digest('hex'));
    expect(storedHash).not.toBe(emailedToken);
    expect(expires.getTime()).toBeGreaterThan(Date.now());
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.PASSWORD_RESET_REQUESTED, expect.any(Object));
  });

  test('gives the same response for an unknown email and sends nothing', async () => {
    userStore.findByEmail.mockResolvedValue(null);
    const known = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@example.com' });
    userStore.findByEmail.mockResolvedValue(user);
    const unknown = await request(app).post('/api/auth/forgot-password').send({ email: user.email });

    expect(known.status).toBe(unknown.status);
    expect(known.body).toEqual(unknown.body);
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  test('rejects an invalid email and NoSQL operator objects', async () => {
    expect((await request(app).post('/api/auth/forgot-password').send({ email: 'nope' })).status).toBe(400);
    expect((await request(app).post('/api/auth/forgot-password').send({ email: { $ne: null } })).status).toBe(400);
    expect(userStore.findByEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/reset-password', () => {
  test('resets the password with a valid token and never returns a hash', async () => {
    userStore.consumeResetToken.mockResolvedValue(user);

    const res = await request(app).post('/api/auth/reset-password').send({ token: validToken, password: newPassword });

    expect(res.status).toBe(200);
    const [tokenHash, passwordHash] = userStore.consumeResetToken.mock.calls[0];
    expect(tokenHash).toBe(crypto.createHash('sha256').update(validToken).digest('hex'));
    expect(passwordHash).not.toBe(newPassword);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.PASSWORD_RESET_COMPLETED, expect.any(Object));
  });

  test('rejects an expired, used or unknown token with a generic 400', async () => {
    userStore.consumeResetToken.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/reset-password').send({ token: validToken, password: newPassword });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid or has expired/i);
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.PASSWORD_RESET_FAILED, expect.any(Object));
  });

  test('rejects a malformed token before any database call', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ token: 'short', password: newPassword });
    expect(res.status).toBe(400);
    expect(userStore.consumeResetToken).not.toHaveBeenCalled();
  });

  test('rejects a weak new password', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ token: validToken, password: 'weak' });
    expect(res.status).toBe(400);
    expect(userStore.consumeResetToken).not.toHaveBeenCalled();
  });
});
