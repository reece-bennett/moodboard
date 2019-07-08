const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const apiUrl = "http://localhost:8080/images";
const directory = "imageStore";

// Get the list of images from the server
const req = http.get(apiUrl, res => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);

  let body = "";
  res.on("data", data => {
    body += data;
  });

  res.on("end", () => {
    const images = JSON.parse(body);

    // Clean directory
    const files = fs.readdirSync(directory);
    for (const file of files) {
      fs.unlinkSync(path.join(directory, file));
      console.log(`Deleted ${file}`);
    }

    // Download images
    for (const image of images) {
      const { imageUrl, originalUrl } = image;
      const filename = path.join(directory, path.basename(imageUrl));
      const imageFile = fs.createWriteStream(filename);
      console.log(`Started downloading ${filename}`);

      https.get(originalUrl, res => {
        const stream = res.pipe(imageFile);
        stream.on("finish", () => {
          console.log(`Saved ${originalUrl} to ${filename}`);
        });
        stream.on("error", err => {
          console.error(err);
        });
      });
    }
  });
});

req.on("error", err => {
  console.error(err);
});
