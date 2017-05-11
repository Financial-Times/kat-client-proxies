'use strict';
/**
 * Acquisition Context Service Client
 */
const fetch = require('fetch-retry-or-die');
const log = require('@financial-times/n-logger').default;
const config = require('./helpers/config');
const helpers = require('./helpers/helpers');

const options = Object.assign({}, config.fetchOptions);
options.headers = Object.assign({}, options.headers, {"X-API-KEY": config.ACS_API_KEY});

/**
 * Gets a list of acquisition contents based a filter
 * @param {Object} ctxFilter - an object with one of the following properties set: access-licence-id, email-domain, ip-address
 * @return {Promise} response - array of acquisition context items
 */
function getContexts(ctxFilter) {
  const operation = 'acquisitionCtxClient.getContexts';
  const queryString = helpers.createParams(ctxFilter);
  log.debug({operation, queryString});

  const url = `${config.ACS_API_URL}${queryString}`;
  return fetch(url, options)
    .then(res => helpers.parseJsonRes(res, `${operation} ${queryString}`))
    .then(res => {
      log.debug({operation, queryString, res: 'success'});
      return res.items;
    });
}

module.exports = {
  getContexts
};
