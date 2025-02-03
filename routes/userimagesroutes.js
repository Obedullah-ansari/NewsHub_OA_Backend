const express = require("express");
const userImageController = require("../controllers/userimagecontroller");
const authcontroller = require("../controllers/authcontroller");
const userImagesRoutes = express.Router();

userImagesRoutes.post(
  "/uploaduserimage",
  authcontroller.protected,
  userImageController.userImages
);

userImagesRoutes.post(
  "/deleteimages",
  authcontroller.protected,
  userImageController.deleteUserImage
);

module.exports = userImagesRoutes;
