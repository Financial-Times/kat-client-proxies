'use-strict';

const acqCtx = require('../index').acquisitionCtxClient;

const fetchMock = require('fetch-mock');
const expect = require("chai").expect;
const config = require('../lib/config');
const mocks = require('./mocks');
const statusErrors = require('../lib/statusErrors');
const env = require('./env');

const expectOwnProperties = require('./expectExtensions').expectOwnProperties;


describe('Acquisition Context Service Client', function () {

	const mockAPI = env.USE_MOCK_API;
	if (mockAPI) {
		mocks.registerAcquisitionCtx();
	}
	this.timeout('30s');

	describe('getContexts', function () {

		it('Should get an Acquisition Context for a valid licence uuid', (done) => {
			acqCtx.getContexts({'access-licence-id':mocks.uuids.validLicence})
			.then((ctxList)=>{
				expect(ctxList).to.be.an.instanceof(Array);
				expectOwnProperties(ctxList, ['id', 'name', 'displayName', 'marketable', 'lastUpdated', 'signupContext', 'barrierContext']);
				if (mockAPI) {
					expect(ctxList).to.have.lengthOf(1);
				}
				expect(ctxList[0].signupContext.accessLicenceId).to.equal(mocks.uuids.validLicence);
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});

		it('Should get an empty Acquisition Context list for a invalid licence uuid', (done) => {
			acqCtx.getContexts({'access-licence-id':mocks.uuids.invalidLicence})
			.then((ctxList)=>{
				expect(ctxList).to.be.an.instanceof(Array);
				expect(ctxList).to.have.lengthOf(0);
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});

	});

});
