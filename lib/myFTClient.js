/*global Buffer*/
'use strict';

/**
 * myFT API client
 * Abstraction over the myFT API (v3)
 * Currently doesn't expose the underlying generic functions like getRelationship
 */
const fetch = require('n-eager-fetch');
const log = require('@financial-times/n-logger').default;
const config = require('./helpers/config');
const clientErrors = require('./clientErrors');
const helpers = require('./helpers/helpers');
const kinesis = require('./kinesisClient');
const Promise = require('bluebird');

const myftConst = config.myftClientConstants;

const relationshipProperties = {
	byTool: config.FT_TOOL_ID,
	byUser: config.FT_TOOL_ADMIN_ID
};

const followedProperties = Object.assign({}, relationshipProperties);
const digestProperties = Object.assign({"type": "daily", "timezone": "Europe/London"}, relationshipProperties);

//const entityProperties = {};// TODO: WIP
//entityProperties[config.FT_TOOL_DATE_ID] = new Date().toISOString();

const fetchOptions = Object.assign({}, config.fetchOptions);
fetchOptions.headers = Object.assign({}, fetchOptions.headers, {"X-API-KEY": config.MYFT_API_KEY});

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
      allItems = [...allItems, ...response.items];
      // if there are more pages
      if (!!response.total && (params.page * params.limit) < parseInt(response.total, 10)) {
        // add the new query param
        params.page++;

        // get the next list of items
        return _getNodeItemsByPage(node, nodeId, relationship, relatedNode, params).then(thenFn);
      }
    }

    log.debug({operation, nodeId, node, relationship, relatedNode, res: JSON.stringify(allItems)});
    // return all the items
    return allItems;
  };

  return _getNodeItemsByPage(node, nodeId, relationship, relatedNode, params).then(thenFn);
}

/**
 * Get the node items by page
 * @param {String} node -
 * @param {String} nodeId -
 * @param {String} relationship -
 * @param {String} relatedNode -
 * @param {Object} params -
 * @returns {Promise} response -
 * @private
 */
function _getNodeItemsByPage(node, nodeId, relationship, relatedNode, params) {
  return _createAndTriggerRelationshipRequest("GET", node, nodeId, relationship, relatedNode, undefined, params)
    .then(helpers.parseJsonRes);
}

/**
 * Add/Remove users to/from node
 * @param {String} method -
 * @param {String} node -
 * @param {String} nodeId -
 * @param {String|Array} userIds -
 * @param {Object} [relProp] -
 * @param {Object} [options] -
 * @param {Boolean} [noResultParse] -
 * @returns {Promise} response -
 * @private
 */
function _addRemoveUsers(method, node, nodeId, userIds, relProp, options, noResultParse) {
  const operation = `myFTClient.addRemoveUsers - ${method} ${node}`;
  const uuidStr = JSON.stringify(userIds);
  const propStr = JSON.stringify(relProp);
  const optStr = JSON.stringify(options);
  log.debug({operation, nodeId, userIds: uuidStr, relProp: propStr, options: optStr});

  let thePromise = _addRemoveRelationships(method, node, nodeId, myftConst.memberRelName, myftConst.userNodeName, userIds, relProp, options);

  // if we want the response to be parsed
  if (noResultParse !== true) {
    thePromise = thePromise.then(res => helpers.parseJsonRes(res, `${operation} - users: ${uuidStr}`));
  }

  thePromise.then(res => {
    log.debug({operation, nodeId, userIds: uuidStr, relProp: propStr, options: optStr, res: 'success'});
    return res;
  });

  return thePromise;
}

/**
 * Add/Remove groups to/from node
 * @param {String} method -
 * @param {String} licenseId -
 * @param {String|Array} groupIds -
 * @param {Object} [relProp] -
 * @param {Object} [options] -
 * @param {Boolean} [noResultParse] -
 * @returns {Promise} response -
 * @private
 */
