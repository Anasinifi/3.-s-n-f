import React, { useState } from 'react';
import { createSeededRng } from './shared';
import { normalizeColorCells } from './colorGrid';
import { EraserIcon } from '../components/common/Icons';

// ============================================================================
// --- GRUP: 7. ETKİLEŞİMLİ BİLEŞEN - SİMETRİ ÇALIŞMASI (SYMMETRY GRID) ---
// ============================================================================
// Kurallar:
//  * Simetri ekseni tablonun TAM ORTASINDAN geçen tek ve belirgin bir çizgidir.
//  * Çift boyutta (6x6, 8x8) çizgi iki sütunun arasından geçer.
//  * Tek boyutta (7x7) çizgi orta sütunun ortasından geçer. Orta sütun şeklin
//    kendisine aittir (verilir), çocuk sadece sağ taraftaki sütunları boyar.
//  * Sağ taraf HER ZAMAN boş gelir. Kayıtlı veride sağ tarafa düşen hücreler
//    okunurken temizlenir (sanitizeSymmetryLeftCells).

export const SYMMETRY_COLORS = ['#ef4444', '#eab308', '#f97316', '#38bdf8', '#22c55e', '#a855f7'];

// Harf -> renk sırası (R: kırmızı, Y: sarı, O: turuncu, B: mavi, G: yeşil, P: mor)
const LETTERS = ['R', 'Y', 'O', 'B', 'G', 'P'];

// Renk varyasyonları (aynı şeklin farklı renkli sürümleri için harf eşlemeleri)
const PALETTE_SWAPS = [
  { R: 'R', Y: 'Y', O: 'O', B: 'B', G: 'G', P: 'P' },
  { R: 'B', Y: 'O', O: 'R', B: 'G', G: 'P', P: 'Y' },
  { R: 'P', Y: 'G', O: 'B', B: 'R', G: 'O', P: 'B' },
  { R: 'G', Y: 'R', O: 'P', B: 'Y', G: 'B', P: 'O' },
  { R: 'O', Y: 'B', O: 'Y', B: 'P', G: 'R', P: 'G' },
  { R: 'Y', Y: 'P', O: 'G', B: 'O', G: 'Y', P: 'R' },
  { R: 'R', Y: 'B', O: 'G', B: 'Y', G: 'O', P: 'P' }
];

