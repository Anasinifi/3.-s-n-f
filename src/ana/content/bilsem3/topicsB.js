// ============================================================================
// --- BİLSEM: KATLAMA · MATRİS · KÜPLER · GÖLGE ---
// ============================================================================
import { makeRng, shuffle, pick, randInt, COLS, INK, n2, box, shape, text, qmark, arrowLine, build, capped, SHAPES, ASYM } from './core';
import { drawCubes } from './topicsA';

// ---------------------------------------------------------------------------
// KATLAMA 1: kâğıt katla, del, aç
// ---------------------------------------------------------------------------
// katlama: yansıtma + kalan bölge (yarım düzlem)
const FOLDS = {
  Vr: { ref: ([x, y]) => [100 - x, y], keep: ([x]) => x >= 50, line: [[50, 0], [50, 100]], arc: [30, 50, 70, 50] },  // soldan sağa
  Vl: { ref: ([x, y]) => [100 - x, y], keep: ([x]) => x <= 50, line: [[50, 0], [50, 100]], arc: [70, 50, 30, 50] },  // sağdan sola
  Hb: { ref: ([x, y]) => [x, 100 - y], keep: ([, y]) => y >= 50, line: [[0, 50], [100, 50]], arc: [50, 30, 50, 70] }, // yukarıdan aşağı
  Ht: { ref: ([x, y]) => [x, 100 - y], keep: ([, y]) => y <= 50, line: [[0, 50], [100, 50]], arc: [50, 70, 50, 30] },
  D1: { ref: ([x, y]) => [y, x], keep: ([x, y]) => y >= x, line: [[0, 0], [100, 100]], arc: [72, 28, 30, 70] },     // sağ üst köşe sol alta
  D2: { ref: ([x, y]) => [100 - y, 100 - x], keep: ([x, y]) => x + y >= 100, line: [[100, 0], [0, 100]], arc: [28, 28, 70, 70] } // sol üst köşe sağ alta
};
const clip = (poly, keep) => { // Sutherland-Hodgman (yarım düzlem; keep sınırı doğrusal)
  const out = []; const inside = (p) => keep(p);
  const inter = (a, b) => { let lo = 0, hi = 1; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; const p = [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m]; if (inside(p) === inside(a)) lo = m; else hi = m; } const m = (lo + hi) / 2; return [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m]; };
  for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; const ia = inside(a), ib = inside(b); if (ia) out.push(a); if (ia !== ib) out.push(inter(a, b)); }
  return out;
};
const HOLE = {
  circle: (x, y) => Array.from({ length: 14 }, (_, k) => [x + 6 * Math.cos(k * Math.PI / 7), y + 6 * Math.sin(k * Math.PI / 7)]),
  square: (x, y) => [[x - 5.5, y - 5.5], [x + 5.5, y - 5.5], [x + 5.5, y + 5.5], [x - 5.5, y + 5.5]],
  rtri: (x, y) => [[x - 7, y + 6], [x - 7, y - 7], [x + 7, y + 6]],
  flag: (x, y) => [[x - 6, y + 7], [x - 6, y - 7], [x + 7, y - 3], [x - 2, y], [x - 2, y + 7]]
};
const holeKey = (P) => { const cx = P.reduce((a, p) => a + p[0], 0) / P.length, cy = P.reduce((a, p) => a + p[1], 0) / P.length; return `${Math.round(cx)},${Math.round(cy)}:` + P.map(([x, y]) => `${Math.round(x - cx)}${Math.round(y - cy)}`).sort().join(''); };
const setKey = (H) => H.map(holeKey).sort().join('|');
const paper = (H, region) => {
  const R = region || [[0, 0], [100, 0], [100, 100], [0, 100]];
  let s = `<polygon points="${R.map(([x, y]) => `${n2(x * 0.84 + 8)},${n2(y * 0.84 + 8)}`).join(' ')}" fill="#fde68a" stroke="${INK}" stroke-width="2"/>`;
  H.forEach(P => { s += `<polygon points="${P.map(([x, y]) => `${n2(x * 0.84 + 8)},${n2(y * 0.84 + 8)}`).join(' ')}" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`; });
  return s;
};
export const foldPunch = (nFolds, nHoles, shapes) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const names = Object.keys(FOLDS);
  const seq = []; let gs = 0; while (seq.length < nFolds && gs++ < 50) { const f = pick(names, rng); if (seq.includes(f) || seq.some(x => x[0] === f[0] && f[0] !== 'D')) continue; seq.push(f); }
  if (seq.length < nFolds) return null;
  let region = [[0, 0], [100, 0], [100, 100], [0, 100]];
  const regions = [region];
  seq.forEach(f => { region = clip(region, FOLDS[f].keep); regions.push(region); });
  if (region.length < 3) return null;
  // delikleri son bölgenin içine (katlama çizgilerinden uzak) koy
  const inside = (x, y) => seq.every(f => FOLDS[f].keep([x, y])) && seq.every(f => { const r = FOLDS[f].ref([x, y]); return Math.hypot(r[0] - x, r[1] - y) > 22; });
  const holes = []; let guard = 0;
  while (holes.length < nHoles && guard++ < 300) { const x = randInt(rng, 10, 90), y = randInt(rng, 10, 90); if (!inside(x, y)) continue; if (holes.some(h => Math.hypot(h.x - x, h.y - y) < 20)) continue; holes.push({ x, y, t: pick(shapes, rng) }); }
  if (holes.length < nHoles) return null;
  const punched = holes.map(h => HOLE[h.t](h.x, h.y));
  const unfold = (H, folds, { keepShape = false } = {}) => { let cur = H; [...folds].reverse().forEach(f => { cur = [...cur, ...cur.map(P => { if (!keepShape) return P.map(FOLDS[f].ref); const c = FOLDS[f].ref([P.reduce((a, p) => a + p[0], 0) / P.length, P.reduce((a, p) => a + p[1], 0) / P.length]); const cx = P.reduce((a, p) => a + p[0], 0) / P.length, cy = P.reduce((a, p) => a + p[1], 0) / P.length; return P.map(([x, y]) => [x - cx + c[0], y - cy + c[1]]); })]; }); return cur; };
  const opt = (H) => ({ k: setKey(H), img: box(paper(H)) });
  const correct = opt(unfold(punched, seq));
  const wrongs = [];
  if (seq.length > 1) wrongs.push(opt(unfold(punched, seq.slice(1))), opt(unfold(punched, seq.slice(0, 1))));
  wrongs.push(opt(punched));
  wrongs.push(opt(unfold(punched, seq, { keepShape: true })));
  names.filter(f => !seq.includes(f)).forEach(f => wrongs.push(opt(unfold(punched, [...seq.slice(0, -1), f]))));
  const full = unfold(punched, seq); if (full.length > 2) wrongs.push(opt(full.filter((_, k) => k !== randInt(rng, 0, full.length - 1))));
  // ana resim: katlama adımları
  const frame = (k) => {
    const R = regions[k]; const f = seq[k]; const L = FOLDS[f];
    let s = `<polygon points="${R.map(([x, y]) => `${n2(x * 0.84 + 8)},${n2(y * 0.84 + 8)}`).join(' ')}" fill="#fde68a" stroke="${INK}" stroke-width="2"/>`;
    s += `<line x1="${n2(L.line[0][0] * 0.84 + 8)}" y1="${n2(L.line[0][1] * 0.84 + 8)}" x2="${n2(L.line[1][0] * 0.84 + 8)}" y2="${n2(L.line[1][1] * 0.84 + 8)}" stroke="${INK}" stroke-width="2" stroke-dasharray="5 4"/>`;
    const [ax, ay, bx, by] = L.arc.map(v => v * 0.84 + 8);
    s += `<path d="M${n2(ax)},${n2(ay)} Q${n2((ax + bx) / 2 + (by - ay) * 0.3)},${n2((ay + by) / 2 - (bx - ax) * 0.3 - 8)} ${n2(bx)},${n2(by)}" fill="none" stroke="#dc2626" stroke-width="3"/>` + `<circle cx="${n2(bx)}" cy="${n2(by)}" r="3.5" fill="#dc2626"/>`;
    return s;
  };
  let m = ''; let x = 0;
  seq.forEach((_, k) => { m += `<g transform="translate(${x} 0)">${frame(k)}</g>` + arrowLine(x + 100, 54, x + 116, 54, INK, 2.5); x += 120; });
  m += `<g transform="translate(${x} 0)">${paper(punched, regions[regions.length - 1])}</g>` + arrowLine(x + 100, 54, x + 116, 54, INK, 2.5); x += 120;
  m += qmark(x + 40, 54, 44);
  return build({ sig: 'FP' + seq.join() + setKey(punched), text: 'Kâğıt kırmızı oklar yönünde katlanıp delindi. Kâğıt açılınca nasıl görünür?', main: box(m, x + 90, 108), correct, wrongs: shuffle(wrongs, rng) });
}, 999);

