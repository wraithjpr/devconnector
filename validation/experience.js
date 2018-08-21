const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateExperienceInput(data) {
  let errors = {};

  // title is mandatory, non-blank.
  // company is mandatory, non-blank.
  // location is optional, non-blank.
  // from is mandatory, and a Date.
  // to is optional, and a Date.
  // current is mandatory, defaults false, and a Boolean.
  // description is optional, maybe blank.

  const defaults = {
    title: '',
    company: '',
    from: ''
  };

  const dataDefaulted = Object.assign({}, defaults, data);

  // title
  if (isEmpty(dataDefaulted.title)) {
    errors.title = 'Job title is required.';
  }

  // company
  if (isEmpty(dataDefaulted.company)) {
    errors.company = 'Company is required.';
  }

  // from
  if (isEmpty(dataDefaulted.from)) {
    errors.from = 'From date is required.';
  }

  return {
    isValid: isEmpty(errors),
    data: dataDefaulted,
    errors
  };
};
