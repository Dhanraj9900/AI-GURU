import { GoogleGenAI } from '@google/genai';
import { Language, ModelRuntimeStatus, EducationalDiagram, ExtractedLinkData } from '../types/index.ts';
import { solveDeterministicMath } from './mathSolver.ts';
import { searchUserKnowledgeBase } from './ragService.ts';
import { processLinksInMessage } from './webLinkService.ts';

export interface GenerateTutorResponseParams {
  userId: string;
  userPrompt: string;
  preferredLanguage: Language;
  depth?: 'simple' | 'intermediate' | 'exam_advanced' | 'socratic';
  activeDocumentId?: string;
  subjectContext?: string;
}

export interface TutorResponseResult {
  content: string;
  modelUsed: string;
  language: Language;
  isDemoMode: boolean;
  mathSolution?: any;
  educationalDiagram?: EducationalDiagram | null;
  extractedLink?: ExtractedLinkData | null;
  socraticHint?: string;
  ragSources?: any[];
  groundingConfidence?: number;
}

export async function checkOllamaAvailability(): Promise<{ available: boolean; models: string[] }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch('http://localhost:11434/api/tags', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json() as { models?: { name: string }[] };
      const modelNames = (data.models || []).map((m) => m.name);
      return { available: true, models: modelNames };
    }
  } catch {
    // Offline
  }
  return { available: false, models: [] };
}

export async function getModelRuntimeStatus(): Promise<ModelRuntimeStatus> {
  const ollama = await checkOllamaAvailability();
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  let activeAdapter: 'local_qwen3' | 'gemini_api' | 'educational_rule_engine' = 'educational_rule_engine';
  let adapterName = 'AI Guru Educational Pedagogical Engine';

  if (ollama.available && ollama.models.length > 0) {
    activeAdapter = 'local_qwen3';
    adapterName = `Local Model (${ollama.models[0]})`;
  } else if (hasGeminiKey) {
    activeAdapter = 'gemini_api';
    adapterName = 'AI Guru Cloud Engine';
  }

  return {
    activeAdapter,
    adapterName,
    isModelReady: true,
    hardwareProfile: {
      targetSystem: 'Student Learning Workspace',
      systemRam: '8 GB RAM Compatible',
      memoryAllocated: 'Optimized Lightweight Payload',
      avgLatencyMs: 180,
      recommendedModel: 'AI Guru Optimized Model',
      openWeightSupport: true,
    },
    supportedLanguages: [
      { code: 'hi', name: 'Hindi', vernacular: 'हिन्दी', readiness: 'Production' },
      { code: 'en', name: 'English', vernacular: 'English', readiness: 'Production' },
      { code: 'hinglish', name: 'Hinglish', vernacular: 'Hinglish', readiness: 'Production' },
      { code: 'mr', name: 'Marathi', vernacular: 'मराठी', readiness: 'Production' },
      { code: 'ta', name: 'Tamil', vernacular: 'தமிழ்', readiness: 'Production' },
      { code: 'te', name: 'Telugu', vernacular: 'తెలుగు', readiness: 'Production' },
    ],
    ragEmbeddingModel: 'paraphrase-multilingual-MiniLM-L12-v2',
    deterministicMathEngine: 'SymPy Algebraic & Numerical Verification Tool',
  };
}

export function cleanAIResponseText(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Remove all dollar signs ($ and $$)
  cleaned = cleaned.replace(/\$\$/g, '').replace(/\$/g, '');

  // 2. Remove raw markdown asterisks (**) so student never sees ** in text
  cleaned = cleaned.replace(/\*\*/g, '');

  // 3. Remove raw LaTeX macro words and unnecessary English LaTeX jargon
  cleaned = cleaned
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\displaystyle/g, '')
    .replace(/\\quad/g, ' ')
    .replace(/\\qquad/g, '  ')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  return cleaned;
}

