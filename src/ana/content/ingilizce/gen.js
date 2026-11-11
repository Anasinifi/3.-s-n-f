// ============================================================================
// --- 3. SINIF İNGİLİZCE: SORU ÜRETİCİLERİ ---
// ============================================================================
// Her ünite AYRI bir sekmedir (ayrı banka). Bir ünitenin içi:
//   📗 Kelimeler        (öğretici / etkileşimli)  ┐ toplam 500 soru
//   📘 Konu ve Kalıplar (öğretici / etkileşimli)  ┘
//   📝 Ünite Sonu Testi (şıkları yazılı, kitap tarzı 3 şık) -> 200 soru
// "Genel Tekrar" sekmesi: 6 ünitenin hepsinden 300 soru (4 şık).
//
// SES: <en>..</en> arası telefonun İngilizce sesiyle okunur. Gerçek ses yüklemek için ses dosyasının
//      adı okunacak metin olmalı (ör. "library.mp3", "It is a ruler.mp3"). Liste Word dosyasında.
// GÖRSEL: resimli şıkların yedek resmi emojidir. Gerçek resim yüklemek için dosya adı
//      "kod + tarif" (ör. "3012 Okul kütüphanesi.jpg"). Kod listesi Word dosyasında.
import { makeRng, pick, shuffle, randInt, G, en, Q, oTxt, oAud, pic, scenePic, textPic, misspell, capped, scaleTo, cyc } from '../dersler/common';
import { createBank } from '../bank';
import { card } from '../art';
import { generateMatchSvgDataUrl } from '../../activities/matchSvg';

const VOW = /^[aeiou]/i;
const art = (w) => (VOW.test(w) && !/^(uni|eu)/i.test(w) ? 'an' : 'a');
const strip = (s) => String(s || '').replace(/<\/?en>/gi, '');
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// --- Veriyi düzenle ---------------------------------------------------------
export const prepareUnit = (U) => {
  const np = new Set(U.np || []);
  const sets = U.sets.map(st => ({
    ...st,
    items: st.items.map(([e0, tr, emo, desc, x]) => {
      const it = { en: e0, tr, e: emo, desc: desc || cap1(tr), set: st.id, setLabel: st.label, kind: st.kind || 'noun', unit: U.id };
      it.a = art(e0); it.pl = x === 'pl'; it.ing = st.id === 'farmacts' ? x : null;
      it.a2 = it.pl ? e0 : `${it.a} ${e0}`;
      it.pic = !st.noPic && !np.has(e0);
      it.id = `${U.id}:${st.id}:${e0}`;
      return it;
    })
  }));
  const items = sets.flatMap(s => s.items);
  return { ...U, sets, items, picItems: items.filter(i => i.pic), wordItems: items.filter(i => i.en.split(' ').length === 1 && /^[a-z-]+$/i.test(i.en) && i.en.length >= 3) };
};

// --- Resim / şık yardımcıları -----------------------------------------------
const picOf = (it) => pic(it.e);
// resimli şık: yazısı yok (sesli soruda cevabı ele vermesin), görsel adı = tarif (kodla eşleşir)
const oPic = (it) => ({ key: 'p:' + it.id, image: picOf(it), imgName: it.desc, text: '' });
const oEn = (it) => oTxt(it.en);
const oTr = (it) => oTxt(it.tr);
const oSay = (it) => oAud(it.en, en(it.en));
// resimli sorularda farklı görünen çeldiriciler (aynı emoji iki şıkta olmasın)
const picWrongs = (it, pool, rng, n = 3) => {
  const seen = new Set([it.e]); const out = [];
  for (const x of shuffle(pool, rng)) { if (x.id === it.id || seen.has(x.e) || x.en === it.en) continue; seen.add(x.e); out.push(x); if (out.length >= n) break; }
  return out;
};
const sameSetFirst = (it, U, rng, filter = () => true) => {
  const same = U.items.filter(x => x.set === it.set && x.id !== it.id && x.en !== it.en && filter(x));
  const other = U.items.filter(x => x.set !== it.set && x.en !== it.en && filter(x));
  return [...shuffle(same, rng), ...shuffle(other, rng)];
};

// saat resmi (o'clock)
export const clockPic = (h) => {
  const a = ((h % 12) / 12) * Math.PI * 2;
  const hx = 50 + 20 * Math.sin(a), hy = 52 - 20 * Math.cos(a);
  let ticks = '';
  for (let k = 1; k <= 12; k++) { const t = (k / 12) * Math.PI * 2; ticks += `<text x="${(50 + 32 * Math.sin(t)).toFixed(1)}" y="${(52 - 32 * Math.cos(t)).toFixed(1)}" font-size="9" font-weight="800" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#1e293b">${k}</text>`; }
  return card(`<circle cx="50" cy="52" r="41" fill="#fff" stroke="#1e293b" stroke-width="4"/>${ticks}<line x1="50" y1="52" x2="50" y2="22" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/><line x1="50" y1="52" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="52" r="3.5" fill="#1e293b"/>`, { bg: '#f0f9ff' });
};
const HOURS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

// Şablon kısayolları: hepsi yazılı (soru yazısı görünür)
const T = (o) => Q({ hideText: false, ...o });

