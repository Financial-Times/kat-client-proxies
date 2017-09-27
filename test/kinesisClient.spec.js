'use strict';

const proxies = require('./../index');
const uuids = require('./mocks/uuids');
const expect = require('chai').expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const config = require('./../lib/helpers/config');
const clientErrors = proxies.clientErrors;
const env = require('./helpers/env');
const mockAPI = env.USE_MOCK_API;
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const baseUrl = config.MYFT_API_URL;
const kinesis = proxies.kinesisClient;
const suppressLogs = false;

describe.only('kinesisClient', (done) => {

  let logMessageStub;
  const logMessages = [];

  before(done => {
    if(suppressLogs) {
      logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
        logMessages.push(params);
      });
    }

    done();
  });

  // beforeEach((done) => {
  //   done();
  // });
  //
  // afterEach(done => {
  //     done();
  // });

  after(done => {
    if(suppressLogs) {
      logMessageStub.restore();
    }
    done();
  });

  it('writeToKinesis() should return null if', (done) => {

    const concepts = [{
      name:"A fake new topic",
      uuid:"00000000-0000-0000-0000-000000000222"
    }];
    const event = 'subscribe';
    const uuids = ['00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005'];

    const kinesisResponse = {
      FailedRecordCount:0,
      Records:[
        { SequenceNumber: "1234",
        ShardId:"shardId-000000000000"},
        {
          SequenceNumber:"1234",
          ShardId:"shardId-000000000000"
        },
        {
          SequenceNumber:"1234",
          ShardId:"shardId-000000000000"
        }
      ]
    }

    console.log('writeToKinesis called');
    kinesis.write(uuids, event, concepts)
    .then((res) => {
      expect(res).to.be.an('object');
    });

    done();
  });
});
