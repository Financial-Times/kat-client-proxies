'use-strict';

module.exports = {
	handleStatusError,
	NotFoundError
};

function handleStatusError(res, message) {
	switch (res.status) {
		case 404:
			throw new NotFoundError(`404 ${message} not found`);
			break;
		case 401:
			throw new NotAuthorisedError(`res.statsText`);
		default:
	}
}

function NotFoundError(message) {
  this.name = 'NotFoundError';
  this.message = message || '404 Not Found';
  this.stack = (new Error()).stack;
}
NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

function NotAuthorisedError(message) {
  this.name = 'NotAuthorisedError';
  this.message = message || '401 Not Authorised';
  this.stack = (new Error()).stack;
}
NotAuthorisedError.prototype = Object.create(Error.prototype);
NotAuthorisedError.prototype.constructor = NotAuthorisedError;
