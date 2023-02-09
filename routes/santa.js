const express = require("express");
const router = express.Router();
const santaController = require("../controllers/santa-controller");

// /santa/send api
router.post("/send", santaController.send);

module.exports = router;
