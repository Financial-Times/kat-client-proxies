const statusErrors = require('./statusErrors');

module.exports = {
    parseJsonRes: (res, customErrorMessage) => {
        statusErrors.parse(res, customErrorMessage);
        return res.json();
    }
};