// ============================================================================
// --- KELİMELER (öğretici) ---------------------------------------------------
// ============================================================================
export const makeLearnGens = (U) => {
  const P = U.picItems; const A = U.items; const W = U.wordItems;
  const picSets = U.sets.filter(s => s.items.filter(i => i.pic).length >= 4);
  const g = {};

  // EŞLEŞTİRME (etkileşimli): 4 çift
  const matchFrom = (mode, pool, sigp) => (key, seed) => {
    const rng = makeRng(key, seed);
    let four;
    if (mode === 'word-tr') { four = shuffle(pool, rng).slice(0, 4); }
    else { const st = pick(picSets, rng); four = picWrongs(pick(st.items.filter(i => i.pic), rng), st.items.filter(i => i.pic), rng, 3); four.unshift(st.items.filter(i => i.pic).find(i => !four.includes(i))); four = four.filter(Boolean).slice(0, 4); if (four.length < 4) four = [...four, ...picWrongs(four[0], P, rng, 4 - four.length)]; }
    const order = shuffle([0, 1, 2, 3].slice(0, four.length), rng); // sağ sütunun sırası
    const options = order.map(k => (mode === 'word-tr' ? { text: four[k].tr } : { ...oPic(four[k]) }));
    const left = shuffle(four.map((it, k) => ({ text: mode === 'audio-pic' ? '' : it.en, say: en(it.en), ans: order.indexOf(k) })), rng);
    const grid = { mode, left };
    const titles = { 'word-pic': 'Kelimeleri resimleriyle eşleştir.', 'audio-pic': 'Sesleri dinle, resimleriyle eşleştir.', 'word-tr': 'İngilizce kelimeleri Türkçe anlamlarıyla eşleştir.' };
    return {
      sig: sigp + four.map(x => x.id).sort().join('|'),
      text: titles[mode], speak: titles[mode],
      mainImage: generateMatchSvgDataUrl(grid, options),
      options: options.map(({ key, ...o }) => o), correctIndex: -1, keepSlot: true,
      hideText: false, hideOptionText: mode === 'word-tr' ? false : true,
      fields: { questionType: 'match_pairs', matchGrid: grid }
    };
  };
  g.m_wp = capped(matchFrom('word-pic', P, 'MWP'), 400);
  g.m_ap = capped(matchFrom('audio-pic', P, 'MAP'), 400);
  g.m_wt = capped(matchFrom('word-tr', A, 'MWT'), 400);

  // DİNLE, RESMİ BUL
  g.l_pic = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(P, pos ?? seed);
    return T({ sig: 'LP' + it.id, text: 'Dinle ve doğru resmi seç. 🔊', speak: en(it.en), correct: oPic(it), wrongs: picWrongs(it, sameSetFirst(it, U, rng, x => x.pic), rng).map(oPic) });
  }, P.length);
  // RESME BAK, DOĞRU SESİ BUL (şıklar sesli)
  g.p_aud = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(P, (pos ?? seed) + 3);
    return T({ sig: 'PA' + it.id, text: 'Resme bak. Hangi ses bu resmi söylüyor? Şıkları dinle.', speak: 'Resme bak. Şıkları dinle.', main: picOf(it), mainImgName: it.desc, correct: oSay(it), wrongs: sameSetFirst(it, U, rng).map(oSay), audioOpts: true });
  }, P.length);
  // YAZILIŞI GÖSTER -> SESİNİ BUL
  g.w_aud = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(A, pos ?? seed);
    return T({ sig: 'WA' + it.id, text: `"${it.en}" nasıl okunur? Şıkları dinle.`, speak: 'Şıkları dinle. Hangisi bu kelime?', correct: oSay(it), wrongs: sameSetFirst(it, U, rng).map(oSay), audioOpts: true });
  }, A.length);
  // DİNLE -> YAZILIŞINI BUL
  g.a_word = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(A, (pos ?? seed) + 5);
    return T({ sig: 'AW' + it.id, text: 'Dinle. Duyduğun kelimenin yazılışı hangisi? 🔊', speak: en(it.en), correct: oEn(it), wrongs: sameSetFirst(it, U, rng).map(oEn) });
  }, A.length);
  // RESME BAK -> DOĞRU YAZILIŞ (yanlış yazılmış çeldiriciler)
  const spellable = P.filter(i => i.en.split(' ').length === 1 && i.en.length >= 3);
  g.p_spell = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(spellable, pos ?? seed);
    const ms = misspell(it.en.toLowerCase(), rng).slice(0, 3);
    if (ms.length < 3) return null;
    return T({ sig: 'PS' + it.id, text: 'Resme bak. Doğru yazılmış kelime hangisi?', speak: 'Resme bak. Doğru yazılmış kelimeyi bul.', main: picOf(it), mainImgName: it.desc, correct: oTxt(it.en), wrongs: ms.map(oTxt) });
  }, spellable.length);
  // EKSİK HARF
  const missList = W.flatMap(it => { const w = it.en.toLowerCase(); const idx = [...w].map((c, k) => k).filter(k => /[a-z]/.test(w[k])); return idx.filter((_, j) => j % 2 === 0).map(k => ({ it, k })); });
  g.missing = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const { it, k } = cyc(missList, pos ?? seed);
    const w = it.en; const c = w[k].toLowerCase();
    const shown = w.slice(0, k) + '_' + w.slice(k + 1);
    const letters = shuffle('abcdefghiklmnoprstuwy'.split('').filter(x => x !== c), rng).slice(0, 3);
    return T({ sig: 'MS' + it.id + k, text: `Eksik harf hangisi? ${shown} (${it.tr})`, speak: `Eksik harfi bul. ${it.tr}. || ${en(it.en)}`, main: it.pic ? picOf(it) : textPic([shown], { size: 34 }), mainImgName: it.pic ? it.desc : '', correct: oTxt(c), wrongs: letters.map(oTxt) });
  }, missList.length);
  // KARIŞIK HARFLER
  g.scramble = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(W, pos ?? seed);
    let mix = it.en.toLowerCase().split(''); for (let t = 0; t < 6; t++) { mix = shuffle(mix, rng); if (mix.join('') !== it.en.toLowerCase()) break; }
    const ws = sameSetFirst(it, U, rng, x => U.wordItems.includes(x));
    return T({ sig: 'SC' + it.id, text: `Karışık harflerden hangi kelime çıkar? ${mix.join(' - ')}`, speak: 'Karışık harflerden hangi kelime çıkar?', main: textPic([mix.join(' ')], { size: 30, bg: '#ecfeff' }), correct: oEn(it), wrongs: [...misspell(it.en.toLowerCase(), rng).slice(0, 1).map(s => ({ en: s, id: 'm' + s })), ...ws].map(oEn) });
  }, W.length);
  // ANLAMI
  g.en_tr = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(A, (pos ?? seed) + 7);
    return T({ sig: 'ET' + it.id, text: `"${it.en}" kelimesinin Türkçe anlamı hangisi?`, speak: `${en(it.en)} || Türkçe anlamı hangisi?`, correct: oTr(it), wrongs: sameSetFirst(it, U, rng).map(oTr) });
  }, A.length);
  g.tr_en = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(A, (pos ?? seed) + 11);
    return T({ sig: 'TE' + it.id, text: `"${it.tr}" İngilizce nasıl söylenir?`, speak: `${it.tr}. İngilizce nasıl söylenir?`, correct: oEn(it), wrongs: sameSetFirst(it, U, rng).map(oEn) });
  }, A.length);
  // DOĞRU MU YANLIŞ MI? (resim + cümle)
  const framed = P.filter(i => U.sets.find(s => s.id === i.set)?.frame);
  const frameOf = (it) => U.sets.find(s => s.id === it.set).frame(it);
  g.tf = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const p = pos ?? seed; const it = cyc(framed, Math.floor(p / 2)); const truth = p % 2 === 0;
    const other = truth ? it : pick(sameSetFirst(it, U, rng, x => !!U.sets.find(s => s.id === x.set)?.frame && x.set === it.set), rng) || pick(framed.filter(x => x.id !== it.id), rng);
    const sentence = frameOf(other);
    return T({ sig: 'TF' + it.id + truth, text: `Resme bak: "${sentence}" Doğru mu, yanlış mı?`, speak: `Resme bak. || ${en(sentence)} || Doğru mu, yanlış mı?`, main: picOf(it), mainImgName: it.desc, correct: oTxt(truth ? 'Doğru (True) ✔' : 'Yanlış (False) ✘'), wrongs: [oTxt(truth ? 'Yanlış (False) ✘' : 'Doğru (True) ✔')], n: 2 });
  }, framed.length * 2);
  // GRUBA UYMAYAN
  const bigSets = U.sets.filter(s => s.items.length >= 4);
  g.odd = capped((key, seed) => {
    const rng = makeRng(key, seed); const st = pick(bigSets, rng);
    const three = shuffle(st.items, rng).slice(0, 3); const odd = pick(A.filter(x => x.set !== st.id && !three.some(t => t.en === x.en)), rng);
    return T({ sig: 'OD' + odd.id + three.map(x => x.id).sort().join(), text: `Hangisi gruba uymuyor? (${st.label})`, speak: 'Hangisi gruba uymuyor?', correct: oEn(odd), wrongs: three.map(oEn) });
  }, 500);
  return g;
};

