const fs = require('fs');
const path = require('path');
const { sslKeyPath, sslCertPath } = require('./env');
const logger = require('./logger');

const keyPath = path.join(__dirname, '..', '..', sslKeyPath);
const certPath = path.join(__dirname, '..', '..', sslCertPath);

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  logger.error('SSL certificate/key not found. Generate certificates/privatekey.pem and certificates/certificate.pem before starting the server.');
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

module.exports = httpsOptions;