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
  // --- yeni animasyonlar ---
  { id: 'crown', label: '👑 taç iner, ışıl ışıl parlar' },
  { id: 'medal', label: '🥇 altın madalya sallanır' },
  { id: 'cannons', label: '🎊 iki konfeti topu ateşlenir' },
  { id: 'bubbles', label: '🫧 renkli baloncuklar yükselir' },
  { id: 'magicWand', label: '🪄 sihirli değnek pırıltı saçar' },
  { id: 'sunrise', label: '🌞 gülen güneş doğar' },
  { id: 'butterflies', label: '🦋 kelebekler uçuşur' },
  { id: 'diamondRain', label: '💎 elmas yağmuru' },
  { id: 'dance', label: '💃 karakter dans eder, notalar uçar' },
  { id: 'hearts', label: '💖 kalpler fışkırır' },
  { id: 'none', label: '— animasyon yok' },
];

export const DEFAULT_EVENTS = {
  first_perfect: { anim: 'giftBox', title: 'harika! hepsi doğru!', message: 'hediye paketin açılıyor... bütün ödüller senin!', synth: 'fanfare', showExplain: false },
  first_completed: { anim: 'balloons', title: 'testi bitirdin!', message: 'ödülünü kazandın. sadece yanlışlarını çözersen daha fazlası var!', synth: 'chime', showExplain: true },
  retry_perfect: { anim: 'chest', title: 'yanlışlarını düzelttin!', message: 'hazine sandığı açıldı, kalan ödüller senin!', synth: 'fanfare', showExplain: false },
  retry_completed: { anim: 'tryAgain', title: 'az kaldı!', message: 'birkaç yanlışın kaldı. sadece onları çöz, ödülün seni bekliyor!', synth: 'boing', showExplain: true },
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
  { id: 'crackle', label: 'havai fişek patlaması (test sonu)', synth: 'crackle' },
  { id: 'rocketUp', label: 'havai fişek yükselmesi', synth: 'rocketUp' },
  { id: 'cheer', label: 'kutlama / yaşasın (tam doğru)', synth: 'cheer' },
  { id: 'fixPrompt', label: '"yanlışını çöz, yıldızını kap!" sesi (yanlışlı bitince)', synth: null },
  { id: 'gorevWelcome', label: 'ödev sayfası karşılama sesi', synth: 'welcome' },
  { id: 'gorevNew', label: 'yeni ödev bildirimi', synth: 'chime' },
  { id: 'diamond', label: 'elmas kazanma', synth: 'sparkle' },
];

export const getFxConfig = (cfg) => {
  const fx = cfg?.fx || {};
  const events = {};
  FX_EVENTS.forEach(e => { events[e.id] = { ...DEFAULT_EVENTS[e.id], enabled: true, ...(fx.events?.[e.id] || {}) }; });
  const explain = {};
  ['easy', 'medium', 'hard'].forEach(d => { explain[d] = { ...DEFAULT_EXPLAIN[d], ...(fx.explain?.[d] || {}) }; });
  return { events, explain, sounds: { ...(fx.sounds || {}) }, muteDefaults: !!fx.muteDefaults, endTts: fx.endTts !== false };
};

// ----------------------------------------------------------------------------
// SES MOTORU
// ----------------------------------------------------------------------------
let currentCfg = null;
export const setFxConfig = (cfg) => { currentCfg = cfg; };
// test sonunda telefon sesiyle otomatik okuma açık mı (yönetici kapatabilir; efekt sesleri etkilenmez)
export const fxTtsOn = () => currentCfg?.fx?.endTts !== false;

