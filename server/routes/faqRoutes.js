const express = require("express");
const { body } = require("express-validator");
const { getFAQs, createFAQ, updateFAQ, deleteFAQ } = require("../controllers/faqController");
const { protectAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const faqValidation = [
  body("question").trim().notEmpty().withMessage("Question is required"),
  body("answer").trim().notEmpty().withMessage("Answer is required"),
];

router.get("/", getFAQs);
router.post("/", protectAdmin, faqValidation, validate, createFAQ);
router.put("/:id", protectAdmin, updateFAQ);
router.delete("/:id", protectAdmin, deleteFAQ);

module.exports = router;
