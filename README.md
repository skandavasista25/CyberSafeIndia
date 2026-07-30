# CyberSafe India

A full-stack cyber awareness platform for India — static HTML/CSS/JS frontend, Node.js/Express/MongoDB backend, JWT-secured admin dashboard, and a public cyber-safety quiz.

The frontend design (layout, colours, animations, responsiveness) is unchanged from the original static site. Everything in this document is about the backend that now powers it: a real database, an admin dashboard, authentication, and a handful of new pages (Quiz, Login, Register, Admin).

---

## 1. Folder Structure

```
CyberSafeIndia/
│
├── client/                    Static frontend (no build step required)
│   ├── index.html             Home page
│   ├── pages/                 All other pages
│   │   ├── scams.html, phishing.html, password-safety.html, upi-safety.html,
│   │   │   reporting.html, security-tips.html, faq.html, contact.html
│   │   ├── quiz.html, login.html, register.html      (new)
│   │   └── admin-login.html, admin-dashboard.html    (new, admin-only)
│   ├── css/style.css          One stylesheet for the whole site
│   ├── js/
│   │   ├── script.js          Original UI logic (nav, accordions, reveal, etc.)
│   │   ├── api.js             Fetch wrapper for the backend API        (new)
│   │   ├── dynamic-content.js Hydrates scams/FAQs/tips from the API    (new)
│   │   ├── quiz.js            Quiz-taking logic                        (new)
│   │   ├── auth.js            User login/register logic                (new)
│   │   └── admin.js           Admin dashboard logic                    (new)
│   ├── images/
│   └── assets/
│
├── server/                    Express + MongoDB backend
│   ├── config/db.js           Mongoose connection
│   ├── models/                Admin, User, Scam, FAQ, SecurityTip, Feedback, Newsletter, Quiz
│   ├── controllers/           One controller per resource (business logic)
│   ├── routes/                One router per resource (maps HTTP verbs to controllers)
│   ├── middleware/             auth (JWT), upload (Multer), rateLimiter, validate, errorHandler
│   ├── utils/                 generateToken, seedAdmin.js, seedContent.js
│   ├── uploads/                Uploaded scam/tip images (Multer writes here)
│   └── server.js              App entry point — wires everything together
│
├── package.json                Convenience scripts for the whole repo
├── .env.example                 Copy to .env and fill in real values
├── .gitignore
└── README.md
```

This follows an **MVC** pattern: `models/` (data), `controllers/` (logic), `routes/` (HTTP mapping), with `middleware/` handling cross-cutting concerns (auth, validation, security, uploads).

---

## 2. Installation Guide

### Prerequisites
- Node.js 18+ and npm
- A MongoDB database — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Steps

```bash
# 1. Clone / unzip the project, then from the project root:
cp .env.example .env
# Edit .env and set MONGO_URI, JWT_SECRET, CLIENT_URL, and the SEED_ADMIN_* values

# 2. Install backend dependencies
npm run install:server

# 3. Create the first admin account (reads SEED_ADMIN_* from .env)
npm run seed:admin

# 4. (Optional) Seed some starter scams/FAQs/tips/quiz questions
npm run seed:content

# 5. Start the API (development mode, auto-restarts on changes)
npm run dev:server
# API now running at http://localhost:5000/api

# 6. Serve the frontend
# Any static server works — e.g. from client/:
npx serve client
# or the VS Code "Live Server" extension, opening client/index.html
```

Open the served frontend URL in your browser. The site works even without the backend running (all original static content is still there); once the backend is up, scams/FAQs/security tips are transparently replaced with live data from MongoDB, the contact form saves to the database, and the newsletter/quiz/login features become functional.

To reach the admin dashboard, go to `pages/admin-login.html` and log in with the credentials you set in `.env` before running `npm run seed:admin`.

### Environment variables (`.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Origin allowed by CORS (your frontend's URL) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `SEED_ADMIN_USERNAME/EMAIL/PASSWORD` | Used only once, by `npm run seed:admin` |

---

## 3. API Documentation

Base URL: `http://localhost:5000/api` (or your deployed API URL)

All responses are JSON: `{ success: true, data: ... }` on success, `{ success: false, message: ... }` on error.
Endpoints marked 🔒 require `Authorization: Bearer <token>` — an **admin** token unless noted otherwise.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/admin/login` | Admin login → `{ token, admin }` |
| POST | `/auth/register` | Public user registration → `{ token, user }` |
| POST | `/auth/login` | Public user login → `{ token, user }` |
| GET | `/auth/me` | 🔒 (user) Get the logged-in user's profile |

### Scams
| Method | Endpoint | Description |
|---|---|---|
| GET | `/scams` | List all scam articles (`?category=` optional filter) |
| GET | `/scams/:id` | Get one article (increments its view counter) |
| POST | `/scams` | 🔒 Create an article (multipart form-data, `image` file optional) |
| PUT | `/scams/:id` | 🔒 Update an article |
| DELETE | `/scams/:id` | 🔒 Delete an article |

### FAQs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/faqs` | List all FAQs |
| POST | `/faqs` | 🔒 Create an FAQ |
| PUT | `/faqs/:id` | 🔒 Update an FAQ |
| DELETE | `/faqs/:id` | 🔒 Delete an FAQ |

