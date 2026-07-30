const FAQ = require("../models/FAQ");
const { asyncHandler } = require("../middleware/errorHandler");

const getFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, count: faqs.length, data: faqs });
});

const createFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.create(req.body);
  res.status(201).json({ success: true, data: faq });
});

const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
  res.json({ success: true, data: faq });
});

const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);
  if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
  res.json({ success: true, message: "FAQ deleted" });
});

module.exports = { getFAQs, createFAQ, updateFAQ, deleteFAQ };
