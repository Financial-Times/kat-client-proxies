'use strict';

const proxies = require('./../index');
const myFT = proxies.myFTClient;
const uuids = require('./mocks/uuids');
const expect = require('chai').expect;
const sinon = require('sinon');
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const config = require('./../lib/helpers/config');
const clientErrors = proxies.clientErrors;
const env = require('./helpers/env');
const mockAPI = env.USE_MOCK_API;
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;
const baseUrl = config.MYFT_API_URL;
const extraParams = `?noEvent=${config.MYFT_NO_EVENT}&waitForPurge=${config.MYFT_WAIT_FOR_PURGE_ADD}`;

const myftConst = config.myftClientConstants;
const suppressLogs = true; //for local test if you want logs when test are run

describe('myFT Client proxy', () => {
  let logMessageStub;
  const logMessages = [];

  before(done => {
    if(suppressLogs) {
      logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
        logMessages.push(params);
      });
    }

    done();
  });

  afterEach(done => {
      nock.cleanAll();
      done();
  });

  after(done => {


    if(suppressLogs) {
      logMessageStub.restore();
    }
    done();
  });

  it ('should have default properties', () => {
    expectOwnProperties(myFT.followedProperties, ['byTool', 'byUser']);
    //expect(myFT.entityProperties[config.FT_TOOL_DATE_ID]).to.be.a('string');// TODO: WIP
  });

  describe('Email preferences', () => {

    it('Should set an EmailDigestPreference for a valid user uuid', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/${myftConst.userNodeName}/${myftConst.prefRelType}/${myftConst.prefRelName}${extraParams}`)
          .reply(200, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.userNodeName}/${uuids.validUser}/${myftConst.prefRelType}/${myftConst.prefRelName}/${myftConst.prefRelId}`)
          .reply(200, () => require('./mocks/fixtures/emailDigestPreference'));
      }

      const edpPref = Object.assign({}, myFT.digestProperties, {isTest: true});

      myFT.setEmailDigestPreference(uuids.validUser, edpPref)
        .then(() => myFT.getEmailDigestPreference(uuids.validUser))
        .then(edp => {
          expect(edp).to.be.an('object');
          expectOwnProperties(edp, ['uuid', '_rel']);
          expect(edp.uuid).to.equal(myftConst.prefRelId);
          expect(edp['_rel'].isTest).to.equal(true);

          done();
        })
        .catch(done);
    });

    it('Should get an EmailDigestPreference for a valid user uuid', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.userNodeName}/${uuids.validUser}/${myftConst.prefRelType}/${myftConst.prefRelName}/${myftConst.prefRelId}`)
          .reply(200, () => require('./mocks/fixtures/emailDigestPreference'));
      }

      myFT.getEmailDigestPreference(uuids.validUser)
        .then(edp => {
          expect(edp).to.be.an('object');
          expectOwnProperties(edp, ['uuid']);
          expect(edp.uuid).to.equal(myftConst.prefRelId);

          done();
        })
        .catch(done);
    });

    it('Should get users with EmailDigestPreference for a valid licence uuid', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.prefRelName}/${myftConst.prefRelId}/${myftConst.prefRelType}/${myftConst.userNodeName}`)
          .reply(200, () => require('./mocks/fixtures/uuidArray.json'));
      }

      myFT.getUsersWithEmailDigestPreference(uuids.validLicence)
        .then(edp => {
          expect(edp).to.be.an('array');
          expectOwnProperties(edp, ['uuid']);

          done();
        })
        .catch(done);
    });

    it('Should throw a NotFoundError error for EmailDigestPreference for an invalid user uuid', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.userNodeName}/${uuids.invalidUser}/${myftConst.prefRelType}/${myftConst.prefRelName}/${myftConst.prefRelId}`)
          .reply(404, () => null);
      }

      myFT.getEmailDigestPreference(uuids.invalidUser)
        .then(() => {
          done(new Error('Nothing thrown'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        });
    });

  });

  describe('Licence management', () => {
    it('Should be able to remove users from a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .delete(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}${extraParams}`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}/${uuids.validUser}`)
          .reply(404, () => null);
      }

      myFT.removeUsersFromLicence(uuids.validLicence, uuids.validUser)
        .then(res => {
          expect(res).to.be.an('object');
          expect(res.status).to.equal(204);

          return myFT.getUserFromLicence(uuids.validLicence, uuids.validUser);
        })
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        })
        .catch(done);
    });

    it ('Should be able to add users to a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}${extraParams}`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}/${uuids.validUser}`)
          .reply(200, () => require('./mocks/fixtures/getUserFromLicence'));
      }

      const relProps = Object.assign({}, myFT.relationshipProperties);

      myFT.addUsersToLicence(uuids.validLicence, uuids.validUser, relProps)
        .then(addResponse => {
          expect(addResponse).to.be.an('array');

          return myFT.getUserFromLicence(uuids.validLicence, uuids.validUser);
        })
        .then(getResponse => {
          expectOwnProperties(getResponse, ['uuid', '_rel']);
          expect(getResponse.uuid).to.equal(uuids.validUser);

          done();
        })
        .catch(done);
    });

    it ('Should be able to remove users from a group', done => {
      if (mockAPI) {
        nock(baseUrl)
          .delete(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}${extraParams}`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}/${uuids.validUser}`)
          .reply(404, () => null);
      }

      myFT.removeUsersFromGroup(uuids.validLicence, uuids.validUser)
        .then(res => {
          expect(res).to.be.an('object');
          expect(res.status).to.equal(204);

          return myFT.getUserFromGroup(uuids.validLicence, uuids.validUser);
        })
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        })
        .catch(done);
    });

    it ('Should be able to add users to a group', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}${extraParams}`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}/${uuids.validUser}`)
          .reply(200, () => require('./mocks/fixtures/getUserFromLicence'));
      }

      const relProps = Object.assign({}, myFT.relationshipProperties);

      myFT.addUsersToGroup(uuids.validLicence, uuids.validUser, relProps)
        .then(addResponse => {
          expect(addResponse).to.be.an('array');

          return myFT.getUserFromGroup(uuids.validLicence, uuids.validUser);
        })
        .then(getResponse => {
          expectOwnProperties(getResponse, ['uuid', '_rel']);
          expect(getResponse.uuid).to.equal(uuids.validUser);

          done();
        })
        .catch(done);
    });

    it ('Should be able to remove groups from a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .delete(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.groupNodeName}${extraParams}`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.groupNodeName}/${uuids.validLicence}`)
          .reply(404, () => null);
      }

      myFT.removeGroupsFromLicence(uuids.validLicence, uuids.validLicence)
        .then(res => {
          expect(res).to.be.an('object');
          expect(res.status).to.equal(204);

          return myFT.getGroupFromLicence(uuids.validLicence, uuids.validLicence);
        })
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        })
        .catch(done);
    });

    it ('Should be able to remove groups node', done => {
      if (mockAPI) {
        nock(baseUrl)
          .delete(`/${myftConst.groupNodeName}/${uuids.validLicence}`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.groupNodeName}/${uuids.validLicence}`)
          .reply(404, () => null);
      }

      myFT.removeGroup(uuids.validLicence)
        .then(res => {
          expect(res).to.be.an('object');
          expect(res.status).to.equal(204);

          return myFT.getGroupFromLicence(uuids.validLicence, uuids.validLicence);
        })
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        })
        .catch(done);
    });

    it ('Should be able to add groups to a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.groupNodeName}${extraParams}`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.groupNodeName}/${uuids.validLicence}`)
          .reply(200, () => require('./mocks/fixtures/getGroupFromLicence'));
      }

      const relProps = Object.assign({}, myFT.relationshipProperties);

      myFT.addGroupsToLicence(uuids.validLicence, uuids.validLicence, relProps)
        .then(addResponse => {
          expect(addResponse).to.be.an('array');

          return myFT.getGroupFromLicence(uuids.validLicence, uuids.validLicence);
        })
        .then(getResponse => {
          expectOwnProperties(getResponse, ['uuid', '_rel', 'name']);
          expect(getResponse.uuid).to.equal(uuids.validLicence);
          expect(getResponse.name).to.equal('All users');

          done();
        })
        .catch(done);
    });

    it ('Should be able to add a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/${myftConst.licenceNodeName}`)
          .reply(200, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}`)
          .reply(200, () => require('./mocks/fixtures/getLicence'));
      }

      myFT.addLicence(uuids.validLicence)
        .then(resp => {
          expect(resp).to.be.an('object');

          return myFT.getLicence(uuids.validLicence);
        })
        .then(resp => {
          expectOwnProperties(resp, ['uuid', '_rel']);
          expect(resp.uuid).to.equal(uuids.validLicence);

          done();
        })
        .catch(done);
    });

    it ('Should be able to update a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .put(`/${myftConst.licenceNodeName}/${uuids.validLicence}`)
          .reply(200, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}`)
          .reply(200, () => require('./mocks/fixtures/getLicence'));
      }
      const regDate = new Date().getTime();

      myFT.updateLicence(uuids.validLicence, {'kmtRegistrationDate': regDate})
        .then(resp => {
          expect(resp).to.be.an('object');

          return myFT.getLicence(uuids.validLicence);
        })
        .then(resp => {
          expectOwnProperties(resp, ['uuid', '_rel']);
          expect(resp.uuid).to.equal(uuids.validLicence);

          if (mockAPI !== true) {
            expect(resp.kmtRegistrationDate).to.equal(regDate);
          }

          done();
        })
        .catch(done);
    });

    it ('Should be able to update a group', done => {
      const newGroupName = 'All users';
      if (mockAPI) {
        nock(baseUrl)
          .put(`/${myftConst.groupNodeName}/${uuids.validLicence}`)
          .reply(200, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.groupNodeName}/${uuids.validLicence}`)
          .reply(200, () => require('./mocks/fixtures/getGroupFromLicence'));
      }

      myFT.updateGroup(uuids.validLicence, {"name": newGroupName})
        .then(resp => {
          expect(resp).to.be.an('object');

          return myFT.getGroupFromLicence(uuids.validLicence, uuids.validLicence);
        })
        .then(resp => {
          expectOwnProperties(resp, ['uuid', 'name', '_rel']);
          expect(resp.uuid).to.equal(uuids.validLicence);
          expect(resp.name).to.equal(newGroupName);

          done();
        })
        .catch(done);
    });

    it ('Should be able to get a valid licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}`)
          .reply(200, () => require('./mocks/fixtures/getLicence'));
      }

      myFT.getLicence(uuids.validLicence)
        .then(resp => {
          expectOwnProperties(resp, ['uuid', '_rel']);
          expect(resp.uuid).to.equal(uuids.validLicence);

          done();
        })
        .catch(done);
    });

    it ('Should throw a NotFoundError for an invalid licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.invalidLicence}`)
          .reply(404, () => null);
      }

      myFT.getLicence(uuids.invalidLicence)
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        });
    });

    it ('Should get user registered to a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}/${uuids.validUser}`)
          .reply(200, () => require('./mocks/fixtures/getUserFromLicence'));
      }

      myFT.getUserFromLicence(uuids.validLicence, uuids.validUser)
        .then(resp => {
          expectOwnProperties(resp, ['uuid', '_rel']);
          expect(resp.uuid).to.equal(uuids.validUser);

          done();
        })
        .catch(done);
    });

    it ('Should throw a NotFoundError for an invalid licence user', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}/${uuids.invalidUser}`)
          .reply(404, () => null);
      }

      myFT.getUserFromLicence(uuids.validLicence, uuids.invalidUser)
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        });
    });

    it ('Should get user registered to a group', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}/${uuids.validUser}`)
          .reply(200, () => require('./mocks/fixtures/getUserFromLicence'));
      }

      myFT.getUserFromGroup(uuids.validLicence, uuids.validUser)
        .then(resp => {
          expectOwnProperties(resp, ['uuid', '_rel']);
          expect(resp.uuid).to.equal(uuids.validUser);

          done();
        })
        .catch(done);
    });

    it ('Should throw a NotFoundError for an invalid group user', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}/${uuids.invalidUser}`)
          .reply(404, () => null);
      }

      myFT.getUserFromGroup(uuids.validLicence, uuids.invalidUser)
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        });
    });

    it ('Should get users registered to a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}?page=1&limit=500`)
          .reply(200, () => require('./mocks/fixtures/getLicenceMembers'));
      }

      myFT.getUsersForLicence(uuids.validLicence)
        .then(usersResponse => {
          expect(usersResponse).to.be.an('array');
          expectOwnProperties(usersResponse, ['uuid']);
          expect(usersResponse.length).to.be.at.least(1);

          done();
        })
        .catch(done);
    });

    it ('Should get users registered to a group', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}?page=1&limit=500`)
          .reply(200, () => require('./mocks/fixtures/getLicenceMembers'));
      }

      myFT.getUsersForGroup(uuids.validLicence)
        .then(usersResponse => {
          expect(usersResponse).to.be.an('array');
          expectOwnProperties(usersResponse, ['uuid']);
          expect(usersResponse.length).to.be.at.least(1);

          done();
        })
        .catch(done);
    });

    it ('Should get users registered to a group by pages', done => {
      const page = 1;
      const limit = 10;
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}?page=${page}&limit=${limit}`)
          .reply(200, () => require('./mocks/fixtures/getGroupUsersByPage'));
      }

      myFT.getUsersForGroupByPage(uuids.validLicence, { page, limit })
        .then(usersResponse => {
          expect(usersResponse).to.be.an('object');
          expectOwnProperties(usersResponse, ['group', 'total', 'items', 'count']);

          const items = usersResponse.items;
          expect(items).to.be.an('array');
          expect(items.length).to.be.at.least(1);
          expectOwnProperties(items, ['uuid']);

          done();
        })
        .catch(done);
    });

    it ('Should get groups registered to a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.groupNodeName}?page=1&limit=500`)
          .reply(200, () => require('./mocks/fixtures/getLicenceGroupMembers'));
      }

      myFT.getGroupsForLicence(uuids.validLicence)
        .then(groupsResponse => {
          expect(groupsResponse).to.be.an('array');
          expectOwnProperties(groupsResponse, ['uuid']);
          expect(groupsResponse.length).to.be.at.least(1);

          done();
        })
        .catch(done);
    });
  });

  describe('Followed concepts', () => {
    const relProps = Object.assign({}, myFT.followedProperties, {byTool: 'myFTClient.spec', isTest: true});
    const userConcepts = require('./mocks/fixtures/userFollowedConcept');
    const groupConcepts = require('./mocks/fixtures/groupFollowedConcept');

    it ('Should get an array of concepts followed by a user', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.userNodeName}/${uuids.validUser}/${myftConst.followedRelName}/${myftConst.topicNodeName}?page=1&limit=500`)
          .reply(200, () => require('./mocks/fixtures/userFollowedConcept'));
      }

      myFT.getConceptsFollowedByUser(uuids.validUser)
        .then(followResponse => {
          expect(followResponse).to.be.an('array');

          if (mockAPI) {
            expect(followResponse).to.have.lengthOf(5);
          }

          expectOwnProperties(followResponse, ['uuid']);

          done();
        })
        .catch(done);
    });

    it ('Should get an array of concepts followed by a group', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.followedRelName}/${myftConst.topicNodeName}?page=1&limit=500`)
          .reply(200, () => require('./mocks/fixtures/groupFollowedConcept'));
      }

      myFT.getConceptsFollowedByGroup(uuids.validLicence)
        .then(followResponse => {
          expect(followResponse).to.be.an('array');

          if (mockAPI) {
            expect(followResponse).to.have.lengthOf(1);
          }

          expectOwnProperties(followResponse, ['uuid']);

          done();
        })
        .catch(done);
    });

    it ('Should remove and get concepts followed by a group', done => {
      if (mockAPI) {
        nock(baseUrl)
          .delete(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.followedRelName}/${myftConst.topicNodeName}${extraParams}`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.followedRelName}/${myftConst.topicNodeName}?page=1&limit=500`)
          .reply(200, () => ([]));
      }

      myFT.removeConceptsFollowedByGroup(uuids.validLicence, groupConcepts.items)
        .then(addResp => {
          expect(addResp).to.be.an('object');
          expect(addResp.status).to.equal(204);

          return myFT.getConceptsFollowedByGroup(uuids.validLicence);
        })
        .then(followResponse => {
          expect(followResponse).to.be.an('array');

          done();
        })
        .catch(done);
    });

    it ('Should set and get concepts followed by a group', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/${myftConst.groupNodeName}/${myftConst.followedRelName}/${myftConst.topicNodeName}${extraParams}`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.followedRelName}/${myftConst.topicNodeName}?page=1&limit=500`)
          .reply(200, () => require('./mocks/fixtures/groupFollowedConcept'));
      }

      myFT.addConceptsFollowedByGroup(uuids.validLicence, groupConcepts.items, relProps)
        .then(addResp => {
          expect(addResp).to.be.an('array');

          return myFT.getConceptsFollowedByGroup(uuids.validLicence);
        })
        .then(followResponse => {
          expect(followResponse).to.be.an('array');

          if (mockAPI) {
            expect(followResponse).to.have.lengthOf(1);
          }

          expectOwnProperties(followResponse, ['uuid']);

          done();
        })
        .catch(done);
    });

    it ('Should remove and get concepts followed by a user', done => {
      if (mockAPI) {
        nock(baseUrl)
          .delete(`/${myftConst.userNodeName}/${uuids.validUser}/${myftConst.followedRelName}/${myftConst.topicNodeName}${extraParams}`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/${myftConst.userNodeName}/${uuids.validUser}/${myftConst.followedRelName}/${myftConst.topicNodeName}?page=1&limit=500`)
          .reply(200, () => ([]));
      }

      myFT.removeConceptsFollowedByUser(uuids.validUser, userConcepts.items)
        .then(addResp => {
          expect(addResp).to.be.an('object');
          expect(addResp.status).to.equal(204);

          return myFT.getConceptsFollowedByUser(uuids.validUser);
        })
        .then(followResponse => {
          expect(followResponse).to.be.an('array');

          done();
        })
        .catch(done);
    });

    it('Should set and get concepts followed by a user', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/${myftConst.userNodeName}/${myftConst.followedRelName}/${myftConst.topicNodeName}${extraParams}`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/${myftConst.userNodeName}/${uuids.validUser}/${myftConst.followedRelName}/${myftConst.topicNodeName}?page=1&limit=500`)
          .reply(200, () => require('./mocks/fixtures/userFollowedConcept'));
      }

      myFT.addConceptsFollowedByUser(uuids.validUser, userConcepts.items, relProps)
        .then(addResp => {
          expect(addResp).to.be.an('array');

          return myFT.getConceptsFollowedByUser(uuids.validUser);
        })
        .then(followResponse => {
          expect(followResponse).to.be.an('array');

          if (mockAPI) {
            expect(followResponse).to.have.lengthOf(5);
          }

          expectOwnProperties(followResponse, ['uuid']);

          done();
        })
        .catch(done);
    });

    it ('Should get a list of user IDs that follow a valid topic', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.topicNodeName}/${uuids.validTopic}/${myftConst.followedRelName}/${myftConst.userNodeName}`)
          .reply(200, () => require('./mocks/fixtures/uuidArray.json'));
      }

      myFT.getUsersFollowingConcept(uuids.validLicence, uuids.validTopic)
        .then(response => {
          expect(response).to.be.an('array');
          expectOwnProperties(response, ['uuid']);

          done();
        })
        .catch(done);
    });

    it ('Should get an empty list of user IDs that follow an invalid valid topic', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.topicNodeName}/${uuids.invalidTopic}/${myftConst.followedRelName}/${myftConst.userNodeName}`)
          .reply(200, () => []);
      }

      myFT.getUsersFollowingConcept(uuids.validLicence, uuids.invalidTopic)
        .then(response => {
          expect(response).to.be.an('array');
          expect(response).to.be.empty;

          done();
        })
        .catch(done);
    });

    it ('Should get a list of group IDs that follow a valid topic', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.topicNodeName}/${uuids.validTopic}/${myftConst.followedRelName}/${myftConst.groupNodeName}`)
          .reply(200, () => require('./mocks/fixtures/uuidArray.json'));
      }

      myFT.getGroupsFollowingConcept(uuids.validLicence, uuids.validTopic)
        .then(response => {
          expect(response).to.be.an('array');
          expectOwnProperties(response, ['uuid']);

          done();
        })
        .catch(done);
    });

    it ('Should get an empty list of group IDs that follow an invalid valid topic', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.topicNodeName}/${uuids.invalidTopic}/${myftConst.followedRelName}/${myftConst.groupNodeName}`)
          .reply(200, () => []);
      }

      myFT.getGroupsFollowingConcept(uuids.validLicence, uuids.invalidTopic)
        .then(response => {
          expect(response).to.be.an('array');
          expect(response).to.be.empty;

          done();
        })
        .catch(done);
    });

    it ('Should get a list of user IDs that follow a valid topic as an individual', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/kat/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.topicNodeName}/${uuids.validTopic}/followers/${myftConst.userNodeName}`)
          .query({ followType: 'individual' })
          .reply(200, () => require('./mocks/fixtures/uuidArray.json'));
      }

      myFT.getUsersFollowingConceptAsIndividual(uuids.validLicence, uuids.validTopic)
        .then(response => {
          expect(response).to.be.an('array');
          expectOwnProperties(response, ['uuid']);

          done();
        })
        .catch(done);
    });

    it ('Should get an empty list of user IDs that follow an invalid topic as an individual', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/kat/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.topicNodeName}/${uuids.invalidTopic}/followers/${myftConst.userNodeName}`)
          .query({ followType: 'individual' })
          .reply(200, () => []);
      }

      myFT.getUsersFollowingConceptAsIndividual(uuids.validLicence, uuids.invalidTopic)
        .then(response => {
          expect(response).to.be.an('array');
          expect(response).to.be.empty;

          done();
        })
        .catch(done);
    });
  });

    //new orgainic v3/kat methods
    describe('Followed_by_Kat concepts', () => {

      afterEach(done => {
          nock.cleanAll();
          done();
      });


      const relProps = Object.assign({}, myFT.followedProperties, {byTool: 'myFTClient.spec', isTest: true});
      const userConcepts = require('./mocks/fixtures/userFollowedConcept');
      const katConcepts = require('./mocks/fixtures/userFollowsConceptByKat');
      const followedByKatRes = require('./mocks/fixtures/followByKatResp');
    //  const groupConcepts = require('./mocks/fixtures/groupFollowedConcept');

      it('Should set concept(s) follows by a user ', done => {
          nock(baseUrl)
            .post(`/kat/user/follows`)
            .query({noEvent: 'true', waitForPurge: 'false'})
            .reply(200, () => followedByKatRes);

        myFT.addConceptsFollowedByKatUser(katConcepts.ids, katConcepts.subjects, relProps)
          .then(addResp => {
            expect(addResp).to.be.an('array');
            expect(addResp[0][0][0]).to.have.deep.property('katRel.type', 'followed_by_kat');
            done();
          })
          .catch(done);
      });

      it('Should set concept(s) follows by a group ', done => {

          nock(baseUrl)
            .post(`/kat/group/follows`)
            .query({noEvent: 'true', waitForPurge: 'false'})
            .reply(200, () => followedByKatRes);

        myFT.addConceptsFollowedByKatGroup(katConcepts.ids, katConcepts.subjects, relProps)
          .then(addResp => {
            expect(addResp).to.be.an('array');
            expect(addResp[0][0][0]).to.be.an('Object');
            expect(addResp[0][0][0]).to.have.deep.property('katRel.type', 'followed_by_kat');
            //TODO specify what to expect from addResp
            done();
          })
          .catch(done);
      });

      it('Should remove concept(s) followed by a user', done => {

          nock(baseUrl)
            .delete(`/kat/user/follows`)
            .query({noEvent: 'true', waitForPurge: 'false'})
            .reply(204, () => ({}));


        myFT.removeConceptsFollowedByKatUser(katConcepts.ids, katConcepts.subjects)
          .then(addResp => {
            expect(addResp).to.be.an('Object');
            expect(addResp.status).to.equal(204);

            done();
          })
          .catch(done);
      });

      it('Should remove concept(s) followed by a group', done => {

          nock(baseUrl)
            .delete(`/kat/group/follows`)
            .query({noEvent: 'true', waitForPurge: 'false'})
            .reply(204, () => ({}));


        myFT.removeConceptsFollowedByKatGroup(katConcepts.ids, katConcepts.subjects)
          .then(addResp => {
            expect(addResp).to.be.an('Object');
            expect(addResp.status).to.equal(204);

            done();
          })
          .catch(done);
      });

      it('Should add concept(s) follows for members of a group', done => {

          nock(baseUrl)
            .post(`/kat/group/user/follows`)
            .query({noEvent: 'true', waitForPurge: 'false'})
            .reply(200, () => []);


        myFT.addConceptsFollowedByKatGroupMembers(katConcepts.ids, katConcepts.subjects)
          .then(addResp => {
            expect(addResp).to.be.an('array');
            //TODO specify what to expect from addResp Postman returns an empty array in an empty array?

            done();
          })
          .catch(done);
      });

      it('Should remove concept(s) follows for user of a group', done => {

          nock(baseUrl)
            .delete(`/kat/group/user/follows`)
            .query({noEvent: 'true', waitForPurge: 'false'})
            .reply(204, () => []);


        myFT.removeConceptsFollowedByKatGroupMembers(katConcepts.ids, katConcepts.subjects)
          .then(addResp => {
            expect(addResp).to.be.an('array');

            done();
          })
          .catch(done);
      });

      it('Should add follows to an array users added to a group', done => {
        const groupId = '00000000-0000-0000-0000-000000000666';

        nock(baseUrl)
          .post(`/kat/group/${groupId}/user/follows`)
          .query({noEvent: 'true', waitForPurge: 'false'})
          .reply(200, () => []);

          myFT.addConceptsFollowedByKatGroupMembSpec(katConcepts.ids, katConcepts.subjects,relProps,groupId)
            .then(addResp => {
              expect(addResp).to.be.an('array');

              done();
            })
            .catch(done);
      });

      it('Should remove follows from an array users associated with a group', done => {
        const groupId = '00000000-0000-0000-0000-000000000555';

        nock(baseUrl)
          .delete(`/kat/group/${groupId}/user/follows`)
          .query({noEvent: 'true', waitForPurge: 'false'})
          .reply(204, () => []);

          myFT.removeConceptsFollowedByKatGroupMembSpec(katConcepts.ids, katConcepts.subjects,relProps,groupId)
            .then(addResp => {
              expect(addResp).to.be.an('array');

              done();
            })
            .catch(done);
      });

  });
});
