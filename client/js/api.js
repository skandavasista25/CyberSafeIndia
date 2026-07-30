/* ==========================================================================
   CyberSafe India — api.js
   Thin fetch wrapper for talking to the Express/MongoDB backend.
   Loaded on every page, right before script.js.
   ========================================================================== */

// Auto-detects a local backend on 5000 during development; override by
// setting window.CSI_API_BASE before this script loads (e.g. for production).
const API_BASE =
  window.CSI_API_BASE ||
  (["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000/api"
    : "/api");

const TOKEN_KEYS = { user: "csi_user_token", admin: "csi_admin_token" };

const CSIApi = {
  // ---- token helpers ----
  getToken(type = "user") {
    return localStorage.getItem(TOKEN_KEYS[type]);
  },
  setToken(type, token) {
    localStorage.setItem(TOKEN_KEYS[type], token);
  },
  clearToken(type = "user") {
    localStorage.removeItem(TOKEN_KEYS[type]);
  },

  // ---- core request helper ----
  async request(path, { method = "GET", body, tokenType, isForm = false } = {}) {
    const headers = {};
    if (!isForm) headers["Content-Type"] = "application/json";
    if (tokenType) {
      const token = this.getToken(tokenType);
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      });
    } catch (networkErr) {
      throw new Error("Could not reach the CyberSafe India server. Please try again shortly.");
    }
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok || data.success === false) {
      const err = new Error(data.message || "Something went wrong");
      err.status = res.status;
      err.errors = data.errors;
      throw err;
    }
    return data;
  },

  // ---- public content ----
  getScams: (category) => CSIApi.request(`/scams${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  getScam: (id) => CSIApi.request(`/scams/${id}`),
  getFAQs: () => CSIApi.request("/faqs"),
  getSecurityTips: () => CSIApi.request("/security-tips"),
  search: (q) => CSIApi.request(`/search?q=${encodeURIComponent(q)}`),

  // ---- feedback / newsletter ----
  submitFeedback: (payload) => CSIApi.request("/feedback", { method: "POST", body: payload }),
  subscribeNewsletter: (email) => CSIApi.request("/newsletter", { method: "POST", body: { email } }),

  // ---- quiz ----
  getQuiz: (params = "") => CSIApi.request(`/quiz${params}`),
  submitQuiz: (payload) => CSIApi.request("/quiz/submit", { method: "POST", body: payload, tokenType: "user" }),

  // ---- user auth ----
  registerUser: (payload) => CSIApi.request("/auth/register", { method: "POST", body: payload }),
  loginUser: (payload) => CSIApi.request("/auth/login", { method: "POST", body: payload }),
  getMe: () => CSIApi.request("/auth/me", { tokenType: "user" }),
  toggleBookmark: (scamId) => CSIApi.request(`/users/bookmarks/${scamId}`, { method: "POST", tokenType: "user" }),
  getBookmarks: () => CSIApi.request("/users/bookmarks", { tokenType: "user" }),
  getHistory: () => CSIApi.request("/users/history", { tokenType: "user" }),

  // ---- admin auth ----
  adminLogin: (payload) => CSIApi.request("/auth/admin/login", { method: "POST", body: payload }),

  // ---- admin: scams ----
  adminCreateScam: (formData) => CSIApi.request("/scams", { method: "POST", body: formData, tokenType: "admin", isForm: true }),
  adminUpdateScam: (id, formData) => CSIApi.request(`/scams/${id}`, { method: "PUT", body: formData, tokenType: "admin", isForm: true }),
  adminDeleteScam: (id) => CSIApi.request(`/scams/${id}`, { method: "DELETE", tokenType: "admin" }),

  // ---- admin: faqs ----
  adminCreateFAQ: (payload) => CSIApi.request("/faqs", { method: "POST", body: payload, tokenType: "admin" }),
  adminUpdateFAQ: (id, payload) => CSIApi.request(`/faqs/${id}`, { method: "PUT", body: payload, tokenType: "admin" }),
  adminDeleteFAQ: (id) => CSIApi.request(`/faqs/${id}`, { method: "DELETE", tokenType: "admin" }),

  // ---- admin: security tips ----
  adminCreateTip: (formData) => CSIApi.request("/security-tips", { method: "POST", body: formData, tokenType: "admin", isForm: true }),
  adminUpdateTip: (id, formData) => CSIApi.request(`/security-tips/${id}`, { method: "PUT", body: formData, tokenType: "admin", isForm: true }),
  adminDeleteTip: (id) => CSIApi.request(`/security-tips/${id}`, { method: "DELETE", tokenType: "admin" }),

  // ---- admin: feedback / newsletter ----
  adminGetFeedback: () => CSIApi.request("/feedback", { tokenType: "admin" }),
  adminDeleteFeedback: (id) => CSIApi.request(`/feedback/${id}`, { method: "DELETE", tokenType: "admin" }),
  adminGetSubscribers: () => CSIApi.request("/newsletter", { tokenType: "admin" }),
  adminDeleteSubscriber: (id) => CSIApi.request(`/newsletter/${id}`, { method: "DELETE", tokenType: "admin" }),

  // ---- admin: quiz ----
  adminGetQuizQuestions: () => CSIApi.request("/quiz/admin", { tokenType: "admin" }),
  adminCreateQuizQuestion: (payload) => CSIApi.request("/quiz", { method: "POST", body: payload, tokenType: "admin" }),
  adminUpdateQuizQuestion: (id, payload) => CSIApi.request(`/quiz/${id}`, { method: "PUT", body: payload, tokenType: "admin" }),
  adminDeleteQuizQuestion: (id) => CSIApi.request(`/quiz/${id}`, { method: "DELETE", tokenType: "admin" }),

  // ---- admin: analytics ----
  adminGetAnalytics: () => CSIApi.request("/analytics", { tokenType: "admin" }),
};
