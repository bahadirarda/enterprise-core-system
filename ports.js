require('dotenv').config({ path: require('path').resolve(__dirname, '.env.ports') });

module.exports = {
  PORTAL_PORT: process.env.PORTAL_PORT || 4001,
  HRMS_PORT: process.env.HRMS_PORT || 4002,
  ADMIN_PORT: process.env.ADMIN_PORT || 4003,
  STATUS_PORT: process.env.STATUS_PORT || 4004,
  AUTH_PORT: process.env.AUTH_PORT || 4000,
};
