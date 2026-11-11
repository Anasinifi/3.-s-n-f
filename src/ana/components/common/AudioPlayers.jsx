import React, { useRef, useState, useEffect } from 'react';
import { Pause, Volume2, Play } from 'lucide-react';
import { volumeOf } from '../../utils/audioLevel';

// --- ŞIKLAR İÇİN YANLIŞLIKLA SEÇİLMEYİ ÖNLEYEN ÖZEL SES OYNATICI ---
// src varsa yüklenen ses çalar; yoksa text telefonun Türkçe sesiyle okunur.
export const OptionAudioButton = ({ src, text, small = false }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  // yüklenirken ölçülen ses düzeyi (yüksek sesler kısılır)
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volumeOf(src); }, [src]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [src]);

  const togglePlay = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!src) {
      if (playing) { stopSpeak(); setPlaying(false); return; }
      setPlaying(true);
      if (!speakTr(text, { onEnd: () => setPlaying(false) })) setPlaying(false);
      return;
    }
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      stopSpeak();
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="inline-flex flex-col items-center justify-center my-0.5 z-20"
    >
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="auto"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          className="hidden"
        />
      )}
      <div
        role="button"
        tabIndex={0}
        onClick={togglePlay}
        onPointerDown={(e) => e.stopPropagation()}
        className={`flex items-center justify-center gap-1.5 rounded-2xl font-black uppercase transition-all shadow-md cursor-pointer select-none active:scale-95 ${
          small ? 'px-2.5 py-1.5 text-[10px] border-2' : 'px-3.5 py-2 text-xs border-2'
        } ${
          playing
            ? 'bg-orange-500 text-white border-orange-200 ring-4 ring-orange-200 animate-pulse'
            : 'bg-orange-50 text-orange-600 border-orange-300 hover:bg-orange-100'
        }`}
        title="Sesi Dinle (Şıkkı İşaretlemez)"
      >
        {playing ? <Pause size={small ? 14 : 18} fill="currentColor" /> : <Volume2 size={small ? 14 : 18} />}
        <span>{playing ? 'Dinleniyor...' : 'Sesi Dinle'}</span>
      </div>
    </div>
  );
};

export const FancyAudioPlayer = ({ src, label = "di̇nle", autoPlay = false, onEnded, color="indigo", size="normal", delay = AUTO_DELAY }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  // yüklenirken ölçülen ses düzeyi (yüksek sesler kısılır)
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volumeOf(src); }, [src]);

  // Yeni ekran açılınca çocuk hazırlansın diye kısa bir bekleme, sonra çal
  // Telefonlar, çocuk ekrana dokunmadan sesin kendiliğinden çalmasına izin vermez (özellikle uygulama
  // kayıtlı girişle doğrudan açılınca). Engellenirse: düğme yanıp söner ve çocuğun İLK dokunuşunda çalar.
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    if (!autoPlay) return undefined;
    let unhook = null;
    const t = setTimeout(() => {
      if (!audioRef.current) return;
      stopSpeak();
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {
        setBlocked(true);
        const evs = ['pointerdown', 'touchend', 'click', 'keydown'];
        const go = () => {
          if (unhook) unhook();
          const a = audioRef.current;
          if (!a) return;
          a.play().then(() => { setPlaying(true); setBlocked(false); }).catch(() => {});
        };
        evs.forEach(ev => window.addEventListener(ev, go, true));
        unhook = () => { evs.forEach(ev => window.removeEventListener(ev, go, true)); unhook = null; };
      });
    }, delay);
    return () => { clearTimeout(t); if (unhook) unhook(); setBlocked(false); if (audioRef.current) audioRef.current.pause(); };
  }, [autoPlay, src]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const isSmall = size === "small";
  const dimClasses = isSmall ? "w-12 h-12 border-2" : "w-28 h-28 border-8";
  const iconSize = isSmall ? 20 : 48;

  let colorClasses = "";
  let shadowColor = "";

  if (color === "orange") {
      colorClasses = playing ? "bg-orange-500 border-orange-200 text-white" : "bg-white border-orange-100 text-orange-400";
      shadowColor = "rgba(249, 115, 22, 0.5)";
  } else {
      colorClasses = playing ? "bg-indigo-600 border-indigo-300 text-white" : "bg-white border-slate-50 text-slate-300";
      shadowColor = "rgba(79, 70, 229, 0.5)";
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1 my-1 animate-in fade-in zoom-in duration-500">
       <audio
        ref={audioRef}
        src={src}
        onEnded={() => { setPlaying(false); if(onEnded) onEnded(); }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        className="hidden"
       />
       <button
        onClick={toggle}
        className={`relative ${dimClasses} rounded-full flex items-center justify-center shadow-md transition-all duration-300 transform active:scale-95 ${playing ? 'scale-110' : ''} ${blocked && !playing ? 'animate-bounce ring-4 ring-orange-300' : ''} ${colorClasses}`}
        style={{ boxShadow: playing ? `0 5px 15px -5px ${shadowColor}` : '' }}
       >
         {playing && (
           <div className={`absolute inset-0 rounded-full border-2 border-white animate-ping opacity-30`}></div>
         )}
         {playing ?
           <Pause size={iconSize} className="relative z-10" fill="currentColor"/> :
           <Play size={iconSize} className="ml-1 relative z-10" fill="currentColor"/>
         }
       </button>
       {label && (
         <span className={`font-black uppercase tracking-widest ${playing ? 'animate-pulse' : ''} ${isSmall ? 'text-[8px]' : 'text-sm'} ${color === 'orange' ? 'text-orange-500' : 'text-slate-300'}`}>
             {playing ? 'çalıyor...' : label}
         </span>
       )}
    </div>
  );
};

