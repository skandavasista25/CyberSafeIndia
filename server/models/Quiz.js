const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length === 4,
        message: "A quiz question must have exactly 4 options.",
      },
    },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 }, // index into options
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    category: { type: String, default: "General" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
