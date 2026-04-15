# 📚 AI Study Buddy

A simple AI-powered study tool built with HTML, CSS, and JavaScript.
Uses the Anthropic Claude API to summarize notes, generate quizzes, and explain concepts.

---

## 🚀 Features

| Feature | What it does |
|---|---|
| **Summarize Notes** | Paste your notes → get a clean summary + bullet points |
| **Generate Quiz** | Enter a topic → get MCQ questions with instant feedback |
| **Explain Concept** | Enter any concept → get a simple explanation with analogy |

---

## 🛠️ Setup Instructions

### Step 1 — Get an API Key
1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up / log in
3. Create an API key under **API Keys**

### Step 2 — Add your API Key
Open `app.js` and replace the placeholder on line 10:

```js
const API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
```

Change it to:

```js
const API_KEY = "sk-ant-your-actual-key-here";
```

### Step 3 — Run the project
Just open `index.html` in your browser. No server needed!

> **Tip:** Use VS Code with the Live Server extension for the best experience.

---

## 📁 File Structure

```
ai-study-buddy/
├── index.html    ← Main page structure
├── style.css     ← All styling
├── app.js        ← All JavaScript + API calls
└── README.md     ← This file
```

---

## ⚠️ Important Notes

- **API Key Security:** This project calls the API directly from the browser (fine for personal use / demos). For a public-facing app, use a backend server to hide the key.
- **Cost:** The API is not free, but very affordable. Claude Haiku (used here) costs a fraction of a cent per request.
- **CORS:** The Anthropic API supports direct browser access with the `anthropic-dangerous-direct-browser-access` header, which is included in `app.js`.

---

## 💡 Concepts Demonstrated

- Fetch API / async-await
- DOM manipulation
- JSON parsing
- Simple state management (quiz tracking)
- CSS variables and responsive design
- API integration

---

## 🔧 Possible Extensions (for extra marks)

- Add PDF file upload using `pdf.js`
- Store past summaries in `localStorage`
- Add a dark mode toggle
- Show a loading skeleton instead of text
- Add a simple Python Flask backend to hide the API key
