const User = require('./User');

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

function toPublic(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = { findByEmail, findById, create, toPublic };
