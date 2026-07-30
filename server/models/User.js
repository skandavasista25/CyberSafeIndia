const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const quizHistorySchema = new mongoose.Schema(
  {
    quizCategory: { type: String },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    takenAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    bookmarkedScams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scam" }],
    quizHistory: [quizHistorySchema],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
