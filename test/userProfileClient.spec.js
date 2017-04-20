'use strict';

const proxies = require('./../index');
const userProfile = proxies.userProfileClient;
const mocks = require('./helpers/mocks');
const expect = require("chai").expect;
const sinon = require('sinon');
const logger = require('@financial-times/n-logger').default;
const env = require('./helpers/env');
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const mockAPI = env.USE_MOCK_API;

describe('User Profile Service Client', () => {
  let logMessageStub;
  const logMessages = [];

  before(done => {
    if (mockAPI) {
      mocks.registerUserProfile();
    }

    logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
      logMessages.push(params);
    });

    done();
  });

  after(done => {
    if (mockAPI) {
      require('nock').cleanAll();
    }

    logMessageStub.restore();

    done();
  });

  describe('getUUID', () => {

    it('Should get an users UUID for a valid email address', done => {
      userProfile.getUUID(mocks.uuids.validUserEmail)
        .then(userProfile => {
          expectOwnProperties(userProfile, ['id']);
          expect(userProfile.email).to.be.null;

          done();
        })
        .catch(done);
    });

    it('Should get a null for an invalid email address', done => {
      userProfile.getUUID(mocks.uuids.invalidUserEmail)
        .then(userProfile => {
          expect(userProfile).to.be.null;

          done();
        })
        .catch(done);
    });

  });

  describe('exists', () => {

    it('Should get true for a valid user id', done => {
      userProfile.exists(mocks.uuids.validUser)
        .then(res => {
          expect(res).to.be.true;

          done();
        })
        .catch(done);
    });

    it('Should get false for an invalid user id', done => {
      userProfile.exists(mocks.uuids.invalidUser)
        .then(res => {
          expect(res).to.be.false;

          done();
        })
        .catch(done);
    });

  });

});
