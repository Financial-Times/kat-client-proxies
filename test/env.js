'use-strict';

const MYFT_USER_UUID = process.env.MYFT_USER_UUID;
const MYFT_LICENCE_UUID = process.env.MYFT_LICENCE_UUID;
const MYFT_USE_MOCK_API = process.env.MYFT_USE_MOCK_API || true;

module.exports = {
	MYFT_USER_UUID,
	MYFT_LICENCE_UUID,
	MYFT_USE_MOCK_API
};
