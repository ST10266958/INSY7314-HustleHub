jest.mock('../src/utils/audit', () => ({ audit: jest.fn() }));
jest.mock('../src/models/AuditLog', () => ({ find: jest.fn(), aggregate: jest.fn(), create: jest.fn() }));

const request = require('supertest');
const app = require('../src/app');
const AuditLog = require('../src/models/AuditLog');
const { ids, tokenFor } = require('./helpers');

const admin = () => tokenFor('admin', ids.admin);
const chain = (rows) => ({ sort: () => ({ limit: jest.fn().mockResolvedValue(rows) }) });

beforeEach(() => jest.clearAllMocks());

describe('admin audit trail', () => {
  test('admin can list audit events with a filter', async () => {
    AuditLog.find.mockReturnValue(chain([{ event: 'auth.login.failed' }]));
    const res = await request(app).get('/api/admin/audit-logs?event=auth.login.failed&limit=10').set('Authorization', admin());
    expect(res.status).toBe(200);
    expect(AuditLog.find).toHaveBeenCalledWith({ event: { $eq: 'auth.login.failed' } });
    expect(res.body.data.logs).toHaveLength(1);
  });

  test('filters are whitelisted so query operators cannot reach the database', async () => {
    const unknown = await request(app).get('/api/admin/audit-logs?event=drop.table').set('Authorization', admin());
    const hugeLimit = await request(app).get('/api/admin/audit-logs?limit=100000').set('Authorization', admin());
    expect(unknown.status).toBe(400);
    expect(hugeLimit.status).toBe(400);
    expect(AuditLog.find).not.toHaveBeenCalled();
  });

  test('operator-style query keys are ignored, so the database filter stays empty', async () => {
    AuditLog.find.mockReturnValue(chain([]));
    const res = await request(app).get('/api/admin/audit-logs?event[$ne]=x').set('Authorization', admin());
    expect(res.status).toBe(200);
    expect(AuditLog.find).toHaveBeenCalledWith({});
  });

  test('summary groups events from the last 24 hours', async () => {
    AuditLog.aggregate.mockResolvedValue([{ _id: { event: 'auth.login.failed', outcome: 'failure' }, count: 4 }]);
    const res = await request(app).get('/api/admin/audit-logs/summary').set('Authorization', admin());
    expect(res.status).toBe(200);
    expect(res.body.data.summary[0]).toEqual({ event: 'auth.login.failed', outcome: 'failure', count: 4 });
  });
});