// --- 6x6 RESİMLER (sadece 6x6'ya özel çizimler) ---
const SHAPES_6 = [
  { name: 'Ev', rows: ['..RR..', '.RRRR.', 'RRRRRR', '.YYYY.', '.YBBY.', '.YBBY.'] },
  { name: 'Çam Ağacı', rows: ['..GG..', '.GGGG.', '..GG..', '.GGGG.', 'GGGGGG', '..OO..'] },
  { name: 'Kalp', rows: ['RR..RR', 'RRRRRR', 'RRRRRR', '.RRRR.', '..RR..', '......'] },
  { name: 'Mantar', rows: ['.RRRR.', 'RYRRYR', 'RRRRRR', '..YY..', '..YY..', '.YYYY.'] },
  { name: 'Kelebek', rows: ['P....P', 'PP..PP', 'PPBBPP', 'PPBBPP', 'PP..PP', 'P....P'] },
  { name: 'Roket', rows: ['..RR..', '.BBBB.', '.BYYB.', '.BBBB.', 'BBBBBB', 'O.OO.O'] },
  { name: 'Taç', rows: ['Y.YY.Y', 'YYYYYY', 'YRYYRY', 'YYYYYY', '......', '......'] },
  { name: 'Kupa', rows: ['YYYYYY', 'YYYYYY', '.YYYY.', '..YY..', '..YY..', '.YYYY.'] },
  { name: 'Uçak', rows: ['..BB..', '..BB..', 'BBBBBB', '..BB..', '.BBBB.', '......'] },
  { name: 'Robot', rows: ['..PP..', 'BBBBBB', 'BYBBYB', 'BBBBBB', 'BRRRRB', 'BBBBBB'] },
  { name: 'Çiçek', rows: ['..RR..', '.RYYR.', '..RR..', 'G.GG.G', '.GGGG.', '..GG..'] },
  { name: 'Kedi', rows: ['O....O', 'OO..OO', 'OOOOOO', 'OBOOBO', 'OOYYOO', '.OOOO.'] },
  { name: 'Elmas', rows: ['..BB..', '.BBBB.', 'BBBBBB', '.BBBB.', '..BB..', '......'] },
  { name: 'Ok', rows: ['..RR..', '.RRRR.', 'RRRRRR', '..RR..', '..RR..', '..RR..'] },
  { name: 'Kale', rows: ['Y.YY.Y', 'YYYYYY', 'YYYYYY', 'YBYYBY', 'YYYYYY', 'YYOOYY'] },
  { name: 'Kum Saati', rows: ['OOOOOO', '.YYYY.', '..YY..', '..YY..', '.YYYY.', 'OOOOOO'] },
  { name: 'Çadır', rows: ['..OO..', '.OOOO.', '.OOOO.', 'OOYYOO', 'OYYYYO', '......'] },
  { name: 'Kardan Adam', rows: ['..PP..', '.PPPP.', '..BB..', '.BBBB.', '.BBBB.', '..BB..'] },
  { name: 'Yıldız', rows: ['..YY..', 'YYYYYY', '.YYYY.', '.YYYY.', 'YY..YY', '......'] },
  { name: 'Balon', rows: ['.RRRR.', 'RRRRRR', 'RRRRRR', '.RRRR.', '..RR..', '..GG..'] },
  { name: 'Dondurma', rows: ['.RRRR.', 'RRRRRR', '.YYYY.', '.YYYY.', '..YY..', '..YY..'] },
  { name: 'Şemsiye', rows: ['.BBBB.', 'BBBBBB', 'BBBBBB', '..OO..', '..OO..', '.OOOO.'] },
  { name: 'Baykuş', rows: ['O....O', 'OOOOOO', 'OYOOYO', 'OOYYOO', '.OOOO.', '.Y..Y.'] },
  { name: 'Araba', rows: ['.BBBB.', 'BYYYYB', 'BBBBBB', 'RBBBBR', 'BBBBBB', '.O..O.'] }
];

