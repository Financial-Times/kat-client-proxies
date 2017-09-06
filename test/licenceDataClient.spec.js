'use strict';

const proxies = require('./../index');
const ldc = proxies.licenceDataClient;
const uuids = require('./mocks/uuids');
const expect = require('chai').expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const env = require('./helpers/env');
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const mockAPI = env.USE_MOCK_API;
const baseUrl = `${require('./../lib/helpers/config').API_GATEWAY_HOST}/licence-seat-holders`;

describe('Licence Data Client', () => {
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

  describe('getFilteredUserList', () => {

    it('Should get the seat holder list for a valid licence uuid and a valid api auth token', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${uuids.validLicence}`)
          .reply(200, () => require('./mocks/fixtures/licenceSeatHolders'));
      }

      ldc.getFilteredUserList(uuids.validLicence, uuids.validApiAuthToken)
        .then(response => {
          expect(response).to.be.an('object');
          expectOwnProperties(response, ['offset', 'limit', 'returnedResourceCount', 'totalResourceCount', 'seatHolders']);
          expect(response.seatHolders).to.be.an('array');
          expect(response.seatHolders.length).to.be.at.least(1);
          expectOwnProperties(response.seatHolders, ['id', 'lastName', 'firstName', 'email', 'joinedDate']);

          done();
        })
        .catch(done);
    });

    it('Should thrown an Error for an invalid licence uuid and a valid api auth token', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${uuids.invalidLicence}`)
          .reply(401, () => null);
      }

      ldc.getFilteredUserList(uuids.invalidLicence, uuids.validApiAuthToken)
        .then(() => {
          done(new Error('Nothing thrown'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(Error);

          done();
        });
    });

    it('Should thrown an Error for a valid licence uuid and an invalid api auth token', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${uuids.validLicence}`)
          .reply(401, () => null);
      }

      ldc.getFilteredUserList(uuids.validLicence, uuids.invalidApiAuthToken)
        .then(() => {
          done(new Error('Nothing thrown'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(Error);

          done();
        });
    });

  });

  describe('getAdminUserList', () => {

    it('Should get the licence admin list for a valid licence uuid and a valid api auth token', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${uuids.validLicence}/admins`)
          .reply(200, () => require('./mocks/fixtures/licenceDataAdmins'));
      }

      ldc.getAdminUserList(uuids.validLicence, uuids.validApiAuthToken)
        .then(response => {
          expect(response).to.be.an('object');
          expectOwnProperties(response, ['administrators']);
          expect(response.administrators).to.be.an('array');
          expect(response.administrators.length).to.be.at.least(1);
          expectOwnProperties(response.administrators, ['id', 'lastName', 'firstName', 'email', 'joinedDate']);

          done();
        })
        .catch(done);
    });

    it('Should thrown an Error for an invalid licence uuid and a valid api auth token', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${uuids.invalidLicence}/admins`)
          .reply(401, () => null);
      }

      ldc.getAdminUserList(uuids.invalidLicence, uuids.validApiAuthToken)
        .then(() => {
          done(new Error('Nothing thrown'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(Error);

          done();
        });
    });

    it('Should thrown an Error for a valid licence uuid and an invalid api auth token', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${uuids.validLicence}/admins`)
          .reply(401, () => null);
      }

      ldc.getAdminUserList(uuids.validLicence, uuids.invalidApiAuthToken)
        .then(() => {
          done(new Error('Nothing thrown'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(Error);

          done();
        });
    });

  });

  describe('removeUsers', () => {
    it('Should be able to remove users from a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/${uuids.validLicence}/remove`)
          .reply(200, () => null);
      }

      ldc.removeUsers(uuids.validLicence, [uuids.validUser])
        .then(response => {
          expect(response).to.be.an('object');
          expect(response.status).to.equal(200);

          done();
        })
        .catch(done);
    });
  });

});
