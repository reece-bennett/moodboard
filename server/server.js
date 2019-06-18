// Load config variables from .env
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");
const mongoose = require("mongoose");
const apiRoutes = require("./apiRoutes");

// Connect to mongoose
const dbURL = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}`;
console.log(`Making connection to the database at '${dbURL}'...`);
mongoose.connect(dbURL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.resolve(__dirname, "..", "build")));
app.use("/img", express.static(path.resolve(__dirname, "..", "imageStore")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const CLIENT_ID = "551119125116-dh8arpi5njabjnqpamp10evsqk0ct87f.apps.googleusercontent.com";
const authClient = new OAuth2Client(CLIENT_ID);

app.use(async (req, res, next) => {
  const authorization = req.header("Authorization");
  if (authorization) {
    try {
      const idToken = authorization.split("Bearer ")[1];
      const ticket = await authClient.verifyIdToken({
        idToken: idToken,
        audience: CLIENT_ID
      });
      const payload = ticket.getPayload();
      req.user = payload.sub;
      req.profile = {
        email: payload.email,
        name: payload.name,
        givenName: payload.given_name,
        familyName: payload.family_name,
        picture: payload.picture
      };
    } catch (error) {
      console.error("Failed to validate token");
      console.error(error);
    }
  }
  console.log(`${req.method} ${req.path} User:${req.user}`);
  next();
});

app.use("/images", apiRoutes);

db.once("open", () => {
  app.listen(port, () => console.log(`Listening on port ${port}`));
});
