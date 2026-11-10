// ============================================================================
// --- MATEMATİK (3. SINIF) — 1000 HAZIR SORU ---
// ============================================================================
// Konular: üç basamaklı sayılar, basamak değeri, karşılaştırma-sıralama, yuvarlama, örüntüler,
// Romen rakamları, toplama, çıkarma, çarpma, bölme, problemler, kesirler, zaman, paralarımız,
// uzunluk / tartma / sıvı ölçme, geometrik şekil ve cisimler, çevre, veri (grafik).
// Biçimler karışık: yazılı soru, sesli problem (telefon okur), resimli soru (saat, kesir, grafik,
// şekil, para), sesli şık (sayı okunuşu) ve yazılı şık.
import { card } from '../art';
import { pic, textPic, oImg, oTxt, oAud, Q, makeRng, pick, shuffle, pickN, randInt, makeSubjectBank, grp, topic, kind, countPic } from './common';

const g = grp('mat');
const OL = '#1e293b';
const T = (x, y, t, size = 16, col = OL, w = 800) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" text-anchor="middle" dominant-baseline="central" font-family="Arial Rounded MT Bold, Arial, sans-serif" fill="${col}">${t}</text>`;

// --- sayı okunuşu ---
const BIR = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const ON = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
export const sayiOku = (n) => {
  if (n === 0) return 'sıfır';
  const parts = [];
  const b = Math.floor(n / 1000) % 10, y = Math.floor(n / 100) % 10, o = Math.floor(n / 10) % 10, r = n % 10;
  if (n >= 1000) parts.push(b === 1 ? 'bin' : `${BIR[b]} bin`);
  if (y) parts.push(y === 1 ? 'yüz' : `${BIR[y]} yüz`);
  if (o) parts.push(ON[o]);
  if (r) parts.push(BIR[r]);
  return parts.join(' ');
};
const uniqNums = (ans, cands, n = 3, lo = 0) => { const s = new Set([ans]); const out = []; cands.forEach(c => { if (out.length < n && Number.isFinite(c) && c >= lo && !s.has(c)) { s.add(c); out.push(c); } }); let k = 1; while (out.length < n) { const c = ans + (k % 2 ? k : -k) * (ans > 50 ? 10 : 1); if (c >= lo && !s.has(c)) { s.add(c); out.push(c); } k++; } return out; };
const nQ = ({ text, speak, main, ans, cands, unit = '', sig, lo = 0 }) => Q({ sig: sig || text + '|' + (main ? main.length : '') + ans, text, speak: speak || text, main, correct: oTxt(`${ans}${unit}`), wrongs: uniqNums(ans, cands, 3, lo).map(x => oTxt(`${x}${unit}`)) });
const fmt = (n) => String(n);

