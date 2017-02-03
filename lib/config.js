'use-strict';

const maxRetries = process.env.MAX_RETRIES || 5;
const retryDelay = process.env.RETRY_DELAY || 300;

const myFTURL = process.env.MYFT_API_URL || 'https://myft-api.ft.com/v3';
const myFTKey = process.env.MYFT_API_KEY;

const acqCtxURL = process.env.ACS_API_URL;
const acqCtxKey = process.env.ACS_API_KEY;

const userProfileURL = process.env.USER_PROFILE_API_URL;
const userProfileKey = process.env.USER_PROFILE_API_KEY;


const fetchOptions = {
	headers: {
			"Content-Type": "application/json"
	},
	agent: keepAlive,
	maxRetries,
	retryDelay
};

const config = {
	fetchOptions,
	myFTURL,
	myFTKey,
	acqCtxURL,
	acqCtxKey,
	userProfileURL,
	userProfileKey
};

module.exports = config;
