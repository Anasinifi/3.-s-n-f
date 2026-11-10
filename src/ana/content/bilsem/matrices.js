// ============================================================================
// --- BİLSEM: MATRİSLER (tabloyu tamamla) ---
// ============================================================================
// KOLAY : 2x2 tablo. Satırlar aynı ya da "satır = şekil, sütun = renk" kuralı.
// ORTA  : 3x3 tablo. Satır = şekil, sütun = renk  /  her satırda her şekil bir kez.
// ZOR   : 3x3 tablo. Satır = şekil, sütun = büyüklük  /  şekil ve renk ayrı ayrı yer değiştirir.
import { shapeInner, matrixSvg, card, put, HEX, SHAPE_IDS, OBJ, obj, objKey } from './draw';
import { makeRng, shuffle, pick, pickN, pickWrongs, result } from './common';

const SIZES = [0.5, 0.72, 0.95];
const cellInner = (v) => (v.o ? put(obj(v.o, v.c), 50, 50, v.z || 0.9) : put(shapeInner(v.s, v.c), 50, 50, v.z || 0.9));
const cellKey = (v) => (v.o ? `o:${objKey(v.o, v.c)}|${v.z || 0.9}` : `${v.s}|${v.c}|${v.z || 0.9}`);
const optCard = (v) => card(cellInner(v));
const opt = (v) => ({ key: cellKey(v), render: () => optCard(v) });

// grid: [[v]] ; qr,qc: soru hücresi ; wrongs: aday yanlış hücreler
const build = (grid, qr, qc, wrongCands, n, rng, fillerFn) => {
  const correct = grid[qr][qc];
  const cells = grid.map((row, r) => row.map((v, c) => (r === qr && c === qc ? null : cellInner(v))));
  const wr = pickWrongs(cellKey(correct), wrongCands.map(opt), n - 1, fillerFn ? () => opt(fillerFn()) : null);
  return result({ sig: grid.map(r => r.map(cellKey).join(',')).join('/') + `@${qr}${qc}`, main: matrixSvg(cells), correct: opt(correct), wrongs: wr });
};

// KOLAY 1: iki satır aynı (nesnelerle)
export const matEasySame = (key, seed) => {
  const rng = makeRng(key, seed);
  const [a, b] = pickN(OBJ, 2, rng); const ca = pick(HEX, rng), cb = pick(HEX, rng);
  const A = { o: a, c: ca }, B = { o: b, c: cb };
  const grid = [[A, B], [A, B]];
  const qc = Math.floor(rng() * 2); const qr = 1;
  const other = qc === 0 ? B : A;
  const extra = { o: pick(OBJ.filter(x => x !== a && x !== b), rng), c: pick(HEX, rng) };
  return build(grid, qr, qc, [other, extra], 3, rng);
};

// KOLAY 2: satır = şekil, sütun = renk (2x2)
export const matEasyShapeColor = (key, seed) => {
  const rng = makeRng(key, seed);
  const [s1, s2] = pickN(SHAPE_IDS, 2, rng); const [c1, c2] = pickN(HEX, 2, rng);
  const grid = [[{ s: s1, c: c1 }, { s: s1, c: c2 }], [{ s: s2, c: c1 }, { s: s2, c: c2 }]];
  const qr = Math.floor(rng() * 2), qc = Math.floor(rng() * 2);
  const cor = grid[qr][qc];
  const wrongShape = { s: qr === 0 ? s2 : s1, c: cor.c };
  const wrongColor = { s: cor.s, c: qc === 0 ? c2 : c1 };
  return build(grid, qr, qc, shuffle([wrongShape, wrongColor], rng), 3, rng);
};

// ORTA 1: 3x3, satır = şekil, sütun = renk
export const matMidShapeColor = (key, seed) => {
  const rng = makeRng(key, seed);
  const S3 = pickN(SHAPE_IDS, 3, rng); const C3 = pickN(HEX, 3, rng);
  const grid = S3.map(s => C3.map(c => ({ s, c })));
  const qr = 1 + Math.floor(rng() * 2), qc = 1 + Math.floor(rng() * 2);
  const cor = grid[qr][qc];
  const cands = [
    { s: S3[(qr + 1) % 3], c: cor.c }, { s: cor.s, c: C3[(qc + 1) % 3] },
    { s: S3[(qr + 2) % 3], c: C3[(qc + 2) % 3] }, { s: pick(SHAPE_IDS.filter(x => !S3.includes(x)), rng), c: cor.c }
  ];
  return build(grid, qr, qc, shuffle(cands, rng), 4, rng);
};

// ORTA 2: 3x3 Latin: her satırda ve sütunda her şekil bir kez (tek renk ya da şekle bağlı renk)
export const matMidLatin = (key, seed) => {
  const rng = makeRng(key, seed);
  const S3 = pickN(SHAPE_IDS, 3, rng); const colorPerShape = rng() < 0.5;
  const base = pick(HEX, rng); const C3 = pickN(HEX, 3, rng);
  const shift = rng() < 0.5 ? 1 : 2;
  const grid = [0, 1, 2].map(r => [0, 1, 2].map(c => { const k = (c + r * shift) % 3; return { s: S3[k], c: colorPerShape ? C3[k] : base }; }));
  const qr = 2, qc = Math.floor(rng() * 3);
  const cor = grid[qr][qc];
  const others = S3.filter(s => s !== cor.s).map(s => ({ s, c: colorPerShape ? C3[S3.indexOf(s)] : base }));
  const cands = [...others, { s: cor.s, c: pick(HEX.filter(h => h !== cor.c), rng) }];
  return build(grid, qr, qc, shuffle(cands, rng), 4, rng);
};

