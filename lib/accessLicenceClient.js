'use strict';

/**
 * Access Licence Service Client
 */
const fetch = require('n-eager-fetch');
const log = require('@financial-times/n-logger').default;
const config = require('./helpers/config');
const helpers = require('./helpers/helpers');

const options = Object.assign({}, config.fetchOptions);
options.headers = Object.assign({}, options.headers, {'X-API-KEY': config.KAT_MEMB_API_KEY});

/**
 * Gets the licence for a certain query
 * @param {Object} query - of the user, can be one of the following: adminuserid | linkid | linktype | status | userid
 *        for example {userid:'[user-id-number]'} to find the licences a user belongs to.
 * @return {Promise} response - an array of information about the licences found
 */
function getLicences (query) {
  const operation = 'accessLicenceClient.getLicences';
  log.debug({operation, query: JSON.stringify(query)});

  if (query.adminuserid || query.linkid || query.linktype || query.status || query.userid) {
    const queryString = helpers.createParams(query);
    const url = `${config.API_GATEWAY_HOST}/licences${queryString}`;
    return fetch(url, Object.assign({}, options))
      .then(res => helpers.parseJsonRes(res, `${operation} ${queryString}`))
      .then(res => {
        log.debug({operation, queryString, res: 'success'});
        return res.accessLicences;
      });
  }
  return Promise.reject(Error('At least one of adminuserid | linkid | linktype | status | userid must be specified'));
}

/**
 * Gets the uuid of users from a licence
 * @param {String} licenceID - of the licence to lookup
 * @return {Promise} response - an array seats on the licence
 */
function getSeats (licenceID) {
  const operation = 'accessLicenceClient.getSeats';
  log.debug({operation, licenceID});

  const url = `${config.API_GATEWAY_HOST}/licences/${licenceID}/seats`;
  return fetch(url, Object.assign({}, options))
    .then(res => helpers.parseJsonRes(res, `${operation} ${licenceID}`))
    .then(res => {
      log.debug({operation, licenceID, res: 'success'});
      return res.seats;
    });
}

/**
 * Gets the licence info
 * @param {String} licenceId -
 * @returns {Promise} response -
 */
function getLicenceInfo (licenceId) {
  const operation = 'accessLicenceClient.getLicenceInfo';
  log.debug({operation, licenceId});

  const url = `${config.API_GATEWAY_HOST}/licences/${licenceId}`;
  return fetch(url, Object.assign({}, options))
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, licenceId, res: 'success'});
      return res;
    });
}

/**
 * Gets the licence administrators
 * @param {String} licenceId -
 * @returns {Promise} response -
 */
function getAdministrators (licenceId) {
  const operation = 'accessLicenceClient.getAdministrators';
  log.debug({operation, licenceId});

  const url = `${config.API_GATEWAY_HOST}/licences/${licenceId}/administrators`;
  return fetch(url, Object.assign({}, options))
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, licenceId, res: 'success'});
      return res;
    });
}

module.exports = {
  getLicences,
  getSeats,
  getLicenceInfo,
  getAdministrators
};
