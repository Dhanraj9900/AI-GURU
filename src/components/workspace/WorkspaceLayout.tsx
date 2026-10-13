import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  BookOpen,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  GraduationCap,
  Target,
  BarChart3,
  CalendarCheck,
  FileText,
  ShieldCheck,
  Cpu,
  Layers,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  ArrowLeft,
  UserCheck,
  Radio,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Conversation } from '../../types/index.ts';

export type WorkspaceTab =
  | 'chat'
  | 'courses'
  | 'notebook'
  | 'live'
  | 'teacher'
  | 'visualizer'
  | 'resources'
  | 'quiz'
  | 'progress'
  | 'planner'
  | 'documents'
  | 'admin';

interface WorkspaceLayoutProps {
  currentTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onBackToLanding: () => void;
  children: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  currentTab,
  onSelectTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onBackToLanding,
  children,
}) => {
  const { user, logout, quickLoginAs, setShowTeacherVerifyModal } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isTeacher = user?.role === 'teacher';

  const navItems = [
    { id: 'chat' as WorkspaceTab, label: 'AI Guru Tutor', icon: MessageSquare },
    { id: 'courses' as WorkspaceTab, label: 'Student Courses', icon: GraduationCap },
    { id: 'notebook' as WorkspaceTab, label: 'My Notebook (मेरी नोटबुक)', icon: FileText },
    { id: 'live' as WorkspaceTab, label: 'Live Classes', icon: Radio },
    ...(isTeacher
      ? [{ id: 'teacher' as WorkspaceTab, label: 'Teacher Studio & Dashboard', icon: Award }]
      : []),
    { id: 'visualizer' as WorkspaceTab, label: 'Concept Diagrams', icon: Layers },
    { id: 'resources' as WorkspaceTab, label: 'Books & Study Tools', icon: BookOpen },
    { id: 'quiz' as WorkspaceTab, label: 'Adaptive Quizzes & Tests', icon: Target },
    { id: 'progress' as WorkspaceTab, label: 'My Progress & Gaps', icon: BarChart3 },
    { id: 'planner' as WorkspaceTab, label: 'Study Planner', icon: CalendarCheck },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Brand & collapse */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-extrabold text-sm text-white tracking-tight block">AI GURU</span>
              <span className="text-[10px] text-indigo-400 font-medium capitalize">
                {user?.role} Workspace
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-md hidden lg:block"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewChat();
            if (currentTab !== 'chat') onSelectTab('chat');
            setMobileDrawerOpen(false);
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${
            collapsed ? 'px-0' : ''
          }`}
          title="Start new learning conversation"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Learning Chat</span>}
        </button>
      </div>

      {/* Main navigation icons / labels */}
      <div className="px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={item.label}
            >
              <item.icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Recent Chats Section (Only if not collapsed) */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-3 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
            <span>Recent Learning Chats</span>
          </div>

          {/* Search chats */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-800/80 text-xs text-white pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-700/60 focus:outline-hidden focus:border-indigo-500 placeholder-slate-500"
            />
          </div>

          <div className="space-y-1">
            {filteredConversations.length === 0 ? (
              <p className="text-[11px] text-slate-500 px-2 py-3 text-center">No chats found.</p>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversationId === conv.id && currentTab === 'chat';
                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-800/50'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      if (currentTab !== 'chat') onSelectTab('chat');
                      setMobileDrawerOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-indigo-400" />
                      <span className="truncate">{conv.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* User profile & bottom tools */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/95 space-y-2">
        {!collapsed && (
          <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.educationalLevel}</p>
                {user?.teacherDegree && (
                  <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{user.teacherDegree.degreeName}</span>
                  </p>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800 shrink-0">
                {user?.role}
              </span>
            </div>

            {user?.role === 'student' && (
              <button
                onClick={() => setShowTeacherVerifyModal(true)}
                className="mt-2 w-full py-1 px-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Award className="w-3 h-3 text-amber-400" />
                <span>शिक्षक बनें (डिग्री सत्यापन)</span>
              </button>
            )}

            {/* Quick role switcher for evaluation */}
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>Switch role:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => quickLoginAs('student')}
                  className="px-1.5 py-0.5 hover:text-white rounded hover:bg-slate-700"
                >
                  Student
                </button>
                <button
                  onClick={() => quickLoginAs('teacher')}
                  className="px-1.5 py-0.5 hover:text-white rounded hover:bg-slate-700"
                >
                  Teacher
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-1 text-xs text-slate-400 pt-1">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 hover:text-white py-1 px-2 rounded hover:bg-slate-800"
            title="Return to Public Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {!collapsed && <span>Home Page</span>}
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 py-1 px-2 rounded hover:bg-rose-950/40"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-200 shrink-0 ${
          collapsed ? 'w-16' : 'w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for mobile trigger & breadcrumb */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800 capitalize">
                {navItems.find((n) => n.id === currentTab)?.label || 'AI Guru Workspace'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-600 font-medium">Inclusive Multilingual Learning</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTeacher ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[200px]">
                    {user?.teacherDegree?.degreeName || 'Verified Faculty'}
                  </span>
                </span>
                <button
                  onClick={() => onSelectTab(currentTab === 'teacher' ? 'courses' : 'teacher')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTab === 'teacher'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{currentTab === 'teacher' ? '👨‍🏫 Teacher Studio (Active)' : 'Teacher Studio'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  Student: {user?.name || 'Aarav'}
                </span>
                <button
                  onClick={() => setShowTeacherVerifyModal(true)}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="शिक्षक बनने के लिए कम से कम Graduate, Postgraduate या PhD डिग्री अपलोड करें"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>शिक्षक बनें (डिग्री सत्यापन)</span>
                </button>
              </div>
            )}

            <button
              onClick={onBackToLanding}
              className="text-xs text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Landing
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};
