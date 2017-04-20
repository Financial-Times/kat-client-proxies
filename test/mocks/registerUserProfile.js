'use strict';

const uuids = require('./uuids');
const baseUrl = require('./../../lib/helpers/config').userProfileURL;
const qs = require('querystring');
const nock = require('nock');

const getUrlMapping = [
  {//'Should get an users UUID for a valid email address'
    method: 'get',
    matcher: `?${qs.stringify({email: uuids.validUserEmail})}`,
    response: {
      body: require('./fixtures/userProfile')
    }
  },
  {//'Should get a null for an invalid email address'
    method: 'get',
    matcher: `?${qs.stringify({email: uuids.invalidUserEmail})}`,
    response: {
      body: {items: []}
    }
  },
  {//'Should get true for a valid user id'
    method: 'head',
    matcher: `?${qs.stringify({id: uuids.validUser})}`,
    response: {
      body: null
    }
  },
  {//'Should get false for an invalid user id'
    method: 'head',
    matcher: `?${qs.stringify({id: uuids.invalidUser})}`,
    response: {
      body: null,
      status: 404
    }
  }
];

module.exports = () => {
  getUrlMapping.forEach(mapping => {
    nock(baseUrl)[mapping.method](mapping.matcher)
      .reply(mapping.response.status || 200, (url, reqBody) => (mapping.response.body || reqBody));
  });
};
