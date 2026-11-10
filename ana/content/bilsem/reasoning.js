// ============================================================================
// --- BİLSEM: BENZEŞİM (A -> B ise C -> ?) ---
// --- BİLSEM: ŞİFRELEME (anahtara göre kodu çöz) ---
// --- BİLSEM: YANSIMA (aynadaki / sudaki görüntü) ---
// --- BİLSEM: DİZİLİM (örüntüyü devam ettir) ---
// ============================================================================
import { card, put, obj, objKey, OBJ, COLORABLE, FACING, HEX, shapeInner, SHAPE_IDS, OL, S, txt, ART, rowSvg, seqOption, cellBox, qBox } from './draw';
import { makeRng, shuffle, pick, pickN, pickWrongs, result, randInt } from './common';
import { arrow } from '../helpers';

// ---------------------------------------------------------------------------
// BENZEŞİM
// ---------------------------------------------------------------------------
// Bir "durum": { k (nesne ya da şekil), c (renk), z (büyüklük), n (adet), r (dönüş), f (ayna) }
const isShape = (k) => k.startsWith('s:');
const baseInner = (v) => (isShape(v.k) ? shapeInner(v.k.slice(2), v.c) : obj(v.k, v.c));
const stateInner = (v) => {
  const n = v.n || 1; const z = v.z || 0.82;
  if (n === 1) return put(baseInner(v), 50, 50, z, v.r || 0, !!v.f);
  const pos = n === 2 ? [[30, 50], [70, 50]] : n === 3 ? [[30, 34], [70, 34], [50, 70]] : [[30, 30], [70, 30], [30, 70], [70, 70]];
  return pos.map(([x, y]) => put(baseInner(v), x, y, z * 0.48, v.r || 0, !!v.f)).join('');
};
const sKey = (v) => `${v.k}|${v.c}|${v.z || 0.82}|${v.n || 1}|${v.r || 0}|${v.f ? 1 : 0}`;
const sOpt = (v) => ({ key: sKey(v), render: () => card(stateInner(v)) });
const analogyScene = (A, B, C) => {
  const cell = 74; let s = '';
  const box = (x, inner) => cellBox(x, 13, cell, cell) + put(inner, x + cell / 2, 13 + cell / 2, cell / 100 * 0.9);
  s += box(10, stateInner(A)) + arrow(90, 50, 112, 50, '#64748b', 3.5) + box(118, stateInner(B));
  s += `<path d="M206,18 L206,82" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="4 4"/>`;
  s += box(216, stateInner(C)) + arrow(296, 50, 318, 50, '#64748b', 3.5) + qBox(324, 13, cell, cell);
  return card(s, { w: 408, h: 100, bg: '#f8fafc' });
};
// Dönüşümler
const T = {
  kucult: { ok: (v) => true, apply: (v) => ({ ...v, z: 0.46 }) },
  buyut: { ok: (v) => true, pre: (v) => ({ ...v, z: 0.46 }), apply: (v) => ({ ...v, z: 0.9 }) },
  renk: { ok: (v) => isShape(v.k) || COLORABLE.includes(v.k), apply: (v, ctx) => ({ ...v, c: ctx.toColor }) },
  ikile: { ok: () => true, apply: (v) => ({ ...v, n: 2 }) },
  ucle: { ok: () => true, apply: (v) => ({ ...v, n: 3 }) },
  ters: { ok: () => true, apply: (v) => ({ ...v, r: 180 }) },
  ayna: { ok: (v) => FACING.includes(v.k) || v.k === 's:ok', apply: (v) => ({ ...v, f: !v.f }) },
  dondur: { ok: (v) => v.k === 's:ok' || v.k === 's:ucgen' || FACING.includes(v.k), apply: (v) => ({ ...v, r: 90 }) }
};
const pickItem = (rng, pool, tr) => { for (let t = 0; t < 40; t++) { const k = pick(pool, rng); const v = { k, c: pick(HEX, rng) }; if (tr.every(x => T[x].ok(v))) return v; } return { k: 's:daire', c: pick(HEX, rng) }; };

