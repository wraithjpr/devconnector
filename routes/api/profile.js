const express = require('express');
const router = express.Router();
const passport = require('passport');

// Load input validation modules
const validateProfileInput = require('../../validation/profile');

// Load models
const Profile = require('../../models/Profile');

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
        res.json(profile);
      })
      .catch(err => {
        // Returns 500 Internal Server Error
        console.error(err);
        errors.noProfile = "Unable to fetch user's profile";
        return res.status(500).json(errors);
      });
  }
);

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
            .catch(err => {
              // Returns 500 Internal Server Error
              console.error(err);
              errors.noProfile = "Unable to update user's profile";
              return res.status(500).json(errors);
            });
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
                  .catch(err => {
                    // Returns 500 Internal Server Error
                    console.error(err);
                    errors.noProfile = "Unable to create user's profile";
                    return res.status(500).json(errors);
                  });
              }
            })
            .catch(err => {
              // Returns 500 Internal Server Error
              console.error(err);
              errors.noProfile = 'Unable to check handle is available';
              return res.status(500).json(errors);
            });
        }
      })
      .catch(err => {
        // Returns 500 Internal Server Error
        console.error(err);
        errors.noProfile = "Unable to create user's profile";
        return res.status(500).json(errors);
      });
  }
);

module.exports = router;
