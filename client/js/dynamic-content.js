/* ==========================================================================
   CyberSafe India — dynamic-content.js
   Progressive enhancement: if the API is reachable, replace the static
   (fallback) scam/FAQ/security-tip cards with live data from MongoDB,
   using the exact same markup/classes so nothing visually changes.
   Falls back silently to the static content already in the HTML if the
   API is unreachable (e.g. backend not running yet).
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  hydrateScams();
  hydrateFAQs();
  hydrateSecurityTips();
  hydrateNewsletterForm();
});

function esc(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const CATEGORY_ICON = {
  "UPI Scam": "fa-indian-rupee-sign",
  "OTP Scam": "fa-comment-sms",
  "QR Code Scam": "fa-qrcode",
  "Fake Job Scam": "fa-briefcase",
  "Investment Scam": "fa-chart-line",
  "Fake Customer Care Scam": "fa-headset",
  "Delivery Scam": "fa-truck-fast",
  Other: "fa-triangle-exclamation",
};

/* ---------------------------------------------------------------
   Scam articles (scams.html)
   --------------------------------------------------------------- */
async function hydrateScams() {
  const container = document.getElementById("scam-list-container");
  if (!container || typeof CSIApi === "undefined") return;

  try {
    const { data } = await CSIApi.getScams();
    if (!Array.isArray(data) || data.length === 0) return; // keep static fallback

    container.innerHTML = data
      .map((scam) => {
        const icon = CATEGORY_ICON[scam.category] || CATEGORY_ICON.Other;
        const warnings = (scam.warningSigns || [])
          .map((w) => `<li><i class="fa-solid fa-triangle-exclamation"></i>${esc(w)}</li>`)
          .join("");
        const preventions = (scam.preventionTips || [])
          .map((p) => `<li><i class="fa-solid fa-circle-check"></i>${esc(p)}</li>`)
          .join("");
        return `
        <article class="glass scam-card reveal" id="scam-${scam._id}">
          <div class="scam-card-head">
            <span class="icon-badge"><i class="fa-solid ${icon}"></i></span>
            <h3>${esc(scam.title)}</h3>
            <i class="fa-solid fa-chevron-down chev" aria-hidden="true"></i>
          </div>
          <div class="scam-card-body">
            <div class="scam-card-inner">
              <div class="scam-block"><h4>Overview</h4><p>${esc(scam.description)}</p></div>
              <div class="scam-block"><h4>How it works</h4><p>${esc(scam.howItWorks)}</p></div>
              <div class="scam-block warn"><h4>Warning signs</h4><ul>${warnings}</ul></div>
              <div class="scam-block prevent"><h4>Prevention tips</h4><ul>${preventions}</ul></div>
            </div>
          </div>
        </article>`;
      })
      .join("");

    // Re-run the interactions that only apply to elements present at DOMContentLoaded
    if (typeof initAccordions === "function") initAccordions("[data-accordion='scam']", ".scam-card", ".scam-card-head");
    if (typeof initScrollReveal === "function") initScrollReveal();
  } catch (err) {
    console.warn("Scams API unavailable, showing static content:", err.message);
  }
}

/* ---------------------------------------------------------------
   FAQ (faq.html)
   --------------------------------------------------------------- */
async function hydrateFAQs() {
  const container = document.getElementById("faq-list-container");
  if (!container || typeof CSIApi === "undefined") return;

  try {
    const { data } = await CSIApi.getFAQs();
    if (!Array.isArray(data) || data.length === 0) return;

    container.innerHTML = data
      .map(
        (faq) => `
        <div class="faq-item reveal" id="faq-${faq._id}">
          <button class="faq-q">${esc(faq.question)} <i class="fa-solid fa-plus"></i></button>
          <div class="faq-a"><p>${esc(faq.answer)}</p></div>
        </div>`
      )
      .join("");

    if (typeof initAccordions === "function") initAccordions("[data-accordion='faq']", ".faq-item", ".faq-q");
    if (typeof initScrollReveal === "function") initScrollReveal();
  } catch (err) {
    console.warn("FAQ API unavailable, showing static content:", err.message);
  }
}

/* ---------------------------------------------------------------
   Security tips (security-tips.html)
   --------------------------------------------------------------- */
async function hydrateSecurityTips() {
  const container = document.getElementById("security-tips-grid");
  if (!container || typeof CSIApi === "undefined") return;

  try {
    const { data } = await CSIApi.getSecurityTips();
    if (!Array.isArray(data) || data.length === 0) return;

    container.innerHTML = data
      .map(
        (tip) => `
        <div class="glass check-card reveal" id="tip-${tip._id}">
          <span class="icon-badge"><i class="${esc(tip.icon || "fa-solid fa-shield-halved")}"></i></span>
          <h4>${esc(tip.title)}</h4>
          <p>${esc(tip.description)}</p>
        </div>`
      )
      .join("");

    if (typeof initScrollReveal === "function") initScrollReveal();
  } catch (err) {
    console.warn("Security tips API unavailable, showing static content:", err.message);
  }
}

/* ---------------------------------------------------------------
   Footer newsletter subscribe form (injected on every page — see footer-newsletter.js)
   --------------------------------------------------------------- */
function hydrateNewsletterForm() {
  const form = document.getElementById("newsletter-form");
  if (!form || typeof CSIApi === "undefined") return;

  const input = document.getElementById("newsletter-email");
  const msg = document.getElementById("newsletter-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    try {
      const res = await CSIApi.subscribeNewsletter(input.value.trim());
      msg.textContent = res.message || "Subscribed!";
      msg.style.color = "var(--green-500)";
      form.reset();
    } catch (err) {
      msg.textContent = err.message || "Could not subscribe. Please try again.";
      msg.style.color = "var(--red-500)";
    }
  });
}
