require("dotenv").config();
const { Sequelize } = require("sequelize");

// const DBConnection = new Sequelize(
//   process.env.DATABASE,
//   process.env.USER,
//   process.env.PASSWORD,
//   {
//     host: process.env.DBHOST,
//     dialect: process.env.DIALECT,
//   }
// );

const DBConnection = new Sequelize(
process.env.DATABASE_NAME,
process.env.DATABASE_USERNAME,
process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: process.env.DIALECT,
  }
);



// Connect to the database
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
