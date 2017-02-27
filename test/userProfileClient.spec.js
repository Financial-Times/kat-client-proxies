'use strict';

const userProfile = require('../index').userProfileClient;
const mocks = require('./mocks');
const expect = require("chai").expect;
const config = require('../lib/config');
const statusErrors = require('../lib/statusErrors');
const env = require('./env');

const expectOwnProperties = require('./expectExtensions').expectOwnProperties;


describe('User Profile Service Client', function () {

	const mockAPI = env.USE_MOCK_API;

	before(function() {
		if (mockAPI) {
			// mocks.registeruserProfile();
		}
	});
	this.timeout('3s');

	after(function() {
		if (mockAPI) {
			require('fetch-mock').restore();
		}
	});

	describe('getUUID', function () {

		it('Should get an users UUID for a valid email address', (done) => {
			userProfile.getUUID(mocks.uuids.validUserEmail)
			.then((userProfile)=>{
				expect(userProfile).to.have.ownProperty('id');
				expect(userProfile.email).to.be.null;
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});
	});

});
