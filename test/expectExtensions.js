'use strict';

const expect = require("chai").expect;

function expectOwnProperties(thing, properties) {
	properties.forEach(property=>{
		if (thing instanceof Array){
			thing.forEach((instance)=>{
				expect(instance).to.have.ownProperty(property);
			});
		} else {
			expect(thing).to.have.ownProperty(property);
		}
	});
}

module.exports = {
	expectOwnProperties
};
