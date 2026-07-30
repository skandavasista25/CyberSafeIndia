const Scam = require("../models/Scam");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc  Get all scam articles (public)
// @route GET /api/scams
const getScams = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const scams = await Scam.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: scams.length, data: scams });
});

// @desc  Get a single scam article by id, and bump its view counter
// @route GET /api/scams/:id
const getScamById = asyncHandler(async (req, res) => {
  const scam = await Scam.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
  if (!scam) return res.status(404).json({ success: false, message: "Scam article not found" });
  res.json({ success: true, data: scam });
});

// @desc  Create a scam article
// @route POST /api/scams (admin only)
const createScam = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/${req.file.filename}`;
  // warningSigns / preventionTips may arrive as JSON strings from multipart form-data
  ["warningSigns", "preventionTips"].forEach((field) => {
    if (typeof payload[field] === "string") {
      try { payload[field] = JSON.parse(payload[field]); } catch { payload[field] = [payload[field]]; }
    }
  });
  const scam = await Scam.create(payload);
  res.status(201).json({ success: true, data: scam });
});

// @desc  Update a scam article
// @route PUT /api/scams/:id (admin only)
const updateScam = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/${req.file.filename}`;
  ["warningSigns", "preventionTips"].forEach((field) => {
    if (typeof payload[field] === "string") {
      try { payload[field] = JSON.parse(payload[field]); } catch { payload[field] = [payload[field]]; }
    }
  });
  const scam = await Scam.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!scam) return res.status(404).json({ success: false, message: "Scam article not found" });
  res.json({ success: true, data: scam });
});

// @desc  Delete a scam article
// @route DELETE /api/scams/:id (admin only)
const deleteScam = asyncHandler(async (req, res) => {
  const scam = await Scam.findByIdAndDelete(req.params.id);
  if (!scam) return res.status(404).json({ success: false, message: "Scam article not found" });
  res.json({ success: true, message: "Scam article deleted" });
});

module.exports = { getScams, getScamById, createScam, updateScam, deleteScam };
