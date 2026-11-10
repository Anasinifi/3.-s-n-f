// ============================================================================
// --- SUDOKU SORU BANKASI (3x3, 4x4, 5x5 • KOLAY / ORTA / ZOR • her biri 100) ---
// ============================================================================
// Okul öncesi sudokusu: her satırda ve her sütunda her sembol bir kez bulunur (blok yok).
//
// ZORLUK, boş kutu sayısına göre DEĞİL, çözmek için gereken DÜŞÜNME YOLUNA göre belirlenir:
//   KOLAY : Hep "bu satırda/sütunda tek eksik kaldı" diyerek takır takır doldurulur.
//   ORTA  : En az bir kutuda satıra VE sütuna birlikte bakmak gerekir
//           ("satırda 1 ve 3 var, sütunda 2 var -> buraya 4 gelir").
//   ZOR   : En az bir adımda yorum yapmak gerekir
//           ("2 şu kutuya gelirse diğer kutuya gelemez -> 2 sadece burada olabilir").
// Boş kutu oranı 4x4 ve 5x5'te en fazla %33'tür.
//
// Her soru FARKLI bir çözüm tablosundan (rastgele Latin kare) üretilir ve
// semboller 20 farklı tema arasında dönüşümlü kullanılır (sayılar, meyveler, hayvanlar...).

import { makeRng, shuffle, randInt } from './helpers';

export const SUDOKU_LEVELS = [
  { id: 'kolay', label: 'Kolay', hint: 'satırdaki/sütundaki tek eksiği bul' },
  { id: 'orta', label: 'Orta', hint: 'satıra ve sütuna birlikte bak' },
  { id: 'zor', label: 'Zor', hint: 'yorum yaparak çöz (buraya gelirse oraya gelemez)' }
];

// 20 farklı sembol teması (her biri en az 5 sembol)
export const SUDOKU_THEMES = [
  { id: 'sayi', label: 'Sayılar', symbols: ['1', '2', '3', '4', '5'] },
  { id: 'meyve', label: 'Meyveler', symbols: ['🍎', '🍌', '🍇', '🍊', '🍓'] },
  { id: 'hayvan', label: 'Hayvanlar', symbols: ['🐶', '🐱', '🐰', '🐻', '🐸'] },
  { id: 'renk', label: 'Renkli Daireler', symbols: ['🔴', '🔵', '🟡', '🟢', '🟣'] },
  { id: 'kare', label: 'Renkli Kareler', symbols: ['🟥', '🟦', '🟨', '🟩', '🟪'] },
  { id: 'tasit', label: 'Taşıtlar', symbols: ['🚗', '🚌', '🚲', '✈️', '🚂'] },
  { id: 'sebze', label: 'Sebzeler', symbols: ['🥕', '🌽', '🍅', '🥦', '🍆'] },
  { id: 'cicek', label: 'Çiçek ve Bitkiler', symbols: ['🌻', '🌷', '🌵', '🍀', '🌹'] },
  { id: 'deniz', label: 'Deniz Canlıları', symbols: ['🐟', '🐙', '🦀', '🐢', '🐳'] },
  { id: 'hava', label: 'Hava Durumu', symbols: ['☀️', '🌙', '⭐', '☁️', '⛄'] },
  { id: 'oyuncak', label: 'Oyuncaklar', symbols: ['⚽', '🧸', '🪁', '🎈', '🪀'] },
  { id: 'tatli', label: 'Tatlılar', symbols: ['🍦', '🍰', '🍭', '🍪', '🍩'] },
  { id: 'kus', label: 'Kuşlar', symbols: ['🐤', '🦆', '🦉', '🐧', '🦜'] },
  { id: 'bocek', label: 'Böcekler', symbols: ['🐞', '🦋', '🐝', '🐛', '🐌'] },
  { id: 'ciftlik', label: 'Çiftlik', symbols: ['🐮', '🐷', '🐔', '🐑', '🐴'] },
  { id: 'kalp', label: 'Renkli Kalpler', symbols: ['❤️', '💙', '💛', '💚', '💜'] },
  { id: 'giysi', label: 'Giysiler', symbols: ['👕', '👖', '🧦', '🧢', '👟'] },
  { id: 'muzik', label: 'Müzik Aletleri', symbols: ['🥁', '🎸', '🎺', '🎹', '🎻'] },
  { id: 'spor', label: 'Toplar', symbols: ['⚽', '🏀', '🏈', '🎾', '🏐'] },
  { id: 'harf', label: 'Harfler', symbols: ['A', 'B', 'C', 'D', 'E'] }
];

