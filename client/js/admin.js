/* ==========================================================================
   CyberSafe India — admin.js
   Powers admin-login.html and admin-dashboard.html.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("admin-login-form")) initAdminLogin();
  if (document.querySelector(".admin-shell")) initAdminDashboard();
});

/* ---------------------------------------------------------------
   Admin login page
   --------------------------------------------------------------- */
function initAdminLogin() {
  const form = document.getElementById("admin-login-form");
  const errorBox = document.getElementById("admin-login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.remove("show");
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    try {
      const { token, admin } = await CSIApi.adminLogin({
        username: form.username.value.trim(),
        password: form.password.value,
      });
      CSIApi.setToken("admin", token);
      localStorage.setItem("csi_admin_name", admin.username);
      window.location.href = "admin-dashboard.html";
    } catch (err) {
      errorBox.textContent = err.message || "Invalid username or password.";
      errorBox.classList.add("show");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ---------------------------------------------------------------
   Admin dashboard
   --------------------------------------------------------------- */
function initAdminDashboard() {
  // Guard: bounce to login if no token
  if (!CSIApi.getToken("admin")) {
    window.location.href = "admin-login.html";
    return;
  }
  const whoami = document.getElementById("admin-whoami");
  if (whoami) whoami.textContent = localStorage.getItem("csi_admin_name") || "Admin";

  document.getElementById("admin-logout").addEventListener("click", (e) => {
    e.preventDefault();
    CSIApi.clearToken("admin");
    window.location.href = "admin-login.html";
  });

  // ---- Panel switching ----
  const panels = document.querySelectorAll(".admin-panel-view");
  const navLinks = document.querySelectorAll(".admin-nav a[data-target]");
  const panelTitle = document.getElementById("panel-title");
  const TITLES = {
    overview: "Overview",
    scams: "Scam Articles",
    faqs: "FAQs",
    tips: "Security Tips",
    quiz: "Quiz Questions",
    feedback: "Feedback",
    newsletter: "Newsletter Subscribers",
  };
  const loaders = {
    overview: loadOverview,
    scams: loadScams,
    faqs: loadFAQs,
    tips: loadTips,
    quiz: loadQuiz,
    feedback: loadFeedback,
    newsletter: loadNewsletter,
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      panels.forEach((p) => (p.style.display = p.dataset.panel === target ? "block" : "none"));
      panelTitle.textContent = TITLES[target];
      loaders[target]?.();
    });
  });

  // Handle 401s globally by bouncing to login
  window.addEventListener("csi-admin-unauthorized", () => {
    CSIApi.clearToken("admin");
    window.location.href = "admin-login.html";
  });

  loadOverview();

  /* ================= OVERVIEW ================= */
  async function loadOverview() {
    try {
      const { data } = await CSIApi.adminGetAnalytics();
      const stats = document.querySelectorAll("#overview-stats .admin-stat .num");
      const values = [
        data.totalScams,
        data.totalFaqs,
        data.totalFeedback,
        data.totalSubscribers,
        data.totalUsers,
        data.totalQuizQuestions,
        data.totalQuizzesCompleted,
        data.mostViewedScam ? data.mostViewedScam.title : "—",
      ];
      stats.forEach((el, i) => (el.textContent = values[i]));

      const tbody = document.querySelector("#overview-recent-table tbody");
      if (!data.recentActivity || data.recentActivity.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="admin-empty">No feedback yet.</td></tr>';
      } else {
        tbody.innerHTML = data.recentActivity
          .map((f) => `<tr><td>${esc(f.name)}</td><td>${esc(f.subject)}</td><td>${formatDate(f.createdAt)}</td></tr>`)
          .join("");
      }
    } catch (err) {
      handleAuthError(err);
    }
  }

  /* ================= SCAMS ================= */
  async function loadScams() {
    const tbody = document.querySelector("#scams-table tbody");
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">Loading…</td></tr>';
    try {
      const { data } = await CSIApi.getScams();
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No scam articles yet. Add the first one.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (s) => `
        <tr>
          <td>${esc(s.title)}</td>
          <td><span class="chip">${esc(s.category)}</span></td>
          <td>${s.views}</td>
          <td>${formatDate(s.updatedAt)}</td>
          <td class="admin-row-actions">
            <button class="icon-btn" data-edit-scam="${s._id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="icon-btn danger" data-delete-scam="${s._id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`
        )
        .join("");

      tbody.querySelectorAll("[data-edit-scam]").forEach((btn) =>
        btn.addEventListener("click", () => openScamModal(data.find((s) => s._id === btn.dataset.editScam)))
      );
      tbody.querySelectorAll("[data-delete-scam]").forEach((btn) =>
        btn.addEventListener("click", () => confirmDelete("scam article", () => CSIApi.adminDeleteScam(btn.dataset.deleteScam), loadScams))
      );
    } catch (err) {
      handleAuthError(err);
    }
  }

  document.getElementById("add-scam-btn").addEventListener("click", () => openScamModal(null));

  function openScamModal(scam) {
    const categories = ["UPI Scam", "OTP Scam", "QR Code Scam", "Fake Job Scam", "Investment Scam", "Fake Customer Care Scam", "Delivery Scam", "Other"];
    openModal(`
      <h3>${scam ? "Edit" : "Add"} Scam Article</h3>
      <form id="scam-form">
        <div class="form-group"><label>Title</label><input type="text" name="title" required value="${esc(scam?.title || "")}" /></div>
        <div class="form-group"><label>Category</label>
          <select name="category" required>
            ${categories.map((c) => `<option ${scam?.category === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
        <div class="form-group"><label>Overview / Description</label><textarea name="description" required>${esc(scam?.description || "")}</textarea></div>
        <div class="form-group"><label>How It Works</label><textarea name="howItWorks" required>${esc(scam?.howItWorks || "")}</textarea></div>
        <div class="form-group"><label>Warning Signs (one per line)</label><textarea name="warningSigns" required>${(scam?.warningSigns || []).join("\n")}</textarea></div>
        <div class="form-group"><label>Prevention Tips (one per line)</label><textarea name="preventionTips" required>${(scam?.preventionTips || []).join("\n")}</textarea></div>
        <div class="form-group"><label>Image (optional)</label><input type="file" name="image" accept="image/*" /></div>
        <button type="submit" class="btn btn-primary btn-block">${scam ? "Save Changes" : "Create Article"}</button>
      </form>
    `);

    document.getElementById("scam-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData();
      fd.append("title", form.title.value.trim());
      fd.append("category", form.category.value);
      fd.append("description", form.description.value.trim());
      fd.append("howItWorks", form.howItWorks.value.trim());
      fd.append("warningSigns", JSON.stringify(form.warningSigns.value.split("\n").map((s) => s.trim()).filter(Boolean)));
      fd.append("preventionTips", JSON.stringify(form.preventionTips.value.split("\n").map((s) => s.trim()).filter(Boolean)));
      if (form.image.files[0]) fd.append("image", form.image.files[0]);

      try {
        if (scam) await CSIApi.adminUpdateScam(scam._id, fd);
        else await CSIApi.adminCreateScam(fd);
        closeModal();
        showToast(`Scam article ${scam ? "updated" : "created"}.`, "success");
        loadScams();
      } catch (err) {
        showToast(err.message || "Could not save the article.", "error");
      }
    });
  }

  /* ================= FAQS ================= */
  async function loadFAQs() {
    const tbody = document.querySelector("#faqs-table tbody");
    tbody.innerHTML = '<tr><td colspan="3" class="admin-empty">Loading…</td></tr>';
    try {
      const { data } = await CSIApi.getFAQs();
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="admin-empty">No FAQs yet. Add the first one.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (f) => `
        <tr>
          <td>${esc(f.question)}</td>
          <td><span class="chip">${esc(f.category)}</span></td>
          <td class="admin-row-actions">
            <button class="icon-btn" data-edit-faq="${f._id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="icon-btn danger" data-delete-faq="${f._id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`
        )
        .join("");

      tbody.querySelectorAll("[data-edit-faq]").forEach((btn) =>
        btn.addEventListener("click", () => openFAQModal(data.find((f) => f._id === btn.dataset.editFaq)))
      );
      tbody.querySelectorAll("[data-delete-faq]").forEach((btn) =>
        btn.addEventListener("click", () => confirmDelete("FAQ", () => CSIApi.adminDeleteFAQ(btn.dataset.deleteFaq), loadFAQs))
      );
    } catch (err) {
      handleAuthError(err);
    }
  }

  document.getElementById("add-faq-btn").addEventListener("click", () => openFAQModal(null));

  function openFAQModal(faq) {
    openModal(`
      <h3>${faq ? "Edit" : "Add"} FAQ</h3>
      <form id="faq-form">
        <div class="form-group"><label>Question</label><input type="text" name="question" required value="${esc(faq?.question || "")}" /></div>
        <div class="form-group"><label>Answer</label><textarea name="answer" required>${esc(faq?.answer || "")}</textarea></div>
        <div class="form-group"><label>Category</label><input type="text" name="category" value="${esc(faq?.category || "General")}" /></div>
        <div class="form-group"><label>Order</label><input type="number" name="order" value="${faq?.order ?? 0}" /></div>
        <button type="submit" class="btn btn-primary btn-block">${faq ? "Save Changes" : "Create FAQ"}</button>
      </form>
    `);

    document.getElementById("faq-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {
        question: form.question.value.trim(),
        answer: form.answer.value.trim(),
        category: form.category.value.trim() || "General",
        order: Number(form.order.value) || 0,
      };
      try {
        if (faq) await CSIApi.adminUpdateFAQ(faq._id, payload);
        else await CSIApi.adminCreateFAQ(payload);
        closeModal();
        showToast(`FAQ ${faq ? "updated" : "created"}.`, "success");
        loadFAQs();
      } catch (err) {
        showToast(err.message || "Could not save the FAQ.", "error");
      }
    });
  }

  /* ================= SECURITY TIPS ================= */
  async function loadTips() {
    const tbody = document.querySelector("#tips-table tbody");
    tbody.innerHTML = '<tr><td colspan="3" class="admin-empty">Loading…</td></tr>';
    try {
      const { data } = await CSIApi.getSecurityTips();
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="admin-empty">No security tips yet. Add the first one.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (t) => `
        <tr>
          <td>${esc(t.title)}</td>
          <td><span class="chip">${esc(t.category)}</span></td>
          <td class="admin-row-actions">
            <button class="icon-btn" data-edit-tip="${t._id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="icon-btn danger" data-delete-tip="${t._id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`
        )
        .join("");

      tbody.querySelectorAll("[data-edit-tip]").forEach((btn) =>
        btn.addEventListener("click", () => openTipModal(data.find((t) => t._id === btn.dataset.editTip)))
      );
      tbody.querySelectorAll("[data-delete-tip]").forEach((btn) =>
        btn.addEventListener("click", () => confirmDelete("security tip", () => CSIApi.adminDeleteTip(btn.dataset.deleteTip), loadTips))
      );
    } catch (err) {
      handleAuthError(err);
    }
  }

  document.getElementById("add-tip-btn").addEventListener("click", () => openTipModal(null));

  function openTipModal(tip) {
    openModal(`
      <h3>${tip ? "Edit" : "Add"} Security Tip</h3>
      <form id="tip-form">
        <div class="form-group"><label>Title</label><input type="text" name="title" required value="${esc(tip?.title || "")}" /></div>
        <div class="form-group"><label>Description</label><textarea name="description" required>${esc(tip?.description || "")}</textarea></div>
        <div class="form-group"><label>Font Awesome icon class</label><input type="text" name="icon" placeholder="fa-solid fa-shield-halved" value="${esc(tip?.icon || "fa-solid fa-shield-halved")}" /></div>
        <div class="form-group"><label>Category</label><input type="text" name="category" value="${esc(tip?.category || "General")}" /></div>
        <div class="form-group"><label>Order</label><input type="number" name="order" value="${tip?.order ?? 0}" /></div>
        <div class="form-group"><label>Image (optional)</label><input type="file" name="image" accept="image/*" /></div>
        <button type="submit" class="btn btn-primary btn-block">${tip ? "Save Changes" : "Create Tip"}</button>
      </form>
    `);

    document.getElementById("tip-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData();
      fd.append("title", form.title.value.trim());
      fd.append("description", form.description.value.trim());
      fd.append("icon", form.icon.value.trim() || "fa-solid fa-shield-halved");
      fd.append("category", form.category.value.trim() || "General");
      fd.append("order", form.order.value || 0);
      if (form.image.files[0]) fd.append("image", form.image.files[0]);

      try {
        if (tip) await CSIApi.adminUpdateTip(tip._id, fd);
        else await CSIApi.adminCreateTip(fd);
        closeModal();
        showToast(`Security tip ${tip ? "updated" : "created"}.`, "success");
        loadTips();
      } catch (err) {
        showToast(err.message || "Could not save the tip.", "error");
      }
    });
  }

  /* ================= QUIZ ================= */
  async function loadQuiz() {
    const tbody = document.querySelector("#quiz-table tbody");
    tbody.innerHTML = '<tr><td colspan="4" class="admin-empty">Loading…</td></tr>';
    try {
      const { data } = await CSIApi.adminGetQuizQuestions();
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="admin-empty">No quiz questions yet. Add the first one.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (q) => `
        <tr>
          <td>${esc(q.question)}</td>
          <td><span class="chip">${esc(q.difficulty)}</span></td>
          <td>${esc(q.category)}</td>
          <td class="admin-row-actions">
            <button class="icon-btn" data-edit-quiz="${q._id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="icon-btn danger" data-delete-quiz="${q._id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`
        )
        .join("");

      tbody.querySelectorAll("[data-edit-quiz]").forEach((btn) =>
        btn.addEventListener("click", () => openQuizModal(data.find((q) => q._id === btn.dataset.editQuiz)))
      );
      tbody.querySelectorAll("[data-delete-quiz]").forEach((btn) =>
        btn.addEventListener("click", () => confirmDelete("quiz question", () => CSIApi.adminDeleteQuizQuestion(btn.dataset.deleteQuiz), loadQuiz))
      );
    } catch (err) {
      handleAuthError(err);
    }
  }

  document.getElementById("add-quiz-btn").addEventListener("click", () => openQuizModal(null));

  function openQuizModal(q) {
    const opts = q?.options || ["", "", "", ""];
    openModal(`
      <h3>${q ? "Edit" : "Add"} Quiz Question</h3>
      <form id="quiz-form">
        <div class="form-group"><label>Question</label><input type="text" name="question" required value="${esc(q?.question || "")}" /></div>
        <div class="form-group"><label>Option A</label><input type="text" name="opt0" required value="${esc(opts[0] || "")}" /></div>
        <div class="form-group"><label>Option B</label><input type="text" name="opt1" required value="${esc(opts[1] || "")}" /></div>
        <div class="form-group"><label>Option C</label><input type="text" name="opt2" required value="${esc(opts[2] || "")}" /></div>
        <div class="form-group"><label>Option D</label><input type="text" name="opt3" required value="${esc(opts[3] || "")}" /></div>
        <div class="form-group"><label>Correct Answer</label>
          <select name="correctAnswer" required>
            <option value="0" ${q?.correctAnswer === 0 ? "selected" : ""}>Option A</option>
            <option value="1" ${q?.correctAnswer === 1 ? "selected" : ""}>Option B</option>
            <option value="2" ${q?.correctAnswer === 2 ? "selected" : ""}>Option C</option>
            <option value="3" ${q?.correctAnswer === 3 ? "selected" : ""}>Option D</option>
          </select>
        </div>
        <div class="form-group"><label>Difficulty</label>
          <select name="difficulty">
            <option ${q?.difficulty === "easy" ? "selected" : ""}>easy</option>
            <option ${q?.difficulty === "medium" ? "selected" : ""}>medium</option>
            <option ${q?.difficulty === "hard" ? "selected" : ""}>hard</option>
          </select>
        </div>
        <div class="form-group"><label>Category</label><input type="text" name="category" value="${esc(q?.category || "General")}" /></div>
        <button type="submit" class="btn btn-primary btn-block">${q ? "Save Changes" : "Create Question"}</button>
      </form>
    `);

    document.getElementById("quiz-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {
        question: form.question.value.trim(),
        options: [form.opt0.value.trim(), form.opt1.value.trim(), form.opt2.value.trim(), form.opt3.value.trim()],
        correctAnswer: Number(form.correctAnswer.value),
        difficulty: form.difficulty.value,
        category: form.category.value.trim() || "General",
      };
      try {
        if (q) await CSIApi.adminUpdateQuizQuestion(q._id, payload);
        else await CSIApi.adminCreateQuizQuestion(payload);
        closeModal();
        showToast(`Quiz question ${q ? "updated" : "created"}.`, "success");
        loadQuiz();
      } catch (err) {
        showToast(err.message || "Could not save the question.", "error");
      }
    });
  }

  /* ================= FEEDBACK (read + delete only) ================= */
  async function loadFeedback() {
    const tbody = document.querySelector("#feedback-table tbody");
    tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">Loading…</td></tr>';
    try {
      const { data } = await CSIApi.adminGetFeedback();
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">No feedback submitted yet.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (f) => `
        <tr>
          <td>${esc(f.name)}</td>
          <td>${esc(f.email)}</td>
          <td>${esc(f.subject)}</td>
          <td style="max-width:260px;">${esc(f.message)}</td>
          <td>${formatDate(f.createdAt)}</td>
          <td class="admin-row-actions">
            <button class="icon-btn danger" data-delete-feedback="${f._id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`
        )
        .join("");

      tbody.querySelectorAll("[data-delete-feedback]").forEach((btn) =>
        btn.addEventListener("click", () => confirmDelete("feedback message", () => CSIApi.adminDeleteFeedback(btn.dataset.deleteFeedback), loadFeedback))
      );
    } catch (err) {
      handleAuthError(err);
    }
  }

  /* ================= NEWSLETTER (read + delete only) ================= */
  async function loadNewsletter() {
    const tbody = document.querySelector("#newsletter-table tbody");
    tbody.innerHTML = '<tr><td colspan="3" class="admin-empty">Loading…</td></tr>';
    try {
      const { data } = await CSIApi.adminGetSubscribers();
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="admin-empty">No subscribers yet.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (s) => `
        <tr>
          <td>${esc(s.email)}</td>
          <td>${formatDate(s.createdAt)}</td>
          <td class="admin-row-actions">
            <button class="icon-btn danger" data-delete-sub="${s._id}" title="Remove"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`
        )
        .join("");

      tbody.querySelectorAll("[data-delete-sub]").forEach((btn) =>
        btn.addEventListener("click", () => confirmDelete("subscriber", () => CSIApi.adminDeleteSubscriber(btn.dataset.deleteSub), loadNewsletter))
      );
    } catch (err) {
      handleAuthError(err);
    }
  }

  /* ================= Shared helpers ================= */
  function handleAuthError(err) {
    if (err.status === 401 || err.status === 403) {
      window.dispatchEvent(new Event("csi-admin-unauthorized"));
    } else {
      showToast(err.message || "Something went wrong.", "error");
    }
  }

  async function confirmDelete(label, deleteFn, reload) {
    if (!confirm(`Delete this ${label}? This can't be undone.`)) return;
    try {
      await deleteFn();
      showToast(`${label[0].toUpperCase() + label.slice(1)} deleted.`, "success");
      reload();
      loadOverview();
    } catch (err) {
      showToast(err.message || `Could not delete this ${label}.`, "error");
    }
  }
}

/* ---------------------------------------------------------------
   Modal + toast (shared UI helpers)
   --------------------------------------------------------------- */
function openModal(html) {
  const overlay = document.getElementById("modal-overlay");
  document.getElementById("modal-box").innerHTML = html;
  overlay.classList.add("open");
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function esc(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
