require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  appName: process.env.APP_NAME || 'HustleHub+ API',
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  sslKeyPath: process.env.SSL_KEY_PATH || 'certificates/privatekey.pem',
  sslCertPath: process.env.SSL_CERT_PATH || 'certificates/certificate.pem',
};