const MUTE_KEY = 'ca_mute';
export const isMuted = () => { try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (_) { return false; } };
export const setMuted = (m) => { try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch (_) {} bgApply(); };

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
  crackle: (c) => { noise(c, { d: 0.18, v: 0.32, freq: 2600, q: 0.8 }); for (let i = 0; i < 7; i++) noise(c, { t: 0.06 + i * 0.045 + Math.random() * 0.03, d: 0.04, v: 0.16, freq: 3000 + Math.random() * 3000, q: 3 }); tone(c, { f: 90, f2: 50, d: 0.3, type: 'sine', v: 0.18 }); },
  rocketUp: (c) => tone(c, { f: 500, f2: 1600, d: 0.5, type: 'sine', v: 0.04 }),
  cheer: (c) => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, { f, t: i * 0.07, d: 0.28, type: 'triangle', v: 0.12 })); noise(c, { t: 0.3, d: 0.7, v: 0.07, freq: 2200, q: 0.5 }); },
  welcome: (c) => { [392, 523, 659, 784].forEach((f, i) => tone(c, { f, t: i * 0.11, d: 0.3, type: 'triangle', v: 0.13 })); tone(c, { f: 1047, t: 0.46, d: 0.55, type: 'sine', v: 0.1 }); },
  // --- yeni efekt sesleri ---
  drumroll: (c) => { for (let i = 0; i < 18; i++) noise(c, { t: i * 0.045, d: 0.05, v: 0.12 + i * 0.008, freq: 220, q: 0.8, type: 'lowpass' }); tone(c, { f: 110, f2: 60, t: 0.82, d: 0.35, v: 0.3 }); noise(c, { t: 0.82, d: 0.5, v: 0.22, freq: 5000, q: 0.5, type: 'highpass' }); },
  applause: (c) => { for (let i = 0; i < 40; i++) noise(c, { t: Math.random() * 1.3, d: 0.03, v: 0.1 + Math.random() * 0.1, freq: 1500 + Math.random() * 2500, q: 1.5 }); },
  magic: (c) => { [1047, 1319, 1568, 2093, 2637, 3136].forEach((f, i) => tone(c, { f, t: i * 0.06, d: 0.3, type: 'sine', v: 0.06 })); tone(c, { f: 400, f2: 1600, d: 0.5, type: 'triangle', v: 0.05 }); },
  bubble: (c) => [0, 0.12, 0.22].forEach((t, i) => tone(c, { f: 300 + i * 120, f2: 900 + i * 200, t, d: 0.1, type: 'sine', v: 0.16 })),
  harp: (c) => [523, 587, 659, 784, 880, 1047, 1175, 1319].forEach((f, i) => tone(c, { f, t: i * 0.05, d: 0.6, type: 'triangle', v: 0.08 })),
  bell: (c) => { tone(c, { f: 880, d: 1.2, type: 'sine', v: 0.15 }); tone(c, { f: 2217, d: 0.8, type: 'sine', v: 0.05 }); tone(c, { f: 1320, d: 1, type: 'sine', v: 0.05 }); },
  trumpet: (c) => { [[523, 0, 0.12], [523, 0.14, 0.12], [523, 0.28, 0.12], [698, 0.42, 0.6]].forEach(([f, t, d]) => { tone(c, { f, t, d, type: 'sawtooth', v: 0.08 }); tone(c, { f: f * 2, t, d, type: 'square', v: 0.02 }); }); },
  xylophone: (c) => [784, 659, 523, 659, 784, 1047].forEach((f, i) => tone(c, { f, t: i * 0.1, d: 0.25, type: 'sine', v: 0.16 })),
  levelUp: (c) => [392, 494, 587, 784, 988, 1175].forEach((f, i) => tone(c, { f, t: i * 0.07, d: 0.12, type: 'square', v: 0.06 })),
  tada: (c) => { [[392, 0], [523, 0.1]].forEach(([f, t]) => tone(c, { f, t, d: 0.12, type: 'sawtooth', v: 0.08 })); [523, 659, 784, 1047].forEach(f => tone(c, { f, t: 0.24, d: 0.9, type: 'triangle', v: 0.07 })); },
  whistle: (c) => tone(c, { f: 900, f2: 2400, d: 0.45, type: 'sine', v: 0.1 }),
  twinkle: (c) => [2093, 1760, 2349, 1976, 2637].forEach((f, i) => tone(c, { f, t: i * 0.08, d: 0.12, type: 'sine', v: 0.07 })),
  pianoRun: (c) => [262, 330, 392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, { f, t: i * 0.045, d: 0.35, type: 'triangle', v: 0.1 })),
  clap: (c) => [0, 0.25, 0.5].forEach(t => { noise(c, { t, d: 0.08, v: 0.4, freq: 1200, q: 0.9 }); noise(c, { t: t + 0.01, d: 0.06, v: 0.25, freq: 2500, q: 1.2 }); }),
  slideUp: (c) => tone(c, { f: 200, f2: 1200, d: 0.4, type: 'triangle', v: 0.14 }),
  marimba: (c) => [523, 659, 784, 659, 1047].forEach((f, i) => { tone(c, { f, t: i * 0.12, d: 0.2, type: 'sine', v: 0.15 }); tone(c, { f: f * 4, t: i * 0.12, d: 0.05, type: 'sine', v: 0.03 }); }),
  gong: (c) => { tone(c, { f: 110, d: 2, type: 'sine', v: 0.25 }); tone(c, { f: 166, d: 1.6, type: 'sine', v: 0.1 }); noise(c, { d: 0.6, v: 0.08, freq: 600, q: 0.5 }); },
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
      const at = Date.now();
      // telefon izin vermezse (ekrana henüz dokunulmadı): ilk dokunuşta çal (çok eskiyse çalma)
      a.play().catch(() => onFirstGesture(() => { if (Date.now() - at < 8000 && playing.has(a)) a.play().catch(() => {}); }));
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
  if (def && def.synth === null) return null; // hazır sesi yok (yönetici yükler)
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
// Sadece telefonda Türkçe ses varsa sesli okur (yoksa sessiz kalır, garip okuma olmasın)
export const sayIfVoice = (text) => {
  try {
    if (!text || isMuted()) return;
    const url = currentCfg?.fx?.sounds?.[wordKey(text)];
    if (url) { playSound(url); return; }
    const synth = window.speechSynthesis;
    if (!synth) return;
    const tr = (synth.getVoices() || []).find(v => /^tr/i.test(v.lang));
    if (!tr) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'tr-TR'; u.rate = 0.95; u.pitch = 1.2; u.voice = tr;
    synth.speak(u);
  } catch (_) {}
};

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


