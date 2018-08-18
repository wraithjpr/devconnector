const express = require("express");
const router = express.Router();

// @route   GET api/posts/test
// @desc    Test the posts route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Route /api/posts works." }));

module.exports = router;
