'use-strict';

const expect = require("chai").expect;
const mocks = require('./mocks');
const config = require('../lib/config');
const statusErrors = require('../lib/statusErrors');
const env = require('./env');
const uuids = require('./mocks/uuids');

describe('Status Error Parser', function () {

	this.timeout('3s');

	mocks.registerstatusErrors();

	it('Should throw an NotAuthorisedError without any headers', (done) => {
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
		})
		.catch(err => {
			done(err);
		});
	});

	it('Should throw an NotAuthorisedError without an X-API-KEY', (done) => {
		fetch(env.FT_API_URL, config.fetchOptions)
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
		})
		.catch(err => {
			done(err);
		});
	});

	it('Should throw an NotAuthorisedError with an invalid X-API-KEY', (done) => {
		fetch(env.FT_API_URL, { headers: {'X-API-KEY': uuids.invalidKey }} )
		.then(res => {
			return statusErrors.parse(res);
			done(new Error('Should have thrown an exception'));
		})
		.then((res)=>{
			done(new Error('Should have thrown an exception'));
		})
		.catch(err => {
			expect(err).to.be.an.instanceof(statusErrors.NotAuthorisedError);
			done();
		})
		.catch(err => {
			done(err);
		});
	});


	it('Should not throw an NotAuthorisedError with a valid X-API-KEY', (done) => {
		const options = Object.assign({}, config.fetchOptions, { headers: Object.assign({}, config.fetchOptions.headers, {'X-API-KEY':uuids.validKey}) });
		fetch(env.FT_API_URL, options)
		.then(res => {
			statusErrors.parse(res);
			done();
		})
		.catch(err => {
			done(err);
		});
	});


});