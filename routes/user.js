const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authentication");

const { getUserProfile, updateUserProfile } = require("../controllers/user");

router.route("/getUserProfile").get(authMiddleware, getUserProfile);
router.route("/updateUserProfile/:id").post(authMiddleware, updateUserProfile);

module.exports = router;