function _addRemoveGroups(method, licenseId, groupIds, relProp, options, noResultParse) {
  const operation = `myFTClient.addRemoveGroups - ${method}`;
  const uuidStr = JSON.stringify(groupIds);
  const propStr = JSON.stringify(relProp);
  const optStr = JSON.stringify(options);
  log.debug({operation, licenseId, groupIds: uuidStr, relProp: propStr, options: optStr});

  let thePromise = _addRemoveRelationships(method, myftConst.licenceNodeName, licenseId, myftConst.memberRelName, myftConst.groupNodeName, groupIds, relProp, options);

  // if we want the response to be parsed
  if (noResultParse !== true) {
    thePromise = thePromise.then(res => helpers.parseJsonRes(res, `${operation} - groups: ${uuidStr}`));
  }

  thePromise.then(res => {
    log.debug({operation, licenseId, groupIds: uuidStr, relProp: propStr, options: optStr, res: 'success'});
    return res;
  });

  return thePromise;
}

/**
 * Add/Remove concepts(topics) follows to/from node
 * @param {String} method -
 * @param {String} node -
 * @param {String|Array} nodeId -
 * @param {Array} newConceptsToFollow -
 * @param {Object} [followProps] -
 * @returns {Promise} response -
 * @private
 */
function _addRemoveConceptsFollowed(method, node, nodeId, newConceptsToFollow, followProps) {
  log.debug({operation: '_addRemoveConceptsFollowed', args: JSON.stringify(newConceptsToFollow)});
  return _multiAddRemoveRelationships(method, node, nodeId, myftConst.followedRelName, myftConst.topicNodeName, newConceptsToFollow, followProps);
}

/**
 * Add/Remove concepts(topics) follows to/from node
 * @param {String} method - http verb  expects POST or DELETE
 * @param {String} node - Expects user or group
 * @param {String|Array} nodeIds - array of user uuuids
 * @param {Array} newConceptsToFollow - array of conceptIds
 * @param {Object} [followProps] -
* @param {Object} [memberFollows] -
 * @returns {Promise} response -
 * @private
 */
function _addRemoveKatConceptsFollowed(method, node, nodeIds, newConceptsToFollow, followProps, memberFollows = false) {
  log.debug({operation: '🐱_addRemoveConceptsFollowed🐱', args: JSON.stringify(newConceptsToFollow)});
  return _multiAddRemoveKatRelationships(method, node, nodeIds, newConceptsToFollow, followProps, memberFollows);
}

/**
 * Removes concepts(topics) followed by node (user|group)
 * @param {String} node -
 * @param {String} nodeUUID -
 * @param {String|Array} conceptUUIDs -
 * @param {Boolean} [noResultParse] -
 * @returns {Promise} response -
 * @private
 */
function _removeConceptsFollowedByNode(node, nodeUUID, conceptUUIDs, noResultParse) {
  const operation = `myFTClient.removeConceptsFollowedBy - ${node}`;
  const conceptStr = JSON.stringify(conceptUUIDs);
  log.debug({operation, nodeUUID, conceptUUIDs: conceptStr});

  let thePromise = _addRemoveRelationships('DELETE', node, nodeUUID, myftConst.followedRelName, myftConst.topicNodeName, conceptUUIDs);

  // if we want the response to be parsed
  if (noResultParse !== true) {
    thePromise = thePromise.then(helpers.parseJsonRes);
  }

  thePromise.then(res => {
    log.debug({operation, nodeUUID, conceptUUIDs: conceptStr, res: 'success'});
    return res;
  });

  return thePromise;
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
      log.debug({operation, uuid, res: 'success'});
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
      log.debug({operation, uuid, res: 'success'});
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
      log.debug({operation, uuid, data: dataStr, res: 'success'});
      return res;
    });
}

/**
 * Remove node
 * @param {String} node -
 * @param {String} uuid -
 * @returns {Promise} response -
 * @private
 */
