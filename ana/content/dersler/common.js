// ============================================================================
// --- DERS BANKALARI (3. SINIF) İÇİN ORTAK ARAÇLAR ---
// ============================================================================
// İngilizce, Matematik, Türkçe, Hayat Bilgisi ve Fen Bilimleri bankaları bu dosyayı kullanır.
// Her banka: konular (kategori) › soru türleri (kavram) › kalıplar (grup) › hazır sorular.
//
// Soru biçimleri (hepsi karışık kullanılır):
//   • yazılı soru + yazılı şık          • yazılı soru + resimli şık
//   • resimli soru + yazılı şık         • sesli soru (telefon okur) + resimli şık
//   • sesli soru + yazılı şık           • sesli soru + sesli şık (şıklar dinlenir)
//   • resimli soru + sesli şık
// Sesli okuma: soru metni (speak) telefonun sesiyle okunur. <en>..</en> arası İNGİLİZCE sesle okunur.
import { card } from '../art';
import { EMOJI_FONT } from '../pic';
import { makeRng, pick, shuffle, pickN, randInt } from '../helpers';
import { G, createBank } from '../bank';

export { makeRng, pick, shuffle, pickN, randInt, G };

export const en = (s) => `<en>${s}</en>`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// --- RESİMLER ---------------------------------------------------------------
const emo = (ch, x, y, size, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" font-family="${EMOJI_FONT}"${extra}>${ch}</text>`;
// tek / birkaç emoji (en fazla 6)
export const pic = (items) => {
  const arr = (Array.isArray(items) ? items : [items]).slice(0, 6);
  const n = arr.length;
  const pos = n === 1 ? [[50, 54, 64]] : n === 2 ? [[30, 54, 42], [70, 54, 42]] : n === 3 ? [[28, 36, 34], [72, 36, 34], [50, 72, 34]]
    : n === 4 ? [[30, 32, 32], [70, 32, 32], [30, 72, 32], [70, 72, 32]] : n === 5 ? [[22, 32, 28], [50, 32, 28], [78, 32, 28], [36, 72, 28], [64, 72, 28]]
      : [[22, 32, 26], [50, 32, 26], [78, 32, 26], [22, 72, 26], [50, 72, 26], [78, 72, 26]];
  return card(arr.map((e, k) => emo(e, pos[k][0], pos[k][1], pos[k][2])).join(''));
};
// geniş sahne: emoji listesi yan yana (ör. olay, hikâye)
export const scenePic = (items, { w = 220, h = 100, bg = '#f8fafc' } = {}) => {
  const n = items.length; const cw = (w - 16) / n; const sz = Math.min(58, cw * 0.8);
  return card(items.map((e, k) => emo(e, 8 + cw * k + cw / 2, h / 2 + 3, sz)).join(''), { w, h, bg });
};
// sayma resmi: aynı emoji n kez (1-20), beşli satırlar
export const countPic = (e, n) => {
  const cols = n <= 4 ? n : n <= 10 ? 5 : 5; const rows = Math.ceil(n / cols);
  const W = 220, H = Math.max(100, rows * 40 + 16); const cw = (W - 16) / cols; const ch = (H - 16) / rows; const sz = Math.min(36, cw * 0.8, ch * 0.85);
  let s = '';
  for (let k = 0; k < n; k++) { const r = Math.floor(k / cols), c = k % cols; const inRow = Math.min(cols, n - r * cols); const ox = (W - inRow * cw) / 2; s += emo(e, ox + c * cw + cw / 2, 8 + r * ch + ch / 2 + 2, sz); }
  return card(s, { w: W, h: H, bg: '#f8fafc' });
};
// iki emojinin konumu: in / on / under / next to / behind / in front of
export const placePic = (thing, place, rel) => {
  const W = 160, H = 130; let s = '';
  const P = (x, y, sz, ch, ex = '') => emo(ch, x, y, sz, ex);
  if (rel === 'on') s = P(80, 90, 66, place) + P(80, 36, 44, thing);
  else if (rel === 'under') s = P(80, 50, 70, place) + P(80, 106, 34, thing);
  else if (rel === 'in') s = P(80, 74, 80, place) + P(80, 80, 30, thing);
  else if (rel === 'next to') s = P(55, 72, 66, place) + P(122, 80, 44, thing);
  else if (rel === 'behind') s = P(96, 58, 40, thing, ' opacity=".9"') + P(76, 78, 70, place);
  else s = P(80, 64, 64, place) + P(96, 92, 44, thing); // in front of
  return card(s, { w: W, h: H, bg: '#f8fafc' });
};
// renk lekesi
export const swatch = (hex) => card(`<path d="M50,12 C72,40 82,52 82,64 C82,82 67,92 50,92 C33,92 18,82 18,64 C18,52 28,40 50,12 Z" fill="${hex}" stroke="#1e293b" stroke-width="2.5"/><ellipse cx="40" cy="62" rx="6" ry="10" fill="#fff" opacity=".45"/>`);
// yazı kartı (ör. "app_e", "3 x 4 = ?" , "eş anlamlısı")
export const textPic = (lines, { size = 30, color = '#1e293b', bg = '#fffbeb', w = 240, font = 'Arial Rounded MT Bold, Arial, Helvetica, sans-serif' } = {}) => {
  const ls = Array.isArray(lines) ? lines : [lines];
  const lh = size * 1.3; const H = Math.max(90, ls.length * lh + 30);
  return card(ls.map((t, k) => `<text x="${w / 2}" y="${(H - ls.length * lh) / 2 + lh * k + lh / 2}" font-size="${size}" font-weight="800" text-anchor="middle" dominant-baseline="central" font-family="${font}" fill="${color}">${esc(t)}</text>`).join(''), { w, h: H, bg });
};
// solda resim (emoji ya da { hex } renk) + sağda yazı (ör. eksik harfli kelime)
export const picText = (e, text, { size = 30 } = {}) => {
  const W = 300, H = 110; const left = e ? (typeof e === 'object' ? `<circle cx="55" cy="55" r="34" fill="${e.hex}" stroke="#1e293b" stroke-width="3"/>` : emo(e, 55, 58, 62)) : '';
  const tx = e ? 190 : 150; const fs = Math.min(size, Math.floor((e ? 190 : 270) / Math.max(4, text.length) * 1.7));
  return card(`${left}<text x="${tx}" y="57" font-size="${fs}" font-weight="800" letter-spacing="2" text-anchor="middle" dominant-baseline="central" font-family="Arial Rounded MT Bold, Arial, sans-serif" fill="#1e293b">${esc(text)}</text>`, { w: W, h: H, bg: '#fffbeb' });
};
// emoji + altında yazı (ör. bir sözcük kartı)
export const picLabel = (e, label, { bg = '#ffffff' } = {}) => {
  const words = String(label).split(' '); let lines = [String(label)];
  if (label.length > 11 && words.length > 1) { let best = 1, diff = 1e9; for (let k = 1; k < words.length; k++) { const a = words.slice(0, k).join(' ').length, b = words.slice(k).join(' ').length; if (Math.abs(a - b) < diff) { diff = Math.abs(a - b); best = k; } } lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')]; }
  const longest = Math.max(...lines.map(l => l.length)); const fs = longest > 13 ? 9.5 : longest > 9 ? 11.5 : 14;
  const y0 = lines.length === 1 ? 86 : 80;
  return card(`${emo(e, 50, lines.length === 1 ? 42 : 38, lines.length === 1 ? 50 : 44)}${lines.map((l, k) => `<text x="50" y="${y0 + k * (fs + 1)}" font-size="${fs}" font-weight="800" text-anchor="middle" font-family="Arial, sans-serif" fill="#1e293b">${esc(l)}</text>`).join('')}`, { bg });
};

// --- ŞIKLAR -----------------------------------------------------------------
// key: şıkların birbirinden farklı olmasını sağlayan kimlik
export const oImg = (key, image) => ({ key: 'i:' + key, image });
export const oTxt = (text) => ({ key: 't:' + text, text: String(text) });
export const oAud = (text, tts) => ({ key: 'a:' + text, text: String(text), tts: tts || String(text) });
export const oImgTxt = (key, image, text) => ({ key: 'it:' + key, image, text });

// Benzersiz yanlış şık seç (doğruyla ve birbiriyle aynı olmayan)
export const wrongsFrom = (correctKey, cands, n) => {
  const seen = new Set([correctKey]); const out = [];
  for (const c of cands) { if (!c || seen.has(c.key)) continue; seen.add(c.key); out.push(c); if (out.length >= n) break; }
  return out;
};

// Şablon: doğru şık başta (yer dengelemesi banka tarafından yapılır)
//   audioOpts: true -> şık yazıları ekranda gizli, şıklar telefonla okunur (sesli şık)
export const Q = ({ sig, text, speak, main, correct, wrongs, n = 4, audioOpts = false, hideText, tag }) => {
  const w = wrongsFrom(correct.key, wrongs, n - 1);
  const strip = ({ key, ...o }) => o;
  return {
    sig: sig || `${text}|${correct.key}|${w.map(x => x.key).sort().join(',')}`,
    // ekrandaki yazıda emoji olmasın (vurgu bileşeni emojiyi bozuk gösterebiliyor)
    text: String(text || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]\u{FE0F}?/gu, '').replace(/\(\s*\)/g, '').replace(/[ \t]{2,}/g, ' ').trim(),
    speak: speak || '', mainImage: main || '',
    options: [strip(correct), ...w.map(strip)],
    correctIndex: 0,
    hideOptionText: Boolean(audioOpts),
    ...(typeof hideText === 'boolean' ? { hideText } : {}),
    ...(tag ? { tag } : {})
  };
};

// Seçilen hedefi i'ye göre sırayla gez (her öğe sırayla soru olur), çeldiriciler tohumlu rastgele
export const cyc = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];
export const others = (arr, item, rng, n = 3, same = (a, b) => a === b) => shuffle(arr.filter(x => !same(x, item)), rng).slice(0, n);

