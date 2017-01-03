'use-strict';

require('dotenv').config();

const USE_MOCK_API = process.env.USE_MOCK_API === 'false' ? false : true;
const USER_UUID = USE_MOCK_API ? null : process.env.USER_UUID ;
const LICENCE_UUID = USE_MOCK_API ? null : process.env.LICENCE_UUID;

const FT_API_URL = `https://api.ft.com`;

module.exports = {
	USER_UUID,
	LICENCE_UUID,
	USE_MOCK_API,
	FT_API_URL
};