function _removeNode(node, uuid) {
  const operation = `myFTClient.removeNode - ${node}`;
  log.debug({operation, uuid});

  return _createAndTriggerRelationshipRequest('DELETE', node, uuid)
    .then(res => {
      log.debug({operation, uuid, res: 'success'});
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

  return _createAndTriggerRelationshipRequest("GET", node, nodeId, myftConst.memberRelName, memberType, memberId)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, nodeId, memberType, memberId, res: 'success'});
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
 * @param {String|Object|Array} relIds -
 * @param {Object} [relProp] -
 * @param {Object} [options] -
 * @returns {Promise} response -
 * @private
 */
function _addRemoveRelationships(method, node, nodeId, rel, relType, relIds, relProp, options) {
  const params = Object.assign({
      noEvent: config.MYFT_NO_EVENT,
      waitForPurge: config.MYFT_WAIT_FOR_PURGE_ADD
    },
    options
  );

  let body;
  if (Array.isArray(relIds)) {
    body = relIds.map(data => {
      const relData = data === Object(data) ? data : {uuid: data};
      return Object.assign(
        relData,
        (relProp !== undefined ? {_rel: relProp} : {})
      );
    });
  } else {
    const relData = relIds === Object(relIds) ? relIds : {uuid: relIds};
    body = Object.assign(
      relData,
      (relProp !== undefined ? {_rel: relProp} : {})
    );
  }

  return _createAndTriggerRelationshipRequest(method, node, nodeId, rel, relType, undefined, body, params);
}

/**
 * Multi Add/Remove relationships to/from node
 * @param {String} method -
 * @param {String} node -
 * @param {String|Array} nodeId -
 * @param {String} rel -
 * @param {String} relType -
 * @param {Array} relIds -
 * @param {Object} [relProp] -
 * @param {Object} [options] -
 * @returns {Promise} response -
 * @private
 */
function _multiAddRemoveRelationships(method, node, nodeId, rel, relType, relIds, relProp, options) {
  const operation = 'myFTClient.multiAddRemoveRelationships';
  const relIdsStr = JSON.stringify(relIds);
  const propsStr = JSON.stringify(relProp);
  const optStr = JSON.stringify(options);
  log.debug({operation, node, nodeId, rel, relType, relIds: relIdsStr, relProp: propsStr, options: optStr});

  const params = Object.assign({
      noEvent: config.MYFT_NO_EVENT,
      waitForPurge: config.MYFT_WAIT_FOR_PURGE_ADD
    },
    options
  );

  const idChunks = [];
  if (Array.isArray(nodeId)) {
    //const idsClone = [...nodeId];
    const idsClone = nodeId.slice(); // node 4.3 (used by the lambda) does not like this :)
    while (idsClone.length) {
      idChunks.push(idsClone.splice(0, config.BATCH_USER_COUNT));
    }
  } else {
    idChunks.push(nodeId);
  }

  const partial = {
    subjects: relIds.map(item => {
      return Object.assign(
        {},
        item,
        (relProp !== undefined ? {_rel: relProp} : {})
      );
    })
  };

  return Promise.map(idChunks, (chunk, i) => {
    const chunkData = Object.assign({}, partial, { ids: chunk });

    return _createAndTriggerRelationshipRequest(method, node, undefined, rel, relType, undefined, chunkData, params)
      .then(helpers.parseJsonRes)
      .then(res => {
        log.debug({operation, i, node, chunk, rel, relType, relIds: relIdsStr, relProp: propsStr, options: optStr, res: 'success'});
        return res;
      })
      .catch(err => {
        log.error({operation, i, node, chunk, rel, relType, relIds: relIdsStr, relProp: propsStr, options: optStr, err: err.message});
        return err;
      });
  }, {concurrency: config.BATCH_USER_CONCURRENCY})
    .then(results => {
      // check if there are some good results
      const notAllErrors = results.some(res => ((res instanceof Error) === false));
      // if there are only errors
      if (notAllErrors === false) {
        // if there's only one chunk
        if (results.length === 1) {
          throw results[0];
        }
        // throw a general error
        throw new clientErrors.ClientError("An error has occurred while processing your request.");
      }

      return results;
    });
}


/**
 * Multi Add/Remove relationships to/from node
 * @param {String} method - http verb expects POST or DELETE
 * @param {String} node - name of node either user or group
 * @param {String|Array} nodeIds - array of uuids for users or groups
 * @param {Array} conceptIds - an array of conceptIds ot follow
 * @param {Object} [relProp] -
 * @param {Boolean} memberFollows - adding or removing membership follow default is false
 * @param {Object} [options] -
 * @returns {Promise} response -
 * @private
 */
function _multiAddRemoveKatRelationships(method, node, nodeIds, conceptIds, relProp, memberFollows, options) {
  const operation = '🐱myFTClient.multiAddRemoveRelationships🐱';
  const conceptIdsStr = JSON.stringify(conceptIds);
  const propsStr = JSON.stringify(relProp);
  const optStr = JSON.stringify(options);
  log.debug({operation, msg: '👋 🐱local client proxies'});
  log.debug({operation, node, nodeIds, conceptIds: conceptIdsStr, relProp: propsStr, options: optStr});

  const params = Object.assign({
      noEvent: config.MYFT_NO_EVENT,
      waitForPurge: config.MYFT_WAIT_FOR_PURGE_ADD
    },
    options
  );

  const idChunks = [];
  if (Array.isArray(nodeIds)) {
    const idsClone = [...nodeIds];
    while (idsClone.length) {
      idChunks.push(idsClone.splice(0, config.BATCH_USER_COUNT));
    }
  } else {
    idChunks.push(nodeIds);
  }

  const partial = {
    subjects: conceptIds.map(item => {
      return Object.assign(
        {},
        item,
        (relProp !== undefined ? {_rel: relProp} : {})
      );
    })
  };

  return Promise.map(idChunks, (chunk, i) => {
    const chunkData = Object.assign({}, partial, { ids: chunk });

    //TODO if node is group do we have an id? is memberFollow set?

    return _createAndTriggerKatRelationshipRequest(method, node, chunkData, params, undefined, memberFollows)
      .then(helpers.parseJsonRes)
      .then(res => {
        log.debug({operation, i, node, chunk, conceptIds: conceptIdsStr, relProp: propsStr, options: optStr, res: 'success'});
        return res;
      })
      .catch(err => {
        log.error({operation, i, node, chunk, relIds: conceptIdsStr, relProp: propsStr, options: optStr, err: err.message});
        return err;
      });
  }, {concurrency: config.BATCH_USER_CONCURRENCY})
    .then(results => {
      // check if there are some good results
      const notAllErrors = results.some(res => ((res instanceof Error) === false));
      // if there are only errors
      if (notAllErrors === false) {
        // if there's only one chunk
        if (results.length === 1) {
          throw results[0];
        }
        // throw a general error
        throw new clientErrors.ClientError("🐱An error has occurred while processing your request.");
      }

      return results;
    });
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

  return _createAndTriggerScopedRequest('GET', myftConst.licenceNodeName, licenceId, myftConst.topicNodeName, conceptId, myftConst.followedRelName, nodeType)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, licenceId, conceptId, nodeType, res: 'success'});
      return res;
    });
}

