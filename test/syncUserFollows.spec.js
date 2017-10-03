'use strict';

const proxies = require('./../index');
const myFT = proxies.myFTClient;
const uuids = require('./mocks/uuids');
const expect = require('chai').expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const env = require('./helpers/env');
const syncUserFollowers = proxies.syncUserFollowers;
const kinesisClient = proxies.kinesisClient;
const syncConceptFollowsFix = require('./mocks/fixtures/syncConceptFollows');
const edpFix = require('./mocks/fixtures/emailDigestPreference.json');

const suppressLogs = true; //for local test if you want logs when test are run

describe('syncUserFollowers', () => {
  const fakeGroupId = '00000000-0000-0000-0000-000000000123';
  const fakeUserId = '00000000-0000-0000-0000-000000000001';
  const uuid = env.USER_UUID;
  const groupId = env.LICENCE_UUID;

  const kinesisRes = [
    { FailedRecordCount:0,
      Records:[{
        SequenceNumber:'fifty-digit-no-00005',
        ShardId:'shardId-000000000000'}
      ]
    }];

  let getGroupConceptStub;
  let getGroupSyncedConceptStub;
  let getConceptsFollowedByUserStub;
  let addConceptsFollowedByKatUserStub;
  let getEDPStub;
  let noGroupConceptsToFollowStub;
  let kinesisWriteStub;
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

  beforeEach((done) => {
    //myFT.getConceptsFollowedByGroup
    getConceptsFollowedByUserStub = sinon.stub(myFT, 'getConceptsFollowedByUser').resolves(syncConceptFollowsFix.userConcepts);
    addConceptsFollowedByKatUserStub = sinon.stub(myFT, 'addConceptsFollowedByKatUser').resolves(true);
    getEDPStub = sinon.stub(myFT, 'getEmailDigestPreference').resolves(edpFix);
    done();
  });

  afterEach(done => {
      nock.cleanAll();
      getConceptsFollowedByUserStub.restore();
      addConceptsFollowedByKatUserStub.restore();
      getEDPStub.restore();
      done();
  });

  after(done => {

    if(suppressLogs) {
      logMessageStub.restore();
    }
    done();
  });

  //Happy empty path
  it('should return status synchronisationIgnored and reason noGroupConceptsToFollow in object for no topics', (done)=> {
    noGroupConceptsToFollowStub = sinon.stub(myFT, 'getConceptsFollowedByGroup').resolves(syncConceptFollowsFix.noGroupConcepts);

    syncUserFollowers(fakeGroupId, fakeUserId).then(res => {
      expect(res).to.be.an('object');
      expect(res).to.have.deep.property('user.status', 'synchronisationIgnored');
      expect(res).to.have.deep.property('user.reason', 'noGroupConceptsToFollow');
        //clean up
        noGroupConceptsToFollowStub.restore();
        done();
    }).catch(done);

  });

  it('should return status synchronisationIgnored and reason noNewConceptsToFollow in object for no topics', (done)=> {
    getGroupSyncedConceptStub = sinon.stub(myFT, 'getConceptsFollowedByGroup').resolves(syncConceptFollowsFix.syncedConcepts);

    syncUserFollowers(groupId, uuid).then(res => {
      expect(res).to.be.an('object');
      expect(res).to.have.deep.property('user.status', 'synchronisationIgnored');
      expect(res).to.have.deep.property('user.reason', 'noNewConceptsToFollow');
       //clean up
       getGroupSyncedConceptStub.restore();
       done();
    }).catch(done);

  });

  //Happy empyty path
  it('should return synchronisationCompleted if there topics to follow', (done)=> {
    getGroupConceptStub = sinon.stub(myFT, 'getConceptsFollowedByGroup').resolves(syncConceptFollowsFix.groupConcepts);
    kinesisWriteStub = sinon.stub(kinesisClient, 'write').resolves(kinesisRes);

    syncUserFollowers(groupId, uuid).then(res => {

      expect(res).to.have.deep.property('user.status', 'synchronisationCompleted');
      expect(res).to.have.deep.property('user.uuid', uuid);
      expect(res).to.have.deep.property('user.group', groupId);
      expect(res.user.newConceptsToFollow).to.be.an('array');
      expect(res.user.newConceptsToFollow[0].uuid).to.equal(uuids.mockNewTopic);
      expect(res.user.newConceptsToFollow).to.be.an('array');

       //clean up
       getGroupConceptStub.restore();
       kinesisWriteStub.restore();
       done();
    }).catch(done);
  });
});