// ---------------------------------------------------------------------------
// KATLAMA 2: şeffaf kart katlanınca üst üste gelen şekiller
// ---------------------------------------------------------------------------
export const foldOverlay = (vertical, nLeft, nRight) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const mk = (n, x0) => { const out = []; let g = 0; while (out.length < n && g++ < 100) { const it = { t: pick([...ASYM, 'triangle', 'star', 'circle'], rng), x: x0 + randInt(rng, 12, 38), y: randInt(rng, 12, 38), c: pick(COLS, rng), rot: pick([0, 90, 180, 270], rng) }; if (out.some(o => Math.hypot(o.x - it.x, o.y - it.y) < 16)) continue; out.push(it); } return out; };
  const L = mk(nLeft, 0), R = mk(nRight, 50);
  if (L.length < nLeft || R.length < nRight) return null;
  if (!L.some(i => ASYM.includes(i.t))) L[0].t = 'flag';
  // dikey kartta her şey köşegene göre çevrilir: sol yarı -> üst yarı, sağ yarı -> alt yarı
  const T = (inner) => (vertical ? `<g transform="matrix(0 1 1 0 0 0)">${inner}</g>` : inner);
  const draw = (items, tf = '') => `<g transform="${tf}">${items.map(it => shape(it.t, it.x, it.y, 9, it.c, { rot: it.rot })).join('')}</g>`;
  const half = (inner) => box(T(`<g transform="scale(2) translate(-50 0)"><rect x="51" y="1" width="48" height="48" rx="4" fill="#ecfeff" stroke="${INK}" stroke-width="1"/>${inner}</g>`));
  const opt = (k, inner) => ({ k, img: half(inner) });
  const mirL = draw(L, 'translate(100 0) scale(-1 1)');
  const correct = opt('ok', draw(R) + mirL);
  const wrongs = [
    opt('kaydir', draw(R) + draw(L, 'translate(50 0)')),
    opt('ters', `<g transform="translate(150 0) scale(-1 1)">${draw(R)}${mirL}</g>`),
    opt('eksikR', draw(R.slice(1)) + mirL),
    opt('eksikL', draw(R) + draw(L.slice(1), 'translate(100 0) scale(-1 1)')),
    opt('ust', `<g transform="translate(0 50) scale(1 -1)">${draw(R)}${mirL}</g>`)
  ];
  const card2 = box(T(`<rect x="2" y="2" width="96" height="48" rx="6" fill="#ecfeff" stroke="${INK}" stroke-width="2"/><line x1="50" y1="2" x2="50" y2="50" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>${draw(L)}${draw(R)}<path d="M26,10 Q50,-6 74,10" fill="none" stroke="#dc2626" stroke-width="2.5"/><circle cx="74" cy="10" r="2.5" fill="#dc2626"/>`), vertical ? 52 : 100, vertical ? 100 : 52);
  return build({ sig: 'FO' + vertical + JSON.stringify([L, R]), text: vertical ? 'Şeffaf kart kesikli çizgiden yukarıdan aşağıya katlanınca nasıl görünür?' : 'Şeffaf kart kesikli çizgiden soldan sağa katlanınca nasıl görünür?', main: card2, correct, wrongs: shuffle(wrongs, rng) });
}, 999);

