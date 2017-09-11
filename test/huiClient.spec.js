const proxies = require('./../index');
const hui = proxies.huiClient;
const moment = require('moment');
const expect = require('chai').expect;
const nock = require('nock');
const logger = require('@financial-times/n-logger').default;
const sinon = require('sinon');
const env = require('./helpers/env');
const mockAPI = env.USE_MOCK_API;
const baseUrl = require('./../lib/helpers/config').HUI_BASE_PATH;

describe('HUI Service Client',() => {
	const weekDateFormat = '[wk]W/GGGG';
	const monthDateFormat = '[m]M/GGGG';
	const licenceId = env.LICENCE_UUID;
	const startDate = moment('2016-12-01');
	const weekStartDate = startDate.clone().startOf('isoweek').subtract(1, 'week').format(weekDateFormat);
	const monthStartDate = startDate.clone().startOf('month').subtract(1, 'month').format(monthDateFormat);
	const endDate = moment('2017-02-01');
	const weekEndDate = endDate.format(weekDateFormat);
	const monthEndDate = endDate.format(monthDateFormat);
	const type = 'device';
	const filter = 'media player';

	let logMessageStub;
	const logMessages = [];

	before(done => {
		// Stop n-logger from making out test output look messy
		logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
			logMessages.push(params);
		});

		done();
	});

	after(done => {
		if (mockAPI) {
			nock.cleanAll();
		}

		logMessageStub.restore();

		done();
	});

	describe('getUsage()',() => {
		it('should return an empty array when given an invalid aggregation type', done => {
			const invalidAggregation = 'invalidaggregation';

			if (mockAPI) {
				nock(baseUrl)
					.get(`/licences/${licenceId}?aggregation=${invalidAggregation}&from=${weekStartDate}&to=${weekEndDate}&device=media%20player`)
					.reply(400, 'Bad Request');
			}

			hui.getUsage(licenceId, invalidAggregation, startDate, endDate, type, filter)
				.then(usageData => {
					expect(usageData).to.be.an('array');
					expect(usageData).to.be.empty;
					done();
				})
				.catch(done);
		});

		it('should get an array of page views per week when given an aggregation type of "week"', done => {
			const aggregation = 'week';

			if (mockAPI) {
				nock(baseUrl)
					.get(`/licences/${licenceId}?aggregation=${aggregation}&from=${weekStartDate}&to=${weekEndDate}&device=media%20player`)
					.reply(200, require('./mocks/fixtures/getUsageByWeek'));
			}

			hui.getUsage(licenceId, aggregation, startDate, endDate, type, filter)
				.then(usageData => {
					expect(usageData).to.be.an('array');
					expect(usageData[0]).to.be.an('object');
					expect(usageData[0]).to.have.property('Wk1/2017');
					done();
				})
				.catch(done);
		});

		it('should get an array of page views per month when given an aggregation type of "month"', done => {
			const aggregation = 'month';

			if (mockAPI) {
				nock(baseUrl)
					.get(`/licences/${licenceId}?aggregation=${aggregation}&from=${monthStartDate}&to=${monthEndDate}&device=media%20player`)
					.reply(200, require('./mocks/fixtures/getUsageByMonth'));
			}

			hui.getUsage(licenceId, aggregation, startDate, endDate, type, filter)
				.then(usageData => {
					expect(usageData).to.be.an('array');
					expect(usageData[0]).to.be.an('object');
					expect(usageData[0]).to.have.property('M1/2017');
					done();
				})
				.catch(done);
		});
	});
});
