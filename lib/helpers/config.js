'use strict';

const config = {
  nodeEnv: process.env.NODE_ENV,
  fetchOptions: {
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    maxRetries: process.env.MAX_RETRIES || 5,
    retryDelay: process.env.RETRY_DELAY || 300
  },
  myFTURL: process.env.MYFT_API_URL,
  myFTKey: process.env.MYFT_API_KEY,
  acqCtxURL: process.env.ACS_API_URL,
  acqCtxKey: process.env.ACS_API_KEY,
  userProfileURL: process.env.USER_PROFILE_API_URL,
  userProfileKey: process.env.USER_PROFILE_API_KEY,
  accLicenceURL: process.env.ALS_API_URL,
  accLicenceKey: process.env.ALS_API_KEY,
  toolIdentifier: process.env.FT_TOOL_ID || 'KAT',
  defaultAdminId: process.env.FT_TOOL_ADMIN_ID,
  toolDateIdentifier: process.env.FT_TOOL_DATE_ID || 'katRegistrationDate',
  myFtNoEvent: process.env.MYFT_NO_EVENT || 'true',
  myFtWaitForPurgeAdd: process.env.MYFT_WAIT_FOR_PURGE_ADD || 'false',
  myFtWaitForPurgeRemove: process.env.MYFT_WAIT_FOR_PURGE_REMOVE || 'false',
  myFtBatchUserCount: parseInt((process.env.BATCH_USER_COUNT || 5), 10),
  myFtBatchUserConcurrency: parseInt((process.env.BATCH_USER_CONCURRENCY || 5), 10),
  kinesisRegion: process.env.KINESIS_REGION || 'eu-west-1',
  kinesisStream: process.env.MYFT_EVENT_STREAM || 'ft-b2b-kmt_myft_events',
  kinesisNoWrite: process.env.DONT_WRITE_TO_KINESIS === 'true',
  elasticSearchUrl: process.env.ELASTIC_SEARCH_URL,
  facetsSearchUrl: process.env.FACETS_SEARCH_URL,
};

module.exports = config;
