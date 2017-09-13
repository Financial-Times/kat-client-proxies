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
const sync = proxies.sync;

const myftConst = config.myftClientConstants;

//TODO spec out tests for syncUserFollowers
xdescribe('syncUserFollowers', () => {
  const groupId = '00000000-0000-0000-0000-000000000123';
    const uuid = '00000000-0000-0000-0000-000000000001';

  it('should do something', (done)=> {

    return sync.userFollowers(groupId, uuid);
    done();
  });

});
