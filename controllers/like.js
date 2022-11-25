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

//create Like
const createLike = async (req, res) => {
    const { id: likeId } = req.body;

    const like = await Like.create({
        itemLiked: likeId,
        user: req.user.userId,
    });

    res.status(StatusCodes.CREATED).json({
        msg: `Pending List Added`,
        like,
    });
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
