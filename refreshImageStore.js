#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const apiUrl = "http://localhost:8080/images";
const directory = "imageStore";

// Get the list of images from the server
const req = http.get(apiUrl, res => {
  console.log(`GET /images: ${res.statusCode} ${res.statusMessage}`);

  let body = "";
  res.on("data", data => {
    body += data;
  });

  res.on("end", () => {
    const images = JSON.parse(body);
    const filenames = [];

    for (const image of images) {
      const { imageUrl, originalUrl } = image;
      const filename = path.join(directory, path.basename(imageUrl));
      filenames.push(filename);

      // Download missing images
      if (!fs.existsSync(filename)) {
        const imageFile = fs.createWriteStream(filename);
        console.log(`Started downloading ${filename}`);
        https.get(originalUrl, res => {
          const stream = res.pipe(imageFile);
          stream.on("finish", () => {
            console.log(`Saved ${originalUrl} to ${filename}`);
          });
          stream.on("error", err => console.error(err));
        });
      }
    }

    // Clean extra files
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filename = path.join(directory, file);
      if (!filenames.includes(filename)) {
        fs.unlinkSync(path.join(directory, file));
        console.log(`Deleted ${file}`);
      }
    }
  });
});

req.on("error", err => console.error(err));
