const uuids = require('./../uuids');

module.exports = {
	'user': {
		'uuid': uuids.validUser,
		'status': 'synchronisationCompleted',
		'group': uuids.validLicence,
		'newConceptsToFollow': [
			'00000000-0000-0000-0000-000000000007',
			'00000000-0000-0000-0000-000000000002'
		]
	}
};
