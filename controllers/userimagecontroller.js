const multer = require("multer");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const userModel = require("../models/userModel");
const review = require("../models/reviewModal");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Multer with Cloudinary Storage
const storage = multer.memoryStorage(); // No local storage, upload directly
const upload = multer({ storage }).single("image");

// Upload Image to Cloudinary
exports.userImages = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return next(new AppError("Image upload failed", 500));
    }

    if (!req.file) {
      return next(new AppError("No image file uploaded", 400));
    }

    const id = req.user._id;
    const user = await userModel.findOne({ _id: id });

    if (!user) {
      return next(new AppError("No user found with this ID", 404));
    }

    try {
      const uploadToCloudinary = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "HeadlinesHub" },
            (error, result) => {
              if (error) reject(new AppError("Cloudinary upload failed", 500));
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      };

      const result = await uploadToCloudinary(req.file.buffer);

      await userModel.findOneAndUpdate(
        { _id: id },
        { $set: { photo: result.secure_url } },
        { new: true }
      );

      await review.findOneAndUpdate(
        { user: id },
        { $set: { photo: result.secure_url } },
        { new: true }
      );

      res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
      });
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      return next(new AppError("Cloudinary upload failed", 500));
    }
  });
});

// Delete Image from Cloudinary
exports.deleteUserImage = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const user = await userModel.findOne({ _id: id });

  if (!user) return next(new AppError("No user found with this ID", 404));
  if (!user.photo)
    return next(new AppError("No image found for this user", 404));

  // Extract Correct Public ID
  const publicId = user.photo.split("/").pop().split(".")[0];

  try {
    const imageDetails = await cloudinary.api
      .resource(`HeadlinesHub/${publicId}`)
      .catch((err) => null);

    if (!imageDetails) {
      return next(new AppError("Image does not exist in Cloudinary", 404));
    }

    // Attempt to delete
    const result = await cloudinary.uploader.destroy(
      `HeadlinesHub/${publicId}`
    );

    if (result.result !== "ok") {
      return next(new AppError("Cloudinary image deletion failed", 500));
    }

    // Update User and Review
    await userModel.findOneAndUpdate(
      { _id: id },
      { photo: "default.jpg" },
      { new: true }
    );
    await review.findOneAndUpdate(
      { user: id },
      { photo: "default.jpg" },
      { new: true }
    );

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    return next(new AppError("Image deletion failed", 500));
  }
});
