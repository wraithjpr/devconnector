const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateLoginInput(data) {
  let errors = {};

  // email is mandatory, non-blank.
  // password is mandatory, non-blank.
  const defaults = {
    email: '',
    password: ''
  };

  const dataDefaulted = Object.assign({}, defaults, data);

  // email
  if (isEmpty(dataDefaulted.email)) {
    errors.email = 'Email is required to sign in.';
  }

  // password
  if (isEmpty(dataDefaulted.password)) {
    errors.password = 'Password is required to sign in.';
  }

  return {
    isValid: isEmpty(errors),
    data: dataDefaulted,
    errors
  };
};
