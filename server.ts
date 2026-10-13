import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db.ts';
import { loginUser, signupUser, verifyToken, revokeToken, verifyAndUpgradeTeacher } from './src/server/auth.ts';
import { generateTutorResponse, getModelRuntimeStatus } from './src/server/modelAdapter.ts';
import { chunkDocumentText, searchUserKnowledgeBase } from './src/server/ragService.ts';
import { scoreAndAnalyzeQuiz } from './src/server/analyticsService.ts';
import { runEducationalResearchDiscovery, reviewResearchJob } from './src/server/researchAgent.ts';
import { Course, Conversation, DocumentUpload, Quiz, Language, LiveClass, StudentNotebookNote, VideoLectureItem } from './src/types/index.ts';
import { renderAdminPortalHtml } from './src/server/adminPortal.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Auth middleware helper
function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  return verifyToken(token);
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  (req as any).user = user;
  next();
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const result = await loginUser(email, password);
    if (!result) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, preferredLanguage, educationalLevel, teacherDegree } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    const result = await signupUser({
      name,
      email,
      password,
      role,
      preferredLanguage,
      educationalLevel,
      teacherDegree,
    });
    if ('error' in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Signup failed.' });
  }
});

// Upgrade / Verify Teacher Degree Credentials
app.post('/api/auth/teacher-verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { degreeLevel, degreeName, institution, graduationYear, specialization, documentName, documentUrl } = req.body;

    if (!degreeLevel || !degreeName || !institution || !graduationYear || !documentName) {
      res.status(400).json({
        error:
          'अनिवार्य आवश्यकता: शिक्षक बनने के लिए कम से कम स्नातक (Graduate), स्नातकोत्तर (Postgraduate) या पीएचडी (PhD) डिग्री और प्रमाण-पत्र दस्तावेज़ अपलोड करना अनिवार्य है।',
      });
      return;
    }

    const result = await verifyAndUpgradeTeacher(authUser.id, {
      degreeLevel,
      degreeName,
      institution,
      graduationYear,
      specialization,
      documentName,
      documentUrl,
    });

    if ('error' in result) {
      res.status(400).json({ error: result.error });
      return;
    }

    // Add audit log
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'TEACHER_DEGREE_VERIFIED',
      userId: authUser.id,
      timestamp: new Date().toISOString(),
      details: `Teacher degree verified: ${degreeName} from ${institution} (${degreeLevel.toUpperCase()}). Promoted to verified faculty.`,
    });

    res.json({ success: true, user: result.user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Teacher verification failed.' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    revokeToken(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ----------------------------------------------------
// COURSES CATALOG
// ----------------------------------------------------
app.get('/api/courses', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let filtered = [...db.courses];

  if (category && category !== 'all') {
    if (category === 'gate') {
      filtered = filtered.filter(
        (c) =>
          c.id === 'crs_gate_da' ||
          c.title.toLowerCase().includes('gate') ||
          c.boardOrExam.toLowerCase().includes('gate')
      );
    } else {
      filtered = filtered.filter((c) => c.category === category);
    }
  }
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        c.boardOrExam.toLowerCase().includes(s) ||
        c.id.toLowerCase().includes(s)
    );
  }

  const enriched = filtered.map((c) => ({
    ...c,
    liveClasses: c.liveClasses || db.liveClasses.filter((l) => l.courseId === c.id),
    courseQuizzes: c.courseQuizzes || db.quizzes.filter((q) => (q as any).courseId === c.id),
  }));

  res.json({ courses: enriched });
});

app.get('/api/courses/:id', (req: Request, res: Response) => {
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  const enriched = {
    ...course,
    liveClasses: course.liveClasses || db.liveClasses.filter((l) => l.courseId === course.id),
    courseQuizzes: course.courseQuizzes || db.quizzes.filter((q) => (q as any).courseId === course.id),
  };
  res.json({ course: enriched });
});

app.post('/api/courses/:id/enroll', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  course.isEnrolled = true;
  course.enrolledStudentsCount += 1;

  db.auditLogs.push({
    id: `aud_${Date.now()}`,
    action: 'COURSE_ENROLLED',
    userId: user.id,
    timestamp: new Date().toISOString(),
    details: `User enrolled in course: ${course.title}`,
  });

  res.json({ success: true, course });
});

