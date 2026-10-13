import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { WorkspaceLayout, WorkspaceTab } from './components/workspace/WorkspaceLayout.tsx';
import { ChatTutor } from './components/workspace/ChatTutor.tsx';
import { CourseCatalog } from './components/courses/CourseCatalog.tsx';
import { QuizCenter } from './components/quiz/QuizCenter.tsx';
import { ProgressDashboard } from './components/progress/ProgressDashboard.tsx';
import { StudyPlanner } from './components/planner/StudyPlanner.tsx';
import { DocumentKnowledgeBase } from './components/documents/DocumentKnowledgeBase.tsx';
import { ConceptVisualizer } from './components/visualizer/ConceptVisualizer.tsx';
import { StudyResourcesLibrary } from './components/resources/StudyResourcesLibrary.tsx';
import { TeacherDashboard } from './components/teacher/TeacherDashboard.tsx';
import { TeacherVerificationModal } from './components/teacher/TeacherVerificationModal.tsx';
import { StudentNotebook } from './components/notebook/StudentNotebook.tsx';
import { LiveClassesDirectory } from './components/live/LiveClassesDirectory.tsx';
import { Conversation, Course, Chapter, StudentNotebookNote } from './types/index.ts';
import { api } from './api/client.ts';
import { GraduationCap, ShieldAlert } from 'lucide-react';

