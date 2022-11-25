const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authentication");

const {
    createItem,
    updateItem,
    getAllItems,
    getUserItems,
    deleteItem,
    insertPhoto,
    getSingleItem,
} = require("../controllers/item");

router.route("/createItem").post(authMiddleware, createItem);
router.route("/updateItem/:id").patch(authMiddleware, updateItem);
router.route("/getAllItems").get(getAllItems);
router.route("/getSingleItem/:id").get(getSingleItem);
router.route("/getUserItems").get(authMiddleware, getUserItems);
router.route("/deleteItem/:id").delete(authMiddleware, deleteItem);
router.route("/insertPhoto/photo/:id").patch(insertPhoto);

module.exports = router;
