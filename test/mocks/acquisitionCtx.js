'use-strict';

const log = require('@financial-times/n-logger').default;
const uuids = require('./uuids');
const baseUrl = require('../../lib/config').acqCtxURL;

module.exports=register;

function register() {
	const fetchMock = require('fetch-mock');
	getUrlMapping.forEach((mapping)=>{
		fetchMock.mock(
				mapping.matcher,
				mapping.response
		);
	});
}

const getUrlMapping = [
	{
		matcher: `${baseUrl}?access-licence-id=${uuids.validLicence}`,
		response : {
			body: require('./fixtures/acquisitionContext')
		}
	},
	{
		matcher: `${baseUrl}?access-licence-id=${uuids.invalidLicence}`,
		response : {
			body: {items:[]}
		}
	}
];