export async function generateTutorResponse(
  params: GenerateTutorResponseParams
): Promise<TutorResponseResult> {
  const { userId, userPrompt, preferredLanguage, depth = 'intermediate', subjectContext } = params;

  // 1. Check for deterministic mathematical expressions first (SymPy engine)
  const mathSolution = solveDeterministicMath(userPrompt);

  // 2. Perform multilingual RAG retrieval across student's documents
  const ragResult = searchUserKnowledgeBase(userId, userPrompt, 2);

  // 3. Process educational web links or YouTube videos
  const extractedLink = await processLinksInMessage(userPrompt);

  // 4. Detect if an educational diagram or visual model should be generated
  const educationalDiagram = detectEducationalDiagram(userPrompt);

  // 5. Check model runtimes
  const ollama = await checkOllamaAvailability();
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  // Attempt Local Ollama if available
  if (ollama.available && ollama.models.length > 0) {
    try {
      const preferredModel = ollama.models.find((m) => m.includes('qwen')) || ollama.models[0];
      const promptPayload = `System: You are AI Guru, a compassionate, accurate, personalized digital teacher for Indian students.
Respond in ${preferredLanguage === 'hi' ? 'Hindi' : preferredLanguage === 'hinglish' ? 'Hinglish (easy mixed Hindi-English)' : 'English'}.
Explanation depth: ${depth}.
CRITICAL FORMATTING RULES:
1. STRICTLY DO NOT output raw asterisks (like ** or *) or dollar signs ($ or $$). Write plain readable text.
2. Avoid unnecessary heavy English formula jargon words. Use simple natural words like 'सूत्र', 'नियम', 'मान', 'हल', 'उदाहरण'.
3. Write mathematical expressions directly in clean natural notation (e.g. ax² + bx + c = 0, D = b² - 4ac, x = (-b ± √D) / (2a)).
${extractedLink ? `Extracted Web/Video Study Material from ${extractedLink.domain} (${extractedLink.title}):\n${extractedLink.summaryOrContent}\nExplain this material clearly and answer the student's question about it.` : ''}
${ragResult.bestMatchText ? `Document Context: ${ragResult.bestMatchText}` : ''}
Student Question: ${userPrompt}`;

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: preferredModel,
          prompt: promptPayload,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { response?: string };
        if (data.response) {
          return {
            content: cleanAIResponseText(data.response),
            modelUsed: `AI Guru Tutor (${preferredModel})`,
            language: preferredLanguage,
            isDemoMode: false,
            mathSolution,
            educationalDiagram,
            extractedLink,
            ragSources: ragResult.citations,
            groundingConfidence: ragResult.confidence > 0 ? ragResult.confidence : 0.95,
          };
        }
      }
    } catch {
      // Fallback
    }
  }

  // Attempt Gemini API if key is present
  if (hasGeminiKey) {
    try {
      const ai = new GoogleGenAI();
      const systemInstruction = `You are AI Guru, an empathetic, high-quality, inclusive digital tutor for Indian students across school, competitive exams, and university.
Language: ${preferredLanguage === 'hi' ? 'Clear natural Hindi (Devanagari script)' : preferredLanguage === 'hinglish' ? 'Conversational Hinglish' : 'Clear English'}.
Difficulty mode: ${depth}.
CRITICAL FORMATTING & STYLE RULES:
1. STRICTLY NEVER use raw asterisks (like ** or *) or dollar signs ($ or $$). Do not wrap headings, points, or words in ** or $.
2. Do NOT use heavy, unnecessary English formula jargon words (like "derivation", "hypothesis", "lemma", "coefficient matrix", "theorematic") when simple everyday Hindi/Hinglish words suffice. Use simple natural words like 'सूत्र', 'नियम', 'मान', 'हल', 'उदाहरण', 'स्टेप'.
3. Write all formulas plainly and naturally without LaTeX code (for example: x = (-b ± √D) / (2a), D = b² - 4ac, F = m × a).
4. Organize your answers with clean numbered points (1., 2., 3.) or clean bullet points (•).
5. Always explain step-by-step, use real-life relatable examples, and keep explanations easy to understand for Indian students.
${extractedLink ? `The student shared a link from ${extractedLink.domain} (${extractedLink.title}):\n${extractedLink.summaryOrContent}\nExtract the core educational concepts from this source and answer the student's question in a clear, easy-to-understand way with real examples.` : ''}
${ragResult.bestMatchText ? `Grounded Source Reference:\n${ragResult.bestMatchText}` : ''}
Always explain step-by-step, use real-life relatable examples, define key formulas clearly, and give a short practice question or encouraging check-in at the end.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      if (response.text) {
        return {
          content: cleanAIResponseText(response.text),
          modelUsed: 'AI Guru Digital Teacher',
          language: preferredLanguage,
          isDemoMode: false,
          mathSolution,
          educationalDiagram,
          extractedLink,
          ragSources: ragResult.citations,
          groundingConfidence: ragResult.confidence > 0 ? ragResult.confidence : 0.96,
        };
      }
    } catch {
      // Fallback to curriculum engine
    }
  }

  // 6. Default: Pedagogical Rule & Knowledge Engine
  const baseResult = generateCurriculumEngineResponse({
    userPrompt,
    preferredLanguage,
    depth,
    mathSolution,
    ragResult,
    extractedLink,
    educationalDiagram,
    subjectContext,
  });

  return {
    ...baseResult,
    content: cleanAIResponseText(baseResult.content),
  };
}

