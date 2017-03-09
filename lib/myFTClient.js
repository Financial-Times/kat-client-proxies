/*global Buffer*/
'use strict';

/**
 * myFT API client
 * Abstraction over the myFT API (v3)
 * Currently doesn't expose the underlying generic functions like getRelationship
 */
const fetch = require('fetch-retry-or-die');
const log = require('@financial-times/n-logger').default;
const config = require('./config');
const statusErrors = require('./statusErrors');
const querystring = require('querystring');

const membershipProperties = {
	byTool: config.toolIdentifier,
	byUser: config.defaultAdminId
};

const followedProperties = {
	byTool: config.toolIdentifier,
	byUser: config.defaultAdminId
};

const entityProperties = {};
entityProperties[config.toolDateIdentifier] = new Date().toISOString();

module.exports = {
	addLicence,
	getLicence,
	getUser,
	getGroup,
	getEmailDigestPreference,
	setEmailDigestPreference,
	getUsersWithEmailDigestPreference,
	getConceptsFollowedByUser,
	getConceptsFollowedByGroup,
	getUsersForLicence,
	getUsersForGroup,
	getGroupsForLicence,
	addUser,
	addGroup,
	addUsersToLicence,
	addGroupsToLicence,
	addUsersToGroup,
	setSubscribers,
	addConceptsFollowedByUser,
	addConceptsFollowedByGroup,
	removeConceptsFollowedByUser,
	removeConceptsFollowedByGroup,
	getUsersFollowingConceptForLicence,
	getGroupsFollowingConceptForLicence,
	membershipProperties,
	followedProperties,
	entityProperties
};

const fetchOptions = Object.assign({}, config.fetchOptions, { headers: Object.assign({}, config.fetchOptions.headers, { "X-API-KEY": config.myFTKey })});

/**
 * Add a License to myFT
 * @param {uuid} uuid of the licence
 * @param {object} properties - additional and optional properties
 * @param {object} options - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {response} the created license as a Promise
 * @throws {error} statusError - if something goes wrong
**/
function addLicence(uuid, properties, options) {
	return addNode('license', uuid, properties, options);
}

/**
 * Gets a License from myFT
 * @param {string} uuid of the licence
 * @return {Promise} of the license
 * @throws {error} statusError - if something goes wrong, e.g. NotFoundError if the licence doesn't exist
**/
function getLicence(uuid) {
	return getNode('license', uuid);
}

/**
 * Add a User to myFT
 * @param {uuid} uuid of the user to add
 * @param {object} properties - additional and optional properties
 * @param {object} options - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {response} the created User as a Promise
 * @throws {error} statusError - if something goes wrong
**/
function addUser(uuid, properties, options) {
	return addNode('user', uuid, properties, options);
}

/**
 * Gets a User from myFT
 * @param {uuid} uuid of the licence
 * @return {response} the User as a Promise
 * @throws {error} statusError - if something goes wrong, e.g. NotFoundError if the licence doesn't exist
**/
function getUser(uuid) {
	return getNode('user', uuid);
}

/**
 * Add a Group to myFT
 * @param {uuid} uuid of the group to add
 * @param {object} properties - additional and optional properties
 * @param {object} options - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {response} the created Group as a Promise
 * @throws {error} statusError - if something goes wrong
**/
function addGroup(uuid, properties, options) {
	return addNode('group', uuid, properties, options);
}

/**
 * Gets a Group from myFT
 * @param {uuid} uuid of the licence
 * @return {response} the Group as a Promise
 * @throws {error} statusError - if something goes wrong, e.g. NotFoundError it doesn't exist
**/
function getGroup(uuid) {
	return getNode('group', uuid);
}

/**
 * Gets the EmailDigestPreference for a user's uuid
 * @param {string} uuid - of the user
 * @return {Promise} EmailDigestPreference json structure
 * @throws {error} statusError - if something goes wrong, e.g. NotFoundError the user doesn't exist
 */
function getEmailDigestPreference(uuid) {
	const operation = 'emailDigestPreferences';
	return getRelationship('user', uuid, 'preferred', 'preference', 'email-digest')
		.then((res)=>{
			return parseJSONResponse(res, `${operation} for user ${uuid}`)
				.then ((edp)=>{
					log.debug({operation, uuid, edp});
					return edp;
				});
		});
}

