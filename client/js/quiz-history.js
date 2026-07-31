import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const tableBody = document.getElementById("history-body");
const modal = document.getElementById("review-modal");
const reviewContent = document.getElementById("review-content");
const closeBtn = document.getElementById("close-modal");

closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("open");
    }
});

auth.onAuthStateChanged(async (user) => {

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    console.log("Logged in User:", user.uid);

    tableBody.innerHTML = `
        <tr>
            <td colspan="5">Loading...</td>
        </tr>
    `;

    try {

        const q = query(
            collection(db, "quizResults"),
            where("uid", "==", user.uid),
            orderBy("date", "desc"),
            limit(5)
        );

        const snapshot = await getDocs(q);

        console.log("Documents Found:", snapshot.size);

        tableBody.innerHTML = "";

        if (snapshot.empty) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">No quiz history found.</td>
                </tr>
            `;

            return;
        }

        snapshot.forEach((doc) => {

    const quiz = doc.data();
            console.log("Quiz:", quiz);

            console.log("Date value:", quiz.date);
console.log("Date type:", typeof quiz.date);

let date = "N/A";

if (quiz.date) {
    if (typeof quiz.date.toDate === "function") {
        date = quiz.date.toDate().toLocaleString();
    } else {
        date = quiz.date.toString();
    }
}
            let status = "";

            if (quiz.percentage >= 80) {
                status = `<span class="badge excellent">Excellent</span>`;
            }
            else if (quiz.percentage >= 50) {
                status = `<span class="badge good">Good</span>`;
            }
            else {
                status = `<span class="badge poor">Needs Practice</span>`;
            }

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${date}</td>
                <td>${quiz.score}/${quiz.total}</td>
                <td>${quiz.percentage}%</td>
                <td>${status}</td>
                <td>
                    <button class="btn view-btn">
                        View
                    </button>
                </td>
            `;

            row.querySelector(".view-btn").addEventListener("click", () => {

                reviewContent.innerHTML = "";

                if (!quiz.questions || !quiz.answers) {

                    reviewContent.innerHTML = `
                        <p>No answer review available.</p>
                    `;

                    modal.classList.add("open");
                    return;
                }

                quiz.questions.forEach((question, index) => {

                    const userAnswer = quiz.answers[index]?.selected;
                    const correctAnswer = question.answer;

                    const isCorrect = userAnswer === correctAnswer;

                    reviewContent.innerHTML += `
                        <div class="review-card ${isCorrect ? "correct" : "wrong"}">

                            <h3>Question ${index + 1}</h3>

                            <p>
                                <strong>${question.question}</strong>
                            </p>

                            <p>
                                <span class="your-label">Your Answer:</span>

                                <span class="${isCorrect ? "correct-answer" : "wrong-answer"}">

                                    ${question.options[userAnswer] ?? "Not Answered"}

                                </span>
                            </p>

                            <p>
                                <span class="correct-label">Correct Answer:</span>

                                <span class="correct-answer">

                                    ${question.options[correctAnswer]}

                                </span>
                            </p>

                        </div>
                    `;

                });

                modal.classList.add("open");

            });

            tableBody.appendChild(row);

        });

    }
    catch (error) {

        console.error("Firestore Error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    ${error.message}
                </td>
            </tr>
        `;
    }

});