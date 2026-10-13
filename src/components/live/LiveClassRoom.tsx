import React, { useState, useEffect, useRef } from 'react';
import { LiveClass, LiveClassChatMessage } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import {
  Video,
  Users,
  Send,
  X,
  Radio,
  Clock,
  Sparkles,
  Hand,
  CheckCircle2,
  Shield,
  MessageSquare,
  HelpCircle,
  Play,
  Maximize2,
} from 'lucide-react';

interface LiveClassRoomProps {
  liveClass: LiveClass;
  onClose: () => void;
  onClassUpdated?: (updated: LiveClass) => void;
}

export const LiveClassRoom: React.FC<LiveClassRoomProps> = ({
  liveClass: initialClass,
  onClose,
  onClassUpdated,
}) => {
  const { user } = useAuth();
  const [currentClass, setCurrentClass] = useState<LiveClass>(initialClass);
  const [chatMessage, setChatMessage] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'agenda' | 'notes'>('chat');
  const [whiteboardText, setWhiteboardText] = useState(
    '🎯 Live Board: Topic: ' +
      initialClass.title +
      '\n\n• Key Concepts Discussed:\n  1. Definitions & Standard Form\n  2. Step-by-step derivation\n  3. Live doubt answering'
  );
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isTeacher = user?.role === 'teacher' || user?.id === currentClass.teacherId;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentClass.chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const messageText = chatMessage.trim();
    setChatMessage('');

    try {
      const res = await api.sendLiveChatMessage(currentClass.id, messageText);
      setCurrentClass(res.liveClass);
      onClassUpdated?.(res.liveClass);
    } catch {
      // Optimistic fallback
      const localMsg: LiveClassChatMessage = {
        id: `chat_local_${Date.now()}`,
        senderId: user?.id || 'usr_me',
        senderName: user?.name || (isTeacher ? 'Instructor' : 'Student'),
        senderRole: user?.role || 'student',
        message: messageText,
        timestamp: new Date().toISOString(),
      };
      const updated = {
        ...currentClass,
        chatMessages: [...currentClass.chatMessages, localMsg],
      };
      setCurrentClass(updated);
      onClassUpdated?.(updated);
    }
  };

  const handleToggleStatus = async (newStatus: 'live' | 'completed') => {
    try {
      const res = await api.updateLiveClassStatus(currentClass.id, newStatus);
      setCurrentClass(res.liveClass);
      onClassUpdated?.(res.liveClass);
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold animate-pulse">
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            {currentClass.status === 'live' ? 'LIVE NOW' : currentClass.status.toUpperCase()}
          </div>
          <div>
            <h2 className="text-white font-extrabold text-sm sm:text-base tracking-tight truncate max-w-xs sm:max-w-md">
              {currentClass.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{currentClass.courseTitle}</span>
              <span>•</span>
              <span className="text-indigo-400 font-medium">{currentClass.teacherName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 font-medium">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentClass.attendeesCount + (handRaised ? 1 : 0)} Attending</span>
          </div>

          {isTeacher && currentClass.status === 'live' && (
            <button
              onClick={() => handleToggleStatus('completed')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              End Class
            </button>
          )}

          {isTeacher && currentClass.status !== 'live' && (
            <button
              onClick={() => handleToggleStatus('live')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Go Live Now
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Exit Classroom"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Video / Whiteboard Stream */}
        <div className="flex-1 bg-slate-950 flex flex-col p-3 sm:p-4 gap-3 overflow-y-auto">
          {/* Video or Whiteboard Screen */}
          <div className="relative aspect-video w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Stream Content */}
            {currentClass.streamUrl && currentClass.streamUrl.includes('youtube') ? (
              <iframe
                src={`${currentClass.streamUrl}?autoplay=1&mute=1`}
                title={currentClass.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full p-6 flex flex-col justify-between bg-radial from-slate-900 via-slate-950 to-black">
                {/* Simulated live teacher presentation board */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        currentClass.teacherAvatar ||
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={currentClass.teacherName}
                      className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover"
                    />
                    <div>
                      <div className="text-white font-bold text-sm flex items-center gap-1.5">
                        {currentClass.teacherName}
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <span className="text-[11px] text-slate-400">Broadcasting live from AI Guru Studio</span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    HD 1080p Stream
                  </div>
                </div>

                {/* Live Whiteboard Display */}
                <div className="my-auto p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono font-bold text-indigo-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Live Teacher Digital Blackboard
                  </div>
                  <pre className="text-sm font-sans text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {whiteboardText}
                  </pre>
                  {isTeacher && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
                      <input
                        type="text"
                        placeholder="Add equation or key note to live board..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            setWhiteboardText((prev) => prev + '\n• ' + e.currentTarget.value.trim());
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Stream Bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Duration: {currentClass.durationMinutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Room: {currentClass.meetingRoomId}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Interaction Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHandRaised(!handRaised)}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  handRaised
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Hand className="w-4 h-4" />
                {handRaised ? 'Hand Raised ✋' : 'Raise Hand to Ask Doubt'}
              </button>

              <button
                onClick={() => {
                  setChatMessage('सर/मैम, क्या आप यह सूत्र एक बार फिर दोहरा सकते हैं?');
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Doubt Quick-Ask
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Audio/Video Synced</span>
            </div>
          </div>
        </div>

        {/* Right Live Chat & Class Info Drawer */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-80 lg:h-auto">
          {/* Drawer Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-colors ${
                activeTab === 'chat'
                  ? 'border-indigo-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Chat ({currentClass.chatMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-colors ${
                activeTab === 'agenda'
                  ? 'border-indigo-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Class Agenda
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' ? (
            <>
              {/* Messages List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {currentClass.chatMessages.map((msg) => {
                  const isMsgTeacher = msg.senderRole === 'teacher';
                  const isMe = msg.senderId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl text-xs space-y-1 ${
                        isMsgTeacher
                          ? 'bg-indigo-950/60 border border-indigo-700/50 text-indigo-100'
                          : isMe
                          ? 'bg-slate-800 border border-slate-700 text-slate-100 ml-4'
                          : 'bg-slate-800/60 border border-slate-800 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isMsgTeacher ? 'text-indigo-300' : 'text-slate-400'
                          }`}
                        >
                          {msg.senderName}
                          {isMsgTeacher && (
                            <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded text-[9px]">
                              Teacher
                            </span>
                          )}
                        </span>
                        <span className="text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask teacher a question in live chat..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Session Outline
                </h4>
                <div className="space-y-2">
                  {currentClass.agenda && currentClass.agenda.length > 0 ? (
                    currentClass.agenda.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Class agenda details available in lecture notes.</p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-xs space-y-2">
                <div className="font-bold text-indigo-300">About this live session:</div>
                <p className="text-slate-300 leading-relaxed">{currentClass.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
