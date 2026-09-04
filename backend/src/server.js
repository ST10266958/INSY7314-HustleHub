/*
Loads environment variables before the other application files
are imported.


*/
require('dotenv').config();

/*
Imports the built-in Node.js HTTPS module.
*/
const https = require('https');

/*
Imports the configured Express application from app.js.
*/
const app = require('./app');

/*
Imports the private-key and certificate configuration.
*/
const httpsOptions = require('./config/httpsConfig');

/*
Imports the structured logger and the centralised environment config.
*/
const logger = require('./config/logger');
const { port, appName, nodeEnv } = require('./config/env');



const startServer = async () => {
  try {
    const server = https.createServer(httpsOptions, app);

    /*
    Starts listening for incoming HTTPS requests.
    */
    server.listen(port, () => {
      logger.info(`${appName} is running securely on https://localhost:${port} [${nodeEnv}]`);
    });

    /*
    Handles server startup errors.

    
    */
    server.on('error', (error) => {
      logger.error('The HustleHub+ server could not start.', { message: error.message });
      process.exit(1);
    });
  } catch (error) {
    logger.error('HustleHub+ failed to start.', { message: error.message });
    process.exit(1);
  }
};

startServer();