// ---------------------------------------------------------------------------
// 1. SAYILAR
// ---------------------------------------------------------------------------
const rand3 = (rng) => randInt(rng, 101, 999);
const readNum = (key, seed) => { // sayıyı okunuşla eşleştir (yazılı)
  const rng = makeRng(key, seed); const n = rand3(rng); const d = String(n).split('').map(Number);
  const sw = Number(`${d[0]}${d[2]}${d[1]}`); const w = [sw !== n ? sw : n + 10, n + (d[1] ? -10 : 10), n + (d[0] < 9 ? 100 : -100), Number(`${d[2] || 1}${d[1]}${d[0]}`)];
  return Q({ sig: 'r' + n, text: `${n} sayısının okunuşu hangisi?`, speak: `${n} sayısının okunuşu hangisi?`, main: textPic(fmt(n), { size: 48, w: 200 }), correct: oTxt(sayiOku(n)), wrongs: w.filter(x => x !== n && x > 0).map(x => oTxt(sayiOku(x))) });
};
const listenNum = (key, seed) => { // sesli soru → yazılı rakam
  const rng = makeRng(key, seed); const n = randInt(rng, 100, 999); const d = String(n).split('').map(Number);
  const cands = [Number(`${d[0]}${d[2]}${d[1]}`), Number(`${d[0]}0${d[2]}`), n + 10, n - 1, Number(`${d[0]}${d[1]}0`)];
  return nQ({ sig: 'l' + n, text: 'Dinle. Duyduğun sayı hangisi? 🔊', speak: `Dinle. || ${sayiOku(n)}. || ${sayiOku(n)}.`, ans: n, cands });
};
const audioNum = (key, seed) => { // yazılı sayı → sesli şık
  const rng = makeRng(key, seed); const n = rand3(rng); const d = String(n).split('').map(Number);
  const cands = uniqNums(n, [Number(`${d[0]}${d[2]}${d[1]}`), Number(`${d[1] || 1}${d[0]}${d[2]}`), n + 100 > 999 ? n - 100 : n + 100, n + 1], 3, 100);
  return Q({ sig: 'a' + n, text: 'Sayının okunuşunu şıklardan dinle ve seç.', speak: 'Ekrandaki sayının okunuşu hangisi? Şıkları dinle.', main: textPic(fmt(n), { size: 48, w: 200 }), correct: oAud(sayiOku(n)), wrongs: cands.map(x => oAud(sayiOku(x))), audioOpts: true });
};
const BAS = ['yüzler', 'onlar', 'birler'];
const placeValue = (key, seed) => {
  const rng = makeRng(key, seed); let n = rand3(rng); let ds = String(n).split('').map(Number);
  if (new Set(ds).size < 3) { n = 100 * randInt(rng, 1, 9) + 10 * ((ds[0] + 3) % 10) + ((ds[0] + 6) % 10); ds = String(n).split('').map(Number); }
  const j = randInt(rng, 0, 2); const dg = ds[j]; const val = dg * [100, 10, 1][j];
  const mode = randInt(rng, 0, 1);
  if (mode === 0) return nQ({ sig: 'pv' + n + j, text: `${n} sayısında ${BAS[j]} basamağındaki rakamın basamak değeri kaçtır?`, ans: val, cands: [dg, dg * 10, dg * 100, dg * 1000].filter(x => x !== val) });
  return Q({ sig: 'pn' + n + j, text: `${n} sayısında ${dg} rakamı hangi basamaktadır?`, speak: `${n} sayısında ${dg} rakamı hangi basamaktadır?`, correct: oTxt(`${BAS[j]} basamağı`), wrongs: [...BAS.filter((_, k) => k !== j).map(b => oTxt(`${b} basamağı`)), oTxt('binler basamağı')] });
};
const expand = (key, seed) => {
  const rng = makeRng(key, seed); const n = rand3(rng); const [a, b, c] = String(n).split('').map(Number);
  const mode = randInt(rng, 0, 1);
  if (mode === 0) { const s = `${a} yüzlük + ${b} onluk + ${c} birlik`; return nQ({ sig: 'e' + n, text: `${s} kaçtır?`, ans: n, cands: [Number(`${a}${c}${b}`), Number(`${c || 1}${b}${a}`), n + 10, Number(`${b || 1}${a}${c}`)] }); }
  return Q({ sig: 'ec' + n, text: `${n} sayısının çözümlenmiş hali hangisidir?`, speak: `${n} sayısının çözümlenmiş hali hangisidir?`, correct: oTxt(`${a * 100} + ${b * 10} + ${c}`), wrongs: [oTxt(`${a} + ${b} + ${c}`), oTxt(`${a * 100} + ${b} + ${c * 10}`), oTxt(`${a * 10} + ${b * 100} + ${c}`), oTxt(`${a * 100} + ${b * 100} + ${c}`)] });
};
const biggest = (key, seed) => {
  const rng = makeRng(key, seed); const ds = pickN([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3, rng); const big = randInt(rng, 0, 1) === 1;
  const sorted = [...ds].sort((x, y) => y - x); const asc = [...ds].sort((x, y) => x - y);
  const maxN = Number(sorted.join(''));
  let minN; { const a = [...asc]; if (a[0] === 0) { [a[0], a[1]] = [a[1], a[0]]; } minN = Number(a.join('')); }
  const ans = big ? maxN : minN;
  const cands = big ? [Number(`${sorted[0]}${sorted[2]}${sorted[1]}`), Number(`${sorted[1]}${sorted[0]}${sorted[2]}`), minN, Number(sorted.slice().reverse().join(''))] : [Number(asc.join('')), Number(`${minN}`.split('').reverse().join('')), Number(`${String(minN)[0]}${String(minN)[2]}${String(minN)[1]}`), maxN];
  return nQ({ sig: 'bg' + ds.join('') + big, text: `${ds.join(', ')} rakamlarını birer kez kullanarak yazılabilecek en ${big ? 'büyük' : 'küçük'} üç basamaklı sayı kaçtır?`, ans, cands: cands.filter(x => x >= 100), lo: 100 });
};
const compare = (key, seed) => {
  const rng = makeRng(key, seed); const base = rand3(rng); const arr = shuffle([base, Number(String(base).split('').reverse().join('')) || base + 9, base + randInt(rng, 1, 9) * 10, base - randInt(rng, 1, 9)].map(x => Math.min(999, Math.max(100, x))), rng);
  const uniq = [...new Set(arr)]; if (uniq.length < 4) return null;
  const mode = randInt(rng, 0, 2);
  if (mode === 0) { const asc = [...uniq].sort((a, b) => a - b); return Q({ sig: 'cs' + uniq.join(), text: `${uniq.join(', ')} sayılarının küçükten büyüğe sıralanışı hangisidir?`, correct: oTxt(asc.join(' < ')), wrongs: [oTxt([...asc].reverse().join(' < ')), oTxt([asc[1], asc[0], asc[2], asc[3]].join(' < ')), oTxt([asc[0], asc[2], asc[1], asc[3]].join(' < '))] }); }
  const want = mode === 1 ? Math.max(...uniq) : Math.min(...uniq);
  return nQ({ sig: 'cm' + uniq.join() + mode, text: `Hangisi en ${mode === 1 ? 'büyük' : 'küçük'} sayıdır?`, speak: `Hangisi en ${mode === 1 ? 'büyük' : 'küçük'} sayıdır?`, ans: want, cands: uniq });
};
const rounding = (key, seed) => {
  const rng = makeRng(key, seed); const toH = rng() < 0.45; const n = toH ? randInt(rng, 101, 949) : randInt(rng, 12, 989);
  const r = toH ? Math.round(n / 100) * 100 : Math.round(n / 10) * 10;
  const cands = toH ? [Math.floor(n / 100) * 100, Math.ceil(n / 100) * 100, Math.round(n / 10) * 10, r + 100] : [Math.floor(n / 10) * 10, Math.ceil(n / 10) * 10, Math.round(n / 100) * 100, r + 10];
  if (n % (toH ? 100 : 10) === 0) return null;
  return nQ({ sig: 'rd' + n + toH, text: `${n} sayısı en yakın ${toH ? 'yüzlüğe' : 'onluğa'} yuvarlanırsa kaç olur?`, ans: r, cands });
};
const pattern = (key, seed) => {
  const rng = makeRng(key, seed); const step = pick([3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 100], rng); const up = rng() < 0.6; const len = 5;
  let start = up ? randInt(rng, 10, 300) : randInt(rng, step * (len + 1), Math.min(999, step * (len + 1) + 400));
  const seq = Array.from({ length: len + 1 }, (_, k) => start + (up ? 1 : -1) * k * step);
  const hide = randInt(rng, 2, len); const ans = seq[hide];
  const shown = seq.slice(0, len).map((x, k) => (k === hide ? '?' : x)); if (hide === len) shown.push('?');
  return nQ({ sig: 'pt' + seq.join(), text: `Örüntüde "?" yerine hangi sayı gelmelidir?\n${shown.join(', ')}`, speak: `Örüntüde soru işaretinin yerine hangi sayı gelmelidir? ${shown.join(', ').replace('?', 'soru işareti')}`, main: textPic(shown.join(', '), { size: 22, w: 320 }), ans, cands: [ans + step, ans - step, ans + 1, ans + (up ? -1 : 1) * 2 * step, ans + 10] });
};
// Romen rakamları
const ROMAN = (n) => { const m = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; m.forEach(([v, r]) => { while (n >= v) { s += r; n -= v; } }); return s; };
const roman = (key, seed) => {
  const rng = makeRng(key, seed); const n = randInt(rng, 1, 20); const toR = rng() < 0.5;
  const near = shuffle([n - 1, n + 1, n + 2, n - 2, n + 5, n - 5, n + 10].filter(x => x >= 1 && x <= 30 && x !== n), rng);
  if (toR) return Q({ sig: 'ro' + n, text: `${n} sayısının Romen rakamıyla yazılışı hangisidir?`, correct: oTxt(ROMAN(n)), wrongs: [...(ROMAN(n).includes('IV') ? [oTxt(ROMAN(n).replace('IV', 'IIII'))] : ROMAN(n).includes('IX') ? [oTxt(ROMAN(n).replace('IX', 'VIIII'))] : []), ...near.map(x => oTxt(ROMAN(x)))] });
  return nQ({ sig: 'rn' + n, text: `${ROMAN(n)} Romen rakamı hangi sayıyı gösterir?`, main: textPic(ROMAN(n), { size: 52, w: 200, font: 'Times New Roman, serif' }), ans: n, cands: near, lo: 1 });
};

// ---------------------------------------------------------------------------
// 2. DÖRT İŞLEM
// ---------------------------------------------------------------------------
const noCarryAdd = (a, b) => { let s = 0, p = 1; while (a || b) { s += ((a % 10 + b % 10) % 10) * p; a = Math.floor(a / 10); b = Math.floor(b / 10); p *= 10; } return s; };
const noBorrowSub = (a, b) => { let s = 0, p = 1; while (a || b) { s += Math.abs(a % 10 - b % 10) * p; a = Math.floor(a / 10); b = Math.floor(b / 10); p *= 10; } return s; };
const add = (key, seed) => {
  const rng = makeRng(key, seed); const a = randInt(rng, 128, 689); const b = randInt(rng, 116, 999 - a); const s = a + b;
  const mode = randInt(rng, 0, 2);
  if (mode === 0) return nQ({ sig: 'ad' + a + b, text: `${a} + ${b} = ?`, speak: `${a} artı ${b} kaç eder?`, main: textPic(`${a} + ${b} = ?`, { size: 36, w: 280 }), ans: s, cands: [noCarryAdd(a, b), s + 10, s - 10, s + 100, s - 1] });
  if (mode === 1) return nQ({ sig: 'am' + a + b, text: `${a} + ? = ${s}  Soru işareti yerine hangi sayı gelmeli?`, speak: `${a} artı kaç, ${s} eder?`, main: textPic(`${a} + ? = ${s}`, { size: 34, w: 280 }), ans: b, cands: [b + 10, b - 10, s + a, b + 1, noBorrowSub(s, a)] });
  const c = randInt(rng, 11, 99); return nQ({ sig: 'a3' + a + b + c, text: `${a} + ${c} + ${Math.min(b, 999 - a - c)} = ?`, ans: a + c + Math.min(b, 999 - a - c), cands: [a + c + Math.min(b, 999 - a - c) + 10, a + c + Math.min(b, 999 - a - c) - 10, a + Math.min(b, 999 - a - c), a + c + Math.min(b, 999 - a - c) + 100] });
};
const sub = (key, seed) => {
  const rng = makeRng(key, seed); let a = randInt(rng, 302, 999); let b = randInt(rng, 108, a - 50);
  if ((a % 10) >= (b % 10)) b = b - (b % 10) + Math.min(9, (a % 10) + randInt(rng, 1, 5)); if (b >= a) b = a - randInt(rng, 17, 99);
  const d = a - b; const mode = randInt(rng, 0, 2);
  if (mode === 0) return nQ({ sig: 'sb' + a + b, text: `${a} - ${b} = ?`, speak: `${a} eksi ${b} kaç eder?`, main: textPic(`${a} - ${b} = ?`, { size: 36, w: 280 }), ans: d, cands: [noBorrowSub(a, b), d + 10, d - 10, d + 100, a + b] });
  if (mode === 1) return nQ({ sig: 'sm' + a + b, text: `? - ${b} = ${d}  Soru işareti yerine hangi sayı gelmeli?`, speak: `Hangi sayıdan ${b} çıkarırsak ${d} kalır?`, main: textPic(`? - ${b} = ${d}`, { size: 34, w: 280 }), ans: a, cands: [d - b > 0 ? d - b : a + 20, a + 10, a - 10, noCarryAdd(d, b)] });
  return nQ({ sig: 'sk' + a + b, text: `${a} sayısının ${b} eksiği kaçtır?`, ans: d, cands: [a + b, d + 10, d - 10, noBorrowSub(a, b)] });
};
const mult = (key, seed) => {
  const rng = makeRng(key, seed); const mode = randInt(rng, 0, 3);
  if (mode === 0) { const a = randInt(rng, 3, 9), b = randInt(rng, 3, 10); const p = a * b; return nQ({ sig: 'mt' + a + b, text: `${a} x ${b} = ?`, speak: `${a} çarpı ${b} kaç eder?`, main: textPic(`${a} × ${b} = ?`, { size: 40, w: 240 }), ans: p, cands: [p + a, p - a, p + b, a + b, p - b] }); }
  if (mode === 1) { const a = randInt(rng, 12, 49), b = randInt(rng, 2, 9); const p = a * b; const wrongNoCarry = (Math.floor(a / 10) * b % 10) * 10 + (a % 10) * b % 10; return nQ({ sig: 'm2' + a + b, text: `${a} x ${b} = ?`, speak: `${a} çarpı ${b} kaç eder?`, main: textPic(`${a} × ${b} = ?`, { size: 40, w: 240 }), ans: p, cands: [p + 10, p - 10, wrongNoCarry, p + b, a * (b + 1)] }); }
  if (mode === 2) { const a = randInt(rng, 2, 99), m = pick([10, 100], rng); if (a * m > 9999) return null; const p = a * m; return nQ({ sig: 'm10' + a + m, text: `${a} x ${m} = ?`, ans: p, cands: [p * 10, p / 10, a + m, p + m] }); }
  const a = randInt(rng, 3, 9), b = randInt(rng, 3, 9); const p = a * b; return nQ({ sig: 'mm' + a + b, text: `${a} x ? = ${p}  Soru işareti yerine hangi sayı gelmeli?`, speak: `${a} çarpı kaç, ${p} eder?`, main: textPic(`${a} × ? = ${p}`, { size: 38, w: 260 }), ans: b, cands: [b + 1, b - 1, p - a, a, b + 2] });
};
const divide = (key, seed) => {
  const rng = makeRng(key, seed); const mode = randInt(rng, 0, 2);
  if (mode === 0) { const b = randInt(rng, 2, 9), q = randInt(rng, 3, 10); const a = b * q; return nQ({ sig: 'dv' + a + b, text: `${a} ÷ ${b} = ?`, speak: `${a} bölü ${b} kaç eder?`, main: textPic(`${a} ÷ ${b} = ?`, { size: 40, w: 240 }), ans: q, cands: [q + 1, q - 1, a - b, b, q + 2] }); }
  if (mode === 1) { const b = randInt(rng, 2, 9), q = randInt(rng, 11, 30); const a = b * q; if (a > 99) return null; return nQ({ sig: 'd2' + a + b, text: `${a} ÷ ${b} = ?`, ans: q, cands: [q + 1, q - 1, q + 10, a - b] }); }
  const b = randInt(rng, 3, 9), q = randInt(rng, 3, 9), r = randInt(rng, 1, b - 1); const a = b * q + r;
  return Q({ sig: 'dr' + a + b, text: `${a} ÷ ${b} işleminde bölüm ve kalan kaçtır?`, speak: `${a} bölü ${b} işleminde bölüm ve kalan kaçtır?`, correct: oTxt(`bölüm ${q}, kalan ${r}`), wrongs: [oTxt(`bölüm ${q + 1}, kalan ${r}`), oTxt(`bölüm ${q}, kalan ${r + b <= 9 ? r + 1 : r - 1 || 0}`), oTxt(`bölüm ${r}, kalan ${q}`), oTxt(`bölüm ${q - 1}, kalan ${r + b}`)] });
};
// Problemler (sesli okunur)
const NAMES = ['Ali', 'Elif', 'Can', 'Zeynep', 'Ece', 'Mert', 'Defne', 'Emir', 'Ada', 'Kerem', 'Asel', 'Yusuf'];
const PROB = [
  (rng) => { const n = pick(NAMES, rng); const a = randInt(rng, 120, 450), b = randInt(rng, 60, 300); return { t: `${n}'in ${a} pulu vardı. Arkadaşı ona ${b} pul daha verdi. ${n}'in kaç pulu oldu?`, a: a + b, c: [a - b, a + b + 10, noCarryAdd(a, b), a + b - 10] }; },
  (rng) => { const a = randInt(rng, 300, 900), b = randInt(rng, 120, a - 40); return { t: `Bir kütüphanede ${a} kitap vardı. ${b} kitap ödünç verildi. Kütüphanede kaç kitap kaldı?`, a: a - b, c: [a + b, a - b + 10, noBorrowSub(a, b), a - b - 10] }; },
  (rng) => { const k = randInt(rng, 4, 9), s = randInt(rng, 6, 12); return { t: `Bir otobüste ${k} sıra var. Her sırada ${s} öğrenci oturuyor. Otobüste kaç öğrenci var?`, a: k * s, c: [k + s, k * s + k, k * s - s, k * (s + 1)] }; },
  (rng) => { const b = randInt(rng, 3, 9), q = randInt(rng, 4, 10); return { t: `${b * q} elma ${b} sepete eşit olarak dağıtılıyor. Her sepette kaç elma olur?`, a: q, c: [q + 1, q - 1, b * q - b, b] }; },
  (rng) => { const n = pick(NAMES, rng); const p = randInt(rng, 15, 40), k = randInt(rng, 3, 6), m = 200; if (p * k >= m) return null; return { t: `${n} tanesi ${p} lira olan kalemlerden ${k} tane aldı. Kasiyere ${m} lira verdi. Kaç lira para üstü alır?`, a: m - p * k, c: [p * k, m - p, m - p * k + 10, m - p - k] }; },
  (rng) => { const a = randInt(rng, 150, 400), b = randInt(rng, 50, 150); return { t: `Bir çiftlikte ${a} tavuk var. Ördeklerin sayısı tavuklardan ${b} eksiktir. Çiftlikte toplam kaç tavuk ve ördek vardır?`, a: a + (a - b), c: [a - b, a + b, 2 * a + b, a + (a - b) + 10] }; },
  (rng) => { const n = pick(NAMES, rng); const d = randInt(rng, 12, 35); return { t: `${n} her gün ${d} sayfa kitap okuyor. Bir haftada kaç sayfa okur?`, a: d * 7, c: [d + 7, d * 7 + 7, d * 6, d * 7 - 10] }; },
  (rng) => { const t = randInt(rng, 4, 9) * 6; return { t: `Bir sınıfta ${t} öğrenci var. Öğrencilerin üçte biri gözlüklüdür. Kaç öğrenci gözlüklü değildir?`, a: t - t / 3, c: [t / 3, t - 3, t / 2, t + t / 3] }; },
  (rng) => { const n = pick(NAMES, rng); const a = randInt(rng, 7, 9), b = randInt(rng, 2, 5); const big = randInt(rng, 3, 5); return { t: `${n} ${big} paket kurabiye aldı. Her pakette ${a} kurabiye var. ${n} kurabiyelerin ${b * 2} tanesini yedi. Kaç kurabiyesi kaldı?`, a: big * a - b * 2, c: [big * a, big + a - b * 2, big * a + b * 2, big * a - b] }; },
  (rng) => { const m = randInt(rng, 2, 4); const extra = randInt(rng, 10, 50); return { t: `Bir ip ${m} metre ${extra} santimetredir. Bu ip kaç santimetredir?`, a: m * 100 + extra, c: [m + extra, m * 10 + extra, m * 100 + extra * 10, (m + 1) * 100 + extra] }; }
];
const problem = (audio) => (key, seed) => {
  const rng = makeRng(key, seed); const p = pick(PROB, rng)(rng); if (!p) return null;
  const opts = uniqNums(p.a, p.c, 3, 0);
  if (audio) return Q({ sig: 'pa' + p.t, text: 'Problemi dinle ve cevabı seç. 🔊', speak: p.t, correct: oTxt(String(p.a)), wrongs: opts.map(x => oTxt(String(x))) });
  return Q({ sig: 'pr' + p.t, text: p.t, speak: p.t, correct: oTxt(String(p.a)), wrongs: opts.map(x => oTxt(String(x))) });
};
// Toplama / çarpma resimle (gruplar)
const groupPic = (key, seed) => {
  const rng = makeRng(key, seed); const e = pick(['🍎', '⭐', '🌸', '🐞', '🍓', '🎈'], rng); const k = randInt(rng, 2, 4), s = randInt(rng, 2, 5);
  const W = 300, H = 120; const cw = (W - 20) / k; let svg = '';
  for (let j = 0; j < k; j++) { svg += `<rect x="${12 + j * cw}" y="12" width="${cw - 10}" height="${H - 24}" rx="14" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>`; for (let t = 0; t < s; t++) { const cols = s <= 3 ? s : 3; const r = Math.floor(t / cols), c = t % cols; svg += `<text x="${12 + j * cw + (cw - 10) / (cols + 1) * (c + 1)}" y="${40 + r * 36}" font-size="26" text-anchor="middle" dominant-baseline="central" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji">${e}</text>`; } }
  const img = card(svg, { w: W, h: H, bg: '#ffffff' });
  return Q({ sig: 'gp' + e + k + s, text: 'Resimdeki toplam nesne sayısını gösteren çarpma işlemi hangisidir?', speak: 'Resme bak. Toplam nesne sayısını gösteren çarpma işlemi hangisidir?', main: img, correct: oTxt(`${k} x ${s} = ${k * s}`), wrongs: [oTxt(`${k} + ${s} = ${k + s}`), oTxt(`${k} x ${s + 1} = ${k * (s + 1)}`), oTxt(`${k + 1} x ${s} = ${(k + 1) * s}`), oTxt(`${s} x ${s} = ${s * s}`)].filter(o => o.text !== `${k} x ${s} = ${k * s}`) });
};

// ---------------------------------------------------------------------------
// 3. KESİRLER
// ---------------------------------------------------------------------------
const fracPic = (n, k, shape = 'circle', col = '#60a5fa') => {
  let s = '';
  if (shape === 'circle') {
    for (let j = 0; j < n; j++) { const a0 = (j / n) * 2 * Math.PI - Math.PI / 2, a1 = ((j + 1) / n) * 2 * Math.PI - Math.PI / 2; const p = (a) => `${(50 + 38 * Math.cos(a)).toFixed(2)},${(50 + 38 * Math.sin(a)).toFixed(2)}`; s += `<path d="M50,50 L${p(a0)} A38,38 0 ${n === 1 ? 1 : 0} 1 ${p(a1)} Z" fill="${j < k ? col : '#fff'}" stroke="${OL}" stroke-width="2.5"/>`; }
    if (n === 1) s = `<circle cx="50" cy="50" r="38" fill="${k ? col : '#fff'}" stroke="${OL}" stroke-width="2.5"/>`;
  } else { const w = 80 / n; for (let j = 0; j < n; j++) s += `<rect x="${10 + j * w}" y="30" width="${w}" height="40" fill="${j < k ? col : '#fff'}" stroke="${OL}" stroke-width="2.5"/>`; }
  return card(s);
};
const FR = (k, n) => `${k}/${n}`;
const fracShade = (key, seed) => {
  const rng = makeRng(key, seed); const n = pick([2, 3, 4, 5, 6, 8], rng); const k = randInt(rng, 1, n - 1); const shape = pick(['circle', 'rect'], rng);
  return Q({ sig: 'fs' + n + k + shape, text: 'Şekilde boyalı kısım bütünün kaçta kaçıdır?', speak: 'Şekilde boyalı kısım bütünün kaçta kaçıdır?', main: fracPic(n, k, shape), correct: oTxt(FR(k, n)), wrongs: [oTxt(FR(n - k, n)), oTxt(FR(n, k)), oTxt(FR(k, n + 1)), oTxt(FR(k, n - k))].filter(o => o.text !== FR(k, n)) });
};
const fracPicPick = (key, seed) => {
  const rng = makeRng(key, seed); const n = pick([3, 4, 5, 6, 8], rng); const k = randInt(rng, 1, n - 1); const shape = pick(['circle', 'rect'], rng);
  const ws = [[n - k, n], [k, n + 1 > 8 ? n - 1 : n + 1], [k + 1 < n ? k + 1 : k - 1, n], [1, 2]].filter(([a, b]) => a > 0 && a < b && !(a === k && b === n));
  return Q({ sig: 'fp' + n + k + shape, text: `${FR(k, n)} kesrini gösteren şekil hangisidir?`, speak: `${n}'de ${k} kesrini gösteren şekil hangisidir?`, correct: oImg(FR(k, n), fracPic(n, k, shape)), wrongs: ws.map(([a, b]) => oImg(FR(a, b), fracPic(b, a, shape))) });
};
const fracOf = (key, seed) => {
  const rng = makeRng(key, seed); const n = pick([2, 3, 4, 5, 6, 10], rng); const q = randInt(rng, 2, 9); const tot = n * q;
  return nQ({ sig: 'fo' + tot + n, text: `${tot} sayısının 1/${n}'i kaçtır?`, speak: `${tot} sayısının ${n}'de biri kaçtır?`, ans: q, cands: [tot - q, q + 1, tot / 2, q * 2, n] , lo: 1 });
};
const fracCompare = (key, seed) => {
  const rng = makeRng(key, seed); const [a, b, c] = pickN([2, 3, 4, 5, 6, 8, 10], 3, rng); const arr = [a, b, c, pick([2, 3, 4, 5, 6, 8, 10].filter(x => ![a, b, c].includes(x)), rng)];
  const big = rng() < 0.5; const ans = big ? Math.min(...arr) : Math.max(...arr);
  return Q({ sig: 'fc' + arr.join() + big, text: `Hangisi en ${big ? 'büyük' : 'küçük'} birim kesirdir?`, speak: `Hangisi en ${big ? 'büyük' : 'küçük'} birim kesirdir?`, correct: oTxt(`1/${ans}`), wrongs: arr.filter(x => x !== ans).map(x => oTxt(`1/${x}`)) });
};
const fracWord = (key, seed) => {
  const rng = makeRng(key, seed); const items = [['yarım', '1/2'], ['çeyrek', '1/4'], ['bütün', '4/4'], ['üçte bir', '1/3'], ['dörtte üç', '3/4'], ['iki yarım', '2/2']];
  const it = items[seed % items.length]; const all = ['1/2', '1/4', '4/4', '1/3', '3/4', '2/4', '1/5'];
  return Q({ sig: 'fw' + it[0] + seed % 4, text: `"${it[0]}" hangi kesirle gösterilir?`, speak: `${it[0]}, hangi kesirle gösterilir?`, correct: oTxt(it[1]), wrongs: shuffle(all.filter(x => x !== it[1] && !(it[0] === 'iki yarım' && x === '4/4') && !(it[0] === 'bütün' && x === '2/2')), rng).slice(0, 3).map(oTxt) });
};

// ---------------------------------------------------------------------------
// 4. ZAMAN, PARA, ÖLÇME
// ---------------------------------------------------------------------------
const clock = (h, m) => {
  let s = `<circle cx="50" cy="50" r="42" fill="#fff" stroke="${OL}" stroke-width="3"/>`;
  for (let k = 1; k <= 12; k++) { const a = (k / 12) * 2 * Math.PI - Math.PI / 2; s += T(50 + 33 * Math.cos(a), 50 + 33 * Math.sin(a), k, 9.5); }
  for (let k = 0; k < 60; k++) { const a = (k / 60) * 2 * Math.PI; const r1 = k % 5 ? 40 : 38; s += `<line x1="${50 + r1 * Math.sin(a)}" y1="${50 - r1 * Math.cos(a)}" x2="${50 + 42 * Math.sin(a)}" y2="${50 - 42 * Math.cos(a)}" stroke="#64748b" stroke-width="${k % 5 ? 0.6 : 1.4}"/>`; }
  const ha = ((h % 12) + m / 60) / 12 * 2 * Math.PI, ma = m / 60 * 2 * Math.PI;
  s += `<line x1="50" y1="50" x2="${50 + 20 * Math.sin(ha)}" y2="${50 - 20 * Math.cos(ha)}" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="50" x2="${50 + 31 * Math.sin(ma)}" y2="${50 - 31 * Math.cos(ma)}" stroke="#1d4ed8" stroke-width="2.6" stroke-linecap="round"/><circle cx="50" cy="50" r="3" fill="${OL}"/>`;
  return card(s);
};
const hhmm = (h, m) => `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
const SAAT = ['on iki', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on', 'on bir'];
const SAATI = ['on ikiyi', 'biri', 'ikiyi', 'üçü', 'dördü', 'beşi', 'altıyı', 'yediyi', 'sekizi', 'dokuzu', 'onu', 'on biri'];
const SAATE = ['on ikiye', 'bire', 'ikiye', 'üçe', 'dörde', 'beşe', 'altıya', 'yediye', 'sekize', 'dokuza', 'ona', 'on bire'];
const timeWords = (h, m) => { const hh = h % 12; if (m === 0) return `saat ${SAAT[hh]}`; if (m === 30) return `saat ${SAAT[hh]} buçuk`; if (m < 30) return `saat ${SAATI[hh]} ${m === 15 ? 'çeyrek' : sayiOku(m)} geçiyor`; return `saat ${SAATE[(hh + 1) % 12]} ${m === 45 ? 'çeyrek' : sayiOku(60 - m)} var`; };
const clockRead = (mode) => (key, seed) => {
  const rng = makeRng(key, seed); const h = randInt(rng, 1, 12); const m = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], rng);
  const alts = [[h, (m + 30) % 60], [(m / 5) || 12, h * 5 % 60], [h % 12 + 1, m], [h, (m + 5) % 60], [h === 1 ? 12 : h - 1, m]].filter(([a, b]) => !(a === h && b === m));
  if (mode === 'digital') return Q({ sig: 'cd' + h + m, text: 'Saat kaçı gösteriyor?', speak: 'Saat kaçı gösteriyor?', main: clock(h, m), correct: oTxt(hhmm(h, m)), wrongs: alts.map(([a, b]) => oTxt(hhmm(a, b))) });
  if (mode === 'audio') return Q({ sig: 'ca' + h + m, text: 'Saat kaçı gösteriyor? Şıkları dinle.', speak: 'Saat kaçı gösteriyor? Şıkları dinle.', main: clock(h, m), correct: oAud(timeWords(h, m)), wrongs: alts.map(([a, b]) => oAud(timeWords(a, b))), audioOpts: true });
  return Q({ sig: 'cp' + h + m, text: `"${timeWords(h, m)}" hangi saatte gösterilmiştir?`, speak: `${timeWords(h, m)}. Hangi saat?`, correct: oImg(h + ':' + m, clock(h, m)), wrongs: alts.slice(0, 3).map(([a, b]) => oImg(a + ':' + b, clock(a, b))) });
};
const timeCalc = (key, seed) => {
  const rng = makeRng(key, seed); const t = randInt(rng, 0, 5);
  if (t === 0) { const h = randInt(rng, 1, 5); return nQ({ sig: 'tc0' + h, text: `${h} saat kaç dakikadır?`, ans: h * 60, cands: [h * 100, h * 30, h * 60 + 60, h * 24] }); }
  if (t === 1) { const w = randInt(rng, 2, 8); return nQ({ sig: 'tc1' + w, text: `${w} hafta kaç gündür?`, ans: w * 7, cands: [w * 5, w * 7 + 7, w * 30, w + 7] }); }
  if (t === 2) { const y = randInt(rng, 2, 4); return nQ({ sig: 'tc2' + y, text: `${y} yıl kaç aydır?`, ans: y * 12, cands: [y * 10, y * 12 + 12, y * 365, y * 7] }); }
  if (t === 3) { const h = randInt(rng, 8, 15), m = pick([0, 15, 30, 45], rng), d = pick([20, 35, 45, 50, 75, 90], rng); const e = h * 60 + m + d; return Q({ sig: 'tc3' + h + m + d, text: `Ders saat ${hhmm(h, m)}'da başladı ve ${d} dakika sürdü. Ders saat kaçta bitti?`, correct: oTxt(hhmm(Math.floor(e / 60), e % 60)), wrongs: [oTxt(hhmm(h, (m + d) % 100 < 60 ? (m + d) % 100 : (m + d) % 60)), oTxt(hhmm(Math.floor(e / 60) + 1, e % 60)), oTxt(hhmm(h + Math.floor(d / 10), m)), oTxt(hhmm(Math.floor(e / 60), (e % 60 + 10) % 60))] }); }
  if (t === 4) { const d = randInt(rng, 2, 4); return nQ({ sig: 'tc4' + d, text: `${d} gün kaç saattir?`, ans: d * 24, cands: [d * 12, d * 60, d * 24 + 24, d * 7] }); }
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']; const s = randInt(rng, 0, 6), add = randInt(rng, 3, 12);
  return Q({ sig: 'tc5' + s + add, text: `Bugün ${days[s]}. ${add} gün sonra hangi gün olur?`, correct: oTxt(days[(s + add) % 7]), wrongs: [oTxt(days[(s + add + 1) % 7]), oTxt(days[(s + add + 6) % 7]), oTxt(days[(s + add + 2) % 7])] });
};
const MONEY = [[200, 'TL', '#a855f7', 'n'], [100, 'TL', '#3b82f6', 'n'], [50, 'TL', '#f97316', 'n'], [20, 'TL', '#22c55e', 'n'], [10, 'TL', '#ef4444', 'n'], [5, 'TL', '#a16207', 'n'], [1, 'TL', '#facc15', 'c'], [50, 'kr', '#cbd5e1', 'c'], [25, 'kr', '#fbbf24', 'c'], [10, 'kr', '#d4d4d8', 'c'], [5, 'kr', '#fde68a', 'c']];
const moneyPic = (items) => {
  const W = 320; let x = 10, y = 10, s = ''; const rowH = 52;
  items.forEach(it => {
    const w = it[3] === 'n' ? 92 : 46; if (x + w > W - 8) { x = 10; y += rowH; }
    s += it[3] === 'n' ? `<rect x="${x}" y="${y}" width="${w - 6}" height="44" rx="6" fill="${it[2]}" stroke="${OL}" stroke-width="2"/><rect x="${x + 6}" y="${y + 6}" width="${w - 18}" height="32" rx="4" fill="#fff" opacity=".35"/>${T(x + (w - 6) / 2, y + 22, `${it[0]} TL`, 17)}` : `<circle cx="${x + 20}" cy="${y + 22}" r="20" fill="${it[2]}" stroke="${OL}" stroke-width="2"/>${T(x + 20, y + 22, it[1] === 'TL' ? '1₺' : `${it[0]}kr`, it[1] === 'TL' ? 13 : 10.5)}`;
    x += w;
  });
  return card(s, { w: W, h: y + rowH + 6, bg: '#f8fafc' });
};
const money = (key, seed) => {
  const rng = makeRng(key, seed); const mode = randInt(rng, 0, 2);
  if (mode < 2) {
    const n = randInt(rng, 3, 6); const items = Array.from({ length: n }, () => pick(MONEY.slice(mode === 0 ? 1 : 3, mode === 0 ? 7 : 11), rng)).sort((a, b) => (b[1] === 'TL' ? b[0] * 100 : b[0]) - (a[1] === 'TL' ? a[0] * 100 : a[0]));
    const kr = items.reduce((t, it) => t + (it[1] === 'TL' ? it[0] * 100 : it[0]), 0); const f = (v) => (v % 100 ? `${Math.floor(v / 100)} TL ${v % 100} kr` : `${v / 100} TL`);
    return Q({ sig: 'mn' + items.map(i => i[0] + i[1]).join(), text: 'Resimdeki paraların toplamı ne kadardır?', speak: 'Resimdeki paraların toplamı ne kadardır?', main: moneyPic(items), correct: oTxt(f(kr)), wrongs: [f(kr + 100), f(kr - (kr > 600 ? 500 : 50)), f(kr + 1000), f(kr + 50), f(Math.max(5, kr - 25))].filter(x => x !== f(kr)).map(oTxt) });
  }
  const tl = randInt(rng, 1, 9), k = pick([25, 50, 75], rng); const tot = tl * 100 + k;
  return nQ({ sig: 'mk' + tot, text: `${tl} TL ${k} kuruş kaç kuruştur?`, ans: tot, cands: [tl + k, tl * 10 + k, tot + 100, tl * 1000 + k], unit: ' kr' });
};
const measure = (key, seed) => {
  const rng = makeRng(key, seed); const t = randInt(rng, 0, 7);
  if (t === 0) { const m = randInt(rng, 2, 9), c = randInt(rng, 5, 95); return nQ({ sig: 'u0' + m + c, text: `${m} m ${c} cm kaç santimetredir?`, ans: m * 100 + c, cands: [m + c, m * 10 + c, (m + 1) * 100 + c, m * 100 + c * 10], unit: ' cm' }); }
  if (t === 1) { const c = randInt(rng, 2, 9) * 100; return nQ({ sig: 'u1' + c, text: `${c} cm kaç metredir?`, ans: c / 100, cands: [c / 10, c, c / 100 + 1, c / 1000], unit: ' m' }); }
  if (t === 2) { const k = randInt(rng, 2, 8); return nQ({ sig: 'u2' + k, text: `${k} kilogram kaç gramdır?`, ans: k * 1000, cands: [k * 100, k * 10, k * 1000 + 100, k * 10000], unit: ' g' }); }
  if (t === 3) { const l = randInt(rng, 2, 9); return nQ({ sig: 'u3' + l, text: `${l} litre kaç mililitredir?`, ans: l * 1000, cands: [l * 100, l * 10, l * 1000 + 500, l * 10000], unit: ' mL' }); }
  if (t === 4) { const h = pick([['yarım kilogram', 500], ['çeyrek kilogram', 250], ['yarım litre', 500], ['çeyrek litre', 250]], rng); return nQ({ sig: 'u4' + h[0], text: `${h[0]} kaç ${h[0].includes('litre') ? 'mililitre' : 'gram'}dır?`, ans: h[1], cands: [h[1] * 2, h[1] / 5, 100, 750, 50], unit: h[0].includes('litre') ? ' mL' : ' g' }); }
  if (t === 5) { const items = [['Bir kalemin boyu', 'santimetre', ['metre', 'kilogram', 'litre']], ['Okul bahçesinin uzunluğu', 'metre', ['santimetre', 'gram', 'mililitre']], ['Bir karpuzun ağırlığı', 'kilogram', ['gram', 'metre', 'litre']], ['Bir kaşık şurup', 'mililitre', ['litre', 'kilogram', 'metre']], ['Bir sürahi su', 'litre', ['mililitre', 'gram', 'santimetre']], ['Bir silginin ağırlığı', 'gram', ['kilogram', 'metre', 'litre']]]; const it = pick(items, rng); return Q({ sig: 'u5' + it[0], text: `${it[0]} hangi birimle ölçülür?`, correct: oTxt(it[1]), wrongs: it[2].map(oTxt) }); }
  if (t === 6) { const kg = randInt(rng, 1, 3), a = randInt(rng, 3, 9) * 100 + pick([0, 50], rng); return nQ({ sig: 'u6' + kg + a, text: `${kg} kilogram undan ${a} gram kullanıldı. Kaç gram un kaldı?`, ans: kg * 1000 - a, cands: [a, kg * 1000 + a, kg * 1000 - a + 100, kg * 100 - a / 10, kg * 1000 - a - 100] }); }
  const p = randInt(rng, 2, 5), s = pick([250, 500, 200], rng); return nQ({ sig: 'u7' + p + s, text: `${s} mL'lik ${p * 2} şişe su kaç mL eder?`, ans: s * p * 2, cands: [s + p * 2, s * p, s * p * 2 + s, s * 10] });
};

