const express = require("express");
const { body } = require("express-validator");
const { submitFeedback, getFeedback, deleteFeedback } = require("../controllers/feedbackController");
const { protectAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const feedbackValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("message").trim().notEmpty().isLength({ max: 3000 }).withMessage("Message is required (max 3000 characters)"),
];

router.post("/", feedbackValidation, validate, submitFeedback);
router.get("/", protectAdmin, getFeedback);
router.delete("/:id", protectAdmin, deleteFeedback);

module.exports = router;
