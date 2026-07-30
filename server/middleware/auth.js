const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");

/**
 * Verifies a JWT from the Authorization header and attaches the
 * corresponding admin to req.admin. Use on admin-only routes.
 */
const protectAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ success: false, message: "Admin no longer exists" });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};

/**
 * Verifies a JWT from the Authorization header and attaches the
 * corresponding user to req.user. Use on logged-in-user routes.
 */
const protectUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "user") {
      return res.status(403).json({ success: false, message: "User access required" });
    }
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User no longer exists" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};

module.exports = { protectAdmin, protectUser };