// --- 7x7 RESİMLER (orta sütun şeklin parçasıdır) ---
const SHAPES_7 = [
  { name: 'Ev', rows: ['...R...', '..RRR..', '.RRRRR.', 'RRRRRRR', '.YYYYY.', '.YBYBY.', '.YYOYY.'] },
  { name: 'Çam Ağacı', rows: ['...G...', '..GGG..', '.GGGGG.', '..GGG..', '.GGGGG.', 'GGGGGGG', '...O...'] },
  { name: 'Kalp', rows: ['.RR.RR.', 'RRRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...', '.......'] },
  { name: 'Kelebek', rows: ['P.....P', 'PP...PP', 'PPPBPPP', 'PPPBPPP', '.PPBPP.', 'PP.B.PP', 'P.....P'] },
  { name: 'Roket', rows: ['...R...', '..RRR..', '..BBB..', '..BYB..', '..BBB..', '.BBBBB.', 'B.OOO.B'] },
  { name: 'Yelkenli', rows: ['...O...', '..RRR..', '.RRRRR.', '...O...', 'BBBBBBB', '.BBBBB.', '..BBB..'] },
  { name: 'Taç', rows: ['Y..Y..Y', 'YY.Y.YY', 'YYYYYYY', 'YRYBYRY', 'YYYYYYY', '.......', '.......'] },
  { name: 'Robot', rows: ['...P...', '..PPP..', 'BBBBBBB', 'BYBBBYB', 'BBBBBBB', 'BBRRRBB', 'BBBBBBB'] },
  { name: 'Çiçek', rows: ['..RRR..', '.RRYRR.', '..RRR..', '...G...', 'GG.G.GG', '.GGGGG.', '...G...'] },
  { name: 'Kupa', rows: ['YYYYYYY', 'YYYYYYY', '.YYYYY.', '..YYY..', '...Y...', '..YYY..', '.OOOOO.'] },
  { name: 'Uçak', rows: ['...B...', '...B...', '..BBB..', 'BBBBBBB', '...B...', '..BBB..', '.......'] },
  { name: 'Mantar', rows: ['..RRR..', '.RYRYR.', 'RRRRRRR', 'RYRRRYR', '..YYY..', '..YYY..', '.......'] },
  { name: 'Kale', rows: ['Y.Y.Y.Y', 'YYYYYYY', 'YYBYBYY', 'YYYYYYY', 'YYYOYYY', 'YYYOYYY', '.......'] },
  { name: 'Kardan Adam', rows: ['..PPP..', '.PPPPP.', '..BBB..', '..BOB..', '.BBBBB.', 'BBBBBBB', '.BBBBB.'] },
  { name: 'Elmas', rows: ['...B...', '..BBB..', '.BBBBB.', 'BBBBBBB', '.BBBBB.', '..BBB..', '...B...'] },
  { name: 'Ok', rows: ['...R...', '..RRR..', '.RRRRR.', 'RRRRRRR', '..RRR..', '..RRR..', '..RRR..'] },
  { name: 'Kum Saati', rows: ['OOOOOOO', '.YYYYY.', '..YYY..', '...Y...', '..YYY..', '.YYYYY.', 'OOOOOOO'] },
  { name: 'Kedi', rows: ['O.....O', 'OO...OO', 'OOOOOOO', 'OBOOOBO', 'OOOROOO', '.OOOOO.', '.......'] },
  { name: 'Şemsiye', rows: ['...B...', '.BBBBB.', 'BBBBBBB', '...O...', '...O...', '..OOO..', '.......'] },
  { name: 'Yıldız', rows: ['...Y...', '...Y...', 'YYYYYYY', '.YYYYY.', '..YYY..', '.YY.YY.', 'YY...YY'] },
  { name: 'Balık', rows: ['...O...', '..OOO..', '.OBOBO.', '.OOOOO.', '..OOO..', '...O...', '..OOO..'] },
  { name: 'Elma Ağacı', rows: ['..GGG..', '.GGGGG.', 'GRGGGRG', 'GGGGGGG', '.GGGGG.', '...O...', '..OOO..'] },
  { name: 'Baykuş', rows: ['O.....O', 'OOOOOOO', 'OYOOOYO', 'OOOYOOO', '.OOOOO.', '.OOOOO.', '..Y.Y..'] },
  { name: 'Araba', rows: ['..BBB..', '.BYYYB.', 'BBBBBBB', 'RBBBBBR', 'BBBBBBB', '.O...O.', '.......'] }
];

