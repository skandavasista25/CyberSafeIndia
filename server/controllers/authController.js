const Admin = require("../models/Admin");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc  Admin login
// @route POST /api/auth/admin/login
const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username }).select("+password");
  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }
  res.json({
    success: true,
    token: generateToken(admin._id, "admin"),
    admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role },
  });
});

// @desc  Register a new public user
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: "An account with this email already exists" });

  const user = await User.create({ name, email, password });
  res.status(201).json({
    success: true,
    token: generateToken(user._id, "user"),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// @desc  User login
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  res.json({
    success: true,
    token: generateToken(user._id, "user"),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// @desc  Get the logged-in user's own profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { adminLogin, registerUser, loginUser, getMe };
