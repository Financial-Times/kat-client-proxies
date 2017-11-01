'use strict';

const proxies = require('./../index');
const myFT = proxies.myFTClient;
const uuids = require('./mocks/uuids');
const expect = require('chai').expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const env = require('./helpers/env');
const sync = proxies.syncUserFollows;
const kinesisClient = proxies.kinesisClient;
const syncConceptFollowsFix = require('./mocks/fixtures/syncConceptFollows');
const edpFix = require('./mocks/fixtures/emailDigestPreference.json');

const suppressLogs = false; //for local test if you want logs when test are run

describe('sync.userFollows', () => {
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

	before(() => {
		if(suppressLogs) {
			logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
				logMessages.push(params);
			});
		}
	});

	beforeEach(() => {
		getConceptsFollowedByUserStub = sinon.stub(myFT, 'getConceptsFollowedByUser').resolves(syncConceptFollowsFix.userConcepts);
		addConceptsFollowedByKatUserStub = sinon.stub(myFT, 'addConceptsFollowedByKatUser').resolves(true);
		getEDPStub = sinon.stub(myFT, 'getEmailDigestPreference').resolves(edpFix);
	});

	afterEach(() => {
			nock.cleanAll();
			getConceptsFollowedByUserStub.restore();
			addConceptsFollowedByKatUserStub.restore();
			getEDPStub.restore();
	});

	after(() => {

		if(suppressLogs) {
			logMessageStub.restore();
		}

	});

	//Happy empty path
	it('should return status synchronisationIgnored and reason noGroupConceptsToFollow in object for no topics', ()=> {
		noGroupConceptsToFollowStub = sinon.stub(myFT, 'getConceptsFollowedByGroup').resolves(syncConceptFollowsFix.noGroupConcepts);

		return sync.userFollows(fakeGroupId, fakeUserId).then(res => {
			expect(res).to.be.an('object');
			expect(res).to.have.deep.property('user.status', 'synchronisationIgnored');
			expect(res).to.have.deep.property('user.reason', 'noGroupConceptsToFollow');
			//clean up
			noGroupConceptsToFollowStub.restore();

		});

	});

	it('should return status synchronisationIgnored and reason noNewConceptsToFollow in object for no topics', ()=> {
		getGroupSyncedConceptStub = sinon.stub(myFT, 'getConceptsFollowedByGroup').resolves(syncConceptFollowsFix.syncedConcepts);

		sync.userFollows(groupId, uuid).then(res => {
			expect(res).to.be.an('object');
			expect(res).to.have.deep.property('user.status', 'synchronisationIgnored');
			expect(res).to.have.deep.property('user.reason', 'noNewConceptsToFollow');
			//clean up
			getGroupSyncedConceptStub.restore();

		});

	});

	//Happy empyty path
	it('should return synchronisationCompleted if there topics to follow', ()=> {
		getGroupConceptStub = sinon.stub(myFT, 'getConceptsFollowedByGroup').resolves(syncConceptFollowsFix.groupConcepts);
		kinesisWriteStub = sinon.stub(kinesisClient, 'write').resolves(kinesisRes);

		sync.userFollows(groupId, uuid).then(res => {
			expect(res).to.have.deep.property('user.status', 'synchronisationCompleted');
			expect(res).to.have.deep.property('user.uuid', uuid);
			expect(res).to.have.deep.property('user.group', groupId);
			expect(res.user.newConceptsToFollow).to.be.an('array');
			expect(res.user.newConceptsToFollow[0].uuid).to.equal(uuids.mockNewTopic);

			//clean up
			getGroupConceptStub.restore();
			kinesisWriteStub.restore();
		});
	});
});
