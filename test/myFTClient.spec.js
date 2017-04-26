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
const baseUrl = config.myFTURL;

describe('myFT Client proxy', () => {
  let logMessageStub;
  const logMessages = [];

  before(done => {
    logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
      logMessages.push(params);
    });

    done();
  });

  after(done => {
    if (mockAPI) {
      require('nock').cleanAll();
    }

    logMessageStub.restore();

    done();
  });

  it ('should have default properties', () => {
    expectOwnProperties(myFT.followedProperties, ['byTool', 'byUser']);
    //expect(myFT.entityProperties[config.toolDateIdentifier]).to.be.a('string');// TODO: WIP
  });

  describe('Email preferences', () => {

    it('Should set an EmailDigestPreference for a valid user uuid', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/user/${uuids.validUser}/preferred/preference`)
          .reply(200, () => ({}));

        nock(baseUrl)
          .get(`/user/${uuids.validUser}/preferred/preference/email-digest`)
          .reply(200, () => require('./mocks/fixtures/emailDigestPreference'));
      }

      const edpPref = Object.assign({}, myFT.digestProperties, {isTest: true});

      myFT.setEmailDigestPreference(uuids.validUser, edpPref)
        .then(() => myFT.getEmailDigestPreference(uuids.validUser))
        .then(edp => {
          expectOwnProperties(edp, ['uuid']);
          expect(edp.uuid).to.equal('email-digest');
          expect(edp["_rel"].isTest).to.equal(true);

          done();
        })
        .catch(done);
    });

    it('Should get an EmailDigestPreference for a valid user uuid', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/user/${uuids.validUser}/preferred/preference/email-digest`)
          .reply(200, () => require('./mocks/fixtures/emailDigestPreference'));
      }

      myFT.getEmailDigestPreference(uuids.validUser)
        .then(edp => {
          expectOwnProperties(edp, ['uuid']);
          expect(edp.uuid).to.equal('email-digest');

          done();
        })
        .catch(done);
    });

    it('Should throw a NotFoundError error for EmailDigestPreference for an invalid user uuid', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/user/${uuids.invalidUser}/preferred/preference/email-digest`)
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
    it ('Should be able to remove users from a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .delete(`/license/${uuids.validLicence}/member/user`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/license/${uuids.validLicence}/member/user/${uuids.validUser}`)
          .reply(404, () => null);
      }

      myFT.removeUsersFromLicence(uuids.validLicence, uuids.validUser)
        .then(res => {
          expect(res).to.be.an('object');

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
          .post(`/license/${uuids.validLicence}/member/user`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/license/${uuids.validLicence}/member/user/${uuids.validUser}`)
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
          .delete(`/group/${uuids.validLicence}/member/user`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/group/${uuids.validLicence}/member/user/${uuids.validUser}`)
          .reply(404, () => null);
      }

      myFT.removeUsersFromGroup(uuids.validLicence, uuids.validUser)
        .then(res => {
          expect(res).to.be.an('object');

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
          .post(`/group/${uuids.validLicence}/member/user`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/group/${uuids.validLicence}/member/user/${uuids.validUser}`)
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
          .delete(`/license/${uuids.validLicence}/member/group`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/license/${uuids.validLicence}/member/group/${uuids.validLicence}`)
          .reply(404, () => null);
      }

      myFT.removeGroupsFromLicence(uuids.validLicence, uuids.validLicence)
        .then(res => {
          expect(res).to.be.an('object');

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
          .post(`/license/${uuids.validLicence}/member/group`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/license/${uuids.validLicence}/member/group/${uuids.validLicence}`)
          .reply(200, () => require('./mocks/fixtures/getGroupFromLicence'));
      }

      const relProps = Object.assign({}, myFT.relationshipProperties);

      myFT.addGroupsToLicence(uuids.validLicence, uuids.validLicence, relProps)
        .then(addResponse => {
          expect(addResponse).to.be.an('array');

          return myFT.getGroupFromLicence(uuids.validLicence, uuids.validLicence);
        })
        .then(getResponse => {
          expectOwnProperties(getResponse, ['uuid', '_rel']);
          expect(getResponse.uuid).to.equal(uuids.validLicence);

          done();
        })
        .catch(done);
    });

    it ('Should be able to add a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/license`)
          .reply(200, () => ({}));

        nock(baseUrl)
          .get(`/license/${uuids.validLicence}`)
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
          .put(`/license/${uuids.validLicence}`)
          .reply(200, () => ({}));

        nock(baseUrl)
          .get(`/license/${uuids.validLicence}`)
          .reply(200, () => require('./mocks/fixtures/getLicence'));
      }
      const regDate = new Date().getTime();

      myFT.updateLicence(uuids.validLicence, {"kmtRegistrationDate": regDate})
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

    it ('Should be able to get a valid licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/license/${uuids.validLicence}`)
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
          .get(`/license/${uuids.invalidLicence}`)
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
          .get(`/license/${uuids.validLicence}/member/user/${uuids.validUser}`)
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
          .get(`/license/${uuids.validLicence}/member/user/${uuids.invalidUser}`)
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
          .get(`/group/${uuids.validLicence}/member/user/${uuids.validUser}`)
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
          .get(`/group/${uuids.validLicence}/member/user/${uuids.invalidUser}`)
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
          .get(`/license/${uuids.validLicence}/member/user?page=1&limit=500`)
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
          .get(`/group/${uuids.validLicence}/member/user?page=1&limit=500`)
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

    it ('Should get groups registered to a licence', done => {
      if (mockAPI) {
        nock(baseUrl)
          .get(`/license/${uuids.validLicence}/member/group?page=1&limit=500`)
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
          .get(`/user/${uuids.validUser}/followed/concept?page=1&limit=500`)
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
          .get(`/group/${uuids.validLicence}/followed/concept?page=1&limit=500`)
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
          .delete(`/group/${uuids.validLicence}/followed/concept`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/group/${uuids.validLicence}/followed/concept?page=1&limit=500`)
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
          .post(`/group/followed/concept?noEvent=${config.myFtNoEvent}&waitForPurge=${config.myFtWaitForPurgeAdd}`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/group/${uuids.validLicence}/followed/concept?page=1&limit=500`)
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
          .delete(`/user/${uuids.validUser}/followed/concept`)
          .reply(204, () => ({}));

        nock(baseUrl)
          .get(`/user/${uuids.validUser}/followed/concept?page=1&limit=500`)
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

    it ('Should set and get concepts followed by a user', done => {
      if (mockAPI) {
        nock(baseUrl)
          .post(`/user/followed/concept?noEvent=${config.myFtNoEvent}&waitForPurge=${config.myFtWaitForPurgeAdd}`)
          .reply(200, () => ([]));

        nock(baseUrl)
          .get(`/user/${uuids.validUser}/followed/concept?page=1&limit=500`)
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
  });

});
