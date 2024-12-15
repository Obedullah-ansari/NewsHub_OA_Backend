const express = require('express');
const  newscontroller = require("../controllers/newscontroller")
const authcontroller = require("./../controllers/authcontroller");
const newsroutes = express.Router();


newsroutes
.get("/", newscontroller.getAllHeadlines)
.get("/search", newscontroller.searchHeadlines);

newsroutes
.route("/global/:id")
.get(authcontroller.protected, newscontroller.getAglobalHeadlines)

newsroutes
.route("/:id")
.get(newscontroller.getAHeadlines)


newsroutes.route("/topheadlines/:id")
.get(newscontroller.getTopHeadLines);

module.exports = newsroutes;