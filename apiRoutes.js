// routes.js

const router = require("express").Router();
const controller = require("./controller");

router.route("/")
    .get(controller.get)
    .post(controller.new);

module.exports = router;