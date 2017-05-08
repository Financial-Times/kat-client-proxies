'use strict';

/**
 * User Profile Service Client
 */
const fetch = require('fetch-retry-or-die');
const log = require('@financial-times/n-logger').default;
const config = require('./helpers/config');
//const clientErrors = require('./clientErrors');
const helpers = require('./helpers/helpers');

const options = Object.assign({}, config.fetchOptions);
options.headers = Object.assign({}, options.headers, {"X-API-KEY": config.ACS_API_KEY});

/**
 * Gets the uuid for a given users email address
 * @param {String} email - of the user
 * @return {Promise} response - the user profile with only a uuid value set
 */
function getUUID(email) {
  const operation = 'userProfileClient.getUUID';
  log.debug({operation, email});
  const queryString = helpers.createParams({email});
  const url = `${config.USER_PROFILE_API_URL}${queryString}`;
  return fetch(url, options)
    .then(res => helpers.parseJsonRes(res, `${operation} ${queryString}`))
    .then(body => {
      if (Array.isArray(body.items)) {
        log.debug({operation, email, body: JSON.stringify(body)});
        const itemLength = body.items.length;
        if (itemLength === 1) {
          return body.items[0];
        } else if (itemLength > 1){
          log.warn({operation, email, status: 'multiple uuids matched', uuids: body.items.map(item => item.id)});
          return body.items[0];
        }
      }
      log.error({operation, email, msg: 'Invalid body type', body: JSON.stringify(body)});
      return null;
    });
}

/**
 * Checks to see if a user's uuid exists in membership
 * @param {String} id - of the user
 * @return {Promise} response - the user profile with only a uuid value set
 */
function exists(id) {
  const operation = 'userProfileClient.exists';
  log.debug({operation, id});
  const queryString = helpers.createParams({id});
  const url = `${config.USER_PROFILE_API_URL}${queryString}`;
  const ops = Object.assign(options, {method: 'HEAD'});
  return fetch(url, ops)
    .then(res => {
      log.debug({operation, id, status: res.status});
      //clientErrors.parse(res, `${operation} ${queryString}`);
      //res.read();
      //res.resume();
      return res.status === 200;
    });
}

module.exports = {
  getUUID,
  exists
};