// --- YAZIM ÇELDİRİCİLERİ (İngilizce / Türkçe kelime) -------------------------
export const misspell = (w, rng) => {
  const out = new Set(); const a = w.split('');
  const add = (s) => { if (s && s !== w && /[a-zçğıöşü]/i.test(s)) out.add(s); };
  for (let t = 0; t < 30 && out.size < 6; t++) {
    const r = rng(); const b = [...a]; const i = randInt(rng, 0, Math.max(0, a.length - 2));
    if (r < 0.25 && a.length > 3) { [b[i], b[i + 1]] = [b[i + 1], b[i]]; add(b.join('')); }
    else if (r < 0.45 && a.length > 3) { b.splice(randInt(rng, 1, a.length - 1), 1); add(b.join('')); }
    else if (r < 0.65) { const j = randInt(rng, 0, a.length - 1); b.splice(j, 0, a[j]); add(b.join('')); }
    else { const j = randInt(rng, 0, a.length - 1); const V = 'aeiou'; if (V.includes(a[j])) { b[j] = pick(V.replace(a[j], '').split(''), rng); add(b.join('')); } else { const C = 'bcdfgklmnprstvyz'; b[j] = pick(C.replace(a[j], '').split(''), rng); add(b.join('')); } }
  }
  return [...out];
};

