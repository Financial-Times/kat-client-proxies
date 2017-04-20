'use strict';

const uuids = require('./uuids');
const baseUrl = require('./../../lib/helpers/config').myFTURL;
const config = require('./../../lib/helpers/config');
const nock = require('nock');

const getUrlMapping = [
  {//'Should set an EmailDigestPreference for a valid user uuid'
    method: 'post',
    matcher: `/user/${uuids.validUser}/preferred/preference`,
    response: {}
  },
  {//'Should set an EmailDigestPreference for a valid user uuid - GET'
    method: 'get',
    matcher: `/user/${uuids.validUser}/preferred/preference/email-digest`,
    response: {
      body: require('./fixtures/EmailDigestPreference')
    }
  },
  {//'Should get an EmailDigestPreference for a valid user uuid'
    method: 'get',
    matcher: `/user/${uuids.validUser}/preferred/preference/email-digest`,
    response: {
      body: require('./fixtures/EmailDigestPreference')
    }
  },
  {//'Should throw a NotFoundError error for EmailDigestPreference for an invalid user uuid'
    method: 'get',
    matcher: `/user/${uuids.invalidUser}/preferred/preference/email-digest`,
    response: {
      body: null,
      status: 404
    }
  },
  //{
  //  method: 'get',
  //  matcher: `/user/${uuids.validUser}/preferred/preference`,
  //  response: {
  //    body: require('./fixtures/EmailDigestPreference')
  //  }
  //},
  //{
  //  method: 'get',
  //  matcher: `/user/${uuids.invalidUser}/preferred/preference`,
  //  response: {
  //    body: null,
  //    status: 404
  //  }
  //},
  //{
  //  method: 'get',
  //  matcher: `/license/${uuids.validLicence}/preference/email-digest/preferred/user`,
  //  response: {
  //    body: require('./fixtures/uuidArray')
  //  }
  //},
  //{
  //  method: 'get',
  //  matcher: `/license/${uuids.invalidLicence}/preference/email-digest/preferred/user`,
  //  response: {
  //    body: []
  //  }
  //},
  {//'Should be able to remove users from a licence'
    method: 'delete',
    matcher: `/license/${uuids.validLicence}/member/user`,
    response: {
      body: {}
    }
  },
  {//'Should be able to add remove to a licence - GET'
    method: 'get',
    matcher: `/license/${uuids.validLicence}/member/user/${uuids.validUser}`,
    response: {
      body: null,
      status: 404
    }
  },
  {//'Should be able to add users to a licence'
    method: 'post',
    matcher: `/license/${uuids.validLicence}/member/user`,
    response: {
      body: []
    }
  },
  {//'Should be able to add users to a licence - GET'
    method: 'get',
    matcher: `/license/${uuids.validLicence}/member/user/${uuids.validUser}`,
    response: {
      body: require('./fixtures/getUserFromLicence')
    }
  },
  {//'Should be able to remove users from a group'
    method: 'delete',
    matcher: `/group/${uuids.validLicence}/member/user`,
    response: {
      body: {}
    }
  },
  {//'Should be able to remove users from a group - GET'
    method: 'get',
    matcher: `/group/${uuids.validLicence}/member/user/${uuids.validUser}`,
    response: {
      body: null,
      status: 404
    }
  },
  {//'Should be able to add users to a group'
    method: 'post',
    matcher: `/group/${uuids.validLicence}/member/user`,
    response: {
      body: []
    }
  },
  {//'Should be able to add users to a group - GET'
    method: 'get',
    matcher: `/group/${uuids.validLicence}/member/user/${uuids.validUser}`,
    response: {
      body: require('./fixtures/getUserFromLicence')
    }
  },
  {//'Should be able to remove groups from a licence'
    method: 'delete',
    matcher: `/license/${uuids.validLicence}/member/group`,
    response: {
      body: {}
    }
  },
  {//'Should be able to remove groups from a licence - GET'
    method: 'get',
    matcher: `/license/${uuids.validLicence}/member/group/${uuids.validLicence}`,
    response: {
      body: null,
      status: 404
    }
  },
  {//'Should be able to add groups to a licence'
    method: 'post',
    matcher: `/license/${uuids.validLicence}/member/group`,
    response: {
      body: []
    }
  },
  {//'Should be able to add groups to a licence - GET'
    method: 'get',
    matcher: `/license/${uuids.validLicence}/member/group/${uuids.validLicence}`,
    response: {
      body: require('./fixtures/getGroupFromLicence')
    }
  },
  {//'Should be able to get a valid licence'
    method: 'get',
    matcher: `/license/${uuids.validLicence}`,
    response: {
      body: require('./fixtures/getLicence')
    }
  },
  {//'Should throw a NotFoundError for an invalid licence'
    method: 'get',
    matcher: `/license/${uuids.invalidLicence}`,
    response: {
      body: null,
      status: 404
    }
  },
  {//'Should get user registered to a licence'
    method: 'get',
    matcher: `/license/${uuids.validLicence}/member/user/${uuids.validUser}`,
    response: {
      body: require('./fixtures/getUserFromLicence')
    }
  },
  {//'Should throw a NotFoundError for an invalid licence user'
    method: 'get',
    matcher: `/license/${uuids.validLicence}/member/user/${uuids.invalidUser}`,
    response: {
      body: null,
      status: 404
    }
  },
  {//'Should get user registered to a group'
    method: 'get',
    matcher: `/group/${uuids.validLicence}/member/user/${uuids.validUser}`,
    response: {
      body: require('./fixtures/getUserFromLicence')
    }
  },
  {//'Should throw a NotFoundError for an invalid group user'
    method: 'get',
    matcher: `/group/${uuids.validLicence}/member/user/${uuids.invalidUser}`,
    response: {
      body: null,
      status: 404
    }
  },
  {//'Should get users registered to a licence'
    method: 'get',
    matcher: `/license/${uuids.validLicence}/member/user?page=1&limit=500`,
    response: {
      body: require('./fixtures/getLicenceMembers')
    }
  },
  {//'Should get users registered to a group'
    method: 'get',
    matcher: `/group/${uuids.validLicence}/member/user?page=1&limit=500`,
    response: {
      body: require('./fixtures/getLicenceMembers')
    }
  },
  {//'Should get groups registered to a licence'
    method: 'get',
    matcher: `/license/${uuids.validLicence}/member/group?page=1&limit=500`,
    response: {
      body: require('./fixtures/getLicenceGroupMembers')
    }
  },
  {//'Should get an array of concepts followed by a user'
    method: 'get',
    matcher: `/user/${uuids.validUser}/followed/concept?page=1&limit=500`,
    response: {
      body: require('./fixtures/userFollowedConcept')
    }
  },
  {//'Should get an array of concepts followed by a group'
    method: 'get',
    matcher: `/group/${uuids.validLicence}/followed/concept?page=1&limit=500`,
    response: {
      body: require('./fixtures/groupFollowedConcept')
    }
  },
  {//'Should remove and get concepts followed by a group'
    method: 'delete',
    matcher: `/group/${uuids.validLicence}/followed/concept`,
    response: {
      body: {},
      status: 204
    }
  },
  {//'Should remove and get concepts followed by a group - GET'
    method: 'get',
    matcher: `/group/${uuids.validLicence}/followed/concept?page=1&limit=500`,
    response: {
      body: []
    }
  },
  {//'Should set and get concepts followed by a group'
    method: 'post',
    matcher: `/group/followed/concept?noEvent=${config.myFtNoEvent}&waitForPurge=${config.myFtWaitForPurgeAdd}`,
    response: {
      body: []
    }
  },
  {//'Should set and get concepts followed by a group - GET'
    method: 'get',
    matcher: `/group/${uuids.validLicence}/followed/concept?page=1&limit=500`,
    response: {
      body: require('./fixtures/groupFollowedConcept')
    }
  },
  {//'Should remove and get concepts followed by a user'
    method: 'delete',
    matcher: `/user/${uuids.validUser}/followed/concept`,
    response: {
      body: {},
      status: 204
    }
  },
  {//'Should remove and get concepts followed by a user - GET'
    method: 'get',
    matcher: `/user/${uuids.validUser}/followed/concept?page=1&limit=500`,
    response: {
      body: []
    }
  },
  {//'Should set and get concepts followed by a user'
    method: 'post',
    matcher: `/user/followed/concept?noEvent=${config.myFtNoEvent}&waitForPurge=${config.myFtWaitForPurgeAdd}`,
    response: {
      body: []
    }
  },
  {//'Should set and get concepts followed by a user - GET'
    method: 'get',
    matcher: `/user/${uuids.validUser}/followed/concept?page=1&limit=500`,
    response: {
      body: require('./fixtures/userFollowedConcept')
    }
  }
];

module.exports = () => {
  getUrlMapping.forEach(mapping => {
    nock(baseUrl)[mapping.method](mapping.matcher)
      .reply(mapping.response.status || 200, (url, reqBody) => (mapping.response.body || reqBody));
  });
};