/**
 * Gets nodes that are following concepts/topics through KAT
 * @param {String} licenceId -
 * @param {String} conceptId -
 * @param {String} nodeType - user|group
 * @param {Object} params - Any additional parameters needed to filter the follow relationship.
 * @returns {Promise} response -
 * @private
 */
function _getNodesFollowingConceptByKat (licenceId, conceptId, nodeType, params) {
  const operation = `🐱myFTClient.getNodesFollowingConceptByKat🐱`;
  log.debug({operation, licenceId, conceptId, nodeType, params});

  return _createAndTriggerScopedRequestKat('GET', myftConst.licenceNodeName, licenceId, myftConst.topicNodeName, conceptId, 'followers', nodeType, null, params)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, licenceId, conceptId, nodeType, res: 'success'});
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
  const theUrl = `${config.MYFT_API_URL}/${node}/${nodeId}/${relatedNode}/${relatedNodeId}/${relationship}/${relatedType}`;

  return _doRelationshipRequest(method, theUrl, data, params);
}

/**
 * Creates the url and triggers the request to get the scoped related nodes from the
 * KAT version of the api.
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
function _createAndTriggerScopedRequestKat(method, node, nodeId, relatedNode, relatedNodeId, relationship, relatedType, data, params) {
  const theUrl = `${config.MYFT_API_URL}/kat/${node}/${nodeId}/${relatedNode}/${relatedNodeId}/${relationship}/${relatedType}`;

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
  let theUrl = `${config.MYFT_API_URL}/${node}`;

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

  log.debug({operation: '_createAndTriggerRelationshipRequest', theUrl});

  return _doRelationshipRequest(method, theUrl, data, params);
}

/**
 * Create and trigger the relationshipRequest
 * @param {String} method - http verb POST or DELETE
 * @param {String} node - user or group
 * @param {Object|undefined} [data] - the data
 * @param {Object|undefined} [params] - some relationship properties
 * @param {String} nodeId - id of node currently only expects a groupId
 * @param {Boolean} memberFollows - adding or removing membership follow default is false
 * @returns {Promise} response -
 * @private
 */
