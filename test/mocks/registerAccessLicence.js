'use strict';

const uuids = require('./uuids');
const baseUrl = require('./../../lib/helpers/config').accLicenceURL;
const nock = require('nock');

const getUrlMapping = [
  {//'Should get a list of Licence IDs for a valid UUID'
    method: 'get',
    matcher: `/licences?userid=${uuids.validUser}`,
    response: {
      body: require('./fixtures/accessLicenceGetLicence')
    }
  },
  {//'Should get an empty array for a invalid user UUID'
    method: 'get',
    matcher: `/licences?userid=${uuids.invalidUser}`,
    response: {
      body: {accessLicences: []}
    }
  },
  {//'Should get a list of seats for a valid licence UUID'
    method: 'get',
    matcher: `/licences/${uuids.validLicence}/seats`,
    response: {
      body: require('./fixtures/accessLicenceGetSeats')
    }
  },
  {//'Should get an empty array for a invalid licence UUID'
    method: 'get',
    matcher: `/licences/${uuids.invalidLicence}/seats`,
    response: {
      body: {seats: [], "allocatedSeatCount": 0}
    }
  }
];

module.exports = () => {
  getUrlMapping.forEach(mapping => {
    nock(baseUrl)[mapping.method](mapping.matcher)
      .reply(mapping.response.status || 200, (url, reqBody) => (mapping.response.body || reqBody));
  });
};
