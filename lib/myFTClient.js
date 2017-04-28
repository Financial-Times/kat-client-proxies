/*global Buffer*/
'use strict';

/**
 * myFT API client
 * Abstraction over the myFT API (v3)
 * Currently doesn't expose the underlying generic functions like getRelationship
 */
const fetch = require('fetch-retry-or-die');
const log = require('@financial-times/n-logger').default;
const config = require('./helpers/config');
const clientErrors = require('./clientErrors');
const helpers = require('./helpers/helpers');
const kinesis = require('./kinesisClient');

const relationshipProperties = {
	byTool: config.toolIdentifier,
	byUser: config.defaultAdminId
};

const followedProperties = Object.assign({}, relationshipProperties);
const digestProperties = Object.assign({"type": "daily", "timezone": "Europe/London"}, relationshipProperties);

//const entityProperties = {};// TODO: WIP
//entityProperties[config.toolDateIdentifier] = new Date().toISOString();

const fetchOptions = Object.assign({}, config.fetchOptions);
fetchOptions.headers = Object.assign({}, fetchOptions.headers, {"X-API-KEY": config.myFTKey});

/**
 * Get all the node items
 * @param {String} node -
 * @param {String} nodeId -
 * @param {String} relationship -
 * @param {String} relatedNode -
 * @returns {Promise} response -
 * @private
 */
function _getAllNodeItems(node, nodeId, relationship, relatedNode) {
  const operation = 'myFTClient.getAllNodeItems';
  log.debug({operation, nodeId, node, relationship, relatedNode});

  let allItems = [];
  const params = { page: 1, limit: 500 };

  // .then functionality
  const thenFn = (response) => {
    // if the items are received
    if (Array.isArray(response.items)) {
      // append the items to the previous list
      //allItems = [...allItems, ...response.items]; // node 4.3 (used by the lambda) does not like this :)
      allItems = allItems.concat(response.items);

      // if there are more pages
      if (!!response.total && (params.page * params.limit) < parseInt(response.total, 10)) {
        // add the new query param
        params.page++;

        // get the next list of items
        return _createAndTriggerRelationshipRequest("GET", node, nodeId, relationship, relatedNode, undefined, params)
          .then(helpers.parseJsonRes)
          .then(thenFn);
      }
    }

    log.debug({operation, nodeId, node, relationship, relatedNode, res: JSON.stringify(allItems)});
    // return all the items
    return allItems;
  };

  return _createAndTriggerRelationshipRequest("GET", node, nodeId, relationship, relatedNode, undefined, params)
    .then(helpers.parseJsonRes)
    .then(thenFn);
}

/**
 * Add/Remove users to/from node
 * @param {String} method -
 * @param {String} node -
 * @param {String} nodeId -
 * @param {String|Array} userIds -
 * @param {Object} [relProp] -
 * @param {Object} [options] -
 * @returns {Promise} response -
 * @private
 */
function _addRemoveUsers(method, node, nodeId, userIds, relProp, options) {
  const operation = `myFTClient.addRemoveUsers - ${method} ${node}`;
  const uuidStr = JSON.stringify(userIds);
  const propStr = JSON.stringify(relProp);
  const optStr = JSON.stringify(options);
  log.debug({operation, nodeId, userIds: uuidStr, relProp: propStr, options: optStr});

  return _addRemoveRelationships(method, node, nodeId, 'member', 'user', userIds, relProp, options)
    .then(res => helpers.parseJsonRes(res, `${operation} - users: ${uuidStr}`))
    .then(res => {
      log.debug({operation, nodeId, userIds: uuidStr, relProp: propStr, options: optStr, res: JSON.stringify(res)});
      return res;
    });
}

/**
 * Add/Remove groups to/from node
 * @param {String} method -
 * @param {String} licenseId -
 * @param {String|Array} groupIds -
 * @param {Object} [relProp] -
 * @param {Object} [options] -
 * @returns {Promise} response -
 * @private
 */
