'use-strict';

const myFT = require('../index').myFTClient;
const mocks = require('./mocks');
const expect = require("chai").expect;
const config = require('../lib/config');
const statusErrors = require('../lib/statusErrors');
const env = require('./env');

const expectOwnProperties = require('./expectExtensions').expectOwnProperties;

describe('myFT Client proxy', function () {

	const mockAPI = env.USE_MOCK_API;

	before(function() {
		if (mockAPI) {
			mocks.registerStatusErrors();
		}
  });
	this.timeout('3s');

	after(function() {
		if (mockAPI) {
			require('fetch-mock').restore();
		}
  });

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

		it ('Should get an array of concepts followed by a group', done => {
				myFT.getConceptsFollowedByGroup(mocks.uuids.validLicence)
				.then((followResponse)=>{
					expectOwnProperties(followResponse,['group', 'items', 'total']);
					expectOwnProperties(followResponse.group,['properties']);
					expect(followResponse.group.properties.uuid).to.equal(mocks.uuids.validLicence);
					expect(followResponse.items).to.be.an.instanceof(Array);
					if (mockAPI) {
							expect(followResponse.items).to.have.lengthOf(1);
					}
					expectOwnProperties(followResponse.items, ['uuid', 'name', 'taxonomy']);
					done();
				})
				.catch ((err)=>{
					done(err);
				});
		});

	});

	describe('Licence management', function(){

		it ('Should get users registered to a licence', done=> {
			myFT.getUsersForLicence(mocks.uuids.validLicence)
			.then(usersResponse=>{
				console.log(usersResponse);
				expectOwnProperties(usersResponse, ['license', 'total', 'items']);
				expect(usersResponse.items).to.be.an.instanceof(Array);
				expectOwnProperties(usersResponse.items, ['uuid']);
				// expect(usersResponse.items.length).to.be.atLeast(1);
				done();
			})
			.catch (err => {
				done(err);
			});
		});

	});

});