app.post('/api/courses/:id/unenroll', requireAuth, (req: Request, res: Response) => {
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  course.isEnrolled = false;
  if (course.enrolledStudentsCount > 0) {
    course.enrolledStudentsCount -= 1;
  }
  res.json({ success: true, course });
});

// Teacher creates a new course
app.post('/api/courses', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'केवल सत्यापित शिक्षक ही नया कोर्स बना सकते हैं। कृपया अपनी डिग्री सत्यापित करें।' });
    return;
  }
  const {
    title,
    category = 'school',
    level = 'General',
    boardOrExam = 'CBSE / Foundation',
    description = '',
    thumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    chapters = [],
  } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Course title is required.' });
    return;
  }

  const newCourse: Course = {
    id: `crs_${Date.now()}`,
    title: title.trim(),
    category,
    level,
    boardOrExam,
    description: description.trim() || 'Comprehensive course curated by faculty.',
    thumbnail: thumbnail.trim(),
    chaptersCount: chapters.length || 1,
    enrolledStudentsCount: 0,
    isEnrolled: true,
    teacherId: user.id,
    teacherName: user.name || 'Educator',
    teacherTitle: user.role === 'teacher' ? 'Course Instructor & Mentor' : 'Verified Educator',
    teacherAvatar: user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    chapters: chapters.length > 0 ? chapters : [
      {
        id: `ch_${Date.now()}_1`,
        courseId: `crs_${Date.now()}`,
        title: 'Chapter 1: Foundations & Core Concepts',
        sequence: 1,
        learningObjectives: ['Master fundamental principles', 'Solve key examples'],
        topics: [
          {
            id: `top_${Date.now()}_1`,
            title: 'Introduction & Core Theory',
            difficulty: 'easy',
            summary: 'Introductory concepts and foundational definitions.',
            formulas: [],
            keyPoints: ['Review definitions', 'Work through core problems'],
          },
        ],
      },
    ],
    videoLectures: [],
    liveClasses: [],
    courseQuizzes: [],
  };

  db.courses.unshift(newCourse);

  db.auditLogs.push({
    id: `aud_${Date.now()}`,
    action: 'COURSE_CREATED',
    userId: user.id,
    timestamp: new Date().toISOString(),
    details: `Teacher ${user.name} created course: ${newCourse.title}`,
  });

  res.status(201).json({ success: true, course: newCourse });
});

// Teacher updates course
app.put('/api/courses/:id', requireAuth, (req: Request, res: Response) => {
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const { title, category, level, boardOrExam, description, thumbnail, chapters } = req.body;
  if (title) course.title = title;
  if (category) course.category = category;
  if (level) course.level = level;
  if (boardOrExam) course.boardOrExam = boardOrExam;
  if (description !== undefined) course.description = description;
  if (thumbnail) course.thumbnail = thumbnail;
  if (chapters) {
    course.chapters = chapters;
    course.chaptersCount = chapters.length;
  }

  res.json({ success: true, course });
});

// Teacher deletes course
app.delete('/api/courses/:id', requireAuth, (req: Request, res: Response) => {
  const index = db.courses.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  const removed = db.courses.splice(index, 1);
  res.json({ success: true, message: 'Course deleted successfully.', course: removed[0] });
});

// Teacher uploads/adds video lecture to course
app.post('/api/courses/:id/lectures', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'केवल सत्यापित शिक्षक ही वीडियो लेक्चर अपलोड कर सकते हैं।' });
    return;
  }
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const { title, url, platform = 'youtube', duration = '30 mins', description = '', notes = '', chapterTitle = '' } = req.body;
  if (!title || !url) {
    res.status(400).json({ error: 'Lecture title and video URL are required.' });
    return;
  }

  if (!course.videoLectures) {
    course.videoLectures = [];
  }

  const newLecture: VideoLectureItem = {
    id: `lec_${Date.now()}`,
    courseId: course.id,
    title: title.trim(),
    platform,
    url: url.trim(),
    duration,
    description: description.trim(),
    notes: notes.trim(),
    chapterTitle: chapterTitle.trim() || (course.chapters[0]?.title || 'General Lectures'),
    uploadedAt: new Date().toISOString(),
  };

  course.videoLectures.push(newLecture);
  res.status(201).json({ success: true, lecture: newLecture, course });
});

