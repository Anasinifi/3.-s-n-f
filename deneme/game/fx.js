// ============================================================================
// --- GRUP: EFEKTLER (SESLER + TEST SONU OLAYLARI) ---
// ============================================================================
// * Yönetici "Ekstra" sekmesinden her olay için: animasyon, efekt sesi,
//   konuşma sesi (ör. "aferin!"), resim/gif, başlık ve mesaj seçer.
// * Ses yüklenmemişse tarayıcıda üretilen hazır sesler çalar (internet gerekmez).
// * Ayarlar settings/game_config belgesinin "fx" alanında durur.

// --- TEST SONU OLAYLARI ---
export const FX_EVENTS = [
  { id: 'first_perfect', icon: '🌟', label: 'ilk seferde hepsi doğru', hint: 'test ilk kez çözüldü, hiç yanlış yok' },
  { id: 'first_completed', icon: '⭐', label: 'ilk seferde yanlışla bitirdi', hint: 'test bitti ama yanlışı var (açıklama ekranı da çıkar)' },
  { id: 'retry_perfect', icon: '🏆', label: 'yanlışlı testi tekrar çözüp TAM yaptı', hint: 'önceden yanlışı vardı, şimdi hepsi doğru: kalan yıldızları alır' },
  { id: 'retry_completed', icon: '🔁', label: 'yanlışlı testi tekrar çözdü, yine yanlış', hint: 'önceden yanlışlıydı, yine yanlışla bitti (açıklama ekranı da çıkar)' },
  { id: 'replay_perfect', icon: '🎉', label: 'zaten tam olan testi yine tam yaptı', hint: 'yıldız eklenmez, sadece kutlama' },
  { id: 'replay_completed', icon: '🙂', label: 'zaten tam olan testi bu sefer yanlışla bitirdi', hint: 'yıldızları gitmez' },
  { id: 'exit', icon: '🚪', label: 'testi bitirmeden çıktı', hint: 'x tuşuyla yarıda bıraktı' },
  { id: 'map_done', icon: '🗺️', label: 'bir haritanın tüm adalarını bitirdi', hint: 'haritaya dönünce bir kez çıkar' },
];

export const ANIMATIONS = [
  { id: 'giftBox', label: '🎁 hediye paketi patlar, yıldızlar fırlar' },
  { id: 'chest', label: '🧰 hazine sandığı açılır' },
  { id: 'fireworks', label: '🎆 havai fişek' },
  { id: 'starRain', label: '🌠 yıldız yağmuru' },
  { id: 'balloons', label: '🎈 balonlar patlar' },
  { id: 'trophy', label: '🏆 kupa yükselir' },
  { id: 'rocket', label: '🚀 roket fırlar' },
  { id: 'rainbow', label: '🌈 gökkuşağı' },
  { id: 'tryAgain', label: '🔍 "tekrar dene" büyüteci' },
  { id: 'wave', label: '👋 karakter el sallar' },
  { id: 'none', label: '— animasyon yok' },
];

export const DEFAULT_EVENTS = {
  first_perfect: { anim: 'giftBox', title: 'harika! hepsi doğru!', message: 'hediye paketin açılıyor... tüm yıldızlar senin!', synth: 'fanfare', showExplain: false },
  first_completed: { anim: 'balloons', title: 'testi bitirdin!', message: 'yıldızını kazandın. yanlışlarını düzeltirsen daha fazlası var!', synth: 'chime', showExplain: true },
  retry_perfect: { anim: 'chest', title: 'yanlışlarını düzelttin!', message: 'hazine sandığı açıldı, kalan yıldızlar senin!', synth: 'fanfare', showExplain: false },
  retry_completed: { anim: 'tryAgain', title: 'az kaldı!', message: 'birkaç yanlışın daha var. bir kez daha dene, yıldızlar seni bekliyor!', synth: 'boing', showExplain: true },
  replay_perfect: { anim: 'fireworks', title: 'yine kusursuz!', message: 'bu adanın ustası sensin!', synth: 'fanfare', showExplain: false },
  replay_completed: { anim: 'rainbow', title: 'güzel tekrar!', message: 'yıldızların yerinde duruyor. bir dahakine yine tam yapabilirsin!', synth: 'chime', showExplain: false },
  exit: { anim: 'wave', title: 'yarıda bıraktın', message: 'sorun değil! ada seni bekliyor, istediğin zaman geri gel.', synth: 'soft', showExplain: false },
  map_done: { anim: 'trophy', title: 'harita bitti!', message: 'bu haritanın bütün adalarını tamamladın. yeni haritan açıldı!', synth: 'fanfare', showExplain: false },
};