function _addRemoveGroups(method, licenseId, groupIds, relProp, options) {
  const operation = `myFTClient.addRemoveGroups - ${method}`;
  const uuidStr = JSON.stringify(groupIds);
  const propStr = JSON.stringify(relProp);
  const optStr = JSON.stringify(options);
  log.debug({operation, licenseId, groupIds: uuidStr, relProp: propStr, options: optStr});

  return _addRemoveRelationships(method, 'license', licenseId, 'member', 'group', groupIds, relProp, options)
    .then(res => helpers.parseJsonRes(res, `${operation} - groups: ${uuidStr}`))
    .then(res => {
      log.debug({operation, licenseId, groupIds: uuidStr, relProp: propStr, options: optStr, res: JSON.stringify(res)});
      return res;
    });
}

/**
 * Add/Remove concepts(topics) follows to/from node
 * @param {String} method -
 * @param {String} node -
 * @param {String} nodeId -
 * @param {Array} newConceptsToFollow -
 * @param {Object} [followProps] -
 * @returns {Promise} response -
 * @private
 */
function _addConceptsFollowed(method, node, nodeId, newConceptsToFollow, followProps) {
  const operation = `myFTClient.addConceptsFollowedBy - ${node}`;
  const conceptStr = JSON.stringify(newConceptsToFollow);
  const propsStr = JSON.stringify(followProps);
  log.debug({operation, nodeId, newConceptsToFollow: conceptStr, followProps: propsStr});

  const params = {
    noEvent: config.myFtNoEvent,
    waitForPurge: config.myFtWaitForPurgeAdd
  };
  const data = {
    ids: [nodeId],
    subjects: newConceptsToFollow.map(item => {
      return Object.assign(
        {},
        item,
        (followProps !== undefined ? {_rel: followProps} : {})
      );
    })
  };

  return _createAndTriggerRelationshipRequest(method, node, undefined, "followed", "concept", undefined, data, params)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, nodeId, newConceptsToFollow: conceptStr, followProps: propsStr, res: JSON.stringify(res)});
      return res;
    });
}

/**
 * Get node
 * @param {String} node -
 * @param {String} uuid -
 * @returns {Promise} response -
 * @private
 */
function _getNode(node, uuid) {
  const operation = `myFTClient.getNode - ${node}`;
  log.debug({operation, uuid});

  return _createAndTriggerRelationshipRequest('GET', node, uuid)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, uuid, res: JSON.stringify(res)});
      return res;
    });
}

/**
 * Set node
 * @param {String} node -
 * @param {String} uuid -
 * @returns {Promise} response -
 * @private
 */
function _setNode(node, uuid) {
  const operation = `myFTClient.setNode - ${node}`;
  log.debug({operation, uuid});

  return _createAndTriggerRelationshipRequest('POST', node, undefined, undefined, undefined, undefined, {uuid: uuid})
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, uuid, res: JSON.stringify(res)});
      return res;
    });
}

/**
 * Update node
 * @param {String} node -
 * @param {String} uuid -
 * @param {Object} data -
 * @returns {Promise} response -
 * @private
 */
function _updateNode(node, uuid, data) {
  const operation = `myFTClient.updateNode - ${node}`;
  const dataStr = JSON.stringify(data);
  log.debug({operation, uuid, data: dataStr});

  return _createAndTriggerRelationshipRequest('PUT', node, uuid, undefined, undefined, undefined, data)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, uuid, data: dataStr, res: JSON.stringify(res)});
      return res;
    });
}


/**
 * Get user from node
 * @param {String} node -
 * @param {String} nodeId -
 * @param {String} memberType -
 * @param {String} memberId -
 * @returns {Promise} response -
 * @private
 */
