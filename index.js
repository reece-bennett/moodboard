// index.js

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

// Load config variables from .env
require('dotenv').config();

// Connect to mongoose
const dbURL = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}`;
console.log(`Making connection to the database at '${dbURL}'...`);
mongoose.connect(dbURL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("public"));

app.use(cors());

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
