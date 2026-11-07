jest.mock('../src/models/userModel');
jest.mock('../src/utils/audit', () => ({ audit: jest.fn() }));

const request = require('supertest');
const app = require('../src/app');
const userStore = require('../src/models/userModel');
const { audit } = require('../src/utils/audit');
const { hashPassword } = require('../src/utils/password');
const { AUDIT_EVENTS } = require('../src/constants/auditEvents');
const { ids, tokenFor } = require('./helpers');

const goodPassword = 'Str0ngPassw0rd';
let storedUser;

beforeEach(async () => {
  jest.clearAllMocks();
  storedUser = { id: ids.client, email: 'client@example.com', role: 'client', passwordHash: await hashPassword(goodPassword) };
  userStore.toPublic.mockImplementation((u) => ({ id: u.id, email: u.email, role: u.role }));
  userStore.isLocked.mockReturnValue(false);
});

describe('POST /api/auth/register', () => {
  test('creates a user and never returns the password hash', async () => {
    userStore.findByEmail.mockResolvedValue(null);
    userStore.create.mockResolvedValue(storedUser);

    const res = await request(app).post('/api/auth/register').send({ email: 'client@example.com', password: goodPassword });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
    expect(userStore.create.mock.calls[0][0].passwordHash).not.toBe(goodPassword);
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.USER_REGISTERED, expect.any(Object));
  });

  test('rejects a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@example.com', password: 'weak' });
    expect(res.status).toBe(400);
    expect(userStore.create).not.toHaveBeenCalled();
  });

  test('does not let a user self-register as admin', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@example.com', password: goodPassword, role: 'admin' });
    expect(res.status).toBe(400);
    expect(userStore.create).not.toHaveBeenCalled();
  });

  test('returns 409 for a duplicate email', async () => {
    userStore.findByEmail.mockResolvedValue(storedUser);
    const res = await request(app).post('/api/auth/register').send({ email: 'client@example.com', password: goodPassword });
    expect(res.status).toBe(409);
  });

  test('NoSQL operator objects in the body are rejected before any query runs', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: { $ne: null }, password: { $ne: null } });
    expect(res.status).toBe(400);
    expect(userStore.findByEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login', () => {
  test('succeeds with the right password and logs it', async () => {
    userStore.findByEmail.mockResolvedValue(storedUser);
    const res = await request(app).post('/api/auth/login').send({ email: 'client@example.com', password: goodPassword });
    expect(res.status).toBe(200);
    expect(userStore.resetLoginState).toHaveBeenCalledWith(storedUser);
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.LOGIN_SUCCESS, expect.any(Object));
  });

  test('wrong password and unknown email give the same message', async () => {
    userStore.findByEmail.mockResolvedValueOnce(storedUser).mockResolvedValueOnce(null);
    userStore.registerFailedLogin.mockResolvedValue({ locked: false, attempts: 1 });

    const wrongPassword = await request(app).post('/api/auth/login').send({ email: 'client@example.com', password: 'WrongPass1' });
    const unknownEmail = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'WrongPass1' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.LOGIN_FAILED, expect.objectContaining({ outcome: 'failure' }));
  });

  test('locks the account when the failed-attempt limit is reached', async () => {
    userStore.findByEmail.mockResolvedValue(storedUser);
    userStore.registerFailedLogin.mockResolvedValue({ locked: true, attempts: 3 });

    const res = await request(app).post('/api/auth/login').send({ email: 'client@example.com', password: 'WrongPass1' });

    expect(res.status).toBe(401);
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.ACCOUNT_LOCKED, expect.objectContaining({ outcome: 'denied' }));
  });

  test('a locked account is refused even with the correct password', async () => {
    userStore.findByEmail.mockResolvedValue(storedUser);
    userStore.isLocked.mockReturnValue(true);

    const res = await request(app).post('/api/auth/login').send({ email: 'client@example.com', password: goodPassword });

    expect(res.status).toBe(429);
    expect(res.body.data).toBeUndefined();
    expect(userStore.registerFailedLogin).not.toHaveBeenCalled();
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.LOGIN_BLOCKED, expect.any(Object));
  });

  test('missing fields return 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('JWT protection', () => {
  test('profile needs a token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.TOKEN_REJECTED, expect.any(Object));
  });

  test('a token signed with the wrong secret is rejected', async () => {
    const jwt = require('jsonwebtoken');
    const forged = jwt.sign({ sub: ids.client, role: 'admin' }, 'not-the-real-secret', { issuer: 'hustlehub-plus' });
    const res = await request(app).get('/api/auth/profile').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  test('an expired token is rejected', async () => {
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ sub: ids.client, role: 'client' }, process.env.JWT_SECRET, { issuer: 'hustlehub-plus', expiresIn: -10 });
    const res = await request(app).get('/api/auth/profile').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  test('a valid token reaches the profile', async () => {
    userStore.findById.mockResolvedValue(storedUser);
    const res = await request(app).get('/api/auth/profile').set('Authorization', tokenFor('client', ids.client));
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('client@example.com');
  });
});
