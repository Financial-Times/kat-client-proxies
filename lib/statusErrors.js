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
