const dotenv = require("dotenv");
const News = require("../models/newsModel");
const Topnews = require("../models/topnewsmodal");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
dotenv.config({ path: "../config.env" });

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
  const { query } = req.query; // Extract the search query from request query

  // Ensure a search query is provided
  if (!query) {
    return next(new AppError("Please provide a search query", 400));
  }

  // Query the database to find headlines matching the search term
  const results = await News.find(
    {
      $or: [
        { HT: { $elemMatch: { headline: { $regex: query, $options: "i" } } } },
        { TH: { $elemMatch: { headline: { $regex: query, $options: "i" } } } },
        { TOI: { $elemMatch: { headline: { $regex: query, $options: "i" } } } },
        { HTG: { $elemMatch: { headline: { $regex: query, $options: "i" } } } },
        { THG: { $elemMatch: { headline: { $regex: query, $options: "i" } } } },
        {
          TOIG: { $elemMatch: { headline: { $regex: query, $options: "i" } } },
        },
      ],
    },
    { HT: 1, TH: 1, TOI: 1, HTG: 1, THG: 1, TOIG: 1, _id: 0 } // Projection to include only relevant fields
  ).lean();

 

  // If no results are found, return an error response
  if (!results.length) {
    return res.status(404).json({
      status: "fail",
      message: "No headlines found matching your query",
    });
  }

  // Filter and clean the results to return only matching headlines
  const filteredResults = [];
  results.forEach((doc) => {
    ["HT", "TH", "TOI", "HTG", "THG", "TOIG"].forEach((field) => {
      if (doc[field]) {
        doc[field].forEach((item) => {
          if (new RegExp(query, "i").test(item.headline)) {
            filteredResults.push({ field, ...item }); // Add the matching item with context
          }
        });
      }
    });
  });
  

  // Send the filtered results back to the client
  res.status(200).json({
    status: "success",
    results: filteredResults.length,
    data: filteredResults,
  });
});
