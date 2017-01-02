'use strict';

/**
 * myFT API client
 * Currently doesn't expose the underlying generic getRelationship
 */

// Problem using fetch-retry-or-die since it doesn't declare a global fetch
//const fetch = require('fetch-retry-or-die');
require('isomorphic-fetch');
const log = require('@financial-times/n-logger').default;
const config = require('./config');
const errors = require('./errors');

module.exports = {
	getEmailDigestPreference,
	getUsersWithEmailDigestPreference,
	getConceptsFollowedByUser,
	getConceptsFollowedByGroup,
	// setEmailDigestPreference,
	// setConceptsFollowedByUser
	// setConceptsFollowedByUser
};

const myFTOptions = Object.apply(config.options, { headers: { "X-API-KEY": config.myFTKey }});

/**
 * Gets the EmailDigestPreference for a user's uuid
 * @param {uuid} of the user
 * @return {Promise} EmailDigestPreference json structure
 */
function getEmailDigestPreference(uuid) {
	const options = Object.assign({}, myFTOptions);
	return getRelationship('user', uuid, 'preferred', 'preference', 'email-digest')
	.then((res)=>{
		errors.handleStatusError(res, `EmailDigestPreferences for user ${uuid}`);
		return res.json().
		then ((edp)=>{
			log.debug({operation:'getEmailDigestPreference', uuid, edp});
			return edp;
		});
	});
}

/**
 * Gets the EmailDigestPreferences for all user of a licence
 * @param {uuid} of the licence
 * @return {Promise} array of user json structures
 */
function getUsersWithEmailDigestPreference(uuid) {

	const options = Object.assign({}, myFTOptions);
	return getScopedRelationships('license', uuid, 'preference', 'email-digest', 'preferred', 'user')
	.then((res)=>{
		errors.handleStatusError(res, `usersWithEmailDigestPreferences for licence ${uuid}`);
		return res.json()
		.then ((users)=>{
			log.debug({operation:'usersWithEmailDigestPreferences', uuid, users});
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
 * Gets the users who are following a specific Concept
 * @param {uuid} of the Concept
 * @return {Promise} array of users following the Concept
 */
function getUsersFollowingConceptForLicence(licenceUuid, conceptUuid){
	return getScopedRelationships('license', licenceUuid, 'concept', conceptUuid, 'followed', 'user');
}

/**
 * Gets the groups that are following a specific Concept
 * @param {uuid} of the Concept
 * @return {Promise} array of groups following the Concept
 */
function getGroupsFollowingConceptForLicence(licenceUuid, conceptUuid){
	return getScopedRelationships('license', licenceUuid, 'concept', conceptUuid, 'followed', 'group');
}


function getConceptsFollowed(node, uuid) {
	return getRelationships(node, uuid, 'followed', 'concept')
	.then(res=>{
		errors.handleStatusError(res.status);
		return res.json();
	});
}

function getRelationships(node, uuid, relationship, relatedNode){
	return getRelationship(node, uuid, relationship, relatedNode);
}

function getRelationship(node, uuid, relationship, relatedNode, relatedUuid){
	const url = `${config.myFTURL}/${node}/${uuid}/${relationship}/${relatedNode}${relatedUuid===undefined?'': `/${relatedUuid}`}`;
	const options = Object.assign({}, myFTOptions);
	return fetch(url, options)
	.then((res)=>{
		log.debug({operation:'getRelationship', url, status: res.status});
		return res;
	});
}

function getScopedRelationships(scopedNode, scopedUuid, node, uuid, relationship, relatedNode){
	const url = `${config.myFTURL}/${scopedNode}/${scopedUuid}/${node}/${uuid}/${relationship}/${relatedNode}`;
	const options = Object.assign({}, myFTOptions);
	return fetch(url, options)
	.then((res)=>{
		log.debug({operation:'getScopedRelationships', url, status: res.status});
		return res;
	});
}