// ----------------------------------------------------------------------------
// TELEFON SES KİLİDİ: telefonlar ekrana dokunulmadan ses çalmaya izin vermez.
// İlk dokunuşta ses motoru açılır, bekleyen sesler o anda çalar.
// ----------------------------------------------------------------------------
const GESTURES = ['pointerdown', 'touchend', 'click', 'keydown'];
let gestureQueue = [];
let gestureHooked = false;
const runGesture = () => {
  gestureHooked = false;
  GESTURES.forEach(ev => window.removeEventListener(ev, runGesture, true));
  try { ac(); } catch (_) {}
  const q = gestureQueue; gestureQueue = [];
  q.forEach(fn => { try { fn(); } catch (_) {} });
};
export const onFirstGesture = (fn) => {
  if (typeof window === 'undefined') return;
  gestureQueue.push(fn);
  if (gestureHooked) return;
  gestureHooked = true;
  GESTURES.forEach(ev => window.addEventListener(ev, runGesture, true));
};
if (typeof window !== 'undefined') onFirstGesture(() => {}); // hazır sesler (zil, fanfar...) için ses motorunu ilk dokunuşta aç

// ----------------------------------------------------------------------------
// FON MÜZİĞİ: dünya (harita) ve ödev sayfası için ayrı müzik, sürekli (döngüde) çalar.
// Teste girilince durur. Çocuk 🎵 düğmesiyle kapatıp açabilir (telefonda hatırlanır).
// Müzik dosyası telefonda önbelleğe alınır: her açılışta yeniden indirilmez, okuma harcamaz.
// ----------------------------------------------------------------------------
const MUSIC_KEY = 'ca_music_off';
export const isMusicOff = () => { try { return localStorage.getItem(MUSIC_KEY) === '1'; } catch (_) { return false; } };
let bgEl = null;
let bgWant = '';
let bgVol = 0.35;
const bgEnsure = () => {
  if (!bgEl && typeof Audio !== 'undefined') { bgEl = new Audio(); bgEl.loop = true; bgEl.preload = 'auto'; bgEl._src = ''; }
  return bgEl;
};
function bgApply() {
  const el = bgEnsure();
  if (!el) return;
  const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  if (!bgWant || isMuted() || isMusicOff() || hidden) { try { el.pause(); } catch (_) {} return; }
  if (el._src !== bgWant) { el._src = bgWant; el.src = bgWant.split('#')[0]; }
  el.volume = Math.max(0, Math.min(1, bgVol));
  if (el.paused) el.play().catch(() => onFirstGesture(bgApply));
}
export const setBgMusic = (url, volume) => { bgWant = url || ''; if (volume != null && !Number.isNaN(Number(volume))) bgVol = Number(volume); bgApply(); };
export const stopBgMusic = () => { bgWant = ''; bgApply(); };
export const setMusicOff = (off) => { try { localStorage.setItem(MUSIC_KEY, off ? '1' : '0'); } catch (_) {} bgApply(); };
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => bgApply());
