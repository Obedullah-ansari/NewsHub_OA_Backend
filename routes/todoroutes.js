const express = require("express");
const todocontroller = require("../controllers/todocontroller");
const todoroutes = express.Router();
const authcontroller = require("./../controllers/authcontroller");

todoroutes
  .route("/")
  .get(authcontroller.protected, todocontroller.getUserTodos)
  .post(authcontroller.protected, todocontroller.createTodo);

todoroutes
  .route("/:id")
  .delete(authcontroller.protected, todocontroller.deleteTodo)
  .put(authcontroller.protected, todocontroller.updateTodo);

module.exports = todoroutes;