// ---------------------------------------------------------------------------
// 5. GEOMETRİ VE VERİ
// ---------------------------------------------------------------------------
const POLY = { üçgen: 3, kare: 4, dikdörtgen: 4, beşgen: 5, altıgen: 6, sekizgen: 8 };
const polyPic = (name, col = '#a5b4fc') => {
  if (name === 'dikdörtgen') return card(`<rect x="12" y="28" width="76" height="44" fill="${col}" stroke="${OL}" stroke-width="3"/>`);
  if (name === 'kare') return card(`<rect x="20" y="20" width="60" height="60" fill="${col}" stroke="${OL}" stroke-width="3"/>`);
  if (name === 'daire') return card(`<circle cx="50" cy="50" r="34" fill="${col}" stroke="${OL}" stroke-width="3"/>`);
  const n = POLY[name]; const pts = Array.from({ length: n }, (_, k) => { const a = (k / n) * 2 * Math.PI - Math.PI / 2 + (n % 2 ? 0 : Math.PI / n); return `${(50 + 36 * Math.cos(a)).toFixed(1)},${(52 + 36 * Math.sin(a)).toFixed(1)}`; }).join(' ');
  return card(`<polygon points="${pts}" fill="${col}" stroke="${OL}" stroke-width="3"/>`);
};
const SOLIDS = {
  küp: `<polygon points="25,35 60,35 60,80 25,80" fill="#93c5fd" stroke="${OL}" stroke-width="2.5"/><polygon points="25,35 40,20 75,20 60,35" fill="#bfdbfe" stroke="${OL}" stroke-width="2.5"/><polygon points="60,35 75,20 75,65 60,80" fill="#60a5fa" stroke="${OL}" stroke-width="2.5"/>`,
  'kare prizma': `<polygon points="30,30 55,30 55,85 30,85" fill="#86efac" stroke="${OL}" stroke-width="2.5"/><polygon points="30,30 42,18 67,18 55,30" fill="#bbf7d0" stroke="${OL}" stroke-width="2.5"/><polygon points="55,30 67,18 67,73 55,85" fill="#4ade80" stroke="${OL}" stroke-width="2.5"/>`,
  'dikdörtgenler prizması': `<polygon points="14,40 70,40 70,78 14,78" fill="#fca5a5" stroke="${OL}" stroke-width="2.5"/><polygon points="14,40 30,26 86,26 70,40" fill="#fecaca" stroke="${OL}" stroke-width="2.5"/><polygon points="70,40 86,26 86,64 70,78" fill="#f87171" stroke="${OL}" stroke-width="2.5"/>`,
  silindir: `<path d="M28,28 L28,74 A22,8 0 0 0 72,74 L72,28" fill="#fde68a" stroke="${OL}" stroke-width="2.5"/><ellipse cx="50" cy="28" rx="22" ry="8" fill="#fef3c7" stroke="${OL}" stroke-width="2.5"/>`,
  küre: `<circle cx="50" cy="52" r="32" fill="#c4b5fd" stroke="${OL}" stroke-width="2.5"/><ellipse cx="50" cy="52" rx="32" ry="9" fill="none" stroke="${OL}" stroke-width="1.2" stroke-dasharray="4 3"/><ellipse cx="40" cy="40" rx="8" ry="5" fill="#fff" opacity=".5"/>`,
  koni: `<path d="M50,14 L24,78 A26,8 0 0 0 76,78 Z" fill="#fdba74" stroke="${OL}" stroke-width="2.5"/><path d="M24,78 A26,8 0 0 1 76,78" fill="none" stroke="${OL}" stroke-width="1.2" stroke-dasharray="4 3"/>`,
  'kare piramit': `<polygon points="50,14 20,74 60,84" fill="#fcd34d" stroke="${OL}" stroke-width="2.5"/><polygon points="50,14 60,84 84,66" fill="#f59e0b" stroke="${OL}" stroke-width="2.5"/>`,
  'üçgen prizma': `<polygon points="20,80 40,40 60,80" fill="#a5f3fc" stroke="${OL}" stroke-width="2.5"/><polygon points="40,40 70,22 90,62 60,80" fill="#67e8f9" stroke="${OL}" stroke-width="2.5"/>`
};
const SOLID_INFO = { küp: [6, 12, 8], 'kare prizma': [6, 12, 8], 'dikdörtgenler prizması': [6, 12, 8], 'kare piramit': [5, 8, 5], 'üçgen prizma': [5, 9, 6] };
const REAL = { küp: ['🎲', 'zar'], silindir: ['🥫', 'konserve kutusu'], küre: ['⚽', 'top'], koni: ['🍦', 'dondurma külahı'], 'dikdörtgenler prizması': ['📦', 'kutu'] };
const geoShape = (key, seed) => {
  const rng = makeRng(key, seed); const t = randInt(rng, 0, 4); const names = Object.keys(POLY);
  if (t === 0) { const nm = pick(names, rng); return nQ({ sig: 'g0' + nm, text: 'Bu şeklin kaç kenarı vardır?', speak: 'Resimdeki şeklin kaç kenarı vardır?', main: polyPic(nm), ans: POLY[nm], cands: [POLY[nm] + 1, POLY[nm] - 1, POLY[nm] + 2, POLY[nm] * 2] , lo: 2}); }
  if (t === 1) { const nm = pick(names, rng); return Q({ sig: 'g1' + nm, text: 'Bu şeklin adı nedir?', speak: 'Resimdeki şeklin adı nedir? Şıkları dinle.', main: polyPic(nm), correct: oAud(nm), wrongs: shuffle(names.filter(x => x !== nm && POLY[x] !== POLY[nm]), rng).slice(0, 3).map(x => oAud(x)), audioOpts: true }); }
  if (t === 2) { const sol = pick(Object.keys(SOLIDS), rng); return Q({ sig: 'g2' + sol, text: 'Resimdeki geometrik cismin adı nedir?', main: card(SOLIDS[sol]), correct: oTxt(sol), wrongs: shuffle(Object.keys(SOLIDS).filter(x => x !== sol && !(sol.includes('prizma') && x === 'küp') && !(sol === 'küp' && x === 'kare prizma')), rng).slice(0, 3).map(oTxt) }); }
  if (t === 3) { const sol = pick(Object.keys(SOLID_INFO), rng); const what = randInt(rng, 0, 2); const lbl = ['yüzü', 'ayrıtı', 'köşesi'][what]; const ans = SOLID_INFO[sol][what]; return nQ({ sig: 'g3' + sol + what, text: `${sol[0].toUpperCase() + sol.slice(1)} cisminin kaç ${lbl} vardır?`, main: card(SOLIDS[sol]), ans, cands: [...SOLID_INFO[sol].filter(x => x !== ans), ans + 2, ans - 1], lo: 1 }); }
  const sol = pick(Object.keys(REAL), rng); return Q({ sig: 'g4' + sol, text: `${REAL[sol][1][0].toUpperCase() + REAL[sol][1].slice(1)} hangi geometrik cisme benzer?`, main: pic(REAL[sol][0]), correct: oImg(sol, card(SOLIDS[sol])), wrongs: shuffle(Object.keys(REAL).filter(x => x !== sol), rng).slice(0, 3).map(x => oImg(x, card(SOLIDS[x]))) });
};
const perimeter = (key, seed) => {
  const rng = makeRng(key, seed); const t = randInt(rng, 0, 2);
  if (t === 0) { const a = randInt(rng, 4, 15), b = randInt(rng, 2, a - 1); const img = card(`<rect x="20" y="30" width="110" height="${30 + b * 3}" fill="#e0e7ff" stroke="${OL}" stroke-width="3"/>${T(75, 22, `${a} cm`, 13)}${T(150, 30 + (30 + b * 3) / 2, `${b} cm`, 13)}`, { w: 175, h: 60 + 30 + b * 3 }); return nQ({ sig: 'p0' + a + b, text: 'Dikdörtgenin çevre uzunluğu kaç santimetredir?', speak: `Kısa kenarı ${b}, uzun kenarı ${a} santimetre olan dikdörtgenin çevre uzunluğu kaç santimetredir?`, main: img, ans: 2 * (a + b), cands: [a + b, a * b, 2 * a + b, 4 * a], unit: ' cm' }); }
  if (t === 1) { const a = randInt(rng, 3, 25); return nQ({ sig: 'p1' + a, text: `Bir kenarı ${a} cm olan karenin çevre uzunluğu kaç cm'dir?`, ans: 4 * a, cands: [2 * a, a * a, 3 * a, 4 * a + 4], unit: ' cm' }); }
  const s = [randInt(rng, 3, 12), randInt(rng, 3, 12), randInt(rng, 3, 12)]; if (s[0] + s[1] <= s[2] || s[0] + s[2] <= s[1] || s[1] + s[2] <= s[0]) return null; const tot = s[0] + s[1] + s[2];
  return nQ({ sig: 'p2' + s.join(), text: `Kenarları ${s.join(' cm, ')} cm olan üçgenin çevre uzunluğu kaç cm'dir?`, ans: tot, cands: [tot + 1, tot - 2, s[0] + s[1], tot * 2], unit: ' cm' });
};
// Veri: sütun grafiği
const FRUITS = [['🍎', 'elma'], ['🍌', 'muz'], ['🍓', 'çilek'], ['🍊', 'portakal'], ['🍇', 'üzüm'], ['🍐', 'armut']];
const barChart = (cats, vals, unit) => {
  const W = 300, H = 210; const max = Math.max(...vals); const step = max > 10 ? (max > 20 ? 5 : 2) : 1; const top = Math.ceil(max / step) * step; const bh = 150 / top;
  let s = `<line x1="40" y1="20" x2="40" y2="172" stroke="${OL}" stroke-width="2"/><line x1="40" y1="172" x2="290" y2="172" stroke="${OL}" stroke-width="2"/>`;
  for (let v = 0; v <= top; v += step) s += `<line x1="36" y1="${172 - v * bh}" x2="290" y2="${172 - v * bh}" stroke="#e2e8f0" stroke-width="1"/>${T(24, 172 - v * bh, v, 10)}`;
  const cw = 250 / cats.length; const cols = ['#f87171', '#facc15', '#f472b6', '#fb923c', '#a78bfa', '#4ade80'];
  cats.forEach((c, k) => { s += `<rect x="${48 + k * cw + cw * 0.15}" y="${172 - vals[k] * bh}" width="${cw * 0.7}" height="${vals[k] * bh}" fill="${cols[k % 6]}" stroke="${OL}" stroke-width="1.5"/><text x="${48 + k * cw + cw / 2}" y="190" font-size="18" text-anchor="middle" dominant-baseline="central" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji">${c[0]}</text>`; });
  s += T(150, 10, unit, 10, '#475569');
  return card(s, { w: W, h: H + 4 });
};
const dataQ = (key, seed) => {
  const rng = makeRng(key, seed); const cats = pickN(FRUITS, 4, rng); const big = rng() < 0.5; const vals = cats.map(() => (big ? randInt(rng, 2, 12) * 2 : randInt(rng, 1, 10)));
  if (new Set(vals).size < 4) return null; const img = barChart(cats, vals, 'öğrenci sayısı');
  const t = randInt(rng, 0, 3); const intro = 'Grafikte öğrencilerin en sevdiği meyveler gösterilmiştir. ';
  if (t === 0) { const mi = vals.indexOf(Math.max(...vals)); return Q({ sig: 'd0' + vals.join() + cats.map(c => c[1]).join(), text: intro + 'En çok sevilen meyve hangisidir?', main: img, correct: oTxt(cats[mi][1]), wrongs: cats.filter((_, k) => k !== mi).map(c => oTxt(c[1])) }); }
  if (t === 1) { const tot = vals.reduce((a, b) => a + b, 0); return nQ({ sig: 'd1' + vals.join() + cats.map(c => c[1]).join(), text: intro + 'Ankete toplam kaç öğrenci katılmıştır?', main: img, ans: tot, cands: [tot + 2, tot - 3, Math.max(...vals) * 4, tot + 10] }); }
  if (t === 2) { const [a, b] = pickN([0, 1, 2, 3], 2, rng); const d = Math.abs(vals[a] - vals[b]); return nQ({ sig: 'd2' + vals.join() + a + b, text: `${intro}${cats[a][1]} ve ${cats[b][1]} sevenlerin sayıları arasındaki fark kaçtır?`, main: img, ans: d, cands: [vals[a] + vals[b], d + 1, d + 2, Math.max(vals[a], vals[b])] }); }
  const k = randInt(rng, 0, 3); return nQ({ sig: 'd3' + vals.join() + k, text: `${intro}${cats[k][1]} seven kaç öğrenci vardır?`, main: img, ans: vals[k], cands: [...vals.filter(v => v !== vals[k]), vals[k] + 1] });
};
const tally = (key, seed) => {
  const rng = makeRng(key, seed); const n = randInt(rng, 6, 23); let s = ''; let x = 14;
  for (let k = 0; k < Math.floor(n / 5); k++) { for (let j = 0; j < 4; j++) s += `<line x1="${x + j * 8}" y1="18" x2="${x + j * 8}" y2="62" stroke="${OL}" stroke-width="3"/>`; s += `<line x1="${x - 5}" y1="56" x2="${x + 29}" y2="24" stroke="#ef4444" stroke-width="3"/>`; x += 46; }
  for (let j = 0; j < n % 5; j++) s += `<line x1="${x + j * 8}" y1="18" x2="${x + j * 8}" y2="62" stroke="${OL}" stroke-width="3"/>`;
  return nQ({ sig: 'tl' + n, text: 'Çetele tablosundaki çizgiler kaç sayısını gösterir?', main: card(s, { w: Math.max(120, x + 50), h: 80 }), ans: n, cands: [n + 1, n - 1, n + 5, Math.floor(n / 5) + n % 5] });
};
const countVis = (key, seed) => { // hızlı sayma: gruplu nesneler
  const rng = makeRng(key, seed); const e = pick(['🐞', '🍒', '⭐', '🐟', '🌼'], rng); const n = randInt(rng, 11, 20);
  return nQ({ sig: 'cv' + e + n, text: 'Resimde kaç tane var? Dikkatlice say.', main: countPic(e, n), ans: n, cands: [n + 1, n - 1, n + 2, n - 2] });
};

