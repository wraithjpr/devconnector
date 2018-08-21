// Load literal value constants
const {
  ERR_FATAL_SERVICE_FAULT,
  ERR_INFO_WORK_IN_PROGRESS
} = require('../config/errors');

const {
  HTTP_500_INTERNAL_SERVER_ERROR,
  HTTP_501_NOT_IMPLEMENTED
} = require('../config/http-codes');

// Our logged output goes here
const defaults = { log: console.log };

// Error handler function factory
function makeResponseErrorHandler(msg, httpCode, log) {
  return function makeErrorHandler(res) {
    return function handleError(err) {
      log && log(err);
      return res.status(httpCode).json({ fatal: msg });
    };
  };
}

// Not implemented. Responds with 501 Not Implemented
function handleNotImplemented(req, res) {
  return res
    .status(HTTP_501_NOT_IMPLEMENTED)
    .json({ info: ERR_INFO_WORK_IN_PROGRESS });
}

// Error handlers
const makeFatalErrorHandler = makeResponseErrorHandler(
  ERR_FATAL_SERVICE_FAULT,
  HTTP_500_INTERNAL_SERVER_ERROR,
  defaults.log
);

module.exports = {
  handleNotImplemented,
  makeFatalErrorHandler,
  makeResponseErrorHandler
};
