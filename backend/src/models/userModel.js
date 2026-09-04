const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ROLES } = require('../constants/roles');

// Part 1 explicitly permits in-memory or file-based storage in place of a
// real database. This module keeps that storage behind a small interface
// (findByEmail / create / findById) so that swapping in MongoDB/Mongoose in
// Part 2 only requires changing this file, not any controller code.

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function readAll() {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(users) {
  ensureStore();
  // Write to a temp file then rename, to avoid corrupting the store if the
  // process is interrupted mid-write.
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(users, null, 2), 'utf8');
  fs.renameSync(tmpFile, DATA_FILE);
}

function findByEmail(email) {
  const users = readAll();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function findById(id) {
  const users = readAll();
  return users.find((u) => u.id === id) || null;
}

/**
 * Creates a user record. `passwordHash` must already be a bcrypt hash -
 * this layer never accepts or persists plain-text passwords.
 */
function create({ email, passwordHash, role }) {
  
  if (!Object.values(ROLES).includes(role)) {
    throw new Error(`Cannot create user with unknown role: ${role}`);
  }

  const users = readAll();
  const user = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeAll(users);
  return user;
}

/** Returns a safe copy of a user record with the password hash stripped out. */
function toPublic(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = { findByEmail, findById, create, toPublic };
