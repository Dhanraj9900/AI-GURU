import { db } from './db.ts';
import { Course } from '../types/index.ts';

export function renderAdminPortalHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Guru — Backend Admin & Swagger OpenAPI Console</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --card-border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --get-badge: #0284c7;
      --post-badge: #10b981;
      --put-badge: #f59e0b;
      --delete-badge: #ef4444;
      --code-bg: #030712;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      min-height: 100vh;
      padding-bottom: 60px;
    }
    header {
      background: #0f172a;
      border-bottom: 1px solid var(--card-border);
      padding: 16px 24px;
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      background: var(--accent);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      color: white;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-swagger {
      background: #064e3b;
      color: #34d399;
      border: 1px solid #059669;
      font-size: 11px;
      font-family: 'Fira Code', monospace;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
      border: none;
    }
    .btn-primary {
      background: var(--accent);
      color: white;
    }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-outline {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--card-border);
    }
    .btn-outline:hover {
      background: var(--card-border);
      color: white;
    }
    .btn-danger {
      background: #7f1d1d;
      color: #fca5a5;
      border: 1px solid #991b1b;
    }
    .btn-danger:hover {
      background: #991b1b;
      color: white;
    }
    .btn-success {
      background: #064e3b;
      color: #6ee7b7;
      border: 1px solid #059669;
    }
    .btn-success:hover {
      background: #059669;
      color: white;
    }

    /* Tabs */
    .tabs-bar {
      background: #0f172a;
      border-bottom: 1px solid var(--card-border);
      padding: 0 24px;
      display: flex;
      gap: 4px;
      overflow-x: auto;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .tab-btn:hover { color: white; }
    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    /* Container */
    .container {
      max-width: 1280px;
      margin: 24px auto;
      padding: 0 20px;
    }
    .tab-pane { display: none; }
    .tab-pane.active { display: block; }

    /* Cards & layout */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--card-border);
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: white;
    }

    /* Form controls */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .form-group {
      margin-bottom: 14px;
    }
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #d1d5db;
      margin-bottom: 6px;
    }
    input, select, textarea {
      width: 100%;
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      color: white;
      padding: 10px 12px;
      font-size: 13px;
      border-radius: 8px;
      font-family: inherit;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    textarea { resize: vertical; min-height: 80px; }

    /* Courses list */
    .course-item {
      background: #0f172a;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: border-color 0.15s ease;
    }
    .course-item:hover { border-color: #374151; }
    .course-item-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .course-title {
      font-size: 15px;
      font-weight: 700;
      color: white;
    }
    .course-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .course-pill {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 6px;
      font-family: 'Fira Code', monospace;
    }
    .pill-gate { background: #4c1d95; color: #c4b5fd; border: 1px solid #6d28d9; }
    .pill-comp { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
    .pill-school { background: #1e3a8a; color: #93c5fd; border: 1px solid #2563eb; }
    .pill-other { background: #374151; color: #d1d5db; }

    /* Swagger UI styles */
    .api-tag-title {
      font-size: 16px;
      font-weight: 800;
      color: #e5e7eb;
      margin: 24px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .endpoint-card {
      background: #0f172a;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      margin-bottom: 10px;
      overflow: hidden;
    }
    .endpoint-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      cursor: pointer;
      user-select: none;
    }
    .endpoint-header:hover { background: #131d33; }
    .method-path {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
    }
    .http-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      color: white;
      text-transform: uppercase;
      min-width: 65px;
      text-align: center;
    }
    .http-get { background: var(--get-badge); }
    .http-post { background: var(--post-badge); }
    .http-put { background: var(--put-badge); }
    .http-delete { background: var(--delete-badge); }
    .endpoint-desc {
      font-size: 12px;
      color: var(--text-muted);
    }
    .endpoint-body {
      display: none;
      padding: 16px;
      border-top: 1px solid var(--card-border);
      background: var(--code-bg);
      font-size: 12px;
    }
    .endpoint-body.open { display: block; }
    .code-box {
      background: #050a14;
      border: 1px solid #1f2937;
      padding: 12px;
      border-radius: 6px;
      font-family: 'Fira Code', monospace;
      font-size: 11px;
      color: #93c5fd;
      overflow-x: auto;
      max-height: 240px;
      white-space: pre-wrap;
      word-break: break-all;
    }

    /* Notification / Toast */
    #toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.25s ease;
      z-index: 100;
    }
    #toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    #toast.error {
      background: #ef4444;
    }
  </style>
</head>
<body>

  <!-- Top Navigation Header -->
  <header>
    <div class="brand">
      <div class="brand-logo">AG</div>
      <div>
        <div class="brand-title">
          <span>AI GURU BACKEND ADMIN</span>
          <span class="badge-swagger">OAS 3.0 / SWAGGER API</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted);">
          Dedicated Course Publishing, Deletion & Backend Governance Console
        </div>
      </div>
    </div>
    <div class="header-actions">
      <a href="/" target="_blank" class="btn btn-outline">
        <span>🌐 Open Frontend Learning Portal</span> ↗
      </a>
      <button onclick="refreshData()" class="btn btn-primary">
        <span>🔄 Refresh Live DB</span>
      </button>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <div class="tabs-bar">
    <button class="tab-btn active" onclick="switchTab('courses-tab', this)">
      🎓 Courses Administration & Deletion
    </button>
    <button class="tab-btn" onclick="switchTab('swagger-tab', this)">
      ⚡ Swagger / REST API Explorer
    </button>
    <button class="tab-btn" onclick="switchTab('governance-tab', this)">
      🛡️ National Content Allowlist (NCERT/DIKSHA)
    </button>
    <button class="tab-btn" onclick="switchTab('audit-tab', this)">
      📜 Security & System Audit Trail
    </button>
  </div>

  <div class="container">

    <!-- ============================================== -->
    <!-- TAB 1: COURSES MANAGEMENT & CREATION & DELETION -->
    <!-- ============================================== -->
    <div id="courses-tab" class="tab-pane active">

      <!-- Course Creation Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🚀 Create & Upload New Course (Reflects in Frontend Instantly)</div>
          <span style="font-size: 11px; color: var(--text-muted);">Admin Endpoint: <code>POST /api/courses</code></span>
        </div>

        <form id="createCourseForm" onsubmit="handleCreateCourse(event)">
          <div class="form-grid">
            <div class="form-group">
              <label>Course Title *</label>
              <input type="text" id="courseTitle" required placeholder="e.g. UPSC CSAT Complete Analytical Reasoning & Math" />
            </div>

            <div class="form-group">
              <label>Category *</label>
              <select id="courseCategory">
                <option value="competitive">Competitive Entrance (प्रतियोगी परीक्षा)</option>
                <option value="gate">GATE Exam (Data Science & AI / CS)</option>
                <option value="school">Classes 1–12 (School & State Boards)</option>
                <option value="higher_ed">Higher Ed & University (उच्च शिक्षा)</option>
                <option value="skill">Practical Skills & Coding (कौशल विकास)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Board / Examination Body *</label>
              <input type="text" id="courseBoard" required placeholder="e.g. UPSC, IISc / IIT, CBSE, SSC CGL, NTA" />
            </div>

            <div class="form-group">
              <label>Target Level / Standard</label>
              <input type="text" id="courseLevel" placeholder="e.g. National PG Entrance, Senior Secondary, Class 10" />
            </div>

            <div class="form-group full-width">
              <label>Course Description *</label>
              <textarea id="courseDescription" required placeholder="Detailed syllabus breakdown and target examination goals..."></textarea>
            </div>

            <div class="form-group full-width">
              <label>Thumbnail Image URL (or pick a preset)</label>
              <input type="url" id="courseThumbnail" placeholder="https://images.unsplash.com/..." value="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80" />
              <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                <button type="button" class="btn btn-outline" style="font-size: 11px; padding: 4px 8px;" onclick="setThumb('https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80')">AI & Tech</button>
                <button type="button" class="btn btn-outline" style="font-size: 11px; padding: 4px 8px;" onclick="setThumb('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80')">Quantum / Physics</button>
                <button type="button" class="btn btn-outline" style="font-size: 11px; padding: 4px 8px;" onclick="setThumb('https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80')">Mathematics</button>
                <button type="button" class="btn btn-outline" style="font-size: 11px; padding: 4px 8px;" onclick="setThumb('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80')">Data Science</button>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Initial Chapter 1 Title & Topics</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <input type="text" id="chapTitle" placeholder="Chapter 1 Title, e.g. Number Systems & Foundations" value="Chapter 1: Core Fundamentals & Theory" />
                <input type="text" id="chapTopics" placeholder="Comma-separated topics, e.g. Divisibility, Remainders, Shortcuts" value="Key Definitions, Formulas, Problem Sets" />
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
            <button type="submit" id="btnSubmitCourse" class="btn btn-primary" style="padding: 10px 20px; font-size: 13px;">
              🚀 Publish New Course (Upload to Database)
            </button>
          </div>
        </form>
      </div>

      <!-- Existing Courses List with Delete Button -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📚 Active Courses in System Database (<span id="courseCount">0</span>)</div>
            <div style="font-size: 11px; color: var(--text-muted);">
              All courses visible on the student frontend. Delete any course below with 1 click.
            </div>
          </div>
          <div>
            <input type="text" id="filterInput" oninput="renderCoursesList()" placeholder="🔍 Search courses..." style="width: 220px; padding: 6px 10px; font-size: 12px;" />
          </div>
        </div>

        <div id="coursesList">
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">Loading courses from database...</div>
        </div>
      </div>

    </div>

    <!-- ============================================== -->
    <!-- TAB 2: SWAGGER / REST API EXPLORER             -->
    <!-- ============================================== -->
    <div id="swagger-tab" class="tab-pane">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">⚡ Interactive Swagger OpenAPI 3.0 Console</div>
            <div style="font-size: 11px; color: var(--text-muted);">
              Test live REST endpoints directly with simulated inputs and live responses.
            </div>
          </div>
        </div>

        <!-- Endpoints List -->
        <div class="api-tag-title">🎓 Courses Catalog API</div>

        <!-- GET /api/courses -->
        <div class="endpoint-card">
          <div class="endpoint-header" onclick="toggleEndpoint('ep1')">
            <div class="method-path">
              <span class="http-badge http-get">GET</span>
              <span>/api/courses</span>
            </div>
            <span class="endpoint-desc">Fetch course catalog with search and category filters</span>
          </div>
          <div id="ep1" class="endpoint-body">
            <div style="margin-bottom: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
              <input type="text" id="ep1_cat" placeholder="category (e.g. gate, school, competitive, all)" style="max-width: 240px;" />
              <input type="text" id="ep1_search" placeholder="search query (e.g. math, gate)" style="max-width: 240px;" />
              <button class="btn btn-primary" onclick="testEndpoint('GET', '/api/courses', { category: ep1_cat.value, search: ep1_search.value }, 'ep1_res')">Execute Request</button>
            </div>
            <div class="code-box" id="ep1_res">// Click "Execute Request" to test endpoint...</div>
          </div>
        </div>

        <!-- GET /api/courses/:id -->
        <div class="endpoint-card">
          <div class="endpoint-header" onclick="toggleEndpoint('ep2')">
            <div class="method-path">
              <span class="http-badge http-get">GET</span>
              <span>/api/courses/{id}</span>
            </div>
            <span class="endpoint-desc">Fetch course syllabus chapters, live classes & quizzes</span>
          </div>
          <div id="ep2" class="endpoint-body">
            <div style="margin-bottom: 12px; display: flex; gap: 10px;">
              <input type="text" id="ep2_id" placeholder="Course ID (e.g. crs_gate_da)" value="crs_gate_da" style="max-width: 280px;" />
              <button class="btn btn-primary" onclick="testEndpoint('GET', '/api/courses/' + ep2_id.value, null, 'ep2_res')">Execute Request</button>
            </div>
            <div class="code-box" id="ep2_res">// Click "Execute Request" to test endpoint...</div>
          </div>
        </div>

        <!-- POST /api/courses -->
        <div class="endpoint-card">
          <div class="endpoint-header" onclick="toggleEndpoint('ep3')">
            <div class="method-path">
              <span class="http-badge http-post">POST</span>
              <span>/api/courses</span>
            </div>
            <span class="endpoint-desc">Create / upload a new course with full syllabus payload</span>
          </div>
          <div id="ep3" class="endpoint-body">
            <div style="margin-bottom: 12px;">
              <label>JSON Request Body:</label>
              <textarea id="ep3_body" style="font-family: 'Fira Code', monospace; font-size: 11px; height: 140px;">{
  "title": "SSC CGL Quantitative Aptitude Fastrack",
  "category": "competitive",
  "boardOrExam": "SSC",
  "level": "Graduate Level Examination",
  "description": "Shortcuts, speed math, percentage, and geometry tricks."
}</textarea>
              <button class="btn btn-primary" style="margin-top: 8px;" onclick="testPostJson('/api/courses', 'ep3_body', 'ep3_res')">Execute POST</button>
            </div>
            <div class="code-box" id="ep3_res">// Response output...</div>
          </div>
        </div>

        <!-- DELETE /api/courses/:id -->
        <div class="endpoint-card">
          <div class="endpoint-header" onclick="toggleEndpoint('ep4')">
            <div class="method-path">
              <span class="http-badge http-delete">DELETE</span>
              <span>/api/courses/{id}</span>
            </div>
            <span class="endpoint-desc">Delete a course by ID permanently</span>
          </div>
          <div id="ep4" class="endpoint-body">
            <div style="margin-bottom: 12px; display: flex; gap: 10px;">
              <input type="text" id="ep4_id" placeholder="Course ID to delete" style="max-width: 280px;" />
              <button class="btn btn-danger" onclick="testDeleteCourse(ep4_id.value, 'ep4_res')">Execute DELETE</button>
            </div>
            <div class="code-box" id="ep4_res">// Response output...</div>
          </div>
        </div>

        <div class="api-tag-title">🎙️ Live Classes & Interactive Sessions</div>

        <!-- GET /api/live-classes -->
        <div class="endpoint-card">
          <div class="endpoint-header" onclick="toggleEndpoint('ep5')">
            <div class="method-path">
              <span class="http-badge http-get">GET</span>
              <span>/api/live-classes</span>
            </div>
            <span class="endpoint-desc">Fetch live classes directory and upcoming streams</span>
          </div>
          <div id="ep5" class="endpoint-body">
            <button class="btn btn-primary" style="margin-bottom: 10px;" onclick="testEndpoint('GET', '/api/live-classes', null, 'ep5_res')">Execute Request</button>
            <div class="code-box" id="ep5_res">// Response output...</div>
          </div>
        </div>

        <div class="api-tag-title">🛡️ Administrative Governance & Security Logs</div>

        <!-- GET /api/admin/audit-logs -->
        <div class="endpoint-card">
          <div class="endpoint-header" onclick="toggleEndpoint('ep6')">
            <div class="method-path">
              <span class="http-badge http-get">GET</span>
              <span>/api/admin/audit-logs</span>
            </div>
            <span class="endpoint-desc">Fetch system administrative security and mutation audit logs</span>
          </div>
          <div id="ep6" class="endpoint-body">
            <button class="btn btn-primary" style="margin-bottom: 10px;" onclick="testEndpoint('GET', '/api/admin/audit-logs', null, 'ep6_res')">Execute Request</button>
            <div class="code-box" id="ep6_res">// Response output...</div>
          </div>
        </div>

      </div>
    </div>

    <!-- ============================================== -->
    <!-- TAB 3: NATIONAL CONTENT REPOSITORIES           -->
    <!-- ============================================== -->
    <div id="governance-tab" class="tab-pane">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🛡️ National Educational Allowlist & Repository Pipeline</div>
            <div style="font-size: 11px; color: var(--text-muted);">
              Automated ingestion from official public repositories (NCERT, DIKSHA, SWAYAM, NPTEL).
            </div>
          </div>
        </div>

        <form id="ingestForm" onsubmit="handleIngest(event)">
          <div class="form-grid">
            <div class="form-group">
              <label>Source URL (Must match official allowlist) *</label>
              <input type="url" id="ingestUrl" required placeholder="https://ncert.nic.in/textbook/pdf/jemh104.pdf" />
            </div>
            <div class="form-group">
              <label>Authority & Source Title *</label>
              <input type="text" id="ingestSource" required placeholder="e.g. NCERT National Council of Educational Research" />
            </div>
            <div class="form-group">
              <label>Resource Type</label>
              <select id="ingestType">
                <option value="textbook">Official Textbook</option>
                <option value="syllabus">Curriculum Syllabus</option>
                <option value="practice_set">Competency Question Bank</option>
                <option value="lecture_notes">National Repository Handouts</option>
              </select>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
            <button type="submit" class="btn btn-primary">Start 7-Stage Discovery & Verification</button>
          </div>
        </form>

        <div style="margin-top: 24px;">
          <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 12px;">Educational Candidates in Pipeline</h4>
          <div id="jobsList">Loading jobs...</div>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- TAB 4: AUDIT LOGS                              -->
    <!-- ============================================== -->
    <div id="audit-tab" class="tab-pane">
      <div class="card">
        <div class="card-header">
          <div class="card-title">📜 System Audit Trail & Real-time Mutation Logs</div>
          <button onclick="loadAuditLogs()" class="btn btn-outline" style="font-size: 11px;">Refresh Logs</button>
        </div>
        <div id="auditList" style="max-height: 500px; overflow-y: auto;">Loading audit logs...</div>
      </div>
    </div>

  </div>

  <div id="toast">Operation completed successfully</div>

  <script>
    // State
    let coursesData = [];
    const ADMIN_TOKEN = 'token_admin_demo';

    // Tabs switcher
    function switchTab(tabId, btn) {
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      btn.classList.add('active');
      if (tabId === 'courses-tab') loadCourses();
      if (tabId === 'governance-tab') loadGovernance();
      if (tabId === 'audit-tab') loadAuditLogs();
    }

    function showToast(msg, isError = false) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.className = isError ? 'error show' : 'show';
      setTimeout(() => { toast.className = ''; }, 3000);
    }

    function setThumb(url) {
      document.getElementById('courseThumbnail').value = url;
    }

    // Toggle endpoint accordion in Swagger tab
    function toggleEndpoint(id) {
      const el = document.getElementById(id);
      el.classList.toggle('open');
    }

    // Initial Load
    async function refreshData() {
      await loadCourses();
      showToast('Database synchronized.');
    }

    // 1. COURSES MANAGEMENT
    async function loadCourses() {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        coursesData = data.courses || [];
        document.getElementById('courseCount').innerText = coursesData.length;
        renderCoursesList();
      } catch (err) {
        document.getElementById('coursesList').innerHTML = '<div style="color: #ef4444; padding: 20px;">Failed to load courses: ' + err.message + '</div>';
      }
    }

    function renderCoursesList() {
      const query = (document.getElementById('filterInput')?.value || '').toLowerCase();
      const filtered = coursesData.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.category.toLowerCase().includes(query) || 
        c.boardOrExam.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
      );

      const container = document.getElementById('coursesList');
      if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">No courses found matching filter.</div>';
        return;
      }

      container.innerHTML = filtered.map(c => {
        let pillClass = 'pill-other';
        if (c.category === 'gate') pillClass = 'pill-gate';
        else if (c.category === 'competitive') pillClass = 'pill-comp';
        else if (c.category === 'school') pillClass = 'pill-school';

        return \`
          <div class="course-item" id="card_\${c.id}">
            <div class="course-item-header">
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span class="course-pill \${pillClass}">\${c.category}</span>
                  <span style="font-family: 'Fira Code', monospace; font-size: 11px; color: #9ca3af;">\${c.id}</span>
                  <span style="font-size: 11px; color: #d1d5db; font-weight: 600;">\${c.boardOrExam}</span>
                </div>
                <h3 class="course-title" style="margin-top: 6px;">\${c.title}</h3>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 4px; line-height: 1.4;">\${c.description}</p>
                <div class="course-meta">
                  <span>📖 \${c.chaptersCount || (c.chapters && c.chapters.length) || 1} Chapters</span>
                  <span>·</span>
                  <span>👥 \${c.enrolledStudentsCount || 0} Students</span>
                  <span>·</span>
                  <span>🎓 \${c.level}</span>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <button onclick="toggleJson('\${c.id}')" class="btn btn-outline" style="font-size: 11px;">
                  👁️ JSON
                </button>
                <button onclick="deleteCoursePrompt('\${c.id}', '\${c.title.replace(/'/g, "\\\\'")}')" class="btn btn-danger" style="font-size: 11px;">
                  🗑️ Delete Course
                </button>
              </div>
            </div>

            <div id="json_\${c.id}" style="display: none; margin-top: 10px;" class="code-box">
\${JSON.stringify(c, null, 2)}
            </div>
          </div>
        \`;
      }).join('');
    }

    function toggleJson(id) {
      const el = document.getElementById('json_' + id);
      if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }

    // Create Course Handler
    async function handleCreateCourse(e) {
      e.preventDefault();
      const btn = document.getElementById('btnSubmitCourse');
      btn.disabled = true;
      btn.innerText = 'Publishing Course...';

      const title = document.getElementById('courseTitle').value.trim();
      const category = document.getElementById('courseCategory').value;
      const boardOrExam = document.getElementById('courseBoard').value.trim();
      const level = document.getElementById('courseLevel').value.trim() || 'General';
      const description = document.getElementById('courseDescription').value.trim();
      const thumbnail = document.getElementById('courseThumbnail').value.trim();
      const chapTitle = document.getElementById('chapTitle').value.trim() || 'Chapter 1: Foundations';
      const chapTopics = document.getElementById('chapTopics').value.trim() || 'Core Theory';

      const payload = {
        title,
        category,
        boardOrExam,
        level,
        description,
        thumbnail,
        chapters: [
          {
            id: 'ch_' + Date.now() + '_1',
            courseId: 'crs_' + Date.now(),
            title: chapTitle,
            sequence: 1,
            learningObjectives: ['Master fundamental principles', 'Solve exam problems'],
            topics: chapTopics.split(',').map((t, idx) => ({
              id: 'top_' + Date.now() + '_' + (idx + 1),
              title: t.trim(),
              difficulty: 'intermediate',
              summary: 'Comprehensive overview of ' + t.trim(),
              formulas: [],
              keyPoints: ['Review definitions', 'Work through core problems']
            }))
          }
        ]
      };

      try {
        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + ADMIN_TOKEN
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create course');

        showToast('Course "' + title + '" published successfully! Live in frontend.');
        document.getElementById('createCourseForm').reset();
        await loadCourses();
      } catch (err) {
        showToast(err.message, true);
      } finally {
        btn.disabled = false;
        btn.innerText = '🚀 Publish New Course (Upload to Database)';
      }
    }

    // Delete Course
    async function deleteCoursePrompt(id, title) {
      const ok = confirm('Are you sure you want to permanently delete course:\\n"' + title + '" (ID: ' + id + ')?\\n\\nThis will immediately remove it from the student frontend.');
      if (!ok) return;

      try {
        const res = await fetch('/api/courses/' + id, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + ADMIN_TOKEN
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete course');

        showToast('Course "' + id + '" deleted successfully.');
        await loadCourses();
      } catch (err) {
        showToast(err.message, true);
      }
    }

    // 2. SWAGGER TESTERS
    async function testEndpoint(method, path, queryParams, resElementId) {
      const box = document.getElementById(resElementId);
      box.innerText = 'Sending ' + method + ' request to ' + path + '...';

      let fullPath = path;
      if (queryParams) {
        const q = new URLSearchParams();
        Object.entries(queryParams).forEach(([k, v]) => {
          if (v) q.append(k, v);
        });
        const qStr = q.toString();
        if (qStr) fullPath += '?' + qStr;
      }

      try {
        const start = performance.now();
        const res = await fetch(fullPath, {
          method,
          headers: { 'Authorization': 'Bearer ' + ADMIN_TOKEN }
        });
        const duration = Math.round(performance.now() - start);
        const data = await res.json();
        box.innerText = 'Status: ' + res.status + ' ' + res.statusText + ' (' + duration + 'ms)\\n\\n' + JSON.stringify(data, null, 2);
      } catch (err) {
        box.innerText = 'Error: ' + err.message;
      }
    }

    async function testPostJson(path, bodyElementId, resElementId) {
      const box = document.getElementById(resElementId);
      const raw = document.getElementById(bodyElementId).value;
      try {
        const payload = JSON.parse(raw);
        box.innerText = 'Sending POST request...';
        const start = performance.now();
        const res = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + ADMIN_TOKEN
          },
          body: JSON.stringify(payload)
        });
        const duration = Math.round(performance.now() - start);
        const data = await res.json();
        box.innerText = 'Status: ' + res.status + ' ' + res.statusText + ' (' + duration + 'ms)\\n\\n' + JSON.stringify(data, null, 2);
        loadCourses();
      } catch (err) {
        box.innerText = 'Invalid JSON or Request Error: ' + err.message;
      }
    }

    async function testDeleteCourse(id, resElementId) {
      if (!id) {
        alert('Please enter a Course ID');
        return;
      }
      testEndpoint('DELETE', '/api/courses/' + id.trim(), null, resElementId);
      setTimeout(loadCourses, 500);
    }

    // 3. GOVERNANCE
    async function loadGovernance() {
      try {
        const res = await fetch('/api/admin/research-jobs', {
          headers: { 'Authorization': 'Bearer ' + ADMIN_TOKEN }
        });
        const data = await res.json();
        const container = document.getElementById('jobsList');
        const jobs = data.jobs || [];
        if (jobs.length === 0) {
          container.innerHTML = '<div style="color: var(--text-muted); padding: 20px;">No jobs in queue.</div>';
          return;
        }
        container.innerHTML = jobs.map(j => \`
          <div style="background: #0f172a; border: 1px solid var(--card-border); padding: 14px; border-radius: 8px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="course-pill \${j.status === 'approved' ? 'pill-comp' : 'pill-other'}">\${j.status}</span>
                <strong style="margin-left: 8px;">\${j.extractedTitle || j.sourceName}</strong>
              </div>
              <div>
                \${j.status === 'pending_review' ? \`
                  <button onclick="decideJob('\${j.id}', 'approved')" class="btn btn-success" style="font-size: 11px; padding: 4px 8px;">Approve</button>
                  <button onclick="decideJob('\${j.id}', 'rejected')" class="btn btn-danger" style="font-size: 11px; padding: 4px 8px;">Reject</button>
                \` : ''}
              </div>
            </div>
            <p style="font-size: 11px; color: #9ca3af; margin-top: 6px;">\${j.extractedSummary || j.url}</p>
          </div>
        \`).join('');
      } catch (err) {
        console.error(err);
      }
    }

    async function handleIngest(e) {
      e.preventDefault();
      const targetUrl = document.getElementById('ingestUrl').value.trim();
      const sourceName = document.getElementById('ingestSource').value.trim();
      const resourceType = document.getElementById('ingestType').value;

      try {
        const res = await fetch('/api/admin/research-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + ADMIN_TOKEN
          },
          body: JSON.stringify({ targetUrl, sourceName, resourceType })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ingestion failed');
        showToast('Discovery started successfully!');
        loadGovernance();
      } catch (err) {
        showToast(err.message, true);
      }
    }

    async function decideJob(id, decision) {
      try {
        const res = await fetch('/api/admin/content/' + id + '/' + decision, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + ADMIN_TOKEN
          },
          body: JSON.stringify({ notes: 'Decision by Backend Admin Portal' })
        });
        if (!res.ok) throw new Error('Decision failed');
        showToast('Candidate ' + decision + '!');
        loadGovernance();
      } catch (err) {
        showToast(err.message, true);
      }
    }

    // 4. AUDIT LOGS
    async function loadAuditLogs() {
      try {
        const res = await fetch('/api/admin/audit-logs', {
          headers: { 'Authorization': 'Bearer ' + ADMIN_TOKEN }
        });
        const data = await res.json();
        const list = document.getElementById('auditList');
        const logs = data.logs || [];
        if (logs.length === 0) {
          list.innerHTML = '<div style="color: var(--text-muted); padding: 20px;">No audit logs yet.</div>';
          return;
        }
        list.innerHTML = logs.map(l => \`
          <div style="padding: 10px; border-bottom: 1px solid var(--card-border); font-size: 11px; font-family: 'Fira Code', monospace; display: flex; justify-content: space-between;">
            <div>
              <span style="color: var(--accent); font-weight: 700;">\${l.action}</span>
              <span style="color: #d1d5db; margin-left: 8px;">\${l.details}</span>
            </div>
            <span style="color: var(--text-muted);">\${new Date(l.timestamp).toLocaleTimeString()}</span>
          </div>
        \`).join('');
      } catch (err) {
        console.error(err);
      }
    }

    // Start
    loadCourses();
  </script>
</body>
</html>`;
}
