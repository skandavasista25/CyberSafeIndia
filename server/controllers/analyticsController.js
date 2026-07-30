const Scam = require("../models/Scam");
const FAQ = require("../models/FAQ");
const Feedback = require("../models/Feedback");
const Newsletter = require("../models/Newsletter");
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc  Aggregate stats for the admin dashboard
// @route GET /api/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalScams,
    totalFaqs,
    totalFeedback,
    totalSubscribers,
    totalUsers,
    totalQuizQuestions,
    mostViewedScam,
    recentFeedback,
  ] = await Promise.all([
    Scam.countDocuments(),
    FAQ.countDocuments(),
    Feedback.countDocuments(),
    Newsletter.countDocuments(),
    User.countDocuments(),
    Quiz.countDocuments(),
    Scam.findOne().sort({ views: -1 }).select("title views category"),
    Feedback.find().sort({ createdAt: -1 }).limit(5).select("name subject createdAt"),
  ]);

  const usersAgg = await User.aggregate([{ $project: { count: { $size: "$quizHistory" } } }, { $group: { _id: null, total: { $sum: "$count" } } }]);
  const totalQuizzesCompleted = usersAgg[0]?.total || 0;

  res.json({
    success: true,
    data: {
      totalScams,
      totalFaqs,
      totalFeedback,
      totalSubscribers,
      totalUsers,
      totalQuizQuestions,
      totalQuizzesCompleted,
      mostViewedScam,
      recentActivity: recentFeedback,
    },
  });
});

module.exports = { getAnalytics };
