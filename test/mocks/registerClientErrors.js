'use strict';

const config = require('./../../lib/helpers/config');
const baseUrl = config.myFTURL;
const uuids = require('./uuids');
const nock = require('nock');

const urlMapping = [
  {//'Should throw an NotAuthorisedError without any headers'
    method: 'get',
    matcher: '',
    response: {
      status: 401
    }
  },
  {//'Should throw an NotAuthorisedError without an X-API-KEY'
    method: 'get',
    matcher: '',
    response: {
      status: 401
    },
    options: {
      headers: {}
    }
  },
  {//'Should throw an NotAuthorisedError with an invalid X-API-KEY'
    method: 'get',
    matcher: '',
    response: {
      status: 401
    },
    options: {
      headers: {'X-API-KEY': uuids.invalidKey}
    }
  },
  {//'Should not throw an NotAuthorisedError with a valid X-API-KEY'
    method: 'get',
    matcher: '',
    response: {
      status: 200
    },
    options: {
      headers: {'X-API-KEY': config.myFTKey}
    }
  },
  {//"Should throw an NotFoundError when something doesn't exist"
    method: 'get',
    matcher: '/doesNotExist',
    response: {
      status: 404
    }
  },
  {//'Should throw an BadRequestError'
    method: 'get',
    matcher: '/invalidPath',
    response: {
      status: 400
    }
  },
  {//'Should throw an InternalServerError'
    method: 'get',
    matcher: '/serverError',
    response: {
      status: 500
    }
  },
  {//'Should throw an BadGatewayError'
    method: 'get',
    matcher: '/badGateway',
    response: {
      status: 502
    }
  },
  {//'Should throw an ServiceUnavailableError'
    method: 'get',
    matcher: '/serviceUnavailable',
    response: {
      status: 503
    }
  },
  {//'Should throw an RedirectionError'
    method: 'get',
    matcher: '/redirect',
    response: {
      status: 304
    }
  },
  {//'Should throw an ClientError'
    method: 'get',
    matcher: '/clientError',
    response: {
      status: 405
    }
  },
  {//'Should throw an ServerError'
    method: 'get',
    matcher: '/otherServerError',
    response: {
      status: 501
    }
  }
];

module.exports = () => {
  urlMapping.forEach(mapping => {
    nock(baseUrl)[mapping.method](mapping.matcher)
      .reply(mapping.response.status || 200, (url, reqBody) => (mapping.response.body || reqBody));
  });
};
