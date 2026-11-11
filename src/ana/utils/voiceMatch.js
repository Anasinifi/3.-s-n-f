// ============================================================================
// --- DOSYA ADIYLA SES EŞLEŞTİRME ---
// ============================================================================
// Ses dosyasının adı = okunacak metin (en fazla ~250 karakter, gerisi kesilebilir).
// Karşılaştırmada büyük/küçük harf, Türkçe karakter (ç ğ ı ö ş ü â), noktalama,
// boşluk ve alt çizgi yok sayılır. Ad kesilmişse metnin başıyla eşleştirilir.
//
// Bir metin birden çok yere gidebilir (ör. aynı şık metni birçok soruda): aynı dosya hepsine bağlanır.
// Şık sesi, şıkkın KENDİ metniyle eşleşir: doğru şıkkın sesi doğru şıkka gider, sıra karışmaz.

import { IMG_CODES, imgHash } from './imgCodes';

const AUDIO_EXT = /\.(mp3|wav|m4a|ogg|oga|aac|webm|flac|mp4|jpe?g|png|webp|gif|svg|avif)$/i; // ses + görsel uzantıları

export const foldKey = (text) => String(text || '')
  .replace(/<\/?en>/gi, ' ')
  .replace(/\|\|/g, ' ')
  .toLocaleLowerCase('tr-TR')
  .replace(/ı/g, 'i')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '');

export const fileKeyOf = (name) => foldKey(String(name || '').replace(AUDIO_EXT, ''));

// Aynı adlı dosyaların sonuna eklenen " (1)", "_2", "-3", " kopya" gibi ekleri ayıklar
const stripCopySuffix = (name) => String(name || '').replace(AUDIO_EXT, '').replace(/(\s*\(\d+\)|[\s_-]+\d+|[\s_-]*kopya(\s*\d+)?|[\s_-]*copy(\s*\d+)?)$/i, '');

// Bir şablonun seslendirilecek metinleri: [{ slot, text }]
//   audio: soru sesi • a0..a3: şık sesleri • storyIntro: hikâye girişi (ön ses 1) • story: hikâye (ön ses 2)
export const voicesOfTemplate = (t, textOverride) => {
  const out = [];
  const qText = textOverride ? textOverride : (t.speak || t.text || '');
  if (qText) out.push({ slot: 'audio', text: qText });
  (t.options || []).forEach((o, j) => { const v = o.tts || o.text; if (v) out.push({ slot: `a${o.slot ?? j}`, text: v }); });
  if (t.fields?.storyIntro) out.push({ slot: 'storyIntro', text: t.fields.storyIntro });
  if (t.fields?.storyText) out.push({ slot: 'story', text: String(t.fields.storyText).replace(/\s*\|\|\s*/g, ' ') });
  return out;
};

// Sesler dizini: metin anahtarı -> { text, targets: [{ key, idx, slot }] }
// Bir kalıbın bütün soruları aynı soru cümlesini okuyorsa: tek hedef { key, slot: 'group' } (toplu ses)
export const buildVoiceIndex = (bank, keys, textOverrides = {}) => {
  const map = new Map();
  const add = (text, target) => {
    const k = foldKey(text);
    if (!k) return;
    if (!map.has(k)) map.set(k, { key: k, text, targets: [] });
    map.get(k).targets.push(target);
  };
  keys.forEach(key => {
    const tpls = bank.getTemplates(key);
    const ov = textOverrides[key] || '';
    const qKeys = new Set(tpls.map(t => foldKey(ov || t.speak || t.text || '')));
    const groupWide = tpls.length > 1 && qKeys.size === 1;
    tpls.forEach((t, idx) => {
      voicesOfTemplate(t, ov).forEach(({ slot, text }) => {
        if (slot === 'audio' && groupWide) { if (idx === 0) add(text, { key, slot: 'group', count: tpls.length }); return; }
        add(text, { key, idx, slot });
      });
    });
  });
  const sortedKeys = [...map.keys()].sort();
  return { map, sortedKeys };
};

// Önek araması (ikili arama): k ile başlayan bütün anahtarlar
const prefixMatches = (sortedKeys, k) => {
  let lo = 0, hi = sortedKeys.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (sortedKeys[mid] < k) lo = mid + 1; else hi = mid; }
  const out = [];
  for (let i = lo; i < sortedKeys.length && sortedKeys[i].startsWith(k); i++) out.push(sortedKeys[i]);
  return out;
};

const MIN_PREFIX = 12; // çok kısa kesilmiş adlar (ör. "Hangisi") önekle eşleştirilmez