### Security Tips
| Method | Endpoint | Description |
|---|---|---|
| GET | `/security-tips` | List all tips |
| POST | `/security-tips` | 🔒 Create a tip (multipart, `image` optional) |
| PUT | `/security-tips/:id` | 🔒 Update a tip |
| DELETE | `/security-tips/:id` | 🔒 Delete a tip |

### Feedback (contact form)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/feedback` | Public — submit the contact form |
| GET | `/feedback` | 🔒 List all feedback |
| DELETE | `/feedback/:id` | 🔒 Delete a feedback entry |

### Newsletter
| Method | Endpoint | Description |
|---|---|---|
| POST | `/newsletter` | Public — subscribe an email (rejects duplicates) |
| GET | `/newsletter` | 🔒 List subscribers |
| DELETE | `/newsletter/:id` | 🔒 Remove a subscriber |

### Search
| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?q=upi` | Public — search across scams, FAQs, and security tips |

### Quiz
| Method | Endpoint | Description |
|---|---|---|
| GET | `/quiz` | Public — get quiz questions, correct answers stripped (`?limit=10&category=&difficulty=`) |
| GET | `/quiz/admin` | 🔒 Get all questions including correct answers |
| POST | `/quiz/submit` | Public (or 🔒 user) — submit `{ answers: [{questionId, selected}] }`, returns score. If a user token is sent, the attempt is saved to their history. |
| POST | `/quiz` | 🔒 Create a question |
| PUT | `/quiz/:id` | 🔒 Update a question |
| DELETE | `/quiz/:id` | 🔒 Delete a question |

### Users (logged-in public users)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/bookmarks` | 🔒 (user) Get bookmarked scams |
| POST | `/users/bookmarks/:scamId` | 🔒 (user) Toggle a bookmark |
| GET | `/users/history` | 🔒 (user) Get quiz history |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics` | 🔒 Dashboard totals: scams, FAQs, feedback, subscribers, users, quiz questions/completions, most-viewed scam, recent feedback |

---

## 4. Security

- **Helmet** — sensible security headers
- **CORS** — restricted to `CLIENT_URL`
- **express-rate-limit** — general API limiter + a stricter limiter on auth routes
- **express-mongo-sanitize** — strips `$`/`.` operators from input to block NoSQL injection
- **xss-clean** — strips malicious HTML/JS from request bodies
- **express-validator** — input validation on every write endpoint
- **bcryptjs** — password hashing (10 salt rounds) for both Admin and User models
- **JWT** — separate token "type" (`admin` vs `user`) so a user token can never access admin routes and vice versa
- Environment variables for all secrets — nothing sensitive is hard-coded

---

## 5. Deployment Guide

**Frontend** (`client/`) — deploy as-is to any static host:
- **Netlify / Vercel**: drag-and-drop the `client/` folder, or point a project at it
- **GitHub Pages**: push `client/` contents to a `gh-pages` branch

Before deploying, set `window.CSI_API_BASE = "https://your-api-url.com/api";` in a small inline `<script>` tag before `api.js` on each page (or edit the constant in `js/api.js` directly) so the frontend points at your deployed backend instead of `localhost:5000`.

**Backend** (`server/`) — deploy to a Node host:
- **Render / Railway**: create a new Web Service pointing at the `server/` folder, build command `npm install`, start command `npm start`, and set the same environment variables as your `.env` file in the host's dashboard.
- Make sure `CLIENT_URL` is set to your deployed frontend's URL so CORS allows it.

**Database**: use a [MongoDB Atlas](https://www.mongodb.com/atlas) free-tier cluster — copy its connection string into `MONGO_URI`, and whitelist your backend host's IP (or `0.0.0.0/0` for simplicity during development).

After deploying, run `npm run seed:admin` once (pointed at the production `MONGO_URI`) to create your first admin account, then log in at `/pages/admin-login.html` and start adding real content.

---

## 6. Coding Standards Used

- MVC architecture (models / controllers / routes)
- Async route handlers wrapped in a shared `asyncHandler` so errors always reach the central error handler
- Input validated with `express-validator` on every write endpoint
- All secrets and environment-specific values in `.env`, never hard-coded
- Frontend uses progressive enhancement: every page still works from its static HTML if the API is unreachable; JavaScript only *replaces* content when a live response is received
