const mongoose = require("mongoose");

const NeedSchema = new mongoose.Schema(
    {
        needName: {
            type: String,
        },
        description: {
            type: String,
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Please provide user"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Need", NeedSchema);
