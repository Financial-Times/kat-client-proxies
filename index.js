require('dotenv').config({silent: true});

module.exports = {
	accessLicenceClient: require('./lib/accessLicenceClient'),
	acquisitionCtxClient: require('./lib/acquisitionCtxClient'),
	clientErrors: require('./lib/clientErrors'),
	elasticSearchClient: require('./lib/elasticSearchClient'),
	facetsClient: require('./lib/facetsClient'),
	kinesisClient: require('./lib/kinesisClient'),
	licenceDataClient: require('./lib/licenceDataClient'),
	myFTClient: require('./lib/myFTClient'),
	sessionClient: require('./lib/sessionClient'),
	syncUserFollows: require('./lib/syncUserFollows'),
	userProfileClient: require('./lib/userProfileClient'),
};
