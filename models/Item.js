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
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ItemSchema.pre("find", function () {
//   console.log(this.getQuery().user);
// });

module.exports = mongoose.model("Item", ItemSchema);
