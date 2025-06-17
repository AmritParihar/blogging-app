const express = require("express");
const bloggerRouter = express.Router();
const authenticate = require("../Authentication/Auth");
const upload = require("../DB connection/multerConfig");
const { logoutBlogger } = require("../controller/userController");
const {
    getPostId ,
  BloggerPostEdit,
  BloggerProfile,
  profileImage,
  BloggerPost,
  getAllPosts
} = require("../controller/BloggerController");

// logout BLogger
bloggerRouter.post("/logoutBlogger", authenticate, logoutBlogger);
// Get Blogger Profile
bloggerRouter.get("/BloggerProfile", authenticate, BloggerProfile);

bloggerRouter.post("/BloggerPostEdit/:id", authenticate, upload.single("image"), BloggerPostEdit);
bloggerRouter.get("/Blogger/getPostById/:id",authenticate,getPostId )


// Blogger Post

bloggerRouter.post(
  "/Blogger/blogger-post/:id",
  authenticate,
  upload.single("image"),
  BloggerPost
);
// Upload Profile Image
bloggerRouter.post(
  "/profileImage",
  authenticate,
  upload.single("profile_image"),
  profileImage
);
bloggerRouter.get("/Blogger/getAllPost", authenticate, getAllPosts);

module.exports = bloggerRouter;
