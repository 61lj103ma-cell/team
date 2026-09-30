# 🚀 FLOWPILOT AI — Enterprise AI Incident Manager

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TailwindCSS-06b6d4?style=flat-square)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-6366f1?style=flat-square)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-10b981?style=flat-square)](https://www.mongodb.com/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%20API-8b5cf6?style=flat-square)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-slate?style=flat-square)](LICENSE)

> **Enterprise AI Hackathon Project**  
> An autonomous, human-in-the-loop operational incident management platform powered by Google Gemini generative AI. Transforms unstructured incident complaints into structured diagnostics, automated task delegations, root-cause hypotheses, and executive resolution summaries.

---

## 📌 1. Hackathon Problem Statement

> *"Organizations often struggle to efficiently manage operational incidents because incident reporting, classification, assignment, investigation, and reporting are handled through disconnected and manual processes. This leads to delayed response times, inconsistent prioritization, repeated systemic outages, and limited visibility for senior leadership."*

In conventional workflows, employees file vague tickets, managers manually evaluate severity, engineers guess probable root causes, and post-mortem documentation is rarely completed systematically.

---

## 💡 2. The FlowPilot AI Solution

> *"FlowPilot AI is an AI-powered enterprise incident management platform that captures incidents, analyzes them using generative AI, suggests severity and priority, recommends responsible teams, identifies probable root-cause hypotheses, generates actionable mitigation tasks, tracks resolution progress, and provides AI-powered management insights. The platform combines machine intelligence with human verification and workflow automation to dramatically accelerate operational recovery."*

### 🔑 Core Principle: Human-in-the-Loop Intelligence
```
Incident Reported → AI Diagnostic Analysis → Structured Hypotheses → Human Verification 
       ↓
Task Delegation → Investigation Workflow → Resolution → AI Post-Mortem Summary → Management Insights
```
**AI assists and automates, but never replaces human decision-making.** All AI predictions (severity, priority, department, root cause) are visibly flagged with `AI Suggested` badges and can be adjusted by operators before committing to the database.

---

## ✨ 3. Key Features

- **⚡ Natural Language Incident Intake**: Non-technical employees describe outages in plain English (e.g., *"More than 100 customers are getting an error while making payment"*).
- **🧠 Generative AI Incident Triage**: Backend communicates securely with Google Gemini to produce structured JSON containing category, severity (`Low`, `Medium`, `High`, `Critical`), priority (`P1`, `P2`, `P3`, `P4`), department, impact assessment, and confidence score.
- **🛡️ Human Verification Stage**: Operators review AI suggestions, refine classifications, and approve them before database persistence.
- **📋 Automated Task Generation**: 1-click generation of actionable engineering tasks directly assigned to cross-functional teams (Backend, DevOps, SRE, Network Ops).
- **🔍 Historical Similarity Detection**: Automatically matches current outages against resolved historical records using service and symptom heuristics.
- **🔬 AI Root-Cause Assistant**: Hypothesizes probable technical causes (e.g., upstream gateway timeout, DNS skew, thread pool starvation) with confidence tiers.
- **📝 Automated Resolution Post-Mortem Synthesizer**: Generates executive summaries of actions taken, validated root causes, and preventive actions for compliance and post-mortems.
- **📊 Real-time Executive Analytics**: Interactive Recharts visualizations of 7-day intake velocity, MTTR (Mean Time to Resolution), severity distribution, and department queues.
- **🤖 Grounded Enterprise Copilot Q&A**: Live chat assistant answering management queries strictly grounded in real-time database state (zero hallucinations).
- **🔒 Enterprise Security**: Helmet headers, CORS policy, rate limiting, bcrypt password hashing, and JWT session handling. **LLM API keys remain 100% server-side.**

---

## 🏗️ 4. Technical Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite (SPA)                   │
│   Tailwind CSS • Recharts • Lucide • Axios Interceptors│
└───────────────────────────┬────────────────────────────┘
                            │ (REST API / Bearer JWT)
┌───────────────────────────▼────────────────────────────┐
│                  Express.js Backend                    │
│   Zod Validation • Helmet • Rate-Limiter • Auth Guard │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
┌──────────────▼─────────────┐ ┌──────────▼──────────────┐
│       MongoDB / Atlas      │ │    Google Gemini API    │
│  (Zero-config Embedded DB  │ │  (Structured JSON Mode  │
│   auto-fallback enabled)   │ │  & Enterprise Fallback) │
└────────────────────────────┘ └─────────────────────────┘
```

---

## 📂 5. Repository Structure

```
flowpilot-ai/
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (Badges, StatCard, IncidentTable, etc.)
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── hooks/              # useDebounce, etc.
│   │   ├── layouts/            # MainLayout (Sidebar + Topbar)
│   │   ├── pages/              # Dashboard, Incidents, IncidentCreate, IncidentDetail, Tasks, etc.
│   │   ├── routes/             # ProtectedRoute role guards
│   │   ├── services/           # Axios client with token refresh interceptors
│   │   ├── utils/              # Formatters & date handlers
│   │   ├── App.jsx             # React Router configuration
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── config/             # MongoDB connection (Atlas + Memory-Server fallback)
│   │   ├── controllers/        # Auth, Incident, AI, Task, Analytics, Search controllers
│   │   ├── middleware/         # JWT protect, Role restrictTo, Zod validate, Central ErrorHandler
│   │   ├── models/             # User, Department, Incident, Task, Activity, Notification
│   │   ├── routes/             # REST endpoint routers
│   │   ├── seed/               # Realistic enterprise seed data script
│   │   ├── services/           # AI service layer (Gemini SDK & fallback heuristic engine)
│   │   ├── validators/         # Zod schemas
│   │   └── server.js           # Express app bootstrap
│   ├── package.json
│   └── .env.example
├── README.md
├── .gitignore
└── package.json                # Root concurrent runner scripts
```

---

## ⚡ 6. Quick Start & Local Run

### Prerequisites
- Node.js `v18+` or `v20+`
- npm `v9+` or `v10+`

### 1. Clone & Install All Dependencies
From the repository root:
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### 2. Environment Configuration
**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/flowpilot
JWT_SECRET=flowpilot_ai_secure_enterprise_jwt_secret_key_2025_prod
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```
> *Note: If a local MongoDB daemon is not running on your machine, FlowPilot AI automatically boots an embedded in-memory MongoDB database and self-seeds realistic enterprise data. No database installation needed to test!*

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Application
```bash
# Run both Backend & Frontend concurrently
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`

---

## 👥 7. Demo Accounts & Credentials

The seed data creates 4 role-differentiated enterprise accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Password123!` | Full control, User & Dept Management, System Settings |
| **Manager** | `manager@example.com` | `Password123!` | Department triage, Approvals, Assign incidents & tasks |
| **Engineer** | `engineer@example.com` | `Password123!` | Work on assigned tasks, status changes, resolution |
| **Employee** | `employee@example.com` | `Password123!` | Report incidents, track reported ticket progression |

*(The login screen also features 1-click demo login buttons for rapid presentation)*

---

## 🎬 8. Hackathon 3–5 Minute Live Demo Script

1. **Sign In**: Go to `http://localhost:5173/login`. Click the **Manager** or **Employee** demo login shortcut.
2. **Dashboard Review**:
   - Highlight the top KPI cards (Total, Open, Critical, Resolved, MTTR).
   - Point out the **Automated AI Management Insights** card section synthesizing database trends.
   - Show the interactive Recharts charts (Severity & Department distributions).
3. **Report Incident**:
   - Click **"Report Incident"** in the sidebar.
   - Click the purple badge: **"Load Payment Demo Scenario"** (populates real-world symptom: *"More than 100 customers are getting an error while making payment"*).
   - Click **"Analyze with AI"**.
   - Watch Gemini analyze the symptoms in real-time, outputting `Critical` severity, `P1` priority, `IT / Finance` department, probable causes, and task recommendations.
4. **Human Verification**:
   - Demonstrate the core enterprise requirement: AI suggestions are clearly labeled with `AI Suggested` badges.
   - Adjust severity or approve suggestions.
   - Click **"Verify & Confirm Incident"**.
5. **Incident Progression & Investigation**:
   - The app navigates to `/incidents/INC-XXXX`.
   - Show the visual lifecycle stepper: `Open` → `Investigating` → `In Progress` → `Monitoring` → `Resolved`.
   - Click **"AI Root Cause & Recommendations"** tab. View the hypothesized causes with confidence ratings.
   - Click **"Create Task"** on any recommendation or click **"Generate Tasks with AI"**.
6. **Resolve Incident**:
   - Click **"Resolve Incident"**.
   - Click **"Generate Resolution Summary with AI"**.
   - Review the post-mortem summary generated by AI and click **"Confirm & Mark Resolved"**.
7. **Enterprise Copilot**:
   - Click **"Ask Enterprise AI"** in the topbar.
   - Type: *"What are the unresolved critical incidents?"*.
   - View the immediate, data-grounded response citing live database records.

---

## 🌐 9. Production Deployment Guide

### Frontend → Vercel
1. Set Framework Preset: `Vite`.
2. Root Directory: `frontend`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`.

### Backend → Render or Railway
1. Root Directory: `backend`.
2. Build Command: `npm install`.
3. Start Command: `node src/server.js`.
4. Set Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/flowpilot`
   - `JWT_SECRET=your_long_production_jwt_secret`
   - `GEMINI_API_KEY=your_production_google_gemini_api_key`
   - `CLIENT_URL=https://your-flowpilot-frontend.vercel.app`

---

## 🔒 10. Security & Reliability

- ✅ Zero Gemini API Keys in Frontend. All generative calls route through authenticated backend controllers.
- ✅ Strict input validation using **Zod** on every mutation payload.
- ✅ Centralized Express error handler ensuring internal call stack traces are suppressed in production.
- ✅ Resilient multi-tier AI fallback ensuring 100% demo uptime even during external rate-limit exhaustion.

---

## 📄 License
MIT License. Built for Enterprise Hackathon by Team FlowPilot AI.
#   t e a m  
 