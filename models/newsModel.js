const mongoose = require("mongoose");
const newsSchema = new mongoose.Schema({
  HT: {
    type: [
      {
        headline: String,
        href: String,
        imageUrl: String,
      },
    ],
    default: [],
  },
  TH: {
    type: [
      {
        headline: String,
        href: String,
        imageUrl: String,
      },
    ],
    default: [],
  },
  TOI: {
    type: [
      {
        headline: String,
        href: String,
        imageUrl: String,
      },
    ],
    default: [],
  },
  HTG: {
    type: [
      {
        headline: String,
        href: String,
        imageUrl: String,
      },
    ],
    default: [],
  },
  THG: {
    type: [
      {
        headline: String,
        href: String,
        imageUrl: String,
      },
    ],
    default: [],
  },
  TOIG: {
    type: [
      {
        headline: String,
        href: String,
        imageUrl: String,
      },
    ],
    default: [],
  },

});

const News = mongoose.model("News", newsSchema);
module.exports = News;
