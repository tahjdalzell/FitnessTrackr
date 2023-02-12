require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const bodyparser = require("body-parser");

app.use(morgan());
app.use(bodyparser.json());
app.use(cors());
app.use(express.json());

// Setup your Middleware and API Router here
const apiRouter = require("./api");
app.use("/api", apiRouter);

app.use("*", (req, res) => {
  res.status(404).send({
    message: "404 NOT FOUND",
  });
});

app.use((error, req, res) => {
  res.status(500).send({
    message: "INTERNAL SERVER ERROR",
  });
});

module.exports = app;
