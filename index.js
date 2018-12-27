// index.js

const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

// Load config variables from .env
require('dotenv').config();

// Connect to mongoose
mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.URL}`)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("public"));

// Enable CORS https://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Configue bodyparser so we can handle post requests
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

const apiRoutes = require("./apiRoutes");
app.use("/api", apiRoutes);

// Once the database connection is opened start the server
db.once("open", () => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
