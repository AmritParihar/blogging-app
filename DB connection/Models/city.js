const { DataTypes,} = require('sequelize');
const State = require('./state'); // Ensure the correct path
const DBConnection = require('../DatabaseConn');

const City = DBConnection.define('city', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: State, // Reference State model
            key: 'id',
        },
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'city',
    timestamps: true,
});

// Define associations
State.hasMany(City, { foreignKey: 'stateId' });
City.belongsTo(State, { foreignKey: 'stateId' });

module.exports = City;