// Açıklama ekranı (yanlışla bitirince): zorluğa göre
export const DEFAULT_EXPLAIN = {
  easy: { text: 'bu kolay testten {kazandin} yıldız aldın. yanlış yaptığın soruları düzeltip testi TAM çözersen toplam {tam} yıldız olur!' },
  medium: { text: 'bu orta testten {kazandin} yıldız aldın. adaya geri dön, hepsini doğru yap: toplam {tam} yıldız olur!' },
  hard: { text: 'zor testi bitirdin, {kazandin} yıldız senin! hepsini doğru yaparsan toplam {tam} yıldıza çıkar!' },
};

// --- OYUN SESLERİ (her biri yüklenebilir) ---
export const GAME_SOUNDS = [
  { id: 'tap', label: 'düğmeye dokunma', synth: 'pop' },
  { id: 'buy', label: 'marketten satın alma', synth: 'coin' },
  { id: 'equip', label: 'kıyafet giyme / eşya seçme', synth: 'pop' },
  { id: 'place', label: 'odaya eşya koyma', synth: 'boing' },
  { id: 'door', label: 'kapı açılması', synth: 'whoosh' },
  { id: 'unlock', label: 'yeni ada açılması', synth: 'chime' },
  { id: 'chop', label: 'ağaç kesme (balta)', synth: 'chop' },
  { id: 'treeFall', label: 'ağacın devrilmesi', synth: 'thud' },
  { id: 'splash', label: 'suya atlama / yüzme', synth: 'splash' },
  { id: 'hop', label: 'taşlardan zıplama', synth: 'boing' },
  { id: 'fly', label: 'jetpack / uçma', synth: 'whoosh' },
  { id: 'starPop', label: 'yıldız fırlaması (animasyonda)', synth: 'sparkle' },
  { id: 'boxOpen', label: 'hediye / sandık açılması', synth: 'pop' },
];

export const getFxConfig = (cfg) => {
  const fx = cfg?.fx || {};
  const events = {};
  FX_EVENTS.forEach(e => { events[e.id] = { ...DEFAULT_EVENTS[e.id], enabled: true, ...(fx.events?.[e.id] || {}) }; });
  const explain = {};
  ['easy', 'medium', 'hard'].forEach(d => { explain[d] = { ...DEFAULT_EXPLAIN[d], ...(fx.explain?.[d] || {}) }; });
  return { events, explain, sounds: { ...(fx.sounds || {}) }, muteDefaults: !!fx.muteDefaults };
};

// ----------------------------------------------------------------------------
// SES MOTORU
// ----------------------------------------------------------------------------
let currentCfg = null;
export const setFxConfig = (cfg) => { currentCfg = cfg; };

const MUTE_KEY = 'ca_mute';
export const isMuted = () => { try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (_) { return false; } };
export const setMuted = (m) => { try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch (_) {} };

let ctx = null;
const ac = () => {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (_) { return null; }
};

const tone = (c, { f = 440, f2, t = 0, d = 0.15, type = 'sine', v = 0.18 }) => {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  const now = c.currentTime + t;
  o.frequency.setValueAtTime(f, now);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), now + d);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(v, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + d);
  o.connect(g); g.connect(c.destination);
  o.start(now); o.stop(now + d + 0.02);
};

const noise = (c, { t = 0, d = 0.2, v = 0.2, freq = 1200, q = 1, type = 'bandpass' }) => {
  const len = Math.floor(c.sampleRate * d);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const fl = c.createBiquadFilter();
  fl.type = type; fl.frequency.value = freq; fl.Q.value = q;
  const g = c.createGain();
  const now = c.currentTime + t;
  g.gain.setValueAtTime(v, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + d);
  src.connect(fl); fl.connect(g); g.connect(c.destination);
  src.start(now);
};

