'use strict';

const expect = require('chai').expect;
const mocks = require('./mocks');
const config = require('./../lib/helpers/config');
const clientErrors = require('./../lib/clientErrors');
const env = require('./env');
const uuids = require('./mocks/uuids');

describe('Status Error Parser', function () {

	const mockAPI = env.USE_MOCK_API;

	before(function() {
		if (mockAPI) {
			mocks.registerClientErrors();
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
        clientErrors.parse(res);
				done(new Error('Should have thrown an exception'));
			})
			.catch(err => {
				// console.log(JSON.stringify({err}));
				expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);
				done();
			})
			.catch(err => {
				done(err);
			});
		});

		it('Should throw an NotAuthorisedError without an X-API-KEY', function(done) {
			fetch(baseUrl, config.fetchOptions)
			.then(res => {
        clientErrors.parse(res);
				done(new Error('Should have thrown an exception'));
			})
			.then((res)=>{
				done(new Error('Should have thrown an exception'));
			})
			.catch(err => {
				expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);
				done();
			})
			.catch(err => {
				done(err);
			});
		});

		it('Should throw an NotAuthorisedError with an invalid X-API-KEY', function(done) {
			fetch(baseUrl, { headers: {'X-API-KEY': uuids.invalidKey }} )
			.then(res => {
        clientErrors.parse(res);
				done(new Error('Should have thrown an exception'));
			})
			.then((res)=>{
				done(new Error('Should have thrown an exception'));
			})
			.catch(err => {
				expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);
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
          clientErrors.parse(res);
					done();
				} catch (err){
					expect(err).to.not.be.an.instanceof(clientErrors.NotAuthorisedError);
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
        clientErrors.parse(res);
				done(new Error('Should have thrown an exception'));
			})
			.catch(err => {
				expect(err).to.be.an.instanceof(clientErrors.NotFoundError);
				done();
			})
			.catch(err => {
				done(err);
			});
		});


	});
});
