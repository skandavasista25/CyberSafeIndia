const mongoose = require("mongoose");

const scamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["UPI Scam", "OTP Scam", "QR Code Scam", "Fake Job Scam", "Investment Scam", "Fake Customer Care Scam", "Delivery Scam", "Other"],
    },
    description: { type: String, required: true },
    howItWorks: { type: String, required: true },
    warningSigns: [{ type: String, required: true }],
    preventionTips: [{ type: String, required: true }],
    image: { type: String, default: "" },
    views: { type: Number, default: 0 },
  },
  { timestamps: true } // gives createdAt (Created Date) and updatedAt (Last Updated)
);

scamSchema.index({ title: "text", description: "text", howItWorks: "text", category: "text" });

module.exports = mongoose.model("Scam", scamSchema);
