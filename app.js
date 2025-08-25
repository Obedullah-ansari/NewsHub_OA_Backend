const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const newsroutes = require("./routes/newsroutes");
const todoroutes = require("./routes/todoroutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorcontroller");
const userroutes = require("./routes/userroutes");
const userImageRoutes = require("./routes/userimagesroutes")


app.use(express.json());
app.use(
  cors({
    origin: [
      "https://feedbackform-one.vercel.app/",
      "https://feedbackform-git-main-obedullah-ansaris-projects.vercel.app/",
      "https://headlines-bukoldbx9-obedullah-ansaris-projects.vercel.app",
      "https://headlines-hub-git-main-obedullah-ansaris-projects.vercel.app",
      "https://obedullah-ansari.github.io",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Define allowed methods
    credentials: true, // If you're sending cookies or HTTP authentication
    optionsSuccessStatus: 200, // Response status for preflight requests
  })
);

// Handle preflight requests for all routes
app.options("*", cors()); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

require("./devData/Top-Headlines/create-topnews");

require("./devData/update-data");

app.use(
  "/uploads/users",
  express.static(path.join(__dirname, "uploads/users"))
);

app.use("/api/v1/headlines", newsroutes);
app.use("/api/v1/todo", todoroutes);
app.use("/api/v1/auth", userroutes);
app.use("/api/v1/image", userImageRoutes);


app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
