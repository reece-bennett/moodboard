const express = require("express");
const fs = require("fs");
const https = require("https");
const path = require("path");
const uniqueFilename = require("unique-filename");
const Image = require("./imageModel");

const router = express.Router();

const imageDir = path.resolve(__dirname, "..", "imageStore");
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir);
}

function loggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

router.get("/", (req, res) => {
  res.send("List of all images");
});

router.get("/:id", (req, res) => {
  res.send(`Info for just ${req.params.id}`);
});

router.post("/", loggedIn, async (req, res) => {
  try {
    const { imageUrl, sourceUrl, description } = req.body;
    const extname = path.extname(new URL(imageUrl).pathname).toLowerCase();
    const filename = uniqueFilename(imageDir) + extname;
    const imageFile = fs.createWriteStream(filename);

    const fields = {
      imageUrl: "img/" + path.basename(filename),
      sourceUrl,
      description,
      width: 1920,
      height: 1080,
      author: req.user
    };

    https.get(imageUrl, async response => {
      // Should we respond straight away, or wait for the download to complete?
      response.pipe(imageFile).on("finish", async () => {
        const image = new Image(fields);
        const result = await image.save();
        res.json(result);
      });
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/:id", loggedIn, (req, res) => {
  res.send("Updating an image");
});

router.delete("/:id", loggedIn, (req, res) => {
  res.send("Deleting an image");
});

module.exports = router;
