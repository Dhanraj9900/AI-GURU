import React, { useState } from 'react';
import { EducationalDiagram } from '../../types/index.ts';
import { DiagramViewer } from '../common/DiagramViewer.tsx';
import {
  Layers,
  Sparkles,
  BookOpen,
  Calculator,
  Compass,
  Cpu,
  Dna,
  Zap,
  RotateCcw,
  ZoomIn,
} from 'lucide-react';

const PREBUILT_DIAGRAMS: EducationalDiagram[] = [
  {
    id: 'diag-parabola',
    type: 'parabola',
    title: 'द्विघात परवलय वक्र (Quadratic Parabola: y = ax² + bx + c)',
    caption: 'द्विघात समीकरण का आलेख एक परवलय (Parabola) बनाता है। यह वक्र X-अक्ष को जिन बिंदुओं पर काटता है, वही इसके वास्तविक मूल (Roots x₁ = 2, x₂ = 3) होते हैं। जब विविक्तकर D > 0 हो, तो वक्र X-अक्ष को दो भिन्न बिंदुओं पर काटता है।',
    subject: 'Mathematics',
    labels: [
      { text: 'वास्तविक मूल (Roots x₁, x₂)', description: 'X-अक्ष के प्रतिच्छेदन बिंदु जहाँ y = 0', color: '#10b981' },
      { text: 'शीर्ष (Vertex)', description: 'न्यूनतम बिंदु (-b/2a, -D/4a)', color: '#ef4444' },
      { text: 'सममिति अक्ष (Axis)', description: 'ऊर्ध्वाधर रेखा x = -b/(2a)', color: '#f59e0b' },
    ],
    parameters: { root1: 2, root2: 3 },
  },
  {
    id: 'diag-fbd',
    type: 'free_body',
    title: 'नत समतल पर मुक्त पिंड आरेख (Free Body Diagram on Incline)',
    caption: 'θ कोण के नत तल पर रखे गुटके पर लगने वाले सभी बाह्य बल: अभिलंब प्रतिक्रिया बल (N = mg·cosθ), ढलान के नीचे की ओर गुरुत्व घटक (mg·sinθ) और गति का विरोध करने वाला घर्षण बल (f)।',
    subject: 'Physics',
    labels: [
      { text: 'अभिलंब प्रतिक्रिया (N)', description: 'सतह के लंबवत ऊपर की ओर बल', color: '#10b981' },
      { text: 'घर्षण बल (f)', description: 'ढलान के ऊपर की ओर अवरोधक बल', color: '#f59e0b' },
      { text: 'भार घटक (mg·sinθ)', description: 'ढलान के अनुदिश गुरुत्व बल', color: '#f43f5e' },
    ],
  },
  {
    id: 'diag-pulley',
    type: 'pulley',
    title: 'घिरनी निकाय एवं डोरी में तनाव (Pulley Dynamics & String Tension)',
    caption: 'दो द्रव्यमान m₁ और m₂ एक घर्षण रहित घिरनी पर लटके हुए हैं। डोरी में तनाव T दोनों ओर समान रहता है। द्रव्यमान अंतर के कारण निकाय में त्वरण उत्पन्न होता है: a = (m₂ - m₁)g / (m₁ + m₂)।',
    subject: 'Physics',
    labels: [
      { text: 'डोरी का तनाव (T)', description: 'अवितान्य डोरी में खिंचाव बल', color: '#fbbf24' },
      { text: 'गुरुत्व भार (m·g)', description: 'अधोमुखी गुरुत्वाकर्षण बल', color: '#ef4444' },
      { text: 'त्वरण (a)', description: 'निकाय का कुल परिणामी त्वरण', color: '#38bdf8' },
    ],
  },
  {
    id: 'diag-lens',
    type: 'lens_optics',
    title: 'किरण प्रकाशिकी: उत्तल लेंस द्वारा प्रतिबिंब निर्माण (Convex Lens Ray Optics)',
    caption: 'जब वस्तु को 2F₁ पर रखा जाता है, तो लेंस के दूसरी ओर 2F₂ पर वास्तविक, उल्टा और वस्तु के ठीक बराबर आकार का प्रतिबिंब बनता है। आवर्धन m = -1 होता है।',
    subject: 'Physics',
    labels: [
      { text: 'बिंब (Object at 2F₁)', description: 'प्रकाश स्रोत वस्तु', color: '#10b981' },
      { text: 'प्रतिबिंब (Real Image at 2F₂)', description: 'वास्तविक, उल्टा व बराबर आकार का बिंब', color: '#a855f7' },
      { text: 'मुख्य फोकस (F₁, F₂)', description: 'लेंस के सममित फोकस बिंदु', color: '#fbbf24' },
    ],
  },
  {
    id: 'diag-circuit',
    type: 'electric_circuit',
    title: 'विद्युत परिपथ: श्रेणीक्रम प्रतिरोध एवं ओम का नियम (Electric Circuit)',
    caption: 'DC विद्युत स्रोत से जुड़े श्रेणीक्रम प्रतिरोध R₁ और R₂। परिपथ में कुल तुल्य प्रतिरोध R = R₁ + R₂ होता है और संपूर्ण परिपथ में धारा I = V / R एकसमान प्रवाहित होती है।',
    subject: 'Physics',
    labels: [
      { text: 'वोल्टेज स्रोत (V)', description: 'विद्युत विभवांतर DC आपूर्ति', color: '#10b981' },
      { text: 'श्रेणी प्रतिरोध (R₁, R₂)', description: 'धारा के प्रवाह में क्रमिक अवरोध', color: '#f59e0b' },
      { text: 'विद्युत धारा (I)', description: 'परिपथ में प्रवाहित इलेक्ट्रॉन धारा', color: '#e2e8f0' },
    ],
  },
  {
    id: 'diag-dna',
    type: 'dna_helix',
    title: 'डीएनए की द्विकुंडलिनी संरचना (DNA Double Helix Structure)',
    caption: 'वाटसन और क्रिक मॉडल के अनुसार DNA दो पूरक पॉलीपेप्टाइड श्रृंखलाओं से बना होता है। क्षार युग्मन नियम: एडेनिन थाइमिन से (A = T) दो हाइड्रोजन बंधों द्वारा, और ग्वानिन साइटोसिन से (G ≡ C) तीन हाइड्रोजन बंधों द्वारा जुड़ा होता है।',
    subject: 'Biology',
    labels: [
      { text: 'A = T युग्म', description: 'दोहरे हाइड्रोजन बंध द्वारा जुड़ा बेस पेयर', color: '#10b981' },
      { text: 'G ≡ C युग्म', description: 'तिहरे हाइड्रोजन बंध द्वारा जुड़ा बेस पेयर', color: '#f59e0b' },
      { text: 'हेलिकल बैकबोन', description: 'शर्करा और फॉस्फेट की रीढ़', color: '#818cf8' },
    ],
  },
  {
    id: 'diag-cell',
    type: 'cell_structure',
    title: 'कोशिका संरचना एवं प्रमुख अंगक (Cell Anatomy & Organelles)',
    caption: 'जीवन की मूलभूत इकाई कोशिका। केंद्रक (Nucleus) कोशिका की सभी जैविक क्रियाओं और आनुवंशिक सूचनाओं का नियंत्रण केंद्र है, जबकि माइटोकॉन्ड्रिया (Mitochondria) ATP के रूप में ऊर्जा का उत्पादन करता है।',
    subject: 'Biology',
    labels: [
      { text: 'केंद्रक (Nucleus)', description: 'आनुवंशिक DNA एवं नियंत्रण केंद्र', color: '#818cf8' },
      { text: 'माइटोकॉन्ड्रिया', description: 'कोशिका का पावरहाउस (ATP उत्पादन)', color: '#f43f5e' },
      { text: 'कोशिका झिल्ली', description: 'पदार्थों के आवागमन की सुरक्षा दीवार', color: '#6366f1' },
    ],
  },
  {
    id: 'diag-benzene',
    type: 'benzene_ring',
    title: 'बेंजीन (C₆H₆) की अनुनाद संरचना (Benzene Resonance Hybrid)',
    caption: 'बेंजीन की षट्कोणीय वलय संरचना में 6 sp² संकरित कार्बन परमाणु होते हैं। इसके 6 पाई-इलेक्ट्रॉन पूरे वलय पर समान रूप से विस्थानीकृत (delocalized) होते हैं, जिससे इसे विशेष एरोमैटिक स्थायित्व प्राप्त होता है।',
    subject: 'Chemistry',
    labels: [
      { text: 'विस्थानीकृत इलेक्ट्रॉन वलय', description: '6 पाई-इलेक्ट्रॉनों का सममित बादल', color: '#10b981' },
      { text: 'अनुनाद संकर (Resonance)', description: 'कैकुले संरचनाओं का वास्तविक औसत रूप', color: '#818cf8' },
    ],
  },
  {
    id: 'diag-tree',
    type: 'binary_tree',
    title: 'स्व-संतुलित बाइनरी सर्च ट्री (AVL Tree Data Structure)',
    caption: 'बाइनरी सर्च ट्री जिसमें प्रत्येक नोड पर बायां बच्चा छोटा और दायां बच्चा बड़ा होता है। AVL ट्री रोटेशन द्वारा संतुलन गुणांक ∈ {-1, 0, 1} बनाए रखता है, जिससे खोज की समय जटिलता हमेशा O(log n) रहती है।',
    subject: 'Computer Science',
    labels: [
      { text: 'बैलेंस फैक्टर (BF)', description: 'बाएं सबट्री की ऊंचाई - दाएं सबट्री की ऊंचाई', color: '#fbbf24' },
      { text: 'लॉगरिदमिक खोज (O(log n))', description: 'शीघ्र डेटा सर्च एवं इंसर्शन गारंटी', color: '#38bdf8' },
    ],
  },
];

