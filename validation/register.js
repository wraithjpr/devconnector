const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
  let errors = {};

  // name is mandatory, non-blank, and 2-30 characters.
  // email is mandatory, non-blank, and in email address format.
  // password is mandatory, non-blank, and 8-30 characters. Must be confirmed.
  const defaults = {
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  };

  const dataDefaulted = Object.assign({}, defaults, data);

  // name
  if (isEmpty(dataDefaulted.name)) {
    errors.name = 'Name must be given.';
  } else {
    if (!Validator.isLength(dataDefaulted.name, { min: 2, max: 30 })) {
      errors.name = 'Name must be between 2 and 30 characters in length.';
    }
  }

  // email
  if (isEmpty(dataDefaulted.email)) {
    errors.email = 'Email must be given.';
  } else {
    if (!Validator.isEmail(dataDefaulted.email)) {
      errors.email =
        'Email must be given in email address format, e.g my.self@myemaildomain.com.';
    }
  }

  // password
  if (isEmpty(dataDefaulted.password)) {
    errors.password = 'Password must be given.';
  } else {
    if (!Validator.isLength(dataDefaulted.password, { min: 8, max: 30 })) {
      errors.password =
        'Password must be between 8 and 30 characters in length.';
    }
  }

  // password confirm
  if (isEmpty(dataDefaulted.passwordConfirm)) {
    errors.passwordConfirm = 'Password must be confirmed.';
  } else {
    if (
      !Validator.equals(dataDefaulted.password, dataDefaulted.passwordConfirm)
    ) {
      errors.passwordConfirm = 'The two passwords must match.';
    }
  }

  return {
    isValid: isEmpty(errors),
    data: dataDefaulted,
    errors
  };
};