// ---------------------------------------------------------------------------
// MATRİS 1: şekil / renk / sayı kuralları
// ---------------------------------------------------------------------------
const cellFig = (f) => {
  const n = f.count; const r = n === 1 ? 26 : n === 2 ? 18 : 14;
  const pos = n === 1 ? [[50, 50]] : n === 2 ? [[30, 50], [70, 50]] : [[50, 28], [28, 70], [72, 70]];
  return pos.map(([x, y]) => shape(f.shape, x, y, f.big ? r : r * 0.72, f.color) + (f.dot ? `<circle cx="${x}" cy="${y}" r="3.5" fill="#fff" stroke="${INK}" stroke-width="1.2"/>` : '')).join('');
};
const fkey = (f) => [f.shape, f.color, f.count, f.big ? 1 : 0, f.dot ? 1 : 0].join('.');
export const matrixRules = (attrs) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const V = { shape: shuffle(SHAPES, rng).slice(0, 3), color: shuffle(COLS, rng).slice(0, 3), count: shuffle([1, 2, 3], rng), big: shuffle([true, false, true], rng), dot: [true, false, false] };
  const base = { shape: V.shape[0], color: V.color[0], count: 1, big: true, dot: false };
  const rules = {}; const shifts = shuffle([1, 2], rng);
  attrs.forEach((a, k) => { rules[a] = pick(['latin', 'latin', 'row', 'col'], rng); if (rules[a] === 'latin') rules[a] = 'latin' + shifts[k % 2]; });
  const val = (a, r, c) => { const v = V[a]; const rule = rules[a]; if (!rule) return base[a]; if (rule === 'row') return v[r]; if (rule === 'col') return v[c]; const sh = rule === 'latin1' ? 1 : 2; return v[(c + r * sh) % 3]; };
  const cell = (r, c) => { const f = { ...base }; attrs.forEach(a => { f[a] = val(a, r, c); }); return f; };
  const C = 46; let s = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const x = 6 + c * C, y = 6 + r * C;
    s += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
    if (r === 2 && c === 2) s += text(x + C / 2, y + C / 2 + 1, '?', 28, '#dc2626');
    else s += `<g transform="translate(${x} ${y}) scale(${C / 100})">${cellFig(cell(r, c))}</g>`;
  }
  const ans = cell(2, 2);
  const opt = (f) => ({ k: fkey(f), img: box(cellFig(f)) });
  const wrongs = [];
  attrs.forEach(a => V[a].forEach(v => { if (v !== ans[a]) wrongs.push(opt({ ...ans, [a]: v })); }));
  // iki özelliği birden değiştir
  if (attrs.length > 1) wrongs.push(opt({ ...ans, [attrs[0]]: val(attrs[0], 2, 1), [attrs[1]]: val(attrs[1], 2, 0) }));
  wrongs.push(opt(cell(2, 1)), opt(cell(1, 2)), opt(cell(2, 0)));
  return build({ sig: 'MR' + attrs.join() + JSON.stringify(rules) + JSON.stringify(V), text: 'Tablodaki kurala göre soru işaretli yere hangisi gelmelidir?', main: box(s, 3 * C + 12, 3 * C + 12), correct: opt(ans), wrongs: shuffle(wrongs, rng) });
}, 999);

