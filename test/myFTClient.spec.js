'use strict';

const proxies = require('./../index');
const myFT = proxies.myFTClient;
const mocks = require('./helpers/mocks');
const expect = require('chai').expect;
const sinon = require('sinon');
const logger = require('@financial-times/n-logger').default;
//const config = require('./../lib/helpers/config');
const clientErrors = proxies.clientErrors;
const env = require('./helpers/env');
const uuid = require('uuid');
const mockAPI = env.USE_MOCK_API;
const expectOwnProperties = require('./helpers/expectExtensions').expectOwnProperties;

describe('myFT Client proxy', () => {
  let logMessageStub;
  const logMessages = [];

  before(done => {
    if (mockAPI) {
      mocks.registerMyFT();
    }

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

    it('Should set an EmailDigestPreference for a valid user uuid', done => {// TODO: test on local myFT
      const edpPref = Object.assign({}, myFT.digestProperties, {isTest: true});

      myFT.setEmailDigestPreference(mocks.uuids.validUser, edpPref)
        .then(() => myFT.getEmailDigestPreference(mocks.uuids.validUser))
        .then(edp => {
          expectOwnProperties(edp, ['uuid']);
          expect(edp.uuid).to.equal('email-digest');
          expect(edp["_rel"].isTest).to.equal(true);

          done();
        })
        .catch(done);
    });

    it('Should get an EmailDigestPreference for a valid user uuid', done => {
      myFT.getEmailDigestPreference(mocks.uuids.validUser)
        .then(edp => {
          expectOwnProperties(edp, ['uuid']);
          expect(edp.uuid).to.equal('email-digest');

          done();
        })
        .catch(done);
    });

    it('Should throw a NotFoundError error for EmailDigestPreference for an invalid user uuid', done => {
      myFT.getEmailDigestPreference(mocks.uuids.invalidUser)
        .then(() => {
          done(new Error('Nothing thrown'));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        });
    });

  //  it('Should get an array of users who have an EmailDigestPreference set', done => {
  //    myFT.getUsersWithEmailDigestPreference(mocks.uuids.validLicence)
  //      .then(users => {
  //        expect(users).to.be.an('array');
  //        if (mockAPI) {
  //          expect(users).to.have.lengthOf(2);
  //        }
  //        expectOwnProperties(users, ['uuid']);
  //
  //        done();
  //      })
  //      .catch(done);
  //  });
  //
  //  it('Should return an empty array for an invalid licence uuid', done => {
  //    myFT.getUsersWithEmailDigestPreference(mocks.uuids.invalidLicence)
  //      .then(users => {
  //        expect(users).to.be.an('array');
  //        expect(users).to.have.lengthOf(0);
  //
  //        done();
  //      })
  //      .catch(done);
  //  });

  });

  describe('Licence management', () => {

    it ('Should be able to add users to a licence', done => {// TODO: test on local myFT
      const userId = mockAPI ? mocks.uuids.validUser : uuid();
      const relProps = Object.assign({}, myFT.membershipProperties);

      myFT.addUsersToLicence(mocks.uuids.validLicence, userId, relProps)
        .then(addResponse => {
          expect(addResponse).to.be.an('object');

          return myFT.getUserFromLicence(mocks.uuids.validLicence, userId);
        })
        .then(getResponse => {
          expectOwnProperties(getResponse, ['uuid', '_rel']);
          expect(getResponse.uuid).to.equal(userId);

          done();
        })
        .catch(done);
    });

    it ('Should be able to remove users to a licence', done => {// TODO: test on local myFT
      myFT.removeUsersFromLicence(mocks.uuids.validLicence, mocks.uuids.validUser)
        .then(res => {
          //expect(res).to.be.an('object');// maybe null??

          return myFT.getUserFromLicence(mocks.uuids.validLicence, mocks.uuids.validUser);
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

    it ('Should be able to add users to a group', done => {// TODO: test on local myFT
      const userId = mockAPI ? mocks.uuids.validUser : uuid();
      const relProps = Object.assign({}, myFT.membershipProperties);

      myFT.addUsersToGroup(mocks.uuids.validLicence, userId, relProps)
        .then(addResponse => {
          expect(addResponse).to.be.an('object');

          return myFT.getUserFromGroup(mocks.uuids.validLicence, userId);
        })
        .then(getResponse => {
          expectOwnProperties(getResponse, ['uuid', '_rel']);
          expect(getResponse.uuid).to.equal(userId);

          done();
        })
        .catch(done);
    });

    it ('Should be able to remove users to a group', done => {// TODO: test on local myFT
      myFT.removeUsersFromGroup(mocks.uuids.validLicence, mocks.uuids.validUser)
        .then(res => {
          //expect(res).to.be.an('object');// maybe null??

          return myFT.getUserFromGroup(mocks.uuids.validLicence, mocks.uuids.validUser);
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

    it ('Should be able to add groups to a licence', done => {// TODO: test on local myFT
      const relProps = Object.assign({}, myFT.membershipProperties);

      myFT.addGroupsToLicence(mocks.uuids.validLicence, mocks.uuids.validLicence, relProps)
        .then(addResponse => {
          expect(addResponse).to.be.an('object');

          return myFT.getGroupFromLicence(mocks.uuids.validLicence, mocks.uuids.validLicence);
        })
        .then(getResponse => {
          expectOwnProperties(getResponse, ['uuid', '_rel']);
          expect(getResponse.uuid).to.equal(mocks.uuids.validLicence);

          done();
        })
        .catch(done);
    });

    it ('Should be able to remove groups to a licence', done => {// TODO: test on local myFT
      myFT.removeGroupsFromLicence(mocks.uuids.validLicence, mocks.uuids.validLicence)
        .then(res => {
          //expect(res).to.be.an('object');// maybe null??

          return myFT.getGroupFromLicence(mocks.uuids.validLicence, mocks.uuids.validLicence);
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

    it ('Should be able to get a valid licence', done => {
      myFT.getLicence(mocks.uuids.validLicence)
        .then(resp => {
          expectOwnProperties(resp, ['uuid', '_rel']);
          expect(resp.uuid).to.equal(mocks.uuids.validLicence);

          done();
        })
        .catch(done);
    });

    it ('Should throw a NotFoundError for an invalid licence', done => {
      myFT.getLicence(mocks.uuids.invalidLicence)
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        });
    });

    it ('Should get user registered to a licence', done => {
      myFT.getUserFromLicence(mocks.uuids.validLicence, mocks.uuids.validUser)
        .then(resp => {
          expectOwnProperties(resp, ['uuid', '_rel']);
          expect(resp.uuid).to.equal(mocks.uuids.validUser);

          done();
        })
        .catch(done);
    });

    it ('Should throw a NotFoundError for an invalid licence user', done => {
      myFT.getUserFromLicence(mocks.uuids.validLicence, mocks.uuids.invalidUser)
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        });
    });


    it ('Should get user registered to a group', done => {
      myFT.getUserFromGroup(mocks.uuids.validLicence, mocks.uuids.validUser)
        .then(resp => {
          expectOwnProperties(resp, ['uuid', '_rel']);
          expect(resp.uuid).to.equal(mocks.uuids.validUser);

          done();
        })
        .catch(done);
    });

    it ('Should throw a NotFoundError for an invalid group user', done => {
      myFT.getUserFromGroup(mocks.uuids.validLicence, mocks.uuids.invalidUser)
        .then(resp => {
          done(new Error(`Shouldn't have got a resp: ${JSON.stringify(resp)}`));
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

          done();
        });
    });

    it ('Should get users registered to a licence', done => {
      myFT.getUsersForLicence(mocks.uuids.validLicence)
        .then(usersResponse => {
          expect(usersResponse).to.be.an('array');
          expectOwnProperties(usersResponse, ['uuid']);
          expect(usersResponse.length).to.be.at.least(1);

          done();
        })
        .catch(done);
    });

    it ('Should get users registered to a group', done => {
      myFT.getUsersForGroup(mocks.uuids.validLicence)
        .then(usersResponse => {
          expect(usersResponse).to.be.an('array');
          expectOwnProperties(usersResponse, ['uuid']);
          expect(usersResponse.length).to.be.at.least(1);

          done();
        })
        .catch(done);
    });

    it ('Should get groups registered to a licence', done => {
      myFT.getGroupsForLicence(mocks.uuids.validLicence)
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
      myFT.getConceptsFollowedByUser(mocks.uuids.validUser)
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
      myFT.getConceptsFollowedByGroup(mocks.uuids.validLicence)
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

    it ('Should set and get concepts followed by a group', done => {
      myFT.addConceptsFollowedByGroup(mocks.uuids.validLicence, groupConcepts.items, relProps)// TODO: test on local myFT
        .then(addResp => {
          expect(addResp).to.be.an('object');

          return myFT.getConceptsFollowedByGroup(mocks.uuids.validLicence);
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

    it ('Should set and get concepts followed by a user', done => {
      myFT.addConceptsFollowedByUser(mocks.uuids.validUser, userConcepts.items, relProps)// TODO: test on local myFT
        .then(addResp => {
          expect(addResp).to.be.an('object');

          return myFT.getConceptsFollowedByUser(mocks.uuids.validUser);
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

    it ('Should remove and get concepts followed by a group', done => {
      myFT.removeConceptsFollowedByGroup(mocks.uuids.validLicence, groupConcepts.items)// TODO: test on local myFT
        .then(addResp => {
          //expect(addResp).to.be.an('object');// maybe null??

          return myFT.getConceptsFollowedByGroup(mocks.uuids.validLicence);
        })
        .then(followResponse => {
          expect(followResponse).to.be.an('array');
          expect(followResponse).to.have.lengthOf(0);

          done();
        })
        .catch(done);
    });

    it ('Should remove and get concepts followed by a user', done => {
      myFT.removeConceptsFollowedByUser(mocks.uuids.validUser, userConcepts.items)// TODO: test on local myFT
        .then(addResp => {
          //expect(addResp).to.be.an('object');// maybe null??

          return myFT.getConceptsFollowedByUser(mocks.uuids.validUser);
        })
        .then(followResponse => {
          expect(followResponse).to.be.an('array');
          expect(followResponse).to.have.lengthOf(0);

          done();
        })
        .catch(done);
    });
  });

});
