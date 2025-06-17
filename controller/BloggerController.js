const User = require("../DB connection/Models/UserModel");
const UserDetails = require("../DB connection/Models/userDetails");
const Role = require("../DB connection/Models/Role");
const bloggerCreatePost = require("../DB connection/Models/bloggerCreatePost");
const { PutObjectCommand, CreateBucketCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../DB connection/AWSConfig");

// Blogger Profile
const BloggerProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you're getting user ID from authenticated middleware
    console.log("userId --=-=>>>>", userId);

    const userProfile = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: UserDetails,
          as: "details",
          attributes: [
            "firstName",
            "lastName",
            "userName",
            "city",
            "state",
            "zipCode",
            "contact"
          ]
        },
        {
          model: Role,
          as: "role",
          attributes: ["roleName"]
        }
      ],
      attributes: ["email", "profile_image"]
    });
    // console.log("userPrpfile =-=-=->>>",userProfile)

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const response = {
      email: userProfile.email,
      userName: userProfile.details.userName,
      firstName: userProfile.details.firstName,
      lastName: userProfile.details.lastName,
      location: `${userProfile.details.city}, ${userProfile.details.state}, ${userProfile.details.zipCode}`,
      contact: userProfile.details.contact,
      role: userProfile.role.roleName,
      profileImage: userProfile.profile_image || "default-profile.jpg" // Default profile image if not uploaded
    };
    console.log("userProfile details =-=-=-=->>>>>>>>", response);

    res.json(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Upload Profile Picture
const profileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    console.error("userId from profileImage:=-=->>>", userId);
    const file = req.file;
    console.error("file:=-=-=->>>", file);

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const bucketName = "blogger-profile-picture";

    //Create the S3 bucket if it doesn't exist
    const bucketParams = {
      Bucket: bucketName
    };
    console.log("BucketPrams ==--=-=-=>>", bucketParams);
    // Check if the bucket exists or create it
    try {
      await s3.send(new CreateBucketCommand(bucketParams));
      console.log("Bucket created successfully");
    } catch (createErr) {
      if (createErr.Code === "BucketAlreadyOwnedByYou") {
        console.log("Bucket already exists");
      } else {
        console.error("Error creating bucket:", createErr);
        return res
          .status(500)
          .json({ message: "Error creating bucket", error: createErr });
      }
    }

    //Define parameters for S3 upload
    const uploadParams = {
      Bucket: bucketName,
      Key: `profile-images/${userId}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    console.log("S3 Upload Params:", uploadParams);

    // Upload the image to S3
    const s3Response = await s3.send(new PutObjectCommand(uploadParams));
    console.error("s3 Response:", s3Response);

    const imageUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`; // Generate the image URL
    console.error("imageUrl:", imageUrl);

    //Find the user and update their profile image URL
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Update the user's profile image URL
    user.profile_image = imageUrl;
    await user.save();

    return res
      .status(200)
      .json({ message: "Profile image uploaded successfully", imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res
      .status(500)
      .json({ message: "Error uploading profile image", error });
  }
};

// Blogger Post
const BloggerPost = async (req, res) => {
  const userId = req.user.id;
  console.log("userId from BloggerPost:=-=->>>", userId);

  const { post_title, post_content, visibility } = req.body;
  const file = req.file;
  console.error("file:=-=-=->>>", file);

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const bucketName = "create-blogger-post";

  //Create the S3 bucket if it doesn't exist
  const bucketParams = {
    Bucket: bucketName
  };
  console.log("BucketPrams ==--=-=-=>>", bucketParams);
  // Check if the bucket exists or create it
  try {
    await s3.send(new CreateBucketCommand(bucketParams));
    console.log("Bucket created successfully");
  } catch (createErr) {
    if (createErr.Code === "BucketAlreadyOwnedByYou") {
      console.log("Bucket already exists");
    } else {
      console.error("Error creating bucket:", createErr);
      return res
        .status(500)
        .json({ message: "Error creating bucket", error: createErr });
    }
  }

  // Define parameters for S3 upload
  const uploadParams = {
    Bucket: bucketName,
    Key: `image/${userId}_${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  console.log("S3 Upload Params:", uploadParams);

  try {
    // Upload the image to S3
    await s3.send(new PutObjectCommand(uploadParams));
    console.log("Image uploaded to S3 successfully");

    // Generate the image URL
    const imageUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
    console.error("imageUrl:", imageUrl);

    // Save the post with image URL in the database
    const newPost = await bloggerCreatePost.create({
      post_title,
      post_content,
      image: imageUrl,
      visibility,
      userId // Add userId here
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      data: newPost
    });
  } catch (error) {
    console.error("Error uploading to S3 or saving post:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



const getPostId = async (req, res) => {
  const postId = req.params.id;
  if (!postId) return res.status(400).json({ success: false, message: "Invalid Post ID" });

  try {
      const post = await bloggerCreatePost.findByPk(postId); // Check your ORM method
      if (!post) return res.status(404).json({ success: false, message: "Post not found" });

      res.json({ success: true, post });
  } catch (error) {
      res.status(500).json({ success: false, message: "Server Error", error });
  }
};




const BloggerPostEdit = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // FIXED: changed from postId to id
  console.log("userId from BloggerEdit:", userId, "Editing post:", id);

  if (!id || id === "null") {
      return res.status(400).json({ message: "Invalid post ID" });
  }

  const { post_title, post_content, visibility } = req.body;
  const file = req.file;
  console.log("Uploaded file:", file);

  try {
      // Find the existing post
      const existingPost = await bloggerCreatePost.findOne({
          where: { id: id, userId: userId }, // FIXED: Use `id`
      });

      if (!existingPost) {
          return res.status(404).json({ message: "Post not found or unauthorized" });
      }

      let imageUrl = existingPost.image; // Retain old image if no new file is uploaded

      if (file) {
          const bucketName = "create-blogger-post";
          const uploadParams = {
              Bucket: bucketName,
              Key: `image/${userId}_${Date.now()}_${file.originalname}`,
              Body: file.buffer,
              ContentType: file.mimetype,
          };

          console.log("Uploading new image to S3 with params:", uploadParams);
          await s3.send(new PutObjectCommand(uploadParams));
          console.log("New image uploaded to S3 successfully");

          // Generate new image URL
          imageUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
          console.log("Updated image URL:", imageUrl);
      }

      // Update the post in the database
      await bloggerCreatePost.update(
          {
              post_title,
              post_content,
              image: imageUrl,
              visibility,
          },
          { where: { id: id, userId: userId } }
      );

      res.status(200).json({
          success: true,
          message: "Post updated successfully!",
      });
  } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Server error", error });
  }
};




const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const offset = (page - 1) * limit;

    // Ensure user is logged in
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    // Fetch only logged-in blogger's posts
    const posts = await bloggerCreatePost.findAndCountAll({
      where: { userId: req.user.id },
      offset,
      limit,
      order: [["id", "DESC"]],
      attributes: ["id", "post_title", "post_content", "image", "createdAt"],
    });

    console.log("Blogger's posts:", posts.rows);

    const totalPages = Math.ceil(posts.count / limit);

    res.status(200).json({
      success: true,
      data: posts.rows,
      pagination: {
        totalPosts: posts.count,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { BloggerProfile, getPostId ,profileImage, BloggerPost, getAllPosts ,BloggerPostEdit};

