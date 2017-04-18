'use strict';

const uuids = require('./uuids');
const registerMyFT = require('./myFT');
const registerAcquisitionCtx = require('./acquisitionCtx');
const registerClientErrors = require('./clientErrors');
const registerAccessLicence = require('./accessLicence');
const registerUserProfile = require('./userProfile');

module.exports = {
	uuids,
	registerMyFT,
	registerAcquisitionCtx,
	registerClientErrors,
	registerAccessLicence,
	registerUserProfile
};
