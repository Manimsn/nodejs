const express = require("express");
const router = express.Router();
const path = require("path");

router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/new-page(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "new-page.html"));
});

router.get("/old-page(.html)?", (req, res) => {
  res.redirect(301, "new-page.html"); //302 by default
  // //301 we need to specify to tell the server that this is permanent redirection
});

router.get(
  "/hello(.html)?",
  (req, res, next) => {
    console.log("Requestd to load hello.html");
    next();
  },
  (req, res) => {
    // res.sendFile(path.join(__dirname, "views", "hello.html"));
    res.send("Hello world");
  }
);

const one = (req, res, next) => {
  console.log("One");
  next();
};

const two = (req, res, next) => {
  console.log("two");
  next();
};

const three = (req, res, next) => {
  console.log("three");
  res.send("Finished!");
};

router.get("/chain(.html)?", [one, two, three]);

module.exports = router;
