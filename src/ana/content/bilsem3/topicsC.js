// ============================================================================
// --- BİLSEM: DİZİLİM · ŞİFRELEME · NEGATİF · KISA SÜRELİ BELLEK ---
// ============================================================================
import { makeRng, shuffle, pick, randInt, COLS, COL_TR, INK, n2, box, shape, text, qmark, build, capped, SHAPES, ASYM } from './core';

const strip = (frames, w = 60) => { // 3 kare + soru işareti
  let s = ''; frames.forEach((inner, k) => { s += `<g transform="translate(${6 + k * (w + 8)} 6) scale(${w / 100})"><rect x="2" y="2" width="96" height="96" rx="10" fill="#fff" stroke="${INK}" stroke-width="2.5"/>${inner}</g>`; });
  const x = 6 + frames.length * (w + 8);
  s += `<rect x="${x}" y="6" width="${w}" height="${w}" rx="6" fill="#fff" stroke="${INK}" stroke-width="2" stroke-dasharray="5 4"/>` + text(x + w / 2, 6 + w / 2 + 1, '?', 34, '#dc2626');
  return box(s, x + w + 8, w + 12);
};

// ---------------------------------------------------------------------------
// DİZİLİM 1: dönen şekil (+ ters yönde dolaşan nokta)
// ---------------------------------------------------------------------------
const CORNERS = [[22, 22], [78, 22], [78, 78], [22, 78]];
export const seqRotate = (withDot) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const t = pick(ASYM, rng); const c = pick(COLS, rng); const step = pick([45, 90, 90, 135], rng) * pick([1, -1], rng);
  const r0 = randInt(rng, 0, 7) * 45; const d0 = randInt(rng, 0, 3); const ds = pick([1, -1, 2], rng);
  const fr = (k, { rot = r0 + step * k, dot = d0 + ds * k, flip = false } = {}) => shape(t, 50, 50, withDot ? 24 : 30, c, { rot, mirror: flip }) + (withDot ? `<circle cx="${CORNERS[((dot % 4) + 4) % 4][0]}" cy="${CORNERS[((dot % 4) + 4) % 4][1]}" r="8" fill="${INK}"/>` : '');
  const key4 = (rot, dot, flip) => `${((rot % 360) + 360) % 360}.${withDot ? ((dot % 4) + 4) % 4 : 0}.${flip}`;
  const opt = (o = {}) => { const rot = o.rot ?? r0 + step * 3, dot = o.dot ?? d0 + ds * 3; return { k: key4(rot, dot, !!o.flip), img: box(fr(3, o)) }; };
  const wrongs = [opt({ rot: r0 + step * 2 }), opt({ rot: r0 - step * 3 }), opt({ rot: r0 + step * 4 }), opt({ flip: true })];
  if (withDot) wrongs.unshift(opt({ dot: d0 + ds * 2 }), opt({ dot: d0 - ds * 3 }));
  return build({ sig: 'SR' + [t, c, step, r0, d0, ds, withDot].join(), text: 'Şekiller bir kurala göre değişiyor. Sıradaki şekil hangisidir?', main: strip([0, 1, 2].map(k => fr(k))), correct: opt(), wrongs: shuffle(wrongs, rng) });
}, 999);

