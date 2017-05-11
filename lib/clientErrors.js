'use strict';

function parse(res, message) {
  // Mot sure if redirect should be throw as it could make it impossible to follow the redirect.
  // Could copy the res object to the StatusError so it could be inspected, this would also have the
  // advantage of potentially having any messages included in the body. Perhaps selectivly copy parts ?
  // Also have a feeling we should consume body to avoid memory leakage...
  if (!res.ok) {
    message = message === undefined ? `${res.status}: ${res.statusText} for ${res.url}` : `${res.status}: ${res.statusText} ${message}`;
    switch (res.status) {
      case 400:
        throw new BadRequestError(message);
      case 401:
        throw new NotAuthorisedError(message);
      case 404:
        throw new NotFoundError(message);
      case 500:
        throw new InternalServerError(message);
      case 502:
        throw new BadGatewayError(message);
      case 503:
        throw new ServiceUnavailableError(message);
      default:
        if (300 <= res.status && res.status < 400) {
          throw new RedirectionError(message);
        } else if (res.status < 500) {
          throw new ClientError(message);
        } else if (res.status >= 500) {
          throw new ServerError(message);
        }
    }
  }
  return res;
}

class StatusError extends Error {
  constructor(message){
    super(message);
    this.message = message;
    this.name = this.constructor.name;
  }
}

class BadRequestError extends StatusError {}

class NotAuthorisedError extends StatusError {}

class NotFoundError extends StatusError {}

class RedirectionError extends StatusError {}

class ClientError extends StatusError {}

class InternalServerError extends StatusError {}

class BadGatewayError extends StatusError {}

class ServiceUnavailableError extends StatusError {}

class ServerError extends StatusError {}

module.exports = {
  parse,
  StatusError,
  RedirectionError,
  BadRequestError,
  NotAuthorisedError,
  NotFoundError,
  ClientError,
  InternalServerError,
  BadGatewayError,
  ServiceUnavailableError,
  ServerError
};
