const express = require('express');
const router = express.Router();

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/sensitive/keys');
const passport = require('passport');

// Load input validation modules
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load the model, User
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Test the users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Route /api/users works.' }));

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', (req, res) => {
  // Validate input
  let { isValid, data, errors } = validateRegisterInput(req.body);

  // Check validation, returns 400 Bad Request
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: data.email }).then(user => {
    if (user) {
      isValid = false;
      errors.email = 'Email address already exists.';
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(data.email, {
        s: '200', // size
        r: 'pg', // rating
        d: 'mm' // default
      });

      const newUser = new User({
        name: data.name,
        email: data.email,
        avatar,
        password: data.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;

        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   POST api/users/login
// @desc    A new user signs in and return a JWT token
// @access  Public
router.post('/login', (req, res) => {
  // Validate input
  let { isValid, data, errors } = validateLoginInput(req.body);

  // Check validation, returns 400 Bad Request
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Find the user by email
  User.findOne({ email: data.email }).then(user => {
    // Check for: 404 user not found
    if (!user) {
      errors.email = 'User not found.';
      return res.status(404).json(errors);
    }

    // Check password and 401 Unauthorized
    bcrypt.compare(data.password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched OK
        // Create JWT payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        // Sign the token, setting expiry and returning as a bearer token.
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 24 * 60 * 60 }, // 24 hours
          (err, token) => {
            res.json({ success: true, token: `Bearer ${token}` });
          }
        );
      } else {
        errors.password = 'Password incorrect';
        return res.status(401).json({ errors });
      }
    });
  });
});

// @route   GET api/users/current
// @desc    Return the current user
// @access  Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
