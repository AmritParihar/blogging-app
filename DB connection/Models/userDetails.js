const { DataTypes } = require("sequelize");
const DBConnection = require("../DatabaseConn");
const User = require("./UserModel");

const UserDetails = DBConnection.define(
  "userdetails",
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
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "userdetails",
    hooks: {
      // ✅ HOOK updated: beforeValidate instead of beforeSave
      beforeValidate: (userDetails) => {
        if (userDetails.firstName && userDetails.lastName) {
          userDetails.userName = `${userDetails.firstName} ${userDetails.lastName}`;
        }
      },
    },
  }
);

// ✅ Define associations
User.hasOne(UserDetails, {
  foreignKey: "userId",
  as: "details",
  onDelete: "CASCADE",
  hooks: true,
});
UserDetails.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = UserDetails;
