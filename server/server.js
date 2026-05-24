require('dd-trace').init({
  service: 'swe40006-backend',
  env: 'production',
  logInjection: true
});

const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Dollar Shop API running on http://localhost:${PORT}`);
});
