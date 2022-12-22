const Like = require("../models/Like");
// const { BadRequestError } = require("../errors");
const { StatusCodes } = require("http-status-codes");

const isFavourite = async (req, res) => {
  const findLike = await Like.find({
    user: req.user.userId,
    isFavorite: true,
  });

  if(findLike) {
    res.status(StatusCodes.UNAUTHORIZED).json({ msg: `you already like this` });
    // throw new BadRequestError(`you alread like this item`);
  }
};

module.exports = isFavourite 