/**
 * Sets a User's EmailDigestPreference for a given uuid
 * @param {string} uuid - of the user
 * @param {object} preference - an object representing the user's preference.
 *        at a minimum this should be type and timezone. For example:
 *        { type: "daily", timezone:"Europe/London", byTool: "KAT",
 *          byUser: "8619e7a0-65b7-446b-9931-4197b3fe0cbf"}
 * @param {object} options - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} EmailDigestPreference json structure
 * @throws {error} statusError - if something goes wrong
 */
function setEmailDigestPreference(uuid, preference, options) {
	const operation = 'setEmailDigestPreferences';
	return addRelationships('user', uuid, 'preferred', 'preference', 'email-digest', preference, options)
		.then((res)=>{
			return parseJSONResponse(res, `${operation} for user ${uuid}`)
				.then ((edp)=>{
					log.debug({operation, uuid, edp:JSON.stringify(preference)});
					return edp;
				});
		});
}

/**
 * Gets the users with EmailDigestPreferences for given licence
 * @param {string} uuid - of the licence
 * @return {Promise} array of user json structures
 */
function getUsersWithEmailDigestPreference(uuid) {
	const operation = 'usersWithEmailDigestPreferences';
	return getScopedRelationships('license', uuid, 'preference', 'email-digest', 'preferred', 'user')
		.then((res)=>{
			return parseJSONResponse(res, `${operation} for licence ${uuid}`)
				.then ((users)=>{
					log.debug({operation, uuid, count: users.length, users});
					return users;
				});
		});
}

/**
 * Gets the Concepts followed by a user
 * @param {string} uuid - of the user
 * @return {Promise} array of Concepts followed
 */
function getConceptsFollowedByUser(uuid){
	return getAllNodeItems(uuid, "user", 'followed', 'concept');
}

/**
 * Gets the Concepts followed by a group
 * @param {string} uuid - of the group
 * @return {Promise} array of Concepts followed
 */
function getConceptsFollowedByGroup(uuid){
	return getAllNodeItems(uuid, "group", 'followed', 'concept');
}

/**
 * Gets the Groups associated with a licence
 * @param {string} uuid - of the licence
 * @return {Promise} array of groups
 */
function getGroupsForLicence(uuid){
	const operation ='groupsForLicence';
	return getRelationship('license', uuid, 'member', 'group')
		.then((res)=>{
			return parseJSONResponse(res, `${operation} ${uuid}`)
				.then(groups => {
					log.debug({operation, uuid, count: groups.count});
					return groups;
				});
		});
}

/**
 * Gets the Users that are registered with a licence
 * @param {string} uuid - of the licence
 * @return {Promise} array of users
 */
function getUsersForLicence(uuid){
	return getAllNodeItems(uuid, "license", "member", "user");
}

function getAllNodeItems(uuid, node, relationship, relatedNode){
	const operation = `nodeItemsFor${node}`;
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
				return doRelationshipRequest("GET", node, uuid, relationship, relatedNode, params).then(thenFn);
			}
		}

		log.debug({operation, uuid, count: allItems.length});

		// return all the items
		return allItems;
	};

	return doRelationshipRequest("GET", node, uuid, relationship, relatedNode, params).then(thenFn);
}

/**
 * Gets the Users who are members of a group
 * @param {string} uuid - of the group
 * @return {Promise} array of users
 */
function getUsersForGroup(uuid){
	return getAllNodeItems(uuid, "group", "member", "user");
}

/**
 * Gets the users who are following a specific Concept for a licence
 * @param {string} licenceUUID - of the Licence
 * @param {string} conceptUUID - of the Concept
 * @return {Promise} array of users following the Concept
 */
function getUsersFollowingConceptForLicence(licenceUUID, conceptUUID){
	const operation = 'usersFollowingConceptForLicence';
	return getScopedRelationships('license', licenceUUID, 'concept', conceptUUID, 'followed', 'user')
		.then(res => {
			return parseJSONResponse(res, `{$operation} licence: ${licenceUUID} concept: ${conceptUUID}`)
				.then (users => {
					log.debug({operation, licenceUUID, conceptUUID, count: users.count});
					return users;
				});
		});
}

