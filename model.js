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
  },
  created: Date
});

schema.pre("save", function(next) {
  this.created = new Date();
  next();
});

module.exports = mongoose.model("item", schema);