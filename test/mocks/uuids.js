'use strict';

const env = require('./../helpers/env');

module.exports = {
  validUser: '00000000-0000-0000-0000-000000000003',
  validLicence: env.LICENCE_UUID,
  validUserEmail: env.USER_EMAIL,
  invalidUserEmail: env.INVALID_EMAIL,
  invalidUser: 'useruser',
  invalidLicence: 'licencetest',
  invalidKey: 'invalidkey123',
  validTopic: env.VALID_TOPIC,
  invalidTopic: '00000000-0000-0000-0000-000000000006',
  validFTSession: env.VALID_FT_SESSION,
  invalidFTSession: 'invalid-test123test',
  validFTSessionSecure: env.VALID_SECURE_FT_SESSION || 'valid-secure-test123test',
  invalidFTSessionSecure: 'invalid-secure-test123test',
  validApiAuthToken: env.VALID_API_AUTH_TOKEN || 'valid-api-token-test123test',
  invalidApiAuthToken: env.VALID_API_AUTH_TOKEN || 'invalid-api-token-test123test',
  mockNewTopic: '00000000-0000-0000-0000-000000000222'
};
