const signedFetch = require('signed-aws-es-fetch');
const log = require('@financial-times/n-logger').default;
const helpers = require('./helpers/helpers');
const config = require('./helpers/config');

/**
 * Gets a list of headlines for a specific topic, from the Elastic Search api
 * @param {Object} query - The ES query object
 * @return {Promise} response -
 */
function getTopicHeadlines(query) {
  const operation = 'elasticSearchClient.getTopicHeadlines';
  log.debug({operation});

  return signedFetch(config.elasticSearchUrl, query)
    .then(res => {
      log.debug({operation, status: res.status});
      return res;
    })
    .then(helpers.parseJsonRes);
}


module.exports = {
  getTopicHeadlines
};
