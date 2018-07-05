"use strict";
const express = require("express");
const logger = require("morgan");
const nunjucks = require("nunjucks");

const dashboardRoute = require("./dashboard");

const app = express();

app.use(logger("dev"));

const templateEnv = nunjucks.configure(".", {
  autoescape: true,
  express: app
});

app.set("view engine", "njk").set("engineEnv", templateEnv);

dashboardRoute(app);

module.exports = app;
