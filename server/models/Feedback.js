const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    ipAddress: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true } // createdAt doubles as "Date & Time"
);

module.exports = mongoose.model("Feedback", feedbackSchema);
