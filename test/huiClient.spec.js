const proxies = require('./../index');
const hui = proxies.huiClient;
const moment = require('moment');
const expect = require('chai').expect;
const nock = require('nock');
const env = require('./helpers/env');
const mockAPI = env.USE_MOCK_API;
const baseUrl = require('./../lib/helpers/config').HUI_API_URL;

describe('HUI Service Client',() => {
	const weekDateFormat = '[wk]W/GGGG';
	const monthDateFormat = '[m]M/GGGG';
	const licenceId = '8eb26ed7-68c8-44c6-b6ce-52d61500f301';
	const startDate = moment('2016-12-01');
	const weekStartDate = startDate.format(weekDateFormat);
	const monthStartDate = startDate.format(monthDateFormat);
	const endDate = moment('2017-02-01');
	const weekEndDate = endDate.format(weekDateFormat);
	const monthEndDate = endDate.format(monthDateFormat);
	const type = '';
	const filter = '';

	after(done => {
		if (mockAPI) {
			nock.cleanAll();
		}

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
					expect(usageData).to.be.empty();
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