// ============================================================================
// --- KONU VE KALIPLAR (öğretici) --------------------------------------------
// ============================================================================
const scrambleWords = (s, rng) => {
  const words = s.replace(/[.!?]$/, '').split(' ');
  let m = words; for (let t = 0; t < 8; t++) { m = shuffle(words, rng); if (m.join(' ') !== words.join(' ')) break; }
  return m;
};
const wrongOrders = (s, rng, n = 3) => {
  const end = (s.match(/[.!?]$/) || ['.'])[0]; const words = s.replace(/[.!?]$/, '').split(' ');
  const out = new Set();
  for (let t = 0; t < 40 && out.size < n; t++) {
    const w = [...words]; const i = randInt(rng, 0, w.length - 2); const j = randInt(rng, i + 1, w.length - 1); [w[i], w[j]] = [w[j], w[i]];
    const c = w.join(' '); if (c !== words.join(' ')) out.add(cap1(c.charAt(0).toLowerCase() + c.slice(1)) + end);
  }
  return [...out];
};

export const makeStructGens = (U) => {
  const g = {};
  const framed = U.picItems.filter(i => U.sets.find(s => s.id === i.set)?.frame);
  const frameOf = (it) => U.sets.find(s => s.id === it.set).frame(it);
  const fillPic = (f) => (f.e ? pic(f.e) : '');
  // BOŞLUK DOLDURMA
  g.fill = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const f = cyc(U.fill, pos ?? seed);
    const extra = shuffle(U.fill.filter(x => x.a !== f.a && !f.w.includes(x.a) && x.a.split(' ').length === f.a.split(' ').length), rng).slice(0, 1).map(x => x.a);
    return T({ sig: 'FI' + f.s, text: `Boşluğa hangisi gelir? ${f.s}`, speak: `Boşluğa hangisi gelir? || ${en(f.s.replace('___', '...'))}`, main: fillPic(f), correct: oTxt(f.a), wrongs: [...f.w, ...extra].map(oTxt) });
  }, U.fill.length);
  // RESİMLİ CÜMLE TAMAMLA (kelime boşluğu)
  g.fill_pic = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(framed, (pos ?? seed) + 2);
    const sent = frameOf(it); const blank = sent.replace(it.ing || it.en, '___');
    if (blank === sent) return null;
    const ws = sameSetFirst(it, U, rng, x => x.set === it.set).map(x => (it.ing ? { ...x, en: x.ing } : x));
    return T({ sig: 'FP' + it.id, text: `Resme göre boşluğa hangisi gelir? ${blank}`, speak: `Resme bak. || ${en(blank.replace('___', '...'))}`, main: picOf(it), mainImgName: it.desc, correct: oTxt(it.ing || it.en), wrongs: ws.map(x => oTxt(x.en)) });
  }, framed.length);
  // SORU -> CEVAP
  g.qa = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const x = cyc(U.qa, pos ?? seed);
    const extra = shuffle(U.qa.filter(y => y.a !== x.a), rng).slice(0, 1).map(y => y.a);
    return T({ sig: 'QA' + x.q + x.a, text: `Sorunun cevabı hangisi? "${x.q}"`, speak: `${en(x.q)} || Cevabı hangisi?`, main: x.e ? pic(x.e) : '', correct: oTxt(x.a), wrongs: [...x.w, ...extra].map(oTxt) });
  }, U.qa.length);
  // CEVAP -> SORU
  g.aq = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const x = cyc(U.qa, (pos ?? seed) + 4);
    const ws = shuffle(U.qa.filter(y => y.q !== x.q && y.a !== x.a), rng).slice(0, 3).map(y => y.q);
    return T({ sig: 'AQ' + x.q + x.a, text: `Bu cevabın sorusu hangisi? "${x.a}"`, speak: `${en(x.a)} || Bu cevabın sorusu hangisi?`, main: x.e ? pic(x.e) : '', correct: oTxt(x.q), wrongs: ws.map(oTxt) });
  }, U.qa.length);
  // SORU-CEVAP EŞLEŞTİRME (etkileşimli, 3 çift)
  g.m_qa = capped((key, seed) => {
    const rng = makeRng(key, seed);
    const three = []; const used = new Set();
    for (const x of shuffle(U.qa, rng)) { if (used.has(x.a) || used.has(x.q)) continue; used.add(x.a); used.add(x.q); three.push(x); if (three.length === 3) break; }
    const order = shuffle([0, 1, 2], rng);
    const options = order.map(k => ({ text: three[k].a, tts: en(three[k].a) }));
    const left = shuffle(three.map((x, k) => ({ text: x.q, say: en(x.q), ans: order.indexOf(k) })), rng);
    const grid = { mode: 'word-tr', left };
    return { sig: 'MQ' + three.map(x => x.q).sort().join('|'), text: 'Soruları cevaplarıyla eşleştir.', speak: 'Soruları cevaplarıyla eşleştir.', mainImage: generateMatchSvgDataUrl(grid, options), options, correctIndex: -1, keepSlot: true, hideText: false, hideOptionText: false, fields: { questionType: 'match_pairs', matchGrid: grid } };
  }, 300);
  // CÜMLE -> RESİM / RESİM -> CÜMLE / DİNLE -> RESİM
  g.s_pic = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(framed, pos ?? seed); const s = frameOf(it);
    return T({ sig: 'SP' + it.id, text: `Cümleye uygun resim hangisi? "${s}"`, speak: en(s), correct: oPic(it), wrongs: picWrongs(it, sameSetFirst(it, U, rng, x => x.pic), rng).map(oPic) });
  }, framed.length);
  g.pic_s = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(framed, (pos ?? seed) + 3);
    const ws = sameSetFirst(it, U, rng, x => !!U.sets.find(s => s.id === x.set)?.frame).slice(0, 3).map(frameOf);
    return T({ sig: 'PS2' + it.id, text: 'Resme uygun cümle hangisi?', speak: 'Resme bak. Uygun cümleyi seç.', main: picOf(it), mainImgName: it.desc, correct: oTxt(frameOf(it)), wrongs: ws.map(oTxt) });
  }, framed.length);
  g.ls_pic = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const it = cyc(framed, (pos ?? seed) + 6); const s = frameOf(it);
    return T({ sig: 'LS' + it.id, text: 'Cümleyi dinle. Hangi resim anlatılıyor? 🔊', speak: en(s), correct: oPic(it), wrongs: picWrongs(it, sameSetFirst(it, U, rng, x => x.pic), rng).map(oPic) });
  }, framed.length);
  // KELİMELERİ SIRALA
  g.order = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const s = cyc(U.order, pos ?? seed);
    const mixed = scrambleWords(s, rng);
    return T({ sig: 'OR' + s, text: `Kelimeleri sırala. Doğru cümle hangisi? ( ${mixed.join(' / ')} )`, speak: 'Kelimeleri sırala. Doğru cümle hangisi?', main: textPic(mixed.length > 5 ? [mixed.slice(0, Math.ceil(mixed.length / 2)).join(' · '), mixed.slice(Math.ceil(mixed.length / 2)).join(' · ')] : [mixed.join(' · ')], { size: 20, w: 300, bg: '#f0fdf4' }), correct: oTxt(s), wrongs: wrongOrders(s, rng).map(oTxt) });
  }, U.order.length);
  g.order_l = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const s = cyc(U.order, (pos ?? seed) + 5);
    return T({ sig: 'OL' + s, text: 'Dinle. Duyduğun cümle hangisi? 🔊', speak: en(s), correct: oTxt(s), wrongs: wrongOrders(s, rng).map(oTxt) });
  }, U.order.length);
  // DİYALOG
  g.dialog = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const d = cyc(U.dialog, pos ?? seed);
    const lines = d.l.map((l, k) => `${k % 2 === 0 ? 'A' : 'B'}: ${l}`).join('  ');
    const extra = shuffle(U.dialog.filter(x => x.a !== d.a), rng).slice(0, 1).map(x => x.a);
    return T({ sig: 'DI' + d.l.join('|'), text: `Diyalogda boşluğa hangisi gelir?  ${lines}`, speak: `Diyalogu tamamla. || ${en(d.l.join(' ... ').replace(/___/g, '...'))}`, correct: oTxt(d.a), wrongs: [...d.w, ...extra].map(oTxt) });
  }, U.dialog.length);
  // OKUMA
  const rq = U.read.flatMap(r => r.qs.map(q => ({ r, q })));
  g.read = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const { r, q } = cyc(rq, pos ?? seed);
    const extra = shuffle(rq.filter(x => x.r === r && x.q.a !== q.a), rng).slice(0, 1).map(x => x.q.a);
    return T({ sig: 'RD' + q.q, text: `Metni oku ve soruyu cevapla.\n\n${r.t}\n\n❓ ${q.q}`, speak: `${en(r.t)} || ${en(q.q)}`, correct: oTxt(q.a), wrongs: [...q.w, ...extra].map(oTxt) });
  }, rq.length);
  // DİNLEME (metni dinle, soruyu cevapla)
  g.listen = capped((key, seed, pos) => {
    const rng = makeRng(key, seed); const { r, q } = cyc(rq, (pos ?? seed) + 1);
    return T({ sig: 'LI' + q.q, text: `Metni dinle ve soruyu cevapla. 🔊\n❓ ${q.q}`, speak: `${en(r.t)} || ${en(q.q)}`, correct: oTxt(q.a), wrongs: q.w.map(oTxt) });
  }, rq.length);
  // OKUL KURALLARI (sadece 1. ünite)
  if (U.rules) g.rule = capped((key, seed, pos) => {
    const [s, ok, e] = cyc(U.rules, pos ?? seed);
    return T({ sig: 'RU' + s, text: `Bu doğru bir okul kuralı mı? "${s}"`, speak: `${en(s)} || Bu doğru bir okul kuralı mı?`, main: pic(e), correct: oTxt(ok ? 'Evet, doğru kural ✔' : 'Hayır, yanlış kural ✘'), wrongs: [oTxt(ok ? 'Hayır, yanlış kural ✘' : 'Evet, doğru kural ✔')], n: 2 });
  }, U.rules.length);
  return g;
};

