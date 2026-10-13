import React, { useState, useEffect } from 'react';
import { LiveClass } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { LiveClassRoom } from './LiveClassRoom.tsx';
import {
  Radio,
  Users,
  Clock,
  Calendar,
  Play,
  CheckCircle2,
  Sparkles,
  Search,
  Shield,
  Layers,
} from 'lucide-react';

export const LiveClassesDirectory: React.FC = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    setLoading(true);
    try {
      const res = await api.getLiveClasses();
      setLiveClasses(res.liveClasses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = liveClasses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Live Interactive Classes
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Teacher Live Streams & Interactive Classrooms
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Join ongoing and upcoming live lectures hosted by verified faculty with real-time digital blackboard and instant doubt-clearing chat.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search live classes, teachers..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-rose-600"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading live classes...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
          <Radio className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">No live classes scheduled</div>
          <p className="text-xs text-slate-500">Teachers will announce new live sessions shortly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((cls) => {
            const isLive = cls.status === 'live';

            return (
              <div
                key={cls.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isLive
                    ? 'bg-rose-50/40 border-rose-300 shadow-md ring-1 ring-rose-200'
                    : 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isLive
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      {isLive ? 'LIVE NOW' : 'SCHEDULED SESSION'}
                    </span>

                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      {cls.attendeesCount} Learners Attending
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 leading-snug">{cls.title}</h3>

                  <p className="text-xs text-slate-600 leading-relaxed">{cls.description}</p>

                  {/* Teacher card */}
                  <div className="p-3 bg-white/80 rounded-xl border border-slate-200 flex items-center gap-3">
                    <img
                      src={
                        cls.teacherAvatar ||
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={cls.teacherName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        {cls.teacherName}
                        <Shield className="w-3 h-3 text-indigo-600" />
                      </div>
                      <span className="text-[10px] text-slate-500">{cls.courseTitle}</span>
                    </div>
                  </div>

                  {/* Agenda pills */}
                  {cls.agenda && cls.agenda.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Agenda Topics:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cls.agenda.map((ag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                          >
                            ✓ {ag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{cls.durationMinutes} mins</span>
                  </div>

                  <button
                    onClick={() => setSelectedClass(cls)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all ${
                      isLive
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isLive ? 'Join Live Class' : 'Enter Classroom'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Classroom modal */}
      {selectedClass && (
        <LiveClassRoom
          liveClass={selectedClass}
          onClose={() => setSelectedClass(null)}
          onClassUpdated={(updated) => {
            setLiveClasses(liveClasses.map((c) => (c.id === updated.id ? updated : c)));
          }}
        />
      )}
    </div>
  );
};
