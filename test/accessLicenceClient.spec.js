'use strict';

const proxies = require('./../index');
const accessLicence = proxies.accessLicenceClient;
const uuids = require('./mocks/uuids');
const expect = require("chai").expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const env = require('./helpers/env');
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const mockAPI = env.USE_MOCK_API;
const baseUrl = require('./../lib/helpers/config').accLicenceURL;

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
    if (mockAPI) {
      nock.cleanAll();
    }

    logMessageStub.restore();

    done();
  });

  describe('getLicences', () => {

    it('Should get a list of Licence IDs for a valid UUID', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/licences?userid=${uuids.validUser}`)
          .reply(200, () => require('./mocks/fixtures/accessLicenceGetLicence'));
      }

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
      if (mockAPI) {
        nock(baseUrl)
          .get(`/licences?userid=${uuids.invalidUser}`)
          .reply(200, () => ({accessLicences: []}));
      }

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
      if (mockAPI) {
        nock(baseUrl)
          .get(`/licences/${uuids.validLicence}/seats`)
          .reply(200, () => require('./mocks/fixtures/accessLicenceGetSeats'));
      }

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
      if (mockAPI) {
        nock(baseUrl)
          .get(`/licences/${uuids.invalidLicence}/seats`)
          .reply(200, () => ({seats: [], "allocatedSeatCount": 0}));
      }

      accessLicence.getSeats(uuids.invalidLicence)
        .then(seats => {
          expect(seats).to.be.an('array');
          expect(seats).to.have.lengthOf(0);

          done();
        })
        .catch(done);
    });
  });

});