/**
 * Gets the groups that are following a specific Concept
 * @param {string} licenceUUID - of the Licence
 * @param {string} conceptUUID - of the Concept
 * @return {Promise} array of groups following the Concept
 */
function getGroupsFollowingConceptForLicence(licenceUUID, conceptUUID){
	const operation = 'groupsFollowingConceptForLicence';
	return getScopedRelationships('license', licenceUUID, 'concept', conceptUUID, 'followed', 'group')
		.then(res=>{
			return parseJSONResponse(res, `${operation} licence: ${licenceUUID} concept: ${conceptUUID}`)
				.then (groups => {
					log.debug({operation, licenceUUID, conceptUUID, count: groups.count, groups});
					return groups;
				});
		});
}

/**
 * Add users to a licence
 * @param {string} licenceUUID - uuid of the licence
 * @param {string} userUUIDs - uuid of the user to add, or an arrray of user uuids
 * @param {object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @param {object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} users
**/
function addUsersToLicence(licenceUUID, userUUIDs, relationshipProperties, options){
	const operation = 'addUsersToLicence';
	return addRelationships('license', licenceUUID, 'member', 'user', userUUIDs, relationshipProperties, options)
		.then(res=>{
			return parseJSONResponse(res, `${operation} licence: ${licenceUUID} users: ${userUUIDs}`)
				.then (users => {
					log.debug({operation, licenceUUID, users});
					return users;
				});
		});
}

/**
 * Add users to a group
 * @param {string} groupUUID - uuid of the licence
 * @param {string|object} userUUIDs - uuid of the user to add, or an array of user uuids
 * @param {object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @param {object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} users
**/
function addUsersToGroup(groupUUID, userUUIDs, relationshipProperties, options){
	const operation = 'addUsersToGroup';
	return addRelationships('group', groupUUID, 'member', 'user', userUUIDs, relationshipProperties, options)
		.then(res=>{
			return parseJSONResponse(res, `${operation} licence: ${groupUUID} users: ${userUUIDs}`)
				.then (users => {
					log.debug({operation, groupUUID, users});
					return users;
				});
		});
}

/**
 * Add groups to a licence
 * @param {string} licenceUUID - uuid of the licence
 * @param {string|object} groupUUIDs - uuid of the group to add, or an arrray of group uuids
 * @param {object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @param {object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} groups
**/
function addGroupsToLicence(licenceUUID, groupUUIDs, relationshipProperties, options){
	const operation = 'addGroupsToLicence';
	return addRelationships('licence', licenceUUID, 'member', 'group', groupUUIDs, relationshipProperties, options)
		.then(res=>{
			return parseJSONResponse(res, `${operation} licence: ${licenceUUID} groups: ${groupUUIDs}`)
				.then (groups => {
					log.debug({operation, licenceUUID, groupUUIDs, groups});
					return groups;
				});
		});
}

/**
 * Add topics for a user to follow
 * @param {userUUID} userUUID - uuid of the user
 * @param {string|object} conceptUUIDs - uuid of the topic, or an arrray of topic uuids, to follow
 * @param {object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @param {object} [options] - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} concepts
**/
function addConceptsFollowedByUser(userUUID, conceptUUIDs, relationshipProperties, options){
	const operation = 'addConceptsFollowedByUser';
	return addRelationships('user', userUUID, 'followed', 'concept', conceptUUIDs, relationshipProperties, options)
		.then(res=>{
			return parseJSONResponse(res, `${operation} user: ${userUUID} concept: ${conceptUUIDs}`)
				.then (concepts => {
					log.debug({operation, userUUID, conceptUUIDs, concepts});
					return concepts;
				});
		});
}

