const mongoose = require('mongoose');
const logger = require('./logger');
const { mongoUri } = require('./env');

async function connectDB() {
  await mongoose.connect(mongoUri);
  logger.info('Connected to MongoDB');
}

module.exports = connectDB;
