// ============================================================================
// --- BİLSEM EK PAKET ---
// ============================================================================
// Döndürme • Şekil katlama (içe katla / aç) • Yansıma (nesneler) • Perspektif 2
// (küp olmayan cisimler) • Hafıza 2 (hangisini gördün?) — hepsi kolay / orta / zor.
import { card, put, OL, S, SN, txt, shapeInner, HEX, obj, objKey, OBJ, COLORABLE, FACING, ART, lighten, darken, qBox, seqOption } from './draw';
import { makeRng, shuffle, pick, pickN, pickWrongs, result, randInt } from './common';
import { arrow } from '../helpers';

const tf = (inner, { flipX = false, flipY = false, rot = 0 } = {}) => `<g transform="translate(50 50) rotate(${rot}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1}) translate(-50 -50)">${inner}</g>`;
const tOpt = (key, inner, o) => ({ key, render: () => card(put(tf(inner, o), 50, 50, 0.84)) });

// ============================================================================
// DÖNDÜRME
// ============================================================================
// Üst görsel: şekil + dönme oku (sağa / sola / ters) + soru kutusu
const rotArrow = (dir) => {
  const cx = 110, cy = 58;
  if (dir === 'ters') return `<path d="M${cx - 13},${cy + 4} A13,13 0 1 1 ${cx + 13},${cy + 4}" ${SN} stroke="#ef4444" stroke-width="4"/><path d="M${cx + 8},${cy + 2} L${cx + 13},${cy + 12} L${cx + 19},${cy + 2} Z" fill="#ef4444"/><path d="M${cx - 13},${cy + 4} A13,13 0 0 0 ${cx + 13},${cy + 4}" ${SN} stroke="#ef4444" stroke-width="4" stroke-dasharray="3 4"/>${txt(cx, cy - 26, 'ters', 11, '#ef4444')}`;
  const cw = dir === 'sag';
  const p = cw ? `M${cx - 12},${cy + 8} A14,14 0 1 1 ${cx + 12},${cy + 8}` : `M${cx + 12},${cy + 8} A14,14 0 1 0 ${cx - 12},${cy + 8}`;
  const hx = cw ? cx + 12 : cx - 12;
  return `<path d="${p}" ${SN} stroke="#ef4444" stroke-width="4"/><path d="M${hx - 6},${cy + 2} L${hx},${cy + 13} L${hx + 6},${cy + 2} Z" fill="#ef4444"/>${txt(cx, cy - 26, cw ? 'sağa' : 'sola', 11, '#ef4444')}`;
};
const rotScene = (inner, dir) => card(`${put(inner, 56, 60, 0.9)}${rotArrow(dir)}${qBox(136, 18, 84, 84)}`, { w: 228, h: 120, bg: '#f8fafc' });
const ROT = { sag: 90, sol: -90, ters: 180 };

