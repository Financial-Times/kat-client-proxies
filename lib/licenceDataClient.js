'use strict';

const fetch = require('fetch-retry-or-die');
const log = require('@financial-times/n-logger').default;
const config = require('./helpers/config');
const helpers = require('./helpers/helpers');

const options = Object.assign({}, config.fetchOptions);
options.headers = Object.assign({}, options.headers, {"X-API-KEY": config.API_GATEWAY_KEY});
const apiUrl = `${config.API_GATEWAY_HOST}/licence-seat-holders`;

/**
 * Gets the request options and sets the Bearer if the token is given
 * @param {String} [apiAuthToken] -
 * @returns {Object} requestOptions -
 * @private
 */
function _getOptions(apiAuthToken) {
  if (apiAuthToken) {
    options.headers.authorization = `Bearer ${apiAuthToken}`;
  } else {
    delete options.headers.authorization;
  }
  return options;
}

/**
 * Gets the filtered user list
 * @param {String} licenceId -
 * @param {String} [apiAuthToken] -
 * @param {Object} [options] -
 * @returns {Promise} response -
 */
function getFilteredUserList(licenceId, apiAuthToken, options) {
  const operation = 'licenceDataClient.getFilteredUserList';
  const queryString = helpers.createParams(options);
  log.debug({operation, licenceId, queryString});

  const url = `${apiUrl}/${licenceId}${queryString}`;
  return fetch(url, _getOptions(apiAuthToken))
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, queryString, res: 'success'});
      return res;
    });
}

/**
 * Gets the admin list
 * @param {String} licenceId -
 * @param {String} [apiAuthToken] -
 * @returns {Promise} response -
 */
function getAdminUserList(licenceId, apiAuthToken) {
  const operation = 'licenceDataClient.getAdminUserList';
  log.debug({operation, licenceId});

  const url = `${apiUrl}/${licenceId}/admins`;
  return fetch(url, _getOptions(apiAuthToken))
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, res: 'success'});
      return res;
    });
}

module.exports = {
  getFilteredUserList,
  getAdminUserList
};
