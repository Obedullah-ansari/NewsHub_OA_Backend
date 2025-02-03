const express = require("express");
const authController = require("./../controllers/authcontroller");
const userController = require("../controllers/reviewcontroller");
const userRoutes = express.Router();

// Chain routes with the same method or path
userRoutes
  .post("/signup", authController.signup)
  .post("/login", authController.login)
  .post("/forgetpassword", authController.forgetPassword)
  .patch("/resetpassword/:token", authController.resetPassword)
  .get("/resetpassword/:token", authController.renderResetPasswordPage)
  .patch("/updateReview", authController.protected, userController.updateReview)
  .get("/profile/:id", authController.protected, userController.getAUsers)
  .post("/review", authController.protected, userController.usersreview)
  .delete(
    "/deleteReview",
    authController.protected,
    userController.deleteReview
  )
  .get("/allusers", userController.getAllUsers)
  .get("/allreviews", userController.getAllUsersReview)
  

module.exports = userRoutes;