// --- BANKA KURUCU -----------------------------------------------------------
// topics: [{ id, label, color, concepts: [{ id, label, groups: [G(...)] }] }]
// Toplam soru sayısı tam "total" olacak şekilde kalıp sayıları orantılı ayarlanır.
// Bir kalıbın üretebileceği farklı soru sayısı sınırlıysa üretici fonksiyonda .cap vardır (ör. veri listesi uzunluğu);
// o kalıba en fazla cap kadar soru düşer, kalan sayı sınırsız kalıplara dağıtılır (tekrar eden soru olmasın).
export const capped = (gen, cap) => { gen.cap = cap; return gen; };
export const scaleTo = (topics, total) => {
  const groups = topics.flatMap(t => t.concepts.flatMap(c => c.groups));
  const capOf = (g) => (g.gen && g.gen.cap) || Infinity;
  const fixed = new Set();
  for (let round = 0; round < 10; round++) {
    const free = groups.filter(g => !fixed.has(g));
    const left = total - groups.filter(g => fixed.has(g)).reduce((a, g) => a + g.count, 0);
    const w = free.reduce((a, g) => a + (g.w0 ?? (g.w0 = g.count)), 0);
    let changed = false;
    free.forEach(g => { g.count = Math.max(1, Math.round(g.w0 * left / w)); if (g.count >= capOf(g)) { g.count = capOf(g); fixed.add(g); changed = true; } });
    if (!changed) break;
  }
  let acc = groups.reduce((a, g) => a + g.count, 0); let k = 0;
  while (acc !== total && k < 100000) { const g = groups[k % groups.length]; if (acc > total && g.count > 1) { g.count--; acc--; } else if (acc < total && g.count < capOf(g)) { g.count++; acc++; } k++; }
  return topics;
};
export const makeSubjectBank = ({ id, title, intro, rootFolder, topics, total = 1000 }) => createBank({
  id, title, intro, rootFolder,
  fieldPrefix: id,
  settingsDoc: `${id}_settings`,
  mediaPrefix: `${id}_media_`,
  categories: scaleTo(topics, total),
  unique: true,
  maxOptions: 4,
  folderPath: (gr) => [gr.categoryLabel, gr.conceptLabel, gr.label || gr.text]
});
// Kısa kalıp yazımı: g(key, etiket, gen, ağırlık)
export const grp = (prefix) => (key, label, gen, count = 10, extra = {}) => G(`${prefix}_${key}`, label, gen, count, { label, ...extra });
export const topic = (id, label, color, concepts) => ({ id, label, color, concepts });
export const kind = (id, label, groups) => ({ id, label, groups });

