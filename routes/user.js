const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authentication");

const { getUserProfile } = require("../controllers/user");

router.route("/getUserProfile").get(authMiddleware, getUserProfile);

module.exports = router;
