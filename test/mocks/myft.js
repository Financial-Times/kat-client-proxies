'use-strict';


const fetchMock = require('fetch-mock');
const log = require('@financial-times/n-logger').default;
const uuids = require('./uuids');
const baseUrl = require('../../lib/config').myFTURL;

module.exports=register;

function register() {
	getUrlMapping.forEach((mapping)=>{
		fetchMock.mock(
				mapping.matcher,
				mapping.response
		);
	});
}

const validEmailDigestPreferences = '{"name":"Digest email","uuid":"email-digest","_rel":{"byTool":"KMT","created":1480504162182,"timezone":"Europe/London","count":1,"type":"daily","updated":1480504162182,"byUser":"8619e7a0-65b7-446b-9931-4197b3fe0cbf"}}';

const validUsersArray = '[{"uuid":"09795e3b-d0ef-4e8e-b8ff-5dece7f29cf7"},{"uuid":"c099605f-94ea-40bb-b5ea-e666fd3996b9"}]';

const getUrlMapping = [
	{
		matcher: `^${baseUrl}/user/${uuids.validUser}/preferred/preference/email-digest`,
		response : {
			body: validEmailDigestPreferences
		}
	},
	{
		matcher: `^${baseUrl}/user/${uuids.invalidUser}/preferred/preference/email-digest`,
		response : {
			body: null,
			status: 404
		}
	},
	{
		matcher: `^${baseUrl}/license/${uuids.validLicense}/preference/email-digest/preferred/user`,
		response : {
			body: validUsersArray
		}
	}
];
