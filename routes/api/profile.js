const express = require("express");
const router = express.Router();

// @route   GET api/posts/test
// @desc    Test the profile route
// @access  Public
router.get("/test", (req, res) =>
  res.json({ msg: "Route /api/profile works." })
);

module.exports = router;