function _createAndTriggerKatRelationshipRequest(method, node, data, params, nodeId, memberFollows = false) {
  let theUrl = `${config.MYFT_API_URL}/kat/${node}`;

  log.debug({operation: '🐱_createAndTriggerKatRelationshipRequest 🐱',  theUrl, method, node, data, params, nodeId, memberFollows});

  if(memberFollows === true && nodeId !== undefined && node === 'group') {
    //constructs url to handle relationship request for specific groupIds
    theUrl += `/${nodeId}/user/follows`;
  } else if(memberFollows === false && !nodeId === 'group') {
    //constructs url to handle relationship request for group members
    theUrl += `/user/follows`;
  } else {
    //otherwise just append /follows
    theUrl += `/follows`;
  }

  log.debug({operation: '🐱_createAndTriggerKatRelationshipRequest 🐱', theUrl});

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
    if(config.NODE_ENV === 'production') {
      // Fastly requires that empty requests have an empty object for a body and local API requires that they don't
      options.body = JSON.stringify(data || {});

      options.headers['Content-Length'] = Buffer.byteLength(options.body);

    } else {
      options.body = data ? JSON.stringify(data) : null;
    }
  } else {

    if(config.NODE_ENV === 'production') {
      options.headers['Content-Length'] = 0;
    }

    queryString += helpers.createParams(data, (queryString === "" ? "?" : "&"));
  }

  theUrl += queryString;

  return fetch(theUrl, Object.assign({}, options));
}

/**
 * Adds a License in myFT
 * @param {String} uuid -
 * @return {Promise} response -
 * @throws {Error} statusError -
 */
function addLicence(uuid) {
  return _setNode(myftConst.licenceNodeName, uuid);
}

/**
 * Updates a License in myFT
 * @param {String} uuid -
 * @param {Object} data -
 * @return {Promise} response -
 * @throws {Error} statusError -
 **/
function updateLicence(uuid, data) {
  return _updateNode(myftConst.licenceNodeName, uuid, data);
}

/**
 * Updates a Group in myFT
 * @param {String} uuid -
 * @param {Object} data -
 * @return {Promise} response -
 * @throws {Error} statusError -
 **/
function updateGroup(uuid, data) {
  return _updateNode(myftConst.groupNodeName, uuid, data);
}

/**
 * Gets a License from myFT
 * @param {String} uuid - of the licence
 * @return {Promise} response - licence data
 * @throws {Error} statusError - if something goes wrong, e.g. NotFoundError if the licence doesn't exist
**/
function getLicence(uuid) {
	return _getNode(myftConst.licenceNodeName, uuid);
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
	return _createAndTriggerRelationshipRequest('GET', myftConst.userNodeName, uuid, myftConst.prefRelType, myftConst.prefRelName, myftConst.prefRelId)
		.then(res => helpers.parseJsonRes(res, `${operation} for user ${uuid}`))
		.then(res => {
      log.debug({operation, uuid, res: 'success'});
      return res;
    });
}

/**
 * Sets a User's EmailDigestPreference for a given uuid
 * @param {String|Array} uuid - of the user
 * @param {Object} preference - an object representing the user's preference.
 *        at a minimum this should be type and timezone. For example:
 *        {type: "daily", timezone:"Europe/London", byTool: "KAT",
 *          byUser: "8619e7a0-65b7-446b-9931-4197b3fe0cbf"}
 * @param {Object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} response -  EmailDigestPreference json structure
 */
function setEmailDigestPreference(uuid, preference, options) {
  return _multiAddRemoveRelationships('POST', myftConst.userNodeName, uuid, myftConst.prefRelType, myftConst.prefRelName, [{uuid: myftConst.prefRelId}], preference, options);
}

/**
 * Gets the Concepts followed by a user
 * @param {String} uuid - of the user
 * @return {Promise} response - array of Concepts followed
 */
function getConceptsFollowedByUser(uuid) {
  return _getAllNodeItems(myftConst.userNodeName, uuid, myftConst.followedRelName, myftConst.topicNodeName);
}

/**
 * Gets the Concepts followed by a user
 * @param {String} uuid - of the user
 * @return {Promise} response - array of Concepts followed
 */
function getConceptsFollowedByKatUser(uuid) {
  return _getAllNodeItems(myftConst.userNodeName, uuid, myftConst.followedRelName, myftConst.topicNodeName);
}

