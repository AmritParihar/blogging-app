const { DataTypes } = require("sequelize");
const DBConnection = require('../DatabaseConn');
const User = require("./UserModel");

const bloggerCreatePost = DBConnection.define(
  "bloggercreatepost",
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
    post_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visibility: {
      type: DataTypes.ENUM("public", "private"),
      allowNull: false,
      defaultValue: "public",
    },
  },
  {
    timestamps: true,
    tableName: "bloggercreatepost",
  }
);

// Associations
bloggerCreatePost.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(bloggerCreatePost, { foreignKey: "userId", as: "posts" });

module.exports = bloggerCreatePost;
