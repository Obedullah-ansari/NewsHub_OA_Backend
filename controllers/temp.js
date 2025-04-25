const FeedbackModal = require("./../models/tempModal");
const catchAsync = require("./../utils/catchAsync");


exports.createFeedBack = catchAsync(async (req, res, next) => {
  const { name, email, message } = req.body;
  const feedback = await FeedbackModal.create({
    name,
    email,
    message,
  });
  res.status(200).json({
    status: "success",
    data: {
      feedback,
    },
  });
}
)

exports.getFeedback = catchAsync(async (req, res, next) => {
  const feedback = await FeedbackModal.find();
  res.status(200).json({
    status: "success",
    data: {
      feedback,
    },
  });
}
)