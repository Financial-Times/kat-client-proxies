'use-strict';

function parse(res, message) {
	if (!res.ok) {
		message = message === undefined ? `${res.status}: ${res.statusText} for ${res.url}` : `${res.status}: ${res.statusText} ${message}`;
		switch (res.status) {
			case 400:
				throw new BadRequestError(message);
			case 401:
				throw new NotAuthorisedError(message);
			case 404:
				throw new NotFoundError(message);
				break;
			default:
		}
	}
	return res;
}

class BadRequestError extends Error {
	constructor(message){
		super(message);
		this.message = message;
		this.name = this.constructor.name;
	}
}

class NotAuthorisedError extends Error {
	constructor(message){
		super(message);
		this.message = message;
		this.name = this.constructor.name;
	}
}

class NotFoundError extends Error {
	constructor(message){
		super(message);
		this.message = message;
		this.name = this.constructor.name;
	}
}

module.exports = {
	parse,
	BadRequestError,
	NotAuthorisedError,
	NotFoundError
};

// function NotFoundError(res) {
//   this.name = 'NotFoundError';
//   this.message = `${res.status} - ${res.statusText}`;
//   this.stack = (new Error()).stack;
// }
// NotFoundError.prototype = Object.create(Error.prototype);
// NotFoundError.prototype.constructor = NotFoundError;

// function NotAuthorisedError(res) {
//   this.name = 'NotAuthorisedError';
//   this.message = message || '401 Not Authorised';
//   this.stack = (new Error()).stack;
// }
// NotAuthorisedError.prototype = Object.create(Error.prototype);
// NotAuthorisedError.prototype.constructor = NotAuthorisedError;

// function BadRequestError(message){
// 	this.name='BadRequestError';
// 	this.message = message || '400 Bad Request';
// 	this.stack = (new Error()).stack;
// }
// BadRequestError.prototype = Object.create(Error.prototype);
// BadRequestError.prototype.constructor = BadRequestError;