// ============================================================================
// --- ÜNİTE SONU TESTİ (kitap tarzı: yazılı 3 şık) ----------------------------
// --- GENEL TEKRAR (4 şık) -----------------------------------------------------
// ============================================================================
export const makeTestGens = (U, { n = 3, pre = 'T', all = null } = {}) => {
  const g = {}; const W = (o) => T({ n, ...o });
  const pool = all || U.items; // genel tekrarda çeldiriciler bütün ünitelerden
  const P = U.picItems; const A = U.items;
  const framed = P.filter(i => U.sets.find(s => s.id === i.set)?.frame);
  const frameOf = (it) => U.sets.find(s => s.id === it.set).frame(it);
  const near = (it, rng, f = () => true) => sameSetFirst(it, { ...U, items: pool }, rng, f);

  g.t_pic = capped((key, seed, pos) => { const rng = makeRng(key, seed); const it = cyc(P, (pos ?? seed) + 1);
    return W({ sig: pre + 'P' + it.id, text: 'Görsele uygun ifade hangisidir?', main: picOf(it), mainImgName: it.desc, correct: oEn(it), wrongs: near(it, rng).map(oEn) }); }, P.length);
  g.t_notin = capped((key, seed) => { const rng = makeRng(key, seed);
    const shown = picWrongs(pick(P, rng), P, rng, n); const missing = picWrongs(shown[0], P.filter(x => !shown.includes(x)), rng, 1)[0];
    if (!missing || shown.length < n - 1) return null;
    const vis = shown.slice(0, n - 1);
    return W({ sig: pre + 'N' + vis.map(x => x.id).sort().join() + missing.id, text: 'Görselde OLMAYAN hangisidir?', main: scenePic(vis.map(x => x.e)), correct: oEn(missing), wrongs: vis.map(oEn) }); }, 400);
  g.t_odd = capped((key, seed) => { const rng = makeRng(key, seed); const st = pick(U.sets.filter(s => s.items.length >= n), rng);
    const same = shuffle(st.items, rng).slice(0, n - 1); const odd = pick(pool.filter(x => x.set !== st.id && x.kind !== st.kind && !same.some(s2 => s2.en === x.en)), rng) || pick(pool.filter(x => x.set !== st.id), rng);
    return W({ sig: pre + 'O' + odd.id + same.map(x => x.id).sort().join(), text: 'Hangisi diğerleriyle aynı gruptan DEĞİLDİR? (Gruba uymayan hangisidir?)', correct: oEn(odd), wrongs: same.map(oEn) }); }, 400);
  g.t_fill = capped((key, seed, pos) => { const rng = makeRng(key, seed); const f = cyc(U.fill, (pos ?? seed) + 2);
    return W({ sig: pre + 'F' + f.s, text: `Boşluğa uygun ifade hangisidir?  ${f.s}`, speak: `Boşluğa uygun ifade hangisidir? || ${en(f.s.replace('___', '...'))}`, main: f.e ? pic(f.e) : '', correct: oTxt(f.a), wrongs: [...shuffle(f.w, rng), ...shuffle(U.fill.filter(x => x.a !== f.a), rng).map(x => x.a)].map(oTxt) }); }, U.fill.length);
  // "Hangisi boşluğa uygun DEĞİLDİR?" : aynı gruptan uygunlar + başka türden uygun olmayan
  const fitSets = U.sets.filter(s => s.frame && s.items.length >= n);
  g.t_notfit = capped((key, seed) => { const rng = makeRng(key, seed); const st = pick(fitSets, rng);
    const fits = shuffle(st.items, rng).slice(0, n - 1); const bad = pick(pool.filter(x => x.kind !== st.kind && x.set !== st.id && !(U.sets.find(s => s.id === x.set)?.frame)), rng) || pick(pool.filter(x => x.set !== st.id), rng);
    const blank = st.frame({ en: '___', a: 'a', a2: '___', ing: '___' }).replace(/\ba ___/, '___').replace(/\ban ___/, '___');
    return W({ sig: pre + 'NF' + st.id + fits.map(x => x.id).sort().join() + bad.id, text: `"${blank}" Hangisi boşluğa uygun DEĞİLDİR?`, speak: `${en(blank.replace('___', '...'))} || Hangisi boşluğa uygun değildir?`, correct: oTxt(bad.en), wrongs: fits.map(x => oTxt(st.id === 'farmacts' ? x.ing : x.en)) }); }, 300);
  g.t_qa = capped((key, seed, pos) => { const rng = makeRng(key, seed); const x = cyc(U.qa, (pos ?? seed) + 3);
    return W({ sig: pre + 'Q' + x.q, text: `"${x.q}"  Sorusunun cevabı hangisidir?`, speak: `${en(x.q)} || Sorusunun cevabı hangisidir?`, main: x.e ? pic(x.e) : '', correct: oTxt(x.a), wrongs: [...x.w, ...shuffle(U.qa.filter(y => y.a !== x.a), rng).map(y => y.a)].map(oTxt) }); }, U.qa.length);
  g.t_aq = capped((key, seed, pos) => { const rng = makeRng(key, seed); const x = cyc(U.qa, (pos ?? seed) + 9);
    return W({ sig: pre + 'A' + x.a, text: `"${x.a}"  Verilen cevaba uygun soru hangisidir?`, speak: `${en(x.a)} || Verilen cevaba uygun soru hangisidir?`, correct: oTxt(x.q), wrongs: shuffle(U.qa.filter(y => y.q !== x.q && y.a !== x.a), rng).map(y => oTxt(y.q)) }); }, U.qa.length);
  g.t_dialog = capped((key, seed, pos) => { const rng = makeRng(key, seed); const d = cyc(U.dialog, (pos ?? seed) + 1);
    return W({ sig: pre + 'D' + d.l.join(), text: `${d.l.map((l, k) => `${k % 2 ? 'B' : 'A'}: ${l}`).join('   ')}   Boşluğa hangisi gelmelidir?`, speak: `${en(d.l.join(' ... ').replace(/___/g, '...'))} || Boşluğa hangisi gelmelidir?`, correct: oTxt(d.a), wrongs: [...d.w, ...shuffle(U.dialog.filter(x => x.a !== d.a), rng).map(x => x.a)].map(oTxt) }); }, U.dialog.length);
  g.t_mean = capped((key, seed, pos) => { const rng = makeRng(key, seed); const p = pos ?? seed; const it = cyc(A, Math.floor(p / 2) + 13); const toTr = p % 2 === 0;
    return W(toTr ? { sig: pre + 'MT' + it.id, text: `"${it.en}" ifadesinin Türkçe anlamı hangisidir?`, speak: `${en(it.en)} || Türkçe anlamı hangisidir?`, correct: oTr(it), wrongs: near(it, rng).map(oTr) }
      : { sig: pre + 'ME' + it.id, text: `"${it.tr}" ifadesinin İngilizcesi hangisidir?`, correct: oEn(it), wrongs: near(it, rng).map(oEn) }); }, A.length * 2);
  g.t_spic = capped((key, seed, pos) => { const rng = makeRng(key, seed); const it = cyc(framed, (pos ?? seed) + 4); const s = frameOf(it);
    return W({ sig: pre + 'S' + it.id, text: `"${s}"  Cümleyi ifade eden görsel hangisidir?`, speak: `${en(s)} || Cümleyi ifade eden görsel hangisidir?`, correct: oPic(it), wrongs: picWrongs(it, near(it, rng, x => x.pic), rng, n - 1).map(oPic) }); }, framed.length);
  const rq = U.read.flatMap(r => r.qs.map(q => ({ r, q })));
  g.t_read = capped((key, seed, pos) => { const rng = makeRng(key, seed); const { r, q } = cyc(rq, (pos ?? seed) + 2);
    return W({ sig: pre + 'R' + q.q, text: `${r.t}\n\nMetne göre: ${q.q}`, speak: `${en(r.t)} || ${en(q.q)}`, correct: oTxt(q.a), wrongs: [...q.w, ...shuffle(rq.filter(x => x.q.a !== q.a), rng).map(x => x.q.a)].map(oTxt) }); }, rq.length);
  const sp = U.wordItems.filter(i => i.en.length >= 4);
  g.t_spell = capped((key, seed, pos) => { const rng = makeRng(key, seed); const it = cyc(sp, (pos ?? seed) + 6); const ms = misspell(it.en.toLowerCase(), rng);
    if (ms.length < n - 1) return null;
    return W({ sig: pre + 'SP' + it.id, text: `"${it.tr}" kelimesinin doğru yazılışı hangisidir?`, correct: oTxt(it.en), wrongs: ms.map(oTxt) }); }, sp.length);
  g.t_order = capped((key, seed, pos) => { const rng = makeRng(key, seed); const s = cyc(U.order, (pos ?? seed) + 3);
    return W({ sig: pre + 'OR' + s, text: 'Hangisi kuralına uygun (doğru sıralanmış) bir cümledir?', correct: oTxt(s), wrongs: wrongOrders(s, rng, n - 1).map(oTxt) }); }, U.order.length);
  // Üniteye özel kalıplar
  const seqSet = U.sets.find(s => s.id === 'months' || s.id === 'days');
  if (seqSet) g.t_seq = capped((key, seed, pos) => { const rng = makeRng(key, seed); const L = seqSet.items; const k = (pos ?? seed) % L.length;
    const a = L[k], b = L[(k + 1) % L.length], c = L[(k + 2) % L.length];
    return W({ sig: pre + 'SQ' + k, text: `${a.en}, ${b.en}, ... Sıradaki ${seqSet.id === 'months' ? 'ay' : 'gün'} hangisidir?`, speak: `${en(a.en + ', ' + b.en)} || Sıradaki ${seqSet.id === 'months' ? 'ay' : 'gün'} hangisidir?`, correct: oTxt(c.en), wrongs: shuffle(L.filter(x => x !== c && x !== a && x !== b), rng).map(x => oTxt(x.en)) }); }, seqSet.items.length);
  if (U.id === 'u2') {
    g.t_clock = capped((key, seed, pos) => { const rng = makeRng(key, seed); const h = ((pos ?? seed) % 12) + 1;
      return W({ sig: pre + 'CL' + h, text: 'What time is it? Saate göre doğru cevap hangisidir?', speak: `${en('What time is it?')} || Saate göre doğru cevap hangisidir?`, main: clockPic(h), correct: oTxt(`It is ${HOURS[h - 1]} o'clock.`), wrongs: shuffle(HOURS.filter((_, k) => k !== h - 1), rng).map(x => oTxt(`It is ${x} o'clock.`)) }); }, 12);
    const nums = U.sets.find(s => s.id === 'numbers').items;
    g.t_num = capped((key, seed, pos) => { const rng = makeRng(key, seed); const it = cyc(nums, pos ?? seed);
      return W({ sig: pre + 'NU' + it.id, text: `${it.tr} sayısının İngilizce yazılışı hangisidir?`, main: textPic([it.tr], { size: 48 }), correct: oEn(it), wrongs: shuffle(nums.filter(x => x !== it), rng).map(oEn) }); }, nums.length);
  }
  if (U.id === 'u6') {
    const drinks = U.sets.find(s => s.id === 'drinks').items; const foods = U.items.filter(x => x.set !== 'drinks' && x.set !== 'table');
    g.t_drink = capped((key, seed) => { const rng = makeRng(key, seed); const odd = pick(foods, rng); const ds = shuffle(drinks, rng).slice(0, n - 1);
      return W({ sig: pre + 'DR' + odd.id + ds.map(x => x.id).sort().join(), text: 'Aşağıdakilerden hangisi içecek DEĞİLDİR?', correct: oEn(odd), wrongs: ds.map(oEn) }); }, 200);
  }
  return g;
};

