const express = require('express');
const router = express.Router();

// @route   GET api/profiles/test
// @desc    Test the profile route
// @access  Public
router.get('/test', (req, res) =>
  res.json({ msg: 'Route /api/profiles works.' })
);

module.exports = router;
