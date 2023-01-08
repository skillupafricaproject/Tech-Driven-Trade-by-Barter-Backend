//require stream to read buffer objects
const { Readable } = require("stream");
const path = require("path");
const fs = require("fs");
//require sharp to minize image size
const sharp = require("sharp");
const { StatusCodes } = require("http-status-codes");
const Item = require("../models/Item");
const Like = require("../models/Like");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");

//require cloudinary version 2
const cloudinary = require("cloudinary").v2;

//create a function that invokes buffer reading for sharp stream package
const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
};

//get all items
const getAllItems = async (req, res) => {
  console.log(req?.user?.userId);
  if (req?.user?.userId === undefined) {
    const items = await Item.find({});
    return res.status(StatusCodes.OK).json({ items, itemCount: items.length });
  } else {
    const findUserLike = await Like.findOne({ user: req.user.userId });
    const items = await Item.find({});
    for (let i = 0; i < items.length; i++) {
      if (findUserLike.itemLiked.includes(items[i]._id)) {
        items[i].isFavorite = true;
      } else {
        items[i].isFavorite = false;
      }
    }
    return res.status(StatusCodes.OK).json({ items, itemCount: items.length });
  }
};

//get users items
const getUserItems = async (req, res) => {
  const items = await Item.find({ user: req.user.userId }).sort("createdAt");
  return res.status(StatusCodes.OK).json({ items, itemCount: items.length });
};

//get single item
const getSingleItem = async (req, res) => {
  const { id: itemId } = req.params;
  const item = await Item.find({ _id: itemId }).populate({
    path: "user",
    select: "username",
  });
  if (!item) {
    throw new NotFoundError(`item with id ${itemId} not found`);
  }

  res.status(StatusCodes.OK).json({ item });
};

//create item
const createItem = async (req, res) => {
  const image = req.files.image;
  const { itemName, description, location } = req.body;

  //create function that uses async/await while return promise with cloudinary & sharp package
  const convert_url = async (req) => {
    const data = await sharp(image.tempFilePath)
      .webp({ quality: 20 })
      .toBuffer();
    //use clodinary as a promise using the uploadStream method
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "DEV" },
        (err, url) => {
          if (err) {
            reject(err);
          } else {
            resolve(url);
          }
        }
      );
      bufferToStream(data).pipe(stream);
    });
  };

  const uri = await convert_url(req);
  fs.unlinkSync(req.files.image.tempFilePath);

  const item = await Item.create({
    itemName,
    location,
    description,
    photos: uri.secure_url,
    user: req.user.userId,
  });

  // const insertPhoto = await Item.insertMany({ photos: uri.secure_url });
  return res.status(StatusCodes.CREATED).json(item);
};

//update item
const updateItem = async (req, res) => {
  const { id: itemId } = req.params;

  const confirmItem = await Item.findOne({ _id: itemId });
  if (!confirmItem) {
    throw new BadRequestError(`No item with id : ${itemId}`);
  }

  const item = await Item.findByIdAndUpdate({ _id: itemId }, req.body, {
    new: true,
    runvalidators: true,
  });

  return res.status(StatusCodes.OK).json({ item });
};

//delete item
const deleteItem = async (req, res) => {
  const {
    user: { userId },
    params: { id: itemId },
  } = req;

  const item = await Item.findByIdAndRemove({
    _id: itemId,
    user: userId,
  });

  if (!item) {
    throw new BadRequestError(`No Item with id ${itemId}`);
  }
  res.status(StatusCodes.OK).json({ msg: `Item Successfully Deleted` });
};

//insert uploaded pictures/photos
const insertPhoto = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError(`item with ${id} not found`);
  }
  //create function that uses async/await while return promise with cloudinary & sharp package
  const convert_url = async (req) => {
    const data = await sharp(req.files.image.tempFilePath)
      .webp({ quality: 20 })
      .toBuffer();
    //use clodinary as a promise using the uploadStream method
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "DEV" },
        (err, url) => {
          if (err) {
            reject(err);
          } else {
            resolve(url);
          }
        }
      );
      bufferToStream(data).pipe(stream);
    });
  };

  const uri = await convert_url(req);

  //find and update item with cloudinary secure url
  const item = await Item.findByIdAndUpdate(
    { _id: id },
    { $push: { photos: uri.secure_url } },
    {
      new: true,
      runValidators: true,
    }
  );

  return res.json({ ImageURL: uri.secure_url });
};

//export modules
module.exports = {
  createItem,
  updateItem,
  getAllItems,
  getUserItems,
  deleteItem,
  insertPhoto,
  getSingleItem,
};
