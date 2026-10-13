import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * Robust balanced-brace extractor for LaTeX commands like \frac{num}{den} and \sqrt{rad}
 */
function extractBalancedBraces(str: string, startIndex: number): { inside: string; nextIndex: number } | null {
  if (str[startIndex] !== '{') return null;
  let depth = 0;
  let inside = '';
  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];
    if (char === '{') {
      depth++;
      if (depth > 1) inside += char;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return { inside, nextIndex: i + 1 };
      } else {
        inside += char;
      }
    } else {
      inside += char;
    }
  }
  return null;
}

/**
 * Recursively converts LaTeX fractions \frac{A}{B} to natural textbook format (A / B)
 */
export function convertLatexFractions(text: string): string {
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (text.startsWith('\\frac', i)) {
      let cursor = i + 5;
      // Skip whitespace
      while (cursor < text.length && /\s/.test(text[cursor])) cursor++;
      
      const numMatch = extractBalancedBraces(text, cursor);
      if (numMatch) {
        cursor = numMatch.nextIndex;
        while (cursor < text.length && /\s/.test(text[cursor])) cursor++;
        const denMatch = extractBalancedBraces(text, cursor);
        if (denMatch) {
          const num = convertLatexFractions(numMatch.inside.trim());
          const den = convertLatexFractions(denMatch.inside.trim());
          
          // Format fraction cleanly
          const formattedNum = num.includes(' ') || num.includes('+') || num.includes('-') ? `(${num})` : num;
          const formattedDen = den.includes(' ') || den.includes('+') || den.includes('-') ? `(${den})` : den;
          
          result += `${formattedNum} / ${formattedDen}`;
          i = denMatch.nextIndex;
          continue;
        }
      }
    }
    result += text[i];
    i++;
  }
  return result;
}

/**
 * Recursively converts \sqrt{...} to √( ... )
 */
export function convertLatexSqrt(text: string): string {
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (text.startsWith('\\sqrt', i)) {
      let cursor = i + 5;
      while (cursor < text.length && /\s/.test(text[cursor])) cursor++;
      const match = extractBalancedBraces(text, cursor);
      if (match) {
        const inner = convertLatexSqrt(convertLatexFractions(match.inside.trim()));
        result += `√(${inner})`;
        i = match.nextIndex;
        continue;
      }
    }
    result += text[i];
    i++;
  }
  return result;
}

/**
 * Transforms any raw LaTeX math string into clean, natural textbook math notation.
 * Prevents raw LaTeX artifacts like '$', '\frac', '\sqrt', '\neq' from showing.
 */
export function cleanRawLatexText(str: string): string {
  if (!str) return '';

  let out = str;
  // First convert fractions and square roots with balanced braces
  out = convertLatexFractions(out);
  out = convertLatexSqrt(out);

  // LaTeX math symbols to natural unicode symbols
  out = out
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\neq/g, '≠')
    .replace(/\\ne/g, '≠')
    .replace(/\\ge/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\approx/g, '≈')
    .replace(/\\propto/g, '∝')
    .replace(/\\infty/g, '∞')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\pi/g, 'π')
    .replace(/\\sum/g, '∑')
    .replace(/\\int/g, '∫')
    .replace(/\\partial/g, '∂')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftarrow/g, '⇐')
    .replace(/\\quad/g, ' ')
    .replace(/\\qquad/g, '  ')
    .replace(/\\vec\{([^}]+)\}/g, '$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\mathbb\{R\}/g, 'R')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\forall/g, 'सभी')
    .replace(/\\exists/g, 'विद्यमान')
    .replace(/\\displaystyle/g, '')
    .replace(/\\limits/g, '')
    .replace(/\\nolimits/g, '');

  // Superscripts
  out = out
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^n/g, 'ⁿ')
    .replace(/\^x/g, 'ˣ')
    .replace(/\^0/g, '⁰')
    .replace(/\^1/g, '¹');

  // Subscripts
  out = out
    .replace(/_1/g, '₁')
    .replace(/_2/g, '₂')
    .replace(/_3/g, '₃')
    .replace(/_4/g, '₄')
    .replace(/_n/g, 'ₙ')
    .replace(/_i/g, 'ᵢ')
    .replace(/_0/g, '₀')
    .replace(/_\{([^}]+)\}/g, ' ($1)');

  // Remove any remaining raw LaTeX backslashes from unmatched macros
  out = out.replace(/\\[a-zA-Z]+/g, '');

  // Strip all dollar signs so students never see raw $ or $$
  out = out.replace(/\$/g, '');

  return out;
}