// ---------------------------------------------------------------------------
// DİZİLİM 2: 3x3 ızgarada kayan / dönen desen
// ---------------------------------------------------------------------------
const gridCells = (set, col) => { let s = ''; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) s += `<rect x="${14 + c * 24}" y="${14 + r * 24}" width="24" height="24" fill="${set.includes(r * 3 + c) ? col : '#fff'}" stroke="${INK}" stroke-width="1.5"/>`; return s; };
const ROT = (i) => { const r = Math.floor(i / 3), c = i % 3; return c * 3 + (2 - r); }; // saat yönünde 90°
const SHR = (i) => Math.floor(i / 3) * 3 + ((i % 3) + 1) % 3; // sağa kay
const SHD = (i) => ((Math.floor(i / 3) + 1) % 3) * 3 + (i % 3); // aşağı kay
const MIR = (i) => Math.floor(i / 3) * 3 + (2 - (i % 3));
export const seqGrid = (kinds) => capped((key, seed) => {
  const rng = makeRng(key, seed); const kind = pick(kinds, rng); const col = pick(['#16a34a', '#2563eb', '#9333ea', '#dc2626', '#ea580c'], rng);
  const base = shuffle([0, 1, 2, 3, 5, 6, 7, 8, 4], rng).slice(0, randInt(rng, 3, 4)).sort();
  const f = { rot: ROT, shr: SHR, shd: SHD, rotb: (i) => ROT(ROT(ROT(i))) }[kind];
  const apply = (set, fn, k) => { let s2 = set; for (let j = 0; j < k; j++) s2 = s2.map(fn); return [...s2].sort((a, b) => a - b); };
  const fr = [0, 1, 2, 3].map(k => apply(base, f, k));
  if (fr[0].join() === fr[1].join() || fr[0].join() === fr[2].join()) return null;
  const opt = (set) => ({ k: set.join(), img: box(gridCells(set, col)) });
  const others = ['rot', 'shr', 'shd', 'rotb'].filter(x => x !== kind).map(x => ({ rot: ROT, shr: SHR, shd: SHD, rotb: (i) => ROT(ROT(ROT(i))) })[x]);
  const wrongs = [opt(fr[2]), opt(fr[3].map(MIR)), ...others.map(o => opt(apply(fr[2], o, 1))), opt(apply(base, f, 4)), opt(fr[1])];
  return build({ sig: 'SG' + kind + base.join() + col, text: 'Desen her adımda aynı kurala göre değişiyor. Sıradaki hangisidir?', main: strip(fr.slice(0, 3).map(s => gridCells(s, col))), correct: opt(fr[3]), wrongs: shuffle(wrongs, rng) });
}, 999);

// ---------------------------------------------------------------------------
// DİZİLİM 3: sayı + renk artışı
// ---------------------------------------------------------------------------
const dotsFig = (n, cols, t) => { const per = 4; let s = ''; for (let k = 0; k < n; k++) { const r = Math.floor(k / per), c = k % per; s += shape(t, 20 + c * 20, 20 + r * 20, 8, cols[k % cols.length], { sw: 1.2 }); } return s; };
export const seqCount = capped((key, seed) => {
  const rng = makeRng(key, seed); const a = randInt(rng, 1, 3), d = pick([1, 2, 3], rng); const t = pick(['circle', 'square', 'triangle', 'star', 'diamond'], rng);
  const cols = shuffle(COLS, rng).slice(0, pick([1, 2, 3], rng));
  const ns = [0, 1, 2, 3].map(k => a + d * k); if (ns[3] > 16) return null;
  const opt = (n, cs = cols, tt = t) => ({ k: n + cs.join() + tt, img: box(dotsFig(n, cs, tt)) });
  const wrongs = [opt(ns[3] - 1), opt(ns[3] + 1), opt(ns[3] + d), opt(ns[3], [...cols].reverse()), opt(ns[3], cols, pick(['circle', 'square', 'triangle', 'star', 'diamond'].filter(x => x !== t), rng))];
  return build({ sig: 'SC' + [a, d, t, cols.join()].join(), text: 'Sıradaki şekil hangisidir? Sayıya ve renklerin sırasına dikkat et.', main: strip(ns.slice(0, 3).map(n => dotsFig(n, cols, t))), correct: opt(ns[3]), wrongs: shuffle(wrongs, rng) });
}, 999);

