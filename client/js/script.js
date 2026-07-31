/* ==========================================================================
   CyberSafe India — script.js
   Handles: mobile nav, site search, scroll reveal, accordions,
   password strength demo, back-to-top.

   NOTE: Contact form submission is now handled directly in contact.html
   via Firestore (see the inline module script there). The old
   initContactForm()/CSIApi.submitFeedback() flow has been removed to
   avoid double-submitting and to stop depending on the retired
   Express/MongoDB backend for this feature.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavLink();
  initSearch();
  initScrollReveal();
  initAccordions("[data-accordion='scam']", ".scam-card", ".scam-card-head");
  initAccordions("[data-accordion='faq']", ".faq-item", ".faq-q");
  initPasswordDemo();
  initBackToTop();
});

/* ---------------------------------------------------------------
   Mobile navigation toggle
   --------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const navbar = document.querySelector(".navbar");
  if (!toggle || !navbar) return;

  toggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  });

  // Close menu when a link is tapped
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });
  });
}

/* ---------------------------------------------------------------
   Highlight the current page in the nav
   --------------------------------------------------------------- */
function initActiveNavLink() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

/* ---------------------------------------------------------------
   Site-wide search index
   Each entry: title, category, keywords, url (page#anchor)
   --------------------------------------------------------------- */
const SEARCH_INDEX = [
  { title: "UPI Scams", cat: "Latest Scams", url: "scams.html#upi-scam", keywords: "upi payment fraud request money collect" },
  { title: "OTP Scams", cat: "Latest Scams", url: "scams.html#otp-scam", keywords: "otp one time password sms code share" },
  { title: "QR Code Scams", cat: "Latest Scams", url: "scams.html#qr-scam", keywords: "qr code scan payment fake" },
  { title: "Fake Job Scams", cat: "Latest Scams", url: "scams.html#job-scam", keywords: "job offer work from home recruitment fraud" },
  { title: "Investment Scams", cat: "Latest Scams", url: "scams.html#investment-scam", keywords: "trading stock crypto returns ponzi" },
  { title: "Fake Customer Care Scams", cat: "Latest Scams", url: "scams.html#customer-care-scam", keywords: "customer care helpline google search fake number" },
  { title: "Delivery Scams", cat: "Latest Scams", url: "scams.html#delivery-scam", keywords: "courier parcel delivery fee customs fake link" },
  { title: "Email Phishing", cat: "Phishing", url: "phishing.html#email-phishing", keywords: "email phishing inbox fake sender" },
  { title: "SMS Phishing (Smishing)", cat: "Phishing", url: "phishing.html#smishing", keywords: "smishing sms text message link" },
  { title: "Voice Phishing (Vishing)", cat: "Phishing", url: "phishing.html#vishing", keywords: "vishing call phone voice bank officer" },
  { title: "Fake Login Pages", cat: "Phishing", url: "phishing.html#fake-login", keywords: "fake login page clone website credentials" },
  { title: "Suspicious Links", cat: "Phishing", url: "phishing.html#suspicious-links", keywords: "url link shortener suspicious domain" },
  { title: "Strong Password Creation", cat: "Password Safety", url: "password-safety.html#strong-passwords", keywords: "password strength create tips" },
  { title: "Password Managers", cat: "Password Safety", url: "password-safety.html#password-managers", keywords: "password manager vault store" },
  { title: "Two-Factor Authentication", cat: "Password Safety", url: "password-safety.html#two-factor", keywords: "2fa otp authenticator app security" },
  { title: "Password Reuse Risks", cat: "Password Safety", url: "password-safety.html#password-reuse", keywords: "reuse same password multiple sites breach" },
  { title: "Try the Password Strength Checker", cat: "Password Safety", url: "password-safety.html#pw-checker", keywords: "check test password strength tool" },
  { title: "Never Share OTP / UPI PIN", cat: "Safe UPI Practices", url: "upi-safety.html#never-share", keywords: "otp upi pin share never bank" },
  { title: "Verify Payment Requests", cat: "Safe UPI Practices", url: "upi-safety.html#verify-requests", keywords: "collect request payment verify upi" },
  { title: "Avoid Unknown QR Codes", cat: "Safe UPI Practices", url: "upi-safety.html#unknown-qr", keywords: "qr code scan unknown avoid" },
  { title: "Secure Online Banking", cat: "Safe UPI Practices", url: "upi-safety.html#secure-banking", keywords: "net banking app secure device" },
  { title: "Common UPI Fraud Techniques", cat: "Safe UPI Practices", url: "upi-safety.html#upi-fraud-techniques", keywords: "upi fraud technique scam method" },
  { title: "National Cyber Crime Reporting Portal", cat: "Cyber Crime Reporting", url: "reporting.html#portal", keywords: "cybercrime.gov.in portal report online" },
  { title: "Cyber Crime Helpline 1930", cat: "Cyber Crime Reporting", url: "reporting.html#helpline", keywords: "1930 helpline number call report" },
  { title: "Steps to Report Cyber Fraud", cat: "Cyber Crime Reporting", url: "reporting.html#report-steps", keywords: "report steps process file complaint" },
  { title: "What to Do Immediately After Fraud", cat: "Cyber Crime Reporting", url: "reporting.html#immediate-steps", keywords: "immediately victim block card freeze account" },
  { title: "Keep Software Updated", cat: "Security Tips", url: "security-tips.html#tip-updates", keywords: "software update patch os" },
  { title: "Use Antivirus Software", cat: "Security Tips", url: "security-tips.html#tip-antivirus", keywords: "antivirus malware protection" },
  { title: "Enable Device Lock", cat: "Security Tips", url: "security-tips.html#tip-lock", keywords: "device lock pin fingerprint screen" },
  { title: "Avoid Public Wi-Fi for Banking", cat: "Security Tips", url: "security-tips.html#tip-wifi", keywords: "public wifi banking unsecured network" },
  { title: "Verify Websites Before Entering Details", cat: "Security Tips", url: "security-tips.html#tip-verify-site", keywords: "https padlock verify website secure" },
  { title: "Download Apps from Trusted Sources", cat: "Security Tips", url: "security-tips.html#tip-trusted-apps", keywords: "app store play store trusted download" },
  { title: "Backup Important Data", cat: "Security Tips", url: "security-tips.html#tip-backup", keywords: "backup data cloud drive regularly" },
  { title: "Frequently Asked Questions", cat: "FAQ", url: "faq.html", keywords: "faq questions answers help" },
  { title: "Contact Us & Feedback", cat: "Contact", url: "contact.html", keywords: "contact feedback form support message" },
];