// ZOR 1: satır = şekil, sütun = büyüklük (renk satıra göre)
export const matHardSize = (key, seed) => {
  const rng = makeRng(key, seed);
  const S3 = pickN(SHAPE_IDS, 3, rng); const C3 = pickN(HEX, 3, rng);
  const sizes = rng() < 0.5 ? SIZES : [...SIZES].reverse();
  const grid = S3.map((s, r) => sizes.map(z => ({ s, c: C3[r], z })));
  const qr = 1 + Math.floor(rng() * 2), qc = Math.floor(rng() * 3);
  const cor = grid[qr][qc];
  const cands = [
    { ...cor, z: sizes[(qc + 1) % 3] }, { ...cor, z: sizes[(qc + 2) % 3] },
    { s: S3[(qr + 1) % 3], c: C3[(qr + 1) % 3], z: cor.z }, { s: cor.s, c: C3[(qr + 2) % 3], z: cor.z }
  ];
  return build(grid, qr, qc, cands, 4, rng);
};

// ZOR 2: şekiller bir yöne, renkler diğer yöne kayar (iki kural birden)
export const matHardDouble = (key, seed) => {
  const rng = makeRng(key, seed);
  const S3 = pickN(SHAPE_IDS, 3, rng); const C3 = pickN(HEX, 3, rng);
  const grid = [0, 1, 2].map(r => [0, 1, 2].map(c => ({ s: S3[(c + r) % 3], c: C3[(c + 2 * r) % 3] })));
  const qr = 1 + Math.floor(rng() * 2), qc = Math.floor(rng() * 3);
  const cor = grid[qr][qc];
  const cands = [
    { s: cor.s, c: C3[(C3.indexOf(cor.c) + 1) % 3] }, { s: S3[(S3.indexOf(cor.s) + 1) % 3], c: cor.c },
    { s: S3[(S3.indexOf(cor.s) + 2) % 3], c: C3[(C3.indexOf(cor.c) + 2) % 3] }, { s: cor.s, c: C3[(C3.indexOf(cor.c) + 2) % 3] }
  ];
  return build(grid, qr, qc, cands, 4, rng);
};

// ============================================================================
// İLKOKUL (1-3. sınıf) EK KALIPLARI — gerçek BİLSEM tarzı, daha zor
// ============================================================================
// ÜÇ KURAL: şekil satırda kayar, renk sütunda ters yöne kayar, büyüklük satıra göre değişir
export const matTriple = (key, seed) => {
  const rng = makeRng(key, seed);
  const S3 = pickN(SHAPE_IDS, 3, rng); const C3 = pickN(HEX, 3, rng);
  const sizes = rng() < 0.5 ? SIZES : [...SIZES].reverse();
  const grid = [0, 1, 2].map(r => [0, 1, 2].map(c => ({ s: S3[(c + r) % 3], c: C3[(c + 2 * r + 1) % 3], z: sizes[r] })));
  const qr = 2, qc = Math.floor(rng() * 3);
  const cor = grid[qr][qc];
  const si = S3.indexOf(cor.s), ci = C3.indexOf(cor.c), zi = sizes.indexOf(cor.z);
  const cands = [
    { ...cor, z: sizes[(zi + 1) % 3] }, { ...cor, c: C3[(ci + 1) % 3] }, { ...cor, s: S3[(si + 1) % 3] },
    { s: S3[(si + 2) % 3], c: cor.c, z: sizes[(zi + 2) % 3] }, { ...cor, c: C3[(ci + 2) % 3], z: sizes[(zi + 1) % 3] }
  ];
  return build(grid, qr, qc, shuffle(cands, rng), 4, rng);
};
// ADET KURALI: her satırda nesne sayısı 1-2-3 (ya da 3-2-1) artar, nesne sütunda değişir
const countInner = (v) => {
  const n = v.n; const pos = n === 1 ? [[50, 50]] : n === 2 ? [[30, 50], [70, 50]] : n === 3 ? [[30, 32], [70, 32], [50, 72]] : [[30, 30], [70, 30], [30, 70], [70, 70]];
  return pos.map(([x, y]) => put(v.o ? obj(v.o, v.c) : shapeInner(v.s, v.c), x, y, n === 1 ? 0.7 : 0.4)).join('');
};
const cKey = (v) => `${v.o || v.s}|${v.c}|${v.n}`;
const cOpt = (v) => ({ key: cKey(v), render: () => card(countInner(v)) });
export const matCount = (key, seed) => {
  const rng = makeRng(key, seed);
  const S3 = pickN(SHAPE_IDS, 3, rng); const C3 = pickN(HEX, 3, rng);
  const up = rng() < 0.5; const shift = rng() < 0.5 ? 1 : 2;
  const grid = [0, 1, 2].map(r => [0, 1, 2].map(c => ({ s: S3[(c + r * shift) % 3], c: C3[r], n: up ? c + 1 : 3 - c })));
  const qr = 2, qc = Math.floor(rng() * 3);
  const cor = grid[qr][qc];
  const cells = grid.map((row, r) => row.map((v, c) => (r === qr && c === qc ? null : countInner(v))));
  const cands = [
    { ...cor, n: cor.n === 3 ? 2 : cor.n + 1 }, { ...cor, n: cor.n === 1 ? 4 : cor.n - 1 },
    { ...cor, s: S3[(S3.indexOf(cor.s) + 1) % 3] }, { ...cor, c: C3[(C3.indexOf(cor.c) + 1) % 3] }, { ...cor, n: 4 }
  ];
  return result({ sig: grid.map(r => r.map(cKey).join(',')).join('/') + `@${qr}${qc}`, main: matrixSvg(cells), correct: cOpt(cor), wrongs: pickWrongs(cKey(cor), shuffle(cands, rng).map(cOpt), 3) });
};
