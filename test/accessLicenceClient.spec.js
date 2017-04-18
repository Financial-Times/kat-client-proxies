'use strict';

const accessLicence = require('../index').accessLicenceClient;
const mocks = require('./mocks');
const expect = require("chai").expect;
const config = require('./../lib/helpers/config');
const clientErrors = require('./../lib/clientErrors');
const env = require('./env');

const expectOwnProperties = require('./expectExtensions').expectOwnProperties;

describe('Access Licence Service Client', function () {

	const mockAPI = env.USE_MOCK_API;

	before(function() {
		if (mockAPI) {
			mocks.registerAccessLicence();
		}
	});
	this.timeout('3s');

	after(function() {
		if (mockAPI) {
			require('fetch-mock').restore();
		}
	});

	describe('getLicences', function () {

		it('Should get a list of Licence IDs for a valid UUID', (done) => {
			accessLicence.getLicences({userid:mocks.uuids.validUser})
			.then((licences)=>{
				console.log(JSON.stringify(licences));
				expect(licences).to.be.an('array');
				licences.forEach(licence=>{
					expect(licence).to.have.ownProperty('id');
				});
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});

		it('Should get an empty array for a invalid user UUID', (done) => {
			accessLicence.getLicences({userid:mocks.uuids.invalidUser})
			.then((licences)=>{
				console.log(JSON.stringify(licences));
				expect(licences).to.be.an('array');
				expect(licences).to.have.lengthOf(0);
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});
	});

	describe('getSeats', function () {

		it('Should get a list of seats for a valid licence UUID', (done) => {
			accessLicence.getSeats(mocks.uuids.validLicence)
			.then((seats)=>{
				// console.log(JSON.stringify(seats));
				expect(seats).to.be.an('array');
				seats.forEach(seat=>{
					expect(seat).to.have.ownProperty('userId');
					expect(seat).to.have.ownProperty('accessLicenceId');
				});
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});

		it('Should get an empty array for a invalid licence UUID', (done) => {
			accessLicence.getSeats(mocks.uuids.invalidLicence)
			.then((seats)=>{
				// console.log(JSON.stringify(seats));
				expect(seats).to.be.an('array');
				expect(seats).to.have.lengthOf(0);
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});
	});

});
