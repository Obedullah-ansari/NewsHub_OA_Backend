const mongoose = require("mongoose");

const topnewsSchema = new mongoose.Schema({
  INDIA: {
    type: [
      {
        topheadline: String,
      },
    ],
    default: [],
  },
  SPORTS: {
    type: [
      {
        topheadline: String,
      },
    ],
    default: [],
  },
  EDUCATION: {
    type: [
      {
        topheadline: String,
      },
    ],
    default: [],
  },
  TECHNOLOGY: {
    type: [
      {
        topheadline: String,
      },
    ],
    default: [],
  },
});

const Topnews = mongoose.model("Topnews", topnewsSchema);

module.exports = Topnews;
