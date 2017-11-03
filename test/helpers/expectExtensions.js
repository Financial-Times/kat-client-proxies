'use strict';

const expect = require('chai').expect;

module.exports = {
	expectOwnProperties: (thing, properties) => {
		properties.forEach(property => {
			if (Array.isArray(thing)) {
				thing.forEach(instance => {
					expect(instance).to.have.ownProperty(property);
				});
			} else {
				expect(thing).to.have.ownProperty(property);
			}
		});
	}
};
