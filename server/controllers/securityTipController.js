const SecurityTip = require("../models/SecurityTip");
const { asyncHandler } = require("../middleware/errorHandler");

const getSecurityTips = asyncHandler(async (req, res) => {
  const tips = await SecurityTip.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, count: tips.length, data: tips });
});

const createSecurityTip = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/${req.file.filename}`;
  const tip = await SecurityTip.create(payload);
  res.status(201).json({ success: true, data: tip });
});

const updateSecurityTip = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/${req.file.filename}`;
  const tip = await SecurityTip.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!tip) return res.status(404).json({ success: false, message: "Security tip not found" });
  res.json({ success: true, data: tip });
});

const deleteSecurityTip = asyncHandler(async (req, res) => {
  const tip = await SecurityTip.findByIdAndDelete(req.params.id);
  if (!tip) return res.status(404).json({ success: false, message: "Security tip not found" });
  res.json({ success: true, message: "Security tip deleted" });
});

module.exports = { getSecurityTips, createSecurityTip, updateSecurityTip, deleteSecurityTip };
