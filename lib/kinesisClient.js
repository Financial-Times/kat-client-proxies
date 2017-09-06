'use strict';

const config = require('./helpers/config');
const logger = require('@financial-times/n-logger').default;
const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis({region : config.KINESIS_REGION});

/**
 * Writes to Kinesis
 * @param {Array} uuids -
 * @param {String} event -
 * @param {Array} eventData -
 * @returns {Promise} result -
 */
function writeToKinesis (uuids, event, eventData) {
  const operation = 'kinesisClient.writeToKinesis';
  logger.info({operation, uuids, event});

  if (config.DONT_WRITE_TO_KINESIS === true) {
    const msg = `${operation} ignored`;
    logger.info({operation, msg, uuids, event});
    return Promise.resolve({msg});
  }

  const records = uuids.map(uuid => {
    return {
      Data: JSON.stringify({
        uuid,
        event,
        eventData
      }),
      PartitionKey: `kat-${Math.floor(Math.random() * 100000)}`
    };
  });
  const promises = [];
  const params = {
    StreamName: config.MYFT_EVENT_STREAM
  };

  let tmpCount = 0;
  while (records.length) {
    let retryCount = 0;
    const chunkNr = tmpCount;
    const chunk = records.splice(0, config.KINESIS_CHUNK_SIZE);
    const chunkData = Object.assign({}, params, { Records: chunk });

    const logResponse = (res) => {
      logger.info({operation, chunkNr, uuids: chunk, event, res: 'success'});
      return res;
    };
    const retryOrDie = (error) => {
      if (retryCount < config.fetchOptions.retry) {
        retryCount++;
        logger.warn({operation, chunkNr, msg: `Retry #${retryCount}`, uuids: chunk, event});
        return kinesis.putRecords(chunkData).promise().then(logResponse).catch(retryOrDie);
      }
      logger.error({operation, chunkNr, msg: `Operation FAILED after ${config.fetchOptions.retry} retries`, uuids: chunk, event, error: error.message});
      return null;
    };

    promises.push(kinesis.putRecords(chunkData).promise().then(logResponse).catch(retryOrDie));

    tmpCount++;
  }
  return Promise.all(promises);
}

module.exports = {
  write: writeToKinesis
};
