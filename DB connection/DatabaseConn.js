require("dotenv").config();
const { Sequelize } = require("sequelize");

const DBConnection = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: 'mysql', // Must match Sequelize supported dialects
    logging: false, // optional: to disable SQL logs in console
  }
);

// Test connection
async function connectToDatabase() {
  try {
    await DBConnection.authenticate();
    console.log("<<==-- Database connection successful --==>>");
  } catch (error) {
    console.error("<<==-- Failed to connect to the database --==>>", error);
  }
}
connectToDatabase();

module.exports = DBConnection;
