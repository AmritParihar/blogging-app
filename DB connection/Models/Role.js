const { DataTypes } = require('sequelize');
const DBConnection = require('../DatabaseConn')

const Role = DBConnection.define('role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roleName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
}, {
  timestamps: true, 
  tableName: "role",
});

module.exports = Role;