// ---------------------------------------------------------------------------
// MATRİS 2: çizgi birleştirme (1. kutu + 2. kutu = 3. kutu)
// ---------------------------------------------------------------------------
const SPOKES = Array.from({ length: 8 }, (_, k) => k * 45);
const spokeCell = (set, col = INK) => `<rect x="10" y="10" width="80" height="80" rx="6" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>` + set.map(k => { const a = (SPOKES[k] - 90) * Math.PI / 180; return `<line x1="50" y1="50" x2="${n2(50 + 34 * Math.cos(a))}" y2="${n2(50 + 34 * Math.sin(a))}" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`; }).join('') + `<circle cx="50" cy="50" r="4" fill="${col}"/>`;
const OPS = { xor: (a, b) => [...a.filter(x => !b.includes(x)), ...b.filter(x => !a.includes(x))].sort(), or: (a, b) => [...new Set([...a, ...b])].sort(), and: (a, b) => a.filter(x => b.includes(x)).sort() };
export const matrixLines = (ops) => capped((key, seed) => {
  const rng = makeRng(key, seed); const op = pick(ops, rng);
  const rnd = () => shuffle([0, 1, 2, 3, 4, 5, 6, 7], rng).slice(0, randInt(rng, 2, 4)).sort();
  const rows = [0, 1, 2].map(() => { const a = rnd(), b = rnd(); return [a, b, OPS[op](a, b)]; });
  if (rows.some(r => r[2].length === 0)) return null;
  // kural tek olmalı: ilk iki satırda diğer işlemler tutmamalı
  if (Object.keys(OPS).some(o => o !== op && rows.slice(0, 2).every(r => OPS[o](r[0], r[1]).join() === r[2].join()))) return null;
  const C = 46; let s = '';
  rows.forEach((row, r) => row.forEach((set, c) => { const x = 6 + c * C, y = 6 + r * C; s += `<g transform="translate(${x} ${y}) scale(${C / 100})">${r === 2 && c === 2 ? `<rect x="10" y="10" width="80" height="80" rx="6" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>${text(50, 52, '?', 50, '#dc2626')}` : spokeCell(set)}</g>`; }));
  const ans = rows[2][2]; const opt = (set) => ({ k: set.join(), img: box(spokeCell(set)) });
  const wrongs = Object.keys(OPS).filter(o => o !== op).map(o => opt(OPS[o](rows[2][0], rows[2][1])));
  for (let t = 0; t < 6; t++) { const k = randInt(rng, 0, 7); wrongs.push(opt(ans.includes(k) ? ans.filter(x => x !== k) : [...ans, k].sort())); }
  wrongs.push(opt(rows[2][0]), opt(rows[2][1]));
  return build({ sig: 'ML' + op + JSON.stringify(rows), text: 'Her satırda 1. ve 2. kutudan 3. kutu elde ediliyor. Soru işaretli yere hangisi gelmelidir?', main: box(s, 3 * C + 12, 3 * C + 12), correct: opt(ans), wrongs: [...wrongs.slice(0, 2), ...shuffle(wrongs.slice(2), rng)].filter(w => w.k !== '') });
}, 999);

