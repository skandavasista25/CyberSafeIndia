const Newsletter = require("../models/Newsletter");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc  Subscribe an email to the newsletter
// @route POST /api/newsletter
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: "This email is already subscribed." });
  }
  await Newsletter.create({ email });
  res.status(201).json({ success: true, message: "You're subscribed! We'll keep you posted on new scams." });
});

// @desc  List all subscribers (admin only)
// @route GET /api/newsletter
const getSubscribers = asyncHandler(async (req, res) => {
  const subs = await Newsletter.find().sort({ createdAt: -1 });
  res.json({ success: true, count: subs.length, data: subs });
});

// @desc  Remove a subscriber (admin only)
// @route DELETE /api/newsletter/:id
const deleteSubscriber = asyncHandler(async (req, res) => {
  const sub = await Newsletter.findByIdAndDelete(req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: "Subscriber not found" });
  res.json({ success: true, message: "Subscriber removed" });
});

module.exports = { subscribe, getSubscribers, deleteSubscriber };
