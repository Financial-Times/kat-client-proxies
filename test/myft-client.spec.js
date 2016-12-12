'use-strict';

require('isomorphic-fetch');
const fetchMock = require('fetch-mock');
const expect = require("chai").expect;

const clientProxies = require('../index');
const config = require('../lib/config');
const myFT = require('../lib/myft-client');
const mocks = require('./mocks');
const errors = require('../lib/errors');

describe('myFT Client proxy', function () {

	mocks.registerMyFT();

	this.timeout('30s');

	describe('Email preferences', function () {

		it('Should get an EmailDigestPreference for a valid user uuid', done => {
			myFT.getEmailDigestPreference(mocks.uuids.validUser)
			.then((edp)=>{
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
				expect(err).to.be.an.instanceof(errors.NotFoundError);
				expect(err.name).to.equal('NotFoundError');
				done();
			});
		});

		it('Should get an array of users who have an EmailDigestPreference set', done => {
			myFT.getUsersWithEmailDigestPreference(mocks.uuids.validLicense)
			.then((users)=>{
				expect(users).to.be.an.instanceof(Array);
				expect(users).to.have.lengthOf(2);
				users.forEach((user)=>{
					expect(user).to.have.ownProperty('uuid');
				});
				done();
			})
			.catch((err)=>{
				done(err);
			});
		});

	});

	describe('Followed concepts', function(){

	});
});
