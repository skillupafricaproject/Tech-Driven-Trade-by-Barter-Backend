const { StatusCodes } = require("http-status-codes");
const {
    BadRequestError,
    UnauthenticatedError,
    NotFoundError,
} = require("../errors");
const User = require("../models/User");

//get user profile
const getUserProfile = async (req, res) => {
    const user = await User.find({ _id: req.user.userId });

    res.status(StatusCodes.OK).json({ profile: user });
};


//update user profile
const updateUserProfile = async (req, res) => {
    const { id: userId } = req.params;

    if (userId !== req.user.userId) {
        throw new UnauthenticatedError(`You can't perform this task`);
    }

    const user = await User.findByIdAndUpdate({ _id: userId }, req.body, {
        new: true,
        runvalidators: true,
    });

    res.status(StatusCodes.OK).json({ profile: user });
};

module.exports = { getUserProfile, updateUserProfile };
