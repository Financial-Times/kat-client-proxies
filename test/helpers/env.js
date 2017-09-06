'use strict';

require('dotenv').config({silent: true});

const envVars = process.env;

module.exports = {
  USE_MOCK_API: envVars.USE_MOCK_API !== 'false',
  USER_UUID: envVars.USER_UUID,
  USER_EMAIL: envVars.USER_EMAIL,
  LICENCE_UUID: envVars.LICENCE_UUID,
  INVALID_EMAIL: envVars.INVALID_EMAIL || 'test',
  VALID_TOPIC: envVars.VALID_TOPIC || 'YzEwYmY1N2YtYzJkNS00MzAxLWFkYmMtZmRjYzRjZDA4Y2Y0-VG9waWNz',
  VALID_FT_SESSION: envVars.VALID_FT_SESSION,
  VALID_SECURE_FT_SESSION: envVars.VALID_SECURE_FT_SESSION,
  VALID_API_AUTH_TOKEN: envVars.VALID_API_AUTH_TOKEN,
  HUI_BASE_PATH: envVars.HUI_BASE_PATH,
  HUI_API_KEY: envVars.HUI_API_KEY
};
