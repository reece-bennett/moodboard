const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "client", "build")));

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

function loggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

app.get("/api", (req, res) => {
  res.json({ message: "Hello world!" });
});

app.get("/secret", loggedIn, (req, res) => {
  res.json({ message: `Secret page for ${req.user}` });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