// ============================================================================
// --- BANKA KURUCULAR ----------------------------------------------------------
// ============================================================================
const GR = (prefix) => (id, label, gen, w, extra = {}) => (gen ? G(`${prefix}_${id}`, label, gen, w, { label, ...extra }) : null);
const K = (id, label, groups) => ({ id, label, groups: groups.filter(Boolean) });

export const makeUnitBank = (U0) => {
  const U = prepareUnit(U0);
  const L = makeLearnGens(U); const S = makeStructGens(U); const X = makeTestGens(U);
  const g = GR(`eng${U.no}`);
  const learn = [
    { id: 'kelime', label: '📗 Kelimeler', color: 'sky', concepts: [
      K('esles', 'Eşleştirme', [g('m_wp', 'Kelime – resim eşleştir', L.m_wp, 30), g('m_ap', 'Ses – resim eşleştir', L.m_ap, 25), g('m_wt', 'İngilizce – Türkçe eşleştir', L.m_wt, 25)]),
      K('dinle', 'Dinle, resmi bul', [g('l_pic', 'Dinle ve doğru resmi seç', L.l_pic, 40)]),
      K('resimses', 'Resme bak, sesi bul', [g('p_aud', 'Resme bak, doğru sesi seç', L.p_aud, 30)]),
      K('yazilis', 'Yazılışı ve sesi', [g('w_aud', 'Yazılışı verilen kelimenin sesi', L.w_aud, 25), g('a_word', 'Dinle, doğru yazılışı bul', L.a_word, 25)]),
      K('heceleme', 'Doğru yazılış ve harfler', [g('p_spell', 'Resme bak, doğru yazılışı bul', L.p_spell, 20), g('missing', 'Eksik harfi bul', L.missing, 20), g('scramble', 'Karışık harfler', L.scramble, 15)]),
      K('anlam', 'Anlamı', [g('en_tr', 'İngilizce → Türkçe', L.en_tr, 20), g('tr_en', 'Türkçe → İngilizce', L.tr_en, 20)]),
      K('dy', 'Doğru mu, yanlış mı?', [g('tf', 'Resim ve cümle: doğru / yanlış', L.tf, 20)]),
      K('uymayan', 'Gruba uymayan', [g('odd', 'Hangisi gruba uymuyor?', L.odd, 15)])
    ] },
    { id: 'kalip', label: '📘 Konu ve Kalıplar', color: 'indigo', concepts: [
      K('bosluk', 'Boşluk doldurma', [g('fill', 'Cümledeki boşluğu doldur', S.fill, 25), g('fill_pic', 'Resme göre boşluğu doldur', S.fill_pic, 20)]),
      K('sorucevap', 'Soru – cevap', [g('qa', 'Sorunun cevabını bul', S.qa, 20), g('aq', 'Cevabın sorusunu bul', S.aq, 15), g('m_qa', 'Soru – cevap eşleştir', S.m_qa, 20)]),
      K('cumleresim', 'Cümle – resim', [g('s_pic', 'Cümleye uygun resim', S.s_pic, 18), g('pic_s', 'Resme uygun cümle', S.pic_s, 18), g('ls_pic', 'Dinle, resmi bul (cümle)', S.ls_pic, 15)]),
      K('siralama', 'Kelimeleri sırala', [g('order', 'Kelimelerden cümle kur', S.order, 12), g('order_l', 'Dinle, doğru cümleyi bul', S.order_l, 10)]),
      K('diyalog', 'Diyalog tamamla', [g('dialog', 'Diyaloğu tamamla', S.dialog, 12)]),
      K('okuma', 'Okuma ve dinleme', [g('read', 'Metni oku, cevapla', S.read, 12), g('listen', 'Metni dinle, cevapla', S.listen, 10)]),
      ...(S.rule ? [K('kural', 'Okul kuralları (must / mustn’t)', [g('rule', 'Doğru kural mı?', S.rule, 12)])] : [])
    ] }
  ];
  const test = [
    { id: 'test', label: '📝 Ünite Sonu Testi', color: 'rose', concepts: [
      K('t_kelime', 'Kelime ve görsel', [g('t_pic', 'Görsele uygun ifade', X.t_pic, 25), g('t_notin', 'Görselde olmayan', X.t_notin, 12), g('t_spic', 'Cümleyi ifade eden görsel', X.t_spic, 15), g('t_spell', 'Doğru yazılış', X.t_spell, 10)]),
      K('t_anlam', 'Anlam ve gruplama', [g('t_mean', 'Türkçe / İngilizce anlamı', X.t_mean, 25), g('t_odd', 'Gruba uymayan', X.t_odd, 15), g('t_notfit', 'Boşluğa uygun olmayan', X.t_notfit, 12)]),
      K('t_kalip', 'Kalıplar', [g('t_fill', 'Boşluğa uygun ifade', X.t_fill, 20), g('t_qa', 'Sorunun cevabı', X.t_qa, 18), g('t_aq', 'Cevaba uygun soru', X.t_aq, 15), g('t_dialog', 'Diyalog', X.t_dialog, 10), g('t_order', 'Doğru cümle', X.t_order, 10)]),
      K('t_okuma', 'Okuma', [g('t_read', 'Metne göre cevapla', X.t_read, 12)]),
      ...((X.t_seq || X.t_clock || X.t_drink) ? [K('t_ozel', U.id === 'u1' ? 'Aylar' : U.id === 'u2' ? 'Günler, saat ve sayılar' : 'İçecekler', [g('t_seq', 'Sıradaki ay / gün', X.t_seq, 10), g('t_clock', 'Saat kaç?', X.t_clock, 10), g('t_num', 'Sayıların yazılışı', X.t_num, 10), g('t_drink', 'Hangisi içecek değil?', X.t_drink, 10)])] : [])
    ] }
  ];
  scaleTo(learn, 500); scaleTo(test, 200);
  return createBank({
    id: `eng${U.no}`, title: `İngilizce ${U.no}. Ünite · ${U.title}`, intro: `${U.tr}: 500 öğretici soru (kelimeler + kalıplar) ve 200 soruluk ünite sonu testi.`,
    rootFolder: '3. Sınıf İngilizce', fieldPrefix: `eng${U.no}`, settingsDoc: `eng${U.no}_settings`, mediaPrefix: `eng${U.no}_media_`,
    categories: [...learn, ...test], unique: true, maxOptions: 4,
    folderPath: (gr) => [`${U.no}. Ünite ${U.title}`, gr.categoryLabel.replace(/^\S+\s/, ''), gr.conceptLabel]
  });
};

