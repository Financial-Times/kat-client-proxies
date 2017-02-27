'use strict';

/**
 * myFT API client
 * Currently doesn't expose the underlying generic getRelationship
 */
const log = require('@financial-times/n-logger').default;
const config = require('./config');
const statusErrors = require('./statusErrors');
const querystring = require('querystring');

module.exports = {
	addLicence,
	getLicence,
	addUser,
	getUser,
	addGroup,
	getGroup,
	getEmailDigestPreference,
	setEmailDigestPreference,
	getUsersWithEmailDigestPreference,
	getConceptsFollowedByUser,
	getConceptsFollowedByGroup,
	getUsersForLicence,
	getUsersForGroup,
	getGroupsForLicence,
	addUsersToLicence,
	addGroupsToLicence,
	addUsersToGroup,
	// addConceptsFollowedByUser,
	// addConceptsFollowedByGroupx
};

const fetchOptions = Object.assign({}, config.fetchOptions, { headers: Object.assign({}, config.fetchOptions.headers, { "X-API-KEY": config.myFTKey })});

/**
 * Add a License to myFT
 * @param {uuid} uuid of the licence
 * @param {properties} additional and optional properties
 * @param {options} additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {response} the created license as a Promise
 * @throws {statusError} if something goes wrong
**/
function addLicence(uuid, properties, options) {
	return addNode('license', uuid, properties, options);
}

/**
 * Gets a License from myFT
 * @param {uuid} uuid of the licence
 * @return {response} the license as a Promise
 * @throws {statusError} if something goes wrong, e.g. NotFoundError if the licence doesn't exist
**/
function getLicence(uuid, properties) {
	return getNode('license', uuid);
}

/**
 * Add a User to myFT
 * @param {uuid} uuid of the user to add
 * @param {properties} additional and optional properties
 * @param {options} additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {response} the created User as a Promise
 * @throws {statusError} if something goes wrong
**/
function addUser(uuid, properties, options) {
	return addNode('user', uuid, properties, options);
}

/**
 * Gets a User from myFT
 * @param {uuid} uuid of the licence
 * @return {response} the User as a Promise
 * @throws {statusError} if something goes wrong, e.g. NotFoundError if the licence doesn't exist
**/
function getUser(uuid, properties) {
	return getNode('user', uuid);
}

/**
 * Add a Group to myFT
 * @param {uuid} uuid of the group to add
 * @param {properties} additional and optional properties
 * @param {options} additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {response} the created Group as a Promise
 * @throws {statusError} if something goes wrong
**/
function addGroup(uuid, properties, options) {
	return addNode('group', uuid, properties, options);
}

/**
 * Gets a Group from myFT
 * @param {uuid} uuid of the licence
 * @return {response} the Group as a Promise
 * @throws {statusError} if something goes wrong, e.g. NotFoundError it doesn't exist
**/
function getGroup(uuid, properties) {
	return getNode('group', uuid);
}

/**
 * Gets the EmailDigestPreference for a user's uuid
 * @param {uuid} of the user
 * @return {Promise} EmailDigestPreference json structure
 * @throws {statusError} if something goes wrong, e.g. NotFoundError the user doesn't exist
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
 * @param {uuid} of the user
 * @param {preference} an object representing the user's preference.
 *        at a minimum this should be type and timezone. For example:
 *        { type: "daily", timezone:"Europe/London", byTool: "KAT",
 *          byUser: "8619e7a0-65b7-446b-9931-4197b3fe0cbf"}
 * @param {options} additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @return {Promise} EmailDigestPreference json structure
 * @throws {statusError} if something goes wrong
 */
function setEmailDigestPreference(uuid, preference, options) {
	const operation = 'setEmailDigestPreferences';
	return addRelationships('user', uuid, 'preferred', 'preference', 'email-digest', preference, options)
	.then((res)=>{
		return parseJSONResponse(res, `${operation} for user ${uuid}`)
		.then ((edp)=>{
			log.debug({operation, uuid, edp});
			return edp;
		});
	});
}

/**
 * Gets the users with EmailDigestPreferences for given licence
 * @param {uuid} of the licence
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
 * @param {uuid} of the user
 * @return {Promise} array of Concepts followed
 */
function getConceptsFollowedByUser(uuid){
	return getConceptsFollowed('user', uuid);
}

/**
 * Gets the Concepts followed by a group
 * @param {uuid} of the group
 * @return {Promise} array of Concepts followed
 */
function getConceptsFollowedByGroup(uuid){
	return getConceptsFollowed('group', uuid);
}

