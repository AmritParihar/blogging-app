const { DataTypes } = require("sequelize");
const DBConnection = require('../DatabaseConn');
const BloggerCreatePost = require("./BloggerCreatePostModel");
const User = require("./UserModel");

const Like = DBConnection.define(
  "like",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: BloggerCreatePost, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: true,
    tableName: "like",
  }
);

// Associations
Like.belongsTo(BloggerCreatePost, { foreignKey: "postId", as: "likedPost" });
BloggerCreatePost.hasMany(Like, { foreignKey: "postId", as: "likes" });

Like.belongsTo(User, { foreignKey: "userId", as: "likedByUser" });
User.hasMany(Like, { foreignKey: "userId", as: "userLikes" });

module.exports = Like;
    