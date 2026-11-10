import React, { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { createSeededRng } from './shared';
import { EraserIcon } from '../components/common/Icons';

// ============================================================================
// --- GRUP: 1. ETKİLEŞİMLİ BİLEŞEN - NOKTA BİRLEŞTİRME (DOT GRID) ---
// ============================================================================
export const getGcd = (a, b) => (b === 0 ? a : getGcd(b, a % b));

export const normalizeDotLines = (lines = []) => {
  const segmentMap = new Map();
  lines.forEach((line) => {
    if (!line) return;
    const r1 = Number(line.r1);
    const c1 = Number(line.c1);
    const r2 = Number(line.r2);
    const c2 = Number(line.c2);
    if (isNaN(r1) || isNaN(c1) || isNaN(r2) || isNaN(c2)) return;
    if (r1 === r2 && c1 === c2) return;

    const dr = r2 - r1;
    const dc = c2 - c1;
    const steps = getGcd(Math.abs(dr), Math.abs(dc)) || 1;
    const stepR = dr / steps;
    const stepC = dc / steps;

    for (let i = 0; i < steps; i++) {
      const sr1 = Math.round(r1 + stepR * i);
      const sc1 = Math.round(c1 + stepC * i);
      const sr2 = Math.round(r1 + stepR * (i + 1));
      const sc2 = Math.round(c1 + stepC * (i + 1));

      let p1 = { r: sr1, c: sc1 };
      let p2 = { r: sr2, c: sc2 };
      if (p1.r > p2.r || (p1.r === p2.r && p1.c > p2.c)) {
        const tmp = p1;
        p1 = p2;
        p2 = tmp;
      }
      const key = `${p1.r},${p1.c}-${p2.r},${p2.c}`;
      segmentMap.set(key, { r1: p1.r, c1: p1.c, r2: p2.r, c2: p2.c });
    }
  });
  return Array.from(segmentMap.values());
};

// ============================================================================
// --- GRUP: OYUN/ETKİNLİK ŞABLON ÜRETİCİLERİ (TEMPLATE GENERATORS) ---
// ============================================================================
// --- NOKTALI ÇİZİM ŞABLON ÜRETİCİSİ (3x3, 4x4 ve 5x5 İçin İlk 100 Kolay, İkinci 100 Zor Şablon) ---
export const generateDotTemplatesForSize = (n, count = 200) => {
  const rng = createSeededRng(n * 98765 + 4321);
  const templates = [];
  const seen = new Set();
  const maxIdx = n - 1;

  const addShapeIfUnique = (rawLines) => {
    if (templates.length >= count) return false;
    const norm = normalizeDotLines(rawLines);
    if (norm.length === 0) return false;
    const sig = norm.map(l => `${l.r1},${l.c1}-${l.r2},${l.c2}`).sort().join('|');
    if (seen.has(sig)) return false;
    seen.add(sig);
    templates.push({
      id: templates.length + 1,
      rows: n,
      cols: n,
      difficulty: templates.length < 100 ? 'easy' : 'hard',
      lines: norm
    });
    return true;
  };

  // Yardımcı: Nokta dizisini boydan boya düz çizgilere çevirir
  const poly = (pts) => {
    const res = [];
    for (let i = 0; i < pts.length - 1; i++) {
      res.push({ r1: pts[i][0], c1: pts[i][1], r2: pts[i + 1][0], c2: pts[i + 1][1] });
    }
    return res;
  };

  // --- 1. AŞAMA: İLK 100 ŞABLON (KOLAY, BOYDAN BOYA DÜZ VE ANLAŞILIR ŞEKİLLER) ---
  const easyPatterns = [];

  // Tek ve çift boydan boya düz çizgiler (yatay, dikey, köşegen)
  for (let r = 0; r < n; r++) easyPatterns.push([{ r1: r, c1: 0, r2: r, c2: maxIdx }]);
  for (let c = 0; c < n; c++) easyPatterns.push([{ r1: 0, c1: c, r2: maxIdx, c2: c }]);
  easyPatterns.push([{ r1: 0, c1: 0, r2: maxIdx, c2: maxIdx }]);
  easyPatterns.push([{ r1: 0, c1: maxIdx, r2: maxIdx, c2: 0 }]);

  // Paralel İkili Çizgiler
  for (let r1 = 0; r1 < n; r1++) {
    for (let r2 = r1 + 1; r2 < n; r2++) {
      easyPatterns.push([{ r1, c1: 0, r2: r1, c2: maxIdx }, { r1: r2, c1: 0, r2, c2: maxIdx }]);
    }
  }
  for (let c1 = 0; c1 < n; c1++) {
    for (let c2 = c1 + 1; c2 < n; c2++) {
      easyPatterns.push([{ r1: 0, c1, r2: maxIdx, c2: c1 }, { r1: 0, c1: c2, r2: maxIdx, c2 }]);
    }
  }

  // L, T, + (Artı), X, U, C, Z, N, V, Λ Harf ve Sembol Şekilleri (Boydan Boya)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      easyPatterns.push([{ r1: r, c1: 0, r2: r, c2: maxIdx }, { r1: 0, c1: c, r2: maxIdx, c2: c }]);
    }
  }
  easyPatterns.push([{ r1: 0, c1: 0, r2: maxIdx, c2: maxIdx }, { r1: 0, c1: maxIdx, r2: maxIdx, c2: 0 }]);

  // Çeşitli Boyutlarda Dikdörtgenler, Kareler, L ve U Köşeleri
  for (let r1 = 0; r1 < n - 1; r1++) {
    for (let r2 = r1 + 1; r2 < n; r2++) {
      for (let c1 = 0; c1 < n - 1; c1++) {
        for (let c2 = c1 + 1; c2 < n; c2++) {
          // Tam Kutu / Kare
          easyPatterns.push(poly([[r1, c1], [r1, c2], [r2, c2], [r2, c1], [r1, c1]]));
          // L Şekilleri (4 Yön)
          easyPatterns.push(poly([[r1, c1], [r2, c1], [r2, c2]]));
          easyPatterns.push(poly([[r1, c2], [r2, c2], [r2, c1]]));
          easyPatterns.push(poly([[r2, c1], [r1, c1], [r1, c2]]));
          easyPatterns.push(poly([[r2, c2], [r1, c2], [r1, c1]]));
          // U ve C Şekilleri (4 Yön)
          easyPatterns.push(poly([[r1, c1], [r2, c1], [r2, c2], [r1, c2]]));
          easyPatterns.push(poly([[r2, c1], [r1, c1], [r1, c2], [r2, c2]]));
          easyPatterns.push(poly([[r1, c2], [r1, c1], [r2, c1], [r2, c2]]));
          easyPatterns.push(poly([[r1, c1], [r1, c2], [r2, c2], [r2, c1]]));
          // Z ve N Şekilleri
          easyPatterns.push(poly([[r1, c1], [r1, c2], [r2, c1], [r2, c2]]));
          easyPatterns.push(poly([[r2, c1], [r1, c1], [r2, c2], [r1, c2]]));
          // Üçgenler
          easyPatterns.push(poly([[r1, c1], [r2, c1], [r2, c2], [r1, c1]]));
          easyPatterns.push(poly([[r1, c2], [r2, c1], [r2, c2], [r1, c2]]));
        }
      }
    }
  }

  for (const pat of easyPatterns) {
    if (templates.length >= 100) break;
    addShapeIfUnique(pat);
  }

  // Eğer 100'den az kaldıysa 2 veya 3 düz çizgili sade şekillerle 100'e tamamla
  let easyGuard = 0;
  while (templates.length < 100 && easyGuard < 4000) {
    easyGuard++;
    const rA = Math.floor(rng() * n);
    const cA = Math.floor(rng() * n);
    const rB = Math.floor(rng() * n);
    const cB = Math.floor(rng() * n);
    const rC = Math.floor(rng() * n);
    const cC = Math.floor(rng() * n);
    addShapeIfUnique([
      { r1: rA, c1: cA, r2: rB, c2: cA },
      { r1: rB, c1: cA, r2: rB, c2: cB },
      { r1: rB, c1: cB, r2: rC, c2: cC }
    ]);
  }

  // --- 2. AŞAMA: İKİNCİ 100 ŞABLON (101 - 200 ARASI ZOR, GEOMETRİK VE ÇOK ÇİZGİLİ ŞABLONLAR) ---
  const mid = Math.floor(maxIdx / 2);
  const hardPatterns = [
    // Ev, Zarf, Kum Saati, Papyon, Yıldız, Köşegenli Kutu Kombinasyonları
    poly([[mid, 0], [0, mid], [mid, maxIdx], [maxIdx, maxIdx], [maxIdx, 0], [mid, 0], [mid, maxIdx]]),
    poly([[0, 0], [0, maxIdx], [maxIdx, 0], [maxIdx, maxIdx], [0, 0]]),
    poly([[0, 0], [maxIdx, 0], [0, maxIdx], [maxIdx, maxIdx], [0, 0]]),
    poly([[0, 0], [0, maxIdx], [maxIdx, maxIdx], [maxIdx, 0], [0, 0], [maxIdx, maxIdx]]),
    poly([[0, 0], [0, maxIdx], [maxIdx, maxIdx], [maxIdx, 0], [0, 0], [0, maxIdx], [maxIdx, 0]]),
    [...poly([[0, 0], [0, maxIdx], [maxIdx, maxIdx], [maxIdx, 0], [0, 0]]), { r1: 0, c1: 0, r2: maxIdx, c2: maxIdx }, { r1: 0, c1: maxIdx, r2: maxIdx, c2: 0 }]
  ];

  for (const hp of hardPatterns) {
    if (templates.length >= count) break;
    addShapeIfUnique(hp);
  }

  // Kalan zor şablonları 200'e kadar çok adımlı (uzun) geometrik yollarla tamamla
  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];
  let hardGuard = 0;
  while (templates.length < count && hardGuard < 8000) {
    hardGuard++;
    const strokeCount = n === 3 ? 3 + (templates.length % 3) : 4 + (templates.length % 4);
    let r = Math.floor(rng() * n);
    let c = Math.floor(rng() * n);
    const lines = [];
    for (let s = 0; s < strokeCount; s++) {
      const [dr, dc] = dirs[Math.floor(rng() * dirs.length)];
      const len = (rng() > 0.35 ? maxIdx : 1);
      const nr = Math.max(0, Math.min(maxIdx, r + dr * len));
      const nc = Math.max(0, Math.min(maxIdx, c + dc * len));
      if (nr !== r || nc !== c) {
        lines.push({ r1: r, c1: c, r2: nr, c2: nc });
        r = nr;
        c = nc;
      }
    }
    if (lines.length >= 3) {
      addShapeIfUnique(lines);
    }
  }

  return templates;
};