const analogy = (trSets, pool, m) => (key, seed) => {
  const rng = makeRng(key, seed);
  const tr = pick(trSets, rng);
  const ctx = { toColor: pick(HEX, rng) };
  const prep = (v) => tr.reduce((acc, t) => (T[t].pre ? T[t].pre(acc) : acc), v);
  let A = prep(pickItem(rng, pool, tr)); let C = prep(pickItem(rng, pool, tr));
  if (A.k === C.k) C = prep(pickItem(rng, pool.filter(k => k !== A.k), tr));
  if (tr.includes('renk')) { if (A.c === ctx.toColor) A = { ...A, c: pick(HEX.filter(h => h !== ctx.toColor), rng) }; if (C.c === ctx.toColor) C = { ...C, c: pick(HEX.filter(h => h !== ctx.toColor), rng) }; }
  const apply = (v, list) => list.reduce((acc, t) => T[t].apply(acc, ctx), v);
  const B = apply(A, tr), D = apply(C, tr);
  const cands = [sOpt(C)];                                               // hiç değişmemiş
  tr.forEach(t => cands.push(sOpt(apply(C, tr.filter(x => x !== t))))); // dönüşümün biri eksik
  cands.push(sOpt({ ...D, k: A.k }));                                    // A'nın nesnesi (B'yi kopyalamak)
  const alt = ['kucult', 'ikile', 'ters', 'renk'].filter(x => !tr.includes(x) && T[x].ok(C));
  if (alt.length) cands.push(sOpt(apply(C, [pick(alt, rng)])));
  return result({ sig: `${tr.join('+')}|${sKey(A)}|${sKey(C)}|${ctx.toColor}`, main: analogyScene(A, B, C), correct: sOpt(D), wrongs: pickWrongs(sKey(D), shuffle(cands, rng), m - 1, () => sOpt(apply(prep(pickItem(rng, pool, tr)), tr))) });
};
const SHAPE_POOL = SHAPE_IDS.map(s => 's:' + s).concat(['s:ok', 's:damla']);
export const anaEasyObj = analogy([['kucult'], ['ikile'], ['buyut']], OBJ, 3);
export const anaEasyColor = analogy([['renk']], [...COLORABLE.filter(k => k !== 'house'), ...SHAPE_POOL], 3);
export const anaMidTurn = analogy([['ters'], ['ayna'], ['ucle'], ['dondur']], [...FACING.filter(k => ART[k]), 's:ok', 's:ucgen'], 4);
export const anaMidShape = analogy([['renk'], ['ikile'], ['kucult'], ['ters']], SHAPE_POOL, 4);
export const anaHardDouble = analogy([['renk', 'kucult'], ['renk', 'ikile'], ['kucult', 'ikile']], [...COLORABLE.filter(k => k !== 'house'), ...SHAPE_POOL], 4);
export const anaHardTurn = analogy([['ters', 'renk'], ['ayna', 'ikile'], ['dondur', 'kucult'], ['ters', 'ikile']], [...FACING.filter(k => ART[k] && COLORABLE.includes(k)), 's:ok', 's:ucgen', 's:damla'], 4);

