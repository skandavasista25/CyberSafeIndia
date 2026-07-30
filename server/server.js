require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Route modules
const authRoutes = require("./routes/authRoutes");
const scamRoutes = require("./routes/scamRoutes");
const faqRoutes = require("./routes/faqRoutes");
const securityTipRoutes = require("./routes/securityTipRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const searchRoutes = require("./routes/searchRoutes");
const quizRoutes = require("./routes/quizRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// ---- Database ----
connectDB();

// ---- Security & core middleware ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // strips $ and . from req.body/query/params to block NoSQL injection
app.use(xss()); // sanitises user input to strip malicious HTML/JS (XSS protection)
app.use("/api", apiLimiter);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- API routes ----
app.use("/api/auth", authRoutes);
app.use("/api/scams", scamRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/security-tips", securityTipRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/health", (req, res) => res.json({ success: true, message: "CyberSafe India API is running" }));

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CyberSafe India API listening on port ${PORT}`));

module.exports = app;
