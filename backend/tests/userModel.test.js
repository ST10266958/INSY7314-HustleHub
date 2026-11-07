jest.mock('../src/models/User', () => ({ findOneAndUpdate: jest.fn(), updateOne: jest.fn() }));

const User = require('../src/models/User');
const userModel = require('../src/models/userModel');

beforeEach(() => jest.clearAllMocks());

describe('account lockout (LOCKOUT_MAX_ATTEMPTS=3 in tests)', () => {
  const user = { _id: 'u1' };

  test('failed attempts below the limit only increment the counter', async () => {
    User.findOneAndUpdate.mockResolvedValue({ failedLoginAttempts: 2 });
    const result = await userModel.registerFailedLogin(user);
    expect(result).toEqual({ locked: false, attempts: 2 });
    expect(User.updateOne).not.toHaveBeenCalled();
  });

  test('reaching the limit sets lockUntil in the future and resets the counter', async () => {
    User.findOneAndUpdate.mockResolvedValue({ failedLoginAttempts: 3 });
    const result = await userModel.registerFailedLogin(user);
    expect(result.locked).toBe(true);
    const update = User.updateOne.mock.calls[0][1].$set;
    expect(update.failedLoginAttempts).toBe(0);
    expect(update.lockUntil.getTime()).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
  });

  test('isLocked is true only while lockUntil is in the future', () => {
    expect(userModel.isLocked({ lockUntil: new Date(Date.now() + 60000) })).toBe(true);
    expect(userModel.isLocked({ lockUntil: new Date(Date.now() - 60000) })).toBe(false);
    expect(userModel.isLocked({})).toBe(false);
  });

  test('a successful login clears the lockout state, but only when there is something to clear', async () => {
    await userModel.resetLoginState({ _id: 'u1', failedLoginAttempts: 0 });
    expect(User.updateOne).not.toHaveBeenCalled();
    await userModel.resetLoginState({ _id: 'u1', failedLoginAttempts: 2 });
    expect(User.updateOne).toHaveBeenCalledWith({ _id: 'u1' }, { $set: { failedLoginAttempts: 0 }, $unset: { lockUntil: 1 } });
  });

  test('toPublic never exposes the hash or lockout fields', () => {
    const out = userModel.toPublic({ id: '1', email: 'a@b.co', role: 'client', passwordHash: 'x', failedLoginAttempts: 1, createdAt: 'now' });
    expect(Object.keys(out).sort()).toEqual(['createdAt', 'email', 'id', 'role']);
  });
});
