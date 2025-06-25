const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./router/route");
const path = require("path");
const adminRouter = require("./router/AdminRoute");
const bloggerRouter = require("./router/BloggerRoute")


const app = express();
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies


// CORS setup
app.use(
  cors({
    origin: true, // Allows requests from any origin, including local files
    credentials: true, // Allow credentials (cookies) to be included
  })
);

// Using the router for all routes
app.use(router);
// Using the AdminRoute for all adminActivity 
app.use("/Admin",adminRouter);
// Using the BloggerRoute for all bloggerActivity
app.use(bloggerRouter)


// Catching errors globally
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

// // Catching errors globally
// app.use(( req, res, next) => {
//   // console.error(err.stack);
//   res.status(500).send({ error: "Route not found!" });
// });

app.use(express.static(path.join(__dirname, "FrontEnd")));


app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "FrontEnd", "login.html"));
});


const PORT = process.env.PORT || 3000;
const SERVER = process.env.SERVER ;

// Start server
app.listen(PORT,() => {
  console.log(`Server running at ${SERVER}${PORT}`);
});  