// Tek bir dosya adını eşleştir. Dönüş: { status: 'ok'|'ambiguous'|'none', voiceKey?, candidates? }
// Görsel numarası: dosya adının başındaki 4 haneli kod (ör. "0123 Kedi.jpg", "0123-kedi.png", "0123.jpg")
const CODE_RE = /^\s*(\d{4})(?=[\s._-]|$)/;
export const codeOfName = (name) => { const m = CODE_RE.exec(String(name || '').replace(AUDIO_EXT, '')); return m ? m[1] : null; };
const stripCode = (name) => String(name || '').replace(CODE_RE, '').replace(/^[\s._-]+/, '');

export const matchName = (index, name) => {
  if (index.codes) {
    const code = codeOfName(name);
    if (code) {
      const k = index.codes.get(code);
      if (k) return { status: 'ok', voiceKey: k, how: 'numara' };
      if (index.allCodes && index.allCodes.has(code)) return { status: 'none', why: 'kapsam dışı' };
      name = stripCode(name);
    }
  }
  const tryKey = (k) => {
    if (!k) return null;
    if (index.map.has(k)) return { status: 'ok', voiceKey: k, how: 'tam' };
    if (k.length < MIN_PREFIX) return null;
    const c = prefixMatches(index.sortedKeys, k);
    if (c.length === 1) return { status: 'ok', voiceKey: c[0], how: 'baş' };
    if (c.length > 1) return { status: 'ambiguous', candidates: c };
    return null;
  };
  const r = tryKey(fileKeyOf(name));
  if (r && r.status === 'ok') return r;
  const r2 = tryKey(foldKey(stripCopySuffix(name)));
  if (r2 && r2.status === 'ok') return r2;
  return r || r2 || { status: 'none' };
};

// Bütün dosyaları eşleştir. Aynı metne birden fazla dosya düşerse ilki kullanılır.
export const matchFiles = (index, files) => {
  const ok = []; const ambiguous = []; const none = []; const dup = [];
  const used = new Map();
  files.forEach(file => {
    const r = matchName(index, file.name);
    if (r.status === 'ok') {
      if (used.has(r.voiceKey)) { dup.push({ file, other: used.get(r.voiceKey) }); return; }
      used.set(r.voiceKey, file);
      ok.push({ file, voice: index.map.get(r.voiceKey), how: r.how });
    } else if (r.status === 'ambiguous') {
      ambiguous.push({ file, candidates: r.candidates.slice(0, 5).map(k => index.map.get(k).text) , total: r.candidates.length });
    } else none.push({ file });
  });
  // dosyası olmayan sesler
  const missing = [...index.map.values()].filter(v => !used.has(v.key));
  return { ok, ambiguous, none, dup, missing };
};

// ---------------------------------------------------------------------------
// GÖRSEL EŞLEŞTİRME: dosya adı = şık metni (şık görseli) ya da soru metni (üst görsel)
// ---------------------------------------------------------------------------
// Hedef: { key, idx, slot: 'o<slot>' | 'main' }. Şık görseli şıkkın KENDİ metnine gider (sıra karışmaz).
export const buildImageIndex = (bank, keys, { withMain = true } = {}) => {
  const map = new Map();
  const add = (text, target) => {
    const k = foldKey(text);
    if (!k) return;
    if (!map.has(k)) map.set(k, { key: k, text, targets: [] });
    map.get(k).targets.push(target);
  };
  keys.forEach(key => {
    bank.getTemplates(key).forEach((t, idx) => {
      (t.options || []).forEach((o, j) => { const v = o.imgName || o.text || o.tts; if (v) add(v, { key, idx, slot: `o${o.slot ?? j}` }); });
      // soru görseli: şablonun görsel adı (mainImgName) varsa her zaman, yoksa (seçilirse) soru metni
      if (t.mainImgName) add(t.mainImgName, { key, idx, slot: 'main', named: true });
      else if (withMain && t.text) add(t.text, { key, idx, slot: 'main' });
    });
  });
  // aynı metin hem şık hem soru olarak geçiyorsa: şık önceliklidir
  map.forEach(v => { if (v.targets.some(t => t.slot !== 'main')) v.targets = v.targets.filter(t => t.slot !== 'main' || t.named); });
  // numara → anahtar (yalnızca seçilen kapsamdaki görseller)
  const byHash = new Map(); map.forEach((v, k) => byHash.set(imgHash(k), k));
  const codes = new Map(); const allCodes = new Set();
  IMG_CODES.forEach((h, i) => { const c = String(i + 1).padStart(4, '0'); allCodes.add(c); const k = byHash.get(h); if (k) { codes.set(c, k); map.get(k).code = c; } });
  return { map, sortedKeys: [...map.keys()].sort(), codes, allCodes };
};
