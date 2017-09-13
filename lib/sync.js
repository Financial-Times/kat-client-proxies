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
const myFTClient = require('./myFTClient');
const kinesis = require('./kinesisClient');
const helpers = require('./helpers/helpers');
const Promise = require('bluebird');

const myftConst = config.myftClientConstants;

const relationshipProperties = {
	byTool: config.FT_TOOL_ID,
	byUser: config.FT_TOOL_ADMIN_ID
};

const followedProperties = Object.assign({}, relationshipProperties);
const digestProperties = Object.assign({'type': 'daily', 'timezone': 'Europe/London'}, relationshipProperties);

//const entityProperties = {};// TODO: WIP
//entityProperties[config.FT_TOOL_DATE_ID] = new Date().toISOString();

const fetchOptions = Object.assign({}, config.fetchOptions);
fetchOptions.headers = Object.assign({}, fetchOptions.headers, {'X-API-KEY': config.MYFT_API_KEY});


/**
 * Sync user followers
 * @param {String} groupId -
 * @param {String} userId -
 * @returns {Promise} response -
 */
function userFollowers (groupId, userId) {
	const operation = 'myFTClient.syncUserFollowers';
	return myFTClient.getConceptsFollowedByGroup(groupId)
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
			const msg = 'Group groupConcepts is not an array';
			log.error({operation, groupConcepts, status: msg});
			throw new Error(msg);
		})
		.then(groupConcepts => {
			const conceptCount = groupConcepts.length;
			if (conceptCount > 0) {
				log.silly({operation, subOp: 'groupConceptsFollowed', userId, groupId, groupConceptsCount: conceptCount});
				// get the concepts (topics) followed by the user
				return myFTClient.getConceptsFollowedByKatUser(userId)
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
							return myFTClient.addConceptsFollowedByKatUser(userId, newConceptsToFollow, followProps)
								.then(() => {
									//TODO not sure if this is needed here now?
									log.silly({operation, subOp: 'setEmailDigestPreference', userId});
									return myFTClient.getEmailDigestPreference(userId)
										.catch(err => {
											// if no preferences are found
											if (err instanceof clientErrors.NotFoundError) {
												return myFTClient.setEmailDigestPreference(userId, digestProperties);
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
									//TODO uodate so only passes conceptIds here
									log.silly({operation, subOp: 'kinesis.write', userId});
									return kinesis.write(userId, 'subscribe', cleanConcepts);
								})
								.then(()=> ({user: {uuid: userId, status: 'synchronisationCompleted', group: groupId, newConceptsToFollow}}));
						}
						const msg = 'User conceptsResp is not an array';
						log.error({operation, conceptsResp, status: msg});
						throw new Error(msg);
					});

			}
			log.silly({operation, subOp: 'noGroupConceptsToFollow', userId, groupId});
			return {user: {uuid: userId, group: groupId, status: 'synchronisationIgnored', reason: 'noGroupConceptsToFollow'}};
		});
}

module.exports = {userFollowers};