interface ConceptVisualizerProps {
  onAskInChat?: (topicTitle: string) => void;
}

export const ConceptVisualizer: React.FC<ConceptVisualizerProps> = ({ onAskInChat }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activeDiagramId, setActiveDiagramId] = useState<string>(PREBUILT_DIAGRAMS[0].id);

  const subjects = ['all', 'Mathematics', 'Physics', 'Biology', 'Chemistry', 'Computer Science'];

  const filteredDiagrams = PREBUILT_DIAGRAMS.filter((d) => {
    if (selectedSubject === 'all') return true;
    return d.subject.toLowerCase() === selectedSubject.toLowerCase();
  });

  const activeDiagram = PREBUILT_DIAGRAMS.find((d) => d.id === activeDiagramId) || PREBUILT_DIAGRAMS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Interactive Visual Concept Models</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Visual Diagrams & Interactive Learning Models
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          High-yield visual illustrations for complex equations, physical systems, biological anatomies, and algorithmic data structures with bilingual explanations.
        </p>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/90 shadow-2xs">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => {
              setSelectedSubject(sub);
              const first = PREBUILT_DIAGRAMS.find((d) => sub === 'all' || d.subject.toLowerCase() === sub.toLowerCase());
              if (first) setActiveDiagramId(first.id);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${
              selectedSubject === sub
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {sub === 'all' ? 'All Subjects' : sub}
          </button>
        ))}
      </div>

      {/* Main Visualizer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Thumbnails List */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
          {filteredDiagrams.map((d) => {
            const isSelected = d.id === activeDiagram.id;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDiagramId(d.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-700 text-[11px] uppercase tracking-wide">
                    {d.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Interactive</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                  {d.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {d.caption}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Active Diagram Viewport */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{activeDiagram.title}</h3>
                <span className="text-xs text-indigo-600 font-medium">{activeDiagram.subject} Concept Visualization</span>
              </div>
              {onAskInChat && (
                <button
                  onClick={() => onAskInChat(activeDiagram.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Tutor About This</span>
                </button>
              )}
            </div>

            {/* Render Canvas */}
            <DiagramViewer diagram={activeDiagram} />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Visual diagrams are automatically rendered in the learning workspace when relevant topics are discussed.</span>
            <span className="font-mono text-[11px] text-indigo-600 font-medium">Bilingual Labels</span>
          </div>
        </div>
      </div>
    </div>
  );
};