function _getMemberFromNode(node, nodeId, memberType, memberId) {
  const operation = `myFTClient.getUserFrom - ${node}`;
  log.debug({operation, nodeId, memberType, memberId});

  return _createAndTriggerRelationshipRequest("GET", node, nodeId, "member", memberType, memberId)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, nodeId, memberType, memberId, res: JSON.stringify(res)});
      return res;
    });
}

/**
 * Add/Remove relationships to/from node
 * @param {String} method -
 * @param {String} node -
 * @param {String} nodeId -
 * @param {String} rel -
 * @param {String} relType -
 * @param {String|Array} relIds -
 * @param {Object} [relProp] -
 * @param {Object} [options] -
 * @returns {Promise} response -
 * @private
 */
function _addRemoveRelationships(method, node, nodeId, rel, relType, relIds, relProp, options){
  let body;
  if (Array.isArray(relIds)) {
    body = relIds.map(uuid => {
      return Object.assign(
        {uuid},
        (relProp !== undefined ? {_rel: relProp} : {})
      );
    });
  } else {
    body = Object.assign(
      {uuid: relIds},
      (relProp !== undefined ? {_rel: relProp} : {})
    );
  }

  return _createAndTriggerRelationshipRequest(method, node, nodeId, rel, relType, undefined, body, options);
}

/**
 * Gets nodes following concepts/topics
 * @param {String} licenceId -
 * @param {String} conceptId -
 * @param {String} nodeType - user|group
 * @returns {Promise} response -
 * @private
 */
function _getNodesFollowingConcept(licenceId, conceptId, nodeType) {
  const operation = `myFTClient.getNodesFollowingConcept`;
  log.debug({operation, licenceId, conceptId, nodeType});

  return _createAndTriggerScopedRequest('GET', 'license', licenceId, 'concept', conceptId, 'followed', nodeType)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, licenceId, conceptId, nodeType, res: JSON.stringify(res)});// TODO: maybe length
      return res;
    });
}

/**
 * Creates the url and triggers the request ot get the scoped related nodes
 * @param {String} method -
 * @param {String} node -
 * @param {String} nodeId -
 * @param {String} relatedNode -
 * @param {String} relatedNodeId -
 * @param {String} relationship -
 * @param {String} relatedType -
 * @param {String|undefined} [data] -
 * @param {String|undefined} [params] -
 * @returns {Promise} response -
 * @private
 */
function _createAndTriggerScopedRequest(method, node, nodeId, relatedNode, relatedNodeId, relationship, relatedType, data, params) {
  let theUrl = `${config.myFTURL}/${node}/${nodeId}/${relatedNode}/${relatedNodeId}/${relationship}/${relatedType}`;

  return _doRelationshipRequest(method, theUrl, data, params);
}

/**
 * Create and trigger the relationshipRequest
 * @param {String} method -
 * @param {String} node -
 * @param {String|undefined} [nodeId] -
 * @param {String|undefined} [relationship] -
 * @param {String|undefined} [relatedNode] -
 * @param {String|undefined} [relatedNodeId] -
 * @param {Object|undefined} [data] -
 * @param {Object|undefined} [params] -
 * @returns {Promise} response -
 * @private
 */
function _createAndTriggerRelationshipRequest(method, node, nodeId, relationship, relatedNode, relatedNodeId, data, params) {
  let theUrl = `${config.myFTURL}/${node}`;

  if (nodeId !== undefined) {
    theUrl += `/${nodeId}`;
  }
  if (relationship !== undefined) {
    theUrl += `/${relationship}`;
  }
  if (relatedNode !== undefined) {
    theUrl += `/${relatedNode}`;
  }
  if (relatedNodeId !== undefined) {
    theUrl += `/${relatedNodeId}`;
  }

  return _doRelationshipRequest(method, theUrl, data, params);
}

/**
 * Initiates a relationshipRequest
 * @param {String} method -
 * @param {String} theUrl -
 * @param {Object|undefined} [data] -
 * @param {Object|undefined} [params] -
 * @returns {Promise} response -
 * @private
 */
