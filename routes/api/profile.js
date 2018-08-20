const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/test
// @desc    Test the profile route
// @access  Public
router.get('/test', (req, res) =>
  res.json({ msg: 'Route /api/profile works.' })
);

// @route   GET api/profile
// @desc    Get the current user's profile
// @access  Public
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
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

module.exports = router;
