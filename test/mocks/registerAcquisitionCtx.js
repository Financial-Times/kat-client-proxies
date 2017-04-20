'use strict';

const uuids = require('./uuids');
const baseUrl = require('./../../lib/helpers/config').acqCtxURL;
const nock = require('nock');

const getUrlMapping = [
  {//'Should get an Acquisition Context for a valid licence uuid'
    method: 'get',
    matcher: `?access-licence-id=${uuids.validLicence}`,
    response: {
      body: require('./fixtures/acquisitionContext')
    }
  },
  {//'Should get an empty Acquisition Context list for a invalid licence uuid'
    method: 'get',
    matcher: `?access-licence-id=${uuids.invalidLicence}`,
    response: {
      body: {items: []}
    }
  }
];

module.exports = () => {
  getUrlMapping.forEach(mapping => {
    nock(baseUrl)[mapping.method](mapping.matcher)
      .reply(mapping.response.status || 200, (url, reqBody) => (mapping.response.body || reqBody));
  });
};
