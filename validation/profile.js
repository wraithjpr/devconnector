const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data) {
  let errors = {};

  // handle is mandatory, non-blank, and 2-40 characters.
  // status is mandatory, non-blank.
  // skills is mandatory, non-blank.
  // website is optional, non-blank, and a URL.
  // youtube is optional, non-blank, and a URL.
  // twitter is optional, non-blank, and a URL.
  // facebook is optional, non-blank, and a URL.
  // linkedin is optional, non-blank, and a URL.
  // instagram is optional, non-blank, and a URL.
  const defaults = {
    handle: '',
    status: '',
    skills: ''
  };

  const dataDefaulted = Object.assign({}, defaults, data);

  // handle
  if (isEmpty(dataDefaulted.handle)) {
    errors.handle = 'Handle is required.';
  } else {
    if (!Validator.isLength(dataDefaulted.handle, { min: 2, max: 40 })) {
      errors.handle = 'Handle must be between 2 and 40 characters in length.';
    }
  }

  // status
  if (isEmpty(dataDefaulted.status)) {
    errors.status = 'Status is required.';
  }

  // skills
  if (isEmpty(dataDefaulted.skills)) {
    errors.skills = 'Skills is required.';
  }

  // website
  if (!isEmpty(dataDefaulted.website)) {
    if (!Validator.isURL(dataDefaulted.website)) {
      errors.website = 'Website must be a URL.';
    }
  }

  // youtube
  if (!isEmpty(dataDefaulted.youtube)) {
    if (!Validator.isURL(dataDefaulted.youtube)) {
      errors.youtube = 'Youtube must be a URL.';
    }
  }

  // twitter
  if (!isEmpty(dataDefaulted.twitter)) {
    if (!Validator.isURL(dataDefaulted.twitter)) {
      errors.twitter = 'Twitter must be a URL.';
    }
  }

  // facebook
  if (!isEmpty(dataDefaulted.facebook)) {
    if (!Validator.isURL(dataDefaulted.facebook)) {
      errors.facebook = 'Facebook must be a URL.';
    }
  }

  // linkedin
  if (!isEmpty(dataDefaulted.linkedin)) {
    if (!Validator.isURL(dataDefaulted.linkedin)) {
      errors.linkedin = 'Linkedin must be a URL.';
    }
  }

  // instagram
  if (!isEmpty(dataDefaulted.instagram)) {
    if (!Validator.isURL(dataDefaulted.instagram)) {
      errors.instagram = 'Instagram must be a URL.';
    }
  }

  return {
    isValid: isEmpty(errors),
    data: dataDefaulted,
    errors
  };
};
