import React, { useState } from 'react';
import {
  BookOpen,
  Globe,
  Video,
  Search,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  category: 'school' | 'competitive' | 'engineering' | 'undergrad' | 'skill';
  subject: string;
  type: 'book' | 'website' | 'video_tool';
  authorOrProvider: string;
  description: string;
  url?: string;
  editionOrDuration?: string;
  keyTopicsCovered: string[];
  isGovernmentApproved?: boolean;
}

const ALL_STUDY_RESOURCES: ResourceItem[] = [
  // --- Standard Reference Books ---
  {
    id: 'b-ncert-math-10',
    title: 'NCERT Mathematics (Class 10)',
    category: 'school',
    subject: 'Mathematics',
    type: 'book',
    authorOrProvider: 'NCERT New Delhi',
    description: 'Official national curriculum textbook covering Quadratic Equations, Arithmetic Progressions, Trigonometry, and Circles.',
    editionOrDuration: 'Latest Edition (Rationalized)',
    keyTopicsCovered: ['Quadratic Equations', 'Real Numbers', 'Trigonometry', 'Coordinate Geometry'],
    isGovernmentApproved: true,
  },
  {
    id: 'b-ncert-science-10',
    title: 'NCERT Science & Technology (Class 10)',
    category: 'school',
    subject: 'Science',
    type: 'book',
    authorOrProvider: 'NCERT New Delhi',
    description: 'Foundational textbook covering Chemical Reactions, Life Processes, Heredity, Light Optics, and Electricity.',
    editionOrDuration: 'Latest Edition',
    keyTopicsCovered: ['Chemical Reactions', 'Life Processes', 'Light: Reflection & Refraction', 'Electricity'],
    isGovernmentApproved: true,
  },
  {
    id: 'b-rd-sharma-math',
    title: 'Mathematics for Class 10 & 11',
    category: 'school',
    subject: 'Mathematics',
    type: 'book',
    authorOrProvider: 'Dr. R.D. Sharma (Dhanpat Rai Publications)',
    description: 'Comprehensive problem repository with graded exercises, previous board questions, and step-by-step proofs.',
    editionOrDuration: 'Standard Edition',
    keyTopicsCovered: ['Polynomials', 'Quadratic Equations', 'Heights & Distances', 'Surface Areas & Volumes'],
  },
  {
    id: 'b-hc-verma-vol1',
    title: 'Concepts of Physics (Vol 1 & Vol 2)',
    category: 'competitive',
    subject: 'Physics (JEE / NEET)',
    type: 'book',
    authorOrProvider: 'Prof. H.C. Verma (IIT Kanpur)',
    description: 'The gold standard for Indian entrance exams. Builds foundational physical intuition from Newton’s laws to Modern Physics.',
    editionOrDuration: '2nd Revised Edition',
    keyTopicsCovered: ['Newton Laws of Motion', 'Rotational Mechanics', 'Optics', 'Electrodynamics'],
  },
  {
    id: 'b-dc-pandey-mechanics',
    title: 'Understanding Physics for JEE Main & Advanced',
    category: 'competitive',
    subject: 'Physics (JEE)',
    type: 'book',
    authorOrProvider: 'D.C. Pandey (Arihant Publications)',
    description: 'Targeted competitive mechanics problems, free-body diagrams, and previous 20 years JEE question papers.',
    editionOrDuration: 'Annual JEE Edition',
    keyTopicsCovered: ['Kinematics', 'Friction & Dynamics', 'Work Energy Power', 'Circular Motion'],
  },
  {
    id: 'b-ncert-bio-11-12',
    title: 'NCERT Biology (Classes 11 & 12)',
    category: 'competitive',
    subject: 'Biology (NEET UG)',
    type: 'book',
    authorOrProvider: 'NCERT New Delhi',
    description: 'The mandatory reference for NEET Medical aspirants covering 100% of the NEET syllabus line-by-line.',
    editionOrDuration: 'Official NCERT',
    keyTopicsCovered: ['Cell Biology', 'Genetics & Evolution', 'Human Physiology', 'Plant Physiology'],
    isGovernmentApproved: true,
  },
  {
    id: 'b-op-tandon-chem',
    title: 'Physical & Organic Chemistry for Competitions',
    category: 'competitive',
    subject: 'Chemistry (JEE / NEET)',
    type: 'book',
    authorOrProvider: 'Dr. O.P. Tandon & Dr. A.K. Virmani (GRB Books)',
    description: 'Rigorous mathematical and mechanistic explanations of equilibrium, thermodynamics, and reaction mechanisms.',
    editionOrDuration: 'GRB Competitive Series',
    keyTopicsCovered: ['Chemical Equilibrium', 'Thermodynamics', 'Reaction Mechanisms', 'Coordination Compounds'],
  },
  {
    id: 'b-laxmikanth-polity',
    title: 'Indian Polity for Civil Services',
    category: 'competitive',
    subject: 'UPSC / State PSC Civil Services',
    type: 'book',
    authorOrProvider: 'M. Laxmikanth (McGraw Hill)',
    description: 'The definitive encyclopedia for Constitution of India, Fundamental Rights, Parliament, and Judiciary.',
    editionOrDuration: '7th Revised Edition',
    keyTopicsCovered: ['Preamble & Fundamental Rights (Part III)', 'Directive Principles', 'Parliament & Judiciary', 'Constitutional Bodies'],
  },
  {
    id: 'b-clrs-algorithms',
    title: 'Introduction to Algorithms (CLRS)',
    category: 'engineering',
    subject: 'Computer Science (B.Tech / GATE)',
    type: 'book',
    authorOrProvider: 'Cormen, Leiserson, Rivest, Stein (MIT Press)',
    description: 'World-renowned benchmark textbook for asymptotic analysis, greedy algorithms, dynamic programming, and graph theory.',
    editionOrDuration: '4th International Edition',
    keyTopicsCovered: ['Asymptotic Notation O(n)', 'Divide & Conquer', 'Binary Search Trees & AVL', 'Graph BFS/DFS'],
  },
  {
    id: 'b-tanenbaum-os',
    title: 'Modern Operating Systems',
    category: 'engineering',
    subject: 'Computer Science (B.Tech / GATE)',
    type: 'book',
    authorOrProvider: 'Andrew S. Tanenbaum & Herbert Bos (Pearson)',
    description: 'Fundamental principles of process scheduling, virtual memory, concurrency, semaphores, and deadlocks.',
    editionOrDuration: '4th Edition',
    keyTopicsCovered: ['Processes & Threads', 'Memory Management & Paging', 'Deadlock Detection', 'File Systems'],
  },

  // --- Verified Study Websites & Portals ---
  {
    id: 'w-geeksforgeeks',
    title: 'GeeksforGeeks (Computer Science & Algorithms Portal)',
    category: 'engineering',
    subject: 'Computer Science & Coding',
    type: 'website',
    authorOrProvider: 'GeeksforGeeks India',
    description: 'Extensive tutorials on Data Structures, Algorithms, C++, Java, Python, and GATE CSE preparation with executable code.',
    url: 'https://www.geeksforgeeks.org',
    keyTopicsCovered: ['Binary Search Trees', 'Dynamic Programming', 'System Design', 'GATE CSE Topic Notes'],
  },
  {
    id: 'w-khan-academy',
    title: 'Khan Academy (Inclusive Learning Platform)',
    category: 'school',
    subject: 'K-12 Math, Physics & Chemistry',
    type: 'website',
    authorOrProvider: 'Khan Academy Foundation',
    description: 'Free, world-class interactive exercises and mastery pathways available in Hindi and English with step-by-step hints.',
    url: 'https://www.khanacademy.org',
    keyTopicsCovered: ['Algebra & Quadratic Equations', 'Calculus', 'Classical Mechanics', 'Human Anatomy'],
  },
  {
    id: 'w-epathshala-ncert',
    title: 'NCERT ePathshala & Official Textbooks Portal',
    category: 'school',
    subject: 'CBSE & National Curricula (Classes 1–12)',
    type: 'website',
    authorOrProvider: 'Ministry of Education, Govt. of India',
    description: 'Free downloadable NCERT textbooks, audio books, exemplar problems, and teacher training materials.',
    url: 'https://epathshala.nic.in',
    keyTopicsCovered: ['Classes 1–12 All Subjects', 'Exemplar Solutions', 'Curriculum Frameworks'],
    isGovernmentApproved: true,
  },
  {
    id: 'w-diksha',
    title: 'DIKSHA (National Digital Infrastructure for Teachers & Students)',
    category: 'school',
    subject: 'Multi-State Vernacular K-12',
    type: 'website',
    authorOrProvider: 'Department of School Education & Literacy, Govt. of India',
    description: 'Digital textbooks in 30+ Indian regional languages with QR-coded interactive assessments and lesson plans.',
    url: 'https://diksha.gov.in',
    keyTopicsCovered: ['State Board Syllabi', 'Worksheets', 'Vernacular Hindi & Regional Content'],
    isGovernmentApproved: true,
  },
  {
    id: 'w-swayam',
    title: 'SWAYAM (Govt. of India National MOOCs Portal)',
    category: 'undergrad',
    subject: 'Higher Education & Certification',
    type: 'website',
    authorOrProvider: 'Ministry of Education & NPTEL',
    description: 'Courses taught by IIT, IIM, and Central University professors across Engineering, Sciences, Humanities, and Commerce.',
    url: 'https://swayam.gov.in',
    keyTopicsCovered: ['Undergraduate Degree Courses', 'Postgraduate Modules', 'Skill Certification'],
    isGovernmentApproved: true,
  },
  {
    id: 'w-mit-ocw',
    title: 'MIT OpenCourseWare (World-Class Curriculum)',
    category: 'engineering',
    subject: 'Engineering & Advanced Sciences',
    type: 'website',
    authorOrProvider: 'Massachusetts Institute of Technology',
    description: 'Complete course notes, problem sets, and exams published openly from MIT undergraduate courses.',
    url: 'https://ocw.mit.edu',
    keyTopicsCovered: ['Linear Algebra 18.06', 'Introduction to Algorithms 6.006', 'Classical Mechanics 8.01'],
  },

  // --- Curated Video Tools & Lecture Series ---
  {
    id: 'v-nptel-iit',
    title: 'NPTEL Video Lectures (IIT Madras, Bombay, Delhi Professors)',
    category: 'engineering',
    subject: 'Engineering & Advanced Science',
    type: 'video_tool',
    authorOrProvider: 'Ministry of Education & 7 IITs',
    description: 'Comprehensive 40-hour university lecture series delivered by top IIT and IISc professors with English subtitles.',
    url: 'https://www.youtube.com/@nptelhrd',
    editionOrDuration: 'Over 1,000+ Full Semester Courses',
    keyTopicsCovered: ['Data Structures & Algorithms', 'Electronic Devices & Circuits', 'Fluid Mechanics', 'Digital Signal Processing'],
    isGovernmentApproved: true,
  },
  {
    id: 'v-3blue1brown',
    title: '3Blue1Brown (Visual Mathematics & Geometry Animations)',
    category: 'competitive',
    subject: 'Visual Calculus & Linear Algebra',
    type: 'video_tool',
    authorOrProvider: 'Grant Sanderson (3Blue1Brown)',
    description: 'Unmatched geometric visual explanations using Python Manim animations for Calculus, Linear Algebra, and Neural Networks.',
    url: 'https://www.youtube.com/@3blue1brown',
    editionOrDuration: 'Essence of Linear Algebra & Calculus Series',
    keyTopicsCovered: ['Essence of Calculus (Derivatives & Integrals)', 'Essence of Linear Algebra (Eigenvectors)', 'Fourier Transforms'],
  },
  {
    id: 'v-khan-academy-hindi',
    title: 'Khan Academy Hindi (Vernacular Video Lessons)',
    category: 'school',
    subject: 'Class 6–12 Math & Science in Hindi',
    type: 'video_tool',
    authorOrProvider: 'Khan Academy India',
    description: 'High-quality, free video lessons explaining concepts in pure, crystal-clear Hindi with on-screen visual whiteboard working.',
    url: 'https://www.youtube.com/@KhanAcademyHindi',
    editionOrDuration: '3,000+ Hindi Educational Videos',
    keyTopicsCovered: ['द्विघात समीकरण (Quadratic Equations)', 'त्रिकोणमिति (Trigonometry)', 'गुरुत्वाकर्षण (Gravitation)', 'विद्युत (Electricity)'],
  },
  {
    id: 'v-physics-wallah',
    title: 'Physics Wallah (Foundational Science & Entrance Lectures)',
    category: 'competitive',
    subject: 'JEE & NEET Preparation',
    type: 'video_tool',
    authorOrProvider: 'Physics Wallah (Alakh Pandey)',
    description: 'High-energy, student-friendly foundational video lectures in Hinglish covering Board and Entrance syllabus step-by-step.',
    url: 'https://www.youtube.com/@PhysicsWallah',
    editionOrDuration: 'Free YouTube Foundation Playlists',
    keyTopicsCovered: ['Laws of Motion & Friction', 'Optics & Ray Diagrams', 'Organic Chemistry Basics', 'Human Reproduction'],
  },
  {
    id: 'v-crashcourse',
    title: 'CrashCourse (Visual Science & World History)',
    category: 'school',
    subject: 'Biology, Physics & Computer Science',
    type: 'video_tool',
    authorOrProvider: 'Complexly / PBS Digital Studios',
    description: 'Fast-paced, high-production animated overviews summarizing complex topics into memorable 12-minute modules.',
    url: 'https://www.youtube.com/@crashcourse',
    editionOrDuration: '15+ Complete Subject Playlists',
    keyTopicsCovered: ['Cell Anatomy & Organelles', 'DNA Structure & Protein Synthesis', 'Computer Science Architecture', 'Ecology'],
  },
];

