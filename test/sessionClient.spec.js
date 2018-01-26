'use strict';

const proxies = require('./../index');
const sessionClient = proxies.sessionClient;
const uuids = require('./mocks/uuids');
const expect = require('chai').expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const clientErrors = proxies.clientErrors;
const env = require('./helpers/env');
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const mockAPI = env.USE_MOCK_API;
const config = require('./../lib/helpers/config');
const baseUrl = 'https://api.ft.com';

describe('Session Client', () => {
	let logMessageStub;
	const logMessages = [];

	before(done => {
		logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
			logMessages.push(params);
		});

		done();
	});

	after(done => {
		if (mockAPI) {
			nock.cleanAll();
		}

		logMessageStub.restore();

		done();
	});

	describe('verify', () => {

		it('Should get user login info for a valid session when kat2fa flag is off', done => {
			if (mockAPI) {
				nock(baseUrl)
					.get(`/sessions/${uuids.validFTSessionSecure}`)
					.reply(200, () => require('./mocks/fixtures/sessionVerify'));
			}

			sessionClient.verify(uuids.validFTSessionSecure)
				.then(response => {
					expect(response).to.be.an('object');
					expectOwnProperties(response, ['uuid', 'creationTime', 'rememberMe']);
					expect(response.uuid).to.equal(uuids.validUser);

					done();
				})
				.catch(done);
		});

		it('Should throw a NotFoundError for an invalid session when kat2fa flag is off', done => {
			if (mockAPI) {
				nock(baseUrl)
					.get(`/sessions/${uuids.invalidFTSession}`)
					.reply(404, () => null);
			}

			sessionClient.verify(uuids.invalidFTSession)
				.then(() => {
					done(new Error('Nothing thrown'));
				})
				.catch(err => {
					expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

					done();
				});
		});


		it('Should get user login info for a valid secure session when kat2fa flag is on', done => {
			if (mockAPI) {
				nock(baseUrl)
					.get(`/sessions/s/${uuids.validFTSessionSecure}`)
					.reply(200, () => require('./mocks/fixtures/sessionVerify'));
			}

			sessionClient.verify(uuids.validFTSessionSecure, { kat2fa: true })
				.then(response => {
					expect(response).to.be.an('object');
					expectOwnProperties(response, ['uuid', 'creationTime', 'rememberMe']);
					expect(response.uuid).to.equal(uuids.validUser);

					done();
				})
				.catch(done);
		});

		it('Should throw a NotFoundError for an invalid session when kat2fa flag is on', done => {
			if (mockAPI) {
				nock(baseUrl)
					.get(`/sessions/s/${uuids.invalidFTSession}`)
					.reply(404, () => null);
			}

			sessionClient.verify(uuids.invalidFTSession, { kat2fa: true })
				.then(() => {
					done(new Error('Nothing thrown'));
				})
				.catch(err => {
					expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

					done();
				});
		});

	});

	describe('getAuthToken', () => {
		const scope = 'licence_data';
		const urlPath = `/authorize?response_type=token&client_id=${config.API_AUTH_CLIENT_ID}&redirect_uri=${config.DEFAULT_REDIRECT_URL}&scope=${scope}`;

		it('Should get the auth token for valid secure session', done => {
			if (mockAPI) {
				nock(baseUrl)
					.get(urlPath)
					.reply(200, () => ({
						url: `https://www.ft.com/#access_token=valid-access-token&scope=${scope}&token_type=bearer&expires_in=1800`,
						status: 200
					}));
			}

			sessionClient.getAuthToken(uuids.validFTSessionSecure, scope, mockAPI)
				.then(response => {
					expect(response).to.be.an('string');

					done();
				})
				.catch(done);
		});

		it('Should throw a NotAuthorisedError for an invalid secure session', done => {
			if (mockAPI) {
				nock(baseUrl)
					.get(urlPath)
					.reply(200, () => ({
						url: 'https://www.ft.com/#error=invalid_grant&error_description=Invalid%20FT%20user%20session.',
						status: 200
					}));
			}

			sessionClient.getAuthToken(uuids.invalidFTSessionSecure, scope, mockAPI)
				.then(() => {
					done(new Error('Nothing thrown'));
				})
				.catch(err => {
					expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);

					done();
				});
		});

		if (mockAPI) {
			it('Should throw a ClientError for an unexpected error format for an invalid secure session', done => {
				nock(baseUrl)
					.get(urlPath)
					.reply(200, () => ({
						url: 'https://www.ft.com/#unexpected-error=invalid_grant&error_description=Invalid%20FT%20user%20session.',
						status: 200
					}));

				sessionClient.getAuthToken(uuids.invalidFTSessionSecure, scope, mockAPI)
					.then(() => {
						done(new Error('Nothing thrown'));
					})
					.catch(err => {
						expect(err).to.be.an.instanceof(clientErrors.ClientError);

						done();
					});
			});
		}

	});

});
