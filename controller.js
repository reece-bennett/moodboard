// controller.js

const Item = require("./model");

exports.get = (req, res) => {
  Item.find()
    .then(docs => res.json(docs))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

exports.create = (req, res) => {
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

exports.update = (req, res) => {
  const id = req.params.id;
  const update = {
    imageURL: req.body.imageURL,
    sourceURL: req.body.sourceURL
  }

  Item.findByIdAndUpdate(id, update, {new: true})
    .then(docs => res.json(docs))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

exports.delete = (req, res) => {
  const id = req.params.id;

  Item.findByIdAndDelete(id)
    .then(docs => res.json(docs))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};