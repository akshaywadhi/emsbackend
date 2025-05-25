import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  // Get token from header
  let token = req.header("x-auth-token");

  // If no x-auth-token, try Authorization header
  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

export default auth;
