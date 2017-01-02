'use-strict';

const env = require('../env');

const validUser = env.MYFT_USER_UUID || '9289e58a-2e61-42c7-a92f-4bfc170634e4';
const validLicence =  env.MYFT_LICENCE_UUID|| '8619e7a0-65b7-446b-9931-4197b3fe0cbf';

const invalidUser = 'd10fe486-e38f-4f01-adf7-ec80606fd915';
const invalidLicence = '69e5b8b3-9d05-4e6c-b48a-fd6d3de20ad3';

module.exports = {
	validUser,
	validLicence,
	invalidUser,
	invalidLicence
};
