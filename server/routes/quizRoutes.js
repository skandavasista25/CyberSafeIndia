const express = require("express");
const { body } = require("express-validator");
const {
  getQuizQuestions,
  getQuizQuestionsAdmin,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  submitQuiz,
} = require("../controllers/quizController");
const { protectAdmin, protectUser } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const quizValidation = [
  body("question").trim().notEmpty().withMessage("Question is required"),
  body("options").isArray({ min: 4, max: 4 }).withMessage("Exactly 4 options are required"),
  body("correctAnswer").isInt({ min: 0, max: 3 }).withMessage("correctAnswer must be an index between 0 and 3"),
];

// Optional auth: attach req.user if a valid user token is present, but don't block the request
const optionalUserAuth = (req, res, next) => {
  if (!req.headers.authorization) return next();
  protectUser(req, res, next);
};

router.get("/admin", protectAdmin, getQuizQuestionsAdmin);
router.get("/", getQuizQuestions);
router.post("/submit", optionalUserAuth, submitQuiz);
router.post("/", protectAdmin, quizValidation, validate, createQuizQuestion);
router.put("/:id", protectAdmin, updateQuizQuestion);
router.delete("/:id", protectAdmin, deleteQuizQuestion);

module.exports = router;
