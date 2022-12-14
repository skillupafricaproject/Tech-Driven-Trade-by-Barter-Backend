const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authentication");
const middleAuth = require("../middleware/middleAuth");

// const likeMiddleware = require("../middleware/likeMiddleware");

const { createLike, getAllLikes, deleteLike } = require("../controllers/like");

router.route("/createLike/:id").post(authMiddleware, createLike);
router.route("/getAllLikes").get(authMiddleware, getAllLikes);
router.route("/deleteLike/:id").delete(authMiddleware, deleteLike);

module.exports = router;
