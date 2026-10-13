import React from 'react';
import { EducationalDiagram } from '../../types/index.ts';
import { Layers, Eye, Sparkles, ZoomIn, Info } from 'lucide-react';

interface DiagramViewerProps {
  diagram: EducationalDiagram;
  className?: string;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ diagram, className = '' }) => {
  return (
    <div className={`my-3 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white text-xs block">{diagram.title}</span>
            <span className="text-[10px] text-slate-400 capitalize">{diagram.subject} · Interactive Visual Diagram</span>
          </div>
        </div>

        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded font-mono">
          Visual Model
        </span>
      </div>

      {/* Diagram Canvas Viewport */}
      <div className="bg-slate-950 rounded-xl p-3 sm:p-4 flex items-center justify-center min-h-[220px] overflow-x-auto border border-slate-800/80">
        {diagram.type === 'parabola' && <ParabolaDiagram parameters={diagram.parameters} />}
        {diagram.type === 'free_body' && <FreeBodyDiagram />}
        {diagram.type === 'pulley' && <PulleyDiagram />}
        {diagram.type === 'lens_optics' && <LensOpticsDiagram />}
        {diagram.type === 'electric_circuit' && <CircuitDiagram />}
        {diagram.type === 'dna_helix' && <DnaHelixDiagram />}
        {diagram.type === 'cell_structure' && <CellStructureDiagram />}
        {diagram.type === 'benzene_ring' && <BenzeneDiagram />}
        {diagram.type === 'binary_tree' && <BinaryTreeDiagram />}
      </div>

      {/* Caption & Explanatory Labels */}
      <div className="mt-3 space-y-2">
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {diagram.caption}
        </p>

        {diagram.labels && diagram.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
            {diagram.labels.map((lbl, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg text-slate-300"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lbl.color || '#818cf8' }} />
                <strong className="text-white font-medium">{lbl.text}:</strong>
                <span className="text-slate-400">{lbl.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 1. Quadratic Parabola Curve
function ParabolaDiagram({ parameters }: { parameters?: any }) {
  const root1 = parameters?.root1 ?? 2;
  const root2 = parameters?.root2 ?? 3;
  return (
    <svg viewBox="0 0 360 200" className="w-full max-w-sm h-auto select-none font-sans">
      {/* Grid */}
      <line x1="20" y1="140" x2="340" y2="140" stroke="#334155" strokeWidth="1.5" />
      <line x1="100" y1="20" x2="100" y2="185" stroke="#334155" strokeWidth="1.5" />
      <polygon points="340,140 332,136 332,144" fill="#334155" />
      <polygon points="100,20 96,28 104,28" fill="#334155" />

      {/* Axis Labels */}
      <text x="330" y="155" fill="#94a3b8" fontSize="10">X-Axis</text>
      <text x="108" y="28" fill="#94a3b8" fontSize="10">Y-Axis</text>
      <text x="90" y="152" fill="#64748b" fontSize="9">O(0,0)</text>

      {/* Parabola Curve: y = (x-2)(x-3) */}
      <path
        d="M 60,35 Q 180,240 300,35"
        fill="none"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Axis of Symmetry: x = 2.5 */}
      <line x1="180" y1="35" x2="180" y2="175" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="186" y="55" fill="#f59e0b" fontSize="9" fontWeight="bold">Axis: x = -b/(2a)</text>

      {/* Roots x1 and x2 */}
      <circle cx="150" cy="140" r="4.5" fill="#10b981" />
      <text x="140" y="130" fill="#10b981" fontSize="10" fontWeight="bold">x₁ = {root1}</text>

      <circle cx="210" cy="140" r="4.5" fill="#10b981" />
      <text x="215" y="130" fill="#10b981" fontSize="10" fontWeight="bold">x₂ = {root2}</text>

      {/* Vertex */}
      <circle cx="180" cy="165" r="4.5" fill="#ef4444" />
      <text x="188" y="172" fill="#ef4444" fontSize="10" fontWeight="bold">Vertex (-b/2a, -D/4a)</text>

      {/* Equation Label */}
      <text x="215" y="45" fill="#a5b4fc" fontSize="11" fontWeight="bold">y = ax² + bx + c (a &gt; 0)</text>
    </svg>
  );
}

// 2. Physics: Free Body Diagram (FBD)
function FreeBodyDiagram() {
  return (
    <svg viewBox="0 0 340 210" className="w-full max-w-sm h-auto select-none font-sans">
      {/* Inclined Plane */}
      <polygon points="40,170 300,170 300,60" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <text x="75" y="165" fill="#94a3b8" fontSize="11">θ</text>
      <path d="M 65,170 A 25,25 0 0,0 60,158" fill="none" stroke="#94a3b8" strokeWidth="1" />

      {/* Block (Mass m) */}
      <g transform="translate(160, 115) rotate(-26)">
        <rect x="-24" y="-18" width="48" height="36" rx="4" fill="#6366f1" stroke="#818cf8" strokeWidth="2" />
        <text x="-8" y="5" fill="#ffffff" fontSize="12" fontWeight="bold">m</text>

        {/* Normal Force N (perpendicular upwards) */}
        <line x1="0" y1="-18" x2="0" y2="-62" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
        <text x="5" y="-55" fill="#10b981" fontSize="10" fontWeight="bold">N (Normal)</text>

        {/* Friction force f (up the incline) */}
        <line x1="-24" y1="0" x2="-62" y2="0" stroke="#f59e0b" strokeWidth="2" />
        <text x="-65" y="-6" fill="#f59e0b" fontSize="10" fontWeight="bold">f (Friction)</text>

        {/* Down the incline component mg*sin(theta) */}
        <line x1="24" y1="0" x2="62" y2="0" stroke="#f43f5e" strokeWidth="2" />
        <text x="66" y="5" fill="#f43f5e" fontSize="9" fontWeight="bold">mg·sinθ</text>
      </g>

      {/* True Gravity mg downwards */}
      <line x1="160" y1="115" x2="160" y2="185" stroke="#ef4444" strokeWidth="2.5" />
      <polygon points="160,187 156,177 164,177" fill="#ef4444" />
      <text x="168" y="175" fill="#ef4444" fontSize="11" fontWeight="bold">W = mg</text>
    </svg>
  );
}

// 3. Physics: Pulley System
function PulleyDiagram() {
  return (
    <svg viewBox="0 0 320 200" className="w-full max-w-sm h-auto select-none font-sans">
      {/* Ceiling */}
      <line x1="100" y1="20" x2="220" y2="20" stroke="#94a3b8" strokeWidth="3" />
      <line x1="160" y1="20" x2="160" y2="50" stroke="#64748b" strokeWidth="2" />

      {/* Pulley Wheel */}
      <circle cx="160" cy="65" r="18" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="160" cy="65" r="3" fill="#cbd5e1" />

      {/* Rope */}
      <line x1="142" y1="65" x2="142" y2="120" stroke="#fbbf24" strokeWidth="2" />
      <line x1="178" y1="65" x2="178" y2="145" stroke="#fbbf24" strokeWidth="2" />

      {/* Mass m1 */}
      <rect x="127" y="120" width="30" height="28" rx="3" fill="#6366f1" stroke="#818cf8" strokeWidth="1.5" />
      <text x="134" y="138" fill="#ffffff" fontSize="10" fontWeight="bold">m₁</text>
      <text x="110" y="95" fill="#fbbf24" fontSize="9">T (Tension)</text>
      <text x="128" y="165" fill="#ef4444" fontSize="9">m₁g</text>

      {/* Mass m2 (heavier) */}
      <rect x="163" y="145" width="30" height="32" rx="3" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
      <text x="170" y="165" fill="#ffffff" fontSize="10" fontWeight="bold">m₂</text>
      <text x="195" y="95" fill="#fbbf24" fontSize="9">T (Tension)</text>
      <text x="165" y="192" fill="#ef4444" fontSize="9">m₂g</text>

      {/* Acceleration arrow */}
      <text x="215" y="145" fill="#38bdf8" fontSize="10" fontWeight="bold">a ↓ (m₂ &gt; m₁)</text>
    </svg>
  );
}

// 4. Ray Optics / Lens
function LensOpticsDiagram() {
  return (
    <svg viewBox="0 0 360 180" className="w-full max-w-sm h-auto select-none font-sans">
      {/* Principal Axis */}
      <line x1="10" y1="90" x2="350" y2="90" stroke="#475569" strokeWidth="1.5" />

      {/* Convex Lens */}
      <path d="M 180,20 Q 192,90 180,160 Q 168,90 180,20 Z" fill="#6366f1" fillOpacity="0.25" stroke="#818cf8" strokeWidth="2" />
      <line x1="180" y1="15" x2="180" y2="165" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" />

      {/* Focal points */}
      <circle cx="120" cy="90" r="3" fill="#fbbf24" />
      <text x="116" y="105" fill="#fbbf24" fontSize="9">F₁</text>
      <circle cx="60" cy="90" r="3" fill="#fbbf24" />
      <text x="54" y="105" fill="#fbbf24" fontSize="9">2F₁</text>

      <circle cx="240" cy="90" r="3" fill="#fbbf24" />
      <text x="236" y="105" fill="#fbbf24" fontSize="9">F₂</text>
      <circle cx="300" cy="90" r="3" fill="#fbbf24" />
      <text x="294" y="105" fill="#fbbf24" fontSize="9">2F₂</text>

      {/* Object Arrow (at 2F1) */}
      <line x1="60" y1="90" x2="60" y2="45" stroke="#10b981" strokeWidth="3" />
      <polygon points="60,40 56,48 64,48" fill="#10b981" />
      <text x="46" y="38" fill="#10b981" fontSize="9" fontWeight="bold">Object</text>

      {/* Ray 1: Parallel to axis -> Passes through F2 */}
      <line x1="60" y1="45" x2="180" y2="45" stroke="#ef4444" strokeWidth="1.5" />
      <line x1="180" y1="45" x2="300" y2="135" stroke="#ef4444" strokeWidth="1.5" />

      {/* Ray 2: Through optical center (undeviated) */}
      <line x1="60" y1="45" x2="300" y2="135" stroke="#38bdf8" strokeWidth="1.5" />

      {/* Real Inverted Image (at 2F2) */}
      <line x1="300" y1="90" x2="300" y2="135" stroke="#a855f7" strokeWidth="3" />
      <polygon points="300,140 296,132 304,132" fill="#a855f7" />
      <text x="290" y="155" fill="#a855f7" fontSize="9" fontWeight="bold">Image (Real)</text>
    </svg>
  );
}

// 5. Electric Circuit Diagram
function CircuitDiagram() {
  return (
    <svg viewBox="0 0 320 180" className="w-full max-w-sm h-auto select-none font-sans">
      {/* Circuit loop */}
      <rect x="40" y="30" width="240" height="120" fill="none" stroke="#64748b" strokeWidth="2" rx="6" />

      {/* Battery (left branch) */}
      <rect x="36" y="70" width="8" height="40" fill="#090d16" />
      <line x1="34" y1="78" x2="46" y2="78" stroke="#10b981" strokeWidth="3" />
      <line x1="38" y1="88" x2="42" y2="88" stroke="#ef4444" strokeWidth="2" />
      <text x="12" y="85" fill="#10b981" fontSize="9" fontWeight="bold">+ V -</text>

      {/* Resistor R1 (top branch) */}
      <rect x="130" y="24" width="60" height="12" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="145" y="20" fill="#f59e0b" fontSize="10" fontWeight="bold">R₁</text>

      {/* Resistor R2 (bottom branch) */}
      <rect x="130" y="144" width="60" height="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="145" y="170" fill="#38bdf8" fontSize="10" fontWeight="bold">R₂</text>

      {/* Current I arrow */}
      <polygon points="210,30 200,26 200,34" fill="#e2e8f0" />
      <text x="215" y="26" fill="#e2e8f0" fontSize="9">Current I</text>
    </svg>
  );
}

// 6. Biology: DNA Double Helix
function DnaHelixDiagram() {
  return (
    <svg viewBox="0 0 320 160" className="w-full max-w-sm h-auto select-none font-sans">
      {/* Strands */}
      <path d="M 20,40 Q 90,120 160,40 Q 230,120 300,40" fill="none" stroke="#818cf8" strokeWidth="3" />
      <path d="M 20,120 Q 90,40 160,120 Q 230,40 300,120" fill="none" stroke="#c084fc" strokeWidth="3" />

      {/* Base pairs rungs */}
      <line x1="55" y1="65" x2="55" y2="95" stroke="#10b981" strokeWidth="2.5" />
      <text x="46" y="83" fill="#10b981" fontSize="9">A=T</text>

      <line x1="125" y1="65" x2="125" y2="95" stroke="#f59e0b" strokeWidth="2.5" />
      <text x="116" y="83" fill="#f59e0b" fontSize="9">G≡C</text>

      <line x1="195" y1="65" x2="195" y2="95" stroke="#10b981" strokeWidth="2.5" />
      <text x="186" y="83" fill="#10b981" fontSize="9">T=A</text>

      <line x1="265" y1="65" x2="265" y2="95" stroke="#f59e0b" strokeWidth="2.5" />
      <text x="256" y="83" fill="#f59e0b" fontSize="9">C≡G</text>

      <text x="100" y="25" fill="#a5b4fc" fontSize="10" fontWeight="bold">Major & Minor Grooves (Double Helix)</text>
    </svg>
  );
}

// 7. Biology: Animal Cell Structure
function CellStructureDiagram() {
  return (
    <svg viewBox="0 0 320 180" className="w-full max-w-sm h-auto select-none font-sans">
      {/* Cell Membrane */}
      <ellipse cx="160" cy="90" rx="140" ry="75" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
      <text x="35" y="45" fill="#a5b4fc" fontSize="9">Plasma Membrane</text>

      {/* Nucleus */}
      <circle cx="150" cy="90" r="32" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
      <circle cx="150" cy="90" r="12" fill="#4338ca" />
      <text x="135" y="94" fill="#ffffff" fontSize="9" fontWeight="bold">Nucleus</text>

      {/* Mitochondria */}
      <ellipse cx="235" cy="65" rx="18" ry="9" fill="#831843" stroke="#f43f5e" strokeWidth="1.5" />
      <text x="210" y="52" fill="#f43f5e" fontSize="9">Mitochondria</text>

      {/* Ribosomes / Endoplasmic reticulum dots */}
      <circle cx="95" cy="80" r="2.5" fill="#fbbf24" />
      <circle cx="90" cy="110" r="2.5" fill="#fbbf24" />
      <circle cx="110" cy="130" r="2.5" fill="#fbbf24" />
      <text x="65" y="145" fill="#fbbf24" fontSize="9">Cytoplasm & Ribosomes</text>
    </svg>
  );
}

// 8. Chemistry: Benzene Ring
function BenzeneDiagram() {
  return (
    <svg viewBox="0 0 280 170" className="w-full max-w-sm h-auto select-none font-sans">
      {/* Kekule structure */}
      <g transform="translate(80, 85)">
        <polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="none" stroke="#818cf8" strokeWidth="2" />
        <line x1="-28" y1="-16" x2="-28" y2="16" stroke="#818cf8" strokeWidth="2" />
        <line x1="2" y1="-34" x2="30" y2="-18" stroke="#818cf8" strokeWidth="2" />
        <line x1="2" y1="34" x2="30" y2="18" stroke="#818cf8" strokeWidth="2" />
        <text x="-25" y="55" fill="#94a3b8" fontSize="9">Kekulé Structure</text>
      </g>

      <text x="135" y="90" fill="#a5b4fc" fontSize="16">⇄</text>

      {/* Resonance Hybrid */}
      <g transform="translate(200, 85)">
        <polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="none" stroke="#10b981" strokeWidth="2" />
        <circle cx="0" cy="0" r="22" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="-35" y="55" fill="#34d399" fontSize="9">Resonance Hybrid (C₆H₆)</text>
      </g>
    </svg>
  );
}

// 9. CS: Binary Tree / AVL Tree
function BinaryTreeDiagram() {
  return (
    <svg viewBox="0 0 320 180" className="w-full max-w-sm h-auto select-none font-sans">
      {/* Root Node: 50 */}
      <circle cx="160" cy="35" r="16" fill="#6366f1" stroke="#818cf8" strokeWidth="2" />
      <text x="153" y="40" fill="#ffffff" fontSize="11" fontWeight="bold">50</text>
      <text x="145" y="15" fill="#fbbf24" fontSize="9">BF: 0</text>

      {/* Branches to level 2 */}
      <line x1="148" y1="47" x2="95" y2="85" stroke="#64748b" strokeWidth="2" />
      <line x1="172" y1="47" x2="225" y2="85" stroke="#64748b" strokeWidth="2" />

      {/* Left Child: 30 */}
      <circle cx="90" cy="95" r="15" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
      <text x="83" y="99" fill="#ffffff" fontSize="11" fontWeight="bold">30</text>

      {/* Right Child: 70 */}
      <circle cx="230" cy="95" r="15" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
      <text x="223" y="99" fill="#ffffff" fontSize="11" fontWeight="bold">70</text>

      {/* Branches to level 3 */}
      <line x1="80" y1="107" x2="50" y2="140" stroke="#64748b" strokeWidth="1.5" />
      <line x1="100" y1="107" x2="130" y2="140" stroke="#64748b" strokeWidth="1.5" />

      {/* Leaves */}
      <circle cx="45" cy="148" r="12" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
      <text x="39" y="152" fill="#ffffff" fontSize="9" fontWeight="bold">20</text>

      <circle cx="135" cy="148" r="12" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
      <text x="129" y="152" fill="#ffffff" fontSize="9" fontWeight="bold">40</text>

      <text x="180" y="152" fill="#94a3b8" fontSize="10">O(log n) Guaranteed Height</text>
    </svg>
  );
}
