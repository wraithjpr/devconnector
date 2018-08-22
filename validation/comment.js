const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateCommentInput(data) {
  let errors = {};

  // text is mandatory, non-blank, and between 6 and 1024 characters.
  // name is mandatory, non-blank.
  const defaults = {
    text: '',
    name: ''
  };

  const dataDefaulted = Object.assign({}, defaults, data);

  // text
  if (isEmpty(dataDefaulted.text)) {
    errors.text = 'Comments must not be blank. Please fill in your comment.';
  } else {
    if (!Validator.isLength(dataDefaulted.text, { min: 6, max: 1024 })) {
      errors.text = 'Comments must be between 6 and 1024 characters.';
    }
  }

  // name
  if (isEmpty(dataDefaulted.name)) {
    errors.name = 'Name is required.';
  }

  return {
    isValid: isEmpty(errors),
    data: dataDefaulted,
    errors
  };
};
