/* ==========================================================================
   CyberSafe India — quiz.js
   Runs only on quiz.html. Uses the local QUIZ_QUESTIONS bank below by
   default. If a backend (CSIApi.getQuiz) becomes available later, it will
   be used automatically instead — see loadQuestions() at the bottom of
   the questions bank.
   ========================================================================== */

// --------------------------------------------------------------------------
// Question bank — add new questions here any time. Each question needs:
//   _id            unique string (used to match answers when scoring)
//   question       the question text
//   options        array of answer choices
//   correctAnswer  index into options[] of the right answer
//   category       shown as a tag above the question
// --------------------------------------------------------------------------
import { auth, db } from "./firebase.js";
console.log("Current page:", window.location.pathname);
console.log(document.body.innerHTML.includes('id="review"'));
import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const QUIZ_QUESTIONS = [
  {
    _id: "q1",
    question:
      "You receive an SMS saying your bank account will be blocked unless you click a link and 'update KYC' immediately. What should you do?",
    options: [
      "Click the link and fill in the details quickly before the deadline",
      "Ignore the link and contact your bank directly using the number on your card or passbook",
      "Reply to the SMS asking for more details",
      "Forward the SMS to friends to warn them, then click it yourself",
    ],
    answer: 1,
    category: "Phishing & Scams",
  },
  {
    _id: "q2",
    question:
      "A caller claims to be from your bank and asks for the OTP you just received to 'verify your identity'. What is the safest response?",
    options: [
      "Share the OTP since they already know your account number",
      "Share only the last 3 digits of the OTP",
      "Never share the OTP with anyone — banks never ask for it over a call",
      "Share it only if the caller sounds professional",
    ],
    answer: 2,
    category: "OTP & UPI Fraud",
  },
  {
    _id: "q3",
    question: "Which of these is a common sign of a phishing email?",
    options: [
      "It is sent from a recognizable company domain with correct spelling",
      "It creates urgency, has spelling errors, and asks you to click a link or enter credentials",
      "It has no attachments or links at all",
      "It arrives during normal business hours",
    ],
    answer: 1,
    category: "Phishing & Scams",
  },
  {
    _id: "q4",
    question:
      "You get a UPI payment request (not a payment received) from an unknown number claiming you'll receive money if you approve it. What should you do?",
    options: [
      "Approve it and enter your UPI PIN to receive the money",
      "Decline it — approving a 'collect request' with your PIN sends money OUT, it doesn't bring money in",
      "Approve it only if the amount is small",
      "Call the number back and approve while on the call",
    ],
    answer: 1,
    category: "OTP & UPI Fraud",
  },
  {
    _id: "q5",
    question: "What makes a strong password?",
    options: [
      "Your name followed by your birth year",
      "A short, easy-to-remember common word",
      "A long, unique mix of letters, numbers, and symbols not reused across sites",
      "The word 'password123'",
    ],
    answer: 2,
    category: "Password Hygiene",
  },
  {
    _id: "q6",
    question: "Why is Two-Factor Authentication (2FA) recommended for important accounts?",
    options: [
      "It makes login slower for no benefit",
      "It adds a second layer of proof of identity, so a stolen password alone can't get an attacker in",
      "It replaces the need for a password entirely",
      "It is only useful for banking apps",
    ],
    answer: 1,
    category: "Account Security",
  },
  {
    _id: "q7",
    question: "You're at a café and need to check your bank balance. What's the safest option?",
    options: [
      "Use the café's free public Wi-Fi to log in",
      "Use your mobile data or a trusted personal hotspot instead of public Wi-Fi",
      "Ask the café staff for the Wi-Fi password and proceed as usual",
      "Use public Wi-Fi but type the password slowly",
    ],
    answer: 1,
    category: "Safe Browsing",
  },
  {
    _id: "q8",
    question: "How can you tell a website is using a secure connection before entering sensitive information?",
    options: [
      "The page background is white",
      "The URL starts with https:// and shows a padlock icon",
      "The website loads quickly",
      "The website has a lot of pop-up ads",
    ],
    answer: 1,
    category: "Safe Browsing",
  },
  {
    _id: "q9",
    question:
      "You receive a job offer message promising a huge salary for 'easy work from home' but asking for a registration fee first. This is most likely:",
    options: [
      "A legitimate fast-track hiring process",
      "A job scam — genuine employers do not ask candidates to pay to get hired",
      "Normal because all online jobs require a fee",
      "Safe as long as the fee is small",
    ],
    answer: 1,
    category: "Scam Awareness",
  },
  {
    _id: "q10",
    question: "What is 'SIM swap fraud'?",
    options: [
      "Legally changing your SIM card at a store",
      "A scammer tricking your telecom operator into issuing a duplicate SIM to intercept your OTPs and calls",
      "Switching between two SIM slots in a dual-SIM phone",
      "A type of mobile data plan",
    ],
    answer: 1,
    category: "OTP & UPI Fraud",
  },
  {
    _id: "q11",
    question:
      "You get a call from someone claiming to be a police officer or CBI official saying you're under 'digital arrest' and must pay a fine immediately over video call or transfer money. What should you do?",
    options: [
      "Pay immediately to avoid arrest",
      "Follow their instructions exactly since they sound official",
      "Hang up — this is a known scam; real law enforcement does not arrest people over video calls or demand instant payment",
      "Give them your bank details to prove your innocence",
    ],
    answer: 2,
    category: "Scam Awareness",
  },
  {
    _id: "q12",
    question:
      "Someone asks you to install a screen-sharing app (like AnyDesk or TeamViewer) to 'help fix an issue' with your bank app. What's the risk?",
    options: [
      "There's no risk, screen-sharing apps are always safe",
      "It could let a scammer see your screen and steal banking credentials, OTPs, or PINs in real time",
      "It only shares your screen, never any typed data",
      "It's required by all banks for support",
    ],
    answer: 1,
    category: "Scam Awareness",
  },
  {
    _id: "q13",
    question: "What is ransomware?",
    options: [
      "Software that speeds up your computer",
      "Malicious software that locks or encrypts your files and demands payment to restore access",
      "A type of antivirus program",
      "A free file-sharing tool",
    ],
    answer: 1,
    category: "Malware",
  },
  {
    _id: "q14",
    question: "Before installing a new app, what should you check regarding permissions?",
    options: [
      "Nothing, all app permission requests are safe to accept",
      "Whether the permissions requested (contacts, camera, SMS, etc.) actually match what the app needs to function",
      "Only whether the app is free",
      "Only the app's icon design",
    ],
    answer: 1,
    category: "App & Data Privacy",
  },
  {
    _id: "q15",
    question:
      "You receive a message saying you've won a lottery or lucky draw you never entered, and must pay a 'processing fee' to claim it. This is:",
    options: [
      "A legitimate way lotteries work",
      "A classic advance-fee scam",
      "Only a scam if the amount asked is large",
      "Safe if the message uses a company logo",
    ],
    answer: 1,
    category: "Scam Awareness",
  },
  {
    _id: "q16",
    question: "What is a 'deepfake' in the context of online scams?",
    options: [
      "A verified video call feature",
      "AI-generated fake audio or video that mimics a real person's voice or face to deceive victims",
      "A type of encrypted messaging",
      "A backup feature for photos",
    ],
    answer: 1,
    category: "Emerging Threats",
  },
  {
    _id: "q17",
    question: "What should you do before clicking a shortened or unfamiliar link sent to you?",
    options: [
      "Click it immediately to see where it goes",
      "Hover over or preview the link, verify the sender, and avoid clicking if anything seems suspicious",
      "Forward it to 5 friends first to test it",
      "Click it only on mobile data, never on Wi-Fi",
    ],
    answer: 1,
    category: "Phishing & Scams",
  },
  {
    _id: "q18",
    question: "Why should you avoid using the same password across multiple websites?",
    options: [
      "It's fine as long as the password is long",
      "If one site is breached, attackers can reuse that same password to access your other accounts",
      "Reusing passwords makes login faster with no downside",
      "Password reuse is only risky for email accounts",
    ],
    answer: 1,
    category: "Password Hygiene",
  },
  {
    _id: "q19",
    question: "What is card skimming?",
    options: [
      "A discount offered by banks",
      "Illegally capturing card details (via a hidden device or fake card reader) to clone the card or steal funds",
      "A method banks use to verify your card",
      "A type of contactless payment",
    ],
    answer: 1,
    category: "Financial Fraud",
  },
  {
    _id: "q20",
    question: "You suspect you've been the victim of a cyber fraud in India. Where can you report it?",
    options: [
      "There is no official channel, only social media complaints work",
      "The National Cyber Crime Reporting Portal (cybercrime.gov.in) or the 1930 helpline",
      "Only your local newspaper",
      "Nowhere — losses can never be recovered or reported",
    ],
    answer: 1,
    category: "Reporting & Recovery",
  },
];