// --- 4x4 VE 5x5 İÇİN SEVİYELİ ŞABLONLAR: 100 KOLAY + 100 ORTA + 100 ZOR ---
// Kolay: boydan boya düz çizgiler, kare/L/U gibi sade şekiller
// Orta : 4-8 parçalı, köşegen içeren, kısa ve uzun çizgilerin karıştığı şekiller
// Zor  : çok parçalı (8-16 birim çizgi), çok köşegenli, birbirinden ayrı parçalar
//        ve noktaların ARASINDAN geçen eğik çizgiler içeren karmaşık şekiller
export const DOT_LEVELS = ['easy', 'medium', 'hard'];
export const DOT_LEVEL_LABELS = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' };

const dotSig = (norm) => norm.map(l => `${l.r1},${l.c1}-${l.r2},${l.c2}`).sort().join('|');
const isDiagSeg = (l) => l.r1 !== l.r2 && l.c1 !== l.c2;
const isSkewSeg = (l) => isDiagSeg(l) && Math.abs(l.r2 - l.r1) !== Math.abs(l.c2 - l.c1);

// Parçaların kaç ayrı gruptan (birbirine değmeyen çizim) oluştuğunu sayar
const countDotComponents = (norm) => {
  const parent = new Map();
  const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  const add = (x) => { if (!parent.has(x)) parent.set(x, x); };
  norm.forEach(l => {
    const a = `${l.r1},${l.c1}`; const b = `${l.r2},${l.c2}`;
    add(a); add(b);
    const ra = find(a); const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  });
  const roots = new Set();
  parent.forEach((_, k) => roots.add(find(k)));
  return roots.size;
};

