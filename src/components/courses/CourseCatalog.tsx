import React, { useState, useEffect } from 'react';
import { Course, Chapter, LiveClass, VideoLectureItem, Quiz } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { LiveClassRoom } from '../live/LiveClassRoom.tsx';
import {
  GraduationCap,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Users,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowLeft,
  Video,
  Radio,
  FileQuestion,
  Play,
  ExternalLink,
  Shield,
  Award,
} from 'lucide-react';

interface CourseCatalogProps {
  onStartChapterInChat: (course: Course, chapter: Chapter) => void;
  onOpenQuiz?: (quiz: Quiz) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  onStartChapterInChat,
  onOpenQuiz,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [detailTab, setDetailTab] = useState<'syllabus' | 'lectures' | 'live' | 'quizzes' | 'books'>('syllabus');

  // Active video player state
  const [activeLecture, setActiveLecture] = useState<VideoLectureItem | null>(null);

  // Active live room state
  const [activeLiveClass, setActiveLiveClass] = useState<LiveClass | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.getCourses(selectedCategory === 'all' ? undefined : selectedCategory, search);
      setCourses(res.courses);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, search]);

  const handleEnroll = async (courseId: string) => {
    try {
      const res = await api.enrollCourse(courseId);
      setCourses(courses.map((c) => (c.id === courseId ? res.course : c)));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(res.course);
      }
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    }
  };

  const handleUnenroll = async (courseId: string) => {
    try {
      const res = await api.unenrollCourse(courseId);
      setCourses(courses.map((c) => (c.id === courseId ? res.course : c)));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(res.course);
      }
    } catch (err: any) {
      alert(err.message || 'Unenrollment failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              Student Courses & Faculty Syllabi
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Teacher Courses & Live Academic Classes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enroll in structured courses curated by teachers. Watch video lectures, join interactive live classes, and take chapter-wise live quizzes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, teachers, topics, exams..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Category Segmented Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
        {[
          { id: 'all', label: 'All Courses' },
          { id: 'gate', label: '🎯 GATE DA (Data Science & AI)' },
          { id: 'competitive', label: 'Competitive (JEE / NEET / UPSC)' },
          { id: 'engineering', label: 'B.Tech Engineering & CS' },
          { id: 'school', label: 'Classes 1–12 (School & Boards)' },
          { id: 'skills', label: 'Professional Skills' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedCategory(tab.id);
              setSelectedCourse(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content: Course List OR Course Detail */}
      {!selectedCourse ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              No courses match your search or filter.
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  course.id === 'crs_gate_da'
                    ? 'border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80 hover:border-indigo-200'
                }`}
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                      {course.boardOrExam}
                    </div>

                    {course.id === 'crs_gate_da' && (
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-indigo-900/90 backdrop-blur-xs text-amber-300 text-[10px] font-extrabold shadow-md flex items-center gap-1.5 border border-indigo-400/30">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        GATE DA 2026 Official Syllabus
                      </div>
                    )}

                    {course.isEnrolled && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3 h-3" />
                        Enrolled
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-600 uppercase tracking-wider">
                        {course.level}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {course.chapters?.length || course.chaptersCount} Chapters
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Teacher profile badge */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <img
                        src={
                          course.teacherAvatar ||
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={course.teacherName || 'Teacher'}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <div className="text-[11px] truncate">
                        <span className="text-slate-500">Instructor: </span>
                        <span className="font-bold text-slate-800">
                          {course.teacherName || 'Dr. Priya Raman'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Feature badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                      {course.videoLectures && course.videoLectures.length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {course.videoLectures.length} Lectures
                        </span>
                      )}
                      {course.liveClasses && course.liveClasses.length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" />
                          Live Classes
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrolledStudentsCount} Learners
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card footer with 1-click enroll & view syllabus */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setDetailTab('syllabus');
                      setActiveLecture(course.videoLectures?.[0] || null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <span>View Syllabus & Lectures</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {course.isEnrolled ? (
                    <button
                      onClick={() => handleUnenroll(course.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 rounded cursor-pointer"
                    >
                      Unenroll
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      Enroll Free
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* COURSE DETAIL VIEW */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedCourse(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Courses
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Syllabus & Tabs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Title and Header */}
              <div className="space-y-3 bg-white p-6 border border-slate-200 rounded-2xl shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {selectedCourse.level} • {selectedCourse.boardOrExam}
                  </span>
                  {selectedCourse.isEnrolled && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Enrolled
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900">{selectedCourse.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedCourse.description}</p>

                {/* Teacher Profile Banner */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <img
                    src={
                      selectedCourse.teacherAvatar ||
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={selectedCourse.teacherName || 'Faculty'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {selectedCourse.teacherName || 'Dr. Priya Raman'}
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="text-xs text-slate-500">
                      {selectedCourse.teacherTitle || 'Senior Academic Faculty & Mentor'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-tabs: Syllabus, Video Lectures, Live Classes, Quizzes, Books */}
              <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
                {[
                  { id: 'syllabus', label: 'Syllabus & Chapters', icon: Layers },
                  { id: 'lectures', label: `Video Lectures (${selectedCourse.videoLectures?.length || 0})`, icon: Video },
                  { id: 'live', label: 'Live Classes', icon: Radio },
                  { id: 'quizzes', label: 'Tests & Quizzes', icon: FileQuestion },
                  { id: 'books', label: 'Reference Books', icon: BookOpen },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = detailTab === t.id;

                  return (
                    <button
                      key={t.id}
                      onClick={() => setDetailTab(t.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-bold text-xs whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB CONTENT 1: SYLLABUS */}
              {detailTab === 'syllabus' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Syllabus Chapters ({selectedCourse.chapters.length})
                  </h4>

                  <div className="space-y-3">
                    {selectedCourse.chapters.map((chap, cIdx) => (
                      <div
                        key={chap.id}
                        className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">
                              Chapter {cIdx + 1}
                            </span>
                            <h5 className="font-bold text-base text-slate-900">{chap.title}</h5>
                          </div>

                          <button
                            onClick={() => onStartChapterInChat(selectedCourse, chap)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Learn with AI Guru
                          </button>
                        </div>

                        {/* Objectives */}
                        <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-700">Learning Objectives:</span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5 mt-1">
                            {chap.learningObjectives.map((obj, oIdx) => (
                              <li key={oIdx}>{obj}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Topic Highlights */}
                        {chap.topics && chap.topics.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
                            {chap.topics.map((t) => (
                              <div
                                key={t.id}
                                className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-1 flex-1 min-w-[200px]"
                              >
                                <span className="font-bold text-slate-900 block">{t.title}</span>
                                <span className="text-slate-500 text-[10px] block">{t.summary}</span>
                                {t.formulas && t.formulas.length > 0 && (
                                  <div className="font-mono text-[10px] text-indigo-700 pt-1">
                                    Formulas: {t.formulas.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: VIDEO LECTURES */}
              {detailTab === 'lectures' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-600" />
                      Recorded Video Lectures
                    </h4>
                  </div>

                  {/* Active Player */}
                  {activeLecture ? (
                    <div className="p-4 bg-slate-900 rounded-2xl space-y-3 text-white">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                        <iframe
                          src={activeLecture.url.replace('watch?v=', 'embed/')}
                          title={activeLecture.title}
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base">{activeLecture.title}</h4>
                        <span className="text-xs text-indigo-400 font-mono">{activeLecture.duration}</span>
                      </div>
                      {activeLecture.description && (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {activeLecture.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
                      No lecture selected. Pick a lecture below to start watching.
                    </div>
                  )}

                  {/* Lectures list */}
                  <div className="space-y-2">
                    {selectedCourse.videoLectures && selectedCourse.videoLectures.length > 0 ? (
                      selectedCourse.videoLectures.map((lec, idx) => (
                        <div
                          key={lec.id || idx}
                          onClick={() => setActiveLecture(lec)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            activeLecture?.id === lec.id
                              ? 'bg-indigo-50 border-indigo-300 shadow-2xs ring-1 ring-indigo-200'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                              <Play className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900">{lec.title}</h5>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {lec.duration || '30 mins'}
                              </span>
                            </div>
                          </div>

                          <button className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-indigo-600 rounded-lg hover:bg-slate-50">
                            Watch Lecture
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500">
                        Instructor is currently preparing video lectures for this course.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT 3: LIVE CLASSES */}
              {detailTab === 'live' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-rose-600" />
                    Teacher Live Interactive Classes
                  </h4>

                  {selectedCourse.liveClasses && selectedCourse.liveClasses.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCourse.liveClasses.map((cls) => {
                        const isLive = cls.status === 'live';

                        return (
                          <div
                            key={cls.id}
                            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                              isLive
                                ? 'bg-rose-50/50 border-rose-300 shadow-sm ring-1 ring-rose-200'
                                : 'bg-white border-slate-200 shadow-2xs'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    isLive
                                      ? 'bg-rose-600 text-white animate-pulse'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {isLive ? '🔴 LIVE NOW' : 'SCHEDULED'}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                  {cls.attendeesCount} Students Joined
                                </span>
                              </div>
                              <h5 className="font-extrabold text-base text-slate-900">{cls.title}</h5>
                              <p className="text-xs text-slate-600">{cls.description}</p>
                            </div>

                            <button
                              onClick={() => setActiveLiveClass(cls)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all ${
                                isLive
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                            >
                              <Radio className="w-4 h-4" />
                              <span>{isLive ? 'Join Live Class Now' : 'Enter Classroom'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500">
                      No live class active right now. Check back when the instructor announces the next session!
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT 4: LIVE TESTS & QUIZZES */}
              {detailTab === 'quizzes' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileQuestion className="w-4 h-4 text-emerald-600" />
                    Course Chapter Tests & Live Quizzes
                  </h4>

                  {selectedCourse.courseQuizzes && selectedCourse.courseQuizzes.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCourse.courseQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
                                {quiz.difficulty}
                              </span>
                              <span className="text-slate-400 font-mono">
                                {quiz.timeLimitMinutes || 20} mins limit
                              </span>
                            </div>
                            <h5 className="font-bold text-base text-slate-900">{quiz.title}</h5>
                            <p className="text-xs text-slate-500">Topic: {quiz.topic}</p>
                          </div>

                          <button
                            onClick={() => onOpenQuiz?.(quiz)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                          >
                            Start Test
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500">
                      Standard adaptive practice quizzes for this course are available in the Adaptive Quizzes tab.
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT 5: RECOMMENDED BOOKS */}
              {detailTab === 'books' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Recommended Reference Textbooks & Materials
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        title: 'NCERT Mathematics Textbook (Class 10)',
                        author: 'NCERT Official',
                        role: 'Standard Board Curriculum Reference',
                      },
                      {
                        title: 'Secondary School Mathematics (R.D. Sharma)',
                        author: 'Dr. R.D. Sharma',
                        role: 'Exhaustive Higher-Order Practice & Proofs',
                      },
                      {
                        title: 'Mathematics Exemplar Problems',
                        author: 'NCERT Expert Team',
                        role: 'Conceptual & HOTS Questions',
                      },
                    ].map((book, bIdx) => (
                      <div
                        key={bIdx}
                        className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs"
                      >
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                          {book.role}
                        </span>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900">{book.title}</h5>
                        <p className="text-xs text-slate-500">By {book.author}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Col: Enrollment Card & Sticky Sidebar */}
            <div className="space-y-4">
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5 sticky top-4">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-full h-40 object-cover rounded-xl"
                />

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Instructor:</span>
                    <span className="font-bold text-slate-900">
                      {selectedCourse.teacherName || 'Dr. Priya Raman'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Board / Exam:</span>
                    <span className="font-semibold text-slate-900">{selectedCourse.boardOrExam}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Chapters:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedCourse.chaptersCount} Chapters
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Enrolled Students:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedCourse.enrolledStudentsCount} Learners
                    </span>
                  </div>
                </div>

                {selectedCourse.isEnrolled ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      You Are Enrolled in this Course
                    </div>
                    <button
                      onClick={() => handleUnenroll(selectedCourse.id)}
                      className="w-full py-2 text-xs text-slate-500 hover:text-rose-600 font-semibold cursor-pointer text-center"
                    >
                      Unenroll from Course
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(selectedCourse.id)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    Enroll in Course Free
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Class Modal if opened */}
      {activeLiveClass && (
        <LiveClassRoom
          liveClass={activeLiveClass}
          onClose={() => setActiveLiveClass(null)}
        />
      )}
    </div>
  );
};
