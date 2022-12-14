const { StatusCodes } = require("http-status-codes");
const Like = require("../models/Like");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");

//get all likes
const getAllLikes = async (req, res) => {
  const like = await Like.find({ user: req.user.userId })
    .sort("createdAt")
    .populate({
      path: "itemLiked",
      select: "itemName",
    });
  res.status(StatusCodes.OK).json({ like, likeCount: like.length });
};

// //create Like
// const createLike = async (req, res) => {
//   const { id: likeId } = req.params;

//   const like = await Like.create({
//     itemLiked: likeId,
//     isFavorite: true,
//     user: req.user.userId,
//   });

//   res.status(StatusCodes.CREATED).json({
//     msg: `Added to List`,
//     like,
//   });
// };

const createLike = async (req, res) => {
  const { id: likeId } = req.params;

  const userExist = await Like.findOne({ user: req.user.userId });

  if (userExist) {
    const like = await Like.findOneAndUpdate(
      { user: req.user.userId },
      { $push: { itemLiked: likeId } },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(StatusCodes.CREATED).json({
      msg: `Added to List`,
      like,
    });
  } else {
    const like = await Like.create({
      itemLiked: likeId,
      isFavorite: true,
      user: req.user.userId,
    });
    res.status(StatusCodes.CREATED).json({
      msg: `Added to List`,
      like,
    });
  }
};

//delete likes
const deleteLike = async (req, res) => {
  const {
    params: { id: likeId },
    user: { userId },
  } = req;

  const like = await Like.findByIdAndRemove({ _id: likeId, user: userId });
  if (!like) {
    throw new UnauthenticatedError(`you can't delete this Item`);
  }

  res.status(StatusCodes.OK).json({
    msg: `Pending Item is Deleted`,
  });
};

module.exports = { createLike, getAllLikes, deleteLike };
