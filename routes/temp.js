const express = require("express");
const FeedbackController = require("../controllers/temp");

const feedbackRoutes = express.Router();

feedbackRoutes
  .get("/getfeedbackform", FeedbackController.getFeedback)
  .post("/createfeedbackform", FeedbackController.createFeedBack);

module.exports = feedbackRoutes;