// ============================================================================
// --- VERİYE DAYALI GENEL KALIPLAR (Türkçe, Hayat Bilgisi, Fen) ---
// ============================================================================
// BİLGİ SORULARI: items = [{ q, a, w: [yanlışlar], e?: emoji (soru resmi), say?: okunacak metin }]
//   mode 'read'   : yazılı soru + yazılı şık
//   mode 'listen' : soru telefonla okunur (yazısı gizli değil ama kısa yönerge), yazılı şık
//   mode 'audio'  : soru okunur + şıklar sesli (şık yazıları gizli)
export const factGen = (items, mode = 'read') => capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const it = cyc(items, pos ?? seed);
  const ws = shuffle(it.w, rng); const main = it.img || (it.e ? pic(it.e) : '');
  const say = it.say || it.q;
  if (mode === 'listen') return Q({ sig: 'L' + it.q, text: 'Soruyu dinle ve doğru cevabı seç. 🔊', speak: say, main, correct: oTxt(it.a), wrongs: ws.map(oTxt) });
  if (mode === 'audio') return Q({ sig: 'A' + it.q, text: `${it.q} (şıkları dinle)`, speak: `${say} || Şıkları dinle.`, main, correct: oAud(it.a), wrongs: ws.map(x => oAud(x)), audioOpts: true });
  return Q({ sig: 'R' + it.q, text: it.q, speak: say, main, correct: oTxt(it.a), wrongs: ws.map(oTxt) });
}, items.length);
// SINIFLAMA SORULARI: classes = [{ name, ask, items: [[ad, emoji?], ...] }]
//   ask: "Hangisi katı bir maddedir?" gibi soru (yoksa `Hangisi ${name}?`)
//   mode 'pick'    : doğru sınıftan 1, diğerlerinden 3 (resimli şık; emoji yoksa yazılı)
//   mode 'pickAud' : soru okunur, şıklar resimli
//   mode 'which'   : "<öğe> hangi gruptadır?" (yazılı şık) • 'whichAud': sesli şık
//   mode 'not'     : "Hangisi ... değildir?" (aynı sınıftan 3, başka sınıftan 1)
export const classGen = (classes, mode = 'pick', { groupWord = 'gruba', whichAsk = null, cap, extra = [] } = {}) => capped((key, seed, pos) => {
  const rng = makeRng(key, seed);
  const ci = (pos ?? seed) % classes.length; const C = classes[ci];
  const rest = classes.filter((_, k) => k !== ci);
  const restItems = rest.flatMap(c => c.items.filter(x => !C.items.some(y => y[0] === x[0])));
  const opt = (x) => (x[1] ? { key: 'i:' + x[0], image: picLabel(x[1], x[0]) } : oTxt(x[0]));
  if (mode === 'pick' || mode === 'pickAud') {
    const it = cyc(C.items, Math.floor((pos ?? seed) / classes.length) + randInt(rng, 0, 3));
    const ws = shuffle(restItems, rng).slice(0, 3);
    const ask = C.ask || `Hangisi ${C.name}?`;
    return Q({ text: mode === 'pickAud' ? 'Soruyu dinle ve doğru resmi seç. 🔊' : ask, speak: ask, correct: opt(it), wrongs: ws.map(opt), sig: mode + ask + it[0] + ws.map(w => w[0]).sort().join() });
  }
  if (mode === 'not') {
    if (C.items.length < 3) return null;
    const three = shuffle(C.items, rng).slice(0, 3); const odd = pick(restItems, rng);
    const ask = C.notAsk || `Hangisi ${C.name} değildir?`;
    return Q({ text: ask, speak: ask, correct: opt(odd), wrongs: three.map(opt), sig: 'not' + ask + odd[0] + three.map(w => w[0]).sort().join() });
  }
  // which / whichAud: tüm öğeler sırayla sorulur
  const flat = classes.flatMap((c, k) => c.items.map(x => [x, k]));
  const [it, k0] = cyc(flat, pos ?? seed); const CC = classes[k0];
  const names = [...shuffle(classes.filter((_, k) => k !== k0).map(c => c.label || c.name), rng), ...shuffle(extra, rng)].slice(0, 3);
  const ask = whichAsk ? whichAsk(it[0]) : `"${it[0]}" hangi ${groupWord} girer?`;
  const main = it[1] ? picLabel(it[1], it[0]) : '';
  if (mode === 'whichAud') return Q({ text: `${ask} (şıkları dinle)`, speak: `${ask} || Şıkları dinle.`, main, correct: oAud(CC.label || CC.name), wrongs: names.map(n => oAud(n)), audioOpts: true, sig: 'wa' + it[0] + CC.name });
  return Q({ text: ask, speak: ask, main, correct: oTxt(CC.label || CC.name), wrongs: names.map(oTxt), sig: 'w' + it[0] + CC.name });
}, cap || (() => { const n = classes.reduce((a, c) => a + c.items.length, 0); return mode.startsWith('which') ? n : mode === 'not' ? n * 2 : n * 2; })());
// EŞLEŞTİRME (çift) SORULARI: pairs = [[sol, sağ, emoji?]]; "sol → sağ" (ör. eş anlamlı, organ → duyu)
//   dir 'lr': soldan sağa • 'rl': sağdan sola ; mode: 'read' | 'audio' | 'listen'
export const pairGen = (pairs, ask, { dir = 'lr', mode = 'read', cap } = {}) => capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const p = cyc(pairs, pos ?? seed);
  const [from, to] = dir === 'lr' ? [p[0], p[1]] : [p[1], p[0]];
  const pool = pairs.filter(x => x !== p).map(x => (dir === 'lr' ? x[1] : x[0])).filter(x => x !== to);
  const ws = shuffle([...new Set(pool)], rng).slice(0, 3);
  const q = ask(from); const main = p[2] ? pic(p[2]) : '';
  if (mode === 'audio') return Q({ sig: 'pa' + from + ws.sort().join(), text: `${q} (şıkları dinle)`, speak: `${q} || Şıkları dinle.`, main, correct: oAud(to), wrongs: ws.map(x => oAud(x)), audioOpts: true });
  if (mode === 'listen') return Q({ sig: 'pl' + from + ws.sort().join(), text: 'Soruyu dinle ve doğru cevabı seç. 🔊', speak: q, main, correct: oTxt(to), wrongs: ws.map(oTxt) });
  return Q({ sig: 'pr' + from + ws.sort().join(), text: q, speak: q, main, correct: oTxt(to), wrongs: ws.map(oTxt) });
}, cap || pairs.length);
