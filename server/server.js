require('dd-trace').init({
  service: 'swe40006-backend',
  env: 'production',
  logInjection: true
});

console.log('Datadog tracing initialized successfully');

const app = require('./app');

const logger = require('./utils/logger');

// Log every incoming request
app.use((req, res, next) => {
  res.on('finish', () => {
    const level = res.statusCode >= 400 ? 'error' : 'info';
    logger.log(level, `${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: Date.now() - req._startTime,
    });
  });
  req._startTime = Date.now();
  next();
});

// Log errors in error handler
app.use((err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.url,
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Dollar Shop API running on http://localhost:${PORT}`);
  logger.info(`Server started on port ${PORT}`);
});