function _doRelationshipRequest(method, theUrl, data, params) {
  const options = Object.assign({}, fetchOptions, { method: method });
  let queryString = helpers.createParams(params, '?');

  if (method !== "GET") {

    // fiddle content length header to appease Fastly
    if(config.nodeEnv === 'production') {
      // Fastly requires that empty requests have an empty object for a body and local API requires that they don't
      options.body = JSON.stringify(data || {});

      options.headers['Content-Length'] = Buffer.byteLength(options.body);

    } else {
      options.body = data ? JSON.stringify(data) : null;
    }
  } else {

    if(config.nodeEnv === 'production') {
      options.headers['Content-Length'] = 0;
    }

    queryString += helpers.createParams(data, (queryString === "" ? "?" : "&"));
  }

  theUrl += queryString;

  return fetch(theUrl, options);
}

/**
 * Adds a License in myFT
 * @param {String} uuid -
 * @return {Promise} response -
 * @throws {Error} statusError -
 */
function addLicence(uuid) {
  return _setNode('license', uuid);
}

/**
 * Adds a License in myFT
 * @param {String} uuid -
 * @param {Object} data -
 * @return {Promise} response -
 * @throws {Error} statusError -
 **/
function updateLicence(uuid, data) {
  return _updateNode('license', uuid, data);
}

/**
 * Gets a License from myFT
 * @param {String} uuid - of the licence
 * @return {Promise} response - licence data
 * @throws {Error} statusError - if something goes wrong, e.g. NotFoundError if the licence doesn't exist
**/
function getLicence(uuid) {
	return _getNode('license', uuid);
}

/**
 * Gets the EmailDigestPreference for a user's uuid
 * @param {String} uuid - of the user
 * @return {Promise} response - EmailDigestPreference json structure
 * @throws {Error} statusError - if something goes wrong, e.g. NotFoundError the user doesn't exist
 */
function getEmailDigestPreference(uuid) {
	const operation = 'myFTClient.emailDigestPreferences';
  log.debug({operation, uuid});
	return _createAndTriggerRelationshipRequest('GET', 'user', uuid, 'preferred', 'preference', 'email-digest')
		.then(res => helpers.parseJsonRes(res, `${operation} for user ${uuid}`))
		.then(res => {
      log.debug({operation, uuid, res: JSON.stringify(res)});
      return res;
    });
}

/**
 * Sets a User's EmailDigestPreference for a given uuid
 * @param {String} uuid - of the user
 * @param {Object} preference - an object representing the user's preference.
 *        at a minimum this should be type and timezone. For example:
 *        {type: "daily", timezone:"Europe/London", byTool: "KAT",
 *          byUser: "8619e7a0-65b7-446b-9931-4197b3fe0cbf"}
 * @param {Object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} response -  EmailDigestPreference json structure
 * @throws {Error} statusError - if something goes wrong
 */
function setEmailDigestPreference(uuid, preference, options) {
	const operation = 'myFTClient.setEmailDigestPreferences';
  const prefStr = JSON.stringify(preference);
  const optStr = JSON.stringify(options);
  log.debug({operation, uuid, preference: prefStr, options: optStr});

	return _addRemoveRelationships('POST', 'user', uuid, 'preferred', 'preference', 'email-digest', preference, options)
    .then(res => helpers.parseJsonRes(res, `${operation} for user ${uuid}`))
		.then(res => {
      log.debug({operation, uuid, preference: prefStr, options: optStr, res: JSON.stringify(res)});
      return res;
    });
}

/**
 * Gets the Concepts followed by a user
 * @param {String} uuid - of the user
 * @return {Promise} response - array of Concepts followed
 */
function getConceptsFollowedByUser(uuid) {
  return _getAllNodeItems('user', uuid, 'followed', 'concept');
}

