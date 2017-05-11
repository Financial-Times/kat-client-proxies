'use strict';

require('dotenv').config({silent: true});

const envVars = process.env;

module.exports = {
  USE_MOCK_API: envVars.USE_MOCK_API !== 'false',
  USER_UUID: envVars.USER_UUID || 'c62c4485-7183-494c-a947-d754f5cd0a15',
  USER_EMAIL: envVars.USER_EMAIL || 'ciprian.lujeru@ft.com',
  LICENCE_UUID: envVars.LICENCE_UUID || '8eb26ed7-68c8-44c6-b6ce-52d61500f301',
  INVALID_EMAIL: envVars.INVALID_EMAIL || 'v.lenin@ft.com',
  VALID_TOPIC: envVars.VALID_TOPIC || 'YzEwYmY1N2YtYzJkNS00MzAxLWFkYmMtZmRjYzRjZDA4Y2Y0-VG9waWNz',
  VALID_FT_SESSION: envVars.VALID_FT_SESSION,
  VALID_SECURE_FT_SESSION: envVars.VALID_SECURE_FT_SESSION,
  VALID_API_AUTH_TOKEN: envVars.VALID_API_AUTH_TOKEN
};
