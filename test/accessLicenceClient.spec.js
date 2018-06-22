'use strict';

const proxies = require('./../index');
const accessLicence = proxies.accessLicenceClient;
const uuids = require('./mocks/uuids');
const expect = require('chai').expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const clientErrors = proxies.clientErrors;
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const baseUrl = require('./../lib/helpers/config').API_GATEWAY_HOST;

describe('Access Licence Service Client', () => {
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

	describe('getLicences', () => {

		it('Should get a list of Licence IDs for a valid UUID', done => {
			nock(baseUrl)
				.get(`/licences?userid=${uuids.validUser}`)
				.reply(200, () => require('./mocks/fixtures/accessLicenceGetLicence'));

			accessLicence.getLicences({userid: uuids.validUser})
				.then(licences => {
					expect(licences).to.be.an('array');
					expect(licences.length).to.be.at.least(1);
					expectOwnProperties(licences, ['id']);

					done();
				})
				.catch(done);
		});

		it('Should get an empty array for a invalid user UUID', done => {
			nock(baseUrl)
				.get(`/licences?userid=${uuids.invalidUser}`)
				.reply(200, () => ({accessLicences: []}));

			accessLicence.getLicences({userid: uuids.invalidUser})
				.then(licences => {
					expect(licences).to.be.an('array');
					expect(licences).to.have.lengthOf(0);

					done();
				})
				.catch(done);
		});
	});

	describe('getSeats', () => {

		it('Should get a list of seats for a valid licence UUID', done => {
			nock(baseUrl)
				.get(`/licences/${uuids.validLicence}/seats`)
				.reply(200, () => require('./mocks/fixtures/accessLicenceGetSeats'));

			accessLicence.getSeats(uuids.validLicence)
				.then(seats => {
					expect(seats).to.be.an('array');
					expect(seats.length).to.be.at.least(1);
					expectOwnProperties(seats, ['userId', 'accessLicenceId']);

					done();
				})
				.catch(done);
		});

		it('Should get an empty array for a invalid licence UUID', done => {
			nock(baseUrl)
				.get(`/licences/${uuids.invalidLicence}/seats`)
				.reply(200, () => ({seats: [], 'allocatedSeatCount': 0}));

			accessLicence.getSeats(uuids.invalidLicence)
				.then(seats => {
					expect(seats).to.be.an('array');
					expect(seats).to.have.lengthOf(0);

					done();
				})
				.catch(done);
		});
	});

	describe('getLicenceInfo', () => {
		it('Should get the info for a valid licence UUID', done => {
			nock(baseUrl)
				.get(`/licences/${uuids.validLicence}`)
				.reply(200, () => require('./mocks/fixtures/accessLicenceInfo'));

			accessLicence.getLicenceInfo(uuids.validLicence)
				.then(response => {
					expect(response).to.be.an('object');
					expectOwnProperties(response, ['id', 'creationDateTime', 'status', 'seatLimit', 'seatsHref', 'adminsHref']);
					expect(response.id).to.equal(uuids.validLicence);

					done();
				})
				.catch(done);
		});

		it('Should throw a NotFoundError for an invalid licence', done => {
			nock(baseUrl)
				.get(`/licences/${uuids.invalidLicence}`)
				.reply(404, () => null);

			accessLicence.getLicenceInfo(uuids.invalidLicence)
				.then(() => {
					done(new Error('Nothing thrown'));
				})
				.catch(err => {
					expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

					done();
				});
		});
	});

	describe('getAdministrators', () => {
		it('Should get the administrators for a valid licence UUID', done => {
			nock(baseUrl)
				.get(`/licences/${uuids.validLicence}/administrators`)
				.reply(200, () => require('./mocks/fixtures/accessLicenceAdmins'));

			accessLicence.getAdministrators(uuids.validLicence)
				.then(response => {
					expect(response).to.be.an('object');
					expectOwnProperties(response, ['administrators']);
					expect(response.administrators).to.be.an('array');
					expect(response.administrators.length).to.be.at.least(1);
					expectOwnProperties(response.administrators, ['accessLicenceId', 'userId', 'joinedDate']);

					done();
				})
				.catch(done);
		});

		it('Should get an empty array for a invalid user UUID', done => {
			nock(baseUrl)
				.get(`/licences/${uuids.invalidLicence}/administrators`)
				.reply(200, () => ({administrators: []}));

			accessLicence.getAdministrators(uuids.invalidLicence)
				.then(response => {
					expect(response).to.be.an('object');
					expectOwnProperties(response, ['administrators']);
					expect(response.administrators).to.be.an('array');
					expect(response.administrators).to.have.lengthOf(0);

					done();
				})
				.catch(done);
		});
	});

});
