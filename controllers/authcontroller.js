const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const AppError = require("./../utils/appError");
dotenv.config({ path: "../config.env" });
const sendEmail = require("./../utils/email");
const crypto = require("crypto");
const Review = require("../models/reviewModal");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/users"); // Directory for storing user profile images
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user._id}-${Date.now()}${ext}`); // File naming convention
  },
});

const upload = multer({
  storage: storage,
  // limits: { fileSize: 500 * 1024 }, // Limit file size to 500 KB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true); // Accept only image files
    } else {
      cb(new AppError("Not an image! Please upload only images.", 400), false);
    }
  },
});

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmed: req.body.passwordConfirmed,
    passwordChangedAt: req.body.passwordChangedAt,
    photo: req.file ? req.file.filename : "defualt.jpg",
  });

  const token = signToken(newUser._id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1.> checking is email and password exist;
  if (!email || !password)
    return next(new AppError("please enter email and passowrd", 401));

  //2.> checking is email is valid and password is correct
  const user = await User.findOne({ email: email }).select("+password");

  //3.> checking the  passowrd correct logic
  if (!user || !(await user.correctpassword(password, user.password)))
    return next(new AppError("Either email or password is incorrect"));

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    userId: user._id,
    token,
  });
});

exports.protected = catchAsync(async (req, res, next) => {
  let usertoken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    usertoken = req.headers.authorization.split(" ")[1]; // Extract the token
  }

  if (!usertoken) {
    return next(
      new AppError("You are not logged in. Please log in to get access.", 401)
    );
  }

  const decode = await jwt.verify(usertoken, process.env.SECRETKEY);
  const currentUser = await User.findById(decode.id);

  if (!currentUser) {
    return next(
      new AppError("The token belongs to a user who no longer exists", 401)
    );
  }

  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(new AppError("User has recently changed their password", 401));
  }

  req.user = currentUser;
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("Please enter the correct email", 401));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `Click on the link below to reset your password: ${resetURL}.\nIf you did not request this, please ignore.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });
    console.log("contineu");

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.PasswordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Something went wrong. Please try again later.", 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashtoken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    PasswordResetToken: hashtoken,
    PasswordResetExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new AppError("Token is expired or invalid"), 400);
  }

  user.password = req.body.password;
  user.passwordConfirmed = req.body.passwordConfirmed;
  user.PasswordResetExpire = undefined;
  user.PasswordResetToken = undefined;

  await user.save();
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.renderResetPasswordPage = (req, res) => {
  const token = req.params.token; // Capture the token from the URL
  res.render("resetpasswordpage", { token }); // Pass the token to the EJS view
};

// Upload middleware
exports.uploadUserPhoto = upload.single("photo");

exports.updateProfile = catchAsync(async (req, res, next) => {
  const updatedData = {};

  // Update the name if provided
  if (req.body.name) updatedData.name = req.body.name;

  // Update the email if provided
  if (req.body.email) updatedData.email = req.body.email;

  // Find the user before updating to get the current photo filename
  const user = await User.findById(req.user._id);

  // Check if a new photo is uploaded
  if (req.file) {
    // Delete the previous photo if it's not the default one
    if (user.photo && user.photo !== "default.jpg") {
      const oldPhotoPath = path.join(
        __dirname,
        "..",
        "uploads",
        "users",
        user.photo
      );

      // Check if the file exists before deleting
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlink(oldPhotoPath, (err) => {
          if (err) {
            console.error("Error deleting previous photo:", err);
          }
        });
      } else {
        console.log("Previous photo does not exist, no need to delete.");
      }
    }

    updatedData.photo = req.file.filename; // Set the new photo filename
  }

  // Ensure that at least one field is provided for update
  if (Object.keys(updatedData).length === 0) {
    return next(new AppError("Please provide data to update", 400));
  }

  // Update the User model
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedData, {
    new: true,
    runValidators: true,
  });

  // Update all reviews associated with this user, if the photo was updated
  if (req.file) {
    await Review.updateMany(
      { user: req.user._id },
      { photo: req.file.filename } // Use req.file.filename as the new profile image
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteProfilePhoto = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if the photo is not the default one
  if (user.photo && user.photo !== "default.jpg") {
    const oldPhotoPath = path.join(
      __dirname,
      "..",
      "uploads",
      "users",
      user.photo
    );

    // Check if the file exists before attempting to delete
    if (fs.existsSync(oldPhotoPath)) {
      fs.unlink(oldPhotoPath, (err) => {
        if (err) {
          console.error("Error deleting previous photo:", err);
          return next(new AppError("Failed to delete profile photo", 500));
        }
      });
    }
  }

  // Update user photo to default
  user.photo = "default.jpg";
  await user.save();

  await Review.updateMany(
    { user: req.user._id },
    { photo: "default.jpg" } // Use "default.jpg" as the new default profile image
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
