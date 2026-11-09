jest.mock('../src/utils/audit', () => ({ audit: jest.fn() }));
jest.mock('../src/models/Gig', () => ({ find: jest.fn() }));

const request = require('supertest');
const app = require('../src/app');
const Gig = require('../src/models/Gig');

test('general API routes are throttled after 300 requests per IP', async () => {
  Gig.find.mockReturnValue({ populate: jest.fn().mockResolvedValue([]) });
  let last;
  for (let i = 0; i < 301; i += 1) {
    last = await request(app).get('/api/gigs');
  }
  expect(last.status).toBe(429);
  expect(last.body.message).toMatch(/too many requests/i);
});
