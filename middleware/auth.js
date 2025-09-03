import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  console.log("Auth middleware called for:", req.method, req.originalUrl);
  console.log("Headers:", req.headers);

  let token = req.header("x-auth-token");


  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); 
    }
  }

  console.log("Token found:", !!token);

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully for user:", decoded.id);

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