// ---------------------------------------------------------------------------
// ŞİFRELEME: anahtar (resim = sembol) + şifreli satır
// ---------------------------------------------------------------------------
const CODE_SETS = {
  sayi: { list: ['1', '2', '3', '4', '5', '6'], draw: (v) => txt(50, 54, v, 64, '#4f46e5') },
  renk: { list: HEX.slice(0, 6), draw: (v) => `<circle cx="50" cy="50" r="32" fill="${v}" ${S} stroke-width="3"/>` },
  sekil: { list: ['daire', 'kare', 'ucgen', 'yildiz', 'kalp', 'esken'], draw: (v) => shapeInner(v, '#94a3b8') },
  harf: { list: ['A', 'B', 'C', 'D', 'E', 'F'], draw: (v) => txt(50, 54, v, 60, '#be185d') }
};
const keyScene = (pics, codes, set, msg, decodeDir) => {
  const n = pics.length; const cw = 62; const W = Math.max(n * (cw + 6) + 20, msg.length * 58 + 90), H = 210;
  let s = `<rect x="6" y="6" width="${W - 12}" height="118" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2.5"/>${txt(W / 2, 20, 'ŞİFRE ANAHTARI', 12, '#4f46e5')}`;
  const kx = (W - n * (cw + 6)) / 2;
  pics.forEach((p, j) => {
    const x = kx + j * (cw + 6);
    s += `<rect x="${x}" y="30" width="${cw}" height="88" rx="8" fill="#fff" stroke="#c7d2fe" stroke-width="2"/>` + put(obj(p.k, p.c), x + cw / 2, 56, 0.4) + `<path d="M${x + 8},80 L${x + cw - 8},80" stroke="#c7d2fe" stroke-width="2"/>` + put(set.draw(codes[j]), x + cw / 2, 99, 0.3);
  });
  const mx = (W - msg.length * 58 - 70) / 2;
  msg.forEach((ix, j) => {
    const x = mx + j * 58;
    s += cellBox(x, 140, 52, 52) + (decodeDir ? put(set.draw(codes[ix]), x + 26, 166, 0.42) : put(obj(pics[ix].k, pics[ix].c), x + 26, 166, 0.42));
  });
  s += arrow(mx + msg.length * 58 + 2, 166, mx + msg.length * 58 + 24, 166, '#64748b', 3.5) + txt(mx + msg.length * 58 + 46, 167, '?', 34, '#d97706');
  return card(s, { w: W, h: H, bg: '#ffffff' });
};
const cipher = (nKey, nMsg, m, decodeDir) => (key, seed, pos) => {
  const rng = makeRng(key, seed);
  const setId = ['sayi', 'renk', 'sekil', 'harf'][(pos ?? seed) % 4];
  const set = CODE_SETS[setId];
  const pics = pickN(OBJ, nKey, rng).map(k => ({ k, c: COLORABLE.includes(k) ? pick(HEX, rng) : undefined }));
  const codes = shuffle(set.list, rng).slice(0, nKey);
  let msg = Array.from({ length: nMsg }, () => Math.floor(rng() * nKey));
  if (new Set(msg).size === 1 && nKey > 1) msg[nMsg - 1] = (msg[0] + 1) % nKey;
  const optFor = (ixs) => ({ key: ixs.join(','), render: () => seqOption(ixs.map(ix => (decodeDir ? obj(pics[ix].k, pics[ix].c) : set.draw(codes[ix])))) });
  const swap = (a, i, j) => { const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b; };
  const cands = [
    optFor(swap(msg, 0, nMsg - 1)),
    optFor(msg.map((v, j) => (j === 1 % nMsg ? (v + 1) % nKey : v))),
    optFor([...msg].reverse()),
    optFor(msg.map((v, j) => (j === 0 ? (v + nKey - 1) % nKey : v)))
  ];
  return result({ sig: `${setId}|${pics.map(p => objKey(p.k, p.c)).join(',')}|${codes.join(',')}|${msg.join('')}`, main: keyScene(pics, codes, set, msg, decodeDir), correct: optFor(msg), wrongs: pickWrongs(msg.join(','), shuffle(cands, rng), m - 1, () => optFor(msg.map(() => Math.floor(rng() * nKey)))) });
};
export const cipEasy = cipher(3, 2, 3, false);
export const cipEasy3 = cipher(3, 3, 3, false);
export const cipMid = cipher(4, 3, 4, false);
export const cipMidBack = cipher(3, 3, 4, true);
export const cipHard = cipher(5, 4, 4, false);
export const cipHardBack = cipher(4, 4, 4, true);

// ---------------------------------------------------------------------------
// YANSIMA
// ---------------------------------------------------------------------------
const mirrorScene = (inner, vertical) => {
  // vertical = dikey ayna (sağa yansır); değilse su yüzeyi (aşağı yansır)
  if (vertical) return card(`${put(inner, 60, 60, 0.95)}<rect x="116" y="8" width="8" height="104" rx="3" fill="#bae6fd" ${S}/><path d="M118,14 L122,30 M118,40 L122,56" stroke="#fff" stroke-width="2"/>${qBox(132, 18, 84, 84)}`, { w: 228, h: 120, bg: '#f8fafc' });
  return card(`${put(inner, 60, 54, 0.92)}<rect x="6" y="104" width="108" height="8" rx="3" fill="#7dd3fc" ${S}/>${qBox(18, 120, 84, 84)}`, { w: 120, h: 214, bg: '#f8fafc' });
};
const tf = (inner, { flipX = false, flipY = false, rot = 0 } = {}) => `<g transform="translate(50 50) rotate(${rot}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1}) translate(-50 -50)">${inner}</g>`;
const tOpt = (key, inner, o) => ({ key, render: () => card(put(tf(inner, o), 50, 50, 0.84)) });

