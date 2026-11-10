// ============================================================================
// --- BİLSEM: KATLAMA (kağıt katla, del, aç) ---
// ============================================================================
// Kağıt 4x4 küçük bölgeye ayrılır. Katlanmış kağıda delik açılır, sonra kağıt açılır.
// KOLAY : bir kez katla (dikey ya da yatay), 1 delik.
// ORTA  : dikey ya da yatay bir kez katla, 2 delik (farklı şekiller olabilir).
// ZOR   : iki kez katla (dörde), 1-2 delik  /  bir kez katla, kenara yakın 3 delik.
import { card, put, OL, S, SN, txt, shapeInner } from './draw';
import { makeRng, shuffle, pick, pickWrongs, result } from './common';
import { arrow } from '../helpers';

const N = 4; // 4x4 bölge
const HOLE_SHAPES = ['daire', 'kare', 'ucgen', 'yildiz', 'kalp'];
const PAPER = ['#fde68a', '#bae6fd', '#bbf7d0', '#fbcfe8', '#ddd6fe'];

// Delik: {r, c, s}
const holeSvg = (h, x0, y0, cs) => put(shapeInner(h.s, '#334155', 3), x0 + h.c * cs + cs / 2, y0 + h.r * cs + cs / 2, cs / 100 * 0.8);

// Tam kağıt (açılmış) kartı
const paperCard = (holes, paper) => {
  const x0 = 10, y0 = 10, W = 80, cs = W / N;
  let s = `<rect x="${x0}" y="${y0}" width="${W}" height="${W}" rx="3" fill="${paper}" ${S}/>`;
  s += `<path d="M50,${y0} L50,${y0 + W} M${x0},50 L${x0 + W},50" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3"/>`;
  holes.forEach(h => { s += holeSvg(h, x0, y0, cs); });
  return card(s);
};
const holesKey = (holes) => holes.map(h => `${h.r}${h.c}${h.s}`).sort().join(',');

// Katlama: 'v' = sağ yarı sola katlanır (açık bölge: sütun 0-1), 'h' = alt yarı yukarı (satır 0-1), 'q' = dörde (sol-üst çeyrek)
const mirrorV = (h) => ({ ...h, c: N - 1 - h.c });
const mirrorH = (h) => ({ ...h, r: N - 1 - h.r });
const unfold = (holes, fold) => {
  if (fold === 'v') return [...holes, ...holes.map(mirrorV)];
  if (fold === 'h') return [...holes, ...holes.map(mirrorH)];
  const a = [...holes, ...holes.map(mirrorV)];
  return [...a, ...a.map(mirrorH)];
};

// Katlama tanımı: { axis: 'v' | 'h' | 'q', keep } -> kağıdın görünen (katlanmış) bölgesi
//   v: dikey çizgiden katla (keep 0 = sol yarı kalır, 1 = sağ yarı kalır)
//   h: yatay çizgiden katla (keep 0 = üst yarı, 1 = alt yarı)
//   q: dörde katla (keep 0..3 = sol-üst, sağ-üst, sol-alt, sağ-alt çeyrek)
const region = (f) => {
  const half = [[0, 1], [2, 3]];
  if (f.axis === 'v') return { rows: [0, 1, 2, 3], cols: half[f.keep] };
  if (f.axis === 'h') return { rows: half[f.keep], cols: [0, 1, 2, 3] };
  return { rows: half[f.keep >> 1], cols: half[f.keep & 1] };
};
const areaCells = (f) => { const { rows, cols } = region(f); const out = []; rows.forEach(r => cols.forEach(c => out.push([r, c]))); return out; };

