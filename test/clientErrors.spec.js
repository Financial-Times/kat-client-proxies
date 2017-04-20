'use strict';

const proxies = require('./../index');
const expect = require('chai').expect;
const uuids = require('./mocks/uuids');
const config = require('./../lib/helpers/config');
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const clientErrors = proxies.clientErrors;
const env = require('./helpers/env');
const mockAPI = env.USE_MOCK_API;
const baseUrl = config.myFTURL;
const fetchOpt = Object.assign({}, config.fetchOptions);
fetchOpt.headers = Object.assign({}, fetchOpt.headers, {"X-API-KEY": config.myFTKey});

describe('Status Error Parser', () => {
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
      require('nock').cleanAll();
    }

    logMessageStub.restore();

    done();
  });

  describe('NotAuthorisedError', () => {

    it('Should throw an NotAuthorisedError without any headers', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get('')
          .reply(401, () => null);
      }

      fetch(baseUrl)
        .then(res => {
          clientErrors.parse(res);

          done(new Error('Should have thrown an exception'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);

          done();
        })
        .catch(done);
    });

    it('Should throw an NotAuthorisedError without an X-API-KEY', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get('')
          .reply(401, () => null);
      }

      fetch(baseUrl, config.fetchOptions)
        .then(res => {
          clientErrors.parse(res);

          done(new Error('Should have thrown an exception'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);

          done();
        })
        .catch(done);
    });

    it('Should throw an NotAuthorisedError with an invalid X-API-KEY', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get('')
          .reply(401, () => null);
      }

      fetch(baseUrl, { headers: {'X-API-KEY': uuids.invalidKey }} )
        .then(res => {
          clientErrors.parse(res);

          done(new Error('Should have thrown an exception'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);

          done();
        })
        .catch(done);
    });

    it('Should not throw an NotAuthorisedError with a valid X-API-KEY', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get('')
          .reply(200, () => null);
      }

      fetch(baseUrl, fetchOpt)
        .then(res => {
          try {
            clientErrors.parse(res);
          } catch (err) {
            expect(err).to.not.be.an.instanceof(clientErrors.NotAuthorisedError);
          }

          done();
        })
        .catch(done);
    });

  });

  describe('NotFoundError', () => {

    it("Should throw an NotFoundError when something doesn't exist", done => {
      if (mockAPI) {
        nock(baseUrl)
          .get('/doesNotExist')
          .reply(404, () => null);
      }

      fetch(`${baseUrl}/doesNotExist`, fetchOpt)
        .then(res => {
          clientErrors.parse(res);

          done(new Error('Should have thrown an exception'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        })
        .catch(done);
    });

  });

  if (mockAPI) {
    describe('BadRequestError', () => {
      it('Should throw an BadRequestError', done => {
        if (mockAPI) {
          nock(baseUrl)
            .get('/invalidPath')
            .reply(400, () => null);
        }

        fetch(`${baseUrl}/invalidPath`, fetchOpt)
          .then(res => {
            clientErrors.parse(res);

            done(new Error('Should have thrown an exception'));
          })
          .catch(err => {
            expect(err).to.be.an.instanceof(clientErrors.BadRequestError);

            done();
          })
          .catch(done);
      });
    });

    describe('InternalServerError', () => {
      it('Should throw an InternalServerError', done => {
        if (mockAPI) {
          nock(baseUrl)
            .get('/serverError')
            .reply(500, () => null);
        }

        fetch(`${baseUrl}/serverError`, fetchOpt)
          .then(res => {
            clientErrors.parse(res);

            done(new Error('Should have thrown an exception'));
          })
          .catch(err => {
            expect(err).to.be.an.instanceof(clientErrors.InternalServerError);

            done();
          })
          .catch(done);
      });
    });

    describe('BadGatewayError', () => {
      it('Should throw an BadGatewayError', done => {
        if (mockAPI) {
          nock(baseUrl)
            .get('/badGateway')
            .reply(502, () => null);
        }

        fetch(`${baseUrl}/badGateway`, fetchOpt)
          .then(res => {
            clientErrors.parse(res);

            done(new Error('Should have thrown an exception'));
          })
          .catch(err => {
            expect(err).to.be.an.instanceof(clientErrors.BadGatewayError);

            done();
          })
          .catch(done);
      });
    });

    describe('ServiceUnavailableError', () => {
      it('Should throw an ServiceUnavailableError', done => {
        if (mockAPI) {
          nock(baseUrl)
            .get('/serviceUnavailable')
            .reply(503, () => null);
        }

        fetch(`${baseUrl}/serviceUnavailable`, fetchOpt)
          .then(res => {
            clientErrors.parse(res);

            done(new Error('Should have thrown an exception'));
          })
          .catch(err => {
            expect(err).to.be.an.instanceof(clientErrors.ServiceUnavailableError);

            done();
          })
          .catch(done);
      });
    });

    describe('RedirectionError', () => {
      it('Should throw an RedirectionError', done => {
        if (mockAPI) {
          nock(baseUrl)
            .get('/redirect')
            .reply(304, () => null);
        }

        fetch(`${baseUrl}/redirect`, fetchOpt)
          .then(res => {
            clientErrors.parse(res);

            done(new Error('Should have thrown an exception'));
          })
          .catch(err => {
            expect(err).to.be.an.instanceof(clientErrors.RedirectionError);

            done();
          })
          .catch(done);
      });
    });

    describe('ClientError', () => {
      it('Should throw an ClientError', done => {
        if (mockAPI) {
          nock(baseUrl)
            .get('/clientError')
            .reply(405, () => null);
        }

        fetch(`${baseUrl}/clientError`, fetchOpt)
          .then(res => {
            clientErrors.parse(res);

            done(new Error('Should have thrown an exception'));
          })
          .catch(err => {
            expect(err).to.be.an.instanceof(clientErrors.ClientError);

            done();
          })
          .catch(done);
      });
    });

    describe('ServerError', () => {
      it('Should throw an ServerError', done => {
        if (mockAPI) {
          nock(baseUrl)
            .get('/otherServerError')
            .reply(501, () => null);
        }

        fetch(`${baseUrl}/otherServerError`, fetchOpt)
          .then(res => {
            clientErrors.parse(res);

            done(new Error('Should have thrown an exception'));
          })
          .catch(err => {
            expect(err).to.be.an.instanceof(clientErrors.ServerError);

            done();
          })
          .catch(done);
      });
    });
  }
});