// KOLAY: sağa bakan nesnenin aynadaki görüntüsü
export const mirEasy = (key, seed) => {
  const rng = makeRng(key, seed);
  const k = pick(FACING.filter(x => ART[x]), rng); const c = pick(HEX, rng); const left = rng() < 0.5;
  const inner = left ? put(obj(k, c), 50, 50, 1, 0, true) : obj(k, c); // bazen sola bakar
  return result({ sig: objKey(k, c) + left, main: mirrorScene(inner, true), correct: tOpt('fx', inner, { flipX: true }), wrongs: shuffle([tOpt('id', inner), tOpt('fy', inner, { flipY: true })], rng) });
};
// Izgara desenleri
const gridInner = (cells, n) => {
  const cs = 80 / n; let s = `<rect x="10" y="10" width="80" height="80" fill="#fff" ${S}/>`;
  cells.forEach((col, i) => { if (col) s += `<rect x="${10 + (i % n) * cs}" y="${10 + Math.floor(i / n) * cs}" width="${cs}" height="${cs}" fill="${col}"/>`; });
  for (let j = 1; j < n; j++) s += `<path d="M${10 + j * cs},10 L${10 + j * cs},90 M10,${10 + j * cs} L90,${10 + j * cs}" stroke="#94a3b8" stroke-width="1.5"/>`;
  return s + `<rect x="10" y="10" width="80" height="80" fill="none" ${S}/>`;
};
const flipCells = (cells, n, axis) => cells.map((_, i) => { const r = Math.floor(i / n), c = i % n; return axis === 'x' ? cells[r * n + (n - 1 - c)] : cells[(n - 1 - r) * n + c]; });
const gOpt = (cells, n) => ({ key: cells.map(c => c || '.').join(','), render: () => card(gridInner(cells, n)) });
const gridMirror = (n, filled, colors, m, vertical) => (key, seed) => {
  const rng = makeRng(key, seed);
  const pal = pickN(HEX, colors, rng);
  let cells; for (let t = 0; t < 50; t++) {
    cells = Array(n * n).fill(null); shuffle([...Array(n * n).keys()], rng).slice(0, filled).forEach(i => { cells[i] = pick(pal, rng); });
    if (gOpt(flipCells(cells, n, 'x'), n).key !== gOpt(cells, n).key && gOpt(flipCells(cells, n, 'y'), n).key !== gOpt(cells, n).key) break;
  }
  const axis = vertical ? 'x' : 'y'; const other = vertical ? 'y' : 'x';
  const correct = flipCells(cells, n, axis);
  const oneOff = [...correct]; const fi = correct.findIndex(Boolean); const empty = correct.findIndex(v => !v);
  if (fi >= 0 && empty >= 0) { oneOff[empty] = correct[fi]; oneOff[fi] = null; }
  const cands = [gOpt(cells, n), gOpt(flipCells(cells, n, other), n), gOpt(oneOff, n), gOpt(flipCells(flipCells(cells, n, 'x'), n, 'y'), n)];
  return result({ sig: gOpt(cells, n).key + axis, main: mirrorScene(gridInner(cells, n), vertical), correct: gOpt(correct, n), wrongs: pickWrongs(gOpt(correct, n).key, shuffle(cands, rng), m - 1) });
};
export const mirEasyGrid = gridMirror(3, 2, 1, 3, true);
export const mirMidGrid = gridMirror(3, 3, 2, 4, true);
export const mirMidWater = (key, seed) => {
  const rng = makeRng(key, seed);
  const k = pick(FACING.filter(x => ART[x]), rng); const c = pick(HEX, rng); const left = rng() < 0.5;
  const inner = left ? put(obj(k, c), 50, 50, 1, 0, true) : obj(k, c);
  return result({ sig: objKey(k, c) + left, main: mirrorScene(inner, false), correct: tOpt('fy', inner, { flipY: true }), wrongs: shuffle([tOpt('id', inner), tOpt('fx', inner, { flipX: true }), tOpt('r', inner, { rot: 180 })], rng) });
};
export const mirHardGrid = gridMirror(3, 4, 3, 4, true);
export const mirHardWater = gridMirror(3, 4, 2, 4, false);

