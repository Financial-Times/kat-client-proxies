'use strict';

require('dotenv').config({silent: true});

const myFTClient = require('./lib/myFTClient');
const acquisitionCtxClient = require('./lib/acquisitionCtxClient');
const userProfileClient = require('./lib/userProfileClient');
const clientErrors = require('./lib/statusErrors');
const accessLicenceClient = require('./lib/accessLicenceClient');
const kinesisClient = require('./lib/kinesisClient');

module.exports={
	myFTClient,
	acquisitionCtxClient,
	userProfileClient,
	clientErrors,
	kinesisClient,
	accessLicenceClient
};
