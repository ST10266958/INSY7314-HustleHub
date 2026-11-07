jest.mock('../src/models/userModel');
jest.mock('../src/utils/audit', () => ({ audit: jest.fn() }));

const request = require('supertest');
const app = require('../src/app');
const userStore = require('../src/models/userModel');
const { audit } = require('../src/utils/audit');
const { AUDIT_EVENTS } = require('../src/constants/auditEvents');

test('the login endpoint is throttled after 20 requests and the throttle is logged', async () => {
  userStore.findByEmail.mockResolvedValue(null);
  let last;
  for (let i = 0; i < 21; i += 1) {
    last = await request(app).post('/api/auth/login').send({ email: 'a@example.com', password: 'Whatever1' });
  }
  expect(last.status).toBe(429);
  expect(last.body.message).toMatch(/too many/i);
  expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.RATE_LIMITED, expect.objectContaining({ outcome: 'denied' }));
});
