const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
        },
        photos: {
            type: [String],
        },
        location: {
            type: String,
        },
        description: {
            type: String,
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        userLike: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