// KOLAY: yöne bakan tek nesne
const rotObj = (dir, m = 3) => (key, seed) => {
  const rng = makeRng(key, seed);
  const k = pick(FACING.filter(x => ART[x]), rng); const c = pick(HEX, rng);
  const inner = obj(k, c);
  const want = ROT[dir];
  const cands = [tOpt('r-90', inner, { rot: -want }), tOpt('fx', inner, { flipX: true }), tOpt('fy', inner, { flipY: true }), tOpt('r0', inner)];
  return result({ sig: objKey(k, c) + dir, main: rotScene(inner, dir), correct: tOpt('r' + want, inner, { rot: want }), wrongs: pickWrongs('r' + want, shuffle(cands, rng), m - 1) });
};
// ORTA: kart üstünde iki işaret (köşede şekil + kenarda nokta)
const SPOTS = [[24, 24], [76, 24], [76, 76], [24, 76]];
const cardInner = (m) => `<rect x="10" y="10" width="80" height="80" rx="8" fill="#fff" ${S}/>${put(shapeInner(m.a, m.ca), SPOTS[m.p][0], SPOTS[m.p][1], 0.3)}${put(shapeInner(m.b, m.cb), m.q === 'mid' ? 50 : SPOTS[m.q][0], m.q === 'mid' ? 50 : SPOTS[m.q][1], 0.24)}`;
const rotCard = (dir, m = 3) => (key, seed) => {
  const rng = makeRng(key, seed);
  const shapes = ['ucgen', 'kalp', 'yildiz', 'ok', 'damla', 'yarimay'];
  let m; for (let t = 0; t < 20; t++) { m = { a: pick(shapes, rng), ca: pick(HEX, rng), b: pick(['daire', 'kare', 'esken'], rng), cb: pick(HEX, rng), p: randInt(rng, 0, 3), q: randInt(rng, 0, 3) }; if (m.q !== m.p && Math.abs(m.q - m.p) !== 2) break; }
  const inner = cardInner(m); const want = ROT[dir];
  const cands = [tOpt('r' + (-want), inner, { rot: -want }), tOpt('r180', inner, { rot: 180 }), tOpt('fx', inner, { flipX: true }), tOpt('r0', inner)].filter(o => o.key !== 'r' + want);
  return result({ sig: JSON.stringify(m) + dir, main: rotScene(inner, dir), correct: tOpt('r' + want, inner, { rot: want }), wrongs: pickWrongs('r' + want, shuffle(cands, rng), m - 1) });
};
// ZOR: 3x3 tablo deseni
const gridInner = (cells, n = 3) => {
  const cs = 80 / n; let s = `<rect x="10" y="10" width="80" height="80" fill="#fff" ${S}/>`;
  cells.forEach((col, i) => { if (col) s += `<rect x="${10 + (i % n) * cs}" y="${10 + Math.floor(i / n) * cs}" width="${cs}" height="${cs}" fill="${col}"/>`; });
  for (let j = 1; j < n; j++) s += `<path d="M${10 + j * cs},10 L${10 + j * cs},90 M10,${10 + j * cs} L90,${10 + j * cs}" stroke="#94a3b8" stroke-width="1.5"/>`;
  return s + `<rect x="10" y="10" width="80" height="80" fill="none" ${S}/>`;
};
const rotCells = (cells, n, deg) => {
  let cur = cells;
  const times = ((deg / 90) % 4 + 4) % 4;
  for (let t = 0; t < times; t++) cur = cur.map((_, i) => { const r = Math.floor(i / n), c = i % n; return cur[(n - 1 - c) * n + r]; });
  return cur;
};
const flipX = (cells, n) => cells.map((_, i) => { const r = Math.floor(i / n), c = i % n; return cells[r * n + (n - 1 - c)]; });
const gKey = (cells) => cells.map(c => c || '.').join(',');
const gOpt = (cells) => ({ key: gKey(cells), render: () => card(gridInner(cells)) });
const rotGrid = (dir, filled, m = 3, colors = 2) => (key, seed) => {
  const rng = makeRng(key, seed); const n = 3; const want = ROT[dir];
  let cells;
  for (let t = 0; t < 60; t++) {
    cells = Array(9).fill(null); const pal = pickN(HEX, colors, rng);
    shuffle([...Array(9).keys()], rng).slice(0, filled).forEach(i => { cells[i] = pick(pal, rng); });
    const keys = [0, 90, 180, 270].map(d => gKey(rotCells(cells, n, d)));
    if (new Set(keys).size === 4 && gKey(flipX(cells, n)) !== keys[(want / 90 + 4) % 4]) break;
  }
  const correct = rotCells(cells, n, want);
  const oneOff = [...correct]; const f = oneOff.findIndex(Boolean); const e = oneOff.findIndex(v => !v); if (f >= 0 && e >= 0) { oneOff[e] = oneOff[f]; oneOff[f] = null; }
  const cands = [gOpt(rotCells(cells, n, -want)), gOpt(flipX(cells, n)), gOpt(oneOff), gOpt(cells), gOpt(rotCells(cells, n, 180))];
  return result({ sig: gKey(cells) + dir, main: rotScene(gridInner(cells), dir), correct: gOpt(correct), wrongs: pickWrongs(gKey(correct), shuffle(cands, rng), m - 1) });
};
export const rotEasyRight = rotObj('sag');
export const rotEasyHalf = rotObj('ters');
export const rotMidRight = rotCard('sag');
export const rotMidLeft = rotCard('sol');
export const rotHardRight = rotGrid('sag', 4);
export const rotHardHalf = rotGrid('ters', 4);

