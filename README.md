# ResumeIQ — AI-Powered Resume & Career Intelligence Platform

> **Production-Ready Multi-Page SaaS Application** connecting Resume ATS Optimization, Job Matching Diagnostics, AI Mock Interviews, Skill Analytics, Career GPS Roadmaps, and Platform Administration.

---

## 🔒 CRITICAL SECURITY NOTICE
> **NEVER commit `.env` files or production credentials to source control.**
> All sensitive keys (`OPENAI_API_KEY`, `JWT_SECRET`, `CLOUDINARY_API_SECRET`, `MONGODB_URI`) belong exclusively in backend server environments. Frontend bundles only consume public configuration.

---

## 🌟 Core Product Features

1. **Phase 1: Foundation & Authentication**
   - JWT-based auth with bcrypt-hashed passwords (salt factor 12)
   - Light and Dark themes with persistent theme selection (no purple dark-mode)
   - Protected multi-page SaaS application shell with responsive collapsible navigation

2. **Phase 2: Resume Ingestion & ATS Scoring**
   - Multi-format file parsing (`.pdf`, `.docx`) with MIME verification and 5MB limits
   - 7-Factor weighted ATS scoring algorithm with actionable diagnostic feedback
   - Cloudinary integration with local fallback storage

3. **Phase 3: Job Description Matching & X-Ray**
   - Two-panel comparison view for matching resumes against job requirements
   - Matched vs missing keyword analysis and tailoring suggestions
   - Match history archive and role-fit diagnostic reports

4. **Phase 4: AI Resume Improvement & Multi-Step Builder**
   - In-place section rewriting with weak-phrase diagnostics
   - 6-step interactive Resume Builder wizard with live ATS preview and template selection
   - Multiple resume version history and instant export

5. **Phase 5 & 6A: AI Interview Preparation & Practice Modes**
   - Adaptive question generation calibrated by target role, seniority, and resume skills
   - Live timed interview screen with real-time STAR rubric evaluations
   - 5 Specialized Practice Modes: Flashcards, Timed Sprint, Category Drills, Company Simulation, and Community Sets

6. **Phase 6B: Career GPS, Roadmap & Application Tracker**
   - AI-generated career path analysis and skill gap identification
   - Phased learning roadmap with interactive milestone checkboxes
   - Application Kanban / table tracking with interview schedule integration

7. **Phase 7: Standout Intelligence Differentiators**
   - Job X-Ray deep analysis
   - Reverse Interview preparation (questions to ask the interviewer)
   - Resume Truth Detector
   - Recruiter 6-Second View
   - Ghost Job Detector
   - Career Twin & Battle Arena

8. **Phase 8: Admin Management Console**
   - Admin-only routes and middleware (`requireAdmin`)
   - Real-time aggregation telemetry (active users 30d, AI invocations, growth charts)
   - Full CRUD for users, interview questions, categories, skills, templates, reports, and subscriptions

---

## 🛠️ System Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │             React 19 + Vite Frontend                    │
   │  TailwindCSS • Lucide Icons • React Router v7 • Axios   │
   └──────────────────────────┬──────────────────────────────┘
                              │ HTTPS / JWT Bearer
                              ▼
   ┌─────────────────────────────────────────────────────────┐
   │             Node.js + Express API Backend               │
   │  Helmet Security • Rate Limiters • Query Sanitizers     │
   └──────┬───────────────────┬───────────────────┬──────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  MongoDB Atlas   │ │  Redis Caching  │ │   Cloudinary    │
│ Mongoose Schemas │ │ ioredis Client  │ │  Asset Storage  │
└──────────────────┘ └─────────────────┘ └─────────────────┘
          │
          ▼
┌──────────────────┐
│   OpenAI Engine  │
│  GPT-4o Mini /   │
│  Heuristic Fall- │
│  back Core       │
└──────────────────┘
```

---

## 📋 Prerequisites

Ensure you have the following installed locally or accessible via cloud services:
- **Node.js**: `v18.0.0` or higher (`node -v`)
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/resumeiq`) or MongoDB Atlas cluster URI
- **Redis (Optional but Recommended)**: Local Redis server or Redis Cloud instance
- **OpenAI API Key**: For live AI evaluations (heuristic deterministic engines run automatically if key is absent)
- **Cloudinary Account (Optional)**: For cloud document storage (local file storage runs automatically if absent)

---

## 🚀 Quickstart & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ResumeIQ.git
cd ResumeIQ
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```bash
cd backend
cp .env.example .env
```

Configure your variables:
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/resumeiq

# JWT Secrets (generate strong random key in production)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# AI & Cloud Integrations (Optional in dev, required in prod)
OPENAI_API_KEY=sk-proj-your-openai-api-key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
REDIS_URL=redis://127.0.0.1:6379
```

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cd ../frontend
cp .env.example .env
```

Configure:
```ini
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Starts backend on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Starts frontend on http://localhost:5173
```

---

## 🏗️ Production Build & Deployment

### Build the Frontend Bundle:
```bash
cd frontend
npm run build
```
The output will be generated into `frontend/dist/`.

### Start Backend in Production Mode:
```bash
cd backend
NODE_ENV=production npm start
```

---

## 🛡️ Security Implementation Checklist

- [x] **Password Security**: Passwords hashed using `bcryptjs` with salt factor 12. Passwords excluded from queries by default (`select: false`).
- [x] **JWT Protection**: Signed with `JWT_SECRET`, validated on every protected route via `protect` middleware.
- [x] **Admin Role Guard**: `requireAdmin` middleware checks `req.user.role === 'admin'`. Non-admins receive HTTP 403 Forbidden.
- [x] **Rate Limiting**:
  - Auth rate limiting: 15 attempts per 15-minute window.
  - AI rate limiting: 40 requests per 15-minute window per user.
  - AI burst protection: max 5 rapid requests per 10 seconds.
- [x] **Deterministic Caching**: SHA-256 keyed Redis caching for repeatable ATS and job match analyses.
- [x] **Input & Query Validation**: Param ObjectId validation and query sanitization to prevent operator injection.
- [x] **File Upload Security**: Strict MIME-type checking, file extension validation, and 5MB size limits.
- [x] **HTTP Security Headers**: `helmet` headers active with CORS origin restriction via `CLIENT_URL`.
- [x] **Frontend Resilience**: React `ErrorBoundary` wrappers on global and layout levels; standard 404 page for unmapped routes.

---

## 📄 License
MIT License © 2026 ResumeIQ Platform. All rights reserved.
