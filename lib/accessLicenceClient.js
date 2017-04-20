'use strict';

/**
 * Access Licence Service Client
 */
const fetch = require('fetch-retry-or-die');
const log = require('@financial-times/n-logger').default;
const config = require('./helpers/config');
const qs = require('querystring');
const helpers = require('./helpers/helpers');

const options = Object.assign({}, config.fetchOptions);
options.headers = Object.assign({}, options.headers, {"X-API-KEY": config.accLicenceKey});

/**
 * Gets the licence for a certain query
 * @param {Object} query - of the user, can be one of the following: adminuserid | linkid | linktype | status | userid
 *        for example {userid:'21512c83-6232-476a-9825-00fe51024f5c'} to find the licences a user belongs to.
 * @return {Promise} response - an array of information about the licences found
 */
function getLicences(query) {
  const operation = 'accessLicenceClient.getLicences';
  log.debug({operation, query: JSON.stringify(query)});
  if (query.adminuserid || query.linkid || query.linktype || query.status || query.userid) {
    const queryString = qs.stringify(query);
    const url = `${config.accLicenceURL}/licences?${queryString}`;
    return fetch(url, options)
      .then(res => helpers.parseJsonRes(res, `${operation} ${queryString}`))
      .then(res => {
        log.debug({operation, queryString, res: JSON.stringify(res)});
        return res.accessLicences;
      });
  } else {
    throw Error('At least one of adminuserid | linkid | linktype | status | userid must be specified');
  }
}
// TODO: WIP
///**
// * Gets the uuid for a given users email address
// * @param {Object} query - of the user, can be one of the following: linktype | status
// * @return {Promise} response - an array of licences ids found
// */
//function getIDs(query) {
//  const operation = 'accessLicenceClient.getIDs';
//  const queryString = qs.stringify(query);
//  log.debug({operation, queryString});
//  const url = `${config.accLicenceURL}/licences/ids?${queryString}`;
//  return fetch(url, options)
//    .then(res => helpers.parseJsonRes(res, `${operation} ${queryString}`))
//    .then(res => {
//      log.debug({operation, queryString, res: JSON.stringify(res)});
//      return res.accessLicences;
//    });
//}

/**
 * Gets the uuid for a given users email address
 * @param {String} licenceID - of the licence to lookup
 * @return {Promise} response - an array seats on the licence
 */
function getSeats(licenceID) {
  const operation = 'accessLicenceClient.getSeats';
  log.debug({operation, licenceID});
  const url = `${config.accLicenceURL}/licences/${licenceID}/seats`;
  return fetch(url, options)
    .then(res => helpers.parseJsonRes(res, `${operation} ${licenceID}`))
    .then(res => {
      log.debug({operation, licenceID, res: JSON.stringify(res)});
      return res.seats;
    });
}

module.exports = {
  getLicences,
  //getIDs,// TODO: WIP
  getSeats
};