// ============================================================================
// ŞEKİL KATLAMA (BİLSEM "katlama"): kenara yapışık parçalar o kenardan katlanır
// ============================================================================
// Üstte örnek: şeklin kenarlarındaki parçalar kenar çizgisinden katlanınca içeri
// (içteki parçalar dışarı) aynalanarak geçer. Altta aynı kural başka şekle uygulanır.
// Çeldiriciler: parça katlanmamış / kaydırılmış (ayna yok) / ters dönmüş / başka kenara geçmiş.
const POLYS = {
  kare: { n: 4, a0: 45, fill: '#fdba74' },
  baklava: { n: 4, a0: 0, fill: '#f9a8d4' },
  besgen: { n: 5, a0: -90, fill: '#a7f3d0' },
  altigen: { n: 6, a0: 0, fill: '#bfdbfe' },
  sekizgen: { n: 8, a0: 22.5, fill: '#fde68a' }
};
const PR = 32; // çevrel yarıçap (100'lük kutuda)
const polyVerts = (p) => Array.from({ length: p.n }, (_, i) => { const a = (p.a0 + i * 360 / p.n) * Math.PI / 180; return [50 + PR * Math.cos(a), 50 + PR * Math.sin(a)]; });
const PIECES = {
  ucgen: { col: '#7c3aed', symU: true },
  ok: { col: '#2563eb', symU: true },
  yildiz: { col: '#16a34a', symU: true },
  yarim: { col: '#dc2626', symU: true },
  daire: { col: '#eab308', symU: true, round: true },
  dik: { col: '#0d9488', symU: false },
  bot: { col: '#db2777', symU: false }
};
// Parçanın yerel noktaları: u kenar boyunca, v dışarı doğru (0..h)
const piecePts = (kind, w, h) => {
  const circ = (cx, cy, r, a0 = 0, a1 = 360, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  switch (kind) {
    case 'ucgen': return [[-w, 0], [w, 0], [0, h]];
    case 'dik': return [[-w, 0], [w, 0], [w, h]];
    case 'ok': return [[-0.32 * w, 0], [0.32 * w, 0], [0.32 * w, 0.5 * h], [w, 0.5 * h], [0, h], [-w, 0.5 * h], [-0.32 * w, 0.5 * h]];
    case 'bot': return [[-w, 0], [-w, h], [-0.1 * w, h], [-0.1 * w, 0.45 * h], [w, 0.45 * h], [w, 0]];
    case 'yarim': { const r = Math.min(w, h) * 0.85; return circ(0, 0, r, 0, 180, 16); }
    case 'daire': { const r = Math.min(w, h) / 2; return circ(0, r, r).slice(0, -1); }
    case 'yildiz': { const r = h / 2; const p = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r; const a = (90 + i * 36) * Math.PI / 180; p.push([rr * Math.cos(a), r + rr * Math.sin(a)]); } return p; }
    default: return [];
  }
};
const pieceH = (kind, w, h) => (kind === 'yarim' ? Math.min(w, h) * 0.85 : kind === 'daire' ? Math.min(w, h) : h);
// Durumlar: out (dışarıda), in (içe aynalanmış), sIn/sOut (aynalamadan kaydırılmış), rIn/rOut (ters dönmüş)
const STATE_FN = {
  out: (u, v) => [u, v], in: (u, v, h) => [u, -v],
  sIn: (u, v, h) => [u, v - h], sOut: (u, v, h) => [u, h - v],
  rIn: (u, v) => [-u, -v], rOut: (u, v) => [-u, v]
};
const FOLD = { out: 'in', in: 'out' };
const SHIFT = { out: 'sIn', in: 'sOut' };
const ROT180 = { out: 'rIn', in: 'rOut' };
const canon = (kind, st) => {
  const P = PIECES[kind];
  if (P.round && st === 'sIn') return 'in';
  if (P.round && st === 'sOut') return 'out';
  if (P.symU && st === 'rIn') return 'in';
  if (P.symU && st === 'rOut') return 'out';
  return st;
};
const edgeGeo = (verts, e) => {
  const [x1, y1] = verts[e], [x2, y2] = verts[(e + 1) % verts.length];
  const L = Math.hypot(x2 - x1, y2 - y1); const t = [(x2 - x1) / L, (y2 - y1) / L];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  let n = [t[1], -t[0]]; if ((mx - 50) * n[0] + (my - 50) * n[1] < 0) n = [-n[0], -n[1]];
  const apo = Math.hypot(mx - 50, my - 50);
  return { L, t, n, mx, my, apo };
};
const foldPanel = (shapeId, pieces) => {
  const p = POLYS[shapeId]; const verts = polyVerts(p);
  let s = `<polygon points="${verts.map(v => v.map(z => z.toFixed(1)).join(',')).join(' ')}" fill="${p.fill}" ${S}/>`;
  pieces.forEach(pc => {
    const g = edgeGeo(verts, pc.edge);
    const w = Math.min(g.L * 0.32, 11.5), h = Math.min(g.apo * 0.58, 15);
    const hh = pieceH(pc.kind, w, h);
    const pts = piecePts(pc.kind, w, h).map(([u, v]) => STATE_FN[pc.state](u, v, hh)).map(([u, v]) => [g.mx + u * g.t[0] + v * g.n[0], g.my + u * g.t[1] + v * g.n[1]]);
    s += `<polygon points="${pts.map(q => q.map(z => z.toFixed(1)).join(',')).join(' ')}" fill="${PIECES[pc.kind].col}" ${S} stroke-width="1.8" stroke-linejoin="round"/>`;
  });
  return s;
};
const foldKey = (shapeId, pieces) => shapeId + ':' + pieces.map(pc => `${pc.edge}${pc.kind}${canon(pc.kind, pc.state)}`).sort().join('/');
const foldOpt = (shapeId, pieces) => ({ key: foldKey(shapeId, pieces), render: () => card(put(foldPanel(shapeId, pieces), 50, 50, 0.92)) });
const FOLD_LEVELS = {
  k: { shapes: ['kare', 'baklava', 'altigen'], kinds: ['ucgen', 'yarim', 'daire', 'ok'], inside: false },
  o: { shapes: ['kare', 'baklava', 'besgen', 'altigen', 'sekizgen'], kinds: ['ucgen', 'ok', 'yildiz', 'yarim', 'daire', 'dik'], inside: false },
  z: { shapes: ['kare', 'besgen', 'altigen', 'sekizgen'], kinds: ['ucgen', 'ok', 'yildiz', 'yarim', 'dik', 'bot'], inside: true },
  zz: { shapes: ['altigen', 'sekizgen'], kinds: ['ucgen', 'ok', 'yildiz', 'yarim', 'dik', 'bot'], inside: true }
};
const makePieces = (rng, shapeId, n, lv, forceAsym) => {
  const E = POLYS[shapeId].n;
  // mümkünse yan yana olmayan kenarlar (içe katlanan parçalar köşede çakışmasın)
  const adj = (es) => es.some(a => es.some(b => a !== b && ((a + 1) % E === b)));
  let edges = null;
  for (let t = 0; t < 40; t++) { const es = shuffle([...Array(E).keys()], rng).slice(0, n); if (!adj(es) || t === 39) { edges = es; break; } }
  edges.sort((a, b) => a - b);
  let kinds = pickN(lv.kinds, Math.min(n, lv.kinds.length), rng);
  while (kinds.length < n) kinds.push(pick(lv.kinds, rng));
  if (forceAsym && !kinds.some(k => !PIECES[k].symU)) kinds[0] = pick(lv.kinds.filter(k => !PIECES[k].symU), rng);
  // en az bir parça "kaydırma" çeldiricisinde farklı görünmeli (daire tek başına olmasın)
  if (kinds.every(k => PIECES[k].round)) kinds[0] = 'ucgen';
  return edges.map((edge, j) => ({ edge, kind: kinds[j], state: lv.inside && n > 1 && j % 2 === 1 ? 'in' : 'out' }));
};
const foldStory = (lvId, n, m = 3) => (key, seed) => {
  const rng = makeRng(key, seed); const lv = FOLD_LEVELS[lvId];
  const [exShape, qShape] = pickN(lv.shapes, 2, rng);
  const ex = makePieces(rng, exShape, n, lv, false);
  const qp = makePieces(rng, qShape, n, lv, lvId === 'z' || lvId === 'zz');
  const fold = (ps, map, only) => ps.map((pc, j) => (only === undefined || only === j ? { ...pc, state: map[pc.state] } : pc));
  const exAfter = fold(ex, FOLD);
  const panel = (inner, x, y) => `<rect x="${x}" y="${y}" width="96" height="96" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>${put(inner, x + 48, y + 48, 0.9)}`;
  const arrowR = (y) => `<path d="M112,${y} L134,${y}" stroke="#64748b" stroke-width="4" stroke-linecap="round"/><path d="M132,${y - 7} L142,${y} L132,${y + 7} Z" fill="#64748b"/>`;
  const main = card(`${panel(foldPanel(exShape, ex), 8, 8)}${arrowR(56)}${panel(foldPanel(exShape, exAfter), 150, 8)}<path d="M8,114 L246,114" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="6 5"/>${panel(foldPanel(qShape, qp), 8, 122)}${arrowR(170)}${qBox(150, 122, 96, 96)}`, { w: 254, h: 226, bg: '#f8fafc' });
  const correct = foldOpt(qShape, fold(qp, FOLD));
  const free = [...Array(POLYS[qShape].n).keys()].filter(e => !qp.some(pc => pc.edge === e));
  const moved = (() => { if (!free.length) return null; const j = Math.floor(rng() * qp.length); const ps = fold(qp, FOLD); ps[j] = { ...ps[j], edge: pick(free, rng) }; return foldOpt(qShape, ps); })();
  const partial = qp.length > 1 ? foldOpt(qShape, qp.map((pc, j) => (j === Math.floor(rng() * qp.length) ? pc : { ...pc, state: FOLD[pc.state] }))) : null;
  const cands = [
    foldOpt(qShape, fold(qp, SHIFT)),
    lvId === 'z' || lvId === 'zz' ? foldOpt(qShape, fold(qp, ROT180)) : null,
    partial,
    moved,
    foldOpt(qShape, qp),
    foldOpt(qShape, qp.map((pc, j) => ({ ...pc, state: j % 2 ? FOLD[pc.state] : SHIFT[pc.state] })))
  ];
  const ordered = lvId === 'k' ? shuffle(cands.filter(Boolean), rng) : [...cands.slice(0, 2), ...shuffle(cands.slice(2), rng)];
  return result({ sig: foldKey(qShape, qp) + '|' + foldKey(exShape, ex), main, correct, wrongs: pickWrongs(correct.key, ordered, m - 1) });
};
export const fold3Easy1 = foldStory('k', 1);
export const fold3Easy2 = foldStory('k', 2);
export const fold3Mid2 = foldStory('o', 2);
export const fold3Mid3 = foldStory('o', 3);
export const fold3Hard3 = foldStory('z', 3);
export const fold3Hard4 = foldStory('z', 4);

