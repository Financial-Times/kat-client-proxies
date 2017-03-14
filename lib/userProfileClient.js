'use strict';

/**
 * User Profile Service Client
 *
 */
 const fetch = require('fetch-retry-or-die');
 const log = require('@financial-times/n-logger').default;
 const config = require('./config');
 const statusErrors = require('./statusErrors');
 const qs = require('querystring');

 const options = Object.assign({}, config.fetchOptions, { headers: Object.assign({}, config.fetchOptions.headers, { "X-API-KEY": config.acqCtxKey })});

  module.exports = {
 	 getUUID,
	 exists
	//  getProducts,
	//  getSubsStatus,
 };

 /**
  * Gets the uuid for a given users email address
  * @param {string} email - of the user
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
			if (Array.isArray(body.items)) {
				const itemLength = body.items.length;
				if (itemLength === 0){
					return null;
				} else if (itemLength === 1) {
					return body.items[0];
				} else if (itemLength > 1){
					log.warn({operation:'getUUID', status:'multiple uuids matched', uuids:body.items.map(item=>item.id)});
					return body.items[0];
				}
			}
			// TODO: log error
		});
 }

 /**
  * Checks to see if a user's uuid exists in membership
  * @param {string} id - of the user
  * @return {Promise} the user profile with only a uuid value set
  */
 function exists(id) {
 	const queryString=qs.stringify({id});
 	const url = `${config.userProfileURL}?${queryString}`;
	const ops = Object.assign(options, {method:'HEAD'});
 	return fetch(url, ops)
		.then(res => {
			log.debug({operation:'exists', method:ops.method, url, status: res.status});
			statusErrors.parse(res, `calling exists ${queryString}`);
			res.read();
			res.resume();
			return res.status === 200;
		});
 }
