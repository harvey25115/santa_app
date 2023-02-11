// server.js
// where your node app starts

// init project
const express = require("express");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");
const hbs = require("hbs");
const santaRouter = require("./routes/santa");

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("combined"));

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// config views
app.set("view engine", "html"); // set view engine
app.engine("html", hbs.__express); // change extension from .hbs to .html

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (_, response) => {
  response.render("index");
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

// set santa router
app.use("/santa", santaRouter);
