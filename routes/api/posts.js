const express = require('express');
const router = express.Router();
const passport = require('passport');

// Load utility modules
const { makeFatalErrorHandler } = require('../../utils/error-handling');

// Load input validation modules
const validatePostInput = require('../../validation/post');

// Load models
const Post = require('../../models/Post');

// @route   GET api/posts/test
// @desc    Test the posts route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Route /api/posts works.' }));

// @route   POST api/posts
// @desc    Create a new post against the current user
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Validate input
    let { isValid, data, errors } = validatePostInput(req.body);

    // Check validation, returns 400 Bad Request
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Construct the post
    const postFields = { user: req.user.id };

    if (data.text) postFields.text = data.text;
    if (data.name) postFields.name = data.name;
    if (data.avatar) postFields.avatar = data.avatar;

    new Post(postFields)
      .save()
      .then(post => res.json(post))
      .catch(makeFatalErrorHandler(res));
  }
);

module.exports = router;
