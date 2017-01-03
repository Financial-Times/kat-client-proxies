'use strict';

const fetchMock = require('fetch-mock');
const config = require('../../lib/config');
const env = require('../env');

function register() {
	urlMapping.forEach((mapping)=>{
		console.log(mapping);
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
		matcher: `${env.FT_API_URL}`,
		response : {
			status: 401
		},
	}
];

module.exports=register;
