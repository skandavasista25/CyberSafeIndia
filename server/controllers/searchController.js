const Scam = require("../models/Scam");
const FAQ = require("../models/FAQ");
const SecurityTip = require("../models/SecurityTip");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc  Site-wide search across scams, FAQs, and security tips
// @route GET /api/search?q=upi
const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ success: true, data: { scams: [], faqs: [], securityTips: [] } });

  const regex = new RegExp(q, "i");

  const [scams, faqs, securityTips] = await Promise.all([
    Scam.find({ $or: [{ title: regex }, { category: regex }, { description: regex }] }).limit(8),
    FAQ.find({ $or: [{ question: regex }, { answer: regex }] }).limit(8),
    SecurityTip.find({ $or: [{ title: regex }, { description: regex }] }).limit(8),
  ]);

  res.json({ success: true, data: { scams, faqs, securityTips } });
});

module.exports = { search };
