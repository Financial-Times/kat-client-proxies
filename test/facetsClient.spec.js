'use strict';

const proxies = require('./../index');
const facets = proxies.facetsClient;
const expect = require("chai").expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const helpers = require('./../lib/helpers/helpers');
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const env = require('./helpers/env');
const mockAPI = env.USE_MOCK_API;
const baseUrl = require('./../lib/helpers/config').facetsSearchUrl;

describe('Facets API Client', () => {
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

  describe('getTopics', () => {

    it('Should get topics based on a search string', done => {
      const maxResults = 6;
      const queryString = 'Fiction';
      const params = {
        tagged: '',
        count: maxResults,
        partial: queryString
      };

      if (mockAPI) {
        nock(baseUrl)
          .get(`/${helpers.createParams(params)}`)
          .reply(200, () => []);
      }

      facets.getTopics(params)
        .then(res => {
          expect(res).to.be.an('array');
          expectOwnProperties(res, ['count', 'id', 'name', 'taxonomy', 'url']);
          expect(res.length).to.be.at.most(maxResults);

          done();
        })
        .catch(done);
    });

  });

});
