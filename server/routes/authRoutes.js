const express = require("express");
const { body } = require("express-validator");
const { adminLogin, registerUser, loginUser, getMe } = require("../controllers/authController");
const { protectUser } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post(
  "/admin/login",
  authLimiter,
  [body("username").trim().notEmpty().withMessage("Username is required"), body("password").notEmpty().withMessage("Password is required")],
  validate,
  adminLogin
);

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  registerUser
);

router.post(
  "/login",
  authLimiter,
  [body("email").isEmail().withMessage("A valid email is required").normalizeEmail(), body("password").notEmpty().withMessage("Password is required")],
  validate,
  loginUser
);

router.get("/me", protectUser, getMe);

module.exports = router;