// Üst görsel: 1) kağıt + katlama çizgisi  2) katlanmış kağıt + delik  3) açılınca?
const foldScene = (f, holes, paper) => {
  const cs = 14; const P = cs * N; // 56
  const { rows, cols } = region(f);
  let s = '';
  const x1 = 14, y1 = 30;
  s += `<rect x="${x1}" y="${y1}" width="${P}" height="${P}" rx="2" fill="${paper}" ${S}/>`;
  // katlanacak (kaybolacak) kısım hafif gölgeli
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!rows.includes(r) || !cols.includes(c)) s += `<rect x="${x1 + c * cs}" y="${y1 + r * cs}" width="${cs}" height="${cs}" fill="#0f172a" opacity=".08"/>`;
  if (f.axis !== 'h') s += `<path d="M${x1 + P / 2},${y1 - 5} L${x1 + P / 2},${y1 + P + 5}" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5 4"/>`;
  if (f.axis !== 'v') s += `<path d="M${x1 - 5},${y1 + P / 2} L${x1 + P + 5},${y1 + P / 2}" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5 4"/>`;
  s += arrow(x1 + P + 8, y1 + P / 2, x1 + P + 30, y1 + P / 2, '#64748b', 3.5);
  const fw = cols.length * cs, fh = rows.length * cs;
  const x2 = 112, y2 = y1 + (P - fh) / 2;
  s += `<rect x="${x2 + 4}" y="${y2 + 4}" width="${fw}" height="${fh}" rx="2" fill="${paper}" stroke="${OL}" stroke-width="1.5" opacity=".55"/>`;
  s += `<rect x="${x2}" y="${y2}" width="${fw}" height="${fh}" rx="2" fill="${paper}" ${S}/>`;
  // katlanan kenar (kırmızı)
  if (f.axis !== 'h') { const ex = cols[0] === 0 ? x2 + fw : x2; s += `<path d="M${ex},${y2} L${ex},${y2 + fh}" stroke="#ef4444" stroke-width="3.5"/>`; }
  if (f.axis !== 'v') { const ey = rows[0] === 0 ? y2 + fh : y2; s += `<path d="M${x2},${ey} L${x2 + fw},${ey}" stroke="#ef4444" stroke-width="3.5"/>`; }
  holes.forEach(h => { s += put(shapeInner(h.s, '#334155', 3), x2 + (h.c - cols[0]) * cs + cs / 2, y2 + (h.r - rows[0]) * cs + cs / 2, cs / 100 * 0.85); });
  s += arrow(x2 + fw + 10, y1 + P / 2, x2 + fw + 32, y1 + P / 2, '#64748b', 3.5);
  const x3 = x2 + fw + 40;
  s += `<rect x="${x3}" y="${y1}" width="${P}" height="${P}" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/>${txt(x3 + P / 2, y1 + P / 2 + 1, '?', 34, '#d97706')}`;
  const W = x3 + P + 14;
  s += txt(x1 + P / 2, 16, 'katla', 12, '#64748b') + txt(x2 + fw / 2, 16, 'del', 12, '#64748b') + txt(x3 + P / 2, 16, 'aç', 12, '#64748b');
  return card(s, { w: W, h: 100 });
};

const makeFold = (key, seed, { axes, holeCount, sameShape }) => {
  const rng = makeRng(key, seed);
  const axis = pick(axes, rng);
  const f = { axis, keep: Math.floor(rng() * (axis === 'q' ? 4 : 2)) };
  const fold = axis;
  const paper = pick(PAPER, rng);
  const shape = pick(HOLE_SHAPES, rng);
  const cells = shuffle(areaCells(f), rng).slice(0, holeCount);
  const holes = cells.map(([r, c]) => ({ r, c, s: sameShape ? shape : pick(HOLE_SHAPES, rng) }));
  const correct = unfold(holes, fold);
  const ck = holesKey(correct);
  const opt = (hs) => ({ key: holesKey(hs), render: () => paperCard(hs, paper) });
  const shift = (hs, dr, dc) => hs.map(h => ({ ...h, r: (h.r + dr + N) % N, c: (h.c + dc + N) % N }));
  const otherFold = fold === 'v' ? 'h' : fold === 'h' ? 'v' : (rng() < 0.5 ? 'v' : 'h');
  const cands = [
    opt(holes),                                                                   // açılmamış gibi: sadece delinen yer
    opt(fold === 'v' ? [...holes, ...shift(holes, 0, 2)] : fold === 'h' ? [...holes, ...shift(holes, 2, 0)] : [...unfold(holes, 'v'), ...shift(unfold(holes, 'v'), 2, 0)]), // yansıma yerine kaydırma
    opt(unfold(holes, otherFold)),                                                // yanlış yöne açılmış
    opt(unfold(holes.map(h => ({ ...h, s: pick(HOLE_SHAPES.filter(x => x !== h.s), rng) })), fold)) // delik şekli farklı
  ];
  const wrongs = pickWrongs(ck, cands, holeCount >= 2 || fold === 'q' ? 3 : 2, () => {
    const hs = holes.map(h => ({ ...h, r: Math.floor(rng() * N), c: Math.floor(rng() * N) }));
    return opt(unfold(hs, fold));
  });
  return result({ sig: `${fold}${f.keep}|${holesKey(holes)}`, main: foldScene(f, holes, paper), correct: opt(correct), wrongs });
};

export const foldEasyV = (key, seed) => makeFold(key, seed, { axes: ['v'], holeCount: 1, sameShape: true });
export const foldEasyH = (key, seed) => makeFold(key, seed, { axes: ['h'], holeCount: 1, sameShape: true });
export const foldMid = (key, seed) => makeFold(key, seed, { axes: ['v', 'h'], holeCount: 2, sameShape: true });
export const foldMidMixed = (key, seed) => makeFold(key, seed, { axes: ['v', 'h'], holeCount: 2, sameShape: false });
export const foldHardQuarter = (key, seed) => makeFold(key, seed, { axes: ['q'], holeCount: 1 + Math.floor(makeRng(key + '#n', seed)() * 2), sameShape: true });
export const foldHardThree = (key, seed) => makeFold(key, seed, { axes: ['v', 'h'], holeCount: 3, sameShape: false });

// İLKOKUL (1-3. sınıf) EK KALIPLARI
export const foldQuarterMixed = (key, seed) => makeFold(key, seed, { axes: ['q'], holeCount: 2 + Math.floor(makeRng(key + '#n', seed)() * 2), sameShape: false });
export const foldFourHoles = (key, seed) => makeFold(key, seed, { axes: ['v', 'h'], holeCount: 4, sameShape: false });