// --- 8x8 RESİMLER ---
const SHAPES_8 = [
  { name: 'Ev', rows: ['...RR...', '..RRRR..', '.RRRRRR.', 'RRRRRRRR', '.YYYYYY.', '.YBYYBY.', '.YYOOYY.', '.YYOOYY.'] },
  { name: 'Çam Ağacı', rows: ['...GG...', '..GGGG..', '.GGGGGG.', '..GGGG..', '.GGGGGG.', 'GGGGGGGG', '...OO...', '...OO...'] },
  { name: 'Kalp', rows: ['.RR..RR.', 'RRRRRRRR', 'RRRRRRRR', 'RRRRRRRR', '.RRRRRR.', '..RRRR..', '...RR...', '........'] },
  { name: 'Kelebek', rows: ['PP....PP', 'PPP..PPP', 'PPPBBPPP', '.PPBBPP.', '..PBBP..', '.PPBBPP.', 'PPPBBPPP', 'PP....PP'] },
  { name: 'Roket', rows: ['...RR...', '..RRRR..', '..BBBB..', '..BYYB..', '..BBBB..', '.BBBBBB.', 'BBBBBBBB', 'B.OOOO.B'] },
  { name: 'Yelkenli', rows: ['...OO...', '..RRRR..', '.RRRRRR.', 'RRRRRRRR', '...OO...', 'BBBBBBBB', '.BBBBBB.', '..BBBB..'] },
  { name: 'Taç', rows: ['Y..YY..Y', 'YY.YY.YY', 'YYYYYYYY', 'YRYBBYRY', 'YYYYYYYY', '........', '........', '........'] },
  { name: 'Robot', rows: ['...PP...', '...PP...', 'BBBBBBBB', 'BYYBBYYB', 'BBBBBBBB', 'BBRRRRBB', 'BBBBBBBB', '.BB..BB.'] },
  { name: 'Çiçek', rows: ['..RRRR..', '.RRYYRR.', '.RRYYRR.', '..RRRR..', '...GG...', 'GG.GG.GG', '.GGGGGG.', '...GG...'] },
  { name: 'Kupa', rows: ['YYYYYYYY', 'YYYYYYYY', '.YYYYYY.', '..YYYY..', '...YY...', '...YY...', '..YYYY..', '.OOOOOO.'] },
  { name: 'Uçak', rows: ['...BB...', '...BB...', '..BBBB..', 'BBBBBBBB', 'BBBBBBBB', '...BB...', '..BBBB..', '........'] },
  { name: 'Mantar', rows: ['..RRRR..', '.RYRRYR.', 'RRRRRRRR', 'RYRRRRYR', 'RRRRRRRR', '..YYYY..', '..YYYY..', '..YYYY..'] },
  { name: 'Kale', rows: ['YY.YY.YY', 'YYYYYYYY', 'YBYYYYBY', 'YYYYYYYY', 'YYYOOYYY', 'YYYOOYYY', 'YYYOOYYY', '........'] },
  { name: 'Kardan Adam', rows: ['...PP...', '..PPPP..', '..BBBB..', '..BOOB..', '.BBBBBB.', 'BBBBBBBB', 'BBBBBBBB', '.BBBBBB.'] },
  { name: 'Elmas', rows: ['..BBBB..', '.BBBBBB.', 'BBBBBBBB', '.BBBBBB.', '..BBBB..', '...BB...', '........', '........'] },
  { name: 'Kum Saati', rows: ['OOOOOOOO', '.YYYYYY.', '..YYYY..', '...YY...', '...YY...', '..YYYY..', '.YYYYYY.', 'OOOOOOOO'] },
  { name: 'Kedi', rows: ['O......O', 'OO....OO', 'OOOOOOOO', 'OBBOOBBO', 'OOOOOOOO', 'OOORROOO', '.OOOOOO.', '........'] },
  { name: 'Şemsiye', rows: ['...BB...', '.BBBBBB.', 'BBBBBBBB', 'BBBBBBBB', '...OO...', '...OO...', '...OO...', '..OOOO..'] },
  { name: 'Yıldız', rows: ['...YY...', '...YY...', 'YYYYYYYY', '.YYYYYY.', '..YYYY..', '.YYYYYY.', '.YY..YY.', 'YY....YY'] },
  { name: 'Baykuş', rows: ['O......O', 'OOOOOOOO', 'OBBOOBBO', 'OBYOOYBO', 'OOOYYOOO', '.OOOOOO.', '.OOOOOO.', '..Y..Y..'] },
  { name: 'Dondurma', rows: ['..RRRR..', '.RRRRRR.', 'RRRRRRRR', '.YYYYYY.', '..YYYY..', '..YYYY..', '...YY...', '...YY...'] },
  { name: 'Elma Ağacı', rows: ['..GGGG..', '.GGGGGG.', 'GGRGGRGG', 'GGGGGGGG', '.GGGGGG.', '...OO...', '...OO...', '..OOOO..'] },
  { name: 'Araba', rows: ['..BBBB..', '.BYYYYB.', 'BBBBBBBB', 'BRBBBBRB', 'BBBBBBBB', '.O....O.', '........', '........'] },
  { name: 'Ahtapot', rows: ['..PPPP..', '.PPPPPP.', 'PPYPPYPP', 'PPPPPPPP', '.PPPPPP.', 'P.P..P.P', 'P.P..P.P', '........'] }
];

