'use strict';

/**
 * Access Licence Service Client
 *
 */
const log = require('@financial-times/n-logger').default;
const config = require('./config');
const statusErrors = require('./statusErrors');
const qs = require('querystring');

const options = Object.assign({}, config.fetchOptions, {headers: Object.assign({}, config.fetchOptions.headers, {"X-API-KEY": config.accLicenceKey})});

module.exports = {
    getLicences,
		getIDs,
		getSeats
};

/**
 * Gets the uuid for a given users email address
 * @param {query} of the user, can be one of the following: adminuserid | linkid | linktype | status | userid
 *        for example {userid:'21512c83-6232-476a-9825-00fe51024f5c'} to find the licences a user belongs to.
 * @return {Promise} an array of information about the licences found
 */
function getLicences(query) {
	if (query.adminuserid || query.linkid || query.linktype || query.status || query.userid) {
		const queryString = qs.stringify(query);
	  const url = `${config.accLicenceURL}/licences?${queryString}`;
	  // log.silly(url, options);
	  return fetch(url, options).then(res => {
	      log.debug({operation: 'getLicences', url, status: res.status});
	      statusErrors.parse(res, `getLicences ${queryString}`);
	      return res.json().then(res => res.accessLicences);
	  });
	} else {
		throw Error('At least one of adminuserid | linkid | linktype | status | userid must be specified');
	}
}

/**
 * Gets the uuid for a given users email address
 * @param {query} of the user, can be one of the following: linktype | status
 * @return {Promise} an array of licences ids found
 */
function getIDs(query) {
    const queryString = qs.stringify(query);
    const url = `${config.accLicenceURL}/licences/ids?${queryString}`;
    // log.silly(url, options);
    return fetch(url, options).then(res => {
        log.debug({operation: 'getLicences', url, status: res.status});
        statusErrors.parse(res, `getLicences ${queryString}`);
        return res.json().then(res => res.accessLicences);
    });
}

/**
 * Gets the uuid for a given users email address
 * @param {licenceID} of the licence to lookup
 * @return {Promise} an array seats on the licence
 */
function getSeats(licenceID) {
    const url = `${config.accLicenceURL}/licences/${licenceID}/seats`;
    // log.silly(url, options);
    return fetch(url, options).then(res => {
        log.debug({operation: 'getSeats', url, status: res.status});
        statusErrors.parse(res, `getSeats ${licenceID}`);
        return res.json().then(res=>res.seats);
    });
}
