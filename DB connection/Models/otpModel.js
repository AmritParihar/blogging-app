const { DataTypes } = require('sequelize');
const DBConnection = require('../DatabaseConn'); // Adjust this based on your structure
const User = require('../Models/UserModel'); // Ensure the correct path to the User model

const OTP = DBConnection.define('otp', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Refers to the User model
            key: 'id',
        },
        onUpdate: 'CASCADE', // Ensures the foreign key is updated if the user ID changes
        onDelete: 'CASCADE', // Deletes OTP entries if the associated user is deleted
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 6], // OTP should be exactly 6 characters long
        },
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: true, // This will automatically manage createdAt and updatedAt fields
    tableName: 'otp', // Specify the table name
});

// Define associations
User.hasMany(OTP, { foreignKey: 'userId' });
OTP.belongsTo(User, { foreignKey: 'userId' });

module.exports = OTP;
