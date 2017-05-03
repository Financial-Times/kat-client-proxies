/* disabling because it needs AWS credentials and I don't want to put then in circleci :)
'use strict';

const proxies = require('./../index');
const elasticSearch = proxies.elasticSearchClient;
const uuids = require('./mocks/uuids');
const expect = require("chai").expect;
const sinon = require('sinon');
//const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
//const env = require('./helpers/env');
//const mockAPI = env.USE_MOCK_API;
//const baseUrl = require('./../lib/helpers/config').elasticSearchUrl;

describe('Elastic Search Client', () => {
  let logMessageStub;
  const logMessages = [];

  before(done => {
    logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
      logMessages.push(params);
    });

    done();
  });

  after(done => {
    //if (mockAPI) {
    //  nock.cleanAll();
    //}

    logMessageStub.restore();

    done();
  });

  describe('getTopicHeadlines', () => {
    const maxHeadlines = 4;
    const reqBody = {
      query: {
        term: {
          'metadata.idV1': uuids.validTopic
        }
      },
      size: maxHeadlines,
      sort: {
        publishedDate: {
          order: 'desc'
        }
      }
    };

    const reqExpect = res => {
      expect(res).to.be.an('object');
      expectOwnProperties(res, ['_shards', 'hits']);
      expectOwnProperties(res.hits, ['total', 'hits']);
      expectOwnProperties(res.hits.hits, ['_id', '_source']);
      expect(res.hits.hits).to.be.an('array');
    };

    it('Should get the topic headlines for a valid topicID', done => {
      reqBody.query.term['metadata.idV1'] = uuids.validTopic;
      const query = {
        method: "POST",
        body: JSON.stringify(reqBody)
      };

      //if (mockAPI) {
      //  nock(baseUrl)
      //    .get(`test`)
      //    .reply(200, () => []);
      //}

      elasticSearch.getTopicHeadlines(query)
        .then(res => {
          reqExpect(res);
          expect(res.hits.total).to.be.above(0);
          expect(res.hits.hits.length).to.be.at.most(maxHeadlines);

          done();
        })
        .catch(done);
    });

    it("Shouldn't get the topic headlines for an invalid topicID", done => {
      reqBody.query.term['metadata.idV1'] = uuids.invalidTopic;
      const query = {
        method: "POST",
        body: JSON.stringify(reqBody)
      };

      //if (mockAPI) {
      //  nock(baseUrl)
      //    .get(`test`)
      //    .reply(200, () => []);
      //}

      elasticSearch.getTopicHeadlines(query)
        .then(res => {
          reqExpect(res);
          expect(res.hits.total).to.equal(0);
          expect(res.hits.hits.length).to.equal(0);

          done();
        })
        .catch(done);
    });

  });

});
*/
