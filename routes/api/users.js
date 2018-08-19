const express = require('express');
const router = express.Router();

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

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
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: 'Email address already exists.' });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', // size
        r: 'pg', // rating
        d: 'mm' // default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;

        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.error(err));
        });
      });
    }
  });
});

// @route   POST api/users/login
// @desc    A new user signs in and return a JWT token
// @access  Public
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Find the user by email
  User.findOne({ email }).then(user => {
    // Check for: 404 user not found
    if (!user) {
      return res.status(404).json({ email: 'User not found' });
    }

    // Check password and 401 Unauthorized
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched OK
        // Create JWT payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        // Sign the token, setting expiry and returning as a bearer token.
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({ success: true, token: `Bearer ${token}` });
          }
        );
      } else {
        return res.status(401).json({ password: 'Password incorrect' });
      }
    });
  });
});

// @route   POST api/users/current
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