// ---------------------------------------------------------------------------
// ŞİFRELEME
// ---------------------------------------------------------------------------
const WB = ['KALEM', 'MASA', 'ELMA', 'KAPI', 'KEDİ', 'OKUL', 'SALI', 'KALE', 'DARI', 'KADI', 'KİTAP', 'LALE', 'SABUN', 'BALIK', 'KUZU', 'TAKSİ', 'PERDE', 'DERE', 'SARI', 'KARA', 'DOLAP', 'TABAK', 'SİMİT', 'LİMON', 'KASA', 'ARMUT', 'MELEK', 'KUPA', 'TOPAÇ', 'ÇİÇEK', 'GÜNEŞ', 'BULUT', 'KAYAK', 'MUZ', 'ÜZÜM', 'İNEK', 'KOYUN', 'AYI', 'TİLKİ', 'ASLAN', 'KAPLAN', 'ZEBRA', 'DENİZ', 'ADA', 'KUM', 'TAŞ', 'KAŞIK', 'ÇATAL', 'BIÇAK', 'SÜT', 'PEYNİR', 'EKMEK', 'SU', 'ÇAY', 'ŞEKER', 'TUZ', 'BAL', 'KAR', 'YAĞMUR', 'RÜZGÂR', 'SINIF', 'DEFTER', 'SİLGİ', 'CETVEL', 'ÇANTA', 'SIRA', 'TAHTA', 'ÖDEV', 'DERS', 'OYUN', 'TOP', 'İP', 'UÇAK', 'GEMİ', 'TREN', 'ARABA', 'BİSİKLET', 'YOL', 'KÖPRÜ', 'EV', 'ODA', 'KAPAK', 'PARA', 'PARK', 'KALP', 'MAKAS', 'KAZAK', 'ETEK', 'KEMER', 'ŞAPKA', 'KOLA', 'LAMBA', 'SAAT', 'KİLİT', 'ANAHTAR', 'DAMLA', 'TOPRAK', 'TOHUM', 'FİDAN', 'DAL', 'YAPRAK', 'MEYVE', 'ERİK', 'KİRAZ', 'KAVUN', 'KARPUZ', 'NAR', 'İNCİR', 'AYVA', 'BAKLA', 'MERCİMEK', 'PİLAV', 'ÇORBA', 'KÖFTE', 'BÖREK', 'TATLI', 'LOKUM'];
const VOW = 'AEIİOÖUÜ';
const RULES = {
  harf: { ad: 'harf sayısı', f: (w) => [...w].length },
  farkli: { ad: 'farklı harf sayısı', f: (w) => new Set([...w]).size },
  hece: { ad: 'hece sayısı', f: (w) => [...w].filter(c => VOW.includes(c)).length },
  sesliF: { ad: 'farklı sesli harf sayısı', f: (w) => new Set([...w].filter(c => VOW.includes(c))).size },
  sessiz: { ad: 'sessiz harf sayısı', f: (w) => [...w].filter(c => !VOW.includes(c)).length }
};
const tableCard = (rows, ask) => { // [[sol, sağ], ...] + soru satırı
  const W = 230, rh = 26; let s = `<rect x="6" y="6" width="${W - 12}" height="${rows.length * rh + 8}" rx="8" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
  rows.forEach(([a, b], k) => { s += text(W / 2 - 40, 22 + k * rh, a, 17) + text(W / 2 + 10, 22 + k * rh, '=', 17) + text(W / 2 + 52, 22 + k * rh, b, 17, '#1d4ed8'); });
  const y = rows.length * rh + 34; s += text(W / 2 - 18, y, ask, 22) + text(W / 2 + 52, y, '= ?', 22, '#dc2626');
  return box(s, W, y + 22);
};
export const cipherRule = capped((key, seed) => {
  const rng = makeRng(key, seed); const rk = pick(Object.keys(RULES), rng); const R = RULES[rk];
  const words = shuffle(WB, rng).slice(0, 5); const ex = words.slice(0, 4), target = words[4];
  // kural tek olmalı: başka kural bütün örnekleri tutturmamalı
  if (Object.keys(RULES).some(o => o !== rk && ex.every(w => RULES[o].f(w) === R.f(w)))) return null;
  const ans = R.f(target);
  const opt = (v) => ({ k: 'n' + v, text: String(v) });
  const wrongs = shuffle([...Object.keys(RULES).filter(o => o !== rk).map(o => RULES[o].f(target)), ans - 1, ans + 1, ans + 2].filter(v => v > 0 && v !== ans), rng).map(opt);
  return build({ sig: 'CR' + rk + words.join(), text: 'Kelimeler bir kurala göre sayıya dönüşüyor. Soru işaretli yere hangi sayı gelir?', main: tableCard(ex.map(w => [w, String(R.f(w))]), target), correct: opt(ans), wrongs });
}, 999);
const DIG = '123456789';
const coverPick = (rng, nEx) => { // hedef kelimenin bütün harfleri örneklerde geçsin
  for (let t = 0; t < 200; t++) {
    const target = pick(WB.filter(w => [...w].length <= 5), rng);
    const ex = shuffle(WB.filter(w => w !== target && [...w].length <= 5), rng).filter(w => [...w].some(c => target.includes(c))).slice(0, nEx);
    const letters = new Set(ex.flatMap(w => [...w]));
    if (ex.length === nEx && [...target].every(c => letters.has(c)) && new Set([...ex, target].flatMap(w => [...w])).size <= 9) return { target, ex };
  }
  return null;
};
export const cipherNumber = (shuffled) => capped((key, seed) => {
  const rng = makeRng(key, seed); const p = coverPick(rng, 3); if (!p) return null;
  const letters = [...new Set([...p.ex, p.target].flatMap(w => [...w]))]; const digits = shuffle(DIG.split(''), rng);
  const M = {}; letters.forEach((c, k) => { M[c] = digits[k]; });
  const code = (w) => [...w].map(c => M[c]).join('');
  const ans = code(p.target);
  let codes = p.ex.map(code);
  if (shuffled) {
    codes = shuffle(codes, rng);
    // tek çözüm olmalı: kelime-kod eşleşmesinin sadece bir yolu tutarlı olsun
    const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    let ok = 0; let sol = null;
    perms.forEach(pm => { const m = {}; const used = {}; let good = true; p.ex.forEach((w, i) => { const cd = codes[pm[i]]; if (!good || cd.length !== [...w].length) { good = false; return; } [...w].forEach((ch, j) => { if (m[ch] && m[ch] !== cd[j]) good = false; if (used[cd[j]] && used[cd[j]] !== ch) good = false; m[ch] = cd[j]; used[cd[j]] = ch; }); }); if (good) { ok++; sol = m; } });
    if (ok !== 1 || [...p.target].map(c => sol[c]).join('') !== ans) return null;
  }
  const opt = (v) => ({ k: 'c' + v, text: v });
  const sw = (s, i) => { const a = [...s]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a.join(''); };
  const wrongs = [sw(ans, 0), sw(ans, ans.length - 2), [...ans].reverse().join(''), ans.slice(0, -1) + pick(DIG.split('').filter(d => d !== ans.slice(-1)), rng), pick(DIG.split('').filter(d => d !== ans[0]), rng) + ans.slice(1)].map(opt);
  const main = shuffled
    ? (() => { const W = 230; const rh = 26; let s = `<rect x="6" y="6" width="${W - 12}" height="${3 * rh + 30}" rx="8" fill="#fff" stroke="${INK}" stroke-width="2"/>` + text(70, 20, 'kelimeler', 12, '#64748b') + text(165, 20, 'karışık kodlar', 12, '#64748b');
      p.ex.forEach((w, k) => { s += text(70, 42 + k * rh, w, 17); s += text(165, 42 + k * rh, codes[k], 17, '#1d4ed8'); });
      const y = 3 * rh + 56; s += text(W / 2 - 20, y, p.target, 22) + text(W / 2 + 52, y, '= ?', 22, '#dc2626'); return box(s, W, y + 22); })()
    : tableCard(p.ex.map((w, k) => [w, codes[k]]), p.target);
  return build({ sig: 'CN' + shuffled + p.ex.join() + p.target + ans, text: shuffled ? 'Kodlar karışık verilmiştir. Her harf hep aynı rakamla yazılıyor. Soru işaretli yere hangi kod gelir?' : 'Her harf bir rakamla gösteriliyor. Soru işaretli kelimenin kodu hangisidir?', main, correct: opt(ans), wrongs: shuffle(wrongs, rng) });
}, 999);
// harf -> renkli şekil
const symRow = (syms) => { let s = ''; syms.forEach((sy, k) => { s += shape(sy.t, 14 + k * 24, 16, 9, sy.c, { sw: 1.4 }); }); return s; };
export const cipherSymbol = capped((key, seed) => {
  const rng = makeRng(key, seed); const p = coverPick(rng, 2); if (!p) return null;
  const letters = [...new Set([...p.ex, p.target].flatMap(w => [...w]))];
  const pool = shuffle(SHAPES.flatMap(t => COLS.slice(0, 5).map(c => ({ t, c }))), rng);
  const M = {}; letters.forEach((ch, k) => { M[ch] = pool[k]; });
  const enc = (w) => [...w].map(ch => M[ch]);
  const rowImg = (syms) => box(symRow(syms), syms.length * 24 + 6, 32);
  const W = 240; let s = '';
  p.ex.forEach((w, k) => { s += text(40, 22 + k * 34, w, 16) + `<g transform="translate(80 ${6 + k * 34})">${symRow(enc(w))}</g>`; });
  const y = p.ex.length * 34 + 18; s += text(40, y, p.target, 18) + text(110, y, '= ?', 20, '#dc2626');
  const main = box(`<rect x="4" y="4" width="${W - 8}" height="${y + 14}" rx="8" fill="#fff" stroke="${INK}" stroke-width="2"/>${s}`, W, y + 22);
  const ans = enc(p.target); const sk = (a) => a.map(x => x.t + x.c).join();
  const opt = (a) => ({ k: sk(a), img: rowImg(a) });
  const sw = (i) => { const a = [...ans]; if (i + 1 >= a.length) return a; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; };
  const rep = () => { const a = [...ans]; const i = randInt(rng, 0, a.length - 1); a[i] = pick(Object.values(M).filter(v => v !== a[i]), rng); return a; };
  const wrongs = [sw(0), sw(1), [...ans].reverse(), rep(), rep(), rep()].map(opt);
  return build({ sig: 'CS' + p.ex.join() + p.target, text: 'Her harf bir şekille gösteriliyor. Soru işaretli kelime nasıl yazılır?', main, correct: opt(ans), wrongs: shuffle(wrongs, rng) });
}, 999);

// ---------------------------------------------------------------------------
// NEGATİF: siyah-beyaz desenin renkleri yer değiştirince
// ---------------------------------------------------------------------------
const BW = { b: '#262626', w: '#ffffff' };
const drawLayers = (L) => L.map(l => shape(l.t, l.x, l.y, l.r, BW[l.f], { rot: l.rot, stroke: '#262626', sw: 2.2 })).join('');
const lsig = (L) => L.map(l => [l.t, l.x, l.y, l.r, l.rot, l.f].join('.')).join('|');
const inv = (f) => (f === 'b' ? 'w' : 'b');
export const negative = (complex) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const outer = pick(['circle', 'square', 'hexagon', 'star', 'pentagon', 'diamond', 'cross'], rng);
  const L = [{ t: outer, x: 50, y: 50, r: 42, rot: 0, f: 'b' }];
  const mids = shuffle(['circle', 'square', 'star', 'diamond', 'hexagon', 'triangle', 'cross'], rng);
  L.push({ t: mids[0], x: 50, y: 50, r: 28, rot: pick([0, 45], rng), f: 'w' });
  L.push({ t: mids[1], x: 50, y: 50, r: 16, rot: 0, f: 'b' });
  if (complex) {
    const k = pick([2, 3, 4], rng); const sm = pick(['circle', 'triangle', 'star', 'square'], rng); const f = pick(['w', 'b'], rng);
    for (let j = 0; j < k; j++) { const a = (j / k) * Math.PI * 2 - Math.PI / 2; L.push({ t: sm, x: n2(50 + 35 * Math.cos(a)), y: n2(50 + 35 * Math.sin(a)), r: 6, rot: 0, f }); }
    L.push({ t: mids[2], x: 50, y: 50, r: 7, rot: 0, f: 'w' });
  }
  const neg = L.map(l => ({ ...l, f: inv(l.f) }));
  const opt = (X) => ({ k: lsig(X), img: box(drawLayers(X)) });
  const wrongs = [opt(L)];
  for (let j = 1; j < L.length; j++) wrongs.push(opt(neg.map((l, k) => (k === j ? { ...l, f: inv(l.f) } : l))));
  wrongs.push(opt(neg.map((l, k) => (k === 1 ? { ...l, t: mids[3] } : l))));
  wrongs.push(opt(neg.map((l, k) => (k === 2 ? { ...l, r: 22 } : l))));
  return build({ sig: 'NG' + lsig(L), text: 'Desendeki siyahlar beyaz, beyazlar siyah olursa (negatifi) hangisi elde edilir?', main: box(drawLayers(L)), correct: opt(neg), wrongs: [...wrongs.slice(0, 2), ...shuffle(wrongs.slice(2), rng)] });
}, 999);

// ---------------------------------------------------------------------------
// KISA SÜRELİ BELLEK (resim 10 sn gösterilir, sonra gizlenir)
// ---------------------------------------------------------------------------
const MEM = (s = 10) => ({ seconds: s, observeText: 'Resmi dikkatlice incele! (10 saniye)' });
const barsImg = (rows) => { let s = ''; rows.forEach((row, r) => { let x = 12; row.forEach(b => { s += `<rect x="${x}" y="${12 + r * 20}" width="${b.w}" height="13" rx="2" fill="${b.c}"/>`; x += b.w + 6; }); }); return box(s, 120, rows.length * 20 + 20); };
export const memBars = capped((key, seed) => {
  const rng = makeRng(key, seed); const pal = shuffle(COLS, rng).slice(0, 4);
  const rows = Array.from({ length: 4 }, () => { const n = randInt(rng, 1, 3); let left = 92; return Array.from({ length: n }, (_, k) => { const w = k === n - 1 ? left : randInt(rng, 12, Math.max(14, left - 18 * (n - k - 1))); left -= w + 6; return { w: Math.max(10, w), c: pick(pal, rng) }; }); });
  const sig = (R) => R.map(r => r.map(b => b.w + b.c).join(',')).join('/');
  const opt = (R) => ({ k: sig(R), img: barsImg(R) });
  const cp = () => rows.map(r => r.map(b => ({ ...b })));
  const wrongs = [];
  for (let t = 0; t < 3; t++) { const X = cp(); const r = randInt(rng, 0, 3), b = randInt(rng, 0, X[r].length - 1); X[r][b].c = pick(pal.filter(c => c !== X[r][b].c), rng); wrongs.push(opt(X)); }
  { const X = cp(); const a = randInt(rng, 0, 3); const b = (a + 1) % 4; [X[a], X[b]] = [X[b], X[a]]; wrongs.push(opt(X)); }
  { const X = cp(); const r = X.findIndex(x => x.length > 1); if (r >= 0) { X[r] = [...X[r]].reverse(); wrongs.push(opt(X)); } }
  return build({ sig: 'MB' + sig(rows), text: 'Gördüğün resim hangisiydi?', main: barsImg(rows), correct: opt(rows), wrongs: shuffle(wrongs, rng), memory: MEM(10) });
}, 999);
const quadImg = (Q) => box(Q.map((q, k) => shape(q.t, k % 2 ? 72 : 28, k < 2 ? 28 : 72, 18, q.c, { rot: q.rot })).join(''));
export const memQuad = capped((key, seed) => {
  const rng = makeRng(key, seed);
  const Q = Array.from({ length: 4 }, () => ({ t: pick(['arrow', 'ell', 'boot', 'flag', 'rtri'], rng), c: pick(COLS, rng), rot: pick([0, 90, 180, 270], rng) }));
  const sig = (X) => X.map(q => q.t + q.c + q.rot).join('|');
  const opt = (X) => ({ k: sig(X), img: quadImg(X) });
  const cp = () => Q.map(q => ({ ...q })); const wrongs = [];
  for (let t = 0; t < 2; t++) { const X = cp(); const i = randInt(rng, 0, 3); X[i].rot = (X[i].rot + pick([90, 180, 270], rng)) % 360; wrongs.push(opt(X)); }
  { const X = cp(); const i = randInt(rng, 0, 3), j = (i + pick([1, 2, 3], rng)) % 4; [X[i].c, X[j].c] = [X[j].c, X[i].c]; wrongs.push(opt(X)); }
  { const X = cp(); const i = randInt(rng, 0, 3), j = (i + 1) % 4; [X[i], X[j]] = [X[j], X[i]]; wrongs.push(opt(X)); }
  { const X = cp(); const i = randInt(rng, 0, 3); X[i].c = pick(COLS.filter(c => c !== X[i].c), rng); wrongs.push(opt(X)); }
  return build({ sig: 'MQ' + sig(Q), text: 'Gördüğün resim hangisiydi?', main: quadImg(Q), correct: opt(Q), wrongs: shuffle(wrongs, rng), memory: MEM(10) });
}, 999);
const gridImg = (G) => box(G.map((g, k) => (g ? shape(g.t, 20 + (k % 3) * 30, 20 + Math.floor(k / 3) * 30, 12, g.c) : '')).join('') + [1, 2].map(i => `<line x1="${5 + i * 30}" y1="5" x2="${5 + i * 30}" y2="95" stroke="#e2e8f0" stroke-width="1.5"/><line x1="5" y1="${5 + i * 30}" x2="95" y2="${5 + i * 30}" stroke="#e2e8f0" stroke-width="1.5"/>`).join(''));
export const memGridAsk = (ask) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const cells = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], rng).slice(0, randInt(rng, 5, 7));
  const G = Array(9).fill(null); cells.forEach(k => { G[k] = { t: pick(SHAPES, rng), c: pick(COLS.slice(0, 5), rng) }; });
  const opt1 = (g) => ({ k: g.t + g.c, img: box(shape(g.t, 50, 50, 30, g.c)) });
  if (ask === 'missing') {
    const present = new Set(G.filter(Boolean).map(g => g.t + g.c));
    const absent = shuffle(SHAPES.flatMap(t => COLS.slice(0, 5).map(c => ({ t, c }))).filter(x => !present.has(x.t + x.c)), rng);
    const pr = shuffle(G.filter(Boolean), rng);
    // "Hangisi resimde YOKTU?": doğru = olmayan; yanlışlar = olanlar
    return build({ sig: 'MG' + ask + JSON.stringify(G), text: 'Hangisi resimde YOKTU?', main: gridImg(G), correct: opt1(absent[0]), wrongs: pr.map(opt1), memory: MEM(10) });
  }
  if (ask === 'where') {
    const k = pick(cells, rng); const g = G[k]; const pos = ['sol üst', 'üst orta', 'sağ üst', 'sol orta', 'orta', 'sağ orta', 'sol alt', 'alt orta', 'sağ alt'];
    const others = shuffle(G.filter((x, j) => x && j !== k && x.t + x.c !== g.t + g.c), rng);
    return build({ sig: 'MG' + ask + JSON.stringify(G) + k, text: `Resimde ${pos[k].toUpperCase()} kutuda hangi şekil vardı?`, main: gridImg(G), correct: opt1(g), wrongs: [...others.map(opt1), ...shuffle(SHAPES, rng).map(t => opt1({ t, c: g.c }))], memory: MEM(10) });
  }
  // kaç tane?
  const t = pick(G.filter(Boolean), rng).t; const n = G.filter(x => x && x.t === t).length;
  const opt = (v) => ({ k: 'n' + v, text: String(v) });
  const names = { circle: 'daire', square: 'kare', triangle: 'üçgen', diamond: 'eşkenar dörtgen', pentagon: 'beşgen', hexagon: 'altıgen', star: 'yıldız', cross: 'artı' };
  return build({ sig: 'MG' + ask + JSON.stringify(G) + t, text: `Resimde kaç tane ${names[t]} vardı?`, main: gridImg(G), correct: opt(n), wrongs: shuffle([n + 1, n + 2, n - 1, 0, n + 3].filter(v => v >= 0 && v !== n), rng).map(opt), memory: MEM(10) });
}, 999);
export { COL_TR };
