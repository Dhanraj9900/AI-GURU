# AI Guru — Inclusive Multilingual AI Learning Platform

> **An Intelligent, Multilingual, and Personalized AI Learning Platform for Inclusive Education**
> School Education (Classes 1–12) · Competitive Exams (JEE, NEET, GATE, UPSC) · Higher Education (B.Tech, BCA, MCA, B.Sc)

---

## 🌟 Executive Overview & Pedagogical Vision

**AI Guru** is a personalized digital tutor engineered to democratize access to premier education for students across India, with first-class optimizations for rural, tier-2/3, and underserved communities.

The platform follows a continuous mastery cycle:
$$\text{TEACH} \longrightarrow \text{PRACTISE} \longrightarrow \text{ASSESS} \longrightarrow \text{IDENTIFY GAPS} \longrightarrow \text{PERSONALIZE} \longrightarrow \text{REVISE}$$

---

## 🛠️ Tech Stack & Model Architecture

1. **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Accessible WCAG AA Responsive Design.
2. **Backend**: Express & Node.js (`server.ts`) with modular API router and Vite middleware integration.
3. **Model Adapter**:
   - Evaluated for **Qwen3-Instruct** / **Qwen2.5** open-weight models via local Ollama (`localhost:11434`).
   - Server-side fallback via Gemini API (`@google/genai`) when API key is provided.
   - **Deterministic Curriculum & Pedagogical Engine** (Demo Mode) with native Hindi, Hinglish, and English explanations, ensuring the app remains 100% functional without paid external APIs.
4. **Multilingual RAG Retrieval**:
   - Semantic retrieval emulating `paraphrase-multilingual-MiniLM-L12-v2` dense vector embeddings.
   - Local FAISS-compatible chunking and cosine similarity index maintaining document, chunk, page, and student ownership metadata.
5. **Deterministic Mathematics**:
   - SymPy-based algebraic verifier for step-by-step discriminant evaluation ($D = b^2 - 4ac$), polynomial roots, derivatives, and BODMAS calculation. Eliminates LLM arithmetic hallucination.
6. **Adaptive Quizzes & Learning Gap Analytics**:
   - Deterministic scoring engine evaluating student answers against verifiable keys.
   - Rule-based mastery classifier (Mastered $\ge 80\%$, Developing $50\text{--}80\%$, Learning Gap $<50\%$).
   - Prerequisite void diagnostic flagging (e.g., identifies factoring prerequisites for quadratic equations).
7. **Educational Research Pipeline (7 Agents)**:
   - Configured allowlist (`ncert.nic.in`, `diksha.gov.in`, `swayam.gov.in`, `nptel.ac.in`).
   - Strict SSRF defenses blocking private/loopback IP spaces and cloud metadata endpoints.
   - Human-in-the-loop educator review (Pending Review $\to$ Approved / Rejected).

---

## 💻 Hardware Constraints & Windows 8 GB RAM Optimization

AI Guru is specifically optimized for development and execution on a **Windows 10/11 laptop with 8 GB RAM and integrated Intel/AMD graphics**:

| Model Size | Resident Memory | Tokens/Sec (Integrated GPU) | 8 GB RAM Verdict |
| :--- | :--- | :--- | :--- |
| **Qwen3-1.7B / Qwen2.5-1.5B** | **~2.1 GB RAM** | **35–45 t/s** | **Recommended Default** (Leaves 5.9 GB for OS & apps) |
| **Qwen3-4B / Qwen2.5-3B** | **~4.2 GB RAM** | **18–26 t/s** | **Feasible** (Requires closing memory-heavy background tabs) |
| **Qwen3-8B / Qwen2.5-7B** | **~7.8–9.2 GB RAM**| **4–8 t/s** | **Not Recommended** (Will trigger aggressive page swapping) |
| **Deterministic Pedagogical Engine**| **~120 MB RAM** | **Instant (< 50ms)** | **Always Available Offline** |

---

## 🚀 Quickstart Guide for Windows & VS Code

