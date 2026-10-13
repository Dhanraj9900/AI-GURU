export type Role = 'student' | 'teacher' | 'admin';

export type Language = 'en' | 'hi' | 'hinglish' | 'mr' | 'ta' | 'te';

export type DegreeLevel = 'graduate' | 'postgraduate' | 'phd';

export interface TeacherDegree {
  degreeLevel: DegreeLevel;
  degreeName: string; // e.g. "B.Tech Computer Science", "M.Sc Mathematics", "PhD in Physics"
  institution: string; // University / College Name
  graduationYear: string; // Passing Year
  specialization?: string; // Subject / Major
  documentName: string; // Uploaded degree certificate filename
  documentUrl?: string; // Document data/preview URL
  verified: boolean;
  verifiedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  preferredLanguage: Language;
  educationalLevel: string;
  avatar?: string;
  createdAt: string;
  teacherDegree?: TeacherDegree;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface VideoLectureItem {
  id: string;
  courseId: string;
  title: string;
  platform: 'youtube' | 'uploaded' | 'vimeo' | 'stream';
  url: string;
  duration?: string;
  description?: string;
  notes?: string;
  chapterTitle?: string;
  uploadedAt?: string;
}

export interface LiveClassChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  message: string;
  timestamp: string;
}

export interface LiveClass {
  id: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  title: string;
  description: string;
  scheduledTime: string; // ISO or human readable
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'completed';
  meetingRoomId: string;
  streamUrl?: string;
  attendeesCount: number;
  chatMessages: LiveClassChatMessage[];
  agenda?: string[];
}

export interface StudentNotebookNote {
  id: string;
  userId: string;
  title: string;
  subject: string;
  tags: string[];
  content: string;
  fileAttachment?: {
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  };
  keyConcepts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  category: 'school' | 'competitive' | 'engineering' | 'undergrad' | 'postgrad' | 'skills';
  level: string;
  boardOrExam: string;
  description: string;
  thumbnail: string;
  chaptersCount: number;
  enrolledStudentsCount: number;
  chapters: Chapter[];
  isEnrolled?: boolean;
  teacherId?: string;
  teacherName?: string;
  teacherAvatar?: string;
  teacherTitle?: string;
  recommendedBooks?: { title: string; author: string; role: string; link?: string }[];
  videoLectures?: VideoLectureItem[];
  liveClasses?: LiveClass[];
  courseQuizzes?: Quiz[];
  referenceTools?: { title: string; type: string; url: string; description: string }[];
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  sequence: number;
  learningObjectives: string[];
  topics: Topic[];
  recommendedBooks?: { title: string; author: string; role: string }[];
  videoLectures?: { title: string; platform: string; url: string }[];
  referenceTools?: { title: string; type: string; url: string }[];
}

export interface Topic {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  summary: string;
  formulas?: string[];
  keyPoints?: string[];
  diagramType?: string;
}

export interface EducationalDiagram {
  id: string;
  type: 'parabola' | 'free_body' | 'pulley' | 'cell_structure' | 'dna_helix' | 'binary_tree' | 'lens_optics' | 'electric_circuit' | 'benzene_ring';
  title: string;
  caption: string;
  subject: string;
  labels?: { text: string; description: string; color?: string }[];
  parameters?: Record<string, any>;
}

export interface ExtractedLinkData {
  url: string;
  type: 'youtube' | 'web';
  domain: string;
  title: string;
  authorOrChannel?: string;
  thumbnail?: string;
  videoId?: string;
  summaryOrContent: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: Language;
  ragSources?: RagSourceCitation[];
  mathSolution?: MathSolution;
  educationalDiagram?: EducationalDiagram;
  extractedLink?: ExtractedLinkData;
  socraticHint?: string;
  groundingConfidence?: number;
  modelUsed?: string;
}

export interface RagSourceCitation {
  documentId: string;
  documentTitle: string;
  pageOrSection: string;
  snippet: string;
  similarityScore: number;
}

export interface MathSolution {
  originalExpression: string;
  steps: string[];
  finalResult: string;
  engine: 'SymPy Deterministic Engine' | 'Numerical Tool';
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface DocumentUpload {
  id: string;
  userId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  status: 'processing' | 'indexed' | 'failed';
  extractedTextLength: number;
  chunkCount: number;
  uploadedAt: string;
  chunks: DocumentChunk[];
  ocrApplied?: boolean;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  section: string;
  text: string;
  tokenCount: number;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'mcq' | 'true_false' | 'fill_blank' | 'numerical';
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  prerequisiteConcept?: string;
}

export interface Quiz {
  id: string;
  courseId?: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitMinutes?: number;
  questions: Question[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  score: number;
  totalQuestions: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  submittedAnswers: {
    questionId: string;
    studentAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  topicBreakdown: {
    topic: string;
    total: number;
    correct: number;
    accuracy: number;
    learningGapDetected: boolean;
    remedialAction: string;
  }[];
  attemptedAt: string;
}

export interface TopicMastery {
  topic: string;
  subject: string;
  level: number; // 0 - 100
  status: 'mastered' | 'developing' | 'learning_gap';
  attemptsCount: number;
  lastPracticed: string;
  prerequisiteGap?: string;
  recommendedAction: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  targetGoal: string;
  targetDate: string;
  dailyHoursAvailable: number;
  tasks: StudyTask[];
  flashcards: Flashcard[];
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  date: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Flashcard {
  id: string;
  subject: string;
  topic: string;
  question: string;
  answer: string;
  mastered: boolean;
}

export interface EducationalResearchJob {
  id: string;
  sourceDomain: string;
  sourceName: string;
  resourceType: 'syllabus' | 'textbook' | 'practice_set' | 'lecture_notes';
  url: string;
  authorityScore: number;
  license: string;
  status: 'discovered' | 'verified' | 'extracted' | 'pending_review' | 'approved' | 'rejected';
  retrievedAt: string;
  extractedTitle: string;
  extractedSummary: string;
  reviewNotes?: string;
  reviewedBy?: string;
}

export interface ModelRuntimeStatus {
  activeAdapter: 'local_qwen3' | 'gemini_api' | 'educational_rule_engine';
  adapterName: string;
  isModelReady: boolean;
  hardwareProfile: {
    targetSystem: string;
    systemRam: string;
    memoryAllocated: string;
    avgLatencyMs: number;
    recommendedModel: string;
    openWeightSupport: boolean;
  };
  supportedLanguages: {
    code: Language;
    name: string;
    vernacular: string;
    readiness: 'High' | 'Production' | 'Beta';
  }[];
  ragEmbeddingModel: string;
  deterministicMathEngine: string;
}