const SHAPES_BY_SIZE = { 6: SHAPES_6, 7: SHAPES_7, 8: SHAPES_8 };

// Şeklin dikey olarak kaydırılabileceği boş satır sayısı
const getFreeRows = (rows) => {
  let bottom = 0;
  for (let i = rows.length - 1; i >= 0 && /^\.+$/.test(rows[i]); i--) bottom++;
  return bottom;
};

// Sol yarının (ve tek boyutta orta sütunun) geçerli anahtarlarını süzer
export const sanitizeSymmetryLeftCells = (size, cells = {}) => {
  const n = Number(size) || 6;
  const halfCols = Math.floor(n / 2);
  const maxCol = n % 2 === 1 ? halfCols : halfCols - 1;
  const out = {};
  Object.entries(cells || {}).forEach(([key, color]) => {
    const [r, c] = key.split(',').map(Number);
    if (!color || isNaN(r) || isNaN(c)) return;
    if (r < 0 || r >= n || c < 0 || c > maxCol) return;
    out[`${r},${c}`] = color;
  });
  return out;
};

const shapeToLeftCells = (rows, n, swap, shiftDown) => {
  const halfCols = Math.floor(n / 2);
  const maxCol = n % 2 === 1 ? halfCols : halfCols - 1;
  const leftCells = {};
  rows.forEach((row, r) => {
    for (let c = 0; c <= maxCol; c++) {
      const ch = row[c];
      if (!ch || ch === '.') continue;
      const mapped = swap[ch] || ch;
      const color = SYMMETRY_COLORS[LETTERS.indexOf(mapped)];
      const rr = r + shiftDown;
      if (color && rr < n) leftCells[`${rr},${c}`] = color;
    }
  });
  return leftCells;
};

// Eksene bağlı, düzenli bloklardan oluşan rastgele desen (her zaman sol yarıda)
const buildRandomPattern = (n, rng, idx) => {
  const halfCols = Math.floor(n / 2);
  const maxCol = n % 2 === 1 ? halfCols : halfCols - 1;
  const cells = {};
  const colorA = SYMMETRY_COLORS[idx % SYMMETRY_COLORS.length];
  const colorB = SYMMETRY_COLORS[(idx + 3) % SYMMETRY_COLORS.length];
  // Satır satır, eksenden dışarı doğru uzanan "basamak" genişlikleri
  let width = 1 + Math.floor(rng() * (maxCol + 1));
  const top = Math.floor(rng() * 2);
  const bottom = n - Math.floor(rng() * 2);
  for (let r = top; r < bottom; r++) {
    if (rng() < 0.45) width = Math.max(1, Math.min(maxCol + 1, width + (rng() < 0.5 ? -1 : 1)));
    if (rng() < 0.12) continue; // ara boşluk
    const useB = (r + idx) % 3 === 0;
    for (let k = 0; k < width; k++) {
      const c = maxCol - k;
      cells[`${r},${c}`] = useB ? colorB : colorA;
    }
  }
  return cells;
};