// Hazır (sentez) sesler
const SYNTHS = {
  pop: (c) => tone(c, { f: 520, f2: 900, d: 0.09, type: 'triangle', v: 0.2 }),
  coin: (c) => { tone(c, { f: 988, d: 0.08, type: 'square', v: 0.08 }); tone(c, { f: 1319, t: 0.08, d: 0.25, type: 'square', v: 0.08 }); },
  chime: (c) => [659, 784, 988, 1319].forEach((f, i) => tone(c, { f, t: i * 0.09, d: 0.35, type: 'triangle', v: 0.14 })),
  fanfare: (c) => { [523, 659, 784].forEach((f, i) => tone(c, { f, t: i * 0.12, d: 0.18, type: 'sawtooth', v: 0.07 })); tone(c, { f: 1047, t: 0.36, d: 0.6, type: 'sawtooth', v: 0.08 }); tone(c, { f: 784, t: 0.36, d: 0.6, type: 'triangle', v: 0.08 }); },
  sparkle: (c) => [1568, 2093, 2637].forEach((f, i) => tone(c, { f, t: i * 0.05, d: 0.18, type: 'sine', v: 0.08 })),
  boing: (c) => tone(c, { f: 180, f2: 520, d: 0.25, type: 'sine', v: 0.22 }),
  whoosh: (c) => noise(c, { d: 0.45, v: 0.25, freq: 900, q: 0.6 }),
  splash: (c) => { noise(c, { d: 0.5, v: 0.35, freq: 1800, q: 0.4, type: 'highpass' }); tone(c, { f: 300, f2: 120, d: 0.2, v: 0.1 }); },
  chop: (c) => { noise(c, { d: 0.08, v: 0.5, freq: 2200, q: 2 }); tone(c, { f: 160, f2: 90, d: 0.12, type: 'square', v: 0.12 }); },
  thud: (c) => { tone(c, { f: 110, f2: 40, d: 0.5, type: 'sine', v: 0.4 }); noise(c, { d: 0.4, v: 0.25, freq: 300, q: 0.7, type: 'lowpass' }); },
  soft: (c) => { tone(c, { f: 523, d: 0.3, v: 0.1 }); tone(c, { f: 392, t: 0.2, d: 0.45, v: 0.1 }); },
  sad: (c) => { tone(c, { f: 392, f2: 370, d: 0.3, type: 'triangle', v: 0.1 }); tone(c, { f: 349, f2: 330, t: 0.3, d: 0.5, type: 'triangle', v: 0.1 }); },
};
export const SYNTH_NAMES = Object.keys(SYNTHS);

const playing = new Set();
export const stopAllFx = () => { playing.forEach(a => { try { a.pause(); } catch (_) {} }); playing.clear(); };

// URL ise dosyayı çalar, değilse hazır sesi çalar. Dönüş: audio nesnesi (varsa)
export const playSound = (urlOrSynth, { volume = 1 } = {}) => {
  if (!urlOrSynth || isMuted()) return null;
  if (/^(https?:|data:|blob:)/.test(urlOrSynth)) {
    try {
      const a = new Audio(urlOrSynth);
      a.volume = Math.max(0, Math.min(1, volume));
      playing.add(a);
      a.onended = () => playing.delete(a);
      a.play().catch(() => {});
      return a;
    } catch (_) { return null; }
  }
  const fn = SYNTHS[urlOrSynth];
  const c = fn && ac();
  if (c) { try { fn(c); } catch (_) {} }
  return null;
};

// Oyun sesi: yönetici yüklediyse onu, yoksa hazır sesi çalar
export const sfx = (id) => {
  const def = GAME_SOUNDS.find(s => s.id === id);
  const url = currentCfg?.fx?.sounds?.[id];
  if (url) return playSound(url);
  if (currentCfg?.fx?.muteDefaults) return null;
  return playSound(def?.synth || 'pop');
};

// Kutlama olayının seçilecek türü
// prevStatus: 'new' | 'started' | 'completed' | 'perfect'   newStatus: 'completed' | 'perfect'
export const resultEventKind = (prevStatus, newStatus) => {
  if (prevStatus === 'perfect') return newStatus === 'perfect' ? 'replay_perfect' : 'replay_completed';
  if (prevStatus === 'completed') return newStatus === 'perfect' ? 'retry_perfect' : 'retry_completed';
  return newStatus === 'perfect' ? 'first_perfect' : 'first_completed';
};

export const fillTemplate = (text, vars) => String(text || '').replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));

// ----------------------------------------------------------------------------
// SESLİ OKUMA (çocuk okuma bilmiyor): "salon", "mutfak", "saç"...
// Yönetici Ekstra > oyun sesleri > "kelime sesleri" bölümünden bir kelimeye kendi sesini
// yüklerse o çalar; yoksa telefonun Türkçe sesiyle okunur.
// ----------------------------------------------------------------------------
export const wordKey = (text) => `say_${String(text || '').toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9]+/g, '_').replace(/^_|_$/g, '')}`;
let lastSay = { t: '', at: 0 };
export const say = (text) => {
  if (!text || isMuted()) return;
  const now = Date.now();
  if (lastSay.t === text && now - lastSay.at < 700) return;
  lastSay = { t: text, at: now };
  const url = currentCfg?.fx?.sounds?.[wordKey(text)];
  if (url) { playSound(url); return; }
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'tr-TR';
    u.rate = 0.9; u.pitch = 1.15;
    const tr = (synth.getVoices() || []).find(v => /^tr/i.test(v.lang));
    if (tr) u.voice = tr;
    synth.speak(u);
  } catch (_) {}
};