interface StudyResourcesLibraryProps {
  onAskTutorAboutResource?: (resourceTitle: string) => void;
}

export const StudyResourcesLibrary: React.FC<StudyResourcesLibraryProps> = ({
  onAskTutorAboutResource,
}) => {
  const [selectedType, setSelectedType] = useState<'all' | 'book' | 'website' | 'video_tool'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ALL_STUDY_RESOURCES.filter((res) => {
    if (selectedType !== 'all' && res.type !== selectedType) return false;
    if (selectedCategory !== 'all' && res.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = res.title.toLowerCase().includes(q);
      const matchSubject = res.subject.toLowerCase().includes(q);
      const matchAuthor = res.authorOrProvider.toLowerCase().includes(q);
      const matchTopics = res.keyTopicsCovered.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSubject && !matchAuthor && !matchTopics) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Curriculum Data & Reference Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Comprehensive Study Resources, Books & Video Tools
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          Access verified textbooks, official government educational portals (NCERT, DIKSHA, SWAYAM), premier computer science platforms (GeeksforGeeks), and curated visual video channels powering the AI Guru learning engine.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, websites, video tools, or topics (e.g. NCERT, GeeksforGeeks, HC Verma)..."
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-all placeholder-slate-400"
            />
          </div>

          {/* Type Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Resources', icon: Layers },
              { id: 'book', label: 'Reference Books', icon: BookOpen },
              { id: 'website', label: 'Study Websites', icon: Globe },
              { id: 'video_tool', label: 'Video Tools & Channels', icon: Video },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id as any)}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedType === tab.id
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Stage:
          </span>
          {[
            { id: 'all', label: 'All Curricula' },
            { id: 'school', label: 'K-12 School (CBSE & State Boards)' },
            { id: 'competitive', label: 'JEE, NEET & UPSC Exams' },
            { id: 'engineering', label: 'Engineering & Computer Science' },
            { id: 'undergrad', label: 'Undergraduate & Higher Ed' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const isBook = item.type === 'book';
          const isWeb = item.type === 'website';
          const isVideo = item.type === 'video_tool';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header Tag */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isBook && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                        <BookOpen className="w-3 h-3 text-amber-600" /> Textbook
                      </span>
                    )}
                    {isWeb && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[11px]">
                        <Globe className="w-3 h-3 text-blue-600" /> Portal / Web
                      </span>
                    )}
                    {isVideo && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[11px]">
                        <Video className="w-3 h-3 text-rose-600" /> Video Series
                      </span>
                    )}
                    {item.isGovernmentApproved && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Govt. Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 capitalize">{item.category}</span>
                </div>

                {/* Title & Author */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-indigo-700 font-medium mt-0.5">
                    By {item.authorOrProvider}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                {/* Topics Pills */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {item.keyTopicsCovered.map((topic, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px] font-medium">Standard Academic Print</span>
                )}

                {onAskTutorAboutResource && (
                  <button
                    onClick={() => onAskTutorAboutResource(item.title)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Study with Tutor</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No matching study resources found.</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or selecting "All Resources".</p>
        </div>
      )}
    </div>
  );
};
