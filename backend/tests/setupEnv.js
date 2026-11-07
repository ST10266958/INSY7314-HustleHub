// Runs before every test file. No real database or secrets are needed.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-for-jest-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/hustlehub-test';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.LOCKOUT_MAX_ATTEMPTS = '3';
process.env.LOCKOUT_MINUTES = '15';
process.env.DOTENV_CONFIG_QUIET = 'true';
