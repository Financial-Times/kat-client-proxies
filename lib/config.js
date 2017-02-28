'use strict';

// maxRetries & retryDelay aren't currently used
const maxRetries = process.env.MAX_RETRIES || 5;
const retryDelay = process.env.RETRY_DELAY || 300;

const myFTURL = process.env.MYFT_API_URL || 'https://myft-api.ft.com/v3';
const myFTKey = process.env.MYFT_API_KEY;

const acqCtxURL = process.env.ACS_API_URL;
const acqCtxKey = process.env.ACS_API_KEY;

const userProfileURL = process.env.USER_PROFILE_API_URL;
const userProfileKey = process.env.USER_PROFILE_API_KEY;

const accLicenceURL = process.env.ALS_API_URL;
const accLicenceKey = process.env.ALS_API_KEY;

const toolIdentifier = process.env.FT_TOOL_ID || 'KAT';
const defaultAdminId = process.env.FT_TOOL_ADMIN_ID;
const toolDateIdentifier = process.env.FT_TOOL_DATE_ID || 'katRegistrationDate';


const fetchOptions = {
	headers: {
			"Content-Type": "application/json"
	},
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
	userProfileKey,
	accLicenceURL,
	accLicenceKey,
	toolIdentifier,
	defaultAdminId,
	toolDateIdentifier
};

module.exports = config;
