// ============================================================================
// --- BİLSEM: PERSPEKTİF (önden / yukarıdan bakınca ne görürsün?) ---
// --- BİLSEM: KÜPLER (küp sayma) ---
// ============================================================================
import { card, put, OL, S, txt, HEX, isoScene, lighten, darken } from './draw';
import { makeRng, shuffle, pick, pickN, pickWrongs, result, randInt } from './common';
import { arrow } from '../helpers';

// ---------------------------------------------------------------------------
// PERSPEKTİF: renkli küplerden kuleler (eğik çizim) + bakan göz
// towers: [[renk(alt), renk, ...], ...] soldan sağa
// ---------------------------------------------------------------------------
const U = 26; // küp boyu
const obliqueCube = (x, y, col) => {
  const d = U * 0.45;
  return `<polygon points="${x},${y} ${x + d},${y - d} ${x + U + d},${y - d} ${x + U},${y}" fill="${lighten(col, 0.35)}" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>`
    + `<polygon points="${x + U},${y} ${x + U + d},${y - d} ${x + U + d},${y + U - d} ${x + U},${y + U}" fill="${darken(col, 0.25)}" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>`
    + `<rect x="${x}" y="${y}" width="${U}" height="${U}" fill="${col}" stroke="${OL}" stroke-width="2"/>`;
};
const eye = (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="13" ry="8" fill="#fff" ${S}/><circle cx="${cx}" cy="${cy}" r="4.5" fill="#1e3a8a"/><circle cx="${cx + 1.5}" cy="${cy - 1.5}" r="1.5" fill="#fff"/>`;
const towersScene = (towers, view) => {
  const gap = 12; const n = towers.length;
  const W = 60 + n * U + (n - 1) * gap + 60, H = 200;
  const baseY = 150; const x0 = (W - (n * U + (n - 1) * gap)) / 2 - 6;
  let s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="#f8fafc"/><path d="M14,${baseY + U} L${W - 14},${baseY + U}" stroke="#cbd5e1" stroke-width="3"/>`;
  towers.forEach((t, i) => { t.forEach((col, z) => { s += obliqueCube(x0 + i * (U + gap), baseY - z * U, col); }); });
  const midX = x0 + (n * U + (n - 1) * gap) / 2;
  if (view === 'top') s += eye(midX, 18) + arrow(midX, 30, midX, 50, '#ef4444', 4) + txt(midX + 44, 18, 'yukarıdan', 12, '#ef4444');
  else s += eye(midX, baseY + U + 34) + arrow(midX, baseY + U + 24, midX, baseY + U + 8, '#ef4444', 4) + txt(midX + 38, baseY + U + 34, 'önden', 12, '#ef4444');
  return card(s, { w: W, h: H + (view === 'front' ? 24 : 0) });
};
// önden görünüş: kare sütunlar
const frontView = (towers) => {
  const c = 22, gap = 4; const n = towers.length; const maxH = Math.max(...towers.map(t => t.length), 3);
  const W = Math.max(100, n * c + (n - 1) * gap + 30), H = Math.max(100, maxH * c + 30);
  const x0 = (W - (n * c + (n - 1) * gap)) / 2, by = H - 14;
  let s = `<path d="M8,${by} L${W - 8},${by}" stroke="#cbd5e1" stroke-width="2"/>`;
  towers.forEach((t, i) => t.forEach((col, z) => { s += `<rect x="${x0 + i * (c + gap)}" y="${by - (z + 1) * c}" width="${c}" height="${c}" fill="${col}" stroke="${OL}" stroke-width="2"/>`; }));
  return card(s, { w: W, h: H });
};
// yukarıdan görünüş: her kulenin en üst rengi (soldan sağa kareler)
const topView = (towers) => {
  const c = 26, gap = 4; const n = towers.length; const W = Math.max(100, n * c + (n - 1) * gap + 30), H = 100;
  const x0 = (W - (n * c + (n - 1) * gap)) / 2;
  let s = '';
  towers.forEach((t, i) => { s += `<rect x="${x0 + i * (c + gap)}" y="${(H - c) / 2}" width="${c}" height="${c}" fill="${t[t.length - 1]}" stroke="${OL}" stroke-width="2.5"/>`; });
  return card(s, { w: W, h: H });
};
const tKey = (towers) => towers.map(t => t.join('-')).join('|');
const tops = (towers) => towers.map(t => t[t.length - 1]).join('|');

const makeTowers = (rng, n, minH, maxH) => {
  const towers = [];
  for (let i = 0; i < n; i++) { const h = randInt(rng, minH, maxH); towers.push(Array.from({ length: h }, () => pick(HEX, rng))); }
  // aynı kulede üst üste aynı renk olmasın
  towers.forEach(t => { for (let z = 1; z < t.length; z++) if (t[z] === t[z - 1]) t[z] = pick(HEX.filter(h => h !== t[z - 1]), rng); });
  return towers;
};