/**
 * Gets the Concepts followed by a group
 * @param {String} uuid - of the group
 * @return {Promise} response - array of Concepts followed
 */
function getConceptsFollowedByGroup(uuid) {
  return _getAllNodeItems(myftConst.groupNodeName, uuid, myftConst.followedRelName, myftConst.topicNodeName);
}

/**
 * Gets the Groups associated with a licence
 * @param {String} uuid - of the licence
 * @return {Promise} response - array of groups
 */
function getGroupsForLicence(uuid) {
  return _getAllNodeItems(myftConst.licenceNodeName, uuid, myftConst.memberRelName, myftConst.groupNodeName);
}

/**
 * Gets the Users that are registered with a licence
 * @param {String} uuid - of the licence
 * @return {Promise} response - array of users
 */
function getUsersForLicence(uuid){
	return _getAllNodeItems(myftConst.licenceNodeName, uuid, myftConst.memberRelName, myftConst.userNodeName);
}

/**
 * Gets the Users who are members of a group
 * @param {String} uuid - of the group
 * @return {Promise} response - array of users
 */
function getUsersForGroup(uuid){
  return _getAllNodeItems(myftConst.groupNodeName, uuid, myftConst.memberRelName, myftConst.userNodeName);
}

/**
 * Gets the Users who are members of a group
 * @param {String} uuid - of the group
 * @param {Object} params -  { page, limit }
 * @return {Promise} response - array of users
 */
function getUsersForGroupByPage(uuid, params){
  return _getNodeItemsByPage(myftConst.groupNodeName, uuid, myftConst.memberRelName, myftConst.userNodeName, params);
}

/**
 * Gets the users that are following a concept/topic
 * @param {String} licenceId -
 * @param {String} conceptId -
 * @returns {Promise} response -
 */
function getUsersFollowingConcept(licenceId, conceptId) {
  return _getNodesFollowingConcept(licenceId, conceptId, myftConst.userNodeName);
}

/**
 * Gets the groups that are following a concept/topic
 * @param {String} licenceId -
 * @param {String} conceptId -
 * @returns {Promise} response -
 */
function getGroupsFollowingConcept(licenceId, conceptId) {
  return _getNodesFollowingConcept(licenceId, conceptId, myftConst.groupNodeName);
}

/**
 * Gets the users that are following a concept/topic as an individual
 * @param {String} licenceId -
 * @param {String} conceptId -
 * @returns {Promise} response -
 */
function getUsersFollowingConceptAsIndividual(licenceId, conceptId) {
  const params = { followType: 'individual' };
  return _getNodesFollowingConceptByKat(licenceId, conceptId, myftConst.userNodeName, params);
}

/**
 * Gets the users with EmailDigestPreferences for given licence
 * @param {String} uuid - of the licence
 * @return {Promise} response - array of user json structures
 */
