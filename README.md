<div align="center">

<img src="client/public/favicon.svg" width="80" alt="ResumeATS Logo" />

# ResumeATS — AI Resume Analyzer

**Upload your resume. Beat the bots. Land the interview.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Llama](https://img.shields.io/badge/Llama_3.1-NVIDIA_NIM-76B900?style=flat-square&logo=nvidia&logoColor=white)](https://build.nvidia.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview                     https://ai-resume-analyzer-rqnw.onrender.com/

**ResumeATS** is a full-stack AI-powered resume analyzer that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS). Upload a PDF resume, paste a job description, and get instant AI-driven feedback: an ATS compatibility score, keyword gap analysis, bullet point rewrites, and actionable optimization tips — all powered by **Meta Llama 3.1** via NVIDIA NIM.

> 💡 75%+ of resumes are rejected by ATS before a human ever reads them. ResumeATS helps you get past the bots.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Resume Parsing** | Extracts text from PDF resumes using `pdfjs-dist` |
| 🎯 **ATS Scoring** | AI-calculated compatibility score (0–100) vs. the job description |
| 📊 **Content Analysis** | 4 real metrics: ATS Parse Rate · Keyword Match · Impact Score · Readability |
| 🤖 **AI Bullet Rewrites** | Before/after examples using Llama 3.1 to boost impact |
| 🔑 **Keyword Gap Analysis** | Side-by-side view of resume vs. JD skills with missing/extra chips |
| 💡 **ATS Optimization Tips** | Numbered, actionable suggestions to improve ATS compatibility |
| 🔐 **Auth System** | JWT-based register/login with bcrypt password hashing |
| 📈 **Analysis History** | Every analysis saved per user — view past scores in the dashboard |
| 👤 **User Dashboard** | Profile overview, stats (avg score, best score, total analyses) |

---

## 🛠 Tech Stack

### Frontend
- **React 19** + **Vite 7** — blazing fast dev setup
- **React Router v7** — client-side routing
- **Vanilla CSS** — custom design system (no UI library)
- Font: [Sora](https://fonts.google.com/specimen/Sora) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) via Google Fonts

### Backend
- **Node.js** + **Express.js** — REST API
- **MongoDB Atlas** + **Mongoose** — database
- **JWT** — stateless auth
- **bcryptjs** — password hashing
- **Multer** — PDF file uploads (in-memory)
- **pdfjs-dist** — PDF text extraction

### AI
- **Meta Llama 3.1 8B Instruct** via [NVIDIA NIM API](https://build.nvidia.com/meta/llama-3_1-8b-instruct)
- OpenAI-compatible SDK (`openai` package)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- NVIDIA NIM API key (free at [build.nvidia.com](https://build.nvidia.com))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ai-resume.git
cd ai-resume
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx
```

> Get your NVIDIA API key free at [build.nvidia.com](https://build.nvidia.com/meta/llama-3_1-8b-instruct) → click **Get API Key**

### 4. Run the app

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm start

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🗂 Project Structure

```
ai-resume/
├── client/                    # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg        # Custom brand favicon
│   └── src/
│       ├── components/
│       │   ├── Home/          # Landing page
│       │   ├── Navbar/        # Nav + user avatar dropdown
│       │   ├── Dashboard/     # User dashboard + history
│       │   ├── YourResumes/   # Upload + full-page report
│       │   ├── Login/
│       │   ├── Register/
│       │   ├── Contact/
│       │   └── ProtectedRoute/
│       ├── App.jsx
│       └── main.jsx
│
└── server/                    # Express backend
    ├── controllers/
    │   ├── authController.js  # register · login · getMe
    │   └── resumeController.js# upload · analyze · history
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification
    │   └── upload.js          # Multer config
    ├── models/
    │   ├── User.js
    │   └── Resume.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── resumeRoutes.js
    ├── utils/
    │   ├── aiAnalyzer.js      # Llama 3.1 via NVIDIA NIM
    │   ├── resumeParser.js    # PDF text extraction
    │   ├── keywordExtractor.js
    │   └── atsScore.js
    └── server.js
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login, returns JWT |
| `GET` | `/auth/me` | ✅ Bearer | Get current user info |

### Resume

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/resume/upload` | ✅ Bearer | Upload PDF, returns extracted text |
| `POST` | `/resume/analyze` | ✅ Bearer | Analyze resume vs JD, returns full report |
| `GET` | `/resume/history` | ✅ Bearer | Get last 10 analyses for current user |

#### `/resume/analyze` — Request body
```json
{
  "resumeText": "string (from /resume/upload response)",
  "jobDescription": "string (paste from job posting)"
}
```

#### `/resume/analyze` — Response
```json
{
  "success": true,
  "score": 87,
  "suggestions": {
    "analysis": {
      "resume_skills": ["React", "Node.js"],
      "job_description_skills": ["React", "TypeScript", "AWS"],
      "missing_skills": {
        "from_resume_for_job_description": ["TypeScript", "AWS"],
        "from_job_description_for_resume": []
      },
      "content_analysis": {
        "ats_parse_rate": 94,
        "keyword_match": 72,
        "impact_score": 85,
        "readability_score": 88
      },
      "ats_optimized_bullet_point_improvements": [...],
      "ats_optimization_tips": [...],
      "compatibility_score": 87,
      "overall_assessment": "Strong candidate..."
    }
  }
}
```

---

## 🎨 Screenshots

> _Add screenshots of your app here_

| Upload Page | Full Report |
|---|---|
| _(screenshot)_ | _(screenshot)_ |

| Dashboard | Navbar Dropdown |
|---|---|
| _(screenshot)_ | _(screenshot)_ |

---

## 🌱 Roadmap

- [ ] Export optimized resume as PDF
- [ ] Multi-job comparison mode
- [ ] Resume templates generator
- [ ] Chrome extension for one-click job description capture
- [ ] GPT-4o / Claude model support

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
```
Then open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ for jobseekers worldwide

**[Live Demo](https://your-demo-url.com)** · **[Report Bug](https://github.com/your-username/ai-resume/issues)** · **[Request Feature](https://github.com/your-username/ai-resume/issues)**

</div>
