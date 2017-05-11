const fetch = require('fetch-retry-or-die');
const log = require('@financial-times/n-logger').default;
const helpers = require('./helpers/helpers');
const config = require('./helpers/config');

/**
 * Gets a list of topics from the Facets api
 * @param {Object} params -
 *                      tagged: List of already selected topics separated by comma
 *                      maxResults: The maximum number of results
 *                      queryString: The query string
 * @return {Promise} result -
 */
function getTopics(params) {
  const operation = 'facetsClient.getTopics';
  const paramStr = JSON.stringify(params);
  log.debug({operation, params: paramStr});

  const theUrl = `${config.FACETS_SEARCH_URL}${helpers.createParams(params)}`;

  return fetch(theUrl, config.fetchOptions)
    .then(res => {
      log.debug({operation, status: res.status});
      return res;
    })
    .then(helpers.parseJsonRes);
}

module.exports = {
  getTopics
};
