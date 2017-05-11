const clientErrors = require('./../clientErrors');
const qs = require('querystring');

/**
 * Create query string out of object
 * @param {Object} options -
 * @param {String} [startWith] -
 * @returns {String} response -
 * @private
 */
function createParams(options, startWith = '?') {
  if (options === undefined || options === null || Object.keys(options).length === 0){
    return '';
  }
  return `${startWith}${qs.stringify(options)}`;
}

/**
 * Parses the fetch response
 * @param {Object} res -
 * @param {String} [customErrorMessage] -
 * @returns {*} response -
 */
function parseJsonRes(res, customErrorMessage) {
  clientErrors.parse(res, customErrorMessage);
  return res.json();
}

/**
 * Transforms the url hash params into an object
 * @param {String} url -
 * @returns {Object} result -
 */
function uriFragSplitter(url) {
  const urlArr = url.split('#');
  return urlArr[1] !== undefined ? qs.parse(urlArr[1]) : {};
}

module.exports = {
  parseJsonRes,
  createParams,
  uriFragSplitter
};
