const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    originalUrl: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    author: { type: String, required: true },
    authorName: { type: String, required: true },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
