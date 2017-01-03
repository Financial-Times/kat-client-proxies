'use-strict';

const myFT = require('../index').myFTClient;

const fetchMock = require('fetch-mock');
const expect = require("chai").expect;
const config = require('../lib/config');
const mocks = require('./mocks');
const statusErrors = require('../lib/statusErrors');
const env = require('./env');

const expectOwnProperties = require('./expectExtensions').expectOwnProperties;

describe('myFT Client proxy', function () {

	const mockAPI = env.USE_MOCK_API;
	if (mockAPI) {
		mocks.registerMyFT();
	}
	this.timeout('30s');

	describe('Email preferences', function () {

		it('Should get an EmailDigestPreference for a valid user uuid', (done) => {
			myFT.getEmailDigestPreference(mocks.uuids.validUser)
			.then((edp)=>{
				expectOwnProperties(edp, ['uuid', 'name']);
				expect(edp.name).to.equal('Digest email');
				expect(edp.uuid).to.equal('email-digest');
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});

		it('Should throw a NotFoundError error for an invalid user uuid', done => {
			myFT.getEmailDigestPreference(mocks.uuids.invalidUser)
			.then((edp)=>{
				done('Nothing thrown');
			})
			.catch((err)=>{
				expect(err).to.be.an.instanceof(statusErrors.NotFoundError);
				expect(err.name).to.equal('NotFoundError');
				done();
			});
		});

		it('Should get an array of users who have an EmailDigestPreference set', done => {
			myFT.getUsersWithEmailDigestPreference(mocks.uuids.validLicence)
			.then((users)=>{
				expect(users).to.be.an.instanceof(Array);
				if (mockAPI) {
					expect(users).to.have.lengthOf(2);
				}
				expectOwnProperties(users, ['uuid']);
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});

		it('Should return an empty array for an invalid licence uuid', done => {
			myFT.getUsersWithEmailDigestPreference(mocks.uuids.invalidLicence)
			.then((users)=>{
				expect(users).to.be.an.instanceof(Array);
				expect(users).to.have.lengthOf(0);
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});

	});

	describe('Followed concepts', function(){

		it ('Should get an array of concepts followed by a user', done => {
				myFT.getConceptsFollowedByUser(mocks.uuids.validUser)
				.then((followResponse)=>{
					expectOwnProperties(followResponse,['user', 'items', 'total']);
					expectOwnProperties(followResponse.user,['properties']);
					expect(followResponse.user.properties.uuid).to.equal(mocks.uuids.validUser);
					expect(followResponse.items).to.be.an.instanceof(Array);
					if (mockAPI) {
							expect(followResponse.items).to.have.lengthOf(5);
					}
					expectOwnProperties(followResponse.items, ['uuid', 'name']);
					done();
				})
				.catch ((err)=>{
					done(err);
				});
		});

	});

});
