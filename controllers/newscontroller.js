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
  const { query } = req.query;
  if (!query) {
    return next(new AppError("Please provide a search query", 400));
  }

  // Use substring regex to match partial inputs
  const substringQuery = {
    $or: [
      { "HT.headline": { $regex: query, $options: "i" } },
      { "TH.headline": { $regex: query, $options: "i" } },
      { "TOI.headline": { $regex: query, $options: "i" } },
      { "HTG.headline": { $regex: query, $options: "i" } },
      { "THG.headline": { $regex: query, $options: "i" } },
      { "TOIG.headline": { $regex: query, $options: "i" } },
    ],
  };

  const results = await News.find(substringQuery).lean();

  if (!results.length) {
    return res.status(404).json({
      status: "fail",
      message: "No headlines found matching your query",
    });
  }

  res.status(200).json({
    status: "success",
    results: results.length,
    data: results,
  });
});

