const clientErrors = require('./../clientErrors');

module.exports = {
    parseJsonRes: (res, customErrorMessage) => {
        clientErrors.parse(res, customErrorMessage);
        return res.json();
    }
};
