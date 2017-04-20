'use strict';

const proxies = require('./../index');
const accessLicence = proxies.accessLicenceClient;
const mocks = require('./helpers/mocks');
const expect = require("chai").expect;
const sinon = require('sinon');
const logger = require('@financial-times/n-logger').default;
const env = require('./helpers/env');
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const mockAPI = env.USE_MOCK_API;

describe('Access Licence Service Client', () => {
  let logMessageStub;
  const logMessages = [];

  before(done => {
    if (mockAPI) {
      mocks.registerAccessLicence();
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

  describe('getLicences', () => {

    it('Should get a list of Licence IDs for a valid UUID', done => {
      accessLicence.getLicences({userid: mocks.uuids.validUser})
        .then(licences => {
          expect(licences).to.be.an('array');
          expect(licences.length).to.be.at.least(1);
          expectOwnProperties(licences, ['id']);

          done();
        })
        .catch(done);
    });

    it('Should get an empty array for a invalid user UUID', done => {
      accessLicence.getLicences({userid: mocks.uuids.invalidUser})
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
      accessLicence.getSeats(mocks.uuids.validLicence)
        .then(seats => {
          expect(seats).to.be.an('array');
          expect(seats.length).to.be.at.least(1);
          expectOwnProperties(seats, ['userId', 'accessLicenceId']);

          done();
        })
        .catch(done);
    });

    it('Should get an empty array for a invalid licence UUID', done => {
      accessLicence.getSeats(mocks.uuids.invalidLicence)
        .then(seats => {
          expect(seats).to.be.an('array');
          expect(seats).to.have.lengthOf(0);

          done();
        })
        .catch(done);
    });
  });

});
