const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/password');
const { ROLES } = require('../src/constants/roles');

async function normaliseEmail(raw) {
  const req = { body: { email: raw } };
  await body('email').trim().isEmail().normalizeEmail().run(req);
  return validationResult(req).isEmpty() ? req.body.email : null;
}

function passwordProblem(password) {
  if (password.length < 8 || password.length > 128) return 'Password must be between 8 and 128 characters.';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain a number.';
  return null;
}

async function main() {
  const rawEmail = process.env.ADMIN_EMAIL || '';
  const password = process.env.ADMIN_PASSWORD || '';

  if (!rawEmail || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.');
    process.exit(1);
  }

  const email = await normaliseEmail(rawEmail);
  if (!email) {
    console.error('ADMIN_EMAIL is not a valid email address.');
    process.exit(1);
  }

  const problem = passwordProblem(password);
  if (problem) {
    console.error(problem);
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(
      existing.role === ROLES.ADMIN
        ? 'An admin account with that email already exists. Nothing changed.'
        : 'That email already belongs to a non-admin account. Nothing changed.'
    );
  } else {
    const passwordHash = await hashPassword(password);
    await User.create({ email, passwordHash, role: ROLES.ADMIN });
    console.log(`Admin account created for ${email}.`);
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Could not create the admin account:', err.message);
    process.exit(1);
  });
}

module.exports = { normaliseEmail, passwordProblem };
