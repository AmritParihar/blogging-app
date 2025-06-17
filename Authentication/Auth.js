const jwt = require("jsonwebtoken");
const User = require("../DB connection/Models/UserModel");

const authenticate = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided or wrong format" });
    }

    // Extract the token part after "Bearer "
    const token = authHeader.split(" ")[1];

    // Decode the token to get the user ID
    const decodedToken = jwt.decode(token);
   
    if (!decodedToken || !decodedToken.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decodedToken.userId; // Extract the userId from the decoded token

    // Fetch the user based on the userId from the token
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine the correct secret key based on the user's role
    let secretKey;
    if (user.role_id === 1) {
      secretKey = process.env.ADMIN_SECRET_KEY; // Admin role
    } else if (user.role_id === 2) {
      secretKey = process.env.BLOGGER_SECRET_KEY; // Blogger role
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized: Invalid user role" });
    }

    // Verify the token with the correct secret key
    jwt.verify(token, secretKey, (err, verifiedToken) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Attach userId and user details to request for subsequent middlewares
      req.user = user;
      req.user.id = user;
      req.userId = userId;
      req.token = token;

      // Proceed to the next middleware or route handler
      next();
    });
  } catch (err) {
    console.error("Error in authentication:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

module.exports = authenticate;