// Shuffle helper (Fisher–Yates) so the quiz order varies between attempts.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pulls questions from the backend if it's wired up (CSIApi.getQuiz),
// otherwise falls back to the local QUIZ_QUESTIONS bank above. This means
// you can add a real backend later without touching the rest of this file.
async function loadQuestions(limit = 10) {
  if (typeof CSIApi !== "undefined" && typeof CSIApi.getQuiz === "function") {
    try {
      const { data } = await CSIApi.getQuiz(`?limit=${limit}`);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (err) {
      console.warn("Backend quiz fetch failed, using local question bank instead:", err);
    }
  }
  return shuffle(QUIZ_QUESTIONS).slice(0, limit);
}

// Scores answers against QUIZ_QUESTIONS locally if there's no backend to
// score them server-side.
function scoreLocally(answers) {
  let score = 0;
  for (const a of answers) {
    const q = QUIZ_QUESTIONS.find((q) => q._id === a.questionId);
    if (q && q.answer === a.selected) score += 1;
  }
  return { score, total: answers.length };
}

async function submitAnswers(answers) {
  if (typeof CSIApi !== "undefined" && typeof CSIApi.submitQuiz === "function") {
    try {
      const { data } = await CSIApi.submitQuiz({ answers, category: "General" });
      return data;
    } catch (err) {
      console.warn("Backend quiz submit failed, scoring locally instead:", err);
    }
  }
  return scoreLocally(answers);
}

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("quiz-start-btn");
  if (!startBtn) return; // not on the quiz page

  const els = {
    start: document.getElementById("quiz-start"),
    loading: document.getElementById("quiz-loading"),
    error: document.getElementById("quiz-error"),
    errorMsg: document.getElementById("quiz-error-msg"),
    play: document.getElementById("quiz-play"),
    result: document.getElementById("quiz-result"),
    progressFill: document.getElementById("quiz-progress-fill"),
    qNum: document.getElementById("quiz-question-num"),
    qCat: document.getElementById("quiz-question-cat"),
    qText: document.getElementById("quiz-question-text"),
    options: document.getElementById("quiz-options"),
    nextBtn: document.getElementById("quiz-next-btn"),
    retryBtn: document.getElementById("quiz-retry-btn"),
    scoreNum: document.getElementById("quiz-score"),
    resultMsg: document.getElementById("quiz-result-msg"),
    review: document.getElementById("review"),
  };

  let questions = [];
  let current = 0;
  let answers = []; // { questionId, selected }
  let selectedOption = null;

  function show(section) {
    [els.start, els.loading, els.error, els.play, els.result].forEach((s) => (s.style.display = "none"));
    section.style.display = section === els.play ? "block" : "block";
  }

  startBtn.addEventListener("click", startQuiz);
  els.retryBtn.addEventListener("click", startQuiz);

  async function startQuiz() {
    show(els.loading);
    current = 0;
    answers = [];
    try {
      const data = await loadQuestions(5);
      if (!Array.isArray(data) || data.length === 0) throw new Error("No quiz questions available yet.");
      questions = data;
      renderQuestion();
      show(els.play);
    } catch (err) {
      els.errorMsg.textContent = err.message || "Couldn't load quiz questions.";
      show(els.error);
    }
  }

  function renderQuestion() {
    selectedOption = null;
    const q = questions[current];
    els.qNum.textContent = `Question ${current + 1} of ${questions.length}`;
    els.qCat.textContent = q.category || "General";
    els.qText.textContent = q.question;
    els.progressFill.style.width = `${(current / questions.length) * 100}%`;
    els.nextBtn.disabled = true;
    els.nextBtn.innerHTML = current === questions.length - 1 ? 'See Results <i class="fa-solid fa-flag-checkered"></i>' : 'Next <i class="fa-solid fa-arrow-right"></i>';

    els.options.innerHTML = q.options
      .map(
        (opt, i) => `
        <button class="quiz-option" data-index="${i}" type="button">
          <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
          <span>${opt}</span>
        </button>`
      )
      .join("");

    els.options.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        els.options.querySelectorAll(".quiz-option").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedOption = Number(btn.dataset.index);
        els.nextBtn.disabled = false;
      });
    });
  }

  els.nextBtn.addEventListener("click", async () => {
    const q = questions[current];
    answers.push({ questionId: q._id, selected: selectedOption });

    if (current < questions.length - 1) {
      current += 1;
      renderQuestion();
    } else {
      els.progressFill.style.width = "100%";
      show(els.loading);
      try {
        const data = await submitAnswers(answers);
        els.scoreNum.textContent = `${data.score}/${data.total}`;
        const user = auth.currentUser;
        console.log("Current User:", user);
        

        

if (user) {

    await addDoc(collection(db, "quizResults"), {
    uid: user.uid,
    name: user.displayName || "User",
    email: user.email,
    score: data.score,
    total: data.total,
    percentage: Math.round((data.score / data.total) * 100),
    date: new Date().toLocaleString(),

    answers,
    questions
});

}
        const pct = Math.round((data.score / data.total) * 100);
        els.resultMsg.textContent =
          pct >= 80
            ? "Excellent — you're spotting the red flags."
            : pct >= 50
            ? "Good start. A quick read through the scam guides will sharpen this further."
            : "Worth another pass through the scam and phishing guides before you're done.";
        els.review.innerHTML = "";

questions.forEach((question, index) => {

    const userAnswer = answers[index].selected;
    const correctAnswer = question.answer;

    const isCorrect = userAnswer === correctAnswer;

    els.review.innerHTML += `
        <div class="review-card ${isCorrect ? "correct" : "wrong"}">

            <h4>Question ${index + 1}</h4>

            <p><strong>${question.question}</strong></p>

            <p>
    <span class="answer-label your-label">Your Answer</span><br>
    <span class="${isCorrect ? "correct-answer" : "wrong-answer"}">
        ${question.options[userAnswer]}
    </span>
</p>

<p>
    <span class="answer-label correct-label">Correct Answer</span><br>
    <span class="correct-answer">
        ${question.options[correctAnswer]}
    </span>
</p>

        </div>
    `;

});
            show(els.result);
        
      } catch (err) {
        els.errorMsg.textContent = err.message || "Couldn't submit your answers.";
        show(els.error);
      }
    }
  });
});
