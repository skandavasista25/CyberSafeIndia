const Feedback = require("../models/Feedback");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc  Submit the public contact/feedback form
// @route POST /api/feedback
const submitFeedback = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";

  const feedback = await Feedback.create({ name, email, subject, message, ipAddress });
  res.status(201).json({
    success: true,
    message: "Thanks — your message has been received. We'll get back to you soon.",
    data: { id: feedback._id, createdAt: feedback.createdAt },
  });
});

// @desc  List all feedback (admin only)
// @route GET /api/feedback
const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().sort({ createdAt: -1 });
  res.json({ success: true, count: feedback.length, data: feedback });
});

// @desc  Delete a feedback entry (admin only)
// @route DELETE /api/feedback/:id
const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found" });
  res.json({ success: true, message: "Feedback deleted" });
});

module.exports = { submitFeedback, getFeedback, deleteFeedback };
