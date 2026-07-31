# 🛡️ CyberSafe India

CyberSafe India is a responsive cyber awareness web application designed to educate users about online scams, phishing attacks, password security, UPI fraud, and digital safety. The platform also includes an interactive cyber security quiz, feedback system, user authentication, and quiz history using Firebase.

---

## 🚀 Features

- 🔐 Firebase Authentication
  - User Registration
  - User Login
  - Secure Logout

- 📝 Interactive Cyber Security Quiz
  - Random quiz questions
  - Instant score calculation
  - Answer review after submission
  - Quiz results stored in Firestore

- 📊 Quiz History
  - Stores previous quiz attempts
  - Displays latest five attempts
  - Shows score and percentage

- 💬 Feedback System
  - Users can submit feedback
  - Feedback stored securely in Firestore

- 📚 Cyber Awareness Pages
  - Phishing
  - UPI Fraud
  - Password Safety
  - Scam Awareness
  - Security Tips
  - Reporting Cyber Crime
  - FAQ

- 📱 Fully Responsive Design

---

# 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)

### Backend

- Firebase Authentication
- Firebase Firestore Database

### Deployment

- Vercel

---

# 📂 Project Structure

```
CyberSafeIndia/
│
├── assets/
│   ├── css/
│   │     style.css
│   │
│   ├── js/
│   │     firebase.js
│   │     auth.js
│   │     login.js
│   │     register.js
│   │     quiz.js
│   │     quiz-history.js
│   │     feedback.js
│   │     script.js
│   │
│   └── images/
│
├── pages/
│     login.html
│     register.html
│     quiz.html
│     quiz-history.html
│     feedback.html
│     phishing.html
│     scams.html
│     password-safety.html
│     reporting.html
│     security-tips.html
│     faq.html
│
├── index.html
├── firebase.json
├── README.md
└── .gitignore
```

---

# 🔥 Firebase Services Used

## Authentication

- Email & Password Sign In
- User Registration
- User Login
- Logout

---

## Firestore Collections

### users

Stores user information.

```
users
    uid
    name
    email
```

---

### quizResults

Stores quiz history.

```
quizResults
    uid
    name
    email
    score
    total
    percentage
    date
```

---

### feedback

Stores user feedback.

```
feedback
    uid
    name
    email
    message
    createdAt
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/skandavasista25/CyberSafeIndia.git
```

```
cd CyberSafeIndia
```

---

## Configure Firebase

Create your Firebase project.

Enable

- Authentication
- Firestore Database

Update

```
assets/js/firebase.js
```

with your Firebase configuration.

---

## Run Project

Simply open

```
index.html
```

or use

VS Code Live Server.

---

# 🔒 Firestore Security Rules

Authentication is required for storing quiz history and feedback.

Example:

```javascript
match /quizResults/{document} {
  allow read, write: if request.auth != null;
}

match /feedback/{document} {
  allow create: if request.auth != null;
}
```

---

# 🎯 Quiz Flow

```
Start Quiz
      │
      ▼
Random Questions
      │
      ▼
Submit Answers
      │
      ▼
Calculate Score
      │
      ▼
Save Result in Firestore
      │
      ▼
Display Score
      │
      ▼
Review Answers
      │
      ▼
Quiz History
```

---

# 🌐 Deployment

Project deployed using **Vercel**

Live Demo

https://cyber-safe-india-nine.vercel.app

---

# 📸 Screens

- Home
- Login
- Register
- Quiz
- Quiz Result
- Quiz History
- Feedback
- Scam Awareness Pages

---

# 👨‍💻 Author

**Skanda Vasista**

GitHub

https://github.com/skandavasista25

---

# 📄 License

This project is developed for educational purposes to spread cyber security awareness and demonstrate modern web development using Firebase.
