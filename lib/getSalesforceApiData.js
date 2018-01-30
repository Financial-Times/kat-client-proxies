const nforce = require('nforce');
const logger = require('@financial-times/n-logger').default;

function getSalesforceApiData (contractId) {
	const org = nforce.createConnection({
		apiVersion: process.env.SALESFORCE_API_VERSION,
		autoRefresh: true,
		clientId: process.env.SALESFORCE_CLIENT_ID,
		clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
		environment: process.env.SALESFORCE_ENVIRONMENT,
		mode: process.env.SALESFORCE_CONNECTION_MODE,
		redirectUri: process.env.SALESFORCE_CALLBACK_URI
	});

	return org.authenticate({
		username: process.env.SALESFORCE_USERNAME,
		password: process.env.SALESFORCE_PASSWORD
	}).then(oauth => {
		return org.apexRest({
			uri: `${process.env.SALESFORCE_URI}/${contractId}`,
			method: 'GET',
			oauth: oauth
		});
	}).then(apexRes => {
		if (apexRes) {
			if (apexRes.success === true) {
				logger.info(`getSalesforceApiData successfully get data for ${contractId}`);
				return apexRes;
			}
		}

		logger.error({ operation: 'getSalesforceApiData', contractId }, apexRes.errorMessage);
		return apexRes;
	});
}

module.exports = {
	getSalesforceApiData
};