function initSearch() {
  const inputs = document.querySelectorAll(".search-input");
  inputs.forEach((input) => {
    const wrap = input.closest(".search-wrap");
    const resultsBox = wrap.querySelector(".search-results");
    let debounceTimer;

    input.addEventListener("input", () => {
      const q = input.value.trim();
      clearTimeout(debounceTimer);
      if (!q) {
        resultsBox.classList.remove("open");
        resultsBox.innerHTML = "";
        return;
      }
      debounceTimer = setTimeout(() => runSearch(q, resultsBox), 250);
    });

    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) resultsBox.classList.remove("open");
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") resultsBox.classList.remove("open");
    });
  });
}

// Prefixes an already-page-relative URL (used by the local index) so it
// still resolves correctly whether we're at the site root or inside /pages/.
function prefixUrl(url) {
  const inPages = window.location.pathname.includes("/pages/");
  if (url.startsWith("http")) return url;
  return inPages ? url : `pages/${url}`;
}

async function runSearch(q, resultsBox) {
  // Local index only for now — the previous "live backend search" branch
  // called the retired Express/MongoDB API and has been removed since
  // that backend is no longer running. Re-add a Firestore-backed branch
  // here once scams/FAQs/tips live in Firestore.
  const ql = q.toLowerCase();
  const matches = SEARCH_INDEX.filter(
    (item) => item.title.toLowerCase().includes(ql) || item.keywords.toLowerCase().includes(ql) || item.cat.toLowerCase().includes(ql)
  )
    .slice(0, 8)
    .map((m) => ({ ...m, url: prefixUrl(m.url) }));
  renderSearchResults(matches, resultsBox);
}

function renderSearchResults(matches, resultsBox) {
  if (matches.length === 0) {
    resultsBox.innerHTML = '<div class="sr-empty">No topics found. Try “OTP”, “phishing”, or “password”.</div>';
  } else {
    resultsBox.innerHTML = matches
      .slice(0, 8)
      .map((m) => `<a href="${m.url}"><span class="sr-cat">${m.cat}</span><span class="sr-title">${m.title}</span></a>`)
      .join("");
  }
  resultsBox.classList.add("open");
}

/* ---------------------------------------------------------------
   Scroll reveal via IntersectionObserver
   --------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------
   Generic accordion (scam cards / FAQ)
   --------------------------------------------------------------- */
function initAccordions(containerSelector, itemSelector, headSelector) {
  document.querySelectorAll(itemSelector).forEach((item) => {
    const head = item.querySelector(headSelector);
    if (!head) return;
    head.setAttribute("role", "button");
    head.setAttribute("tabindex", "0");
    head.setAttribute("aria-expanded", "false");

    const toggle = () => {
      const isOpen = item.classList.toggle("open");
      head.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    head.addEventListener("click", toggle);
    head.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  // Open a card automatically if the URL hash matches its id
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target && target.matches(itemSelector)) {
      target.classList.add("open");
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }
}

/* ---------------------------------------------------------------
   Password strength demo (client-side only, nothing is stored/sent)
   --------------------------------------------------------------- */
function initPasswordDemo() {
  const input = document.getElementById("pw-input");
  if (!input) return;
  const fill = document.getElementById("pw-fill");
  const verdict = document.getElementById("pw-verdict");
  const toggle = document.getElementById("pw-toggle");
  const rules = {
    len: document.getElementById("rule-len"),
    upper: document.getElementById("rule-upper"),
    number: document.getElementById("rule-number"),
    symbol: document.getElementById("rule-symbol"),
  };

  const colors = ["#ff5c5c", "#ff5c5c", "#ffb020", "#ffb020", "#2ee6a6"];
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

  input.addEventListener("input", () => {
    const val = input.value;
    let score = 0;
    const checks = {
      len: val.length >= 10,
      upper: /[A-Z]/.test(val) && /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      symbol: /[^A-Za-z0-9]/.test(val),
    };
    Object.entries(checks).forEach(([key, passed]) => {
      if (rules[key]) rules[key].classList.toggle("met", passed);
      if (passed) score++;
    });
    if (val.length >= 14) score = Math.min(score + 1, 4);

    const pct = val.length === 0 ? 0 : (score / 4) * 100;
    fill.style.width = pct + "%";
    fill.style.background = colors[score] || colors[0];
    verdict.textContent = val.length === 0 ? "Start typing to test a password (nothing is saved or sent)." : labels[score];
  });

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isPw = input.type === "password";
      input.type = isPw ? "text" : "password";
      toggle.innerHTML = isPw
        ? '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
    });
  }
}

/* ---------------------------------------------------------------
   Back to top button
   --------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 500);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}