function MainApp() {
  const { user, loading, setShowTeacherVerifyModal } = useAuth();
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Auto-switch to workspace when user logs in if not already there
  useEffect(() => {
    if (user && viewMode === 'landing') {
      setViewMode('workspace');
    }
  }, [user]);

  // Load conversations when workspace opens
  useEffect(() => {
    if (user && viewMode === 'workspace') {
      loadConversations();
    }
  }, [user, viewMode]);

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);
      if (res.conversations.length > 0 && !activeConversationId) {
        setActiveConversationId(res.conversations[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setCurrentTab('chat');
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        setActiveConversationId(remaining[0]?.id || null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setActiveConversationId(updated.id);
    const exists = conversations.some((c) => c.id === updated.id);
    if (exists) {
      setConversations(conversations.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      setConversations([updated, ...conversations]);
    }
  };

  const handleStartChapterInChat = async (course: Course, chapter: Chapter) => {
    setCurrentTab('chat');
    try {
      const prompt = `नमस्ते सर! मैं "${course.title}" का "${chapter.title}" पढ़ना चाहता हूँ। कृपया मुझे इसके मुख्य सिद्धांत, सूत्र और सीखने के उद्देश्य सरल तरीके से समझाएं।`;
      const res = await api.sendMessage({
        message: prompt,
        subjectContext: course.title,
      });
      handleUpdateConversation(res.conversation);
    } catch (err: any) {
      alert(err.message || 'Failed to start chapter');
    }
  };

  const handleStartRemedialPractice = async (topic: string) => {
    setCurrentTab('chat');
    try {
      const prompt = `सर, डायग्नोस्टिक क्विज़ के अनुसार मेरा "${topic}" में लर्निंग गैप है। कृपया मुझे इसकी बुनियादी अवधारणाएं (Prerequisites) दोबारा समझाएं और 2 सरल अभ्यास प्रश्न दें।`;
      const res = await api.sendMessage({
        message: prompt,
        subjectContext: topic,
      });
      handleUpdateConversation(res.conversation);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAskTutorAboutResource = async (resourceTitle: string) => {
    setCurrentTab('chat');
    try {
      const prompt = `नमस्ते सर! मुझे "${resourceTitle}" के मुख्य सिद्धांतों, आवश्यक सूत्रों और तैयारी की रणनीति के बारे में समझाइए।`;
      const res = await api.sendMessage({
        message: prompt,
        subjectContext: resourceTitle,
      });
      handleUpdateConversation(res.conversation);
    } catch (err: any) {
      alert(err.message || 'Failed to start topic with tutor');
    }
  };

  const handleStudyWithAIFromNote = async (note: StudentNotebookNote) => {
    try {
      const res = await api.teachFromNote(note.id);
      setConversations([res.conversation, ...conversations.filter((c) => c.id !== res.conversation.id)]);
      setActiveConversationId(res.conversation.id);
      setCurrentTab('chat');
    } catch (err: any) {
      alert(err.message || 'Failed to start AI lesson from note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-slate-800">Initializing AI Guru Learning Platform...</span>
        </div>
      </div>
    );
  }

  // 1. WORKSPACE VIEW (Private student / teacher / admin learning environment)
  if (viewMode === 'workspace' && user) {
    const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

    return (
      <>
        <WorkspaceLayout
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => setActiveConversationId(id)}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onBackToLanding={() => setViewMode('landing')}
        >
          {currentTab === 'chat' && (
            <ChatTutor
              conversation={activeConversation}
              onUpdateConversation={handleUpdateConversation}
              onNavigateToTab={setCurrentTab}
            />
          )}
          {currentTab === 'courses' && (
            <CourseCatalog
              onStartChapterInChat={handleStartChapterInChat}
              onOpenQuiz={() => setCurrentTab('quiz')}
            />
          )}
          {currentTab === 'notebook' && (
            <StudentNotebook onStudyWithAI={handleStudyWithAIFromNote} />
          )}
          {currentTab === 'live' && (
            <LiveClassesDirectory />
          )}
          {currentTab === 'teacher' && (
            user?.role === 'teacher' ? (
              <TeacherDashboard onCourseSelect={() => setCurrentTab('courses')} />
            ) : (
              <div className="max-w-2xl mx-auto p-8 my-12 bg-white rounded-3xl border border-slate-200/90 shadow-xl text-center space-y-5">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Teacher Studio केवल सत्यापित शिक्षकों के लिए है
                  </h2>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                    शिक्षक स्टूडियो और डैशबोर्ड केवल उन शिक्षकों के लिए उपलब्ध है जिन्होंने अपनी कम से कम{' '}
                    <strong>स्नातक (Graduate), स्नातकोत्तर (Postgraduate) या पीएचडी (PhD)</strong> डिग्री और
                    प्रमाण-पत्र सत्यापित किया है। बिना वैध डिग्री के शिक्षक अनुमति नहीं दी जा सकती।
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentTab('courses')}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    वापस स्टूडेंट कोर्सेज देखें (Go to Courses)
                  </button>
                  <button
                    onClick={() => setShowTeacherVerifyModal(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 cursor-pointer"
                  >
                    डिग्री अपलोड करें व शिक्षक बनें (Verify Degree)
                  </button>
                </div>
              </div>
            )
          )}
          {currentTab === 'visualizer' && (
            <ConceptVisualizer onAskInChat={handleAskTutorAboutResource} />
          )}
          {currentTab === 'resources' && (
            <StudyResourcesLibrary onAskTutorAboutResource={handleAskTutorAboutResource} />
          )}
          {currentTab === 'quiz' && (
            <QuizCenter onGoToPlanner={() => setCurrentTab('planner')} />
          )}
          {currentTab === 'progress' && (
            <ProgressDashboard onStartRemedialPractice={handleStartRemedialPractice} />
          )}
          {currentTab === 'planner' && <StudyPlanner />}
          {currentTab === 'documents' && <DocumentKnowledgeBase />}
        </WorkspaceLayout>

        <AuthModal />
        <TeacherVerificationModal />
      </>
    );
  }

  // 2. PUBLIC LANDING PAGE VIEW
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        onNavigateLanding={(sectionId) => {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenWorkspace={() => setViewMode('workspace')}
      />

      <main className="flex-1">
        <LandingPage
          onExploreCourses={() => {
            if (user) {
              setViewMode('workspace');
              setCurrentTab('courses');
            } else {
              const el = document.getElementById('courses');
              el?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onEnterWorkspace={() => setViewMode('workspace')}
        />
      </main>

      <Footer />
      <AuthModal />
      <TeacherVerificationModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
