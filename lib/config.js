'use-strict';

const maxRetries = process.env.MAX_RETRIES || 5;
const retryDelay = process.env.RETRY_DELAY || 300;

const myFTURL = process.env.MYFT_API_URL || 'https://myft-api.ft.com/v3';
const myFTKey = process.env.MYFT_API_KEY;

const acqCtxURL = process.env.ACQ_API_URL;
const acqCtxKey = process.env.ACQ_API_KEY;


const options = {
	headers: {
			"Content-Type": "application/json"
	},
	maxRetries,
	retryDelay
};

module.exports = {
	options,
	myFTURL,
	myFTKey,
	acqCtxURL,
	acqCtxKey
};
