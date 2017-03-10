'use strict';

const myFT = require('../index').myFTClient;
const mocks = require('./mocks');
const expect = require('chai').expect;
const config = require('../lib/config');
const statusErrors = require('../lib/statusErrors');
const env = require('./env');
const uuid = require('uuid');

const expectOwnProperties = require('./expectExtensions').expectOwnProperties;

describe('myFT Client proxy', function () {

	const mockAPI = env.USE_MOCK_API;

	before(function() {
		if (mockAPI) {
			mocks.registerMyFT();
		}
  });
	this.timeout('3s');

	after(function() {
		if (mockAPI) {
			require('fetch-mock').restore();
		}
  });

	it ('should have default properties', function(){
		expectOwnProperties(myFT.followedProperties, ['byTool','byUser']);
		expect(myFT.entityProperties[config.toolDateIdentifier]).to.be.a('string');
	});

	describe('Email preferences', function () {
		it('Should set an EmailDigestPreference for a valid user uuid', (done) => {
			let edpPref = { type: "daily", timezone:"Europe/London", byTool: "KAT", byUser: "8619e7a0-65b7-446b-9931-4197b3fe0cbf", isTest:true};
			myFT.setEmailDigestPreference(mocks.uuids.validUser, edpPref)
			.then((res)=>{
				return myFT.getEmailDigestPreference(mocks.uuids.validUser)
				.then((edp)=>{
					expectOwnProperties(edp, ['uuid']);
					expect(edp.uuid).to.equal('email-digest');
					expect(edp["_rel"].isTest).to.equal(true);
					done();
				});
			})
			.catch((err)=>{
				done(err);
			});
		});

		it('Should get an EmailDigestPreference for a valid user uuid', (done) => {
			myFT.getEmailDigestPreference(mocks.uuids.validUser)
			.then((edp)=>{
				expectOwnProperties(edp, ['uuid']);
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

	describe('Licence management', function(){
		let userId = uuid();

		it ('Should be able to add users to a licence', done=> {
			myFT.addUsersToLicence(mocks.uuids.validLicence, userId)
			.then(addResponse=>{
				expect(addResponse).to.be.an.instanceof(Array);
				return myFT.getUsersForLicence(mocks.uuids.validLicence)
				.then(getResponse=>{
					expectOwnProperties(getResponse.items, ['uuid']);
					expect(getResponse.items.length).to.be.at.least(1);
					let users = getResponse.items.map(user=>user.uuid);
					if (!mockAPI) {
						expect(users.indexOf(userId)).to.be.at.least(0);
					};
					done();
				});
			})
			.catch(err => {
				done(err);
			});
		});

		it ('Should be able to get a valid licence', done=> {
			myFT.getLicence(mocks.uuids.validLicence)
			.then(resp=>{
				console.log(JSON.stringify(resp));
				expectOwnProperties(resp, ['uuid', '_rel']);
				expect(resp.uuid).to.equal(mocks.uuids.validLicence);
				done();
			})
			.catch (err => {
				done(err);
			});
		});

		it ('Should throw a NotFoundError for an invalid licence', done=> {
			myFT.getLicence(mocks.uuids.invalidLicence)
			.then(resp=>{
				done(new Error(`Shouldn't have got a resp:${JSON.stringify(resp)}`));
			})
			.catch (err => {
				expect(err).to.be.an.instanceof(statusErrors.NotFoundError);
				done();
			});
		});

		it ('Should get users registered to a licence', done=> {
			myFT.getUsersForLicence(mocks.uuids.validLicence)
			.then(usersResponse=>{
				expectOwnProperties(usersResponse, ['license', 'total', 'items']);
				expect(usersResponse.items).to.be.an.instanceof(Array);
				expectOwnProperties(usersResponse.items, ['uuid']);
				expect(usersResponse.items.length).to.be.at.least(1);
				done();
			})
			.catch (err => {
				done(err);
			});
		});
	});

	describe('Followed concepts', function(){
		it ('Should get an array of concepts followed by a user', done => {
			myFT.addConceptsFollowedByUser(mocks.uuids.validUser, mocks.uuids.concept)
			.then(()=>{
				return myFT.getConceptsFollowedByUser(mocks.uuids.validUser)
				.then((followResponse)=>{
					expectOwnProperties(followResponse,['user', 'items', 'total']);
					expectOwnProperties(followResponse.user,['properties']);
					expect(followResponse.user.properties.uuid).to.equal(mocks.uuids.validUser);
					expect(followResponse.items).to.be.an.instanceof(Array);
					if (mockAPI) {
							expect(followResponse.items).to.have.lengthOf(5);
					}
					expectOwnProperties(followResponse.items, ['uuid']);
					done();
				});
			})
			.catch ((err)=>{
				done(err);
			});
		});

		it ('Should set and get concepts followed by a group', done => {
			let relProps = myFT.followedProperties;
			relProps.isTest = true;
			relProps.byTool = 'myFTClient.spec';
			myFT.addConceptsFollowedByGroup(mocks.uuids.validLicence, mocks.uuids.concept, relProps)
			.then(()=>{
				return myFT.getConceptsFollowedByGroup(mocks.uuids.validLicence)
				.then((followResponse)=>{
					expectOwnProperties(followResponse,['group', 'items', 'total']);
					expectOwnProperties(followResponse.group,['properties']);
					expect(followResponse.group.properties.uuid).to.equal(mocks.uuids.validLicence);
					expect(followResponse.items).to.be.an.instanceof(Array);
					if (mockAPI) {
							expect(followResponse.items).to.have.lengthOf(1);
					}
					expectOwnProperties(followResponse.items, ['uuid']);
					followResponse.items.forEach(item=> {
						expect(item.uuid).to.be.a('string');
					});
					done();
				});
			})
			.catch ((err)=>{
				done(err);
			});
		});

		it ('Can elect to follow some topics on behalf of a valid user', function(done){
			let relProps = myFT.followedProperties;
			relProps.isTest = true;
			relProps.byTool = 'myFTClient.spec';
			myFT.addConceptsFollowedByUser(mocks.uuids.validUser, mocks.uuids.concept, relProps )
			.then(addResp=>{
				expect(addResp).to.be.an('array');
				addResp.forEach(resp=>{
					expectOwnProperties(resp, ['rel']);
					expectOwnProperties(resp.rel, ['properties', 'type']);
				});
				if (mockAPI) {
					expect(addResp[0].rel.properties.byTool).to.equal(relProps.byTool);
					expect(addResp[0].rel.properties.isTest).to.equal(relProps.isTest);
				}
				done();
			}).catch(error=>{
				done(error);
			});
		});

		it ('Can remove follow topics on behalf of a valid user', function(done){
			let relProps = myFT.followedProperties;
			relProps.isTest = true;
			relProps.byTool = 'myFTClient.spec';
			myFT.addConceptsFollowedByUser(mocks.uuids.validUser, mocks.uuids.concept, relProps )
			.then(addResp=>{
				return myFT.removeConceptsFollowedByUser(mocks.uuids.validUser, mocks.uuids.concept)
				.then(removeResp=>{
					return myFT.getConceptsFollowedByUser(mocks.uuids.validUser)
					.then(conceptsResp=>{
						if (!mockAPI){
							let conceptIds = conceptsResp.items.map(item=>item.uuid);
							expect(conceptIds.indexOf(mocks.uuids.concept)).to.equal(-1);
						}
						done();
					})
					.catch(error=>{
						expect(error).to.be.an.instanceof(statusErrors.NotFoundError);
						done();
					});
				});
			})
			.catch(error=>{
				done(error);
			});
		});

	});
});