export const generateLeveledDotTemplates = (n, perLevel = 100) => {
  const legacy = generateDotTemplatesForSize(n, 200);
  const rng = createSeededRng(n * 31337 + 777);
  const maxIdx = n - 1;
  const seen = new Set();
  const out = { easy: [], medium: [], hard: [] };

  const tryAdd = (level, rawLines, check) => {
    if (out[level].length >= perLevel) return false;
    const norm = normalizeDotLines(rawLines);
    if (norm.length === 0) return false;
    if (check && !check(norm)) return false;
    const sig = dotSig(norm);
    if (seen.has(sig)) return false;
    seen.add(sig);
    out[level].push({ rows: n, cols: n, difficulty: level, lines: norm });
    return true;
  };

  // 1) KOLAY: eski şablonların sade (kolay) kısmı
  legacy.filter(t => t.difficulty === 'easy').forEach(t => tryAdd('easy', t.lines));

  const poly = (pts) => {
    const res = [];
    for (let i = 0; i < pts.length - 1; i++) res.push({ r1: pts[i][0], c1: pts[i][1], r2: pts[i + 1][0], c2: pts[i + 1][1] });
    return res;
  };

  // 2) ORTA: el yapımı tanıdık şekiller + kontrollü rastgele şekiller
  const m = Math.floor(maxIdx / 2);
  const handMedium = [
    poly([[m, 0], [0, m], [m, maxIdx], [maxIdx, maxIdx], [maxIdx, 0], [m, 0]]),                 // ev
    poly([[0, 0], [0, maxIdx], [maxIdx, maxIdx], [maxIdx, 0], [0, 0], [m, m], [0, maxIdx]]),     // zarf
    poly([[0, m], [m, 0], [maxIdx, m], [m, maxIdx], [0, m]]),                                     // baklava
    poly([[0, 0], [maxIdx, maxIdx], [0, maxIdx], [maxIdx, 0]]),                                  // kum saati
    poly([[m, 0], [m, maxIdx]]).concat(poly([[0, maxIdx - 1], [m, maxIdx], [maxIdx, maxIdx - 1]])), // ok
    poly([[maxIdx, 0], [0, m], [maxIdx, maxIdx], [maxIdx, 0]]),                                  // üçgen
    poly([[0, 0], [maxIdx, 0], [maxIdx, maxIdx]]).concat(poly([[0, 0], [maxIdx, maxIdx]]))       // dik üçgen
  ];
  handMedium.forEach(h => tryAdd('medium', h));

  const DIR8 = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const KNIGHT = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];

  const randomDrawing = ({ strokes, stepsMin, stepsMax, longChance, knightChance }) => {
    const lines = [];
    for (let s = 0; s < strokes; s++) {
      let r = Math.floor(rng() * n);
      let c = Math.floor(rng() * n);
      const steps = stepsMin + Math.floor(rng() * (stepsMax - stepsMin + 1));
      for (let k = 0; k < steps; k++) {
        const useKnight = rng() < knightChance;
        const [dr, dc] = useKnight ? KNIGHT[Math.floor(rng() * KNIGHT.length)] : DIR8[Math.floor(rng() * DIR8.length)];
        const len = useKnight ? 1 : (rng() < longChance ? 1 + Math.floor(rng() * maxIdx) : 1);
        const nr = r + dr * len;
        const nc = c + dc * len;
        if (nr < 0 || nr > maxIdx || nc < 0 || nc > maxIdx) continue;
        lines.push({ r1: r, c1: c, r2: nr, c2: nc });
        r = nr; c = nc;
      }
    }
    return lines;
  };

  const medRange = n === 4 ? [4, 7] : [5, 9];
  let guard = 0;
  while (out.medium.length < perLevel && guard < 60000) {
    guard++;
    tryAdd('medium', randomDrawing({ strokes: 1 + (rng() < 0.3 ? 1 : 0), stepsMin: 3, stepsMax: 5, longChance: 0.45, knightChance: 0 }), (norm) => {
      const diag = norm.filter(isDiagSeg).length;
      return norm.length >= medRange[0] && norm.length <= medRange[1] && diag >= 1 && diag <= norm.length - 1;
    });
  }

  // 3) ZOR: çok parçalı, çok köşegenli, ayrık parçalı ve eğik (at hamlesi) çizgili şekiller
  const hardRange = n === 4 ? [8, 13] : [10, 16];
  guard = 0;
  while (out.hard.length < perLevel && guard < 120000) {
    guard++;
    const wantSkew = out.hard.length % 3 === 0;
    tryAdd('hard', randomDrawing({ strokes: 2 + (rng() < 0.5 ? 1 : 0), stepsMin: 3, stepsMax: 6, longChance: 0.3, knightChance: wantSkew ? 0.25 : 0 }), (norm) => {
      const diag = norm.filter(isDiagSeg).length;
      const skew = norm.filter(isSkewSeg).length;
      if (norm.length < hardRange[0] || norm.length > hardRange[1]) return false;
      if (diag < 3) return false;
      if (wantSkew && skew < 1) return false;
      if (!wantSkew && countDotComponents(norm) < 2 && diag < 5) return false;
      return true;
    });
  }

  const all = [...out.easy, ...out.medium, ...out.hard];
  return all.map((t, i) => ({ ...t, id: i + 1 }));
};

