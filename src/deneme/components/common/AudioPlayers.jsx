import React, { useRef, useState, useEffect } from 'react';
import { Pause, Volume2, Play } from 'lucide-react';
import { volumeOf } from '../../utils/audioLevel';

// --- ŞIKLAR İÇİN YANLIŞLIKLA SEÇİLMEYİ ÖNLEYEN ÖZEL SES OYNATICI ---
export const OptionAudioButton = ({ src, small = false }) => {
  const audioRef = useRef(null);
  // yüklenirken ölçülen ses düzeyi (yüksek sesler kısılır)
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volumeOf(src); }, [src]);
  const [playing, setPlaying] = useState(false);

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
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
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
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        className="hidden"
      />
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

export const FancyAudioPlayer = ({ src, label = "di̇nle", autoPlay = false, onEnded, color="indigo", size="normal" }) => {
  const audioRef = useRef(null);
  // yüklenirken ölçülen ses düzeyi (yüksek sesler kısılır)
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volumeOf(src); }, [src]);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [autoPlay, src]);

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
        className={`relative ${dimClasses} rounded-full flex items-center justify-center shadow-md transition-all duration-300 transform active:scale-95 ${playing ? 'scale-110' : ''} ${colorClasses}`}
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
export const speakTr = (text, { rate = 0.85, onEnd } = {}) => {
  try {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return false; }
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/<\/?en>/gi, ''));
    u.lang = 'tr-TR';
    u.rate = rate;
    u.pitch = 1.1;
    const voices = synth.getVoices ? synth.getVoices() : [];
    const tr = voices.find(v => (v.lang || '').toLowerCase().startsWith('tr'));
    if (tr) u.voice = tr;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    synth.speak(u);
    return true;
  } catch (_) { onEnd?.(); return false; }
};

export const SpeakButton = ({ text, autoPlay = false, size = 'small' }) => {
  const [playing, setPlaying] = useState(false);
  const play = () => { setPlaying(true); if (!speakTr(text, { onEnd: () => setPlaying(false) })) setPlaying(false); };
  useEffect(() => {
    if (!autoPlay || !text) return undefined;
    // sesler geç yüklenebiliyor: kısa bir gecikmeyle oku
    const t = setTimeout(play, 350);
    return () => { clearTimeout(t); try { window.speechSynthesis?.cancel(); } catch (_) {} };
  }, [text, autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps
  const dim = size === 'small' ? 'w-12 h-12 border-2' : 'w-20 h-20 border-4';
  return (
    <button type="button" onClick={play}
      className={`${dim} my-1 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 ${playing ? 'bg-orange-500 border-orange-200 text-white scale-110' : 'bg-white border-orange-100 text-orange-400'}`}
      title="sesli dinle">
      <Volume2 size={size === 'small' ? 22 : 36} />
    </button>
  );
};
