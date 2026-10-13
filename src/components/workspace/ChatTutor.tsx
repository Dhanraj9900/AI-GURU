import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Conversation, Message, Language, EducationalDiagram, ExtractedLinkData } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { MathRenderer } from '../common/MathRenderer.tsx';
import { DiagramViewer } from '../common/DiagramViewer.tsx';
import {
  Send,
  Paperclip,
  Languages,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Calculator,
  FileText,
  Lightbulb,
  ExternalLink,
  BookOpen,
  HelpCircle,
  AlertCircle,
  FileUp,
  Video,
  Globe,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ChatTutorProps {
  conversation: Conversation | null;
  onUpdateConversation: (updated: Conversation) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const ChatTutor: React.FC<ChatTutorProps> = ({
  conversation,
  onUpdateConversation,
  onNavigateToTab,
}) => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(user?.preferredLanguage || 'hi');
  const [depth, setDepth] = useState<'simple' | 'intermediate' | 'exam_advanced' | 'socratic'>('intermediate');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = conversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && !attachedFile) return;

    let fullPrompt = text;
    if (attachedFile) {
      fullPrompt = `[Attached Document: ${attachedFile.name}]\n${attachedFile.content.substring(0, 800)}\n\nStudent Query: ${text || 'Please explain this document and summarize key concepts.'}`;
    }

    setInputMessage('');
    setAttachedFile(null);
    setLoading(true);

    try {
      const res = await api.sendMessage({
        conversationId: conversation?.id,
        message: fullPrompt,
        preferredLanguage,
        depth,
      });

      onUpdateConversation(res.conversation);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = text.replace(/[*#$`]/g, '').substring(0, 400);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        content: content || 'Sample notes extracted from uploaded educational document.',
      });
    };
    reader.readAsText(file);
  };

  const suggestedPrompts = [
    {
      title: 'द्विघात समीकरण एवं आलेख (Quadratic Equation & Parabola)',
      sub: 'ax² + bx + c = 0 का हल और परवलय आलेख चित्र सहित समझें',
      prompt: 'सर, मुझे कक्षा 10 का द्विघात समीकरण x² - 5x + 6 = 0, विविक्तकर D और परवलय ग्राफ (Parabola Diagram) बहुत सरल हिंदी में समझाइए।',
    },
    {
      title: 'GeeksforGeeks लिंक विश्लेषण (GFG Study Link)',
      sub: 'GeeksforGeeks का ट्यूटोरियल लिंक देकर आसान भाषा में समझें',
      prompt: 'https://www.geeksforgeeks.org/binary-search-tree-data-structure/ - सर, GeeksforGeeks के इस लिंक में Binary Search Tree के बारे में क्या समझाया गया है, मुझे सरल हिंदी में समझाइए।',
    },
    {
      title: 'YouTube वीडियो लिंक विश्लेषण (Video Study Link)',
      sub: 'यूट्यूब वीडियो लिंक देकर उसके मुख्य बिंदु और सारांश पूछें',
      prompt: 'https://www.youtube.com/watch?v=kKKM8Y-u7ds - सर, इस वीडियो में Newton\'s Laws of Motion और Free Body Diagram के बारे में क्या बताया गया है?',
    },
    {
      title: 'न्यूटन के नियम एवं मुक्त पिंड आरेख (FBD Diagram)',
      sub: 'नत समतल पर गुटके के बल (FBD) का चित्र और त्वरण समझें',
      prompt: 'Explain Newton\'s laws of motion with a Free Body Diagram (FBD) of a block on an inclined plane with friction.',
    },
    {
      title: 'डीएनए संरचना एवं कोशिका (DNA & Cell Diagram)',
      sub: 'जीवविज्ञान का चित्र एवं पूरक हाइड्रोजन बंध समझें',
      prompt: 'सर, डीएनए की द्विकुंडलिनी संरचना (DNA Double Helix Diagram) और एडेनिन-थाइमिन के बंध समझाइए।',
    },
    {
      title: 'अध्ययन पुस्तकें एवं संदर्भ सामग्री (Study Books Library)',
      sub: 'NCERT, HC Verma और सरकारी पोर्टल्स की जानकारी प्राप्त करें',
      prompt: 'सर, कक्षा 10 और 12 के लिए कौन-कौन सी NCERT पुस्तकें, संदर्भ किताबें और उपयोगी वेबसाइट्स पढ़नी चाहिए?',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white max-w-5xl mx-auto border-x border-slate-200/60 shadow-2xs">
      {/* Top Controls Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <Languages className="w-3.5 h-3.5 text-indigo-600" />
            <span>Response Language:</span>
          </div>
          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value as Language)}
            className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="hinglish">Hinglish (Colloquial)</option>
            <option value="en">English</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick links to Visualizer and Resources */}
          {onNavigateToTab && (
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <button
                onClick={() => onNavigateToTab('visualizer')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-slate-700 hover:text-indigo-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Layers className="w-3 h-3 text-indigo-600" />
                <span>Concept Visuals</span>
              </button>
              <button
                onClick={() => onNavigateToTab('resources')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-slate-700 hover:text-indigo-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-indigo-600" />
                <span>Books & Tools</span>
              </button>
            </div>
          )}

          <span className="text-slate-600 font-medium hidden md:inline">Depth:</span>
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
            {[
              { id: 'simple', label: 'Simple' },
              { id: 'intermediate', label: 'Standard' },
              { id: 'exam_advanced', label: 'Exam' },
              { id: 'socratic', label: 'Socratic' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDepth(d.id as any)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  depth === d.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600 shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Namaste, {user?.name.split(' ')[0]}! What would you like to learn today?
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
                Ask any question, paste a website link (like GeeksforGeeks) or YouTube link, solve equations with step-by-step math, or request visual concept diagrams.
              </p>
            </div>

            {/* Suggested cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/90 hover:border-indigo-200 rounded-xl transition-all text-left space-y-1 group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                    {p.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{p.sub}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages Transcript */
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    गुरु
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-2xs space-y-3.5'
                  }`}
                >
                  {/* Extracted Website or YouTube Video Card */}
                  {msg.extractedLink && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {msg.extractedLink.type === 'youtube' ? (
                            <span className="inline-flex items-center gap-1 text-rose-600">
                              <Video className="w-4 h-4" /> YouTube Video Source
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-blue-600">
                              <Globe className="w-4 h-4" /> Study Website ({msg.extractedLink.domain})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium border border-indigo-200">
                          Data Fetched & Analyzed
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        {msg.extractedLink.thumbnail && (
                          <img
                            src={msg.extractedLink.thumbnail}
                            alt={msg.extractedLink.title}
                            className="w-full sm:w-36 h-20 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="space-y-1 flex-1">
                          <h4 className="font-bold text-sm text-slate-900 leading-snug">
                            {msg.extractedLink.title}
                          </h4>
                          {msg.extractedLink.authorOrChannel && (
                            <p className="text-[11px] text-slate-500 font-medium">
                              Channel / Author: {msg.extractedLink.authorOrChannel}
                            </p>
                          )}
                          <a
                            href={msg.extractedLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] pt-1"
                          >
                            <span>Open Original Page / Video</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="max-w-none">
                    <MathRenderer
                      content={msg.content}
                      className={isUser ? 'text-white' : 'text-slate-800'}
                    />
                  </div>

                  {/* Interactive Visual Diagram */}
                  {msg.educationalDiagram && (
                    <div className="mt-2">
                      <DiagramViewer diagram={msg.educationalDiagram} />
                    </div>
                  )}

                  {/* SymPy Deterministic Math Card */}
                  {msg.mathSolution && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-800">
                      <div className="flex items-center justify-between font-bold text-indigo-900 pb-1 border-b border-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-indigo-600" />
                          <span>{msg.mathSolution.engine}</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Step-by-Step Verifier
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        <strong>Expression:</strong>{' '}
                        <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-indigo-900">
                          {msg.mathSolution.originalExpression}
                        </code>
                      </div>
                      <div className="space-y-1.5 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200/80">
                        {msg.mathSolution.steps.map((st: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5 text-slate-700">
                            <span className="text-indigo-600 font-bold shrink-0">→</span>
                            <MathRenderer content={st} className="inline text-[11px]" />
                          </div>
                        ))}
                      </div>
                      <div className="pt-1.5 text-xs font-bold text-emerald-700 border-t border-slate-200 flex items-center gap-1.5">
                        <span>Final Result:</span>
                        <code className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          {msg.mathSolution.finalResult}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Socratic Hint */}
                  {msg.socraticHint && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <strong className="block mb-0.5">Guru Hint:</strong>
                        <MathRenderer content={msg.socraticHint} className="text-xs text-amber-900" />
                      </div>
                    </div>
                  )}

                  {/* Grounded RAG Sources */}
                  {msg.ragSources && msg.ragSources.length > 0 && (
                    <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-indigo-900 text-[11px]">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Grounded Textbook / Notes Citations</span>
                        </span>
                        <span className="text-[10px] text-indigo-700 font-mono">
                          Confidence: {Math.round((msg.groundingConfidence || 0.95) * 100)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        {msg.ragSources.map((src, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-white p-2 rounded border border-indigo-100 text-[11px] text-slate-700"
                          >
                            <div className="font-semibold text-slate-900">
                              {src.documentTitle} · {src.pageOrSection}
                            </div>
                            <p className="text-slate-500 line-clamp-2 mt-0.5">{src.snippet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Message Actions & Model Tag */}
                  {!isUser && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-slate-700 p-1 rounded hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className="hover:text-slate-700 p-1 rounded hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                          title="Read aloud"
                        >
                          {speakingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">{speakingId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>

                        <button
                          onClick={() => setFeedbackGiven({ ...feedbackGiven, [msg.id]: 'up' })}
                          className={`p-1 rounded hover:bg-slate-50 cursor-pointer ${
                            feedbackGiven[msg.id] === 'up' ? 'text-indigo-600' : 'hover:text-slate-700'
                          }`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setFeedbackGiven({ ...feedbackGiven, [msg.id]: 'down' })}
                          className={`p-1 rounded hover:bg-slate-50 cursor-pointer ${
                            feedbackGiven[msg.id] === 'down' ? 'text-rose-600' : 'hover:text-slate-700'
                          }`}
                          title="Needs improvement"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-medium">
                        AI Guru Digital Teacher
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
              गुरु
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span>AI Guru is analyzing question, fetching study links, and verifying steps...</span>
              </div>
              <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray & Attachment Preview */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        {attachedFile && (
          <div className="mb-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs flex items-center justify-between text-indigo-900">
            <div className="flex items-center gap-2 truncate">
              <FileUp className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold truncate">{attachedFile.name}</span>
              <span className="text-indigo-500 text-[10px]">(Attached for grounded Q&A)</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
        >
          {/* File attachment input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.md,.pdf,.docx"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Attach notes or study material"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              preferredLanguage === 'hi'
                ? 'सवाल पूछें, वेबसाइट/यूट्यूब लिंक पेस्ट करें या चित्र मांगें (Enter to send)...'
                : 'Ask a concept, paste a website/YouTube link, or request a diagram (Enter to send)...'
            }
            className="flex-1 max-h-32 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden resize-none py-1.5"
          />

          <button
            type="submit"
            disabled={(!inputMessage.trim() && !attachedFile) || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 gap-1">
          <span>Paste any study website (GeeksforGeeks, Wikipedia) or YouTube video link for instant analysis.</span>
          <span className="font-medium text-slate-500">Multilingual Socratic AI Tutor</span>
        </div>
      </div>
    </div>
  );
};
