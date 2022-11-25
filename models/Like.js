const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
    {
        itemLiked: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Item",
                required: [true, "Please provide Item"],
            },
        ],
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Please provide User"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Like", LikeSchema);
