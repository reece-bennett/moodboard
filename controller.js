// controller.js

const Item = require("./model");

exports.get = (req, res) => {
  Item.find().then((docs) => {
    res.json(docs);
  }).catch((err) => {
    console.error(err);
  });
};

exports.new = (req, res) => {
  const item = new Item();
  item.imageURL = req.body.imageURL;
  item.sourceURL = req.body.sourceURL;
  
  item.save(err => {
    if (err) {
      res.json(err);
    } else {
      res.json({
        message: "Item created",
        data: item
      });
    }
  });
};