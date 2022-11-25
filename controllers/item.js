const { Readable } = require("stream");
const path = require("path");
const sharp = require("sharp");
const { StatusCodes } = require("http-status-codes");
const Item = require("../models/Item");
const {
    BadRequestError,
    UnauthenticatedError,
    NotFoundError,
} = require("../errors");
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
    const items = await Item.find({});
    res.status(StatusCodes.OK)
        .json({ items, itemCount: items.length })
        .populate({
            path: "user",
            select: "username",
        });
};

//get uers items
const getUserItems = async (req, res) => {
    const items = await Item.find({ user: req.user.userId }).sort("createdAt");
    res.status(StatusCodes.OK).json({ items, itemCount: items.length });
};

//get single item
const getSingleItem = async (req, res) => {
    const { id: itemId } = req.params;
    const item = await Item.find({ _id: itemId });
    if (!item) {
        throw new NotFoundError(`item with id ${itemId} not found`);
    }

    res.status(StatusCodes.OK).json({ item });
};
const createItem = async (req, res) => {
    const { itemName, description, location } = req.body;
    const item = await Item.create({
        itemName,
        location,
        description,
        user: req.user.userId,
    });
    res.status(StatusCodes.CREATED).json(item);
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

    res.status(StatusCodes.OK).json({ item });
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

    res.json({ ImageURL: uri.secure_url });
};

module.exports = {
    createItem,
    updateItem,
    getAllItems,
    getUserItems,
    deleteItem,
    insertPhoto,
    getSingleItem,
};
