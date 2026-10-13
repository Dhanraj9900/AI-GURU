import React, { useState, useEffect } from 'react';
import { Course, Chapter, LiveClass, Quiz, VideoLectureItem } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { LiveClassRoom } from '../live/LiveClassRoom.tsx';
import {
  GraduationCap,
  Plus,
  Video,
  Radio,
  FileQuestion,
  Users,
  BookOpen,
  CheckCircle2,
  Trash2,
  Edit,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  BarChart,
  HelpCircle,
  Play,
  Calendar,
  X,
  Share2,
} from 'lucide-react';

interface TeacherDashboardProps {
  onCourseSelect?: (course: Course) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onCourseSelect }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'lectures' | 'live' | 'quizzes' | 'students'>('courses');
  const [activeLiveRoom, setActiveLiveRoom] = useState<LiveClass | null>(null);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Selected course for adding lecture or live class
  const [targetCourseId, setTargetCourseId] = useState<string>('');

  // Course Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState<'school' | 'competitive' | 'engineering' | 'undergrad' | 'skills'>('school');
  const [courseLevel, setCourseLevel] = useState('Secondary (Class 10)');
  const [courseBoard, setCourseBoard] = useState('CBSE & State Boards');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80');

  // Lecture Form State
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureUrl, setLectureUrl] = useState('');
  const [lecturePlatform, setLecturePlatform] = useState<'youtube' | 'uploaded' | 'stream'>('youtube');
  const [lectureDuration, setLectureDuration] = useState('35 mins');
  const [lectureDescription, setLectureDescription] = useState('');
  const [lectureNotes, setLectureNotes] = useState('');

  // Live Class Form State
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [liveDuration, setLiveDuration] = useState(60);
  const [liveStreamUrl, setLiveStreamUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [liveAgendaText, setLiveAgendaText] = useState('1. Concept Introduction\n2. Real-world Examples\n3. Student Q&A');

  // Quiz Form State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState(15);
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['Option A', 'Option B', 'Option C', 'Option D']);
  const [qCorrect, setQCorrect] = useState('Option A');
  const [qExplanation, setQExplanation] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, liveRes] = await Promise.all([
        api.getCourses(),
        api.getLiveClasses(),
      ]);
      setCourses(coursesRes.courses);
      setLiveClasses(liveRes.liveClasses);
      if (coursesRes.courses.length > 0 && !targetCourseId) {
        setTargetCourseId(coursesRes.courses[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;
    setSaving(true);
    try {
      const res = await api.createCourse({
        title: courseTitle.trim(),
        category: courseCategory,
        level: courseLevel,
        boardOrExam: courseBoard,
        description: courseDescription.trim(),
        thumbnail: courseThumbnail.trim(),
        chapters: [
          {
            id: `ch_${Date.now()}_1`,
            courseId: `crs_${Date.now()}`,
            title: 'Chapter 1: Foundational Concepts & Core Theory',
            sequence: 1,
            learningObjectives: ['Master fundamental definitions', 'Understand practical applications'],
            topics: [
              {
                id: `top_${Date.now()}_1`,
                title: 'Core Fundamentals',
                difficulty: 'easy',
                summary: 'Comprehensive introduction by the instructor.',
                formulas: [],
                keyPoints: ['Review class notes', 'Practice exercises'],
              },
            ],
          },
        ],
      });
      setCourses([res.course, ...courses]);
      setTargetCourseId(res.course.id);
      setShowCourseModal(false);
      // Reset form
      setCourseTitle('');
      setCourseDescription('');
    } catch (err: any) {
      alert(err.message || 'Course creation failed');
    } finally {
      setSaving(false);
    }
  };

  // 2. Add Lecture
  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureTitle.trim() || !lectureUrl.trim() || !targetCourseId) return;
    setSaving(true);
    try {
      const res = await api.addLecture(targetCourseId, {
        title: lectureTitle.trim(),
        url: lectureUrl.trim(),
        platform: lecturePlatform,
        duration: lectureDuration,
        description: lectureDescription.trim(),
        notes: lectureNotes.trim(),
      });
      setCourses(courses.map((c) => (c.id === targetCourseId ? res.course : c)));
      setShowLectureModal(false);
      setLectureTitle('');
      setLectureUrl('');
      setLectureDescription('');
      setLectureNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to add lecture');
    } finally {
      setSaving(false);
    }
  };

  // 3. Schedule / Launch Live Class
  const handleCreateLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle.trim() || !targetCourseId) return;
    setSaving(true);
    const agenda = liveAgendaText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    try {
      const res = await api.createLiveClass(targetCourseId, {
        title: liveTitle.trim(),
        description: liveDescription.trim(),
        durationMinutes: liveDuration,
        status: 'live',
        streamUrl: liveStreamUrl.trim(),
        agenda,
      });
      setLiveClasses([res.liveClass, ...liveClasses]);
      setShowLiveModal(false);
      setActiveLiveRoom(res.liveClass);
      setLiveTitle('');
      setLiveDescription('');
    } catch (err: any) {
      alert(err.message || 'Failed to start live class');
    } finally {
      setSaving(false);
    }
  };

  // 4. Create Quiz for Course
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || !qText.trim() || !targetCourseId) return;
    setSaving(true);
    try {
      const res = await api.createCourseQuiz(targetCourseId, {
        title: quizTitle.trim(),
        topic: quizTopic.trim() || 'Comprehensive Diagnostic Test',
        difficulty: quizDifficulty,
        timeLimitMinutes: quizTimeLimit,
        questions: [
          {
            id: `q_${Date.now()}_1`,
            subject: 'Course Assessment',
            topic: quizTopic || 'Core Test',
            difficulty: quizDifficulty,
            type: 'mcq',
            questionText: qText.trim(),
            options: qOptions,
            correctAnswer: qCorrect,
            explanation: qExplanation.trim() || 'Verified by course instructor.',
          },
        ],
      });
      setCourses(courses.map((c) => (c.id === targetCourseId ? res.course : c)));
      setShowQuizModal(false);
      setQuizTitle('');
      setQuizTopic('');
      setQText('');
      setQExplanation('');
      alert('Quiz & Test created successfully and linked to the course!');
    } catch (err: any) {
      alert(err.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course and all associated lectures?')) return;
    try {
      await api.deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Total statistics calculation
  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0);
  const totalLectures = courses.reduce((acc, c) => acc + (c.videoLectures?.length || 0), 0);
  const totalLiveClasses = liveClasses.length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Profile */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-900/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Teacher Studio & Faculty Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              Verified Instructor
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Educator'}!
          </h2>
          {user?.teacherDegree && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {user.teacherDegree.degreeName} · {user.teacherDegree.institution} ({user.teacherDegree.graduationYear})
                </span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 text-xs font-medium border border-indigo-400/30 flex items-center gap-1">
                📜 {user.teacherDegree.documentName} [प्रमाणित डिग्री]
              </span>
            </div>
          )}
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Upload and manage your complete courses, publish video lectures, host interactive live classes, and create live assessment quizzes for your students.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setShowCourseModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Course</span>
          </button>

          <button
            onClick={() => {
              if (courses.length === 0) {
                alert('Please upload a course first before scheduling a live class.');
                return;
              }
              setShowLiveModal(true);
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Start Live Class</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Courses Published
          </div>
          <div className="text-2xl font-black text-slate-900">{courses.length}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            Total Enrolled Learners
          </div>
          <div className="text-2xl font-black text-slate-900">{totalEnrolled.toLocaleString()}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Video className="w-4 h-4 text-blue-600" />
            Video Lectures
          </div>
          <div className="text-2xl font-black text-slate-900">{totalLectures}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-rose-600" />
            Live Classes
          </div>
          <div className="text-2xl font-black text-slate-900">{totalLiveClasses}</div>
        </div>
      </div>

      {/* Segmented Studio Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { id: 'courses', label: 'Course Catalog & Management', icon: BookOpen },
          { id: 'lectures', label: 'Video Lectures Uploader', icon: Video },
          { id: 'live', label: 'Live Classes Studio', icon: Radio },
          { id: 'quizzes', label: 'Live Tests & Quizzes', icon: FileQuestion },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COURSES MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Your Published Courses ({courses.length})
            </h3>
            <button
              onClick={() => setShowCourseModal(true)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              + Create Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                      {course.category}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      {course.level} • {course.boardOrExam}
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{course.chapters?.length || 0} Chapters</span>
                      <span className="font-semibold text-emerald-600">
                        {course.enrolledStudentsCount} Enrolled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setTargetCourseId(course.id);
                        setShowLectureModal(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer"
                      title="Add video lecture"
                    >
                      + Lecture
                    </button>
                    <button
                      onClick={() => {
                        setTargetCourseId(course.id);
                        setShowLiveModal(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-slate-200 text-rose-700 rounded-lg text-xs font-semibold cursor-pointer"
                      title="Host live class"
                    >
                      + Live
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VIDEO LECTURES UPLOADER */}
      {activeTab === 'lectures' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Course Video Lectures Library
              </h3>
              <p className="text-xs text-slate-500">
                Upload video lectures, set durations, and provide downloadable notes for enrolled students.
              </p>
            </div>

            <button
              onClick={() => setShowLectureModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Video Lecture</span>
            </button>
          </div>

          {/* Select Target Course */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Filter by Course:</span>
            <select
              value={targetCourseId}
              onChange={(e) => setTargetCourseId(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Lectures List for Target Course */}
          {(() => {
            const course = courses.find((c) => c.id === targetCourseId);
            const lectures = course?.videoLectures || [];

            if (lectures.length === 0) {
              return (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
                  <Video className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-700">No video lectures yet</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Add YouTube or streaming video lecture links so enrolled students can watch them anytime.
                  </p>
                  <button
                    onClick={() => setShowLectureModal(true)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Add Lecture Now
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lectures.map((lec, idx) => (
                  <div
                    key={lec.id || idx}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase text-[10px]">
                          {lec.platform || 'YouTube'}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {lec.duration || '30 mins'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">{lec.title}</h4>
                      {lec.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {lec.description}
                        </p>
                      )}

                      {/* Video Embed Preview */}
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                        {lec.url.includes('youtube') ? (
                          <iframe
                            src={lec.url.replace('watch?v=', 'embed/')}
                            title={lec.title}
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            <Play className="w-8 h-8 text-white/60 mb-1" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={lec.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Video Link
                      </a>

                      <button
                        onClick={async () => {
                          if (!confirm('Remove this lecture?')) return;
                          await api.deleteLecture(targetCourseId, lec.id);
                          loadData();
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: LIVE CLASSES STUDIO */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Live Interactive Classes</h3>
              <p className="text-xs text-slate-500">
                Broadcast live sessions, teach with digital blackboard, and chat with your students in real time.
              </p>
            </div>

            <button
              onClick={() => setShowLiveModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Launch Live Class Room</span>
            </button>
          </div>

          {liveClasses.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
              <Radio className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No live classes scheduled</div>
              <p className="text-xs text-slate-500">
                Create a live class to interact directly with your enrolled students.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveClasses.map((cls) => {
                const isLive = cls.status === 'live';

                return (
                  <div
                    key={cls.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isLive
                        ? 'bg-rose-50/40 border-rose-300 shadow-md ring-1 ring-rose-200'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            isLive
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Radio className="w-3 h-3" />
                          {isLive ? 'LIVE NOW' : cls.status.toUpperCase()}
                        </span>

                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          {cls.attendeesCount} Students
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900">{cls.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {cls.description}
                      </p>

                      <div className="text-xs text-slate-400 font-mono">
                        Course: {cls.courseTitle}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setActiveLiveRoom(cls)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isLive
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Enter Broadcast Studio</span>
                      </button>

                      <span className="text-xs text-slate-500 font-medium">
                        {cls.durationMinutes} Minutes
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LIVE TESTS & QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Course Assessment & Live Quizzes</h3>
              <p className="text-xs text-slate-500">
                Design chapter quizzes and diagnostic tests. Enrolled students can take tests and view immediate score reports.
              </p>
            </div>

            <button
              onClick={() => setShowQuizModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course Test</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Diagnostic & Course Practice Quizzes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courses.flatMap((c) => c.courseQuizzes || []).length === 0 ? (
                <div className="col-span-2 text-center p-6 text-slate-500 text-xs">
                  No customized course quizzes created yet. Click "+ Create Course Test" above.
                </div>
              ) : (
                courses.flatMap((c) => c.courseQuizzes || []).map((q) => (
                  <div
                    key={q.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold uppercase">
                        {q.difficulty}
                      </span>
                      <span className="text-slate-400">{q.timeLimitMinutes || 20} mins limit</span>
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">{q.title}</h5>
                    <p className="text-xs text-slate-500">Topic: {q.topic}</p>
                    <div className="text-[11px] text-emerald-600 font-semibold">
                      {q.questions.length} Questions included
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE COURSE */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Upload New Course</h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Class 12 Physics: Optics & Wave Mechanics"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="school">School (Classes 1–12)</option>
                    <option value="competitive">Competitive (JEE / NEET / UPSC)</option>
                    <option value="engineering">B.Tech Engineering</option>
                    <option value="undergrad">Undergrad / College</option>
                    <option value="skills">Professional Skills</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Board / Exam</label>
                  <input
                    type="text"
                    value={courseBoard}
                    onChange={(e) => setCourseBoard(e.target.value)}
                    placeholder="e.g. CBSE / JEE Main"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Level</label>
                <input
                  type="text"
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value)}
                  placeholder="e.g. Senior Secondary (Class 12)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Description *</label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Explain syllabus scope, learning outcomes, and student prerequisites..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={courseThumbnail}
                  onChange={(e) => setCourseThumbnail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {saving ? 'Creating Course...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD VIDEO LECTURE */}
      {showLectureModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Upload Video Lecture</h3>
              <button
                onClick={() => setShowLectureModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Course *</label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lecture Title *</label>
                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="e.g. Lecture 3: Sridharacharya Formula & Proof"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video URL (YouTube or Stream) *</label>
                <input
                  type="url"
                  value={lectureUrl}
                  onChange={(e) => setLectureUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={lectureDuration}
                    onChange={(e) => setLectureDuration(e.target.value)}
                    placeholder="e.g. 45 mins"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
                  <select
                    value={lecturePlatform}
                    onChange={(e) => setLecturePlatform(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="uploaded">Uploaded MP4</option>
                    <option value="stream">Direct Stream</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Key Points</label>
                <textarea
                  rows={3}
                  value={lectureDescription}
                  onChange={(e) => setLectureDescription(e.target.value)}
                  placeholder="Summary of concepts explained in this video..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLectureModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {saving ? 'Adding Lecture...' : 'Add Video Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: START LIVE CLASS */}
      {showLiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                Start Live Class Room
              </h3>
              <button
                onClick={() => setShowLiveModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLiveClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Course *</label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Live Session Title *</label>
                <input
                  type="text"
                  value={liveTitle}
                  onChange={(e) => setLiveTitle(e.target.value)}
                  placeholder="e.g. 🔴 LIVE Doubt Clearing & Problem Solving Masterclass"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Description</label>
                <textarea
                  rows={2}
                  value={liveDescription}
                  onChange={(e) => setLiveDescription(e.target.value)}
                  placeholder="Briefly state what will be covered in this live session..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Agenda (1 item per line)</label>
                <textarea
                  rows={3}
                  value={liveAgendaText}
                  onChange={(e) => setLiveAgendaText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLiveModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{saving ? 'Launching...' : 'Go Live Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE QUIZ / LIVE TEST */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Create Live Test & Quiz</h3>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course *</label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Test Title *</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Diagnostic Live Test"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="e.g. Nature of Roots & Factorization"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Limit (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={quizTimeLimit}
                    onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Question 1 details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-indigo-700">Sample / Initial Question:</span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Question Text *</label>
                  <input
                    type="text"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="e.g. If D = b² - 4ac = 0 in ax² + bx + c = 0, what is the nature of the roots?"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {qOptions.map((opt, i) => (
                    <div key={i}>
                      <label className="block text-[10px] text-slate-500">Option {String.fromCharCode(65 + i)}</label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...qOptions];
                          updated[i] = e.target.value;
                          setQOptions(updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Correct Option</label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  >
                    {qOptions.map((opt, i) => (
                      <option key={i} value={opt}>
                        Option {String.fromCharCode(65 + i)}: {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Step-by-step Solution Explanation</label>
                  <textarea
                    rows={2}
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="Explain why this option is correct..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Publish Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Live Room Modal */}
      {activeLiveRoom && (
        <LiveClassRoom
          liveClass={activeLiveRoom}
          onClose={() => setActiveLiveRoom(null)}
          onClassUpdated={(updated) => {
            setLiveClasses(liveClasses.map((c) => (c.id === updated.id ? updated : c)));
          }}
        />
      )}
    </div>
  );
};
