'use strict';

/**
 * User Profile Service Client
 *
 */

 const log = require('@financial-times/n-logger').default;
 const config = require('./config');
 const statusErrors = require('./statusErrors');
 const qs = require('querystring');

 const options = Object.assign({}, config.fetchOptions, { headers: Object.assign({}, config.fetchOptions.headers, { "X-API-KEY": config.acqCtxKey })});

  module.exports = {
 	 getUUID,
	//  getProducts,
	//  getSubsStatus,
 };

 /**
  * Gets the uuid for a given users email address
  * @param {email} of the user
  * @return {Promise} the user profile with only a uuid value set
  */
 function getUUID(email) {
 	const queryString=qs.stringify({email});
 	const url = `${config.userProfileURL}?${queryString}`;
 	return fetch(url, options)
 	.then(res => {
 		log.debug({operation:'getUUID', url, status: res.status});
 		statusErrors.parse(res, `getUUID ${queryString}`);
 		return res.json();
 	})
	.then(body => {
		log.debug({operation:'getUUID', body:JSON.stringify(body)});
		return body.items[0];
	});
 }

 /**
  * Checks to see if a user's uuid exists in membership
  * @param {uuid} of the user
  * @return {Promise} the user profile with only a uuid value set
  */
 function exists(uuid) {
 	const queryString=qs.stringify({uuid});
 	const url = `${config.userProfileURL}?${queryString}`;
 	return fetch(url, options)
 	.then(res => {
 		log.debug({operation:'exists', url, status: res.status});
 		statusErrors.parse(res, `exists ${queryString}`);
 		return res.json();
 	});
 }
