const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model("Feedback", Schema);
module.exports = Feedback;