// ---------------------------------------------------------------------------
// KÜPLER 1: kaç küp var? (görünmeyen destek küpleri de sayılır)
// ---------------------------------------------------------------------------
export const cubeCount = (W, maxH) => capped((key, seed) => {
  const rng = makeRng(key, seed); const col = pick(['#a78bfa', '#60a5fa', '#f9a8d4', '#86efac', '#fcd34d', '#fca5a5'], rng);
  const back = Array.from({ length: W }, () => randInt(rng, 1, maxH));
  const front = back.map(h => randInt(rng, 0, h));
  if (front.every(h => h === 0)) return null;
  const grid = [front.map(h => Array(h).fill(col)), back.map(h => Array(h).fill(col))];
  const total = [...back, ...front].reduce((a, b) => a + b, 0);
  const opt = (v) => ({ k: 'n' + v, text: String(v) });
  const wrongs = shuffle([total - 1, total + 1, total - 2, total + 2, total + 3, total - front.filter(h => h > 0).length].filter(v => v > 0 && v !== total), rng).map(opt);
  return build({ sig: 'CC' + back.join() + '/' + front.join(), text: 'Bu yapıda kaç tane küp vardır? (Görünmeyen ama yapıyı taşıyan küpleri de say.)', main: drawCubes(grid), correct: opt(total), wrongs });
}, 999);

// ---------------------------------------------------------------------------
// KÜPLER 2: açınım -> küp
// ---------------------------------------------------------------------------
const N = { U: [0, 0, 1], D: [0, 0, -1], F: [0, -1, 0], B: [0, 1, 0], R: [1, 0, 0], L: [-1, 0, 0] };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const faceOf = (v) => Object.keys(N).find(k => N[k].join() === v.join());
const VALID = (() => { const out = []; Object.keys(N).forEach(t => Object.keys(N).forEach(f => { const d = N[t].map((x, i) => x * N[f][i]).reduce((a, b) => a + b, 0); if (d !== 0 || t === f) return; out.push([t, f, faceOf(cross(N[t], N[f]))]); })); return out; })();
const OPP = { U: 'D', D: 'U', F: 'B', B: 'F', L: 'R', R: 'L' };
const isoCube = (cT, cF, cR, mT, mF, mR) => {
  const top = '50,10 88,30 50,50 12,30', left = '12,30 50,50 50,92 12,72', right = '50,50 88,30 88,72 50,92';
  const mark = (m, cx, cy) => (m ? shape(m, cx, cy, 8, '#fff', { sw: 1.5 }) : '');
  return box(`<polygon points="${top}" fill="${cT}" stroke="${INK}" stroke-width="2"/><polygon points="${left}" fill="${cF}" stroke="${INK}" stroke-width="2"/><polygon points="${left}" fill="rgba(0,0,0,.12)"/><polygon points="${right}" fill="${cR}" stroke="${INK}" stroke-width="2"/><polygon points="${right}" fill="rgba(0,0,0,.25)"/>${mark(mT, 50, 30)}${mark(mF, 31, 62)}${mark(mR, 69, 62)}`);
};
export const cubeNet = (withMarks) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const faces = ['U', 'L', 'F', 'R', 'D', 'B']; const cs = shuffle(COLS, rng).slice(0, 6);
  const C = {}; faces.forEach((f, k) => { C[f] = cs[k]; });
  const M = {}; if (withMarks) { const ms = shuffle(['circle', 'square', 'diamond', 'cross', 'ring', null], rng); faces.forEach((f, k) => { M[f] = ms[k]; }); }
  const pos = { U: [1, 0], L: [0, 1], F: [1, 1], R: [2, 1], D: [1, 2], B: [1, 3] }; const c = 28;
  let s = ''; faces.forEach(f => { const [x, y] = pos[f]; s += `<rect x="${8 + x * c}" y="${6 + y * c}" width="${c}" height="${c}" fill="${C[f]}" stroke="${INK}" stroke-width="2"/>` + (M[f] ? shape(M[f], 8 + x * c + c / 2, 6 + y * c + c / 2, 8, '#fff', { sw: 1.5 }) : ''); });
  const main = box(s, 3 * c + 16, 4 * c + 12);
  const opt = ([t, f, r]) => ({ k: t + f + r, img: isoCube(C[t], C[f], C[r], M[t], M[f], M[r]) });
  const ok = pick(VALID, rng);
  const validSet = new Set(VALID.map(v => v.join('')));
  const bads = [];
  bads.push([ok[0], ok[2], ok[1]]); // ayna (dönme ile olmaz)
  bads.push([ok[0], ok[1], OPP[ok[1]]].map(x => x)); // karşılıklı yüzler yan yana
  bads.push([ok[0], OPP[ok[0]], ok[2]]);
  VALID.forEach(v => bads.push([v[0], v[2], v[1]]));
  const wrongs = shuffle(bads.filter(b => new Set(b).size === 3 && !validSet.has(b.join(''))), rng).slice(0, 8).map(opt);
  return build({ sig: 'CN' + cs.join() + (withMarks ? JSON.stringify(M) : '') + ok.join(''), text: 'Açınımı verilen küp katlanınca hangisi elde EDİLEBİLİR?', main, correct: opt(ok), wrongs });
}, 999);