### 1. Prerequisites
- **Node.js** v20+ or v22+ installed ([nodejs.org](https://nodejs.org))
- **VS Code** with TypeScript extensions

### 2. Install & Start Development Server
Open PowerShell in the project root:

```powershell
# Install dependencies
npm install

# Start full-stack server (runs Express + Vite middleware on Port 3000)
npm run dev
```

Visit the application at: `http://localhost:3000`

### 3. (Optional) Run Local Open-Weight Qwen Model with Ollama
If you want to run the local open-weight model:
1. Download Ollama for Windows from [ollama.com](https://ollama.com).
2. Open PowerShell and run:
   ```powershell
   ollama run qwen2.5:1.5b
   ```
3. AI Guru automatically detects the running Ollama instance on `http://localhost:11434` and routes tutoring through your local model!

---

## 👤 Pre-Seeded Evaluator Accounts (1-Click Login)

The platform provides 1-Click login buttons in the Auth Modal for testing all roles:

| Role | Name | Email | Password | Scope & Access |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Aarav Sharma | `student@aiguru.edu` | `GuruPass123!` | Tutoring, Courses, Quizzes, Progress, Study Planner |
| **Teacher** | Dr. Priya Raman | `teacher@aiguru.edu` | `GuruPass123!` | Student review, syllabus inspection, quiz evaluation |
| **Admin** | Vikram Sengupta | `admin@aiguru.edu` | `GuruPass123!` | 7-Stage Research Pipeline, Source Approvals, Audit Logs |

---

## 📚 API Endpoints Summary

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/me`, `POST /api/auth/logout`
- **Courses**: `GET /api/courses`, `GET /api/courses/:id`, `POST /api/courses/:id/enroll`
- **Tutor & Chat**: `POST /api/chat`, `GET /api/conversations`, `DELETE /api/conversations/:id`
- **Documents & RAG**: `POST /api/documents/upload`, `GET /api/documents`, `POST /api/documents/:id/ask`, `DELETE /api/documents/:id`
- **Quizzes**: `GET /api/quizzes`, `POST /api/quizzes/generate`, `POST /api/quizzes/:id/submit`, `GET /api/quiz-attempts`
- **Progress & Plans**: `GET /api/progress`, `GET /api/study-plan`, `POST /api/study-plan/task/toggle`
- **Governance**: `GET /api/admin/research-jobs`, `POST /api/admin/research-jobs`, `POST /api/admin/content/:id/approve`
- **System**: `GET /api/model-status`, `GET /api/health`

## ⚡ Dual-Mode Architecture: Offline (No API Key) vs With Gemini API

AI Guru is designed with a **fail-safe hybrid architecture** so the application operates seamlessly with or without external cloud API credentials.

### Mode A: Zero-Cost / Offline Mode (Without Any API Key)
When no API key is configured (`GEMINI_API_KEY` is omitted), the system executes through its built-in **Deterministic SymPy Solver, Pedagogical Curriculum Engine, and Educational Diagram Generator**. It costs ₹0 and never errors out.

#### Sample Questions Supported in Mode A:
1. **Mathematical Quadratic Equations (SymPy Engine)**:
   - `solve x^2 - 5x + 6 = 0`
   - `2x^2 - 4x - 6 = 0`
   - *Result*: Calculates discriminant $D = b^2 - 4ac$, step-by-step Sridharacharya roots ($x_1, x_2$), and automatically renders an interactive quadratic parabola curve.
2. **Computer Science Fundamentals**:
   - `define the computer and explain their components`
   - `what is cpu and memory`
   - *Result*: Delivers structured architectural breakdown (Input, ALU/CU/Registers, RAM/ROM/Storage, Output) in Hindi or English.
3. **Classical Physics & Dynamics**:
   - `explain newton laws of motion` (or `न्यूटन के गति के नियम समझाइए`)
   - *Result*: 3 Laws of Motion, everyday inertia examples, formula $F = m \cdot a$, and diagnostic numericals.
4. **Interactive SVG Scientific Diagrams**:
   - `explain convex lens optics diagram` (Renders 2F lens ray diagram)
   - `explain pulley tension and mass` (Renders pulley dynamics & FBD)
   - `explain dna double helix structure` (Renders molecular biology base pairs)
   - `explain benzene resonance ring` (Renders chemical structure)
   - `explain binary tree avl structure` (Renders self-balancing BST)
5. **Direct Numerical Calculations**:
   - `calculate 25 * 14 + 120 / 4`

---

### Mode B: Full Generative AI Mode (With Google Gemini API Key)
When you want AI Guru to answer **any custom question across the entire universe of subjects** (e.g., NCERT textbooks, creative writing, JEE/NEET multi-step reasoning, essay generation), you connect a free Google Gemini API Key.

#### How to Enable Mode B:
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Add the key:
   - **Local Development**: In `.env`, set `GEMINI_API_KEY=AIzaSy...`
   - **Vercel / Cloud**: In *Project Settings -> Environment Variables*, add:
     - Name: `GEMINI_API_KEY`
     - Value: `<Your Google API Key>`
3. Redeploy or restart the server (`npm run dev`).

#### Sample Questions Enabled in Mode B:
- *"Explain the Krebs Cycle in cellular respiration with enzyme names."*
- *"Derive the time dilation formula using Lorentz transformation for special relativity."*
- *"Write an essay on the Indian Constitution's Preamble with key supreme court verdicts."*
- *"Debug this C++ code for Dijkstra shortest path algorithm."*
