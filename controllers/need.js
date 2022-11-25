const { StatusCodes } = require("http-status-codes");
const {
    BadRequestError,
    UnauthenticatedError,
    NotFoundError,
} = require("../errors");
const Need = require("../models/Need");

//get all needs
const getAllNeeds = async (req, res) => {
    const need = await Need.find({}).sort("createdAt").populate({
        path: "user",
        select: "username",
    });
    res.status(StatusCodes.OK).json({ need, needCount: need.length });
};

//get user needs
const getNeed = async (req, res) => {
    const need = await Need.find({ user: req.user.userId }).sort("createdAt");

    res.status(StatusCodes.OK).json({ need, needCount: need.length });
};

//create need
const createNeed = async (req, res) => {
    const { id: userId } = req.params;
    const { needName, description } = req.body;

    if (!needName || !description) {
        throw new BadRequestError(
            `Please provide your the Item you need & description`
        );
    }
    if (userId !== req.user.userId) {
        throw new UnauthenticatedError(`You can't create a Need`);
    }

    const need = await Need.create({ needName, description, user: userId });

    res.status(StatusCodes.CREATED).json({
        msg: `Need is created`,
        need: need,
    });
};

//delete need
const deleteNeed = async (req, res) => {
    const {
        params: { id: needId },
        user: { userId },
    } = req;

    const need = await Need.findByIdAndRemove({ _id: needId, user: userId });
    if (!need) {
        throw new NotFoundError(`Item need not found`);
    }

    res.status(StatusCodes.OK).json({
        msg: `Item Need is Deleted`,
    });
};

module.exports = { createNeed, getAllNeeds, deleteNeed, getNeed };