const perspective = (view, n, minH, maxH, m) => (key, seed) => {
  const rng = makeRng(key, seed);
  const towers = makeTowers(rng, n, minH, maxH);
  if (view === 'top') {
    // en üst renkler birbirinden ayrı olsun
    const used = new Set(); towers.forEach(t => { if (used.has(t[t.length - 1])) t[t.length - 1] = pick(HEX.filter(h => !used.has(h) && h !== t[t.length - 2]), rng) || t[t.length - 1]; used.add(t[t.length - 1]); });
  }
  const view$ = view === 'top' ? topView : frontView; const keyF = view === 'top' ? tops : tKey;
  const opt = (tw) => ({ key: keyF(tw), render: () => view$(tw) });
  const cands = [];
  if (view === 'top') {
    cands.push(opt(towers.map(t => [t[0]])));                                   // en alttaki renkler
    if (n > 1) cands.push(opt([...towers].reverse()));                           // ters sıra
    cands.push(opt(towers.map(t => [pick(HEX.filter(h => h !== t[t.length - 1]), rng)])));
    if (n > 1) cands.push(opt(towers.map(t => [t.length > 1 ? t[t.length - 2] : t[0]])));
  } else {
    cands.push(opt(towers.map(t => [...t].reverse())));                          // ters dizilmiş
    if (n > 1) cands.push(opt([...towers].reverse()));                           // sağ-sol karışık
    cands.push(opt(towers.map((t, i) => (i === 0 ? [...t, pick(HEX, rng)] : t)))); // fazla küp
    cands.push(opt(towers.map((t, i) => (i === n - 1 ? t.map((c, z) => (z === 0 ? pick(HEX.filter(h => h !== c), rng) : c)) : t)))); // bir renk farklı
  }
  return result({
    sig: tKey(towers), main: towersScene(towers, view),
    correct: opt(towers), wrongs: pickWrongs(keyF(towers), shuffle(cands, rng), m - 1, () => opt(makeTowers(rng, n, minH, maxH)))
  });
};
export const perEasyTop = perspective('top', 1, 2, 4, 3);
export const perEasyFront = perspective('front', 1, 2, 3, 3);
export const perMidFront = perspective('front', 2, 1, 3, 4);
export const perMidTop = perspective('top', 2, 1, 3, 4);
export const perHardFront = perspective('front', 3, 1, 3, 4);
export const perHardTop = perspective('top', 3, 1, 4, 4);

// ---------------------------------------------------------------------------
// KÜPLER
// ---------------------------------------------------------------------------
const CUBE_COLS = ['#60a5fa', '#f87171', '#fbbf24', '#4ade80', '#c084fc', '#fb923c'];
// heights[y][x] -> küp listesi (sütunlar yerden yükselir)
const fromHeights = (H, col) => { const out = []; H.forEach((row, y) => row.forEach((h, x) => { for (let z = 0; z < h; z++) out.push({ x, y, z, color: col }); })); return out; };
const countOf = (H) => H.flat().reduce((a, b) => a + b, 0);
const cubesCard = (H, col, w = 160, h = 140) => {
  const cubes = fromHeights(H, col);
  // u=1 için çizimin sınırlarını bul, sonra karta sığacak şekilde ölçekle ve ortala
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  cubes.forEach(c => { const x = (c.x - c.y) * 0.866, y = (c.x + c.y) * 0.5 - c.z; x0 = Math.min(x0, x - 0.866); x1 = Math.max(x1, x + 0.866); y0 = Math.min(y0, y - 1); y1 = Math.max(y1, y + 1); });
  const u = Math.min(30, (w - 24) / (x1 - x0), (h - 24) / (y1 - y0));
  const ox = w / 2 - ((x0 + x1) / 2) * u, oy = h / 2 - ((y0 + y1) / 2) * u;
  return card(isoScene(cubes, ox, oy, u), { w, h });
};
const numOpt = (n) => ({ key: 'n' + n, render: () => card(txt(50, 52, n, 52, '#4f46e5')) });
const nearNums = (n, rng, m, lo = 1) => { const pool = shuffle([n - 2, n - 1, n + 1, n + 2].filter(x => x >= lo), rng); return pool.slice(0, m - 1).map(numOpt); };

