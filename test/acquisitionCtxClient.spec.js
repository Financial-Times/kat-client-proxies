'use strict';

const proxies = require('./../index');
const acqCtx = proxies.acquisitionCtxClient;
const uuids = require('./mocks/uuids');
const expect = require('chai').expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const baseUrl = `${require('./../lib/helpers/config').API_GATEWAY_HOST}/acquisition-contexts/v1`;

describe('Acquisition Context Service Client', () => {
	let logMessageStub;
	const logMessages = [];

	before(done => {
		logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
			logMessages.push(params);
		});

		done();
	});

	after(done => {
			nock.cleanAll();

		logMessageStub.restore();

		done();
	});

	describe('getContexts', () => {

		it('Should get an Acquisition Context for a valid licence uuid', done => {
			nock(baseUrl)
				.get(`?access-licence-id=${uuids.validLicence}`)
				.reply(200, () => require('./mocks/fixtures/acquisitionContext'));

			acqCtx.getContexts({'access-licence-id': uuids.validLicence})
				.then(ctxList => {
					expect(ctxList).to.be.an('object');
					expectOwnProperties(ctxList, ['id', 'name', 'displayName', 'marketable', 'lastUpdated', 'signupContext', 'barrierContext']);

					expect(Object.keys(ctxList).length).to.equal(10);

					expect(ctxList.signupContext.accessLicenceId).to.equal(uuids.validLicence);

					done();
				})
				.catch(done);
		});

		it('Should get an empty Acquisition Context list for a invalid licence uuid', done => {
			nock(baseUrl)
				.get(`?access-licence-id=${uuids.invalidLicence}`)
				.reply(200, () => ({items: []}));

			acqCtx.getContexts({'access-licence-id': uuids.invalidLicence})
				.then(ctxList => {
					expect(ctxList).to.be.an('undefined');

					done();
				})
				.catch(done);
		});

	});

});
