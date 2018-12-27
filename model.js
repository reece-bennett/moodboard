// model.js

const mongoose = require("mongoose");

const schema = mongoose.Schema({
  imageURL: {
    type: String,
    required: true
  },
  sourceURL: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("item", schema);