export const generateSymmetryTemplatesForSize = (n, count = 200) => {
  const rng = createSeededRng(n * 77777 + 12345);
  const shapes = SHAPES_BY_SIZE[n] || SHAPES_6;
  const templates = [];
  const seen = new Set();
  const regularTarget = Math.round(count * 0.8); // %80 bilindik/düzenli şekil

  const pushTpl = (title, leftCells, kind) => {
    const sig = Object.keys(leftCells).sort().map(k => `${k}:${leftCells[k]}`).join('|');
    if (!sig || seen.has(sig)) return false;
    seen.add(sig);
    const solutionCells = {};
    Object.entries(leftCells).forEach(([key, color]) => {
      const [r, c] = key.split(',').map(Number);
      solutionCells[`${r},${n - 1 - c}`] = color;
    });
    templates.push({ id: templates.length + 1, size: n, title, kind, leftCells, solutionCells });
    return true;
  };

  // 1) Bilindik şekiller: her şekil farklı renk ve konum varyasyonlarıyla
  let variant = 0;
  while (templates.length < regularTarget && variant < 40) {
    for (let s = 0; s < shapes.length && templates.length < regularTarget; s++) {
      const shape = shapes[s];
      const free = getFreeRows(shape.rows);
      const shift = free > 0 ? variant % (free + 1) : 0;
      const swap = PALETTE_SWAPS[variant % PALETTE_SWAPS.length];
      pushTpl(`${shape.name} (${variant + 1})`, shapeToLeftCells(shape.rows, n, swap, shift), 'shape');
    }
    variant++;
  }

  // 2) Kalanlar: eksene bağlı düzenli rastgele desenler
  let guard = 0;
  while (templates.length < count && guard < 5000) {
    guard++;
    pushTpl(`Karışık Desen #${templates.length - regularTarget + 1}`, buildRandomPattern(n, rng, templates.length), 'random');
  }
  return templates;
};

export const SYMMETRY_TEMPLATES = {
  6: generateSymmetryTemplatesForSize(6, 200),
  7: generateSymmetryTemplatesForSize(7, 200),
  8: generateSymmetryTemplatesForSize(8, 200)
};

export const generateSymmetrySvgDataUrl = (symData = {}) => {
  const n = Number(symData.size) || 6;
  const halfCols = Math.floor(n / 2);
  const leftCells = sanitizeSymmetryLeftCells(n, symData.leftCells || {});
  const box = 240;
  const pad = 16;
  const cellS = (box - pad * 2) / n;
  let rects = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const isGiven = c < halfCols || (n % 2 === 1 && c === halfCols);
      const fill = isGiven ? (leftCells[`${r},${c}`] || '#ffffff') : '#ffffff';
      rects += `<rect x="${pad + c * cellS}" y="${pad + r * cellS}" width="${cellS}" height="${cellS}" fill="${fill}" stroke="#1e293b" stroke-width="1.2" />`;
    }
  }
  const midX = pad + (n / 2) * cellS;
  rects += `<line x1="${midX}" y1="${pad - 6}" x2="${midX}" y2="${box - pad + 6}" stroke="#dc2626" stroke-width="4" stroke-linecap="round" />`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}" width="${box}" height="${box}"><rect width="100%" height="100%" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const checkSymmetryAnswer = (symData = {}, studentCells = {}) => {
  const n = Number(symData.size) || 6;
  const halfCols = Math.floor(n / 2);
  const leftCells = normalizeColorCells(sanitizeSymmetryLeftCells(n, symData.leftCells || {}));
  const stuNorm = normalizeColorCells(studentCells || {});

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < halfCols; c++) {
      const leftColor = (leftCells[`${r},${c}`] || '').toLowerCase();
      const rightKey = `${r},${n - 1 - c}`;
      const stuColor = (stuNorm[rightKey] || '').toLowerCase();
      if (leftColor !== stuColor) return false;
    }
  }
  return true;
};

