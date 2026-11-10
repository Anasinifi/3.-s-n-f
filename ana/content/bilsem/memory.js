// ============================================================================
// --- BİLSEM: HAFIZA (resme bak, resim gizlenince soruyu cevapla) ---
// --- BİLSEM: KISA SÜRELİ BELLEK (sırayı aklında tut) ---
// ============================================================================
// Bu sorular "hafıza modu" ile kaydedilir: önce üst resim belirli süre gösterilir,
// sonra resim gizlenir ve soru (memoryText) sorulur.
import { card, put, obj, objKey, OBJ, COLORABLE, HEX, seqOption, cellBox, txt } from './draw';
import { makeRng, shuffle, pick, pickN, pickWrongs, result } from './common';

const objOpt = (k, c) => ({ key: objKey(k, c), render: () => card(put(obj(k, c), 50, 50, 0.84)) });

// Nesneleri bir sahneye (raf / masa / çayır) dağıt
const BGS = ['#f0f9ff', '#fefce8', '#f0fdf4', '#fdf2f8', '#f5f3ff'];
const sceneOf = (items, rng) => {
  const n = items.length;
  const cols = n <= 3 ? n : n <= 4 ? 2 : 3; const rows = Math.ceil(n / cols);
  const W = 260, H = rows === 1 ? 120 : 200;
  let s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="${pick(BGS, rng)}"/>`;
  items.forEach((it, j) => {
    const r = Math.floor(j / cols); const inRow = Math.min(cols, n - r * cols); const ci = j % cols;
    const cw = W / inRow;
    s += put(obj(it.k, it.c), cw * ci + cw / 2 + (rng() - 0.5) * 10, (H / rows) * r + (H / rows) / 2 + (rng() - 0.5) * 8, 0.62);
  });
  return card(s, { w: W, h: H });
};
const pickItems = (rng, n, colorful) => pickN(OBJ, n, rng).map(k => ({ k, c: COLORABLE.includes(k) ? pick(HEX, rng) : undefined, colorful }));

// "Hangisi resimde VARDI?"  (n nesne, şık sayısı m)
const memPresent = (n, m, seconds) => (key, seed) => {
  const rng = makeRng(key, seed);
  const items = pickItems(rng, n);
  const absent = pickN(OBJ.filter(k => !items.some(it => it.k === k)), m - 1, rng).map(k => ({ k, c: COLORABLE.includes(k) ? pick(HEX, rng) : undefined }));
  const target = pick(items, rng);
  return result({
    sig: items.map(it => objKey(it.k, it.c)).sort().join(',') + '>' + target.k,
    main: sceneOf(items, rng), correct: objOpt(target.k, target.c),
    wrongs: absent.map(a => objOpt(a.k, a.c)),
    memory: { seconds, observeText: 'Resme dikkatlice bak!' }
  });
};

// "Hangisi resimde YOKTU?" (n nesne, şık sayısı m: m-1 tanesi resimde var)
const memAbsent = (n, m, seconds) => (key, seed) => {
  const rng = makeRng(key, seed);
  const items = pickItems(rng, n);
  const absent = pick(OBJ.filter(k => !items.some(it => it.k === k)), rng);
  const ac = COLORABLE.includes(absent) ? pick(HEX, rng) : undefined;
  const shown = pickN(items, m - 1, rng);
  return result({
    sig: items.map(it => objKey(it.k, it.c)).sort().join(',') + '!' + absent,
    main: sceneOf(items, rng), correct: objOpt(absent, ac),
    wrongs: shown.map(it => objOpt(it.k, it.c)),
    memory: { seconds, observeText: 'Resme dikkatlice bak!' }
  });
};

// ZOR: "Resimdeki X ne renkti?" -> aynı nesne farklı renklerde
const memColor = (n, seconds) => (key, seed) => {
  const rng = makeRng(key, seed);
  const colorables = pickN(COLORABLE.filter(k => !['house', 'drum', 'clock'].includes(k)), n, rng);
  const cols = pickN(HEX, n, rng);
  const items = colorables.map((k, j) => ({ k, c: cols[j] }));
  const target = pick(items, rng);
  const others = pickN(HEX.filter(h => h !== target.c), 3, rng);
  return result({
    sig: items.map(it => objKey(it.k, it.c)).join(',') + '>' + target.k,
    main: sceneOf(items, rng), correct: objOpt(target.k, target.c),
    wrongs: others.map(c => objOpt(target.k, c)),
    memory: { seconds, observeText: 'Resimdeki nesnelere ve renklerine dikkatlice bak!' }
  });
};

// ZOR: "Hangisi resimde vardı?" -> çeldiriciler aynı nesnenin farklı rengi
const memPresentTricky = (n, seconds) => (key, seed) => {
  const rng = makeRng(key, seed);
  const ks = pickN(COLORABLE.filter(k => !['house', 'drum', 'clock'].includes(k)), n, rng);
  const items = ks.map(k => ({ k, c: pick(HEX, rng) }));
  const target = pick(items, rng);
  const w1 = { k: target.k, c: pick(HEX.filter(h => h !== target.c), rng) };
  const other = pick(items.filter(it => it !== target), rng);
  const w2 = { k: other.k, c: pick(HEX.filter(h => h !== other.c), rng) };
  const w3k = pick(OBJ.filter(k => !ks.includes(k)), rng);
  return result({
    sig: items.map(it => objKey(it.k, it.c)).join(',') + '>' + target.k,
    main: sceneOf(items, rng), correct: objOpt(target.k, target.c),
    wrongs: pickWrongs(objKey(target.k, target.c), [objOpt(w1.k, w1.c), objOpt(w2.k, w2.c), objOpt(w3k, pick(HEX, rng))], 3),
    memory: { seconds, observeText: 'Resimdeki nesnelere ve renklerine dikkatlice bak!' }
  });
};

export const memEasy = memPresent(3, 3, 6);
export const memEasy4 = memPresent(4, 3, 7);
export const memMidPresent = memPresent(5, 4, 8);
export const memMidAbsent = memAbsent(4, 4, 8);
export const memHardColor = memColor(4, 10);
export const memHardTricky = memPresentTricky(5, 10);

// ---------------------------------------------------------------------------
// KISA SÜRELİ BELLEK: sıra
// ---------------------------------------------------------------------------
const seqScene = (items) => {
  const n = items.length; const cell = 70, gap = 10; const W = n * cell + (n - 1) * gap + 24, H = cell + 44;
  let s = '';
  items.forEach((it, j) => { const x = 12 + j * (cell + gap); s += cellBox(x, 30, cell, cell) + put(obj(it.k, it.c), x + cell / 2, 30 + cell / 2, 0.6) + txt(x + cell / 2, 16, j + 1, 14, '#64748b'); });
  return card(s, { w: W, h: H, bg: '#f8fafc' });
};
const seqOpt = (items) => ({ key: items.map(it => objKey(it.k, it.c)).join('>'), render: () => seqOption(items.map(it => obj(it.k, it.c))) });

// "İlk / son / N. sırada hangisi vardı?" -> tek nesne şıkları
const stmPosition = (n, m, seconds, positions) => (key, seed, pos) => { // her grup tek bir sıra sorar (toplu ses doğru kalsın)
  const rng = makeRng(key, seed);
  const items = pickItems(rng, n);
  const p = positions[(pos ?? seed) % positions.length];
  const idx = p === 'son' ? n - 1 : p;
  const target = items[idx];
  const others = pickN(items.filter((_, j) => j !== idx), Math.min(m - 1, n - 1), rng).map(it => objOpt(it.k, it.c));
  return result({
    sig: items.map(it => objKey(it.k, it.c)).join('>') + '@' + idx,
    main: seqScene(items), correct: objOpt(target.k, target.c),
    wrongs: pickWrongs(objKey(target.k, target.c), others, m - 1, () => { const k = pick(OBJ, rng); return objOpt(k, pick(HEX, rng)); }),
    memory: { seconds, observeText: 'Sıraya dikkatlice bak ve aklında tut!' }
  });
};

// "Gördüğün sıra hangisi?" -> sıra şıkları
const stmOrder = (n, m, seconds) => (key, seed) => {
  const rng = makeRng(key, seed);
  const items = pickItems(rng, n);
  const swap = (a, i, j) => { const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b; };
  const i0 = Math.floor(rng() * (n - 1));
  const repl = { k: pick(OBJ.filter(k => !items.some(it => it.k === k)), rng), c: pick(HEX, rng) };
  const replaced = items.map((it, j) => (j === n - 1 - i0 % n ? repl : it));
  const cands = [
    seqOpt(swap(items, i0, i0 + 1)),
    seqOpt(swap(items, 0, n - 1)),
    seqOpt([...items].reverse()),
    seqOpt(replaced),
    seqOpt(swap(items, (i0 + 1) % n, (i0 + 2) % n))
  ];
  return result({
    sig: items.map(it => objKey(it.k, it.c)).join('>'),
    main: seqScene(items), correct: seqOpt(items),
    wrongs: pickWrongs(seqOpt(items).key, shuffle(cands, rng), m - 1),
    memory: { seconds, observeText: 'Sıraya dikkatlice bak ve aklında tut!' }
  });
};

export const stmEasyFirst = stmPosition(3, 3, 6, [0]);
export const stmEasyLast = stmPosition(3, 3, 6, ['son']);
export const stmEasyOrder = stmOrder(2, 3, 5);
export const stmMidOrder = stmOrder(3, 3, 7);
export const stmMidSecond = stmPosition(4, 4, 8, [1]);
export const stmMidLast = stmPosition(4, 4, 8, ['son']);
export const stmHardOrder = stmOrder(4, 4, 9);
export const stmHardSecond = stmPosition(5, 4, 10, [1]);
export const stmHardThird = stmPosition(5, 4, 10, [2]);

// İLKOKUL (1-3. sınıf) EK KALIPLARI (daha çok nesne, 4 şık)
export const memG1Present = memPresent(6, 4, 8);
export const memG1Absent = memAbsent(5, 4, 8);
export const memG2Color = memColor(5, 9);
export const memG2Tricky = memPresentTricky(6, 9);
export const memG3Color = memColor(6, 9);
export const memG3Tricky = memPresentTricky(8, 10);
export const stmG1Order = stmOrder(4, 4, 8);
export const stmG1Third = stmPosition(5, 4, 9, [2]);
export const stmG2Order = stmOrder(5, 4, 9);
export const stmG2Fourth = stmPosition(6, 4, 9, [3]);
export const stmG3Order = stmOrder(6, 4, 10);
export const stmG3Fifth = stmPosition(7, 4, 10, [4]);
