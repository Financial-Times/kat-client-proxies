'use strict';

const proxies = require('./../index');
const myFT = proxies.myFTClient;
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
const extraParams = `?noEvent=${config.MYFT_NO_EVENT}&waitForPurge=${config.MYFT_WAIT_FOR_PURGE_ADD}`;
const syncUserFollowers = proxies.syncUserFollowers;
const uuidv4 = require('uuid/v4');
const syncUserFollowsFix = require('./mocks/fixtures/syncUserFollows')

const myftConst = config.myftClientConstants;
const suppressLogs = true; //for local test if you want logs when test are run

//TODO spec out tests for syncUserFollowers
//TODO write stubs for:

//myFT.getConceptsFollowedByGroup
//myFT.getConceptsFollowedByUser
//myFT.addConceptsFollowedByKatUser
//myFT.getEmailDigestPreference
//myFT.setEmailDigestPreference

describe.only('syncUserFollowers', () => {
  // let logMessageStub;
  // const logMessages = [];

  before(done => {
    // if(suppressLogs) {
    //   logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
    //     logMessages.push(params);
    //   });
    // }

    done();
  });

  afterEach(done => {
      nock.cleanAll();
      done();
  });

  after(done => {


    // if(suppressLogs) {
    //   logMessageStub.restore();
    // }
    done();
  });

  const fakeGroupId = '00000000-0000-0000-0000-000000000123';
  const fakeUserId = '00000000-0000-0000-0000-000000000001';
  const uuid = env.USER_UUID;
  const groupId = env.LICENCE_UUID;

  //Happy empyty path
  xit('should return status synchronisationIgnored and reason noGroupConceptsToFollow in object for no topics', (done)=> {

    const fakeRes = {
      user: {
        uuid: '00000000-0000-0000-0000-000000000001',
        group: '00000000-0000-0000-0000-000000000123',
        status: 'synchronisationIgnored',
        reason: 'noGroupConceptsToFollow'
      }
   }

    // nock(baseUrl)
    //   .get(`/group/${fakeGroupId}/followed/concept`)
    //   .query(true)
    //   .reply(200, () => fakeRes);

    syncUserFollowers(fakeGroupId, fakeUserId).then(res => {
      console.log(res);
      expect(res).to.be.an('object');
      expect(res).to.have.deep.property('user.status', 'synchronisationIgnored');
      expect(res).to.have.deep.property('user.reason', 'noGroupConceptsToFollow');
      done();
    }).catch(done);

  });

  xit('should return status synchronisationIgnored and reason noNewConceptsToFollow in object for no topics', (done)=> {

    // nock(baseUrl)
    //   .get(`/group/${fakeGroupId}/followed/concept`)
    //   .query(true)
    //   .reply(200, () => []);

    syncUserFollowers(groupId, uuid).then(res => {
      console.log(res);
      expect(res).to.be.an('object');
      expect(res).to.have.deep.property('user.status', 'synchronisationIgnored');
      expect(res).to.have.deep.property('user.reason', 'noNewConceptsToFollow');
      done();
    }).catch(done);

  });
  //Happy empyty path
  it('should return synchronisationCompleted if there are no topics to follow', (done)=> {

    const newUuid = uuidv4();
    const newTopicArray = [ "00000000-0000-0000-0000-000000000007",
    "00000000-0000-0000-0000-000000000002"];

    nock(baseUrl)
      .get(`/group/${groupId}/followed/concept`)
      .query(true)
      .reply(200, () => syncUserFollowsFix);

    syncUserFollowers(groupId, newUuid).then(res => {
      //console.log(res);
      expect(res).to.be.an('object');
      //expect(res).to.have.deep.property('user.status', 'synchronisationCompleted');
      expect(res).to.have.deep.property('user.uuid', newUuid);
      expect(res).to.have.deep.property('user.group', groupId);
      //expect(res).to.have.deep.property('user.newConceptsToFollow', newTopicArray);
      //expect(res.user.newConceptsToFollow).to.be.an('array');
      done();
    }).catch(done);

  });
});
