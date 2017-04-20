'use strict';

const env = require('./../helpers/env');

module.exports = {
  validUser: env.USER_UUID,
  validLicence: env.LICENCE_UUID,
  validUserEmail: env.USER_EMAIL,
  invalidUserEmail: env.INVALID_EMAIL,
  invalidUser: 'd10fe486-e38f-4f01-adf7-ec80606fd915',
  invalidLicence: '69e5b8b3-9d05-4e6c-b48a-fd6d3de20ad3',
  validKey: 'd95bcac-b934-4d42-82ed-438d0b5bad39',
  invalidKey: '08032ca5-9197-4b3b-8810-0a81d31c1eb8'
};