// ---------------------------------------------------------------------------
export const MATH_TOPICS = [
  topic('mat_sayi', '1. Doğal Sayılar (üç basamaklı)', 'indigo', [
    kind('mat_sayi_oku', 'Okuma - Yazma', [g('sayi_oku', 'Sayının okunuşu (yazılı şık)', readNum, 14), g('sayi_dinle', 'Sesli sayı → rakamla yazılış', listenNum, 14), g('sayi_sesli', 'Sayı → sesli şık', audioNum, 12)]),
    kind('mat_sayi_bas', 'Basamak ve Çözümleme', [g('sayi_bas', 'Basamak değeri', placeValue, 18), g('sayi_coz', 'Çözümleme', expand, 14), g('sayi_buyuk', 'En büyük / en küçük sayı', biggest, 14)]),
    kind('mat_sayi_kar', 'Karşılaştırma ve Yuvarlama', [g('sayi_kar', 'Karşılaştırma - sıralama', compare, 14), g('sayi_yuv', 'Yuvarlama', rounding, 14)])
  ]),
  topic('mat_oruntu', '2. Örüntüler ve Romen Rakamları', 'violet', [
    kind('mat_oruntu_k', 'Örüntüler', [g('oruntu', 'Sayı örüntüleri', pattern, 24)]),
    kind('mat_roma_k', 'Romen Rakamları', [g('roma', 'Romen rakamları (1-20)', roman, 16)])
  ]),
  topic('mat_topla', '3. Toplama ve Çıkarma', 'emerald', [
    kind('mat_topla_k', 'Toplama', [g('topla', 'Eldeli toplama / eksik terim', add, 30)]),
    kind('mat_cikar_k', 'Çıkarma', [g('cikar', 'Onluk bozmalı çıkarma / eksik terim', sub, 30)])
  ]),
  topic('mat_carp', '4. Çarpma ve Bölme', 'orange', [
    kind('mat_carp_k', 'Çarpma', [g('carp', 'Çarpma işlemi', mult, 30), g('carp_resim', 'Resimle çarpma', groupPic, 12)]),
    kind('mat_bol_k', 'Bölme', [g('bol', 'Bölme (kalanlı / kalansız)', divide, 28)])
  ]),
  topic('mat_problem', '5. Problemler', 'rose', [
    kind('mat_problem_k', 'Problemler', [g('problem_yazili', 'Yazılı problem', problem(false), 30), g('problem_sesli', 'Sesli problem (dinle)', problem(true), 26)])
  ]),
  topic('mat_kesir', '6. Kesirler', 'sky', [
    kind('mat_kesir_k', 'Kesirler', [g('kesir_boya', 'Boyalı kısım kaçta kaç?', fracShade, 16), g('kesir_sekil', 'Kesri gösteren şekil', fracPicPick, 14), g('kesir_cokluk', 'Bir çokluğun kesri', fracOf, 14), g('kesir_kar', 'Birim kesir karşılaştırma', fracCompare, 10), g('kesir_ad', 'Yarım, çeyrek, bütün', fracWord, 8)])
  ]),
  topic('mat_zaman', '7. Zaman Ölçme', 'amber', [
    kind('mat_zaman_k', 'Saat ve Zaman', [g('saat_yaz', 'Saati oku (yazılı şık)', clockRead('digital'), 16), g('saat_ses', 'Saati oku (sesli şık)', clockRead('audio'), 14), g('saat_resim', 'Söyleneni gösteren saat', clockRead('pic'), 12), g('zaman_hesap', 'Zaman birimleri ve hesap', timeCalc, 16)])
  ]),
  topic('mat_para', '8. Paralarımız', 'lime', [
    kind('mat_para_k', 'Paralarımız', [g('para', 'TL ve kuruş', money, 26)])
  ]),
  topic('mat_olcme', '9. Uzunluk, Tartma, Sıvı Ölçme', 'teal', [
    kind('mat_olcme_k', 'Ölçme', [g('olcme', 'Birim dönüşümü ve problemler', measure, 36)])
  ]),
  topic('mat_geo', '10. Geometrik Şekiller ve Cisimler', 'purple', [
    kind('mat_geo_k', 'Şekil ve Cisim', [g('geo', 'Şekiller ve cisimler', geoShape, 28), g('cevre', 'Çevre uzunluğu', perimeter, 24)])
  ]),
  topic('mat_veri', '11. Veri ve Grafik', 'cyan', [
    kind('mat_veri_k', 'Veri', [g('grafik', 'Sütun grafiği', dataQ, 24), g('cetele', 'Çetele tablosu', tally, 10), g('sayma', 'Görsel sayma', countVis, 8)])
  ])
];

export const MATH_BANK = makeSubjectBank({
  id: 'mat',
  title: 'matematik (3. sınıf)',
  intro: '11 konu, toplam 1000 hazır soru. Problemler ve bazı sorular telefonla sesli okunur; saat, kesir, grafik, para ve şekil soruları resimlidir; sayı okunuşu ve saat sorularının bir kısmında şıklar sesli okunur.',
  rootFolder: 'Matematik (3. Sınıf)',
  topics: MATH_TOPICS,
  total: 1000
});
