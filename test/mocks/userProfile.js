'use strict';

const log = require('@financial-times/n-logger').default;
const uuids = require('./uuids');
const baseUrl = require('../../lib/config').userProfileURL;
const qs = require('querystring');

module.exports=register;

function register() {
	const fetchMock = require('fetch-mock');
	getUrlMapping.forEach((mapping)=>{
		// console.log(`**********\n*  ${mapping.matcher}   * \n ***********}`);
		fetchMock.mock(
				mapping.matcher,
				mapping.response
		);
	});
}

const getUrlMapping = [
	{
		matcher: `${baseUrl}?${qs.stringify({email:uuids.validUserEmail})}`,
		response : {
			body: require('./fixtures/userProfile')
		}
	},
	{
		matcher: `${baseUrl}?${qs.stringify({email:uuids.invalidUserEmail})}`,
		response : {
			body: {items:[]}
		}
	}
];
