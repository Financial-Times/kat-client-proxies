'use-strict';

const expect = require("chai").expect;
const mocks = require('./mocks');
const config = require('../lib/config');
const statusErrors = require('../lib/statusErrors');
const env = require('./env');

describe('Status Error Parser', function () {

	this.timeout('3s');

	mocks.registerstatusErrors();

	it('Should throw an NotAuthorisedError without an X-API-KEY', (done) => {
		fetch(env.FT_API_URL)
		.then(res => {
			statusErrors.parse(res);
			done(new Error('Should have thrown an exception'));
		})
		.then((res)=>{
			done(new Error('Should have thrown an exception'));
		})
		.catch(err => {
			expect(err).to.be.an.instanceof(statusErrors.NotAuthorisedError);
			done();
		});
	});


});
