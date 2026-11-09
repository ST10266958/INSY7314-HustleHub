const User = require('./User');
const { lockoutMaxAttempts, lockoutMinutes } = require('../config/env');

async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

async function findById(id) {
  try {
    return await User.findById(id);
  } catch {
    return null;
  }
}

async function create({ email, passwordHash, role }) {
  return User.create({ email: email.toLowerCase(), passwordHash, role });
}

function isLocked(user) {
  return Boolean(user.lockUntil && user.lockUntil.getTime() > Date.now());
}

/**
 * Counts a failed login atomically. When the limit is reached the account is locked
 * for LOCKOUT_MINUTES and the counter is reset. Returns { locked, attempts }.
 */
async function registerFailedLogin(user) {
  const updated = await User.findOneAndUpdate(
    { _id: user._id },
    { $inc: { failedLoginAttempts: 1 } },
    { new: true }
  );
  const attempts = updated ? updated.failedLoginAttempts : 0;

  if (attempts >= lockoutMaxAttempts) {
    await User.updateOne(
      { _id: user._id },
      { $set: { failedLoginAttempts: 0, lockUntil: new Date(Date.now() + lockoutMinutes * 60 * 1000) } }
    );
    return { locked: true, attempts };
  }
  return { locked: false, attempts };
}

async function resetLoginState(user) {
  if (!user.failedLoginAttempts && !user.lockUntil) return;
  await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0 }, $unset: { lockUntil: 1 } });
}

/** Stores the hash of a freshly issued reset token. A newer request replaces any older token. */
async function setResetToken(user, tokenHash, expires) {
  await User.updateOne(
    { _id: user._id },
    { $set: { resetPasswordTokenHash: tokenHash, resetPasswordExpires: expires } }
  );
}

/**
 * Atomically swaps in the new password hash if (and only if) the token matches and has not expired.
 * Because the token fields are cleared in the same operation, a token can be used exactly once.
 * A successful reset also clears any lockout, since the owner has proven control of the mailbox.
 * Returns the updated user, or null when the token is invalid/expired/used.
 */
async function consumeResetToken(tokenHash, newPasswordHash) {
  return User.findOneAndUpdate(
    { resetPasswordTokenHash: tokenHash, resetPasswordExpires: { $gt: new Date() } },
    {
      $set: { passwordHash: newPasswordHash, failedLoginAttempts: 0 },
      $unset: { resetPasswordTokenHash: 1, resetPasswordExpires: 1, lockUntil: 1 },
    },
    { new: true }
  );
}

function toPublic(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = {
  findByEmail, findById, create, isLocked, registerFailedLogin, resetLoginState,
  setResetToken, consumeResetToken, toPublic,
};
