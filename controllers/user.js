const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");
const User = require("../models/User");

//get user profile
const getUserProfile = async (req, res) => {
  const user = await User.find({ _id: req.user.userId }).select("-password");

  res.status(StatusCodes.OK).json({ profile: user });
};

//update user profile
const updateUserProfile = async (req, res) => {
  const { id: userId } = req.params;

  if (userId !== req.user.userId) {
    throw new UnauthenticatedError(`You can't perform this task`).select(
      "-password"
    );
  }

  const user = await User.findByIdAndUpdate({ _id: userId }, req.body, {
    runvalidators: true,
    new: true,
  });

  res.status(StatusCodes.OK).json({ profile: user });
};

module.exports = { getUserProfile, updateUserProfile };
