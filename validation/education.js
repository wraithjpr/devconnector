const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateEducationInput(data) {
  let errors = {};

  // school is mandatory, non-blank.
  // degree is mandatory, non-blank.
  // fieldOfStudy is mandatory, non-blank.
  // location is optional, non-blank.
  // from is mandatory, and a Date.
  // to is optional, and a Date.
  // current is mandatory, defaults false, and a Boolean.
  // description is optional, maybe blank.

  const defaults = {
    school: '',
    degree: '',
    fieldOfStudy: '',
    from: ''
  };

  const dataDefaulted = Object.assign({}, defaults, data);

  // school
  if (isEmpty(dataDefaulted.school)) {
    errors.school = 'School is required.';
  }

  // degree
  if (isEmpty(dataDefaulted.degree)) {
    errors.degree = 'Degree is required.';
  }

  // fieldOfStudy
  if (isEmpty(dataDefaulted.fieldOfStudy)) {
    errors.fieldOfStudy = 'Field of study is required.';
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
