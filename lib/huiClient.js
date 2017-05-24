const log = require('@financial-times/n-logger').default;

const huiBasePath = process.env.HUI_BASE_PATH;
const licencePath = '/licences/';
const options = {
  method: 'GET',
  headers: {
    'X-Api-Key': process.env.HUI_API_KEY
  }
};

function getUsage(licenceId, aggregation, startDate, endDate, type = '', filter = '') {
  let start = '';
  let end = '';
  let url = `${huiBasePath}${licencePath}${licenceId}?aggregation=${aggregation}`;

  // Get the prev week/month data too. We make a clone of the start date because
  // moments are mutable.
  const adjustedStartDate = startDate.clone().startOf(aggregation === 'week' ? 'isoweek' : aggregation).subtract(1, aggregation);

  const dateFormat = aggregation === 'week' ? '[wk]W/GGGG' : '[m]M/GGGG';
  start = adjustedStartDate.format(dateFormat);
  end = endDate.format(dateFormat);

  // adding 'from' and 'to' query params to the URL
  if (start && end) {
    url += `&from=${start}&to=${end}`;
  }

  // adding type (device || platform) query param to the URL
  if (type !== '') {
    url += `&${type}=${encodeURIComponent(filter)}`;
  }

  log.debug({operation: 'getUsage', licenceId, aggregation, start, end, url});

  return fetch(url, options)
    .then((data) => data.json())
    .then((data) => data['pageViews'])
    .catch(err => {
      log.error({operation: 'getUsage', licenceId, aggregation, start, end, url, err});

      return [];
    });
}

module.exports = { getUsage };
