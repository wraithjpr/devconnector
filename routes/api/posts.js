const express = require('express');
const router = express.Router();
const passport = require('passport');

// Load utility modules
const {
  makeFatalErrorHandler,
  handleNotImplemented
} = require('../../utils/error-handling');

// Load input validation modules
const validatePostInput = require('../../validation/post');
const validateCommentInput = require('../../validation/comment');

// Load models
const Post = require('../../models/Post');

// @route   GET api/posts/test
// @desc    Test the posts route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Route /api/posts works.' }));

// @route   GET api/posts/:id
// @desc    Get a post by id
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      // Check post exists. Returns the post or 404 Not Found
      if (post) {
        return res.json(post);
      } else {
        return res
          .status(404)
          .json({ message: 'That post could not be found' });
      }
    })
    .catch(makeFatalErrorHandler(res));
});

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      // Check posts exists. Returns the posts or 404 Not Found
      if (posts && posts.length > 0) {
        return res.json(posts);
      } else {
        return res
          .status(404)
          .json({ message: 'There are no posts available yet' });
      }
    })
    .catch(makeFatalErrorHandler(res));
});

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

// @route   DELETE api/posts/:id
// @desc    Delete a post by id
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check post exists. Returns 404 Not Found
        if (post) {
          // Check the users match - users can delete only their own posts. Returns 403 Forbidden.
          if (req.user.id === post.user.toString()) {
            // Delete the post
            post
              .remove()
              .then(() => res.json({ success: true }))
              .catch(makeFatalErrorHandler(res));
          } else {
            return res.status(403).json({
              message: 'Permission denied. You may delete only your own posts'
            });
          }
        } else {
          return res
            .status(404)
            .json({ message: 'That post could not be found' });
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

// @route   POST api/posts/like/:id
// @desc    Like a post by id
// @access  Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check post exists. Returns 404 Not Found
        if (post) {
          // Check the users don't match - users cannot like their own posts. Returns 403 Forbidden.
          if (req.user.id !== post.user.toString()) {
            // Check that the user has not liked this post already... like it once only, please!
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
            ) {
              // Record the like
              post.likes.push({ user: req.user.id });

              // Save the post
              post
                .save()
                .then(post => res.json(post))
                .catch(makeFatalErrorHandler(res));
            } else {
              return res.status(403).json({
                message: 'You already liked this post.'
              });
            }
          } else {
            return res.status(403).json({
              message:
                "Permission denied. You may like only others' posts, not your own."
            });
          }
        } else {
          return res
            .status(404)
            .json({ message: 'That post could not be found' });
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike a post by id
// @access  Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check post exists. Returns 404 Not Found
        if (post) {
          // Get the remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Check that the user has liked this post already.
          if (removeIndex > -1) {
            // Take out the like
            post.likes.splice(removeIndex, 1);

            // Save the post
            post
              .save()
              .then(post => res.json(post))
              .catch(makeFatalErrorHandler(res));
          } else {
            return res
              .status(404)
              .json({ message: 'You have not liked this post yet' });
          }
        } else {
          return res
            .status(404)
            .json({ message: 'That post could not be found' });
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

// @route   POST api/posts/comment/:id
// @desc    Comment on a post by id
// @access  Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check post exists. Returns 404 Not Found
        if (post) {
          // Validate input
          let { isValid, data, errors } = validateCommentInput(req.body);

          // Check validation, returns 400 Bad Request
          if (!isValid) {
            return res.status(400).json(errors);
          }

          // Construct the post
          const commentFields = { user: req.user.id };

          if (data.text) commentFields.text = data.text;
          if (data.name) commentFields.name = data.name;
          if (data.avatar) commentFields.avatar = data.avatar;

          // Record the comment
          post.comments.push(commentFields);

          // Save the post
          post
            .save()
            .then(post => res.json(post))
            .catch(makeFatalErrorHandler(res));
        } else {
          return res
            .status(404)
            .json({ message: 'That post could not be found' });
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

// @route   DELETE api/posts/unlike/:id/:comment_id
// @desc    Remove a comment from a post by id
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check post exists. Returns 404 Not Found
        if (post) {
          // Get the remove index
          const removeIndex = post.comments
            .map(comment => comment._id.toString())
            .indexOf(req.params.comment_id);

          // Check that the user has liked this post already.
          if (removeIndex > -1) {
            // Take out the like
            post.comments.splice(removeIndex, 1);

            // Save the post
            post
              .save()
              .then(post => res.json(post))
              .catch(makeFatalErrorHandler(res));
          } else {
            return res
              .status(404)
              .json({ message: 'That comment could not be found' });
          }
        } else {
          return res
            .status(404)
            .json({ message: 'That post could not be found' });
        }
      })
      .catch(makeFatalErrorHandler(res));
  }
);

module.exports = router;
