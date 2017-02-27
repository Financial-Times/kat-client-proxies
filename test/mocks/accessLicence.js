'use strict';

const log = require('@financial-times/n-logger').default;
const uuids = require('./uuids');
const baseUrl = require('../../lib/config').accLicenceURL;

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
		matcher: `${baseUrl}/licences?userid=${uuids.validUser}`,
		response : {
			body: require('./fixtures/accessLicenceGetLicence')
		}
	},
	{
		matcher: `${baseUrl}/licences?userid=${uuids.invalidUser}`,
		response : {
			body: {accessLicences:[]}
		}
	},
	{
		matcher: `${baseUrl}/licences/${uuids.validLicence}/seats`,
		response : {
			body: require('./fixtures/accessLicenceGetSeats')
		}
	},
	{
		matcher: `${baseUrl}/licences/${uuids.invalidLicence}/seats`,
		response : {
			body: {seats:[], "allocatedSeatCount":0}
		}
	}
];
