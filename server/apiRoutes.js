const express = require("express");
const fs = require("fs");
const https = require("https");
const sizeOf = require("image-size");
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

function downloadImage(imageUrl) {
  const extname = path.extname(new URL(imageUrl).pathname).toLowerCase();
  const filename = uniqueFilename(imageDir) + extname;
  const imageFile = fs.createWriteStream(filename);

  return new Promise((resolve, reject) => {
    https.get(imageUrl, res => {
      const stream = res.pipe(imageFile);
      stream.on("finish", () => {
        resolve({
          localUrl: "img/" + path.basename(filename),
          dimensions: sizeOf(filename)
        });
      });
      stream.on("error", error => {
        reject(error);
      });
    });
  });
}

router.get("/", async (req, res) => {
  try {
    const result = await Image.find();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    res.send(image);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.post("/", loggedIn, async (req, res) => {
  try {
    const { imageUrl, sourceUrl, description } = req.body;
    const { localUrl, dimensions } = await downloadImage(imageUrl);
    const image = new Image({
      imageUrl: localUrl,
      sourceUrl,
      description,
      width: dimensions.width,
      height: dimensions.height,
      author: req.user
    });
    const result = await image.save();
    res.json(result)

  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.put("/:id", loggedIn, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.sendStatus(404);
    }
    if (req.user != image.author) {
      return res.sendStatus(403);
    }

    const fields = {};
    for (const key of ["imageUrl", "sourceUrl", "description"]) {
      if (req.body[key]) fields[key] = req.body[key];
    }

    if (fields.imageUrl) {
      const { localUrl, dimensions } = await downloadImage(fields.imageUrl);
      fields.imageUrl = localUrl;
      fields.width = dimensions.width;
      fields.height = dimensions.height;
    }
    
    image.set(fields);
    const result = await image.save();
    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.delete("/:id", loggedIn, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.sendStatus(404);
    }
    if (req.user != image.author) {
      return res.sendStatus(403);
    }

    const result = await Image.deleteOne({ _id: req.params.id });
    if (result.ok) {
      res.json(image);
    } else {
      throw new Error("Delete was not OK");
    }

  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
