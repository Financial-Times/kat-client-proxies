'use strict';

const config = require('../../lib/config');
const env = require('../env');
const uuids = require('./uuids');

function register() {
	const fetchMock = require('fetch-mock');
	urlMapping.forEach((mapping)=>{
		fetchMock.mock(
				mapping.matcher,
				mapping.response,
				mapping.options
		);
	});
}

const headers = Object.assign({}, config.fetchOptions.headers);

const urlMapping = [
	{
		matcher: `${config.myFTURL}`,
		response : {
			status: 200
		},
		options : {
			headers : {'X-API-KEY': config.myFTKey}
		}
	},
	{
		matcher: `${config.myFTURL}`,
		response : {
			status: 401
		},
		options : {
			headers : {'X-API-KEY': uuids.invalidKey}
		}
	},
	{
		matcher: `${config.myFTURL}`,
		response : {
			status: 401
		},
	},
	{
		matcher: `${config.myFTURL}/doesNotExist`,
		response : {
			status: 404
		},
	}
];

module.exports=register;
