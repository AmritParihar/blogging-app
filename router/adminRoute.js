const express = require("express");
const adminRouter = express.Router();
const authenticate = require("../Authentication/Auth");
const { logoutBlogger } = require("../controller/userController");

const {
  manageBlogger,
  deleteBlogger,
  editBlogger
} = require("../controller/AdminController");

//Admin desh and Admin API

adminRouter.get("/ManageBlogger", authenticate, manageBlogger);
adminRouter.post("/logoutAdmin", authenticate, logoutBlogger);

adminRouter.delete("/Blogger/:id", authenticate, deleteBlogger);
adminRouter.post("/editBlogger/:id", authenticate, editBlogger);

module.exports = adminRouter;