/**
 * Gets the Concepts followed by a group
 * @param {String} uuid - of the group
 * @return {Promise} response - array of Concepts followed
 */
function getConceptsFollowedByGroup(uuid) {
  return _getAllNodeItems('group', uuid, 'followed', 'concept');
}

/**
 * Gets the Groups associated with a licence
 * @param {String} uuid - of the licence
 * @return {Promise} response - array of groups
 */
function getGroupsForLicence(uuid) {
  return _getAllNodeItems("license", uuid, "member", "group");
}

/**
 * Gets the Users that are registered with a licence
 * @param {String} uuid - of the licence
 * @return {Promise} response - array of users
 */
function getUsersForLicence(uuid){
	return _getAllNodeItems("license", uuid, "member", "user");
}

/**
 * Gets the Users who are members of a group
 * @param {String} uuid - of the group
 * @return {Promise} response - array of users
 */
function getUsersForGroup(uuid){
  return _getAllNodeItems("group", uuid, "member", "user");
}

/**
 * Gets the users that are following a concept/topic
 * @param {String} licenceId -
 * @param {String} conceptId -
 * @returns {Promise} response -
 */
function getUsersFollowingConcept(licenceId, conceptId) {
  return _getNodesFollowingConcept(licenceId, conceptId, 'user');
}

/**
 * Gets the groups that are following a concept/topic
 * @param {String} licenceId -
 * @param {String} conceptId -
 * @returns {Promise} response -
 */
function getGroupsFollowingConcept(licenceId, conceptId) {
  return _getNodesFollowingConcept(licenceId, conceptId, 'group');
}

/**
 * Gets the users with EmailDigestPreferences for given licence
 * @param {String} uuid - of the licence
 * @return {Promise} response - array of user json structures
 */
function getUsersWithEmailDigestPreference(uuid) {
	const operation = 'myFTClient.getUsersWithEmailDigestPreference';
  log.debug({operation, uuid});

  return _createAndTriggerScopedRequest('GET', 'license', uuid, 'preference', 'email-digest', 'preferred', 'user')
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, uuid, res: JSON.stringify(res)});// TODO: maybe length
      return res;
    });
}

/**
 * Add users to a licence
 * @param {String} licenceUUID - uuid of the licence
 * @param {String|Array} userUUIDs - uuid of the user to add, or an array of user uuids
 * @param {Object} [relationshipProperties] - properties to add to the 'member' relationship(s)
 * @param {Object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} response -
**/
function addUsersToLicence(licenceUUID, userUUIDs, relationshipProperties, options) {
  return _addRemoveUsers('POST', 'license', licenceUUID, userUUIDs, relationshipProperties, options);
}

/**
 * Remove users to a licence
 * @param {String} licenceUUID - uuid of the licence
 * @param {String|Array} userUUIDs - uuid of the user to add, or an array of user uuids
 * @param {Object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} response -
**/
function removeUsersFromLicence(licenceUUID, userUUIDs, options) {
  return _addRemoveUsers('DELETE', 'license', licenceUUID, userUUIDs, undefined, options);
}

/**
 * Add users to a group
 * @param {String} groupUUID - uuid of the licence
 * @param {String|Array} userUUIDs - uuid of the user to add, or an array of user uuids
 * @param {Object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @param {Object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} response -
**/
function addUsersToGroup(groupUUID, userUUIDs, relationshipProperties, options) {
  return _addRemoveUsers('POST', 'group', groupUUID, userUUIDs, relationshipProperties, options);
}

/**
 * Remove users to a group
 * @param {String} groupUUID - uuid of the licence
 * @param {String|Array} userUUIDs - uuid of the user to add, or an array of user uuids
 * @param {Object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} response -
 **/
function removeUsersFromGroup(groupUUID, userUUIDs, options) {
  return _addRemoveUsers('DELETE', 'group', groupUUID, userUUIDs, undefined, options);
}