export const makeGeneralBank = (units0) => {
  const units = units0.map(prepareUnit);
  const all = units.flatMap(u => u.items);
  const cats = units.map(U => {
    const X = makeTestGens(U, { n: 4, pre: 'G', all });
    const g = GR(`engG${U.no}`);
    return { id: `g${U.no}`, label: `${U.no}. ${U.title}`, color: U.color, concepts: [
      K('kelime', 'Kelime', [g('t_pic', 'Görsele uygun ifade', X.t_pic, 10), g('t_mean', 'Anlamı', X.t_mean, 8), g('t_odd', 'Gruba uymayan', X.t_odd, 6), g('t_spic', 'Cümleye uygun görsel', X.t_spic, 5)]),
      K('kalip', 'Kalıp', [g('t_fill', 'Boşluk', X.t_fill, 7), g('t_qa', 'Soru – cevap', X.t_qa, 6), g('t_aq', 'Cevaba uygun soru', X.t_aq, 4), g('t_dialog', 'Diyalog', X.t_dialog, 4)])
    ] };
  });
  cats.forEach(c => scaleTo([c], 50));
  return createBank({
    id: 'engG', title: 'İngilizce · Genel Tekrar (bütün üniteler)', intro: '6 ünitenin tamamından 300 soru (4 şık).',
    rootFolder: '3. Sınıf İngilizce', fieldPrefix: 'engG', settingsDoc: 'engG_settings', mediaPrefix: 'engG_media_',
    categories: cats, unique: true, maxOptions: 4,
    folderPath: (gr) => ['Genel Tekrar', gr.categoryLabel, gr.conceptLabel]
  });
};
