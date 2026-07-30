const Quiz = require("../models/Quiz");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc  Get quiz questions for taking the quiz (correct answer stripped)
// @route GET /api/quiz
const getQuizQuestions = asyncHandler(async (req, res) => {
  const { category, difficulty, limit } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;

  let query = Quiz.find(filter).select("-correctAnswer");
  if (limit) query = query.limit(Number(limit));
  const questions = await query;
  res.json({ success: true, count: questions.length, data: questions });
});

// @desc  Get full quiz question list including answers (admin only)
// @route GET /api/quiz/admin
const getQuizQuestionsAdmin = asyncHandler(async (req, res) => {
  const questions = await Quiz.find().sort({ createdAt: -1 });
  res.json({ success: true, count: questions.length, data: questions });
});

// @desc  Create a quiz question (admin only)
// @route POST /api/quiz
const createQuizQuestion = asyncHandler(async (req, res) => {
  const question = await Quiz.create(req.body);
  res.status(201).json({ success: true, data: question });
});

// @desc  Update a quiz question (admin only)
// @route PUT /api/quiz/:id
const updateQuizQuestion = asyncHandler(async (req, res) => {
  const question = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!question) return res.status(404).json({ success: false, message: "Quiz question not found" });
  res.json({ success: true, data: question });
});

// @desc  Delete a quiz question (admin only)
// @route DELETE /api/quiz/:id
const deleteQuizQuestion = asyncHandler(async (req, res) => {
  const question = await Quiz.findByIdAndDelete(req.params.id);
  if (!question) return res.status(404).json({ success: false, message: "Quiz question not found" });
  res.json({ success: true, message: "Quiz question deleted" });
});

// @desc  Submit quiz answers and get a score back. Saves to history if logged in.
// @route POST /api/quiz/submit
// body: { answers: [{ questionId, selected }] }
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers, category } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ success: false, message: "No answers submitted" });
  }

  const ids = answers.map((a) => a.questionId);
  const questions = await Quiz.find({ _id: { $in: ids } });
  const answerKey = new Map(questions.map((q) => [String(q._id), q.correctAnswer]));

  let score = 0;
  const results = answers.map((a) => {
    const correctAnswer = answerKey.get(String(a.questionId));
    const isCorrect = correctAnswer === a.selected;
    if (isCorrect) score += 1;
    return { questionId: a.questionId, selected: a.selected, correctAnswer, isCorrect };
  });

  const total = answers.length;

  // If the request came from a logged-in user (protectUser ran and set req.user), save history
  if (req.user) {
    req.user.quizHistory.push({ quizCategory: category || "General", score, total });
    await req.user.save();
  }

  res.json({ success: true, data: { score, total, results } });
});

module.exports = {
  getQuizQuestions,
  getQuizQuestionsAdmin,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  submitQuiz,
};