// ---------------------------------------------------------------------------
// DİZİLİM (örüntü)
// ---------------------------------------------------------------------------
// motif: tekrar eden birim (ör. A B, A A B, A B C) ; gösterilen uzunluk L ; sonraki öğe sorulur
const PATTERNS = { AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2], AABB: [0, 0, 1, 1], ABCD: [0, 1, 2, 3], AABC: [0, 0, 1, 2], ABAC: [0, 1, 0, 2], ABCB: [0, 1, 2, 1], ABBCC: [0, 1, 1, 2, 2], AABCC: [0, 0, 1, 2, 2] };
const itemsFor = (rng, kind, count) => {
  if (kind === 'obj') return pickN(OBJ, count, rng).map(k => ({ k, c: COLORABLE.includes(k) ? pick(HEX, rng) : undefined }));
  if (kind === 'shape') { const c = pick(HEX, rng); return pickN(SHAPE_IDS, count, rng).map(s => ({ k: 's:' + s, c })); }
  const s = pick(SHAPE_IDS, rng); return pickN(HEX, count, rng).map(c => ({ k: 's:' + s, c })); // renk örüntüsü
};
const itInner = (it) => stateInner({ ...it, z: it.z || 0.86 });
const itKey = (it) => sKey(it);
const patternQ = (patIds, kind, shown, m) => (key, seed) => {
  const rng = makeRng(key, seed);
  const pid = pick(patIds, rng); const pat = PATTERNS[pid];
  const distinct = Math.max(...pat) + 1;
  const its = itemsFor(rng, pick(Array.isArray(kind) ? kind : [kind], rng), distinct + 1);
  const L = shown + (rng() < 0.5 ? 0 : 1);
  const seq = Array.from({ length: L + 1 }, (_, j) => its[pat[j % pat.length]]);
  const ans = seq[L];
  const optOf = (it) => ({ key: itKey(it), render: () => card(itInner(it)) });
  const cands = its.filter(it => itKey(it) !== itKey(ans)).map(optOf);
  return result({ sig: `${pid}|${L}|${its.map(itKey).join(',')}`, main: rowSvg([...seq.slice(0, L).map(itInner), null], L + 1 > 7 ? 54 : 64, 6), correct: optOf(ans), wrongs: pickWrongs(itKey(ans), shuffle(cands, rng), m - 1, () => optOf(itemsFor(rng, 'obj', 1)[0])) });
};
// Büyüyen örüntü: 1, 2, 3 ... adet
const growQ = (m) => (key, seed) => {
  const rng = makeRng(key, seed);
  const s = pick([...SHAPE_IDS, 'apple', 'star', 'flower', 'heart', 'ball'], rng); const c = pick(HEX, rng);
  const it = SHAPE_IDS.includes(s) ? { k: 's:' + s, c } : { k: s, c };
  const up = rng() < 0.6; const L = 3;
  const counts = up ? [1, 2, 3, 4] : [4, 3, 2, 1]; // artan ya da azalan
  const cell = (n) => stateInner({ ...it, n: Math.min(4, n) });
  const optOf = (n) => ({ key: 'n' + n, render: () => card(cell(n)) });
  return result({ sig: `${s}${c}${up}`, main: rowSvg([...counts.slice(0, L).map(cell), null], 64, 6), correct: optOf(counts[L]), wrongs: pickWrongs('n' + counts[L], [optOf(counts[L - 1]), optOf(counts[L - 2]), optOf(counts[0])], m - 1) });
};
// Dönen örüntü: ok her adımda 90° döner
const rotateQ = (m) => (key, seed) => {
  const rng = makeRng(key, seed);
  const shape = pick(['ok', 'ucgen', 'yarimay', 'damla'], rng); const c = pick(HEX, rng);
  const step = pick([90, -90, 180], rng); const r0 = pick([0, 90, 180, 270], rng);
  const L = 4; const rots = Array.from({ length: L + 1 }, (_, j) => (((r0 + j * step) % 360) + 360) % 360);
  const cell = (r) => put(shapeInner(shape, c), 50, 50, 0.86, r);
  const optOf = (r) => ({ key: 'r' + r, render: () => card(cell(r)) });
  const cands = [0, 90, 180, 270].filter(r => r !== rots[L]).map(optOf);
  return result({ sig: `${shape}${c}${step}${r0}`, main: rowSvg([...rots.slice(0, L).map(cell), null], 64, 6), correct: optOf(rots[L]), wrongs: pickWrongs('r' + rots[L], shuffle(cands, rng), m - 1) });
};
export const seqEasyAB = patternQ(['AB'], ['obj', 'shape', 'color'], 4, 3);
export const seqEasyAAB = patternQ(['AAB', 'ABB'], ['obj', 'color'], 5, 3);
export const seqMidABC = patternQ(['ABC', 'AABB'], ['obj', 'shape', 'color'], 6, 4);
export const seqMidGrow = growQ(3);
export const seqHardLong = patternQ(['ABCD', 'AABC', 'AABB'], ['obj', 'shape', 'color'], 6, 4);
export const seqHardRotate = rotateQ(4);

