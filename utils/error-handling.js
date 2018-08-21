// Load literal value constants
const { ERR_FATAL_SERVICE_FAULT } = require('../config/errors');
const { HTTP_500_INTERNAL_SERVER_ERROR } = require('../config/http-codes');

// Error handler function factory
function makeResponseErrorHandler(msg, httpCode, log) {
  return function makeErrorHandler(res) {
    return function handleError(err) {
      log && log(err);
      return res.status(httpCode).json({ error: msg });
    };
  };
}

// Error handlers
const makeFatalErrorHandler = makeResponseErrorHandler(
  ERR_FATAL_SERVICE_FAULT,
  HTTP_500_INTERNAL_SERVER_ERROR,
  console.log
);

module.exports = { makeFatalErrorHandler, makeResponseErrorHandler };
