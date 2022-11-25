const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authentication");

const {
    createNeed,
    getAllNeeds,
    deleteNeed,
    getNeed,
} = require("../controllers/need");

router.route("/createNeed/:id").post(authMiddleware, createNeed);
router.route("/deleteNeed/:id").delete(authMiddleware, deleteNeed);
router.route("/getAllNeeds").get(authMiddleware, getAllNeeds);
router.route("/getNeed").get(authMiddleware, getNeed);

module.exports = router;