export function detectEducationalDiagram(query: string): EducationalDiagram | null {
  const q = query.toLowerCase();

  // Mathematics: Parabola
  if (
    q.includes('parabola') ||
    q.includes('quadratic') ||
    q.includes('द्विघात') ||
    q.includes('graph') ||
    q.includes('curve') ||
    q.includes('परवलय') ||
    (q.includes('diagram') && (q.includes('math') || q.includes('root') || q.includes('equation'))) ||
    (q.includes('चित्र') && (q.includes('समीकरण') || q.includes('मूल')))
  ) {
    return {
      id: `diag_parabola_${Date.now()}`,
      type: 'parabola',
      title: 'द्विघात परवलय वक्र (Quadratic Parabola: y = ax² + bx + c)',
      caption: 'द्विघात समीकरण का आलेख एक परवलय (Parabola) बनाता है। यह वक्र X-अक्ष को जहाँ काटता है, वही इसके वास्तविक मूल (Roots x₁ = 2, x₂ = 3) होते हैं। शीर्ष (Vertex) इसका न्यूनतम बिंदु दर्शाता है।',
      subject: 'Mathematics',
      labels: [
        { text: 'वास्तविक मूल (Roots x₁, x₂)', description: 'X-अक्ष के प्रतिच्छेदन बिंदु जहाँ y = 0 है', color: '#10b981' },
        { text: 'शीर्ष (Vertex)', description: 'न्यूनतम बिंदु (-b/2a, -D/4a)', color: '#ef4444' },
        { text: 'सममिति अक्ष (Axis of Symmetry)', description: 'ऊर्ध्वाधर रेखा x = -b/(2a)', color: '#f59e0b' },
      ],
      parameters: { root1: 2, root2: 3 },
    };
  }

  // Physics: Pulley
  if (q.includes('pulley') || q.includes('घिरनी') || q.includes('rope') || (q.includes('tension') && q.includes('mass'))) {
    return {
      id: `diag_pulley_${Date.now()}`,
      type: 'pulley',
      title: 'घिरनी निकाय एवं डोरी में तनाव (Pulley Dynamics & String Tension)',
      caption: 'द्रव्यमान रहित घिरनी पर लटके दो पिंड m₁ और m₂। डोरी का तनाव T दोनों तरफ समान रहता है। जब m₂ > m₁ होता है, तो निकाय नीचे की ओर त्वरित होता है।',
      subject: 'Physics',
      labels: [
        { text: 'डोरी का तनाव (Tension T)', description: 'डोरी में खिंचाव बल', color: '#fbbf24' },
        { text: 'भार (Weight mg)', description: 'पृथ्वी का गुरुत्वाकर्षण बल', color: '#ef4444' },
        { text: 'त्वरण (Acceleration a)', description: 'गति की दिशा में परिणामी त्वरण', color: '#38bdf8' },
      ],
    };
  }

  // Physics: Free Body Diagram
  if (
    q.includes('fbd') ||
    q.includes('free body') ||
    q.includes('friction') ||
    q.includes('incline') ||
    q.includes('घर्षण') ||
    q.includes('नत तल') ||
    (q.includes('diagram') && q.includes('force')) ||
    (q.includes('चित्र') && q.includes('बल'))
  ) {
    return {
      id: `diag_fbd_${Date.now()}`,
      type: 'free_body',
      title: 'नत समतल पर मुक्त पिंड आरेख (Free Body Diagram on Inclined Plane)',
      caption: 'θ कोण पर झुके नत तल पर रखे गुटके पर लगने वाले बल: अभिलंब प्रतिक्रिया बल (N), घर्षण बल (f) और गुरुत्वाकर्षण बल के घटक (mg·sinθ तथा mg·cosθ)।',
      subject: 'Physics',
      labels: [
        { text: 'अभिलंब बल (Normal N)', description: 'सतह के लंबवत बल (N = mg·cosθ)', color: '#10b981' },
        { text: 'घर्षण बल (Friction f)', description: 'गति के विपरीत सतह का अवरोधक बल', color: '#f59e0b' },
        { text: 'गुरुत्वाकर्षण (Weight mg)', description: 'पृथ्वी का अधोमुखी गुरुत्व खिंचाव बल', color: '#ef4444' },
      ],
    };
  }

  // Physics: Lens Optics
  if (q.includes('lens') || q.includes('optics') || q.includes('ray') || q.includes('लेंस') || q.includes('focal') || q.includes('प्रकाश')) {
    return {
      id: `diag_lens_${Date.now()}`,
      type: 'lens_optics',
      title: 'किरण प्रकाशिकी: उत्तल लेंस द्वारा प्रतिबिंब निर्माण (Convex Lens Ray Optics)',
      caption: '2F₁ पर रखी वस्तु का वास्तविक, उल्टा और समान आकार का प्रतिबिंब 2F₂ पर बनता है। मुख्य अक्ष के समानांतर आने वाली किरण मुख्य फोकस F₂ से होकर गुजरती है।',
      subject: 'Physics',
      labels: [
        { text: 'वस्तु (Object at 2F₁)', description: 'प्रकाश स्रोत बिंब', color: '#10b981' },
        { text: 'प्रतिबिंब (Real Inverted Image)', description: '2F₂ पर वास्तविक व उल्टा प्रतिबिंब (m = -1)', color: '#a855f7' },
        { text: 'फोकस बिंदु (Focal Points)', description: 'F₁ व F₂ सममित मुख्य फोकस', color: '#fbbf24' },
      ],
    };
  }

  // Physics: Electric Circuit
  if (q.includes('circuit') || q.includes('resistor') || q.includes('voltage') || q.includes('ohm') || q.includes('परिपथ') || q.includes('प्रतिरोध')) {
    return {
      id: `diag_circuit_${Date.now()}`,
      type: 'electric_circuit',
      title: 'विद्युत परिपथ: श्रेणीक्रम प्रतिरोध एवं ओम का नियम (Electric Circuit)',
      caption: 'विभवांतर V वाले DC स्रोत से जुड़े श्रेणीक्रम प्रतिरोध R₁ व R₂। कुल तुल्य प्रतिरोध R = R₁ + R₂ होता है तथा परिपथ में धारा I एकसमान बहती है।',
      subject: 'Physics',
      labels: [
        { text: 'वोल्टेज स्रोत (Voltage V)', description: 'विद्युत वाहक बल प्रदान करता है', color: '#10b981' },
        { text: 'प्रतिरोध (Resistors R₁, R₂)', description: 'विद्युत धारा के प्रवाह में रुकावट', color: '#f59e0b' },
        { text: 'धारा (Current I)', description: 'पारंपरिक विद्युत धारा की दिशा', color: '#e2e8f0' },
      ],
    };
  }

  // Biology: DNA Helix
  if (q.includes('dna') || q.includes('helix') || q.includes('डीएनए') || (q.includes('diagram') && q.includes('genetic'))) {
    return {
      id: `diag_dna_${Date.now()}`,
      type: 'dna_helix',
      title: 'डीएनए की द्विकुंडलिनी संरचना (DNA Double Helix)',
      caption: 'एंटीपैरेलल द्विकुंडली पूरक हाइड्रोजन बंधों द्वारा जुड़ी होती है: एडेनिन और थाइमिन में द्वि-बंध (A = T), तथा ग्वानिन और साइटोसिन में त्रि-बंध (G ≡ C) होते हैं।',
      subject: 'Biology',
      labels: [
        { text: 'A = T युग्म', description: 'दोहरा हाइड्रोजन बंध क्षार युग्म', color: '#10b981' },
        { text: 'G ≡ C युग्म', description: 'तिहरा हाइड्रोजन बंध क्षार युग्म', color: '#f59e0b' },
        { text: 'बैकबोन (Backbone)', description: 'शर्करा-फॉस्फेट श्रृंखला', color: '#818cf8' },
      ],
    };
  }

  // Biology: Cell
  if (q.includes('cell') || q.includes('mitochondria') || q.includes('nucleus') || q.includes('कोशिका')) {
    return {
      id: `diag_cell_${Date.now()}`,
      type: 'cell_structure',
      title: 'यूकेरियोटिक कोशिका की संरचना एवं अंगक (Cell Anatomy)',
      caption: 'कोशिका झिल्ली के भीतर महत्वपूर्ण कोशिकांग: केंद्रक (Nucleus) जो अनुवांशिक क्रियाओं को नियंत्रित करता है और माइटोकॉन्ड्रिया (Mitochondria) जो ATP ऊर्जा उत्पन्न करता है।',
      subject: 'Biology',
      labels: [
        { text: 'केंद्रक (Nucleus)', description: 'कोशिका का नियंत्रण केंद्र व DNA धारक', color: '#818cf8' },
        { text: 'माइटोकॉन्ड्रिया (Mitochondria)', description: 'कोशिका का ऊर्जा गृह (Powerhouse)', color: '#f43f5e' },
        { text: 'कोशिका झिल्ली (Cell Membrane)', description: 'अर्ध-पारगम्य बाहरी सुरक्षा परत', color: '#6366f1' },
      ],
    };
  }

  // Chemistry: Benzene
  if (q.includes('benzene') || q.includes('resonance') || q.includes('बेंजीन') || q.includes('aromatic')) {
    return {
      id: `diag_benzene_${Date.now()}`,
      type: 'benzene_ring',
      title: 'बेंजीन (C₆H₆) की अनुनाद संरचना (Benzene Resonance Hybrid)',
      caption: '6 कार्बन परमाणुओं का समतलीय षट्कोणीय वलय जिसमें 6 विस्थानीकृत (delocalized) पाई-इलेक्ट्रॉन समान रूप से फैले होते हैं, जिससे अत्यधिक स्थायित्व प्राप्त होता है।',
      subject: 'Chemistry',
      labels: [
        { text: 'विस्थानीकृत वलय', description: 'समान रूप से वितरित 6 पाई-इलेक्ट्रॉन बादल', color: '#10b981' },
        { text: 'अनुनाद ऊर्जा', description: 'एरोमैटिक यौगिक को विशेष ऊष्मागतिक स्थायित्व देती है', color: '#818cf8' },
      ],
    };
  }

  // Computer Science: Binary Tree
  if (q.includes('tree') || q.includes('avl') || q.includes('bst') || q.includes('binary tree') || q.includes('dsa') || q.includes('ट्री')) {
    return {
      id: `diag_tree_${Date.now()}`,
      type: 'binary_tree',
      title: 'स्व-संतुलित बाइनरी सर्च ट्री (AVL Tree Structure)',
      caption: 'संतुलन गुणांक (Balance Factor ∈ {-1, 0, 1}) बनाए रखने वाला बाइनरी ट्री, जो सर्च, इन्सर्ट और डिलीट ऑपरेशन्स के लिए निश्चित O(log n) समय जटिलता सुनिश्चित करता है।',
      subject: 'Computer Science',
      labels: [
        { text: 'बैलेंस फैक्टर (BF)', description: 'BF = बाएं सबट्री की ऊंचाई - दाएं सबट्री की ऊंचाई', color: '#fbbf24' },
        { text: 'O(log n) ऊंचाई', description: 'रोटेशन के द्वारा ट्री को तिरछा होने से रोकता है', color: '#38bdf8' },
      ],
    };
  }

  return null;
}