export const SymmetryGridPad = ({
  gridSize = 6,
  leftCells = {},
  studentCells = {},
  onChangeLeftCells,
  onChangeStudentCells,
  isTeacherEditor = false,
  readOnly = false,
  size = 250,
  title = "",
  status = null
}) => {
  const n = Number(gridSize) || 6;
  const halfCols = Math.floor(n / 2);
  const hasCenterCol = n % 2 === 1;
  const givenCells = sanitizeSymmetryLeftCells(n, leftCells);
  const [activeColor, setActiveColor] = useState(SYMMETRY_COLORS[0]);
  const [isErasing, setIsErasing] = useState(false);

  // Öğretmen: sol yarı + (tek boyutta) orta sütun. Öğrenci: sadece sağ yarı.
  const isTeacherCell = (c) => c < halfCols || (hasCenterCol && c === halfCols);
  const isStudentCell = (c) => c >= n - halfCols;

  const handleCellClick = (r, c) => {
    if (readOnly) return;
    const key = `${r},${c}`;
    if (isTeacherEditor) {
      if (!isTeacherCell(c) || !onChangeLeftCells) return;
      const next = { ...givenCells };
      if (isErasing || next[key] === activeColor) delete next[key];
      else next[key] = activeColor;
      onChangeLeftCells(next);
    } else {
      if (!isStudentCell(c) || !onChangeStudentCells) return;
      const next = { ...studentCells };
      if (isErasing || next[key] === activeColor) delete next[key];
      else next[key] = activeColor;
      onChangeStudentCells(next);
    }
  };

  let borderClass = "border-slate-300 bg-white";
  if (status === 'correct') borderClass = "border-green-500 bg-green-50/30 ring-4 ring-green-100";
  else if (status === 'wrong') borderClass = "border-red-500 bg-red-50/30 ring-4 ring-red-100";

  return (
    <div className="flex flex-col items-center select-none w-full">
      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 mb-1.5 px-2.5 py-0.5 bg-rose-50 border border-rose-200 rounded-full text-center">
          {title}
        </span>
      )}

      {!readOnly && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-slate-200 shadow-sm">
          {SYMMETRY_COLORS.map((color) => {
            const isSelected = !isErasing && activeColor.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                onClick={() => { setIsErasing(false); setActiveColor(color); }}
                className={`w-8 h-8 rounded-xl border-2 transition-transform ${
                  isSelected ? 'scale-110 ring-4 ring-indigo-400 border-white shadow-md z-10' : 'border-slate-200'
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
          <button
            type="button"
            onClick={() => setIsErasing(true)}
            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
              isErasing ? 'bg-pink-100 border-pink-500 ring-4 ring-pink-200 scale-110' : 'bg-slate-50 border-slate-200'
            }`}
            title="Silgi"
          >
            <EraserIcon size={18} />
          </button>
        </div>
      )}

      <div
        className={`relative rounded-2xl border-2 shadow-inner p-2 transition-all ${borderClass}`}
        style={{ width: size, height: size, maxWidth: '90vw', maxHeight: '90vw' }}
      >
        <div
          className="w-full h-full grid border border-slate-800 relative"
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: n }).map((_, r) =>
            Array.from({ length: n }).map((__, c) => {
              const key = `${r},${c}`;
              const teacherSide = isTeacherCell(c);
              const studentSide = isStudentCell(c);
              const cellColor = teacherSide
                ? (givenCells[key] || '#ffffff')
                : studentSide
                  ? (studentCells[key] || '#ffffff')
                  : '#ffffff';
              const clickable = !readOnly && ((isTeacherEditor && teacherSide) || (!isTeacherEditor && studentSide));

              return (
                <button
                  key={key}
                  type="button"
                  disabled={!clickable}
                  onClick={() => handleCellClick(r, c)}
                  style={{ backgroundColor: cellColor }}
                  className={`w-full h-full border border-slate-700 transition-colors ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                />
              );
            })
          )}

          {/* TEK VE BELİRGİN SİMETRİ EKSENİ (her boyutta tam ortadan geçer) */}
          <div
            className="absolute pointer-events-none"
            style={{ left: '50%', top: -6, bottom: -6, width: 5, transform: 'translateX(-50%)', backgroundColor: '#dc2626', borderRadius: 4, boxShadow: '0 0 0 1px rgba(255,255,255,0.85)' }}
          />
        </div>
      </div>
    </div>
  );
};