/**
 * Renders mathematical expressions cleanly and naturally.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines/blocks
  const blocks = content.split('\n');

  return (
    <div className={`space-y-2 leading-relaxed ${className}`}>
      {blocks.map((line, lineIndex) => {
        const trimmed = line.trim();

        // 1. Horizontal divider
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={lineIndex} className="my-3 border-slate-200" />;
        }

        // 2. Block display math: $$...$$ or lines that are pure standalone formulas
        if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
          const rawMath = trimmed.slice(2, -2).trim();
          const cleanMath = cleanRawLatexText(rawMath);
          return (
            <div
              key={lineIndex}
              className="my-3 py-2 px-4 bg-indigo-50/60 rounded-xl border border-indigo-200/70 overflow-x-auto text-center shadow-2xs"
            >
              <span className="font-serif text-sm sm:text-base font-semibold text-indigo-950 tracking-wide">
                {cleanMath}
              </span>
            </div>
          );
        }

        // 3. Headings (###, ##, #)
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIndex} className="font-bold text-slate-900 text-sm mt-3 mb-1">
              {renderInlineMathAndText(trimmed.replace('### ', ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={lineIndex} className="font-extrabold text-slate-900 text-base mt-3 mb-1">
              {renderInlineMathAndText(trimmed.replace('## ', ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={lineIndex} className="font-extrabold text-slate-900 text-lg mt-4 mb-1">
              {renderInlineMathAndText(trimmed.replace('# ', ''))}
            </h2>
          );
        }

        // 4. Bullet lists (- or * or •)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
          const text = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <div key={lineIndex} className="flex items-start gap-2 text-xs sm:text-sm pl-2">
              <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
              <div className="flex-1">{renderInlineMathAndText(text)}</div>
            </div>
          );
        }

        // 5. Numbered lists (1. 2. etc)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const [, num, text] = numMatch;
          return (
            <div key={lineIndex} className="flex items-start gap-2 text-xs sm:text-sm pl-2">
              <span className="font-semibold text-slate-600 shrink-0 font-mono text-xs mt-0.5">{num}.</span>
              <div className="flex-1">{renderInlineMathAndText(text)}</div>
            </div>
          );
        }

        // 6. Empty line
        if (!trimmed) {
          return <div key={lineIndex} className="h-1" />;
        }

        // 7. Standard paragraph
        return (
          <p key={lineIndex} className="text-xs sm:text-sm text-slate-800">
            {renderInlineMathAndText(line)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parses a single text line containing inline math ($...$) or bold (**...**)
 */
function renderInlineMathAndText(text: string): React.ReactNode[] {
  // Regex splitting by math delimiters: $$...$$ or $...$
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Display math in inline context ($$...$$)
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const cleanMath = cleanRawLatexText(part.slice(2, -2).trim());
      return (
        <span
          key={index}
          className="inline-block mx-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-200/80 rounded font-serif text-indigo-950 font-semibold"
        >
          {cleanMath}
        </span>
      );
    }

    // Inline math ($...$)
    if (part.startsWith('$') && part.endsWith('$')) {
      const cleanMath = cleanRawLatexText(part.slice(1, -1).trim());
      return (
        <span
          key={index}
          className="inline-block mx-0.5 px-1 bg-slate-100/90 text-indigo-950 font-serif font-semibold rounded text-[13px]"
        >
          {cleanMath}
        </span>
      );
    }

    // Check for bold (**...**) and clean text
    return <span key={index}>{renderMarkdownFormatting(part)}</span>;
  });
}

function renderMarkdownFormatting(text: string): React.ReactNode[] {
  // Clean any un-delimited LaTeX commands like \frac, \sqrt, \neq, \pm to natural math unicode
  const cleaned = cleanRawLatexText(text);

  // Split by bold (**...**)
  const boldRegex = /(\*\*[^*]+?\*\*)/g;
  const segments = cleaned.split(boldRegex);

  return segments.map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4) {
      const boldText = seg.slice(2, -2).trim().replace(/\*{1,}/g, '').replace(/\${1,}/g, '');
      return (
        <strong key={i} className="font-bold text-slate-900">
          {boldText}
        </strong>
      );
    }
    // Also handle inline code (`...`)
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code key={i} className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-xs">
          {seg.slice(1, -1)}
        </code>
      );
    }
    // Ensure all stray raw asterisks (**) and dollar signs ($) are completely stripped from normal text
    const cleanSeg = seg.replace(/\*{1,}/g, '').replace(/\${1,}/g, '');
    return <React.Fragment key={i}>{cleanSeg}</React.Fragment>;
  });
}
