'use strict';

const fetch = require('fetch-retry-or-die');
const log = require('@financial-times/n-logger').default;
const config = require('./helpers/config');
const helpers = require('./helpers/helpers');
const clientErrors = require('./clientErrors');

const options = Object.assign({}, config.fetchOptions);
options.headers = Object.assign({}, options.headers, {"X-API-KEY": config.API_GATEWAY_KEY});

/**
 * Verifies the session key
 * @param {String} sessionKey -
 * @returns {Promise} response -
 */
function verify(sessionKey) {
  const operation = 'sessionClient.verify';
  log.debug({operation});

  const url = `${config.API_GATEWAY_HOST}/sessions/${sessionKey}`;
  return fetch(url, options)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, res: 'success'});
      return res;
    });
}

/**
 * Gets the auth token
 * @param {String} FTSessionSecure -
 * @param {String} [scope] -
 * @param {Boolean} [testBodyUrl] -
 * @returns {Promise} response -
 */
function getAuthToken(FTSessionSecure, scope = 'licence_data', testBodyUrl = false) {
  const operation = 'sessionClient.getAuthToken';
  log.debug({operation, scope});

  const newOptions = Object.assign({}, config.fetchOptions);
  newOptions.headers = {'Cookie': `FTSession_s=${FTSessionSecure}`};

  const url = `${config.API_GATEWAY_HOST}/authorize?response_type=token&client_id=${config.API_AUTH_CLIENT_ID}&redirect_uri=${config.DEFAULT_REDIRECT_URL}&scope=${scope}`;
  return fetch(url, newOptions)
    .then(res => testBodyUrl !== true ? res : helpers.parseJsonRes(res))
    .then(res => {
      const authObj = helpers.uriFragSplitter(res.url);

      if (authObj.access_token !== undefined) {
        log.info({operation, result: res.status});
        return authObj.access_token;
      }

      //Setting unauthorized on the presents of error
      //The value can be any of the following for an invalid session invalid_grant invalid_request invalid_scope right now
      if (authObj.error !== undefined) {
        log.error({operation, error: authObj.error, errorDescription: authObj.error_description});

        const err = new clientErrors.NotAuthorisedError('Unauthorized from apiAuth');
        err.status = 401;
        throw err;
      }

      // how do we wanna handle this indeed if there is a this
      const err = new clientErrors.ClientError('apiAuthService error');
      err.status = res.status;
      throw err;
    });
}

module.exports = {
  verify,
  getAuthToken
};
