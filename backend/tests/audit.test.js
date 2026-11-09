jest.mock('../src/models/AuditLog', () => ({ create: jest.fn() }));

const AuditLog = require('../src/models/AuditLog');
const logger = require('../src/config/logger');
const { audit } = require('../src/utils/audit');

test('stores the event with request details', async () => {
  AuditLog.create.mockResolvedValue({});
  const req = { ip: '10.0.0.5', method: 'POST', originalUrl: '/api/auth/login?x=1', headers: { 'user-agent': 'jest' } };
  await audit('auth.login.failed', { req, email: 'a@example.com', outcome: 'failure', details: { reason: 'bad_password' } });
  expect(AuditLog.create).toHaveBeenCalledWith(
    expect.objectContaining({ event: 'auth.login.failed', ip: '10.0.0.5', path: '/api/auth/login', outcome: 'failure' })
  );
});

test('a database failure never breaks the request', async () => {
  AuditLog.create.mockRejectedValue(new Error('db down'));
  const spy = jest.spyOn(logger, 'error').mockImplementation(() => {});
  await expect(audit('x.event', {})).resolves.toBeUndefined();
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test('secrets in log metadata are redacted', () => {
  const winston = require('winston');
  const { Writable } = require('stream');
  const lines = [];
  const sink = new Writable({ write(chunk, enc, cb) { lines.push(chunk.toString()); cb(); } });
  const stream = new winston.transports.Stream({ stream: sink, format: winston.format.json() });
  logger.add(stream);
  logger.info('test', { password: 'hunter2', token: 'abc', passwordHash: 'x', userId: '1' });
  logger.remove(stream);
  const out = lines.join('');
  expect(out).not.toMatch(/hunter2|"abc"/);
  expect(out).toContain('[REDACTED]');
  expect(out).toContain('"userId":"1"');
});