function getUsersWithEmailDigestPreference(uuid) {
	const operation = 'myFTClient.getUsersWithEmailDigestPreference';
  log.debug({operation, uuid});

  return _createAndTriggerScopedRequest('GET', myftConst.licenceNodeName, uuid, myftConst.prefRelName, myftConst.prefRelId, myftConst.prefRelType, myftConst.userNodeName)
    .then(helpers.parseJsonRes)
    .then(res => {
      log.debug({operation, uuid, res: 'success'});
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
  return _addRemoveUsers('POST', myftConst.licenceNodeName, licenceUUID, userUUIDs, relationshipProperties, options);
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
  return _addRemoveUsers('DELETE', myftConst.licenceNodeName, licenceUUID, userUUIDs, undefined, options, true);
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
  return _addRemoveUsers('POST', myftConst.groupNodeName, groupUUID, userUUIDs, relationshipProperties, options);
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
  return _addRemoveUsers('DELETE', myftConst.groupNodeName, groupUUID, userUUIDs, undefined, options, true);
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
  return _addRemoveGroups('DELETE', licenceUUID, groupUUIDs, undefined, options, true);
}

/**
 * Remove group node
 * @param {String} uuid -
 * @returns {Promise} response -
 */
function removeGroup(uuid) {
  return _removeNode(myftConst.groupNodeName, uuid);
}

/**
 * Add topics for a user to follow
 * @param {String|Array} userUUID - uuid of the user
 * @param {String|Array} conceptUUIDs - uuid of the topic, or an array of topic uuids, to follow
 * @param {Object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @return {Promise} response -
**/
function addConceptsFollowedByUser(userUUID, conceptUUIDs, relationshipProperties) {
  log.debug({opertation: `addConceptsFollowedByUser🐱👮🏼`, userUUID, ConceptIds: JSON.stringify(conceptUUIDs), relProps: JSON.stringify(relationshipProperties)});
  return _addRemoveConceptsFollowed('POST', myftConst.userNodeName, userUUID, conceptUUIDs, relationshipProperties);
}

/**
 * Add topics for a user to follow
 * @param {String|Array} userUUIDs - uuid of the user
 * @param {String|Array} conceptUUIDs - uuid of the topic, or an array of topic uuids, to follow
 * @param {Object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @return {Promise} response -
**/
function addConceptsFollowedByKatUser(userUUIDs, conceptUUIDs, relationshipProperties) {
  log.debug({opertation: `🐱addConceptsFollowedByKatUser🐱`, relProps: JSON.stringify(relationshipProperties)});
  return _addRemoveKatConceptsFollowed('POST','user',userUUIDs, conceptUUIDs, relationshipProperties);
}

/**
 * Add topics for a group to follow
 * @param {String|Array} groupUUID - uuid of the user
 * @param {String|Array} conceptUUIDs - uuid of the topic, or an array of topic uuids, to follow
 * @param {Object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @return {Promise} response -
**/
function addConceptsFollowedByGroup(groupUUID, conceptUUIDs, relationshipProperties) {
  return _addRemoveConceptsFollowed('POST', myftConst.groupNodeName , groupUUID, conceptUUIDs, relationshipProperties);
}

/**
 * Remove topic follows for a group
 * @param {String} groupUUID - uuid of the user
 * @param {String|Array} conceptUUIDs - uuid of the topic, or an array of topic uuids, to follow
 * @return {Promise} response -
**/
function removeConceptsFollowedByGroup(groupUUID, conceptUUIDs) {
  return _removeConceptsFollowedByNode(myftConst.groupNodeName, groupUUID, conceptUUIDs, true);
}

/**
 * Remove topic follows for a user
 * @param {String} userUUID - uuid of the user
 * @param {String|Array} conceptUUIDs - uuid of the topic, or an array of topic uuids, to follow
 * @return {Promise} response -
**/
function removeConceptsFollowedByUser(userUUID, conceptUUIDs) {
  return _removeConceptsFollowedByNode(myftConst.userNodeName, userUUID, conceptUUIDs, true);
}

/**
 * Get user from licence
 * @param {String} licenceId -
 * @param {String} userId -
 * @returns {Promise} response -
 */
function getUserFromLicence(licenceId, userId) {
	return _getMemberFromNode(myftConst.licenceNodeName, licenceId, myftConst.userNodeName, userId);
}

/**
 * Get user from group
 * @param {String} groupId -
 * @param {String} userId -
 * @returns {Promise} response -
 */
function getUserFromGroup(groupId, userId) {
	return _getMemberFromNode(myftConst.groupNodeName, groupId, myftConst.userNodeName, userId);
}

/**
 * Get group from licence
 * @param {String} licenceId -
 * @param {String} groupId -
 * @returns {Promise} response -
 */
function getGroupFromLicence(licenceId, groupId) {
  return _getMemberFromNode(myftConst.licenceNodeName, licenceId, myftConst.groupNodeName, groupId);
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
				log.silly({operation, subOp: 'groupConceptsFollowed 👀', userId, groupId, groupConceptsCount: conceptCount});
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
  updateGroup,
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
  getUsersForGroupByPage,
  getGroupsForLicence,
  addUsersToLicence,
  removeUsersFromLicence,
  addUsersToGroup,
  removeUsersFromGroup,
  addGroupsToLicence,
  removeGroupsFromLicence,
  removeGroup,
  addConceptsFollowedByUser,
  addConceptsFollowedByGroup,
  removeConceptsFollowedByUser,
  removeConceptsFollowedByGroup,
  getUsersFollowingConcept,
  getGroupsFollowingConcept,
  getUsersFollowingConceptAsIndividual,
  syncUserFollowers,
  relationshipProperties,
  followedProperties,
  digestProperties,
  addConceptsFollowedByKatUser,
  getConceptsFollowedByKatUser
  //entityProperties
};
