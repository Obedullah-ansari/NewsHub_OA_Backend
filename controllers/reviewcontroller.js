const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const Review = require("../models/reviewModal");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

exports.getAUsers = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (!user) return next(new AppError("User not found", 404)); // Optional: Add a status code

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getAllUsersReview = catchAsync(async (req, res, next) => {
  const review = await Review.find();

  res.status(200).json({
    status: "success",
    data: review,
  });
});

exports.usersreview = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  const existingReview = await Review.findOne({ user: req.user._id });

  if (existingReview) {
    return res.status(400).json({
      status: "error",
      message: "You have already submitted a review. Please edit it instead.",
    });
  }

  const review = await Review.create({
    user: req.user._id,
    name: user.name,
    review: req.body.review,
    photo: user.photo,
    rating: Number(req.body.rating),
  });

  res.status(201).json({
    status: "success",
    review,
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndUpdate(
    { user: req.user._id },
    {
      review: req.body.review,
      rating: req.body.rating,
    },
    { new: true, runValidators: true }
  );

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndDelete({ user: req.user._id });

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