/**
 * Add topics for a group to follow
 * @param {string} groupUUID - uuid of the user
 * @param {string|object} conceptUUIDs - uuid of the topic, or an arrray of topic uuids, to follow
 * @param {object} relationshipProperties - properties to add to the 'member' relationship(s)
 * @param {object} options - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} concepts
**/
function addConceptsFollowedByGroup(groupUUID, conceptUUIDs, relationshipProperties, options){
	log.silly({operation:'addConceptsFollowedByGroup', group:groupUUID, concepts: conceptUUIDs, relationshipProperties});
	const operation = 'addConceptsFollowedByGroup';
	return addRelationships('group', groupUUID, 'followed', 'concept', conceptUUIDs, relationshipProperties, options)
		.then(res=>{
			return parseJSONResponse(res, `${operation} group: ${groupUUID} concept: ${conceptUUIDs}`)
			.then (concepts => {
					log.debug({operation, groupUUID, concepts:conceptUUIDs});
					return concepts;
				});
		});
}


/**
 * Remove topics for a group to follow
 * @param {string} groupUUID - uuid of the user
 * @param {string|object} conceptUUIDs - uuid of the topic, or an arrray of topic uuids, to follow
 * @param {object} options - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} concepts
**/
function removeConceptsFollowedByGroup(groupUUID, conceptUUIDs, options){
	log.silly({operation:'removeConceptsFollowedByGroup',group:groupUUID, concepts: conceptUUIDs});
	const operation = 'removeConceptsFollowedByGroup';
	return removeRelationships('group', groupUUID, 'followed', 'concept', conceptUUIDs, options)
		.then(res=>{
			return parseJSONResponse(res, `${operation} group: ${groupUUID} concept: ${conceptUUIDs}`)
				.then (concepts => {
					log.debug({operation, groupUUID, conceptUUIDs, concepts});
					return concepts;
				});
		});
}

/**
 * Add topics for a user to follow
 * @param {string} userUUID - uuid of the user
 * @param {string|object} conceptUUIDs - uuid of the topic, or an arrray of topic uuids, to follow
 * @param {object} options - additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} concepts
**/
function removeConceptsFollowedByUser(userUUID, conceptUUIDs, options){
	const operation = 'removeConceptsFollowedByUser';
	return removeRelationships('user', userUUID, 'followed', 'concept', conceptUUIDs, options)
		.then(res=>{
			return parseJSONResponse(res, `${operation} user: ${userUUID} concept: ${conceptUUIDs}`)
				.then (concepts => {
					log.debug({operation, userUUID, conceptUUIDs, concepts});
					return concepts;
				});
		});
}


/**
 * Consider the following "bellow the fold"
 *
 **/

function parseJSONResponse(res, customErrorMessage){
	statusErrors.parse(res, customErrorMessage);
	return res.json();
}

function addNode(node, uuid, properties, options) {
	const operation = `add${node} ${uuid}`;
	const url = `${config.myFTURL}/${node}/${uuid}${params(options)}`;
	const body = Object.assign({uuid}, properties);
	const opts = Object.assign({}, fetchOptions, body, {method:'PUT'});
	return fetch(url, opts)
		.then(res=>{
			return parseJSONResponse(res)
				.then(json => {
					log.debug({operation, body, json});
					return json;
				});
		});
}

function getNode(node, uuid) {
	const operation = `get${node}`;
	const url = `${config.myFTURL}/${node}/${uuid}`;
	return fetch(url, fetchOptions)
		.then(res=>{
			return parseJSONResponse(res)
				.then(json => {
					log.debug({operation, uuid, json});
					return json;
				});
		});
}

function getRelationships(node, uuid, relationship, relatedNode){
	return getRelationship(node, uuid, relationship, relatedNode);
}

function getRelationship(node, uuid, relationship, relatedNode, relatedUUID){
	const url = `${config.myFTURL}/${node}/${uuid}/${relationship}/${relatedNode}${relatedUUID===undefined?'': `/${relatedUUID}`}`;
	return fetch(url, fetchOptions)
		.then((res)=>{
			log.debug({operation:'getRelationship', url, status: res.status});
			return res;
		});
}

function getScopedRelationships(scopedNode, scopedUUUID, node, uuid, relationship, relatedNode){
	const url = `${config.myFTURL}/${scopedNode}/${scopedUUUID}/${node}/${uuid}/${relationship}/${relatedNode}`;
	return fetch(url, fetchOptions)
		.then((res)=>{
			log.debug({operation:'getScopedRelationships', url, status: res.status});
			return res;
		});
}