/**
 * Gets the Groups associated with a licence
 * @param {uuid} of the licence
 * @return {Promise} array of groups
 */
function getGroupsForLicence(uuid){
	const operation ='groupsForLicence';
	return getRelationship('license', uuid, 'member', 'group').
	then((res)=>{
		return parseJSONResponse(res, `${operation} ${uuid}`)
		.then(groups => {
			log.debug({operation, uuid, conunt: groups.length, groups});
			return groups;
		});
	});
}

/**
 * Gets the Users that are registered with a licence
 * @param {uuid} of the licence
 * @return {Promise} array of users
 */
function getUsersForLicence(uuid){
	const operation = 'usersForLicence';
	return getRelationship('license', uuid, 'member', 'user').
	then(res=>{
		return parseJSONResponse(res, `${operation} ${uuid}`)
		.then (users=>{
			log.debug({operation, uuid, count:users.length, users});
			return users;
		});
	});
}

/**
 * Gets the Users who are members of a group
 * @param {uuid} of the group
 * @return {Promise} array of users
 */
function getUsersForGroup(uuid){
	const operation = 'usersForGroup';
	return getRelationship('group', uuid, 'member', 'user')
	.then (res=>{
		return parseJSONResponse(res, `{$operation} ${uuid}`)
		.then (users=>{
			log.debug({operation, uuid, count:users.length, users});
			return users;
		});
	});
}

/**
 * Gets the users who are following a specific Concept for a licence
 * @param {licenceUUID} of the Licence
 * @param {conceptUUID} of the Concept
 * @return {Promise} array of users following the Concept
 */
function getUsersFollowingConceptForLicence(licenceUUID, conceptUUID){
	const operation = 'usersFollowingConceptForLicence';
	return getScopedRelationships('license', licenceUUID, 'concept', conceptUUID, 'followed', 'user')
	.then(res => {
		return parseJSONResponse(res, `{$operation} licence: ${licenceUUID} concept: ${conceptUUID}`)
		.then (users => {
			log.debug({operation, licenceUUID, conceptUUID, count: users.length, users});
			return users;
		});
	});
}

/**
 * Gets the groups that are following a specific Concept
 * @param {licenceUUID} of the Licence
 * @param {conceptUUID} of the Concept
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
 * @param {licenceUUID} uuid of the licence
 * @param {userUUIDs} uuid of the user to add, or an arrray of user uuids
 * @param {relationshipProperties} properties to add to the 'member' relationship(s)
 * @param {options} additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
**/
function addUsersToLicence(licenceUUID, userUUIDs, relationshipProperties, options){
	return addRelationships('license', licenceUUID, 'member', 'user', userUUIDs, relationshipProperties, options);
}

/**
 * Add users to a group
 * @param {groupUUID} uuid of the licence
 * @param {userUUIDs} uuid of the user to add, or an arrray of user uuids
 * @param {options} additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @param {relationshipProperties} properties to add to the 'member' relationship(s)
**/
function addUsersToGroup(groupUUID, userUUIDs, relationshipProperties, options){
	return addRelationships('group', groupUUID, 'member', 'user', userUUIDs, relationshipProperties, options);
}

/**
 * Add groups to a licence
 * @param {licenceUUID} uuid of the licence
 * @param {groupUUIDs} uuid of the group to add, or an arrray of group uuids
 * @param {options} additional options {supressEvents: true|false, waitForPurge: true|false }
 *        default behaviour not to supress event generation and wait for a cache purge
 * @param {relationshipProperties} properties to add to the 'member' relationship(s)
**/
function addGroupsToLicence(licenceUUID, groupUUIDs, relationshipProperties, options){
	return addRelationships('licence', licenceUUID, 'member', 'group', groupUUID, relationshipProperties, options);
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

function getConceptsFollowed(node, uuid) {
	const operation = `conceptsFollowedBy${node}`;
	return getRelationships(node, uuid, 'followed', 'concept')
	.then((res)=>{
		return parseJSONResponse(res, `${operation} ${uuid}`)
		.then((concepts)=>{
			log.debug({operation, uuid, count: concepts.length, concepts});
			return concepts;
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
	const body = {uuid:relatedUUIDs, '_rel':{relationshipProperties}};
	const opts = Object.assign({}, options, body, {method:'PUT'});
	return fetch(url, opts)
	.then((res)=>{
		log.debug({operation:'addRelationships', url, options:opts, body, statis: res.status});
		return res;
	});
}

function params(options) {
	if (params === underlying) return "";
	return `?${querystring.stringify(options)}`;
}
