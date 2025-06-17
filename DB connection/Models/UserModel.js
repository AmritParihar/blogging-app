const { DataTypes } = require("sequelize");
const DBConnection = require("../DatabaseConn");
const Role = require("./Role");

const User = DBConnection.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      defaultValue: 2, // Default to Blogger (roleId = 2)
      references: {
        model: Role, // Reference to the Role model
        key: "id",
      },
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Active", // Automatically set to Active
    },
  },
  {
    underscored: true,
    timestamps: true,
    tableName: "user",
  }
);

// A User belongs to a Role
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

module.exports = User;
