const express = require("express");
const authController = require("./../controllers/authcontroller");
const userController = require("./../controllers/usercontroller");
const userRoutes = express.Router();

// Chain routes with the same method or path
userRoutes
  .post("/signup", authController.signup)
  .post("/login", authController.login)
  .post("/forgetpassword", authController.forgetPassword)
  .patch("/resetpassword/:token", authController.resetPassword)
  .get("/resetpassword/:token", authController.renderResetPasswordPage)
  .patch( "/updateProfile",authController.protected,authController.uploadUserPhoto, authController.updateProfile)
  .patch("/updateReview", authController.protected, userController.updateReview)
  .get("/profile/:id", authController.protected, userController.getAUsers)
  .post("/review", authController.protected, userController.usersreview)
  .delete("/deleteReview", authController.protected, userController.deleteReview)
  .get("/allusers", userController.getAllUsers)
  .get("/allreviews", userController.getAllUsersReview)
  .delete("/deletePhoto", authController.protected, authController.deleteProfilePhoto);

module.exports = userRoutes;
