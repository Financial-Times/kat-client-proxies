'use strict';

const fetch = require('fetch-retry-or-die');
const log = require('@financial-times/n-logger').default;
const config = require('./helpers/config');
const helpers = require('./helpers/helpers');

const options = Object.assign({}, config.fetchOptions);
options.headers = Object.assign({}, options.headers, {"X-API-KEY": config.apiGatewayKey});

/**
 * Verifies the session key
 * @param {String} sessionKey -
 * @returns {Promise} response -
 */
function verify(sessionKey) {
  const operation = 'sessionClient.verify';
  log.debug({operation});

  const url = `${config.apiGatewayURL}/sessions/${sessionKey}`;
  return fetch(url, options)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, res: JSON.stringify(res)});
      return res;
    });
}

/**
 * Gets the auth token
 * @param {String} FTSessionSecure -
 * @param {String} [scope] -
 * @returns {Promise} response -
 */
function getAuthToken(FTSessionSecure, scope = 'licence_data') {
  const operation = 'sessionClient.getAuthToken';
  log.debug({operation, scope});

  const newOptions = Object.assign({}, config.fetchOptions);
  newOptions.headers = Object.assign({}, options.headers, {'Cookie': `FTSession_s=${FTSessionSecure}`});

  const url = `${config.apiGatewayURL}/authorize?response_type=token&client_id=${config.apiAuthClientId}&redirect_uri=${config.defaultRedirectUrl}&scope=${scope}`;
  return fetch(url, options)
    .then(res => {
      const authObj = helpers.uriFragSplitter(res.url);

      if (authObj.access_token !== undefined) {
        log.info({operation, result: res.status});
        return authObj.access_token;
      }

      //Setting unauthorized on the presents of error
      //The value can be any of the following for an invalid session invalid_grant invalid_request invalid_scope right now
      if (authObj.error !== undefined) {
        log.info({operation, error: authObj.error, errorDescription: authObj.error_description});

        const err = new Error('Unauthorized from apiAuth');
        err.status = 401;
        throw err;
      }

      // how do we wanna handle this indeed if there is a this
      const err = new Error('apiAuthService error');
      err.status = res.status;
      throw err;
    });
}

module.exports = {
  verify,
  getAuthToken
};
