'use strict';

const config = require('./helpers/config');
const logger = require('@financial-times/n-logger').default;
const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis({region : config.kinesisRegion});

function writeToKinesis(uuid, event, eventData) {
  const operation = 'kinesisClient.writeToKinesis';
  logger.info({operation, uuid, event, eventData});
  let retryCount = 0;
  const params = {
    Data: JSON.stringify({
      uuid,
      event,
      eventData
    }),
    PartitionKey: 'kat-' + Math.floor(Math.random() * 100000),
    StreamName: config.kinesisStream
  };
  const logResponse = (res) => {
    logger.info({operation, uuid, event, eventData, res: JSON.stringify(res)});
    return res;
  };
  const retryOrDie = (error) => {
    if (retryCount < config.fetchOptions.maxRetries) {
      retryCount++;
      logger.warn({operation, msg: `Retry #${retryCount}`, uuid, event});
      return kinesis.putRecord(params).promise().then(logResponse).catch(retryOrDie);
    }
    logger.error({operation, msg: `Operation FAILED after ${config.fetchOptions.maxRetries} retries`, uuid, event, error});
    throw error;
  };
  if (config.kinesisNoWrite) {
    logger.info({operation: `${operation} ignored`, uuid, event});
    return;
  }
  return kinesis.putRecord(params).promise().then(logResponse).catch(retryOrDie);
}

module.exports = {
  write: writeToKinesis
};
