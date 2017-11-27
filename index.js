require('dotenv').config({silent: true});

module.exports = {
	acquisitionCtxClient: require('./lib/acquisitionCtxClient'),
	clientErrors: require('./lib/clientErrors'),
	elasticSearchClient: require('./lib/elasticSearchClient'),
	facetsClient: require('./lib/facetsClient'),
	huiClient: require('./lib/huiClient'),
	kinesisClient: require('./lib/kinesisClient'),
	licenceDataClient: require('./lib/licenceDataClient'),
	myFTClient: require('./lib/myFTClient'),
	sessionClient: require('./lib/sessionClient'),
	syncUserFollows: require('./lib/syncUserFollows'),
	userProfileClient: require('./lib/userProfileClient'),
	accessLicenceClient: require('./lib/accessLicenceClient')
};