export const DOT_TEMPLATES = {
  3: generateDotTemplatesForSize(3, 200),
  4: generateLeveledDotTemplates(4, 100),
  5: generateLeveledDotTemplates(5, 100)
};

export const getDotDifficultyLabel = (difficulty) => DOT_LEVEL_LABELS[difficulty] || 'Kolay';

export const areDotLinesEqual = (linesA = [], linesB = []) => {
  const normA = normalizeDotLines(linesA);
  const normB = normalizeDotLines(linesB);
  if (normA.length !== normB.length) return false;
  const keysA = normA.map(l => `${l.r1},${l.c1}-${l.r2},${l.c2}`).sort();
  const keysB = normB.map(l => `${l.r1},${l.c1}-${l.r2},${l.c2}`).sort();
  return keysA.every((k, idx) => k === keysB[idx]);
};

export const generateDotGridSvgDataUrl = (rows = 3, cols = 3, lines = [], lineColor = '#4f46e5', dotColor = '#1e293b') => {
  const safeRows = Math.max(1, Math.min(10, Number(rows) || 3));
  const safeCols = Math.max(1, Math.min(10, Number(cols) || 3));
  const size = 240;
  const pad = 36;
  const w = size - pad * 2;
  const h = size - pad * 2;
  const getX = (c) => (safeCols <= 1 ? size / 2 : pad + (c * w) / (safeCols - 1));
  const getY = (r) => (safeRows <= 1 ? size / 2 : pad + (r * h) / (safeRows - 1));
  const normLines = normalizeDotLines(lines);

  let linesSvg = '';
  normLines.forEach(l => {
    linesSvg += `<line x1="${getX(l.c1)}" y1="${getY(l.r1)}" x2="${getX(l.c2)}" y2="${getY(l.r2)}" stroke="${lineColor}" stroke-width="8" stroke-linecap="round" />`;
  });

  let dotsSvg = '';
  for (let r = 0; r < safeRows; r++) {
    for (let c = 0; c < safeCols; c++) {
      dotsSvg += `<circle cx="${getX(c)}" cy="${getY(r)}" r="8" fill="${dotColor}" />`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="100%" height="100%" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>${linesSvg}${dotsSvg}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const DotGridPad = ({
  rows = 3,
  cols = 3,
  lines = [],
  onChange,
  readOnly = false,
  lineColor = '#4f46e5',
  dotColor = '#1e293b',
  size = 200,
  title = "",
  status = null
}) => {
  const svgRef = useRef(null);
  const [selectedDot, setSelectedDot] = useState(null);
  const [draggingFrom, setDraggingFrom] = useState(null);
  const [pointerPos, setPointerPos] = useState(null);

  const safeRows = Math.max(1, Math.min(10, Number(rows) || 3));
  const safeCols = Math.max(1, Math.min(10, Number(cols) || 3));
  const pad = 36;
  const viewBoxSize = 300;
  const usableW = viewBoxSize - pad * 2;
  const usableH = viewBoxSize - pad * 2;

  const getCoord = (r, c) => ({
    x: safeCols <= 1 ? viewBoxSize / 2 : pad + (c * usableW) / (safeCols - 1),
    y: safeRows <= 1 ? viewBoxSize / 2 : pad + (r * usableH) / (safeRows - 1)
  });

  const normalizedLines = normalizeDotLines(lines);

  const addOrToggleLine = (r1, c1, r2, c2, forceAdd = false) => {
    if (readOnly || !onChange) return;
    if (r1 === r2 && c1 === c2) return;

    const newSegs = normalizeDotLines([{ r1, c1, r2, c2 }]);
    const newKeys = new Set(newSegs.map(s => `${s.r1},${s.c1}-${s.r2},${s.c2}`));
    const allAlreadyExist = newSegs.every(s =>
      normalizedLines.some(l => l.r1 === s.r1 && l.c1 === s.c1 && l.r2 === s.r2 && l.c2 === s.c2)
    );

    if (allAlreadyExist && !forceAdd) {
      const filtered = normalizedLines.filter(l => !newKeys.has(`${l.r1},${l.c1}-${l.r2},${l.c2}`));
      onChange(filtered);
    } else {
      const combined = normalizeDotLines([...normalizedLines, ...newSegs]);
      onChange(combined);
    }
  };

  const removeSingleSegment = (seg) => {
    if (readOnly || !onChange) return;
    const filtered = normalizedLines.filter(
      l => !(l.r1 === seg.r1 && l.c1 === seg.c1 && l.r2 === seg.r2 && l.c2 === seg.c2)
    );
    onChange(filtered);
  };

  const getSvgPoint = (clientX, clientY) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBoxSize / rect.width;
    const scaleY = viewBoxSize / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const findNearestDot = (pt, hitRadius = 24) => {
    if (!pt) return null;
    let best = null;
    let bestDist = hitRadius;
    for (let r = 0; r < safeRows; r++) {
      for (let c = 0; c < safeCols; c++) {
        const { x, y } = getCoord(r, c);
        const dist = Math.hypot(pt.x - x, pt.y - y);
        if (dist <= bestDist) {
          bestDist = dist;
          best = { r, c };
        }
      }
    }
    return best;
  };

  const handleDotPointerDown = (e, r, c) => {
    if (readOnly) return;
    e.stopPropagation();
    if (e.target.releasePointerCapture && e.pointerId !== undefined) {
      try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    setDraggingFrom({ r, c });
    setPointerPos(getCoord(r, c));
  };

  const handleSvgPointerMove = (e) => {
    if (readOnly || !draggingFrom) return;
    const pt = getSvgPoint(e.clientX, e.clientY);
    setPointerPos(pt);

    const hitDot = findNearestDot(pt, 18);
    if (hitDot && (hitDot.r !== draggingFrom.r || hitDot.c !== draggingFrom.c)) {
      addOrToggleLine(draggingFrom.r, draggingFrom.c, hitDot.r, hitDot.c, true);
      setDraggingFrom(hitDot);
      setSelectedDot(null);
    }
  };

  const handleSvgPointerUp = (e) => {
    if (readOnly) return;
    if (draggingFrom) {
      const pt = getSvgPoint(e.clientX, e.clientY);
      const hitDot = findNearestDot(pt, 26);

      if (hitDot && (hitDot.r !== draggingFrom.r || hitDot.c !== draggingFrom.c)) {
        addOrToggleLine(draggingFrom.r, draggingFrom.c, hitDot.r, hitDot.c);
        setSelectedDot(null);
      } else if (hitDot && hitDot.r === draggingFrom.r && hitDot.c === draggingFrom.c) {
        if (selectedDot && (selectedDot.r !== hitDot.r || selectedDot.c !== hitDot.c)) {
          addOrToggleLine(selectedDot.r, selectedDot.c, hitDot.r, hitDot.c);
          setSelectedDot(null);
        } else if (selectedDot && selectedDot.r === hitDot.r && selectedDot.c === hitDot.c) {
          setSelectedDot(null);
        } else {
          setSelectedDot(hitDot);
        }
      } else {
        setSelectedDot(null);
      }
    }
    setDraggingFrom(null);
    setPointerPos(null);
  };

  const handleUndo = () => {
    if (readOnly || !onChange || normalizedLines.length === 0) return;
    onChange(normalizedLines.slice(0, -1));
    setSelectedDot(null);
  };

  const handleClear = () => {
    if (readOnly || !onChange) return;
    onChange([]);
    setSelectedDot(null);
  };

  let borderClass = "border-slate-200 bg-white";
  let effectiveLineColor = lineColor;
  if (status === 'correct') {
    borderClass = "border-green-500 bg-green-50/40 ring-4 ring-green-100";
    effectiveLineColor = "#16a34a";
  } else if (status === 'wrong') {
    borderClass = "border-red-500 bg-red-50/40 ring-4 ring-red-100";
    effectiveLineColor = "#dc2626";
  }

  const maxMultiplier = Math.max(safeRows, safeCols);
  const dotRadius = maxMultiplier >= 7 ? 6 : maxMultiplier >= 5 ? 8 : 10;
  const strokeW = maxMultiplier >= 7 ? 5 : maxMultiplier >= 5 ? 7 : 9;

  return (
    <div className="flex flex-col items-center select-none max-w-full">
      {!readOnly && (
        <div className="flex flex-row items-center justify-center gap-2 mb-1 bg-white px-3 py-1 rounded-2xl border-2 border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={handleUndo}
            disabled={normalizedLines.length === 0}
            title="Geri Al"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 flex items-center justify-center transition-all active:scale-90"
          >
            <RefreshCw size={17} />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={normalizedLines.length === 0}
            title="Temizle"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-50 hover:bg-pink-100 disabled:opacity-30 flex items-center justify-center transition-all active:scale-90"
          >
            <EraserIcon size={20} />
          </button>
        </div>
      )}

      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-center">
          {title}
        </span>
      )}

      <div
        className={`relative rounded-3xl border-2 shadow-inner p-1.5 transition-all ${borderClass}`}
        style={{ width: size, height: size, maxWidth: '82vw', maxHeight: '82vw', aspectRatio: '1 / 1' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className={`w-full h-full touch-none ${readOnly ? '' : 'cursor-pointer'}`}
          onPointerMove={handleSvgPointerMove}
          onPointerUp={handleSvgPointerUp}
          onPointerLeave={handleSvgPointerUp}
        >
          {normalizedLines.map((l, i) => {
            const p1 = getCoord(l.r1, l.c1);
            const p2 = getCoord(l.r2, l.c2);
            return (
              <g key={`line-${i}`} onClick={() => !readOnly && removeSingleSegment(l)}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={strokeW + 14} strokeLinecap="round" />
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={effectiveLineColor} strokeWidth={strokeW} strokeLinecap="round" className={!readOnly ? "hover:opacity-70 transition-opacity" : ""} />
              </g>
            );
          })}

          {draggingFrom && pointerPos && !readOnly && (
            <line
              x1={getCoord(draggingFrom.r, draggingFrom.c).x}
              y1={getCoord(draggingFrom.r, draggingFrom.c).y}
              x2={pointerPos.x}
              y2={pointerPos.y}
              stroke={effectiveLineColor}
              strokeWidth={strokeW - 2}
              strokeDasharray="6 6"
              strokeLinecap="round"
              opacity={0.6}
            />
          )}

          {Array.from({ length: safeRows }).map((_, r) =>
            Array.from({ length: safeCols }).map((__, c) => {
              const { x, y } = getCoord(r, c);
              const isSelected =
                (selectedDot && selectedDot.r === r && selectedDot.c === c) ||
                (draggingFrom && draggingFrom.r === r && draggingFrom.c === c);

              return (
                <g key={`dot-${r}-${c}`} onPointerDown={(e) => handleDotPointerDown(e, r, c)} className={!readOnly ? "cursor-pointer" : ""}>
                  <circle cx={x} cy={y} r={dotRadius + 14} fill="transparent" />
                  {isSelected && <circle cx={x} cy={y} r={dotRadius + 7} fill="none" stroke={effectiveLineColor} strokeWidth="3" opacity="0.5" />}
                  <circle cx={x} cy={y} r={isSelected ? dotRadius + 2 : dotRadius} fill={isSelected ? effectiveLineColor : dotColor} />
                </g>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
};