// ============================================================================
// İLKOKUL (1-3. sınıf) EK KALIPLARI
// ============================================================================
export const anaG3Triple = analogy([['renk', 'kucult', 'ters'], ['renk', 'ikile', 'ters'], ['kucult', 'ikile', 'renk'], ['renk', 'ucle', 'kucult']], [...COLORABLE.filter(k => k !== 'house'), ...SHAPE_POOL], 4);
export const anaG3Turn = analogy([['dondur', 'renk', 'kucult'], ['ayna', 'renk', 'ikile'], ['ters', 'renk', 'ucle']], [...FACING.filter(k => ART[k] && COLORABLE.includes(k)), 's:ok', 's:ucgen'], 4);
export const cipG3 = cipher(6, 5, 4, false);
export const cipG3Back = cipher(6, 5, 4, true);
export const mirG3Grid = gridMirror(4, 6, 3, 4, true);
export const mirG3Water = gridMirror(4, 6, 3, 4, false);
export const mirG2Water = gridMirror(3, 5, 3, 4, false);
export const seqG2Long = patternQ(['ABAC', 'ABCB', 'ABCD'], ['obj', 'shape', 'color'], 7, 4);
export const seqG3Long = patternQ(['ABBCC', 'AABCC', 'ABAC', 'ABCB'], ['obj', 'shape', 'color'], 8, 4);
// İki yönlü dönen örüntü: şekil hem döner hem rengi sırayla değişir
export const seqG3RotColor = (key, seed) => {
  const rng = makeRng(key, seed);
  const shape = pick(['ok', 'ucgen', 'yarimay', 'damla'], rng); const cols = pickN(HEX, 3, rng);
  const step = pick([90, -90], rng); const r0 = pick([0, 90, 180, 270], rng);
  const L = 5; const st = Array.from({ length: L + 1 }, (_, j) => ({ r: (((r0 + j * step) % 360) + 360) % 360, c: cols[j % 3] }));
  const cell = (v) => put(shapeInner(shape, v.c), 50, 50, 0.86, v.r);
  const k = (v) => v.r + v.c;
  const optOf = (v) => ({ key: k(v), render: () => card(cell(v)) });
  const ans = st[L];
  const cands = [{ r: ans.r, c: cols[(L + 1) % 3] }, { r: (ans.r + 180) % 360, c: ans.c }, { r: (ans.r + 90) % 360, c: ans.c }, { r: st[L - 1].r, c: ans.c }, { r: (ans.r + 180) % 360, c: cols[(L + 2) % 3] }].map(optOf);
  return result({ sig: `${shape}${cols}${step}${r0}`, main: rowSvg([...st.slice(0, L).map(cell), null], 56, 6), correct: optOf(ans), wrongs: pickWrongs(k(ans), shuffle(cands, rng), 3) });
};
