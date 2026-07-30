const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc  Toggle a scam article bookmark for the logged-in user
// @route POST /api/users/bookmarks/:scamId
const toggleBookmark = asyncHandler(async (req, res) => {
  const { scamId } = req.params;
  const user = req.user;
  const idx = user.bookmarkedScams.findIndex((id) => String(id) === scamId);
  if (idx > -1) {
    user.bookmarkedScams.splice(idx, 1);
  } else {
    user.bookmarkedScams.push(scamId);
  }
  await user.save();
  res.json({ success: true, data: user.bookmarkedScams });
});

// @desc  Get the logged-in user's bookmarked scams
// @route GET /api/users/bookmarks
const getBookmarks = asyncHandler(async (req, res) => {
  const user = await req.user.populate("bookmarkedScams");
  res.json({ success: true, data: user.bookmarkedScams });
});

// @desc  Get the logged-in user's quiz / learning history
// @route GET /api/users/history
const getHistory = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.quizHistory });
});

module.exports = { toggleBookmark, getBookmarks, getHistory };
