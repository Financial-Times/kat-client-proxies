'use strict';

const uuids = require('./uuids');
const registerMyFT = require('./myFT');
const registerAcquisitionCtx = require('./acquisitionCtx');
const registerStatusErrors = require('./statusErrors');
const registerAccessLicence = require('./accessLicence');
const registerUserProfile = require('./userProfile');

module.exports = {
	uuids,
	registerMyFT,
	registerAcquisitionCtx,
	registerStatusErrors,
	registerAccessLicence,
	registerUserProfile
};
