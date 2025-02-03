const dotenv = require("dotenv");
const News = require("../models/newsModel");
const Topnews = require("../models/topnewsmodal");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
dotenv.config({ path: "../.env" });

exports.getAllHeadlines = catchAsync(async (req, res, next) => {
  const headlines = await News.find();
  res.status(200).json({
    status: "success",
    data: {
      headlines,
    },
  });
});

exports.getAHeadlines = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const news = await News.findOne();

  if (!news) {
    return res.status(404).json({ message: "No news found" });
  }

  switch (id.toUpperCase()) {
    case "HT":
      return res.json(news.HT);
    case "TH":
      return res.json(news.TH);
    case "TOI":
      return res.json(news.TOI);
    default:
      return next(
        new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
      );
  }
});
exports.getAglobalHeadlines = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const news = await News.findOne();

  if (!news) {
    return res.status(404).json({ message: "No news found" });
  }

  switch (id.toUpperCase()) {
    case "HT":
      return res.json(news.HTG);
    case "TH":
      return res.json(news.THG);
    case "TOI":
      return res.json(news.TOIG);
    default:
      return next(
        new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
      );
  }
});

exports.getTopHeadLines = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const topnews = await Topnews.findOne();

  if (!topnews) {
    return res.status(404).json({ message: "No news found" });
  }

  switch (id.toUpperCase()) {
    case "INDIA":
      return res.json(topnews.INDIA);
    case "SPORTS":
      return res.json(topnews.SPORTS);
    case "EDUCATION":
      return res.json(topnews.EDUCATION);
    case "TECHNOLOGY":
      return res.json(topnews.TECHNOLOGY);
    default:
      return next(
        new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
      );
  }
});

exports.searchHeadlines = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new AppError("Please provide a search query", 400));
  }

  // Split the query into words for word-by-word matching
  const words = query.split(" ").map((word) => word.trim());

  // Create regex patterns for each word
  const regexQueries = words.map((word) => ({
    $or: [
      { "HT.headline": { $regex: word, $options: "i" } },
      { "TH.headline": { $regex: word, $options: "i" } },
      { "TOI.headline": { $regex: word, $options: "i" } },
      { "HTG.headline": { $regex: word, $options: "i" } },
      { "THG.headline": { $regex: word, $options: "i" } },
      { "TOIG.headline": { $regex: word, $options: "i" } },
    ],
  }));

  // Fetch all headlines matching the regex queries for each word in the query
  const results = await News.find({ $and: regexQueries }).lean();

  // If no results are found
  if (!results.length) {
    return res.status(404).json({
      status: "fail",
      message: "No headlines found matching your query",
    });
  }

  // Filter and clean the results to return matching headlines
  const filteredResults = [];
  results.forEach((doc) => {
    ["HT", "TH", "TOI", "HTG", "THG", "TOIG"].forEach((field) => {
      if (doc[field]) {
        doc[field].forEach((item) => {
          // Check if the headline matches the full query or each word from query
          const matchesAllWords = words.every((word) =>
            new RegExp(word, "i").test(item.headline)
          );

          if (matchesAllWords) {
            filteredResults.push({ field, ...item }); // Add the matching item with context
          }
        });
      }
    });
  });

  // Return filtered results with the count of matching items
  res.status(200).json({
    status: "success",
    results: filteredResults.length,
    data: filteredResults,
  });
});

