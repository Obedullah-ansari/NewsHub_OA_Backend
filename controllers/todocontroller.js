const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const Todo = require("../models/todoModal");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.createTodo = catchAsync(async (req, res,next) => {
  const todo = await Todo.create({
    title: req.body.title,
    user: req.user._id, // The user ID will come from the logged-in user
  });
  res.status(201).json({
    status: "success",
    data: {
      todo,
    },
  });
});

// Get all todos for the logged-in user
exports.getUserTodos = catchAsync(async (req, res,next) => {
  const todos = await Todo.find({ user: req.user._id }); // Find todos based on the user ID
  res.status(200).json({
    status: "success",
    results: todos.length,
    data: {
      todos,
    },
  });
});

// Delete a todo
exports.deleteTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findByIdAndDelete({
    _id: req.params.id,    // The Todo's ID
    user: req.user._id,    // The User's ID (from req.user set in the protected route)
  });


  // If no todo is found, return a 404 error
  if (!todo) {
    return next(new AppError('No todo found with that ID for the current user', 404));
  }

  // Success response
  res.status(200).json({
    status: 'success',
    data: todo,
  });

});


exports.updateTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Get the todoId from the URL params
  const { title, completed } = req.body; // Get updated fields from the request body

  // Find the todo item that belongs to the current user
  const todo = await Todo.findOne({ _id: id, user: req.user._id });


  // If no todo found, return 404
  if (!todo) {
    return res.status(404).json({
      status: "fail",
      message: "No todo found with that ID for the current user",
    });
  }

  // Update fields if provided
  if (title !== undefined) {
    todo.title = title;
  }
  if (completed !== undefined) {
    todo.completed = completed;
  }

  // Save the updated todo
  await todo.save();

  // Return the updated todo item
  res.status(200).json({
    status: "success",
    data: {
      todo,
    },
  });
});
