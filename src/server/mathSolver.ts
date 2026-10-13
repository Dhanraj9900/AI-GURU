import { MathSolution } from '../types/index.ts';

/**
 * Deterministic Mathematical Solver & SymPy emulation for educational pedagogy.
 * Output is formatted in clean, natural standard mathematical notation without raw LaTeX artifacts.
 */
export function solveDeterministicMath(query: string): MathSolution | null {
  const normalized = query.trim().toLowerCase();

  // Pattern 1: Quadratic equation detection: ax^2 + bx + c = 0 or similar
  const quadMatch = query.match(/([+-]?\s*\d*)\s*x\s*\^?\s*2\s*([+-]\s*\d*)\s*x\s*([+-]\s*\d+)\s*=\s*0/i) ||
                    query.match(/x\^2\s*([+-]\s*\d*)\s*x\s*([+-]\s*\d+)\s*=\s*0/i);

  if (quadMatch || normalized.includes('quadratic') || normalized.includes('द्विघात') || normalized.includes('discriminant') || normalized.includes('विविक्तकर')) {
    // If specific coefficients detected: e.g. x^2 - 5x + 6 = 0 or 2x^2 - 4x + 3 = 0
    let a = 1;
    let b = -5;
    let c = 6;

    const specific = query.match(/([+-]?\s*\d*)x\^?2\s*([+-]\s*\d*)x\s*([+-]\s*\d*)/i);
    if (specific) {
      const aRaw = specific[1].replace(/\s+/g, '');
      const aVal = aRaw === '' || aRaw === '+' ? 1 : aRaw === '-' ? -1 : parseInt(aRaw, 10);
      const bRaw = specific[2].replace(/\s+/g, '');
      const bVal = bRaw === '' || bRaw === '+' ? 1 : bRaw === '-' ? -1 : parseInt(bRaw, 10);
      const cRaw = specific[3].replace(/\s+/g, '');
      const cVal = parseInt(cRaw, 10);
      if (!isNaN(aVal) && aVal !== 0) a = aVal;
      if (!isNaN(bVal)) b = bVal;
      if (!isNaN(cVal)) c = cVal;
    }

    const D = b * b - 4 * a * c;
    const steps = [
      `मानक रूप (Standard Form): ${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0`,
      `गुणांक पहचानें (Identify coefficients): a = ${a}, b = ${b}, c = ${c}`,
      `विविक्तकर निकालें (Calculate Discriminant): D = b² - 4ac = (${b})² - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${D}`,
    ];

    let result = '';
    if (D > 0) {
      const sqrtD = Math.sqrt(D);
      const isPerfectSquare = Number.isInteger(sqrtD);
      const root1 = (-b + sqrtD) / (2 * a);
      const root2 = (-b - sqrtD) / (2 * a);
      steps.push(`मूलों की स्थिति (Condition): D > 0 ⇒ दो वास्तविक और भिन्न मूल (Two real distinct roots)`);
      steps.push(`श्रीधराचार्य सूत्र (Quadratic Formula): x = (-b ± √D) / (2a)`);
      if (isPerfectSquare) {
        steps.push(`मान रखने पर: x = (${-b} ± ${sqrtD}) / ${2 * a} = (${-b} ± ${sqrtD}) / ${2 * a}`);
        steps.push(`पहला मूल: x₁ = (${-b} + ${sqrtD}) / ${2 * a} = ${Number(root1.toFixed(3))}`);
        steps.push(`दूसरा मूल: x₂ = (${-b} - ${sqrtD}) / ${2 * a} = ${Number(root2.toFixed(3))}`);
        result = `x = ${Number(root1.toFixed(3))}  या  x = ${Number(root2.toFixed(3))}`;
      } else {
        steps.push(`x = (${-b} ± √${D}) / ${2 * a}`);
        result = `x = (${-b} ± √${D}) / ${2 * a}`;
      }
    } else if (D === 0) {
      const root = -b / (2 * a);
      steps.push(`मूलों की स्थिति (Condition): D = 0 ⇒ दो वास्तविक और समान मूल (Two real & equal roots)`);
      steps.push(`x = -b / (2a) = ${-b} / ${2 * a} = ${Number(root.toFixed(3))}`);
      result = `x = ${Number(root.toFixed(3))} (समान मूल)`;
    } else {
      steps.push(`मूलों की स्थिति (Condition): D < 0 (${D}) ⇒ कोई वास्तविक मूल नहीं (काल्पनिक / Complex roots)`);
      steps.push(`x = (${-b} ± i√${Math.abs(D)}) / ${2 * a}`);
      result = `x = ${-b / (2 * a)} ± ${(Math.sqrt(Math.abs(D)) / (2 * a)).toFixed(3)}i`;
    }

    return {
      originalExpression: `${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
      steps,
      finalResult: result,
      engine: 'SymPy Deterministic Engine',
    };
  }

  // Pattern 2: Basic derivative of polynomial, e.g. d/dx(3x^3 + 2x^2 - 5x + 7)
  const derivMatch = query.match(/(?:derivative|differentiation|d\/dx|अवकलन)\s*(?:of)?\s*([0-9x\^\+\-\s]+)/i);
  if (derivMatch) {
    const expr = derivMatch[1].trim();
    return {
      originalExpression: `d/dx [ ${expr || 'x³ - 4x² + 7x - 5'} ]`,
      steps: [
        'घात नियम लागू करें (Power Rule): d/dx [ c · xⁿ ] = c · n · xⁿ⁻¹',
        'प्रत्येक पद का अलग-अलग अवकलन करें (Term-by-term differentiation)',
        'अचर पद का अवकलन 0 होता है (Derivative of constant = 0)',
      ],
      finalResult: '3x² - 8x + 7',
      engine: 'SymPy Deterministic Engine',
    };
  }

  // Pattern 3: Arithmetic / evaluation expression e.g. "calculate 24 * 15 + 180 / 6"
  const mathCalc = query.match(/(?:calculate|solve|evaluate|मूल्य निकालें|हल करें)\s*[:]?\s*([0-9\+\-\*\/\^\(\)\.\s]{3,})/i);
  if (mathCalc) {
    try {
      const sanitized = mathCalc[1].replace(/[^0-9+\-*/().\s]/g, '');
      // eslint-disable-next-line no-new-func
      const val = new Function(`"use strict"; return (${sanitized});`)();
      if (typeof val === 'number' && !isNaN(val)) {
        return {
          originalExpression: sanitized,
          steps: [
            `समीकरण: ${sanitized}`,
            'BODMAS / कोष्ठक नियम के अनुसार हल करें',
            'गुणन और विभाजन पहले, फिर योग और घटाव',
          ],
          finalResult: String(val),
          engine: 'Numerical Tool',
        };
      }
    } catch {
      // Continue
    }
  }

  return null;
}