// Boş kutu sayısı aralıkları [en az, en çok]
//  4x4 -> 16 kutunun %33'ü = 5 ; 5x5 -> 25 kutunun %33'ü = 8
//  3x3 çok küçük olduğundan zor seviyede 6 boşa kadar izin verilir
const EMPTY_RANGE = {
  3: { kolay: [2, 4], orta: [4, 5], zor: [4, 6] },
  4: { kolay: [3, 5], orta: [4, 5], zor: [4, 5] },
  5: { kolay: [4, 7], orta: [5, 8], zor: [6, 8] }
};
export const maxEmptyFor = (n) => Math.max(...Object.values(EMPTY_RANGE[n]).map(r => r[1]));

// ---------------------------------------------------------------------------
// Rastgele Latin kare (her satır ve sütunda 1..n bir kez)
// ---------------------------------------------------------------------------
const randomLatin = (n, rng) => {
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  const fill = (pos) => {
    if (pos === n * n) return true;
    const r = Math.floor(pos / n), c = pos % n;
    for (const v of shuffle(Array.from({ length: n }, (_, k) => k + 1), rng)) {
      let ok = true;
      for (let k = 0; k < n && ok; k++) if (g[r][k] === v || g[k][c] === v) ok = false;
      if (!ok) continue;
      g[r][c] = v;
      if (fill(pos + 1)) return true;
      g[r][c] = 0;
    }
    return false;
  };
  fill(0);
  return g;
};

// ---------------------------------------------------------------------------
// İnsan gibi çözen çözücü
//   1 (KOLAY) = baştan sona hep "satırda/sütunda tek boş kaldı" adımlarıyla biter
//   2 (ORTA)  = en az bir adımda satıra ve sütuna birlikte bakmak gerekir
//   3 (ZOR)   = başlangıçta HİÇBİR satır/sütunda tek boş yoktur (dizerek başlanamaz, ilk adımdan
//               "buraya 2 gelirse oraya 3 gelemez" diye yorum gerekir) YA DA bu yorum en az iki kez gerekir
//   0         = mantıkla tek çözüme ulaşılamıyor (kullanılmaz)
// ---------------------------------------------------------------------------
export const gradeSudoku = (n, grid) => {
  const g = grid.map(r => [...r]);
  let steps = 0; let crossSteps = 0;
  const empties = () => { const e = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!g[r][c]) e.push([r, c]); return e; };
  const cands = (r, c) => { const used = new Set(); for (let k = 0; k < n; k++) { used.add(g[r][k]); used.add(g[k][c]); } const out = []; for (let v = 1; v <= n; v++) if (!used.has(v)) out.push(v); return out; };
  const hasFullHouse = (e) => e.some(([r, c]) => e.filter(([a]) => a === r).length === 1 || e.filter(([, b]) => b === c).length === 1);
  const fullHouseAtStart = hasFullHouse(empties());
  while (true) {
    const e = empties();
    if (!e.length) {
      const level = crossSteps === 0 ? 1 : (!fullHouseAtStart || crossSteps >= 2 ? 3 : 2);
      return { level, steps, crossSteps, fullHouseAtStart };
    }
    let placed = false;
    // 1) tek eksik (satırda ya da sütunda tek boş kaldı)
    for (const [r, c] of e) {
      if (e.filter(([a]) => a === r).length === 1 || e.filter(([, b]) => b === c).length === 1) {
        const cs = cands(r, c); if (cs.length !== 1) return { level: 0, steps };
        g[r][c] = cs[0]; placed = true; steps++; break;
      }
    }
    if (placed) continue;
    // 2) satır + sütun birlikte (kutuya tek aday kaldı) -> "buraya 2 gelirse oraya 3 gelemez"
    for (const [r, c] of e) {
      const cs = cands(r, c);
      if (cs.length === 0) return { level: 0, steps };
      if (cs.length === 1) { g[r][c] = cs[0]; placed = true; steps++; crossSteps++; break; }
    }
    if (!placed) return { level: 0, steps }; // tahmin gerektirir -> kullanılmaz
  }
};

