'use strict';

const expect = require('chai').expect;
const mocks = require('./mocks');
const config = require('../lib/config');
const statusErrors = require('../lib/statusErrors');
const env = require('./env');
const uuids = require('./mocks/uuids');

describe('Status Error Parser', function () {

	const mockAPI = env.USE_MOCK_API;

	before(function() {
		if (mockAPI) {
			mocks.registerStatusErrors();
		}
	});
	this.timeout('3s');

	after(function() {
		if (mockAPI) {
			require('fetch-mock').restore();
		}
  });

	let baseUrl = config.myFTURL;

	describe('NotAuthorisedError', function () {

		it('Should throw an NotAuthorisedError without any headers', function(done) {
			fetch(baseUrl)
			.then(res => {
				statusErrors.parse(res);
				done(new Error('Should have thrown an exception'));
			})
			.catch(err => {
				console.log(JSON.stringify({err}));
				expect(err).to.be.an.instanceof(statusErrors.NotAuthorisedError);
				done();
			})
			.catch(err => {
				done(err);
			});
		});

		it('Should throw an NotAuthorisedError without an X-API-KEY', function(done) {
			fetch(baseUrl, config.fetchOptions)
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

		it('Should throw an NotAuthorisedError with an invalid X-API-KEY', function(done) {
			fetch(baseUrl, { headers: {'X-API-KEY': uuids.invalidKey }} )
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

		it('should not throw an NotAuthorisedError with a valid X-API-KEY', function(done) {
			const options = Object.assign({}, config.fetchOptions, { headers: Object.assign({}, config.fetchOptions.headers, {'X-API-KEY':config.myFTKey}) });
			fetch(baseUrl, options)
			.then(res => {
				try {
					statusErrors.parse(res);
					done();
				} catch (err){
					expect(err).to.not.be.an.instanceof(statusErrors.NotAuthorisedError);
					done();
				}
			})
			.catch(err => {
				done(err);
			});
		});

	});

	describe('NotFoundError', function () {

		it('Should throw an NotFoundError when something doesn\'t exist', function(done) {
			const options = Object.assign({}, config.fetchOptions, { headers: Object.assign({}, config.fetchOptions.headers, {'X-API-KEY':config.myFTKey}) });
			fetch(`${baseUrl}/doesNotExist`, options)
			.then(res => {
				statusErrors.parse(res);
				done(new Error('Should have thrown an exception'));
			})
			.catch(err => {
				expect(err).to.be.an.instanceof(statusErrors.NotFoundError);
				done();
			})
			.catch(err => {
				done(err);
			});
		});


	});
});