// ============================================================================
// --- SESLİ OKUMA (telefonun / tarayıcının Türkçe sesi) ---
// ============================================================================
// Soruda yüklenmiş ses (q.audio) yoksa ve q.ttsText varsa bu metin sesli okunur.
// Ör. geometrik şekil sorularında şeklin adı ("daire", "çember" ...).
// Uzun metinler (hikâyeler) cümle cümle okunur: bazı telefonlar tek parçada
// 15 saniyeden uzun metni yarıda keser.
// Okuma temposu: cümleler arasında kısa bir nefes, "||" işaretinde (ör. açıklama ile
// soru arasında) daha uzun bir bekleme. Yeni soruda okumaya başlamadan önce AUTO_DELAY beklenir.
export const AUTO_DELAY = 500;       // yeni soru / ekran açılınca bekleme (ms) (kısa: test hızlı başlasın)
const SENTENCE_GAP = 450;            // cümleler arası (ms)
const PART_GAP = 1300;               // "||" işaretinde (ms)
let speakToken = 0;
const splitSentences = (text) => {
  const parts = String(text).replace(/\s+/g, ' ').trim().match(/[^.!?:\u2026]+[.!?:\u2026]*["\u201d']?\s*/g) || [String(text)];
  const out = [];
  parts.forEach(p => {
    let s = p.trim();
    while (s.length > 200) { const cut = s.lastIndexOf(',', 200) > 40 ? s.lastIndexOf(',', 200) + 1 : 200; out.push(s.slice(0, cut)); s = s.slice(cut).trim(); }
    if (s && /[0-9A-Za-zÇĞİÖŞÜçğıöşüâîû]/.test(s)) out.push(s);
  });
  return out;
};
// [{ text, pause, lang }] : pause = bu parçadan SONRA beklenecek süre
// <en>...</en> arasındaki yazı telefonun İNGİLİZCE sesiyle okunur (İngilizce dersi soruları),
// geri kalanı Türkçe sesle. Ör: "Dinle ve seç. || <en>apple</en>"
const EN_GAP = 350;
const splitForSpeech = (text) => {
  const out = [];
  String(text).split('||').forEach((seg) => {
    const parts = [];
    const re = /<en>([\s\S]*?)<\/en>/gi; let last = 0; let m;
    while ((m = re.exec(seg))) { if (m.index > last) parts.push({ t: seg.slice(last, m.index), lang: 'tr' }); parts.push({ t: m[1], lang: 'en' }); last = re.lastIndex; }
    if (last < seg.length) parts.push({ t: seg.slice(last), lang: 'tr' });
    const segOut = [];
    parts.forEach(p => {
      if (p.lang === 'en') { const t = p.t.replace(/\s+/g, ' ').trim(); if (t) segOut.push({ text: t, pause: EN_GAP, lang: 'en' }); }
      else splitSentences(p.t).forEach(t => segOut.push({ text: t, pause: SENTENCE_GAP, lang: 'tr' }));
    });
    if (segOut.length) segOut[segOut.length - 1].pause = PART_GAP;
    out.push(...segOut);
  });
  return out;
};
// Ekranda gösterirken bekleme işaretini kaldır
export const cleanSpeech = (text) => String(text || '').replace(/<\/?en>/gi, '').replace(/\s*\|\|\s*/g, ' ').trim();
export const stopSpeak = () => { speakToken++; try { window.speechSynthesis?.cancel(); } catch (_) {} };
export const speakTr = (text, { rate = 0.8, onEnd } = {}) => {
  try {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return false; }
    const synth = window.speechSynthesis;
    synth.cancel();
    const my = ++speakToken;
    const chunks = splitForSpeech(text);
    if (!chunks.length) { onEnd?.(); return false; }
    const voices = synth.getVoices ? synth.getVoices() : [];
    const tr = voices.find(v => (v.lang || '').toLowerCase().startsWith('tr'));
    const en = voices.find(v => /^en[-_]us/i.test(v.lang || '')) || voices.find(v => /^en[-_]gb/i.test(v.lang || '')) || voices.find(v => (v.lang || '').toLowerCase().startsWith('en'));
    let k = 0;
    const next = () => {
      if (my !== speakToken) return; // başka bir okuma başladı / durduruldu
      if (k >= chunks.length) { onEnd?.(); return; }
      const c = chunks[k++];
      const u = new SpeechSynthesisUtterance(c.text);
      const isEn = c.lang === 'en';
      u.lang = isEn ? 'en-US' : 'tr-TR';
      u.rate = isEn ? Math.max(0.7, rate - 0.05) : rate;
      u.pitch = isEn ? 1.0 : 1.1;
      if (isEn ? en : tr) u.voice = isEn ? en : tr;
      let done = false;
      const after = () => {
        if (done) return; done = true;
        if (my !== speakToken) return;
        if (k >= chunks.length) { onEnd?.(); return; }
        setTimeout(next, c.pause);
      };
      u.onend = after;
      u.onerror = after; // durdurulduysa (token değişti) after hiçbir şey yapmaz
      synth.speak(u);
    };
    next();
    return true;
  } catch (_) { onEnd?.(); return false; }
};

export const SpeakButton = ({ text, autoPlay = false, size = 'small', delay = AUTO_DELAY, onEnd }) => {
  const [playing, setPlaying] = useState(false);
  const play = () => { setPlaying(true); if (!speakTr(text, { onEnd: () => { setPlaying(false); onEnd?.(); } })) { setPlaying(false); onEnd?.(); } };
  useEffect(() => {
    if (!autoPlay || !text) return undefined;
    // yeni soru açılınca 1 sn bekle, sonra oku (sesler de bu sürede yüklenir)
    const t = setTimeout(play, delay);
    return () => { clearTimeout(t); stopSpeak(); };
  }, [text, autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps
  const dim = size === 'small' ? 'w-12 h-12 border-2' : size === 'big' ? 'w-28 h-28 border-8' : 'w-20 h-20 border-4';
  return (
    <button type="button" onClick={() => (playing ? (stopSpeak(), setPlaying(false)) : play())}
      className={`${dim} my-1 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 ${playing ? 'bg-orange-500 border-orange-200 text-white scale-110' : 'bg-white border-orange-100 text-orange-400'}`}
      title="sesli dinle">
      <Volume2 size={size === 'small' ? 22 : size === 'big' ? 48 : 36} />
    </button>
  );
};

// ============================================================================
// --- HİKÂYE / DİNLEME METNİ OYNATICI ---
// ============================================================================
// Yüklenmiş ses (src) varsa onu çalar, yoksa metni telefonun sesiyle okur.
// Bittiğinde onEnded çağrılır (ör. soru sayfasına geçmek için).
// Giriş (introSrc / introText) verilirse önce giriş çalar, sonra (1 sn arayla) hikâye.
const SinglePlayer = ({ src, text, autoPlay, onEnded, size, color, label }) => {
  if (src) return <FancyAudioPlayer src={src} autoPlay={autoPlay} onEnded={onEnded} label={label} color={color} size={size} />;
  return (
    <div className="flex flex-col items-center gap-1">
      <SpeakButton text={text} autoPlay={autoPlay} size={size === 'small' ? 'small' : 'big'} delay={AUTO_DELAY} onEnd={onEnded} />
      {label && <span className="font-black uppercase tracking-widest text-orange-500 text-sm">{label}</span>}
    </div>
  );
};
export const StoryPlayer = ({ src, text, introSrc, introText, autoPlay = true, onEnded, size = 'normal', color = 'orange', label = 'dinle' }) => {
  const hasIntro = Boolean(introSrc || introText);
  const [stage, setStage] = useState(hasIntro ? 'intro' : 'story');
  if (stage === 'intro' && hasIntro) {
    // giriş bitince hikâye oynatıcısı açılır; o da kendi 1 sn beklemesiyle başlar
    return <SinglePlayer key="intro" src={introSrc} text={introText} autoPlay={autoPlay} onEnded={() => setStage('story')} size={size} color={color} label={label ? 'dinle' : ''} />;
  }
  return <SinglePlayer key="story" src={src} text={text} autoPlay={autoPlay || hasIntro} onEnded={onEnded} size={size} color={color} label={label} />;
};

// Bir sorunun hikâye parçaları: giriş (ön ses 1) ve hikâye (ön ses 2) ayrı ayrı.
// Eski kayıtlarda giriş, hikâye metninin başında "||" ile ayrılmış olarak durur: onu da ayırır.
export const storyPartsOf = (q) => {
  if (!q) return { introText: '', introAudio: '', storyText: '', storyAudio: '' };
  let introText = q.storyIntro || '';
  let storyText = q.storyText || '';
  if (!introText && storyText.includes('||')) {
    const k = storyText.indexOf('||');
    const head = storyText.slice(0, k).trim();
    if (/^Hikâyeyi dikkatle dinleyelim/i.test(head)) {
      storyText = storyText.slice(k + 2).trim();
      // eski kayıtta hikâye sesi tek dosya olarak yüklendiyse giriş zaten onun içinde: ayrıca okutma
      if (!q.storyAudio || q.storyIntroAudio) introText = head;
    }
  }
  return { introText, introAudio: q.storyIntroAudio || '', storyText, storyAudio: q.storyAudio || '' };
};