// ============================================================================
// YANSIMA (NESNELER) — ayna ve su
// ============================================================================
const mirrorScene = (inner, vertical) => {
  if (vertical) return card(`${put(inner, 60, 60, 0.95)}<rect x="116" y="8" width="8" height="104" rx="3" fill="#bae6fd" ${S}/><path d="M118,14 L122,30 M118,40 L122,56" stroke="#fff" stroke-width="2"/>${qBox(132, 18, 84, 84)}`, { w: 228, h: 120, bg: '#f8fafc' });
  return card(`${put(inner, 60, 54, 0.92)}<rect x="6" y="104" width="108" height="8" rx="3" fill="#7dd3fc" ${S}/>${qBox(18, 120, 84, 84)}`, { w: 120, h: 214, bg: '#f8fafc' });
};
// Sahne: nesneler 100x100 kutuda; {k, c, x, y, s, f}
const itemSvg = (it, forceNoFlip) => put(obj(it.k, it.c), it.x, it.y, it.s, 0, forceNoFlip ? false : it.f);
const sceneSvg = (items) => `<rect x="4" y="4" width="92" height="92" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="2"/>${items.map(it => itemSvg(it)).join('')}`;
const sceneKey = (items) => items.map(it => `${it.k}${it.c}${it.x}${it.y}${it.f ? 1 : 0}`).join('/');
const SCENE_OBJ = ['car', 'truck', 'bus', 'airplane', 'duck', 'fish', 'bird', 'snail', 'turtle', 'boat', 'tree', 'house', 'flower', 'balloon', 'sun', 'kite', 'umbrella', 'rocket', 'cat', 'dog', 'rabbit'];
const makeScene = (rng, n) => {
  const layouts = { 1: [[50, 52, 0.8]], 2: [[30, 60, 0.5], [72, 40, 0.42]], 3: [[26, 66, 0.4], [70, 66, 0.36], [62, 24, 0.32]], 4: [[24, 70, 0.36], [72, 72, 0.32], [64, 26, 0.3], [24, 26, 0.28]] };
  const ks = n === 1 ? [pick(FACING.filter(x => ART[x]), rng)] : [pick(FACING.filter(x => ART[x]), rng), ...pickN(SCENE_OBJ, n - 1, rng)];
  return layouts[n].map(([x, y, s], j) => ({ k: ks[j], c: pick(HEX, rng), x, y, s, f: rng() < 0.3 }));
};
const sOpt = (key, inner, o) => ({ key, render: () => card(tf(inner, o)) });
const mirrorObj = (n, vertical, m = 3) => (key, seed) => {
  const rng = makeRng(key, seed);
  const items = makeScene(rng, n);
  const inner = sceneSvg(items);
  const corr = vertical ? { flipX: true } : { flipY: true };
  // yanlışlar: aynısı, öbür eksene yansıma, ters çevirme; zorda: yansıyıp bir nesne dönmemiş
  const cands = [sOpt('id', inner), sOpt(vertical ? 'fy' : 'fx', inner, vertical ? { flipY: true } : { flipX: true }), sOpt('r180', inner, { rot: 180 })];
  if (n >= 2) {
    const j = Math.floor(rng() * n);
    const half = items.map((it, q) => (q === j ? { ...it, f: !it.f } : it)); // bir nesne yanlış yöne bakıyor
    cands.unshift(sOpt('half', sceneSvg(half), corr));
    const swapped = items.map(it => ({ ...it, x: 100 - it.x })); // yerler aynalanmış ama nesneler dönmemiş
    cands.unshift(sOpt('pos', sceneSvg(swapped)));
  }
  return result({ sig: sceneKey(items) + vertical, main: mirrorScene(inner, vertical), correct: sOpt(vertical ? 'fx' : 'fy', inner, corr), wrongs: pickWrongs(vertical ? 'fx' : 'fy', n >= 2 ? cands : shuffle(cands, rng), m - 1) });
};
export const mir2EasyMirror = mirrorObj(1, true);
export const mir2EasyWater = mirrorObj(1, false);
export const mir2MidMirror = mirrorObj(2, true);
export const mir2MidWater = mirrorObj(2, false);
export const mir2HardMirror = mirrorObj(3, true);
export const mir2HardWater = mirrorObj(3, false);