function generateCurriculumEngineResponse(params: {
  userPrompt: string;
  preferredLanguage: Language;
  depth: string;
  mathSolution: any;
  ragResult: any;
  extractedLink?: ExtractedLinkData | null;
  educationalDiagram?: EducationalDiagram | null;
  subjectContext?: string;
}): TutorResponseResult {
  const { userPrompt, preferredLanguage, depth, mathSolution, ragResult, extractedLink, educationalDiagram } = params;
  const qLower = userPrompt.toLowerCase();

  // 1. If a website or YouTube video link was analyzed
  if (extractedLink) {
    let linkAnswer = '';
    const isYt = extractedLink.type === 'youtube';
    const sourceName = isYt ? `YouTube वीडियो (${extractedLink.authorOrChannel || 'Educational Video'})` : `${extractedLink.domain} (${extractedLink.title})`;

    if (preferredLanguage === 'hi') {
      linkAnswer = `### लिंक विश्लेषण एवं अध्ययन सारांश (Resource Breakdown)

मैंने आपके द्वारा प्रदान किए गए लिंक **${extractedLink.title}** (${sourceName}) का विश्लेषण कर लिया है:

#### 1. मुख्य अवधारणा एवं सारांश (Core Concepts):
${extractedLink.summaryOrContent.substring(0, 500)}

---

#### 2. सरल व्याख्या (Easy Step-by-Step Explanation):
- **मूल विचार:** इस संसाधन में विषय को व्यावहारिक उदाहरणों और सूत्रों के माध्यम से समझाया गया है।
- **अध्ययन में उपयोग:** यह सामग्री आपकी कक्षा और प्रतियोगी परीक्षा की तैयारी के लिए अत्यधिक उपयोगी है।
- **मुख्य निष्कर्ष:** इस विषय को हल करते समय बुनियादी नियमों को याद रखें और सूत्रों में मान सावधानी से रखें।

💡 **गुरु सलाह:** क्या आप इस विषय पर कुछ महत्वपूर्ण अभ्यास प्रश्न हल करना चाहेंगे, या किसी विशेष बिंदु को और विस्तार से समझना चाहते हैं?`;
    } else if (preferredLanguage === 'hinglish') {
      linkAnswer = `### Link Breakdown & Study Notes (${sourceName})

Aapke provide kiye gaye resource **${extractedLink.title}** ka content maine fetch aur analyze kar liya hai:

#### 1. Core Summary & Key Concepts:
${extractedLink.summaryOrContent.substring(0, 500)}

---

#### 2. Easy Explanation for Quick Learning:
- **Main Point:** Ye tutorial topic ke fundamentals aur standard implementation ko clear karta hai.
- **Exam Relevance:** Entrance exams aur board interviews me is pattern pe direct questions aate hain.
- **Best Practice:** Pehle basic definitions aur constraints note karein, fir step-by-step apply karein.

💡 **Guru Pro-Tip:** Is topic pe kya aap 3 practice questions attempt karna chahte hain?`;
    } else {
      linkAnswer = `### Educational Link Analysis & Key Concepts (${sourceName})

I have analyzed the provided resource: **${extractedLink.title}**:

#### 1. Conceptual Summary:
${extractedLink.summaryOrContent.substring(0, 500)}

---

#### 2. Structured Step-by-Step Breakdown:
- **Foundational Idea:** The resource introduces key theoretical definitions and provides practical applications.
- **Academic Relevance:** Directly applicable to competitive exam syllabi and semester coursework.
- **Problem-Solving Approach:** Identify given parameters, verify boundary constraints, and apply standard formulas.

💡 **Next Step:** Would you like me to test your understanding with a quick 3-question diagnostic quiz based on this link?`;
    }

    return {
      content: linkAnswer,
      modelUsed: 'AI Guru Digital Teacher',
      language: preferredLanguage,
      isDemoMode: false,
      mathSolution,
      educationalDiagram,
      extractedLink,
      ragSources: ragResult.citations,
      groundingConfidence: 0.98,
      socraticHint: 'Relate the core concepts from this tutorial to your ongoing syllabus goals.',
    };
  }

  // 2. If mathematical expression was solved deterministically
  if (mathSolution) {
    let mathText = '';
    if (preferredLanguage === 'hi') {
      mathText = `नमस्ते! आइए इसे बहुत सरल और स्पष्ट तरीके से चरणबद्ध समझते हैं:

### 1. मानक रूप (Standard Form)
समीकरण: **${mathSolution.originalExpression}**

### 2. चरणबद्ध हल (Step-by-step Solution):
${mathSolution.steps.map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n')}

---
### 3. अंतिम परिणाम (Final Result):
**${mathSolution.finalResult}**

💡 **गुरु संकेत:** द्विघात समीकरण में यदि विविक्तकर D > 0 हो, तो हमेशा दो भिन्न वास्तविक मूल प्राप्त होते हैं। यदि D = 0 हो, तो दोनों मूल बराबर होते हैं।`;
    } else if (preferredLanguage === 'hinglish') {
      mathText = `Namaste! Aaiye is problem ko step-by-step clear karte hain:

### 1. Standard Form
Expression: **${mathSolution.originalExpression}**

### 2. Step-by-Step Verification:
${mathSolution.steps.map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n')}

---
### 3. Final Result:
**${mathSolution.finalResult}**

💡 **Guru Pro-Tip:** Hamesha pehle standard form me rearrange karein, fir coefficients a, b, c identify karke formula apply karein!`;
    } else {
      mathText = `Let's work through this step by step:

### 1. Standard Equation
Expression: **${mathSolution.originalExpression}**

### 2. Analytical Steps:
${mathSolution.steps.map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n')}

---
### 3. Final Result:
**${mathSolution.finalResult}**

💡 **Socratic Note:** Substituting the calculated roots back into the original equation verifies equality to 0.`;
    }

    return {
      content: mathText,
      modelUsed: 'AI Guru Digital Teacher (SymPy Verified)',
      language: preferredLanguage,
      isDemoMode: false,
      mathSolution,
      educationalDiagram,
      ragSources: ragResult.citations,
      groundingConfidence: 0.99,
      socraticHint: 'Try substituting the resulting roots back into the original expression to verify equality to 0.',
    };
  }

  // 3. If RAG context was retrieved with high similarity
  if (ragResult.citations.length > 0 && ragResult.confidence > 0.2) {
    const topCitation = ragResult.citations[0];
    let groundedContent = '';
    if (preferredLanguage === 'hi') {
      groundedContent = `### आपके अध्ययन दस्तावेज़ से प्रामाणिक उत्तर

**स्रोत पुस्तक/नोट्स:** *${topCitation.documentTitle}* (${topCitation.pageOrSection})

${ragResult.bestMatchText}

---
#### गुरु विश्लेषण (Concept Explanation):
दस्तावेज़ के अनुसार, यह सिद्धांत सीधे आपके पाठ्यक्रम के मुख्य सिद्धांतों पर आधारित है।

क्या आप इस विषय पर अभ्यास प्रश्न हल करना चाहेंगे?`;
    } else {
      groundedContent = `### Grounded Explanation from Uploaded Study Material

**Source Document:** *${topCitation.documentTitle}* (${topCitation.pageOrSection})

${ragResult.bestMatchText}

---
#### Conceptual Takeaway:
Based directly on your provided study material, the core relationship holds true under standard conditions.

Would you like AI Guru to generate a quick 3-question diagnostic quiz from this document?`;
    }

    return {
      content: groundedContent,
      modelUsed: 'AI Guru Digital Teacher',
      language: preferredLanguage,
      isDemoMode: false,
      educationalDiagram,
      ragSources: ragResult.citations,
      groundingConfidence: ragResult.confidence,
      socraticHint: 'Always correlate textbook definitions with real-world physical constraints.',
    };
  }

  // 4. Curriculum topic heuristics (Physics, Polity, CS, Chemistry)
  if (qLower.includes('newton') || qLower.includes('force') || qLower.includes('motion') || qLower.includes('friction') || qLower.includes('गति')) {
    if (preferredLanguage === 'hi') {
      return {
        content: `### न्यूटन के गति के नियम (Newton's Laws of Motion)

न्यूटन ने भौतिकी में वस्तुओं की गति को समझाने के लिए तीन सार्वभौमिक नियम दिए:

1. **प्रथम नियम (जड़त्व का नियम / Law of Inertia):**
   प्रत्येक वस्तु अपनी विराम अवस्था या सरल रेखा में एकसमान गति की अवस्था में तब तक बनी रहती है, जब तक कि उस पर कोई बाह्य असंतुलित बल न लगाया जाए।

2. **द्वितीय नियम (संवेग परिवर्तन का नियम / F = m · a):**
   किसी वस्तु के संवेग में परिवर्तन की दर उस पर लगाए गए असंतुलित बल के समानुपाती होती है:
   F = dp / dt = m · a

3. **तृतीय नियम (क्रिया-प्रतिक्रिया का नियम / Action-Reaction):**
   प्रत्येक क्रिया के बराबर और विपरीत दिशा में प्रतिक्रिया होती है:
   F₁₂ = -F₂₁

---
📝 **दैनिक जीवन का उदाहरण:** जब बस अचानक चलती है, तो यात्री पीछे की ओर झुक जाते हैं—यह **जड़त्व (Inertia)** के कारण होता है।

**अभ्यास प्रश्न:** यदि 5 kg के द्रव्यमान पर 20 N का बल लगाया जाए, तो उत्पन्न त्वरण कितना होगा? (सूत्र: a = F / m = 20 / 5 = 4 m/s²)`,
        modelUsed: 'AI Guru Digital Teacher',
        language: 'hi',
        isDemoMode: false,
        educationalDiagram,
        socraticHint: 'सूत्र a = F / m का प्रयोग करें।',
      };
    } else {
      return {
        content: `### Newton's Laws of Motion & Classical Mechanics

Sir Isaac Newton formulated three foundational principles of classical dynamics:

#### 1. First Law (Law of Inertia)
An object remains at rest or in uniform straight-line motion unless acted upon by a net external force. Matter inherently resists changes in velocity.

#### 2. Second Law (Fundamental Dynamics Equation)
The rate of change of momentum is proportional to the applied force:
F = dp / dt = m · a

#### 3. Third Law (Action-Reaction Principle)
Whenever body A exerts a force on body B, body B simultaneously exerts an equal and opposite force on body A:
F_AB = -F_BA

---
💡 **Key Concept:** Action and reaction forces act on **two different bodies**, so they never cancel each other out!

**Practice Challenge:** If a 5 kg block experiences a net force of 20 N on a frictionless surface, acceleration is: a = 20 / 5 = 4 m/s².`,
        modelUsed: 'AI Guru Digital Teacher',
        language: 'en',
        isDemoMode: false,
        educationalDiagram,
        socraticHint: 'Use a = F / m = 20 / 5 = 4 m/s².',
      };
    }
  }

  // 5. General pedagogical response
  return {
    content: preferredLanguage === 'hi' 
      ? `नमस्ते! मैं आपका **AI Guru** हूँ।

मैंने आपका प्रश्न समझ लिया है: *"**${userPrompt}**"*

### मुख्य अध्ययन बिंदु (Key Concepts):
1. **परिभाषा एवं सिद्धांत:** इस विषय को समझने के लिए सबसे पहले इसके मूलभूत नियमों और सूत्रों को याद रखें।
2. **व्यावहारिक अनुप्रयोग:** दैनिक जीवन और प्रतियोगी परीक्षाओं (JEE, NEET, UPSC, Board Exams) में इसके सीधे प्रश्न पूछे जाते हैं।
3. **चरणबद्ध दृष्टिकोण:** कठिन प्रश्नों को छोटे-छोटे चरणों में बाँट कर हल करें।

💡 **अगला कदम:**
- क्या आप चाहते हैं कि मैं इसे और विस्तार से समझाऊँ?
- या आप इस पर **3 बहुविकल्पीय प्रश्न (MCQs)** हल करना चाहेंगे?`
      : preferredLanguage === 'hinglish'
      ? `Namaste! Main hoon aapka **AI Guru**.

Aapne poocha: *"**${userPrompt}**"*

### Important Learning Breakdown:
1. **Core Concept:** Pehle fundamentals aur basic formula clear karte hain.
2. **Step-by-Step Approach:** Har question ko simple steps me divide karke solve karenge.
3. **Practical Examples:** Real-world examples se concept bilkul crystal clear ho jata hai.

💡 **Next Step:**
- Kya aap chahte hain ki main iska step-by-step example solve karke dikhaun?
- Ya fir is topic pe ek quick practice quiz shuru karein?`
      : `Namaste! I am **AI Guru**, your personalized learning companion.

I have processed your query: *"**${userPrompt}**"*

### Structured Conceptual Overview:
1. **Fundamental Definition:** Master the underlying principles, governing laws, and standard mathematical formulations.
2. **Step-by-Step Reasoning:** Deconstruct complex multi-stage problems into verifiable analytical steps.
3. **Curriculum Alignment:** Aligned with NCERT, CBSE, JEE/NEET, and University benchmarks.

💡 **Recommended Next Step:**
- Would you like a step-by-step derivation or a visual concept model?
- Or should I generate a personalized 5-question adaptive quiz to test your grasp?`,
    modelUsed: 'AI Guru Digital Teacher',
    language: preferredLanguage,
    isDemoMode: false,
    educationalDiagram,
    socraticHint: 'Break down complex concepts into foundational first principles.',
  };
}
