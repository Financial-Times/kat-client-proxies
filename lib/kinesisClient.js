'use strict';

const config = {
    kinesis: {
        region: process.env.KINESIS_REGION || 'eu-west-1'
    },
    stream: {
        name: process.env.MYFT_EVENT_STREAM || 'ft-b2b-kmt_myft_events',
        shards: 1,
        waitBetweenDescribeCallsInSeconds: 5
    }
};

const logger = require('@financial-times/n-logger').default;
const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis({region : config.kinesis.region});
const maxRetries = process.env.MAX_RETRIES || 5;
const dontWrite = process.env.DONT_WRITE_TO_KINESIS === 'true';

module.exports = {
    write: writeToKinesis
};

function writeToKinesis(uuid, event, eventData) {
    let retryCount = 0;
    const params = {
        Data: JSON.stringify({
            uuid,
            event,
            eventData
        }),
        PartitionKey: 'kat-' + Math.floor(Math.random() * 100000),
        StreamName: config.stream.name
    };
    const logResponse = (res) => {
        logger.info({operation: 'writeToKinesis', uuid, event, eventData});
        return res;
    };
    const retryOrDie = (error) => {
        if (retryCount < maxRetries) {
            retryCount++;
            logger.warn({operation: 'writeToKinesis', msg: `Retry #${retryCount}`, uuid, event});
            return kinesis.putRecord(params).promise().then(logResponse).catch(retryOrDie);
        }
        logger.error({operation: 'writeToKinesis', msg: `Operation FAILED after ${maxRetries} retries`, uuid, event, error});
        throw error;
    };
    if (dontWrite) {
        logger.info({operation: 'wontWriteToKinesis', uuid, event});
        return;
    }
    return kinesis.putRecord(params).promise().then(logResponse).catch(retryOrDie);
}