// Yapı üreticileri
const lineOrTower = (rng, n) => { const r = rng(); if (r < 0.34) return [Array(n).fill(1)]; if (r < 0.67) return [[n]]; const a = Math.max(1, n - 1); return [[a, ...Array(n - a).fill(1)]]; };
const rowColumns = (rng, total) => { // tek sıra, yükseklik 1-3, hepsi görünür
  for (let t = 0; t < 50; t++) { const k = randInt(rng, 2, 4); const hs = Array.from({ length: k }, () => randInt(rng, 1, 3)); if (countOf([hs]) === total) return [hs]; }
  return [[total]];
};
const flatFloor = (rng, total) => { // iki sıra, tek kat (hepsi görünür)
  const w = Math.max(Math.ceil(total / 2), randInt(rng, 3, 4));
  const cells = shuffle([...Array(2 * w).keys()], rng).slice(0, total);
  const H = [Array(w).fill(0), Array(w).fill(0)];
  cells.forEach(i => { H[i % 2][Math.floor(i / 2)] = 1; });
  return H;
};
const hiddenStack = (rng, total) => { // 2 sıra, 1-3 kat; arkadaki alt küpler gizli olabilir
  for (let t = 0; t < 200; t++) {
    const w = randInt(rng, 2, 3); const H = [Array.from({ length: w }, () => randInt(rng, 1, 3)), Array.from({ length: w }, () => randInt(rng, 0, 2))];
    if (countOf(H) === total && H[0].some(v => v >= 2)) return H;
  }
  return [[Math.ceil(total / 2), Math.floor(total / 2)]];
};

const cubeCount = (lo, hi, builder, m) => (key, seed) => {
  const rng = makeRng(key, seed);
  const n = randInt(rng, lo, hi); const H = builder(rng, n); const real = countOf(H); const col = pick(CUBE_COLS, rng);
  return result({ sig: JSON.stringify(H) + col, main: cubesCard(H, col, 200, 170), correct: numOpt(real), wrongs: nearNums(real, rng, m), tag: String(real) });
};
// "Hangisinde N küp var?" -> üstte sayı, şıklarda yapılar
const cubeWhich = (lo, hi, builder, m) => (key, seed) => {
  const rng = makeRng(key, seed);
  const n = randInt(rng, lo, hi); const col = pick(CUBE_COLS, rng);
  const H = builder(rng, n);
  const others = shuffle([n - 2, n - 1, n + 1, n + 2].filter(x => x >= 1), rng).slice(0, m - 1);
  return result({
    sig: JSON.stringify(H) + n + col, main: card(txt(70, 52, n, 64, '#4f46e5'), { w: 140, h: 100, bg: '#eef2ff' }),
    correct: { key: 'c' + n, render: () => cubesCard(H, col) },
    wrongs: others.map(x => { const Hx = builder(rng, x); return { key: 'c' + x, render: () => cubesCard(Hx, col) }; }),
    tag: String(n)
  });
};
export const cubeEasyCount = cubeCount(2, 5, (rng, n) => lineOrTower(rng, n), 3);
export const cubeEasyWhich = cubeWhich(2, 5, (rng, n) => lineOrTower(rng, n), 3);
export const cubeMidRow = cubeCount(4, 8, rowColumns, 4);
export const cubeMidFloor = cubeCount(4, 8, flatFloor, 4);
export const cubeHardHidden = cubeCount(5, 10, hiddenStack, 4);
export const cubeHardWhich = cubeWhich(5, 9, hiddenStack, 4);

// ÇOK ZOR: 3 sıra derinlik, 1-3 kat; arkadaki küplerin bir kısmı görünmez (8-14 küp)
const deepStack = (rng, total) => {
  for (let t = 0; t < 400; t++) {
    const w = randInt(rng, 2, 3);
    const H = [Array.from({ length: w }, () => randInt(rng, 1, 3)), Array.from({ length: w }, () => randInt(rng, 0, 3)), Array.from({ length: w }, () => randInt(rng, 0, 2))];
    if (countOf(H) === total && H[0].some(v => v >= 2) && H[1].some(v => v >= 1)) return H;
  }
  return hiddenStack(rng, Math.min(total, 10));
};
export const cubeVeryHardCount = cubeCount(8, 14, deepStack, 4);
export const cubeVeryHardWhich = cubeWhich(9, 12, deepStack, 4);

// İLKOKUL (1-3. sınıf) EK KALIPLARI
export const perG3Front = perspective('front', 4, 1, 4, 4);
export const perG3Top = perspective('top', 4, 1, 4, 4);
// 3-4 sıra derinlik, 1-4 kat: çok sayıda gizli küp (12-20)
const giantStack = (rng, total) => {
  for (let t = 0; t < 600; t++) {
    const w = randInt(rng, 3, 4);
    const H = [Array.from({ length: w }, () => randInt(rng, 1, 4)), Array.from({ length: w }, () => randInt(rng, 1, 3)), Array.from({ length: w }, () => randInt(rng, 0, 3))];
    if (countOf(H) === total && H[0].some(v => v >= 3)) return H;
  }
  return deepStack(rng, Math.min(total, 14));
};
export const cubeG3Count = cubeCount(12, 20, giantStack, 4);
export const cubeG3Which = cubeWhich(12, 18, giantStack, 4);
