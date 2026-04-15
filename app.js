// ============================================================
//  AI Study Buddy — app.js
//  Uses Anthropic API directly from the browser (no backend)
// ============================================================

// ⚠️  IMPORTANT: Replace this with your actual Anthropic API key
//     Get one at: https://console.anthropic.com/
const API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL   = "claude-3-5-haiku-20241022"; // fast + affordable for students

// -------------------- Quiz State --------------------
let quizData     = [];
let quizAnswers  = {};
let quizAnswered = 0;

// ============================================================
//  UTILITY: Call the Anthropic Claude API
// ============================================================
async function callClaude(userPrompt) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "API request failed");
  }

  const data = await response.json();
  return data.content.map(block => block.text || "").join("");
}

// ============================================================
//  TAB SWITCHING
// ============================================================
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll(".tab").forEach((btn, i) => {
    const tabNames = ["summarize", "quiz", "explain"];
    btn.classList.toggle("active", tabNames[i] === tabName);
  });

  // Show/hide sections
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });
  document.getElementById(tabName).classList.add("active");
}

// ============================================================
//  FEATURE 1: SUMMARIZE NOTES
// ============================================================
async function summarizeNotes() {
  const notes   = document.getElementById("notes-input").value.trim();
  const subject = document.getElementById("subject-input").value.trim();

  if (!notes) {
    alert("Please paste your notes before summarizing.");
    return;
  }

  // UI: loading state
  setLoading("summarize-btn", "sum-spinner", true);
  document.getElementById("summary-output-card").style.display = "none";

  try {
    const subjectPart = subject ? ` about "${subject}"` : "";
    const prompt = `You are a helpful study assistant for students.

Summarize the following notes${subjectPart}.

Structure your response exactly like this:
SUMMARY:
[Write a clear 2-3 sentence overview of the main topic]

KEY POINTS:
• [Point 1]
• [Point 2]
• [Point 3]
• [Point 4 if needed]
• [Point 5 if needed]

Keep it concise, accurate, and student-friendly. Maximum 6 bullet points.

NOTES TO SUMMARIZE:
${notes}`;

    const result = await callClaude(prompt);

    document.getElementById("summary-output").textContent = result;
    document.getElementById("sum-badge").textContent = "✓ Done";
    document.getElementById("summary-output-card").style.display = "block";

  } catch (error) {
    document.getElementById("summary-output").textContent = "❌ Error: " + error.message;
    document.getElementById("summary-output-card").style.display = "block";
  }

  setLoading("summarize-btn", "sum-spinner", false);
}

