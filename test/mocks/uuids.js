'use strict';

const env = require('../env');

const validUser = env.USER_UUID || '9289e58a-2e61-42c7-a92f-4bfc170634e4';
const validLicence =  env.LICENCE_UUID || '8619e7a0-65b7-446b-9931-4197b3fe0cbf';
const adminUser = env.ADMIN_UUID || '2e0f0540-c517-41bb-9843-3f46f5ba1708';

const invalidUser = 'd10fe486-e38f-4f01-adf7-ec80606fd915';
const invalidLicence = '69e5b8b3-9d05-4e6c-b48a-fd6d3de20ad3';

const validKey = 'd95bcac-b934-4d42-82ed-438d0b5bad39';
const invalidKey = '08032ca5-9197-4b3b-8810-0a81d31c1eb8';

const validUserEmail = env.USER_EMAIL || 'dan.murphy@ft.com';
const invalidUserEmail = env.INVALID_EMAIL || 'v.lenin@ft.com';

const concept = 'TnN0ZWluX09OX0ZvcnR1bmVDb21wYW55X0FBUEw=-T04=';

module.exports = {
	validUser,
	validUserEmail,
	validLicence,
	invalidUser,
	invalidLicence,
	validKey,
	invalidKey,
	invalidUserEmail,
	concept
};
