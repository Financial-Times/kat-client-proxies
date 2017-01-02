'use-strict';

require('dotenv').config({silent: true});
require('isomorphic-fetch');

const myFTClient = require('./lib/myFTClient');
const acquisitionCtxClient = require('./lib/acquisitionCtxClient');

module.exports={
	myFTClient,
	acquisitionCtxClient
};
