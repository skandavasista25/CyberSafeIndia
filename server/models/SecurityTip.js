const mongoose = require("mongoose");

const securityTipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, default: "fa-solid fa-shield-halved" },
    image: { type: String, default: "" },
    category: { type: String, default: "General" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

securityTipSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("SecurityTip", securityTipSchema);
