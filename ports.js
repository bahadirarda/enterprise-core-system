require('dotenv').config({ path: require('path').resolve(__dirname, '.env.ports') });

module.exports = {
  PORTAL_PORT: process.env.PORTAL_PORT || 3001,
  HRMS_PORT: process.env.HRMS_PORT || 3002,
  ADMIN_PORT: process.env.ADMIN_PORT || 8080,
  STATUS_PORT: process.env.STATUS_PORT || 8081,
  AUTH_PORT: process.env.AUTH_PORT || 3000,
};