/**
 * Add groups to a licence
 * @param {String} licenceUUID - uuid of the licence
 * @param {String|Array} groupUUIDs - uuid of the group to add, or an array of group uuids
 * @param {Object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @param {Object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} response -
**/
function addGroupsToLicence(licenceUUID, groupUUIDs, relationshipProperties, options) {
  return _addRemoveGroups('POST', licenceUUID, groupUUIDs, relationshipProperties, options);
}

/**
 * Remove groups from a licence
 * @param {String} licenceUUID -
 * @param {String|Array} groupUUIDs -
 * @param {Object} [options] -
 * @returns {Promise} response -
 */
function removeGroupsFromLicence(licenceUUID, groupUUIDs, options) {
  return _addRemoveGroups('DELETE', licenceUUID, groupUUIDs, undefined, options);
}

/**
 * Add topics for a user to follow
 * @param {String} userUUID - uuid of the user
 * @param {String|Array} conceptUUIDs - uuid of the topic, or an array of topic uuids, to follow
 * @param {Object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @return {Promise} response -
**/
function addConceptsFollowedByUser(userUUID, conceptUUIDs, relationshipProperties) {
  return _addConceptsFollowed('POST', 'user', userUUID, conceptUUIDs, relationshipProperties);
}

/**
 * Add topics for a group to follow
 * @param {String} groupUUID - uuid of the user
 * @param {String|Array} conceptUUIDs - uuid of the topic, or an array of topic uuids, to follow
 * @param {Object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @return {Promise} response -
**/
function addConceptsFollowedByGroup(groupUUID, conceptUUIDs, relationshipProperties) {
  return _addConceptsFollowed('POST', 'group', groupUUID, conceptUUIDs, relationshipProperties);
}

/**
 * Remove topic follows for a group
 * @param {String} groupUUID - uuid of the user
 * @param {String|Array} conceptUUIDs - uuid of the topic, or an array of topic uuids, to follow
 * @return {Promise} response -
**/
function removeConceptsFollowedByGroup(groupUUID, conceptUUIDs){
  return _addRemoveRelationships('DELETE', 'group', groupUUID, "followed", "concept", conceptUUIDs);
}

/**
 * Remove topic follows for a user
 * @param {String} userUUID - uuid of the user
 * @param {String|Array} conceptUUIDs - uuid of the topic, or an array of topic uuids, to follow
 * @return {Promise} response -
**/
function removeConceptsFollowedByUser(userUUID, conceptUUIDs) {
  return _addRemoveRelationships('DELETE', 'user', userUUID, "followed", "concept", conceptUUIDs);
}

/**
 * Get user from licence
 * @param {String} licenceId -
 * @param {String} userId -
 * @returns {Promise} response -
 */
function getUserFromLicence(licenceId, userId) {
	return _getMemberFromNode("license", licenceId, 'user', userId);
}

/**
 * Get user from group
 * @param {String} groupId -
 * @param {String} userId -
 * @returns {Promise} response -
 */
function getUserFromGroup(groupId, userId) {
	return _getMemberFromNode("group", groupId, 'user', userId);
}

/**
 * Get group from licence
 * @param {String} licenceId -
 * @param {String} groupId -
 * @returns {Promise} response -
 */
function getGroupFromLicence(licenceId, groupId) {
  return _getMemberFromNode("license", licenceId, 'group', groupId);
}

/**
 * Sync user followers
 * @param {String} groupId -
 * @param {String} userId -
 * @returns {Promise} response -
 */
