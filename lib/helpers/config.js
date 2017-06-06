'use strict';
const envVars = process.env;
const config = {
  NODE_ENV: envVars.NODE_ENV,
  fetchOptions: {
    credentials: "include",
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    },
    retry: parseInt((envVars.MAX_RETRIES || 5), 10)
  },
  MYFT_API_URL: envVars.MYFT_API_URL,
  MYFT_API_KEY: envVars.MYFT_API_KEY,
  ACS_API_URL: envVars.ACS_API_URL,
  ACS_API_KEY: envVars.ACS_API_KEY,
  API_GATEWAY_HOST: envVars.API_GATEWAY_HOST,
  API_GATEWAY_KEY: envVars.API_GATEWAY_KEY,
  API_AUTH_CLIENT_ID: envVars.API_AUTH_CLIENT_ID,
  DEFAULT_REDIRECT_URL: envVars.DEFAULT_REDIRECT_URL,
  USER_PROFILE_API_URL: envVars.USER_PROFILE_API_URL,
  USER_PROFILE_API_KEY: envVars.USER_PROFILE_API_KEY,
  ALS_API_URL: envVars.ALS_API_URL,
  ALS_API_KEY: envVars.ALS_API_KEY,
  FT_TOOL_ID: envVars.FT_TOOL_ID || 'KAT',
  FT_TOOL_ADMIN_ID: envVars.FT_TOOL_ADMIN_ID,
  FT_TOOL_DATE_ID: envVars.FT_TOOL_DATE_ID || 'kmtRegistrationDate',
  MYFT_NO_EVENT: envVars.MYFT_NO_EVENT || 'true',
  MYFT_WAIT_FOR_PURGE_ADD: envVars.MYFT_WAIT_FOR_PURGE_ADD || 'false',
  MYFT_WAIT_FOR_PURGE_REMOVE: envVars.MYFT_WAIT_FOR_PURGE_REMOVE || 'false',
  BATCH_USER_COUNT: parseInt((envVars.BATCH_USER_COUNT || 5), 10),
  BATCH_USER_CONCURRENCY: parseInt((envVars.BATCH_USER_CONCURRENCY || 5), 10),
  KINESIS_REGION: envVars.KINESIS_REGION || 'eu-west-1',
  MYFT_EVENT_STREAM: envVars.MYFT_EVENT_STREAM || 'ft-b2b-kmt_myft_events',
  KINESIS_CHUNK_SIZE: parseInt((envVars.KINESIS_CHUNK_SIZE || 500), 10),
  DONT_WRITE_TO_KINESIS: envVars.DONT_WRITE_TO_KINESIS === 'true',
  ELASTIC_SEARCH_URL: envVars.ELASTIC_SEARCH_URL,
  FACETS_SEARCH_URL: envVars.FACETS_SEARCH_URL,
  myftClientConstants: {
    userNodeName: 'user',
    groupNodeName: 'group',
    licenceNodeName: 'license',
    memberRelName: 'member',
    followedRelName: 'followed',
    topicNodeName: 'concept',
    prefRelName: 'preference',
    prefRelType: 'preferred',
    prefRelId: 'email-digest'
  }
};

module.exports = config;
