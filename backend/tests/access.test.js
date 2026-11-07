jest.mock('../src/utils/audit', () => ({ audit: jest.fn() }));
jest.mock('../src/models/Gig', () => ({ findById: jest.fn(), find: jest.fn(), create: jest.fn() }));
jest.mock('../src/models/Booking', () => ({ create: jest.fn(), find: jest.fn() }));
jest.mock('../src/models/Transaction', () => ({ create: jest.fn(), aggregate: jest.fn() }));

const request = require('supertest');
const app = require('../src/app');
const Gig = require('../src/models/Gig');
const Booking = require('../src/models/Booking');
const Transaction = require('../src/models/Transaction');
const { audit } = require('../src/utils/audit');
const { AUDIT_EVENTS } = require('../src/constants/auditEvents');
const { ids, tokenFor } = require('./helpers');

beforeEach(() => jest.clearAllMocks());

describe('role-based access control', () => {
  test.each([
    ['POST', '/api/gigs', 'client'],
    ['POST', '/api/gigs', 'admin'],
    ['GET', '/api/gigs/mine', 'client'],
    ['GET', '/api/income', 'client'],
    ['GET', '/api/bookings/freelancer', 'client'],
    ['GET', '/api/bookings/client', 'freelancer'],
    ['POST', '/api/bookings', 'freelancer'],
    ['GET', '/api/admin/users', 'client'],
    ['GET', '/api/admin/users', 'freelancer'],
    ['GET', '/api/admin/audit-logs', 'freelancer'],
  ])('%s %s is forbidden for a %s', async (method, path, role) => {
    const res = await request(app)[method.toLowerCase()](path).set('Authorization', tokenFor(role, ids[role] || ids.client)).send({});
    expect(res.status).toBe(403);
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.ACCESS_DENIED, expect.objectContaining({ outcome: 'denied' }));
  });

  test.each([
    ['GET', '/api/gigs/mine'],
    ['GET', '/api/income'],
    ['POST', '/api/bookings'],
    ['GET', '/api/admin/users'],
  ])('%s %s needs a token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path).send({});
    expect(res.status).toBe(401);
  });

  test('public gig list needs no token', async () => {
    Gig.find.mockReturnValue({ populate: jest.fn().mockResolvedValue([]) });
    const res = await request(app).get('/api/gigs');
    expect(res.status).toBe(200);
  });
});

describe('ownership and input validation', () => {
  test('malformed gig id returns 400, not 500', async () => {
    const res = await request(app).get('/api/gigs/abc');
    expect(res.status).toBe(400);
    expect(Gig.findById).not.toHaveBeenCalled();
  });

  test('a freelancer cannot edit or delete another freelancer\'s gig (404, same as missing)', async () => {
    const gig = { freelancer: { toString: () => ids.otherFreelancer }, save: jest.fn(), deleteOne: jest.fn() };
    Gig.findById.mockResolvedValue(gig);

    const put = await request(app).put(`/api/gigs/${ids.gig}`).set('Authorization', tokenFor('freelancer', ids.freelancer)).send({ title: 'Hacked' });
    const del = await request(app).delete(`/api/gigs/${ids.gig}`).set('Authorization', tokenFor('freelancer', ids.freelancer));

    expect(put.status).toBe(404);
    expect(del.status).toBe(404);
    expect(gig.save).not.toHaveBeenCalled();
    expect(gig.deleteOne).not.toHaveBeenCalled();
  });

  test('invalid gig input is rejected', async () => {
    const auth = tokenFor('freelancer', ids.freelancer);
    const negative = await request(app).post('/api/gigs').set('Authorization', auth).send({ title: 'x', description: 'y', price: -5 });
    const longTitle = await request(app).post('/api/gigs').set('Authorization', auth).send({ title: 'a'.repeat(121), description: 'y', price: 5 });
    expect(negative.status).toBe(400);
    expect(longTitle.status).toBe(400);
    expect(Gig.create).not.toHaveBeenCalled();
  });

  test('script tags are stored as text and never executed or reflected as HTML', async () => {
    const auth = tokenFor('freelancer', ids.freelancer);
    Gig.create.mockImplementation(async (doc) => ({ _id: ids.gig, ...doc }));
    const res = await request(app).post('/api/gigs').set('Authorization', auth).send({ title: '<script>alert(1)</script>', description: 'd', price: 10 });
    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['content-security-policy']).toMatch(/script-src 'self'/);
  });
});

describe('bookings and transactions', () => {
  const gig = { _id: ids.gig, isActive: true, price: 250, freelancer: { toString: () => ids.freelancer } };

  test('a client booking creates a booking and a transaction and logs both', async () => {
    Gig.findById.mockResolvedValue(gig);
    Booking.create.mockResolvedValue({ _id: 'b1', amount: 250 });
    Transaction.create.mockResolvedValue({ _id: 't1', amount: 250 });

    const res = await request(app).post('/api/bookings').set('Authorization', tokenFor('client', ids.client)).send({ gigId: ids.gig });

    expect(res.status).toBe(201);
    expect(Booking.create).toHaveBeenCalledWith(expect.objectContaining({ client: ids.client, amount: 250 }));
    expect(Transaction.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 250, status: 'completed' }));
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.BOOKING_CREATED, expect.any(Object));
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.TRANSACTION_RECORDED, expect.any(Object));
  });

  test('a missing gig is rejected and logged', async () => {
    Gig.findById.mockResolvedValue(null);
    const res = await request(app).post('/api/bookings').set('Authorization', tokenFor('client', ids.client)).send({ gigId: ids.gig });
    expect(res.status).toBe(404);
    expect(Booking.create).not.toHaveBeenCalled();
    expect(audit).toHaveBeenCalledWith(AUDIT_EVENTS.BOOKING_REJECTED, expect.any(Object));
  });

  test('a non-id gigId is rejected', async () => {
    const res = await request(app).post('/api/bookings').set('Authorization', tokenFor('client', ids.client)).send({ gigId: { $ne: null } });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/income with tax estimate', () => {
  test('returns totals, monthly series and a tax estimate', async () => {
    Transaction.aggregate.mockResolvedValue([
      {
        lifetime: [{ totalIncome: 9000, completedBookings: 9 }],
        taxYear: [{ totalIncome: 6000, completedBookings: 6 }],
        monthly: [{ _id: '2026-10', income: 6000 }],
      },
    ]);

    const res = await request(app).get('/api/income').set('Authorization', tokenFor('freelancer', ids.freelancer));

    expect(res.status).toBe(200);
    const { data } = res.body;
    expect(data.totalIncome).toBe(9000);
    expect(data.completedBookings).toBe(9);
    expect(data.taxYearIncome).toBe(6000);
    expect(data.monthlyIncome).toHaveLength(12);
    expect(data.taxEstimate.taxYear).toBe('2026/27');
    expect(data.taxEstimate.yearToDateIncome).toBe(6000);
    expect(data.taxEstimate.assumptions.currency).toBe('ZAR');
  });

  test('a freelancer with no transactions gets zeros, not an error', async () => {
    Transaction.aggregate.mockResolvedValue([{ lifetime: [], taxYear: [], monthly: [] }]);
    const res = await request(app).get('/api/income').set('Authorization', tokenFor('freelancer', ids.freelancer));
    expect(res.status).toBe(200);
    expect(res.body.data.totalIncome).toBe(0);
    expect(res.body.data.taxEstimate.estimatedAnnualTax).toBe(0);
  });
});
