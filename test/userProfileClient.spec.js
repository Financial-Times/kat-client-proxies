'use strict';

const proxies = require('./../index');
const userProfile = proxies.userProfileClient;
const uuids = require('./mocks/uuids');
const expect = require("chai").expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const env = require('./helpers/env');
const qs = require('querystring');
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const mockAPI = env.USE_MOCK_API;
const baseUrl = require('./../lib/helpers/config').userProfileURL;

describe('User Profile Service Client', () => {
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

  describe('getUUID', () => {

    it('Should get an users UUID for a valid email address', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`?${qs.stringify({email: uuids.validUserEmail})}`)
          .reply(200, () => require('./mocks/fixtures/userProfile'));
      }

      userProfile.getUUID(uuids.validUserEmail)
        .then(userProfile => {
          expectOwnProperties(userProfile, ['id']);
          expect(userProfile.email).to.be.null;

          done();
        })
        .catch(done);
    });

    it('Should get a null for an invalid email address', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`?${qs.stringify({email: uuids.invalidUserEmail})}`)
          .reply(200, () => ({items: []}));
      }

      userProfile.getUUID(uuids.invalidUserEmail)
        .then(userProfile => {
          expect(userProfile).to.be.null;

          done();
        })
        .catch(done);
    });

  });

  describe('exists', () => {

    it('Should get true for a valid user id', done => {
      if (mockAPI) {
        nock(baseUrl)
          .head(`?${qs.stringify({id: uuids.validUser})}`)
          .reply(200, () => null);
      }

      userProfile.exists(uuids.validUser)
        .then(res => {
          expect(res).to.be.true;

          done();
        })
        .catch(done);
    });

    it('Should get false for an invalid user id', done => {
      if (mockAPI) {
        nock(baseUrl)
          .head(`?${qs.stringify({id: uuids.invalidUser})}`)
          .reply(404, () => null);
      }

      userProfile.exists(uuids.invalidUser)
        .then(res => {
          expect(res).to.be.false;

          done();
        })
        .catch(done);
    });

  });

});
