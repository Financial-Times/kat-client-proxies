'use strict';

const uuids = require('./uuids');
const registerMyFT = require('./myFT');
const registerAcquisitionCtx = require('./acquisitionCtx');
const registerStatusErrors = require('./statusErrors');
const registerAccessLicence = require('./accessLicence');

module.exports = {
	uuids,
	registerMyFT,
	registerAcquisitionCtx,
	registerStatusErrors,
	registerAccessLicence
};
