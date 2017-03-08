'use strict';

/**
 * Acquisition Context Service Client
 *
 */
const log = require('@financial-times/n-logger').default;
const config = require('./config');
const statusErrors = require('./statusErrors');
const qs = require('querystring');

const options = Object.assign({}, config.fetchOptions, { headers: Object.assign({}, config.fetchOptions.headers, { "X-API-KEY": config.acqCtxKey })});

 module.exports = {
	 getContexts
};

/**
 * Gets a list of acquisition contents based a filter
 * @param {object} ctxFilter - an object with one of the following properties set: access-licence-id, email-domain, ip-address
 * @return {Promise} array of acquisition context items
 */
function getContexts(ctxFilter) {
	const queryString=qs.stringify(ctxFilter);
	const url = `${config.acqCtxURL}?${queryString}`;
	return fetch(url, options)
		.then(res => {
			log.debug({operation:'getContexts', url, status: res.status});
			statusErrors.parse(res, `getContexts ${queryString}`);
			return res.json();
		})
		.then(acqObj => acqObj.items);
}
