const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authentication");
const middleAuth = require("../middleware/middleAuth");

const {
  createItem,
  updateItem,
  getAllItems,
  getUserItems,
  deleteItem,
  insertPhoto,
  getSingleItem,
  allItems,
} = require("../controllers/item");

router.route("/createItem").post(authMiddleware, createItem);
router.route("/updateItem/:id").patch(authMiddleware, updateItem);
router.route("/getAllItems").get(middleAuth, getAllItems);
router.route("/getSingleItem/:id").get(getSingleItem);
router.route("/getUserItems").get(authMiddleware, getUserItems);
router.route("/deleteItem/:id").delete(authMiddleware, deleteItem);
router.route("/insertPhoto/photo/:id").patch(insertPhoto);
router.route("/allItems").get(allItems);

module.exports = router;
