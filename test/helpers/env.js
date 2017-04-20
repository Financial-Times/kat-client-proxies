'use strict';

require('dotenv').config();

module.exports = {
	USE_MOCK_API: process.env.USE_MOCK_API !== 'false',
	USER_UUID: process.env.USER_UUID || 'c62c4485-7183-494c-a947-d754f5cd0a15',
	USER_EMAIL: process.env.USER_EMAIL || 'ciprian.lujeru@ft.com',
	LICENCE_UUID: process.env.LICENCE_UUID || '8eb26ed7-68c8-44c6-b6ce-52d61500f301',
	INVALID_EMAIL: process.env.INVALID_EMAIL || 'v.lenin@ft.com'
};