// ---------------------------------------------------------------------------
// GÖLGE: renkli şekil grubunun gölgesi
// ---------------------------------------------------------------------------
export const shadowOf = (n, subtle) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const items = []; let g = 0;
  while (items.length < n && g++ < 200) { const it = { t: pick([...SHAPES, ...ASYM], rng), x: randInt(rng, 30, 70), y: randInt(rng, 30, 70), r: randInt(rng, 13, 22), c: pick(COLS, rng), rot: randInt(rng, 0, 11) * 30 }; if (items.some(o => Math.hypot(o.x - it.x, o.y - it.y) < 14)) continue; items.push(it); }
  if (items.length < n) return null;
  const draw = (its, black) => its.map(it => shape(it.t, it.x, it.y, it.r, black ? INK : it.c, { rot: it.rot, stroke: black ? INK : INK, sw: black ? 1 : 2 })).join('');
  const sig = (its, tag = '') => tag + JSON.stringify(its.map(i => [i.t, i.x, i.y, i.r, i.rot]));
  const opt = (its, tf = '', tag = '') => ({ k: sig(its, tag), img: box(`<g transform="${tf}">${draw(its, true)}</g>`) });
  const d = subtle ? 6 : 10;
  const nonRound = items.map((it, k) => (it.t === 'circle' ? -1 : k)).filter(k => k >= 0);
  const wrongs = [];
  const far = items.map((it, k) => [Math.hypot(it.x - 50, it.y - 50) + it.r, k]).sort((a, b) => b[0] - a[0]).slice(0, 2).map(x => x[1]);
  for (let t = 0; t < 4; t++) { const k = pick(far, rng); const cp = items.map(x => ({ ...x })); cp[k].x += pick([-d, d], rng); cp[k].y += pick([-d, d, 0], rng); wrongs.push(opt(cp)); }
  if (nonRound.length) { const k = pick(nonRound, rng); const cp = items.map(x => ({ ...x })); cp[k].rot += subtle ? 30 : 45; wrongs.push(opt(cp)); }
  wrongs.push(opt(items, 'translate(100 0) scale(-1 1)', 'M'));
  { const k = randInt(rng, 0, n - 1); const cp = items.map(x => ({ ...x })); cp[k].r = Math.round(cp[k].r * (subtle ? 1.25 : 1.4)); wrongs.push(opt(cp)); }
  return build({ sig: 'SH' + sig(items), text: 'Şekil grubunun gölgesi hangisidir?', main: box(draw(items, false)), correct: opt(items), wrongs: shuffle(wrongs, rng) });
}, 999);