function addRelationships(node, nodeUUID, relationship, relatedType, relatedUUIDs, relationshipProperties, options){
	const url = `${config.myFTURL}/${node}/${nodeUUID}/${relationship}/${relatedType}${params(options)}`;
	const body = Object.assign({}, {uuid:relatedUUIDs}, {'_rel':relationshipProperties});
	console.log(`\n******\nbody:JSON.stringify(body) {body:${JSON.stringify(body)}}\n******\n`);
	console.log(`\n******\relatedUUIDs:JSON.stringify(relatedUUIDs) {relatedUUIDs:${JSON.stringify(relatedUUIDs)}}\n******\n`);
	const opts = Object.assign({}, fetchOptions, {body:JSON.stringify(body)}, {method:'POST'});
	log.debug({operation:'addRelationships', url, opts:JSON.stringify(opts)});
	return fetch(url, opts)
		.then((res)=>{
			log.debug({operation:'addRelationships', url, status: res.status});
			return res;
		});
}

function removeRelationships(node, nodeUUID, relationship, relatedType, relatedUUIDs, options){
	const url = `${config.myFTURL}/${node}/${nodeUUID}/${relationship}/${relatedType}${params(options)}`;
	const body = Object.assign({}, {uuid:relatedUUIDs});
	const opts = Object.assign({}, fetchOptions, {body:JSON.stringify(body)}, {method:'DELETE'});
	log.debug({operation:'removeRelationships', url, opts:JSON.stringify(opts)});
	return fetch(url, opts)
		.then((res)=>{
			log.debug({operation:'removeRelationships', url, status: res.status});
			return res;
		});
}

function params(options) {
	if (options === undefined || options === null || options === {}){
		return '';
	}
	return `?${querystring.stringify(options)}`;
}

function setSubscribers(userId, newConceptsToFollow, followProps) {
	const params = {
		noEvent: config.myFtNoEvent,
		waitForPurge: config.myFtWaitForPurgeAdd
	};
	const data = {
		ids: [userId],
		subjects: newConceptsToFollow.map(item => Object.assign({}, item, {_rel: followProps}))
	};
	return doRelationshipRequest("POST", "user", undefined, "followed", "concept", data, params);
}

function doRelationshipRequest(method, type, id, relationship, relatedType, data, params) {
	log.debug({operation: 'doRelationshipRequest', method, type, id, relationship, relatedType});

	let queryString = '';
	let theUrl = `${config.myFTURL}/${type}`;
	const options = Object.assign({}, fetchOptions, { method: method });

	if (id !== undefined) {
		theUrl += `/${id}`;
	}
	if (relationship !== undefined) {
		theUrl += `/${relationship}`;
	}
	if (relatedType !== undefined) {
		theUrl += `/${relatedType}`;
	}

	Object.keys(params || {}).forEach(function (key) {
		queryString += `${queryString === "" ? "?" : "&"}${key}=${params[key]}`;
	});

	if (method !== "GET") {

		// fiddle content length header to appease Fastly
		if(process && process.env.NODE_ENV === 'production') {
			// Fastly requires that empty requests have an empty object for a body and local API requires that they don't
			options.body = JSON.stringify(data || {});

			fetchOptions.headers['Content-Length'] = Buffer.byteLength(options.body);

		} else {
			options.body = data ? JSON.stringify(data) : null;
		}
	} else {

		if(process && process.env.NODE_ENV === 'production') {
			fetchOptions.headers['Content-Length'] = 0;
		}

		Object.keys(data || {}).forEach(function (key) {
			queryString += `${queryString === "" ? "?" : "&"}${key}=${data[key]}`;
		});
	}

	theUrl += queryString;

	log.debug({operation: 'doRelationshipRequest', theUrl});

	return fetch(theUrl, options)
		.then((res)=>{
			log.debug({operation: 'doRelationshipRequest', method, type, id, relationship, relatedType});
			return parseJSONResponse(res);
		});
}