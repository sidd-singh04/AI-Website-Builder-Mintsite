# Mintsite — AI Website Builder

> **Generate a complete, working website from a single prompt.**

Mintsite is a full-stack AI-powered website builder that turns a plain-text description into a live website. Describe what you want — the layout, purpose, or vibe — and the app generates the corresponding HTML/CSS structure and content automatically, without the user writing a single line of code.

Built with the **MERN stack** (React + Vite frontend, Express + MongoDB backend) and powered by **Google Gemini** and **Groq** for AI generation.

---

## 🚀 Features

* **Prompt-to-Website Generation** — describe a site in natural language and get a generated website back
* **Dual AI Backend** — uses **Gemini** and **Groq** for generation, allowing flexibility between model providers
* **MERN Stack Architecture** — React (Vite) frontend with an Express + MongoDB backend
* **Persistent Storage** — generated sites/projects are stored in MongoDB for later access
* **Deployed & Live** — hosted on Vercel, accessible without any local setup

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │   React (Vite) App   │
                    │   Prompt Input UI    │
                    └──────────┬──────────┘
                               │
                          REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Node.js + Express  │
                    │       Backend        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                                 │
              ▼                                 ▼
        ┌──────────┐                     ┌──────────────┐
        │ MongoDB  │                     │ Gemini / Groq │
        │ Database │                     │   AI APIs     │
        └──────────┘                     └──────────────┘
```

---

## 🛠️ Tech Stack

| Category         | Technology              |
| ----------------- | ------------------------ |
| Frontend          | React.js (Vite)          |
| Styling           | Tailwind CSS             |
| Backend           | Node.js, Express.js      |
| Database          | MongoDB                  |
| AI / Generation   | Google Gemini, Groq      |
| API               | REST                     |
| Deployment        | Vercel                   |
| Version Control   | Git & GitHub             |

---

## ⚙️ Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/sidd-singh04/AI-Website-Builder-Mintsite.git
cd AI-Website-Builder-Mintsite
```

**2. Install dependencies**
```bash
cd frontend && npm install
cd ../backend && npm install
```

**3. Set up environment variables**

Create a `.env` file in `backend/` with your own credentials like:
```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

**4. Run the app**
```bash
# in backend/
npm run dev

# in frontend/ (separate terminal)
npm run dev
```

---



## 🧠 Technical Highlights

* Built a **prompt-to-website generation pipeline** integrating two different LLM providers (Gemini and Groq)
* Designed a REST API layer connecting the frontend to both the database and external AI services
* Implemented persistent storage of generated projects using MongoDB
* Structured the app as a standard MERN full-stack application with a clean frontend/backend separation
* Deployed a production build to Vercel

---


## 👨‍💻 Author

**Siddharth Singh**
GitHub: [@sidd-singh04](https://github.com/sidd-singh04)