const LEVEL_NUM = { kolay: 1, orta: 2, zor: 3 };

// Tek bir bulmaca üret (hedef seviyeye uyan) -> { solution, puzzle }
const makePuzzle = (n, level, rng) => {
  const [lo, hi] = EMPTY_RANGE[n][level];
  const want = LEVEL_NUM[level];
  for (let tries = 0; tries < 1500; tries++) {
    const sol = randomLatin(n, rng);
    for (let m = 0; m < 25; m++) {
      const k = randInt(rng, lo, hi);
      const cells = shuffle(Array.from({ length: n * n }, (_, x) => x), rng).slice(0, k);
      const puz = sol.map(r => [...r]);
      cells.forEach(x => { puz[Math.floor(x / n)][x % n] = 0; });
      const { level: got } = gradeSudoku(n, puz);
      if (got === want) return { solution: sol, puzzle: puz };
    }
  }
  return null;
};

const toMap = (grid, symbols, skipEmpty) => {
  const m = {};
  grid.forEach((row, r) => row.forEach((v, c) => { if (!(skipEmpty && !v)) m[`${r},${c}`] = symbols[v - 1]; }));
  return m;
};

const _cache = {};
// size: 3|4|5, level: 'kolay'|'orta'|'zor' -> 100 hazır soru
export const getSudokuBank = (size, level, count = 100) => {
  const key = `${size}_${level}`;
  if (_cache[key]) return _cache[key];
  const seen = new Set(); const list = [];
  for (let i = 0; list.length < count && i < count * 20; i++) {
    const rng = makeRng(`sudoku_${key}`, i);
    const p = makePuzzle(size, level, rng);
    if (!p) continue;
    const sig = p.puzzle.map(r => r.join('')).join('/');
    if (seen.has(sig)) continue;
    seen.add(sig);
    const idx = list.length;
    // İlk 2 soru sayılarla, sonra temalar sırayla döner (her tema ~5 soru)
    const theme = SUDOKU_THEMES[idx % SUDOKU_THEMES.length];
    const symbols = theme.symbols.slice(0, size);
    list.push({
      id: idx + 1,
      size, level,
      themeId: theme.id, themeLabel: theme.label,
      symbols,
      solutionGrid: p.solution,
      puzzleGrid: p.puzzle,
      solution: toMap(p.solution, symbols, false),
      clues: toMap(p.puzzle, symbols, true),
      emptyCount: p.puzzle.flat().filter(v => !v).length
    });
  }
  _cache[key] = list;
  return list;
};

// Bir şablona farklı sembol teması uygula (öğretmen tema değiştirmek isterse)
export const applySudokuTheme = (tpl, themeId) => {
  const theme = SUDOKU_THEMES.find(t => t.id === themeId) || SUDOKU_THEMES[0];
  const symbols = theme.symbols.slice(0, tpl.size);
  return { ...tpl, themeId: theme.id, themeLabel: theme.label, symbols, solution: toMap(tpl.solutionGrid, symbols, false), clues: toMap(tpl.puzzleGrid, symbols, true) };
};