// ============================================================
//  FEATURE 2: GENERATE QUIZ
// ============================================================
async function generateQuiz() {
  const topic = document.getElementById("quiz-topic").value.trim();
  const count = document.getElementById("quiz-count").value;

  if (!topic) {
    alert("Please enter a topic to generate a quiz.");
    return;
  }

  // Reset state
  quizData     = [];
  quizAnswers  = {};
  quizAnswered = 0;

  // UI: loading state
  setLoading("quiz-btn", "quiz-spinner", true);
  document.getElementById("quiz-area").innerHTML =
    `<div class="card muted-text">⏳ Generating ${count} questions about "${topic}"...</div>`;
  document.getElementById("quiz-result").style.display = "none";

  try {
    const prompt = `Generate exactly ${count} multiple choice quiz questions about the topic: "${topic}".

IMPORTANT: Return ONLY a valid JSON object — no markdown, no explanation, no extra text.

Format:
{
  "questions": [
    {
      "q": "The question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0
    }
  ]
}

Rules:
- "answer" is the 0-based index of the correct option (0=A, 1=B, 2=C, 3=D)
- All 4 options must be plausible
- Questions should be educational and factually correct
- Vary difficulty from easy to medium`;

    const raw     = await callClaude(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed  = JSON.parse(cleaned);

    quizData = parsed.questions;
    renderQuiz();

  } catch (error) {
    document.getElementById("quiz-area").innerHTML =
      `<div class="card" style="color:var(--error-color, #dc2626)">
        ❌ Failed to generate quiz. Check your API key or try a different topic.
        <br><small style="color:#94a3b8; margin-top:6px; display:block">${error.message}</small>
      </div>`;
  }

  setLoading("quiz-btn", "quiz-spinner", false);
}

function renderQuiz() {
  let html = "";

  quizData.forEach((q, qi) => {
    html += `
      <div class="quiz-question-card" id="qcard-${qi}">
        <p class="quiz-question-text">${qi + 1}. ${q.q}</p>
        ${q.options.map((opt, oi) => `
          <button class="quiz-opt" id="opt-${qi}-${oi}" onclick="answerQuestion(${qi}, ${oi})">
            <strong>${String.fromCharCode(65 + oi)}.</strong> ${opt}
          </button>
        `).join("")}
      </div>`;
  });

  document.getElementById("quiz-area").innerHTML = html;
}

function answerQuestion(questionIndex, selectedIndex) {
  // Prevent re-answering
  if (quizAnswers[questionIndex] !== undefined) return;

  quizAnswers[questionIndex] = selectedIndex;
  quizAnswered++;

  const correctIndex = quizData[questionIndex].answer;

  // Highlight options
  quizData[questionIndex].options.forEach((_, optIndex) => {
    const btn = document.getElementById(`opt-${questionIndex}-${optIndex}`);
    btn.disabled = true;

    if (optIndex === correctIndex) {
      btn.classList.add("correct");
    } else if (optIndex === selectedIndex) {
      btn.classList.add("wrong");
    }
  });

  // Check if all answered
  if (quizAnswered === quizData.length) {
    showQuizResult();
  }
}

function showQuizResult() {
  const correct = Object.entries(quizAnswers)
    .filter(([qi, sel]) => quizData[qi].answer === parseInt(sel))
    .length;

  const total   = quizData.length;
  const percent = Math.round((correct / total) * 100);

  let emoji = "😕";
  if (percent >= 80) emoji = "🎉";
  else if (percent >= 60) emoji = "👍";
  else if (percent >= 40) emoji = "📖";

  document.getElementById("quiz-score-text").textContent =
    `${emoji} You got ${correct} out of ${total} correct (${percent}%)`;
  document.getElementById("quiz-result").style.display = "block";
}

// ============================================================
//  FEATURE 3: EXPLAIN CONCEPT
// ============================================================
async function explainConcept() {
  const concept = document.getElementById("concept-input").value.trim();
  const level   = document.getElementById("explain-level").value;

  if (!concept) {
    alert("Please enter a concept to explain.");
    return;
  }

  setLoading("explain-btn", "exp-spinner", true);
  document.getElementById("explain-output-card").style.display = "none";

  try {
    const prompt = `You are a friendly and patient teacher.

Explain the concept of "${concept}" to a ${level}.

Structure your response like this:
WHAT IT IS:
[Simple 1-2 sentence definition]

ANALOGY:
[A relatable real-world analogy to help them understand]

KEY IDEA:
[The most important thing to remember, in 1 sentence]

Rules:
- Use simple, everyday language
- No jargon unless you explain it
- Keep the whole response under 180 words
- Be encouraging and clear`;

    const result = await callClaude(prompt);

    document.getElementById("explain-title").textContent = `💡 ${concept}`;
    document.getElementById("explain-output").textContent = result;
    document.getElementById("explain-output-card").style.display = "block";

  } catch (error) {
    document.getElementById("explain-output").textContent = "❌ Error: " + error.message;
    document.getElementById("explain-output-card").style.display = "block";
  }

  setLoading("explain-btn", "exp-spinner", false);
}

// ============================================================
//  UTILITY: Toggle loading state on a button
// ============================================================
function setLoading(btnId, spinnerId, isLoading) {
  const btn     = document.getElementById(btnId);
  const spinner = document.getElementById(spinnerId);

  btn.disabled                 = isLoading;
  spinner.style.display        = isLoading ? "inline-block" : "none";
}

// ============================================================
//  Allow pressing Enter in single-line inputs
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("subject-input")
    .addEventListener("keydown", e => { if (e.key === "Enter") summarizeNotes(); });

  document.getElementById("quiz-topic")
    .addEventListener("keydown", e => { if (e.key === "Enter") generateQuiz(); });

  document.getElementById("concept-input")
    .addEventListener("keydown", e => { if (e.key === "Enter") explainConcept(); });
});
