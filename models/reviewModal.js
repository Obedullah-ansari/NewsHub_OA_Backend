const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Give some review"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  photo :String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, // Assuming a 1-5 star rating system
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review