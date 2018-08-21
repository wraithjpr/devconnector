const express = require('express');
const router = express.Router();
const passport = require('passport');

// Load literal value constants
const { ERR_FATAL_SERVICE_FAULT } = require('../../config/errors');
const { HTTP_500_INTERNAL_SERVER_ERROR } = require('../../config/http-codes');

// Load input validation modules
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// Load models
const Profile = require('../../models/Profile');

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

// @route   GET api/profile/test
// @desc    Test the profile route
// @access  Public
router.get('/test', (req, res) =>
  res.json({ msg: 'Route /api/profile works.' })
);

// @route   GET api/profile
// @desc    Get the current user's profile
// @access  Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
      .then(profile => {
        // Check profile exists. Returns 404 Not Found
        if (!profile) {
          errors.noProfile = 'There is no profile for this user.';
          return res.status(404).json(errors);
        }

        // Return the profile
        return res.json(profile);
      })
      .catch(makeFatalErrorHandler(res));
  }
);

// @route   GET api/profile/all
// @desc    Get a list of all profiles
// @access  Public
router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      // Check list of profiles exists. Returns 404 Not Found
      if (!profiles) {
        errors.noProfile = 'There are no profiles';
        return res.status(404).json(errors);
      }

      // Return the list of profiles
      return res.json(profiles);
    })
    .catch(makeFatalErrorHandler(res));
});

// @route   GET api/profile/handle/:handle
// @desc    Get a profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      // Check profile exists. Returns 404 Not Found
      if (!profile) {
        errors.noProfile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }

      // Return the profile
      return res.json(profile);
    })
    .catch(makeFatalErrorHandler(res));
});

// @route   GET api/profile/user/:user_id
// @desc    Get a profile by user id
// @access  Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      // Check profile exists. Returns 404 Not Found
      if (!profile) {
        errors.noProfile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }

      // Return the profile
      return res.json(profile);
    })
    .catch(makeFatalErrorHandler(res));
});

// @route   POST api/profile
// @desc    Create or edit a user profile
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Validate input
    let { isValid, data, errors } = validateProfileInput(req.body);

    // Check validation, returns 400 Bad Request
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Construct the profile
    const profileFields = { user: req.user.id };

    if (data.handle) profileFields.handle = data.handle;
    if (data.company) profileFields.company = data.company;
    if (data.website) profileFields.website = data.website;
    if (data.location) profileFields.location = data.location;
    if (data.bio) profileFields.bio = data.bio;
    if (data.status) profileFields.status = data.status;
    if (data.githubUsername) profileFields.githubUsername = data.githubUsername;

    // Splits skills into an array
    if (typeof data.skills !== 'undefined') {
      profileFields.skills = data.skills.split(',');
    }

    // Social
    profileFields.social = {};

    if (data.youtube) profileFields.social.youtube = data.youtube;
    if (data.twitter) profileFields.social.twitter = data.twitter;
    if (data.facebook) profileFields.social.facebook = data.facebook;
    if (data.linkedin) profileFields.social.linkedin = data.linkedin;
    if (data.instagram) profileFields.social.instagram = data.instagram;

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Update an existing profile; create a new profile if it's not there.
        if (profile) {
          // Update
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          )
            .then(profile => res.json(profile))
            .catch(makeFatalErrorHandler(res));
        } else {
          // Create
          // Check that the handle is available. Returns 400 Bad Request if handle is already in use by another.
          Profile.findOne({ handle: profileFields.handle })
            .then(profile => {
              if (profile) {
                // 400 Bad Request
                isValid = false;
                errors.handle =
                  'That handle is not available to you. Use another.';
                return res.status(400).json(errors);
              } else {
                // Handle is available, so save the new profile.
                new Profile(profileFields)
                  .save()
                  .then(profile => res.json(profile))
                  .catch(makeFatalErrorHandler(res));
              }
            })
            .catch(makeFatalErrorHandler(res));
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

// @route   POST api/profile/experience
// @desc    Add an experience item to the current user's profile
// @access  Private
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Validate input
    let { isValid, data, errors } = validateExperienceInput(req.body);

    // Check validation, returns 400 Bad Request
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Construct the profile
    const experienceFields = {};

    if (data.title) experienceFields.title = data.title;
    if (data.company) experienceFields.company = data.company;
    if (data.location) experienceFields.location = data.location;
    if (data.from) experienceFields.from = data.from;
    if (data.to) experienceFields.to = data.to;
    if (data.current) experienceFields.current = data.current;
    if (data.description) experienceFields.description = data.description;

    // Find profile by user id
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Check that profile is found
        if (profile) {
          // Add to experience array
          profile.experience.unshift(experienceFields);
          profile
            .save()
            .then(profile => res.json(profile))
            .catch(makeFatalErrorHandler(res));
        } else {
          // Returns 404 Not Found
          errors.noProfile = "Unable to find user's profile";
          return res.status(404).json(errors);
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

// @route   POST api/profile/education
// @desc    Add education item to the current user's profile
// @access  Private
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Validate input
    let { isValid, data, errors } = validateEducationInput(req.body);

    // Check validation, returns 400 Bad Request
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Construct the profile
    const educationFields = {};

    if (data.school) educationFields.school = data.school;
    if (data.degree) educationFields.degree = data.degree;
    if (data.fieldOfStudy) educationFields.fieldOfStudy = data.fieldOfStudy;
    if (data.location) educationFields.location = data.location;
    if (data.from) educationFields.from = data.from;
    if (data.to) educationFields.to = data.to;
    if (data.current) educationFields.current = data.current;
    if (data.description) educationFields.description = data.description;

    // Find profile by user id
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Check that profile is found
        if (profile) {
          // Add to education array
          profile.education.unshift(educationFields);
          profile
            .save()
            .then(profile => res.json(profile))
            .catch(makeFatalErrorHandler(res));
        } else {
          // Returns 404 Not Found
          errors.noProfile = "Unable to find user's profile";
          return res.status(404).json(errors);
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete an experience item from the current user's profile
// @access  Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};

    // Find profile by user id
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Check that profile is found
        if (profile) {
          // Get remove index
          const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

          if (removeIndex !== -1) {
            // Splice out of array
            profile.experience.splice(removeIndex, 1);

            // Save the profile
            profile
              .save()
              .then(profile => res.json(profile))
              .catch(makeFatalErrorHandler(res));
          } else {
            // No need for an error if not found, as it's already gone and delete should be idempotent.
            return res.json(profile);
          }
        } else {
          // Returns 404 Not Found
          errors.noProfile = "Unable to find user's profile";
          return res.status(404).json(errors);
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete an education item from the current user's profile
// @access  Private
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};

    // Find profile by user id
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Check that profile is found
        if (profile) {
          // Get remove index
          const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);

          if (removeIndex !== -1) {
            // Splice out of array
            profile.education.splice(removeIndex, 1);

            // Save the profile
            profile
              .save()
              .then(profile => res.json(profile))
              .catch(makeFatalErrorHandler(res));
          } else {
            // No need for an error if not found, as it's already gone and delete should be idempotent.
            return res.json(profile);
          }
        } else {
          // Returns 404 Not Found
          errors.noProfile = "Unable to find user's profile";
          return res.status(404).json(errors);
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

module.exports = router;
