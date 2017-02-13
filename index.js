'use-strict';

require('dotenv').config({silent: true});
require('isomorphic-fetch');

const myFTClient = require('./lib/myFTClient');
const acquisitionCtxClient = require('./lib/acquisitionCtxClient');
const userProfileClient = require('./lib/userProfileClient');
const clientErrors = require('./lib/statusErrors');

module.exports={
	myFTClient,
	acquisitionCtxClient,
	userProfileClient,
	clientErrors
};