function syncUserFollowers(groupId, userId) {
	const operation = 'myFTClient.syncUserFollowers';
	return getConceptsFollowedByGroup(groupId)
		.catch(err => {
			// if no concepts are found
			if (err instanceof clientErrors.NotFoundError) {
				return [];
			}
			throw err;
		})
		.then(groupConcepts => {
			if (Array.isArray(groupConcepts)) {
				return groupConcepts;
			}
			const msg = "Group groupConcepts is not an array";
			log.error({operation, groupConcepts, status: msg});
			throw new Error(msg);
		})
		.then(groupConcepts => {
			const conceptCount = groupConcepts.length;
			if (conceptCount > 0) {
				log.silly({operation, subOp: 'groupConceptsFollowed', userId, groupId, groupConceptsCount: conceptCount});
				// get the concepts (topics) followed by the user
				return getConceptsFollowedByUser(userId)
					.catch(err => {
						// if no concepts are found
						if (err instanceof clientErrors.NotFoundError) {
							return [];
						}
						throw err;
					})
					.then(conceptsResp => {
						if (Array.isArray(conceptsResp)) {
							const userConceptIds = conceptsResp.map(concept => concept.uuid);
							log.silly({operation, subOp: 'userConceptsFollowed', userId, groupId, userConceptsCount: userConceptIds.length});
							// get the new concepts to be followed
							const newConceptsToFollow = groupConcepts.filter((item)=> userConceptIds.indexOf(item.uuid) === -1);
							if (newConceptsToFollow.length === 0) {
								log.silly({operation, subOp: 'noNewConceptsToFollow', userId, groupId});
								return {user: {uuid: userId, group: groupId, status: 'synchronisationIgnored', reason: 'noNewConceptsToFollow'}};
							}

							log.silly({operation, subOp: 'newConceptsToFollow', userId, group: groupId, newConceptsToFollow});
							const followProps = Object.assign({}, followedProperties);
							followProps.asMemberOf = groupId;
							// set the user as being a follower on the new concepts
							return addConceptsFollowedByUser(userId, newConceptsToFollow, followProps)
								.then(() => {
									log.silly({operation, subOp: 'setEmailDigestPreference', userId});
									return getEmailDigestPreference(userId)
										.catch(err => {
											// if no preferences are found
											if (err instanceof clientErrors.NotFoundError) {
												return setEmailDigestPreference(userId, digestProperties);
											}
											throw err;
										});
								})
								.then(() => {
									const cleanConcepts = newConceptsToFollow.map(item => {
										const newItem = Object.assign({}, item);
										delete newItem._rel;
										return newItem;
									});

									log.silly({operation, subOp: 'kinesis.write', userId});
									return kinesis.write(userId, 'subscribe', cleanConcepts);
								})
								.then(()=> ({user: {uuid: userId, status: 'synchronisationCompleted', group: groupId, newConceptsToFollow}}));
						}
						const msg = "User conceptsResp is not an array";
						log.error({operation, conceptsResp, status: msg});
						throw new Error(msg);
					});

			}
			log.silly({operation, subOp: 'noGroupConceptsToFollow', userId, groupId});
			return {user: {uuid: userId, group: groupId, status: 'synchronisationIgnored', reason: 'noGroupConceptsToFollow'}};
		});
}

module.exports = {
  addLicence,
  updateLicence,
  getLicence,
  getUserFromLicence,
  getUserFromGroup,
  getGroupFromLicence,
  getEmailDigestPreference,
  setEmailDigestPreference,
  getUsersWithEmailDigestPreference,
  getConceptsFollowedByUser,
  getConceptsFollowedByGroup,
  getUsersForLicence,
  getUsersForGroup,
  getGroupsForLicence,
  addUsersToLicence,
  removeUsersFromLicence,
  addUsersToGroup,
  removeUsersFromGroup,
  addGroupsToLicence,
  removeGroupsFromLicence,
  addConceptsFollowedByUser,
  addConceptsFollowedByGroup,
  removeConceptsFollowedByUser,
  removeConceptsFollowedByGroup,
  getUsersFollowingConcept,
  getGroupsFollowingConcept,
  syncUserFollowers,
  relationshipProperties,
  followedProperties,
  digestProperties
  //entityProperties
};