// ============================================================================
// PERSPEKTİF 2 — küp olmayan cisimler (silindir, koni, küre, piramit, disk)
// ============================================================================
// Kule: alttan üste cisimler [{t, w, h, c}]; koni / piramit / küre sadece en üstte olabilir.
const SOLID_COLS = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7', '#f97316'];
const solid3d = (sd, cx, yb) => { // yb: cismin alt çizgisi
  const { t, w, h, c } = sd; const rx = w / 2, ry = Math.max(3, w * 0.16);
  const top = yb - h;
  if (t === 'silindir' || t === 'disk') return `<path d="M${cx - rx},${top} L${cx - rx},${yb} A${rx},${ry} 0 0 0 ${cx + rx},${yb} L${cx + rx},${top}" fill="${c}" ${S}/><ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${lighten(c, 0.35)}" ${S}/>`;
  if (t === 'koni') return `<path d="M${cx - rx},${yb} L${cx},${top} L${cx + rx},${yb} A${rx},${ry} 0 0 1 ${cx - rx},${yb} Z" fill="${c}" ${S}/>`;
  if (t === 'kure') return `<circle cx="${cx}" cy="${yb - w / 2}" r="${w / 2}" fill="${c}" ${S}/><ellipse cx="${cx - w * 0.18}" cy="${yb - w * 0.68}" rx="${w * 0.12}" ry="${w * 0.08}" fill="#fff" opacity=".55"/>`;
  if (t === 'piramit') return `<path d="M${cx - rx},${yb} L${cx},${top} L${cx + rx * 0.55},${yb} Z" fill="${c}" ${S}/><path d="M${cx + rx * 0.55},${yb} L${cx},${top} L${cx + rx},${yb - ry} Z" fill="${darken(c, 0.25)}" ${S}/>`;
  return '';
};
const heightOf = (sd) => (sd.t === 'kure' ? sd.w : sd.h);
const stackScene = (stacks, view) => {
  const gap = 16; const widths = stacks.map(st => Math.max(...st.map(s => s.w)));
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (stacks.length - 1);
  const W = Math.max(150, totalW + 80), H = 200; const baseY = 160;
  let s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="#f8fafc"/><path d="M14,${baseY + 4} L${W - 14},${baseY + 4}" stroke="#cbd5e1" stroke-width="3"/>`;
  let x = (W - totalW) / 2;
  stacks.forEach((st, i) => { const cx = x + widths[i] / 2; let yb = baseY; st.forEach(sd => { s += solid3d(sd, cx, yb); yb -= heightOf(sd); }); x += widths[i] + gap; });
  const midX = W / 2;
  if (view === 'top') s += `<ellipse cx="${midX}" cy="16" rx="13" ry="8" fill="#fff" ${S}/><circle cx="${midX}" cy="16" r="4.5" fill="#1e3a8a"/>${arrow(midX, 27, midX, 40, '#ef4444', 4)}${txt(midX + 44, 16, 'yukarıdan', 12, '#ef4444')}`;
  else s += `<ellipse cx="${midX}" cy="${baseY + 28}" rx="13" ry="8" fill="#fff" ${S}/><circle cx="${midX}" cy="${baseY + 28}" r="4.5" fill="#1e3a8a"/>${txt(midX + 38, baseY + 28, 'önden', 12, '#ef4444')}`;
  return card(s, { w: W, h: H + (view === 'front' ? 18 : 0) });
};
// Önden görünüş: düz siluetler
const frontSil = (sd, cx, yb, k) => {
  const { t, w, c } = sd; const h = heightOf(sd) * k; const ww = w * k;
  if (t === 'silindir' || t === 'disk') return `<rect x="${cx - ww / 2}" y="${yb - h}" width="${ww}" height="${h}" fill="${c}" ${S}/>`;
  if (t === 'koni' || t === 'piramit') return `<polygon points="${cx - ww / 2},${yb} ${cx},${yb - h} ${cx + ww / 2},${yb}" fill="${c}" ${S}/>`;
  return `<circle cx="${cx}" cy="${yb - h / 2}" r="${h / 2}" fill="${c}" ${S}/>`;
};
const viewCard = (stacks, view) => {
  const gap = 10; const widths = stacks.map(st => Math.max(...st.map(s => s.w)));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (stacks.length - 1);
  const maxH = Math.max(...stacks.map(st => st.reduce((a, s) => a + heightOf(s), 0)));
  const k = Math.min(0.9, 84 / total, 80 / (view === 'top' ? Math.max(...widths) : maxH));
  let s = ''; let x = 50 - (total * k) / 2;
  stacks.forEach((st, i) => {
    const cx = x + (widths[i] * k) / 2;
    if (view === 'front') { let yb = 50 + (maxH * k) / 2; st.forEach(sd => { s += frontSil(sd, cx, yb, k); yb -= heightOf(sd) * k; }); }
    else st.forEach(sd => { // alttan üste: büyük olan altta kalır, üstteki küçükler üstüne çizilir
      const r = (sd.w * k) / 2;
      if (sd.t === 'piramit') s += `<rect x="${cx - r}" y="${50 - r}" width="${2 * r}" height="${2 * r}" fill="${sd.c}" ${S}/><path d="M${cx - r},${50 - r} L${cx + r},${50 + r} M${cx + r},${50 - r} L${cx - r},${50 + r}" ${SN} stroke-width="1.5"/>`;
      else s += `<circle cx="${cx}" cy="50" r="${r}" fill="${sd.c}" ${S}/>${sd.t === 'koni' ? `<circle cx="${cx}" cy="50" r="2.6" fill="${OL}"/><path d="M${cx},50 L${cx - r * 0.7},${50 - r * 0.7} M${cx},50 L${cx + r * 0.7},${50 + r * 0.7}" ${SN} stroke-width="1.2"/>` : ''}`;
    });
    x += widths[i] * k + gap * k;
  });
  return card(s);
};
const stKey = (stacks, view) => view + JSON.stringify(view === 'top' ? stacks.map(st => st.map(s => [s.t === 'piramit' ? 'p' : s.t === 'koni' ? 'k' : 'o', s.w, s.c])) : stacks.map(st => st.map(s => [s.t === 'silindir' || s.t === 'disk' ? 'r' : s.t === 'kure' ? 'o' : 't', s.w, heightOf(s), s.c])));
const makeStack = (rng, minN, maxN) => {
  const n = randInt(rng, minN, maxN);
  const cols = shuffle(SOLID_COLS, rng);
  let w = randInt(rng, 54, 72); const out = [];
  for (let j = 0; j < n; j++) {
    const last = j === n - 1;
    const t = last ? pick(['silindir', 'koni', 'kure', 'piramit', 'disk', 'silindir'], rng) : pick(['silindir', 'disk', 'disk'], rng);
    out.push({ t, w, h: t === 'disk' ? 12 : t === 'koni' || t === 'piramit' ? randInt(rng, 26, 36) : randInt(rng, 20, 30), c: cols[j % cols.length] });
    w = Math.max(18, w - randInt(rng, 10, 16));
  }
  return out;
};
const perspective2 = (view, nStacks, minN, maxN, m = 3) => (key, seed) => {
  const rng = makeRng(key, seed);
  const stacks = Array.from({ length: nStacks }, () => makeStack(rng, minN, maxN));
  const opt = (sts) => ({ key: stKey(sts, view), render: () => viewCard(sts, view) });
  const cands = [];
  // renkleri karıştır
  cands.push(opt(stacks.map(st => { const cs = st.map(s => s.c); const rot = [...cs.slice(1), cs[0]]; return st.map((s, j) => ({ ...s, c: rot[j] })); })));
  // sırayı ters çevir (önden) / en üsttekini çıkar (yukarıdan)
  if (view === 'front') cands.push(opt(stacks.map(st => [...st].reverse())));
  else cands.push(opt(stacks.map(st => (st.length > 1 ? st.slice(0, -1) : st.map(s => ({ ...s, w: s.w * 0.7 }))))));
  // en üstteki cismin şekli değişsin
  cands.push(opt(stacks.map((st, i) => (i === 0 ? st.map((s, j) => (j === st.length - 1 ? { ...s, t: s.t === 'kure' ? 'koni' : s.t === 'koni' || s.t === 'piramit' ? (view === 'top' && s.t === 'koni' ? 'piramit' : 'silindir') : 'kure' } : s)) : st))));
  if (nStacks > 1) cands.unshift(opt([...stacks].reverse()));
  const corr = opt(stacks);
  return result({ sig: stKey(stacks, 'front') + view, main: stackScene(stacks, view), correct: corr, wrongs: pickWrongs(corr.key, nStacks > 1 ? cands : shuffle(cands, rng), m - 1) });
};
export const per2EasyTop = perspective2('top', 1, 2, 4);
export const per2EasyFront = perspective2('front', 1, 2, 3);
export const per2MidFront = perspective2('front', 2, 1, 3);
export const per2MidTop = perspective2('top', 2, 1, 3);
export const per2HardFront = perspective2('front', 3, 1, 3);
export const per2HardTop = perspective2('top', 3, 1, 3);

// ============================================================================
// HAFIZA 2 — "Gördüğün hangisi?" (tek / ikili / üçlü)
// ============================================================================
const memScene = (inners, bg = '#f0f9ff') => {
  const n = inners.length; const W = n === 1 ? 140 : n === 2 ? 220 : n === 3 ? 300 : 20 + n * 96;
  return card(inners.map((inn, j) => `<rect x="${10 + j * 96}" y="10" width="84" height="84" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>${put(inn, 52 + j * 96, 52, 0.76)}`).join('').replace(/^/, n === 1 ? `<g transform="translate(18 0)">` : '') + (n === 1 ? '</g>' : ''), { w: W, h: 104, bg });
};
const itemInner = (it) => (it.g ? gridInner(it.g) : it.sh ? shapeInner(it.sh, it.c) : obj(it.k, it.c));
const itemKey = (it) => (it.g ? gKey(it.g) : it.sh ? `${it.sh}:${it.c}` : objKey(it.k, it.c));
const setOpt = (items) => ({ key: items.map(itemKey).join('>'), render: () => (items.length === 1 ? card(put(itemInner(items[0]), 50, 50, 0.84)) : seqOption(items.map(itemInner))) });
const randGlyph = (rng, filled, col) => { const g = Array(9).fill(null); shuffle([...Array(9).keys()], rng).slice(0, filled).forEach(i => { g[i] = col; }); return g; };
const nearGlyph = (g, rng) => { const out = [...g]; const f = shuffle(out.map((v, i) => (v ? i : -1)).filter(i => i >= 0), rng)[0]; const e = shuffle(out.map((v, i) => (v ? -1 : i)).filter(i => i >= 0), rng)[0]; out[e] = out[f]; out[f] = null; return out; };
const memWhich = (n, level, seconds, m = 3) => (key, seed) => {
  const rng = makeRng(key, seed);
  let items;
  if (level === 'zor') {
    const col = pick(HEX, rng);
    items = Array.from({ length: n }, () => (rng() < 0.65 ? { g: randGlyph(rng, randInt(rng, 3, 4), col) } : { sh: pick(['ok', 'damla', 'yarimay', 'kalp', 'yildiz', 'ucgen'], rng), c: pick(HEX, rng) }));
  } else if (level === 'orta') {
    items = pickN(COLORABLE.filter(k => ART[k]), n, rng).map(k => ({ k, c: pick(HEX, rng) }));
  } else items = pickN(OBJ, n, rng).map(k => ({ k, c: COLORABLE.includes(k) ? pick(HEX, rng) : undefined }));
  const variant = (its) => {
    const out = its.map(x => ({ ...x })); const j = Math.floor(rng() * out.length); const it = out[j];
    const r = rng();
    if (it.g) out[j] = { g: nearGlyph(it.g, rng) };
    else if (it.sh) out[j] = r < 0.5 ? { sh: it.sh, c: pick(HEX.filter(h => h !== it.c), rng) } : { sh: pick(['ok', 'damla', 'yarimay', 'kalp', 'yildiz', 'ucgen'].filter(s => s !== it.sh), rng), c: it.c };
    else if (level === 'orta' && COLORABLE.includes(it.k) && (r < 0.7 || n === 1)) out[j] = { k: it.k, c: pick(HEX.filter(h => h !== it.c), rng) };
    else if (n > 1 && level !== 'kolay' && r < 0.85) { const j2 = (j + 1) % n; [out[j], out[j2]] = [out[j2], out[j]]; } // sıra değişmiş
    else { const k2 = pick(OBJ.filter(k => !its.some(x => x.k === k)), rng); out[j] = { k: k2, c: COLORABLE.includes(k2) ? pick(HEX, rng) : undefined }; }
    return out;
  };
  const corr = setOpt(items);
  const cands = []; for (let t = 0; t < 12; t++) cands.push(setOpt(variant(items)));
  return result({ sig: corr.key, main: memScene(items.map(itemInner)), correct: corr, wrongs: pickWrongs(corr.key, cands, m - 1), memory: { seconds } });
};
export const mem2EasyOne = memWhich(1, 'kolay', 3);
export const mem2EasyTwo = memWhich(2, 'kolay', 4);
export const mem2EasyThree = memWhich(3, 'kolay', 5);
export const mem2MidOne = memWhich(1, 'orta', 4);
export const mem2MidTwo = memWhich(2, 'orta', 5);
export const mem2MidThree = memWhich(3, 'orta', 6);
export const mem2HardOne = memWhich(1, 'zor', 5);
export const mem2HardTwo = memWhich(2, 'zor', 6);
export const mem2HardThree = memWhich(3, 'zor', 7);

// ============================================================================
// İLKOKUL (1-3. sınıf) EK KALIPLARI — 4 şık, daha zor
// ============================================================================
export const rotG1Right = rotCard('sag', 4);
export const rotG1Left = rotCard('sol', 4);
export const rotG2Right = rotGrid('sag', 4, 4);
export const rotG2Left = rotGrid('sol', 4, 4);
export const rotG3Right = rotGrid('sag', 5, 4, 3);
export const rotG3Half = rotGrid('ters', 5, 4, 3);
export const fold3G1a = foldStory('o', 2, 4);
export const fold3G1b = foldStory('o', 3, 4);
export const fold3G2a = foldStory('z', 3, 4);
export const fold3G2b = foldStory('z', 4, 4);
export const fold3G3a = foldStory('zz', 4, 4);
export const fold3G3b = foldStory('zz', 5, 4);
export const mir2G1Mirror = mirrorObj(2, true, 4);
export const mir2G1Water = mirrorObj(2, false, 4);
export const mir2G2Mirror = mirrorObj(3, true, 4);
export const mir2G2Water = mirrorObj(3, false, 4);
export const mir2G3Mirror = mirrorObj(4, true, 4);
export const mir2G3Water = mirrorObj(4, false, 4);
export const per2G1Front = perspective2('front', 2, 1, 3, 4);
export const per2G1Top = perspective2('top', 2, 1, 3, 4);
export const per2G2Front = perspective2('front', 3, 1, 3, 4);
export const per2G2Top = perspective2('top', 3, 1, 3, 4);
export const per2G3Front = perspective2('front', 4, 2, 4, 4);
export const per2G3Top = perspective2('top', 4, 2, 4, 4);
export const mem2G1Two = memWhich(2, 'orta', 4, 4);
export const mem2G1Three = memWhich(3, 'orta', 5, 4);
export const mem2G2Two = memWhich(2, 'zor', 5, 4);
export const mem2G2Three = memWhich(3, 'zor', 6, 4);
export const mem2G3Three = memWhich(3, 'zor', 4, 4);
export const mem2G3Four = memWhich(4, 'zor', 6, 4);
