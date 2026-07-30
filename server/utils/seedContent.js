/**
 * Optional one-time script that copies the original static scam/FAQ/
 * security-tip content into MongoDB, so the site has real data to show
 * immediately instead of an empty state. Safe to run multiple times —
 * it skips categories/collections that already have documents.
 * Run with: npm run seed:content
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Scam = require("../models/Scam");
const FAQ = require("../models/FAQ");
const SecurityTip = require("../models/SecurityTip");
const Quiz = require("../models/Quiz");

const scams = [
  {
    title: "UPI Scams",
    category: "UPI Scam",
    description: "Fraudsters exploit UPI's speed and simplicity to trick people into approving payments that move money out of their account, disguised as requests to receive money.",
    howItWorks: "The scammer sends a UPI collect request or asks the victim to enter their UPI PIN, claiming it's needed to receive a refund, prize, or payment. Entering the PIN actually authorises an outgoing payment.",
    warningSigns: [
      "You're asked to enter a UPI PIN to \"receive\" money — receiving never needs a PIN.",
      "Urgency: approve now or the offer expires.",
      "A stranger claiming to be a buyer on an online marketplace.",
    ],
    preventionTips: [
      "Remember: a UPI PIN is only ever needed to send money, never to receive it.",
      "Decline unexpected collect requests instead of approving on autopilot.",
      "Set a low daily UPI transaction limit in your banking app.",
    ],
  },
  {
    title: "OTP Scams",
    category: "OTP Scam",
    description: "An OTP is the last lock on your account. Scammers don't try to break it — they simply ask you to hand over the key.",
    howItWorks: "A caller poses as a bank employee, delivery agent, or verification team and asks you to read out the OTP you just received, claiming it's needed to cancel, verify, or process something.",
    warningSigns: [
      "Any call or message asking you to share an OTP out loud or by text.",
      "Pressure to act within minutes or your card will be blocked.",
      "An OTP arrives when you did not initiate any transaction.",
    ],
    preventionTips: [
      "No genuine bank, company, or government office will ever ask for your OTP.",
      "Never share an OTP over call, SMS, WhatsApp, or email.",
      "If an unexpected OTP arrives, change your password right away.",
    ],
  },
  {
    title: "QR Code Scams",
    category: "QR Code Scam",
    description: "QR codes feel harmless because they're everywhere — but scanning one to \"receive\" a payment is exactly how the UPI-PIN trick is delivered.",
    howItWorks: "A buyer sends a QR code and asks the victim to scan it and enter their PIN to get a payment. Some scammers also paste fake QR stickers over real ones at shops.",
    warningSigns: [
      "Being told to scan a code and enter a PIN to receive funds.",
      "A QR sticker that looks tampered with or pasted over another one.",
      "The payee name shown after scanning doesn't match what you expect.",
    ],
    preventionTips: [
      "Scanning a QR code is only for paying someone — never for receiving money.",
      "Always check the payee name displayed before confirming a payment.",
      "At shops, check the QR sticker looks original and matches the merchant.",
    ],
  },
];

const faqs = [
  { question: "I shared my OTP by mistake. What should I do right now?", answer: "Call the 1930 cyber crime helpline immediately, then contact your bank to block your card or freeze your account. File a complaint on cybercrime.gov.in as soon as possible.", category: "Reporting", order: 1 },
  { question: "Can scanning a QR code alone steal my money?", answer: "Scanning a QR code just opens a payment screen — it can't withdraw money by itself. The danger is entering your UPI PIN afterward. Never enter your PIN to receive money.", category: "UPI", order: 2 },
  { question: "Is public Wi-Fi ever safe to use?", answer: "Public Wi-Fi is fine for casual browsing, but avoid banking or logging into sensitive accounts on it. Use mobile data or a trusted VPN for anything involving money.", category: "General", order: 3 },
];

const tips = [
  { title: "Keep software updated", description: "Updates patch security flaws that attackers actively exploit. Turn on automatic updates for your phone's OS, apps, and computer.", icon: "fa-solid fa-arrows-rotate", category: "Devices", order: 1 },
  { title: "Enable device lock", description: "A PIN, pattern, or biometric lock on your phone and laptop prevents anyone who picks it up from accessing your apps and messages.", icon: "fa-solid fa-lock", category: "Devices", order: 2 },
  { title: "Back up important data regularly", description: "Keep copies of photos and documents on cloud storage or an external drive, so ransomware or device loss doesn't mean permanent loss.", icon: "fa-solid fa-cloud-arrow-up", category: "Data", order: 3 },
];

const quiz = [
  { question: "You get a call asking you to share the OTP you just received to 'cancel a transaction'. What should you do?", options: ["Share the OTP immediately", "Hang up and never share the OTP", "Share only half the digits", "Ask them to call back later"], correctAnswer: 1, difficulty: "easy", category: "OTP" },
  { question: "Scanning a QR code and entering your UPI PIN will:", options: ["Receive money into your account", "Send money out of your account", "Do nothing without internet", "Only work at shops"], correctAnswer: 1, difficulty: "easy", category: "UPI" },
  { question: "Which of these is a sign of a phishing email?", options: ["It addresses you by your full name", "It comes from your saved contact", "It creates urgency and asks you to click a link", "It has no attachments"], correctAnswer: 2, difficulty: "medium", category: "Phishing" },
];

(async () => {
  await connectDB();

  if ((await Scam.countDocuments()) === 0) {
    await Scam.insertMany(scams);
    console.log(`Seeded ${scams.length} scam articles.`);
  } else {
    console.log("Scams collection already has data — skipped.");
  }

  if ((await FAQ.countDocuments()) === 0) {
    await FAQ.insertMany(faqs);
    console.log(`Seeded ${faqs.length} FAQs.`);
  } else {
    console.log("FAQ collection already has data — skipped.");
  }

  if ((await SecurityTip.countDocuments()) === 0) {
    await SecurityTip.insertMany(tips);
    console.log(`Seeded ${tips.length} security tips.`);
  } else {
    console.log("SecurityTip collection already has data — skipped.");
  }

  if ((await Quiz.countDocuments()) === 0) {
    await Quiz.insertMany(quiz);
    console.log(`Seeded ${quiz.length} quiz questions.`);
  } else {
    console.log("Quiz collection already has data — skipped.");
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
