const winston = require('winston');
const DatadogWinston = require('datadog-winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Still log to console (for Render's log viewer)
    new winston.transports.Console(),

    // Ship logs directly to Datadog via HTTP
    new DatadogWinston({
      apiKey: process.env.DD_API_KEY,
      hostname: 'dollarstore-api',
      service: 'dollarstore-api',
      ddsource: 'nodejs',
      ddtags: `env:${process.env.NODE_ENV || 'production'}`,
      site: 'us5.datadoghq.com',
    }),
  ],
});

module.exports = logger;