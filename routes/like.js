const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authentication");

const { createLike, getAllLikes, deleteLike } = require("../controllers/like");

router.route("/createLike").post(authMiddleware, createLike);
router.route("/getAllLikes").get(authMiddleware, getAllLikes);
router.route("/deleteLike/:id").delete(authMiddleware, deleteLike);

module.exports = router;
