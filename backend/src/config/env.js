require('dotenv').config();

function required(name, fallback) {
  // `name` is always a hard-coded literal from this file, never user input.
  const value = process.env[name] ?? fallback; // eslint-disable-line security/detect-object-injection
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = required('JWT_SECRET');

// A short signing secret can be brute-forced offline, so production refuses to start with one.
if (nodeEnv === 'production' && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters when NODE_ENV=production.');
}

module.exports = {
  appName: process.env.APP_NAME || 'HustleHub+ API',
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,
  jwtSecret,
  mongoUri: required('MONGODB_URI'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  sslKeyPath: process.env.SSL_KEY_PATH || 'certificates/privatekey.pem',
  sslCertPath: process.env.SSL_CERT_PATH || 'certificates/certificate.pem',
  logDir: process.env.LOG_DIR || 'logs',
  lockoutMaxAttempts: parseInt(process.env.LOCKOUT_MAX_ATTEMPTS, 10) || 5,
  lockoutMinutes: parseInt(process.env.LOCKOUT_MINUTES, 10) || 15,
  resetTokenMinutes: parseInt(process.env.RESET_TOKEN_MINUTES, 10) || 15,
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'HustleHub+ <no-reply@hustlehub.local>',
  },
  auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 90,
};