// Teacher deletes video lecture from course
app.delete('/api/courses/:id/lectures/:lectureId', requireAuth, (req: Request, res: Response) => {
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course || !course.videoLectures) {
    res.status(404).json({ error: 'Course or lectures not found' });
    return;
  }
  course.videoLectures = course.videoLectures.filter((l) => l.id !== req.params.lectureId);
  res.json({ success: true, course });
});

// ----------------------------------------------------
// LIVE CLASSES (FOR TEACHERS & STUDENTS)
// ----------------------------------------------------
app.get('/api/live-classes', (req: Request, res: Response) => {
  const { courseId } = req.query;
  let classes = [...db.liveClasses];
  if (courseId && typeof courseId === 'string') {
    classes = classes.filter((c) => c.courseId === courseId);
  }
  // Sort with live first, then scheduled
  classes.sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
  });
  res.json({ liveClasses: classes });
});

// Teacher schedules or starts a Live Class
app.post('/api/courses/:id/live-classes', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'केवल सत्यापित शिक्षक ही लाइव क्लास आयोजित कर सकते हैं।' });
    return;
  }
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const {
    title,
    description = '',
    scheduledTime = new Date().toISOString(),
    durationMinutes = 60,
    status = 'live',
    streamUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    agenda = [],
  } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Live class title is required.' });
    return;
  }

  const liveClass: LiveClass = {
    id: `live_${Date.now()}`,
    courseId: course.id,
    courseTitle: course.title,
    teacherId: user.id,
    teacherName: user.name || 'Faculty Member',
    teacherAvatar: user.avatar || course.teacherAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: title.trim(),
    description: description.trim(),
    scheduledTime,
    durationMinutes: Number(durationMinutes) || 60,
    status: status as any,
    meetingRoomId: `room_${course.id}_${Date.now()}`,
    streamUrl,
    attendeesCount: status === 'live' ? 12 : 0,
    chatMessages: [
      {
        id: `chat_init_${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        message: `Welcome to "${title.trim()}". Class is starting now! Feel free to ask questions.`,
        timestamp: new Date().toISOString(),
      },
    ],
    agenda: agenda.length > 0 ? agenda : ['Topic Introduction', 'Live Example Solving', 'Student Q&A & Quiz'],
  };

  db.liveClasses.unshift(liveClass);

  if (!course.liveClasses) course.liveClasses = [];
  course.liveClasses.unshift(liveClass);

  db.auditLogs.push({
    id: `aud_${Date.now()}`,
    action: 'LIVE_CLASS_HOSTED',
    userId: user.id,
    timestamp: new Date().toISOString(),
    details: `Teacher hosted/scheduled live class: ${liveClass.title}`,
  });

  res.status(201).json({ success: true, liveClass });
});

// Update live class status (e.g., mark live, end class)
app.put('/api/live-classes/:id/status', requireAuth, (req: Request, res: Response) => {
  const cls = db.liveClasses.find((c) => c.id === req.params.id);
  if (!cls) {
    res.status(404).json({ error: 'Live class not found' });
    return;
  }
  const { status } = req.body;
  if (['scheduled', 'live', 'completed'].includes(status)) {
    cls.status = status;
    if (status === 'live') {
      cls.attendeesCount = Math.max(cls.attendeesCount, 25);
    }
  }
  res.json({ success: true, liveClass: cls });
});

// Post message into live class chat
app.post('/api/live-classes/:id/chat', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const cls = db.liveClasses.find((c) => c.id === req.params.id);
  if (!cls) {
    res.status(404).json({ error: 'Live class not found' });
    return;
  }
  const { message } = req.body;
  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  const newChatMsg = {
    id: `chat_${Date.now()}`,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  cls.chatMessages.push(newChatMsg);
  res.status(201).json({ success: true, chatMessage: newChatMsg, liveClass: cls });
});

// ----------------------------------------------------
// TEACHER LIVE TEST & QUIZ CREATION FOR COURSE
// ----------------------------------------------------
app.post('/api/courses/:id/quizzes', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'केवल सत्यापित शिक्षक ही टेस्ट व क्विज बना सकते हैं।' });
    return;
  }
  const course = db.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const { title, topic, difficulty = 'medium', timeLimitMinutes = 20, questions = [] } = req.body;
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Quiz title is required.' });
    return;
  }

  const newQuiz: Quiz = {
    id: `quiz_crs_${Date.now()}`,
    title: title.trim(),
    subject: course.title,
    topic: topic || course.chapters[0]?.title || 'Course Mastery Test',
    difficulty: difficulty as any,
    timeLimitMinutes: Number(timeLimitMinutes) || 20,
    questions: questions.length > 0 ? questions : [
      {
        id: `q_${Date.now()}_1`,
        subject: course.title,
        topic: topic || 'Core Assessment',
        difficulty: 'medium',
        type: 'mcq',
        questionText: `What is the fundamental principle tested in ${topic || course.title}?`,
        options: ['Correct Theoretical Basis', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Correct Theoretical Basis',
        explanation: 'Detailed step-by-step reasoning verified by instructor.',
      },
    ],
    createdAt: new Date().toISOString(),
  };

  db.quizzes.unshift(newQuiz);

  if (!course.courseQuizzes) course.courseQuizzes = [];
  course.courseQuizzes.unshift(newQuiz);

  res.status(201).json({ success: true, quiz: newQuiz, course });
});

// ----------------------------------------------------
// STUDENT NOTEBOOK (मेरी नोटबुक - NOTES & FILES)
// ----------------------------------------------------
app.get('/api/notebook/notes', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const userNotes = db.studentNotes.filter((n) => n.userId === user.id || n.userId === 'usr_student_1');
  res.json({ notes: userNotes });
});

app.post('/api/notebook/notes', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { title, subject = 'General', tags = [], content = '', fileAttachment } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Note title is required.' });
    return;
  }

  // Key concepts extraction
  const conceptMatches = content.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g) || [];
  const keyConcepts: string[] = Array.from<string>(new Set<string>(conceptMatches)).slice(0, 5);

  const newNote: StudentNotebookNote = {
    id: `note_${Date.now()}`,
    userId: user.id,
    title: title.trim(),
    subject: subject.trim(),
    tags: Array.isArray(tags) ? (tags as string[]) : [],
    content: content.trim(),
    fileAttachment: fileAttachment ? {
      name: fileAttachment.name || 'uploaded_document.txt',
      size: fileAttachment.size || 1024,
      type: fileAttachment.type || 'text/plain',
      dataUrl: fileAttachment.dataUrl || '',
    } : undefined,
    keyConcepts,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.studentNotes.unshift(newNote);

  // Also index into documents if content is substantial for RAG
  if (content.length > 50) {
    const docId = `doc_note_${newNote.id}`;
    const chunks = chunkDocumentText(docId, content, title.trim());
    db.documents.unshift({
      id: docId,
      userId: user.id,
      filename: `Notebook: ${title.trim()}`,
      fileSize: Buffer.byteLength(content, 'utf8'),
      mimeType: 'text/plain',
      status: 'indexed',
      extractedTextLength: content.length,
      chunkCount: chunks.length,
      uploadedAt: new Date().toISOString(),
      chunks,
    });
  }

  res.status(201).json({ success: true, note: newNote });
});

app.put('/api/notebook/notes/:id', requireAuth, (req: Request, res: Response) => {
  const note = db.studentNotes.find((n) => n.id === req.params.id);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  const { title, subject, tags, content } = req.body;
  if (title) note.title = title.trim();
  if (subject) note.subject = subject.trim();
  if (tags) note.tags = tags;
  if (content !== undefined) note.content = content.trim();
  note.updatedAt = new Date().toISOString();

  res.json({ success: true, note });
});

app.delete('/api/notebook/notes/:id', requireAuth, (req: Request, res: Response) => {
  const index = db.studentNotes.findIndex((n) => n.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  const removed = db.studentNotes.splice(index, 1);
  res.json({ success: true, message: 'Note deleted.', note: removed[0] });
});

// "Study with AI Guru from this Note"
app.post('/api/notebook/teach-from-note', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { noteId } = req.body;
    const note = db.studentNotes.find((n) => n.id === noteId);

    if (!note) {
      res.status(404).json({ error: 'Notebook note not found.' });
      return;
    }

    // Build prompt teaching student from this note
    const userPrompt = `नमस्ते AI Guru! मैंने अपनी नोटबुक में "${note.title}" के बारे में यह सामग्री लिखी/अपलोड की है:\n\n${note.content}\n\nकृपया मुझे इस सामग्री से बहुत आसान और चरणबद्ध (step-by-step) तरीके से पढ़ाइए, मुख्य सूत्रों और कॉन्सेप्ट्स को स्पष्ट कीजिए, और अंत में 1-2 प्रश्न पूछकर मेरा अभ्यास करवाइए।`;

    const convId = `conv_note_${Date.now()}`;
    const userMsg = {
      id: `msg_u_${Date.now()}`,
      conversationId: convId,
      sender: 'user' as const,
      content: `[मेरी नोटबुक से अध्ययन: "${note.title}"]\n\n${userPrompt}`,
      timestamp: new Date().toISOString(),
      language: user.preferredLanguage || 'hi',
    };

    const tutorResult = await generateTutorResponse({
      userId: user.id,
      userPrompt,
      preferredLanguage: (user.preferredLanguage || 'hi') as Language,
      depth: 'intermediate',
      subjectContext: note.subject,
    });

    const aiMsg = {
      id: `msg_ai_${Date.now()}`,
      conversationId: convId,
      sender: 'assistant' as const,
      content: tutorResult.content,
      timestamp: new Date().toISOString(),
      language: tutorResult.language,
      modelUsed: tutorResult.modelUsed,
      mathSolution: tutorResult.mathSolution,
      educationalDiagram: tutorResult.educationalDiagram || undefined,
      extractedLink: tutorResult.extractedLink || undefined,
      socraticHint: tutorResult.socraticHint || undefined,
      ragSources: tutorResult.ragSources,
      groundingConfidence: tutorResult.groundingConfidence,
    };

    const conversation: Conversation = {
      id: convId,
      userId: user.id,
      title: `नोटबुक अध्ययन: ${note.title}`,
      subject: note.subject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [userMsg, aiMsg],
    };

    db.conversations.unshift(conversation);

    res.json({ success: true, conversation, message: aiMsg, note });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to teach from note.' });
  }
});

// ----------------------------------------------------
// AI GURU CHAT & TUTOR ORCHESTRATOR
// ----------------------------------------------------
app.get('/api/conversations', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const userConvs = db.conversations
    .filter((c) => c.userId === user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  res.json({ conversations: userConvs });
});

app.get('/api/conversations/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const conv = db.conversations.find((c) => c.id === req.params.id && c.userId === user.id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found or access denied.' });
    return;
  }
  res.json({ conversation: conv });
});

app.delete('/api/conversations/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const index = db.conversations.findIndex((c) => c.id === req.params.id && c.userId === user.id);
  if (index === -1) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  db.conversations.splice(index, 1);
  res.json({ success: true, message: 'Conversation deleted.' });
});

app.post('/api/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const {
      conversationId,
      message,
      preferredLanguage = user.preferredLanguage || 'hi',
      depth = 'intermediate',
      subjectContext,
    } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message content cannot be empty.' });
      return;
    }

    let conversation = db.conversations.find((c) => c.id === conversationId && c.userId === user.id);

    if (!conversation) {
      // Auto-create new conversation
      const titlePrompt = message.trim().length > 38 ? message.trim().substring(0, 38) + '...' : message.trim();
      conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        title: titlePrompt,
        subject: subjectContext || 'General Tutoring',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      db.conversations.unshift(conversation);
    }

    // Add user message
    const userMsg = {
      id: `msg_u_${Date.now()}`,
      conversationId: conversation.id,
      sender: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
      language: preferredLanguage as Language,
    };
    conversation.messages.push(userMsg);

    // Call Tutor Orchestrator with RAG & Math integration
    const tutorResult = await generateTutorResponse({
      userId: user.id,
      userPrompt: message,
      preferredLanguage: preferredLanguage as Language,
      depth,
      subjectContext,
    });

    const aiMsg = {
      id: `msg_a_${Date.now()}`,
      conversationId: conversation.id,
      sender: 'assistant' as const,
      content: tutorResult.content,
      timestamp: new Date().toISOString(),
      language: tutorResult.language,
      modelUsed: tutorResult.modelUsed,
      mathSolution: tutorResult.mathSolution,
      educationalDiagram: tutorResult.educationalDiagram || undefined,
      extractedLink: tutorResult.extractedLink || undefined,
      socraticHint: tutorResult.socraticHint,
      ragSources: tutorResult.ragSources,
      groundingConfidence: tutorResult.groundingConfidence,
    };
    conversation.messages.push(aiMsg);
    conversation.updatedAt = new Date().toISOString();

    res.json({
      conversation,
      message: aiMsg,
      isDemoMode: tutorResult.isDemoMode,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Tutoring generation failed.' });
  }
});

// ----------------------------------------------------
// DOCUMENT KNOWLEDGE BASE & RAG
// ----------------------------------------------------
app.get('/api/documents', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const userDocs = db.documents.filter((d) => d.userId === user.id);
  res.json({ documents: userDocs });
});

app.post('/api/documents/upload', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { filename, fileContent, mimeType = 'text/plain', ocrApplied = false } = req.body;

    if (!filename || !fileContent) {
      res.status(400).json({ error: 'Filename and file content are required.' });
      return;
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const chunks = chunkDocumentText(docId, fileContent, filename.replace(/\.[^/.]+$/, ''));

    const newDoc: DocumentUpload = {
      id: docId,
      userId: user.id,
      filename: filename.trim(),
      fileSize: Buffer.byteLength(fileContent, 'utf8'),
      mimeType,
      status: 'indexed',
      extractedTextLength: fileContent.length,
      chunkCount: chunks.length,
      uploadedAt: new Date().toISOString(),
      chunks,
      ocrApplied: Boolean(ocrApplied),
    };

    db.documents.unshift(newDoc);

    db.auditLogs.push({
      id: `aud_${Date.now()}`,
      action: 'DOCUMENT_UPLOADED_INDEXED',
      userId: user.id,
      timestamp: new Date().toISOString(),
      details: `Indexed document '${filename}' with ${chunks.length} chunks.`,
    });

    res.status(201).json({ document: newDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Document processing failed.' });
  }
});

app.delete('/api/documents/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const index = db.documents.findIndex((d) => d.id === req.params.id && d.userId === user.id);
  if (index === -1) {
    res.status(404).json({ error: 'Document not found or access denied.' });
    return;
  }
  db.documents.splice(index, 1);
  res.json({ success: true, message: 'Document and its vector index deleted.' });
});

app.post('/api/documents/:id/ask', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { query } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Query is required.' });
    return;
  }
  const ragResult = searchUserKnowledgeBase(user.id, query, 3);
  res.json(ragResult);
});

// ----------------------------------------------------
// QUIZZES & ADAPTIVE ASSESSMENT
// ----------------------------------------------------
app.get('/api/quizzes', (req: Request, res: Response) => {
  res.json({ quizzes: db.quizzes });
});

app.get('/api/quizzes/:id', (req: Request, res: Response) => {
  const quiz = db.quizzes.find((q) => q.id === req.params.id);
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }
  res.json({ quiz });
});

app.post('/api/quizzes/generate', requireAuth, (req: Request, res: Response) => {
  try {
    const { subject = 'Mathematics', topic = 'Algebra', count = 5, difficulty = 'medium' } = req.body;

    // Generate balanced diagnostic questions
    const generatedQuiz: Quiz = {
      id: `qz_gen_${Date.now()}`,
      title: `${subject}: ${topic} Adaptive Mastery Test`,
      subject,
      topic,
      difficulty,
      timeLimitMinutes: Math.min(count * 2, 30),
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: `gq_1_${Date.now()}`,
          subject,
          topic,
          difficulty: 'easy',
          type: 'mcq',
          questionText: `Which fundamental principle governs basic calculations in ${topic}?`,
          options: [
            'A) Law of conservation of operations & order of precedence',
            'B) Arbitrary inversion without boundary constraints',
            'C) Independent state variables without reference',
            'D) Non-deterministic coefficient allocation',
          ],
          correctAnswer: 'A) Law of conservation of operations & order of precedence',
          explanation: 'Standard mathematical axioms require strict operator precedence and symmetric equality.',
          prerequisiteConcept: 'Foundational algebra & arithmetic order of operations',
        },
        {
          id: `gq_2_${Date.now()}`,
          subject,
          topic,
          difficulty: 'medium',
          type: 'mcq',
          questionText: `When simplifying a standard second-order relation in ${topic}, what determines the existence of real boundaries?`,
          options: [
            'A) The sign of the discriminant (D = b² - 4ac)',
            'B) The sum of arbitrary constants only',
            'C) The geometric mean of non-zero coefficients',
            'D) The parity of the independent variable',
          ],
          correctAnswer: 'A) The sign of the discriminant (D = b² - 4ac)',
          explanation: 'Real roots exist if and only if the radicand within the square root (the discriminant) is non-negative.',
          prerequisiteConcept: 'Quadratic Discriminant & Nature of Roots',
        },
        {
          id: `gq_3_${Date.now()}`,
          subject,
          topic,
          difficulty: 'hard',
          type: 'true_false',
          questionText: `Can a second-degree polynomial in ${topic} possess three distinct real roots?`,
          options: ['True', 'False'],
          correctAnswer: 'False',
          explanation: 'By the Fundamental Theorem of Algebra, a polynomial of degree n has exactly n complex roots (counted with multiplicity). A quadratic polynomial can have at most 2 roots unless it is identically zero.',
          prerequisiteConcept: 'Fundamental Theorem of Algebra & Degree of Polynomials',
        },
      ],
    };

    db.quizzes.push(generatedQuiz);
    res.status(201).json({ quiz: generatedQuiz });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Quiz generation failed.' });
  }
});

app.post('/api/quizzes/:id/submit', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { timeSpentSeconds, answers } = req.body;
    const attempt = scoreAndAnalyzeQuiz({
      quizId: req.params.id,
      userId: user.id,
      timeSpentSeconds: timeSpentSeconds || 60,
      answers: answers || [],
    });
    res.json({ attempt });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Quiz evaluation failed.' });
  }
});

app.get('/api/quiz-attempts', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const attempts = db.quizAttempts
    .filter((a) => a.userId === user.id)
    .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime());
  res.json({ attempts });
});

// ----------------------------------------------------
// PROGRESS, LEARNING GAPS & STUDY PLAN
// ----------------------------------------------------
app.get('/api/progress', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const mastery = db.topicMastery[user.id] || [];
  const attempts = db.quizAttempts.filter((a) => a.userId === user.id);
  const enrolledCourses = db.courses.filter((c) => c.isEnrolled);

  const totalQuizzes = attempts.length;
  const averageAccuracy = totalQuizzes > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.accuracyPercentage, 0) / totalQuizzes)
    : 0;

  const gapsCount = mastery.filter((m) => m.status === 'learning_gap').length;
  const masteredCount = mastery.filter((m) => m.status === 'mastered').length;

  res.json({
    enrolledCoursesCount: enrolledCourses.length,
    totalQuizzes,
    averageAccuracy,
    gapsCount,
    masteredCount,
    topicMastery: mastery,
    recentAttempts: attempts.slice(0, 5),
  });
});

app.get('/api/study-plan', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  let plan = db.studyPlans[user.id];
  if (!plan) {
    plan = {
      id: `stp_${user.id}`,
      userId: user.id,
      targetGoal: user.educationalLevel || 'Academic Distinction',
      targetDate: '2026-06-30',
      dailyHoursAvailable: 2.5,
      tasks: [],
      flashcards: [],
    };
    db.studyPlans[user.id] = plan;
  }
  res.json({ studyPlan: plan });
});

app.post('/api/study-plan/task/toggle', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { taskId } = req.body;
  const plan = db.studyPlans[user.id];
  if (!plan) {
    res.status(404).json({ error: 'Study plan not found.' });
    return;
  }
  const task = plan.tasks.find((t) => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  task.isCompleted = !task.isCompleted;
  res.json({ success: true, task });
});

app.post('/api/study-plan/flashcard/toggle', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { flashcardId } = req.body;
  const plan = db.studyPlans[user.id];
  if (!plan) {
    res.status(404).json({ error: 'Study plan not found.' });
    return;
  }
  const fc = plan.flashcards.find((f) => f.id === flashcardId);
  if (!fc) {
    res.status(404).json({ error: 'Flashcard not found.' });
    return;
  }
  fc.mastered = !fc.mastered;
  res.json({ success: true, flashcard: fc });
});

// ----------------------------------------------------
// EDUCATIONAL RESEARCH & GOVERNANCE PIPELINE
// ----------------------------------------------------
app.get('/api/admin/research-jobs', requireAuth, (req: Request, res: Response) => {
  res.json({ jobs: db.researchJobs });
});

app.post('/api/admin/research-jobs', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { targetUrl, sourceName, resourceType } = req.body;
    if (!targetUrl || !sourceName) {
      res.status(400).json({ error: 'targetUrl and sourceName are required.' });
      return;
    }

    const job = await runEducationalResearchDiscovery({
      targetUrl,
      sourceName,
      resourceType: resourceType || 'textbook',
      adminUserId: user.name,
    });

    res.status(201).json({ job });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Research ingestion failed.' });
  }
});

app.post('/api/admin/content/:id/approve', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { notes } = req.body;
    const updated = reviewResearchJob(req.params.id, 'approved', user.name, notes || '');
    res.json({ success: true, job: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/content/:id/reject', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { notes } = req.body;
    const updated = reviewResearchJob(req.params.id, 'rejected', user.name, notes || '');
    res.json({ success: true, job: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', requireAuth, (req: Request, res: Response) => {
  res.json({ logs: db.auditLogs.slice(-50).reverse() });
});

// ----------------------------------------------------
// DEDICATED BACKEND ADMIN & SWAGGER / OPENAPI PORTAL
// ----------------------------------------------------
app.get('/admin', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderAdminPortalHtml());
});

app.get('/api/admin/docs', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderAdminPortalHtml());
});

app.get('/api/admin/courses', requireAuth, (_req: Request, res: Response) => {
  res.json({ courses: db.courses });
});

app.post('/api/admin/courses', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const {
    title,
    category = 'competitive',
    level = 'General',
    boardOrExam = 'National Exam',
    description = '',
    thumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    chapters = [],
  } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Course title is required.' });
    return;
  }

  const newCourse: Course = {
    id: `crs_${Date.now()}`,
    title: title.trim(),
    category,
    level,
    boardOrExam,
    description: description.trim() || 'Comprehensive course published via backend admin portal.',
    thumbnail: thumbnail.trim(),
    chaptersCount: chapters.length || 1,
    enrolledStudentsCount: 0,
    isEnrolled: false,
    teacherId: user.id || 'usr_admin_1',
    teacherName: user.name || 'Academic Administrator',
    teacherTitle: 'Course Curriculum Director',
    teacherAvatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    chapters: chapters.length > 0 ? chapters : [
      {
        id: `ch_${Date.now()}_1`,
        courseId: `crs_${Date.now()}`,
        title: 'Chapter 1: Foundational Theory & Syllabus Overview',
        sequence: 1,
        learningObjectives: ['Master fundamental principles', 'Solve key examples'],
        topics: [
          {
            id: `top_${Date.now()}_1`,
            title: 'Introduction & Core Concepts',
            difficulty: 'intermediate',
            summary: 'Comprehensive foundational overview and essential formulas.',
            formulas: [],
            keyPoints: ['Review definitions', 'Practice standard problems'],
          },
        ],
      },
    ],
    videoLectures: [],
    liveClasses: [],
    courseQuizzes: [],
  };

  db.courses.unshift(newCourse);

  db.auditLogs.push({
    id: `aud_${Date.now()}`,
    action: 'COURSE_CREATED_BY_ADMIN',
    userId: user.id || 'admin',
    timestamp: new Date().toISOString(),
    details: `Admin ${user.name || 'Administrator'} published course: "${newCourse.title}" (ID: ${newCourse.id})`,
  });

  res.status(201).json({ success: true, course: newCourse });
});

app.delete('/api/admin/courses/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const index = db.courses.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  const removed = db.courses.splice(index, 1)[0];

  db.auditLogs.push({
    id: `aud_${Date.now()}`,
    action: 'COURSE_DELETED_BY_ADMIN',
    userId: user.id || 'admin',
    timestamp: new Date().toISOString(),
    details: `Admin ${user.name || 'Administrator'} permanently deleted course: "${removed.title}" (ID: ${removed.id})`,
  });

  res.json({ success: true, message: 'Course deleted successfully.', course: removed });
});

// ----------------------------------------------------
// MODEL STATUS & HARDWARE PROFILER
// ----------------------------------------------------
app.get('/api/model-status', async (_req: Request, res: Response) => {
  try {
    const status = await getModelRuntimeStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'AI Guru - Inclusive Multilingual AI Learning Platform',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: 'In-Memory State Store (Postgres / SQLite contract compatible)',
    modelAdapter: 'Open-Weight / Multi-Provider Modular Router',
  });
});

// ----------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION SERVING
// ----------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[AI Guru] Vite middlewares mounted in dev mode.');
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Guru Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

// Only start standalone HTTP server when not in a serverless environment (like Vercel)
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('[AI Guru Server] Fatal startup error:', err);
    process.exit(1);
  });
}

export default app;
export { app };
