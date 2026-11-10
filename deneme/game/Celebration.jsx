import React, { useEffect, useMemo, useState } from 'react';
import './game.css';
import { Avatar } from './Avatar';
import { playSound, sfx, fillTemplate, stopAllFx } from './fx';
import { DIFFICULTY_BY_ID } from './catalog';

// ============================================================================
// --- GRUP: TEST SONU KUTLAMA / AÇIKLAMA EKRANI ---
// ============================================================================
// kind: FX_EVENTS içindeki olay (first_perfect, retry_completed, exit ...)
// ev  : o olayın ayarı { anim, title, message, sound, voice, image, synth, showExplain }
// explain: zorluğa göre açıklama ayarı { text, image, voice }
// data: { starsGained, reward:{perfect,completed}, difficulty, correct, wrong, testName, newStatus }

const INK = '#2b2233';

export function StarShape({ size = 40, filled = true, glow = false, style, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="-2 -2 54 54" style={{ overflow: 'visible', ...style }} className={className}>
      {glow && <circle cx="25" cy="26" r="24" fill="#fde047" opacity="0.35" />}
      <path d="M25 2 L31.5 17.5 L48 18.5 L35.5 29.5 L39.5 46 L25 37 L10.5 46 L14.5 29.5 L2 18.5 L18.5 17.5 Z"
        fill={filled ? '#facc15' : '#ffffff'} fillOpacity={filled ? 1 : 0.25} stroke={filled ? '#b45309' : '#94a3b8'} strokeWidth="3" strokeLinejoin="round"
        strokeDasharray={filled ? 'none' : '5 4'} />
      {filled && <path d="M18 18 L23 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />}
    </svg>
  );
}

// Yıldızların patlama yönleri (yukarı yarım daire)
const burstVectors = (n, radius = 150) => Array.from({ length: n }).map((_, i) => {
  const a = Math.PI * (1.08 + (0.84 * (n === 1 ? 0.5 : i / (n - 1))));
  const r = radius * (0.75 + ((i * 37) % 10) / 30);
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, rot: (i % 2 ? 1 : -1) * (180 + i * 40) };
});

function BurstStars({ count, delay = 1.2, radius }) {
  const vecs = useMemo(() => burstVectors(count, radius), [count, radius]);
  useEffect(() => {
    const ts = vecs.slice(0, 6).map((_, i) => setTimeout(() => sfx('starPop'), (delay + i * 0.07) * 1000));
    return () => ts.forEach(clearTimeout);
  }, [vecs, delay]);
  return (
    <div className="absolute left-1/2 top-1/2 pointer-events-none" style={{ width: 0, height: 0 }}>
      {vecs.map((v, i) => (
        <div key={i} className="ca-burst absolute" style={{ '--dx': `${v.dx}px`, '--dy': `${v.dy}px`, '--rot': `${v.rot}deg`, animationDelay: `${delay + i * 0.07}s`, left: -22, top: -22 }}>
          <StarShape size={44} />
        </div>
      ))}
    </div>
  );
}

function Rays({ color = '#fde68a', delay = 0 }) {
  return (
    <svg className="absolute left-1/2 top-1/2 ca-rays pointer-events-none" style={{ width: 520, height: 520, marginLeft: -260, marginTop: -260, animationDelay: `${delay}s` }} viewBox="-100 -100 200 200">
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d="M0 0 L-9 -100 L9 -100 Z" fill={color} opacity={i % 2 ? 0.28 : 0.45} transform={`rotate(${i * 22.5})`} />
      ))}
    </svg>
  );
}

function Confetti({ n = 40, delay = 0 }) {
  const bits = useMemo(() => Array.from({ length: n }).map((_, i) => ({
    left: (i * 53) % 100, d: 2.4 + ((i * 7) % 10) / 6, del: delay + ((i * 13) % 20) / 10,
    c: ['#f43f5e', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#fb923c'][i % 6], w: 6 + (i % 3) * 3, r: i % 2,
  })), [n, delay]);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {bits.map((b, i) => (
        <span key={i} className="ca-confetti absolute" style={{ left: `${b.left}%`, top: -20, width: b.w, height: b.r ? b.w : b.w * 1.8, background: b.c, borderRadius: b.r ? 99 : 2, animationDuration: `${b.d}s`, animationDelay: `${b.del}s` }} />
      ))}
    </div>
  );
}

// --- ANİMASYONLAR (sahne 320x320) ---
function GiftBox({ stars }) {
  return (
    <div className="relative w-[320px] h-[320px] flex items-end justify-center">
      <Rays delay={1.1} />
      <svg width="220" height="220" viewBox="0 0 220 220" className="relative" style={{ overflow: 'visible' }}>
        <ellipse cx="110" cy="206" rx="80" ry="10" fill="#000" opacity="0.18" />
        <g className="ca-shake" style={{ transformOrigin: '110px 200px' }}>
          <rect x="34" y="96" width="152" height="108" rx="10" fill="#ef4444" stroke={INK} strokeWidth="5" />
          <rect x="34" y="96" width="152" height="24" fill="#000" opacity="0.12" />
          <rect x="98" y="96" width="24" height="108" fill="#facc15" stroke={INK} strokeWidth="4" />
          <path d="M44 110 L60 190" stroke="#fff" strokeWidth="6" opacity="0.35" strokeLinecap="round" />
        </g>
        <g className="ca-lidoff">
          <rect x="22" y="70" width="176" height="32" rx="8" fill="#f87171" stroke={INK} strokeWidth="5" />
          <rect x="98" y="70" width="24" height="32" fill="#fde047" stroke={INK} strokeWidth="4" />
          <path d="M110 70 C80 30 50 46 70 66 Z" fill="#fde047" stroke={INK} strokeWidth="4" />
          <path d="M110 70 C140 30 170 46 150 66 Z" fill="#fde047" stroke={INK} strokeWidth="4" />
        </g>
      </svg>
      <BurstStars count={stars} delay={1.3} />
    </div>
  );
}

function Chest({ stars }) {
  return (
    <div className="relative w-[320px] h-[320px] flex items-end justify-center">
      <Rays color="#fcd34d" delay={1} />
      <svg width="240" height="200" viewBox="0 0 240 200" className="relative" style={{ overflow: 'visible' }}>
        <ellipse cx="120" cy="190" rx="96" ry="10" fill="#000" opacity="0.2" />
        <g className="ca-shake" style={{ transformOrigin: '120px 190px', animationDuration: '1s' }}>
          <rect x="24" y="96" width="192" height="92" rx="10" fill="#92400e" stroke={INK} strokeWidth="5" />
          {[50, 110, 170].map(x => <rect key={x} x={x} y="96" width="16" height="92" fill="#facc15" stroke={INK} strokeWidth="3" />)}
          <ellipse cx="120" cy="104" rx="84" ry="10" fill="#fde047" className="ca-glowpulse" />
          <rect x="106" y="120" width="28" height="30" rx="5" fill="#fde047" stroke={INK} strokeWidth="4" />
          <circle cx="120" cy="134" r="5" fill={INK} />
        </g>
        <g className="ca-chestlid" style={{ transformOrigin: '24px 96px' }}>
          <path d="M24 96 Q24 40 120 40 Q216 40 216 96 Z" fill="#b45309" stroke={INK} strokeWidth="5" />
          {[50, 110, 170].map(x => <rect key={x} x={x} y="44" width="16" height="52" fill="#facc15" stroke={INK} strokeWidth="3" />)}
        </g>
      </svg>
      <BurstStars count={stars} delay={1.2} />
    </div>
  );
}

function Fireworks({ stars }) {
  const spots = [[-90, -110, '#f43f5e', 0.2], [80, -130, '#22d3ee', 0.8], [0, -60, '#facc15', 1.4], [-60, 20, '#a855f7', 2.0], [90, 0, '#22c55e', 2.5]];
  return (
    <div className="relative w-[320px] h-[320px]">
      {spots.map(([x, y, c, d], k) => (
        <div key={k} className="absolute left-1/2 top-1/2" style={{ transform: `translate(${x}px, ${y}px)` }}>
          <div className="ca-rocketline absolute" style={{ background: c, animationDelay: `${d}s`, left: -2, top: 0 }} />
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="ca-firework absolute rounded-full" style={{ background: c, width: 9, height: 9, left: -4, top: -4, '--a': `${i * 30}deg`, animationDelay: `${d + 0.45}s`, boxShadow: `0 0 10px ${c}` }} />
          ))}
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center"><StarShape size={110} glow className="ca-starpulse" /></div>
      <BurstStars count={stars} delay={0.6} radius={130} />
    </div>
  );
}

function StarRain({ stars }) {
  const drops = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({ x: (i * 41) % 300, d: (i * 0.17) % 1.6, s: 22 + (i % 4) * 8, dur: 1.6 + (i % 5) * 0.25 })), []);
  return (
    <div className="relative w-[320px] h-[320px] overflow-visible">
      {drops.map((d, i) => <div key={i} className="ca-fallstar absolute" style={{ left: d.x, top: -60, animationDelay: `${d.d}s`, animationDuration: `${d.dur}s` }}><StarShape size={d.s} /></div>)}
      <div className="absolute inset-0 flex items-center justify-center"><StarShape size={120} glow className="ca-starpulse" /></div>
      <BurstStars count={stars} delay={1.8} radius={120} />
    </div>
  );
}

function Balloons({ stars }) {
  const cols = ['#f43f5e', '#3b82f6', '#22c55e', '#facc15', '#a855f7'];
  return (
    <div className="relative w-[320px] h-[320px]">
      {cols.map((c, i) => (
        <div key={i} className="absolute ca-balloon" style={{ left: 20 + i * 58, bottom: -40, animationDelay: `${i * 0.12}s` }}>
          <svg width="56" height="110" viewBox="0 0 56 110" className="ca-balloonpop" style={{ animationDelay: `${1.6 + i * 0.12}s`, overflow: 'visible' }}>
            <path d="M28 64 Q24 84 30 108" stroke={INK} strokeWidth="2" fill="none" />
            <ellipse cx="28" cy="32" rx="24" ry="30" fill={c} stroke={INK} strokeWidth="4" />
            <path d="M24 62 L32 62 L28 68 Z" fill={c} stroke={INK} strokeWidth="3" />
            <ellipse cx="19" cy="20" rx="6" ry="9" fill="#fff" opacity="0.5" />
          </svg>
        </div>
      ))}
      <BurstStars count={stars} delay={1.75} radius={140} />
    </div>
  );
}

function Trophy({ stars }) {
  return (
    <div className="relative w-[320px] h-[320px] flex items-center justify-center">
      <Rays color="#fef08a" delay={0.6} />
      <svg width="190" height="230" viewBox="0 0 190 230" className="relative ca-riseup" style={{ overflow: 'visible' }}>
        <path d="M44 30 Q4 30 10 70 Q16 106 60 112" stroke={INK} strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M44 30 Q4 30 10 70 Q16 106 60 112" stroke="#facc15" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M146 30 Q186 30 180 70 Q174 106 130 112" stroke={INK} strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M146 30 Q186 30 180 70 Q174 106 130 112" stroke="#facc15" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M38 14 L152 14 L146 86 Q140 136 95 140 Q50 136 44 86 Z" fill="#facc15" stroke={INK} strokeWidth="5" />
        <path d="M62 30 L68 100" stroke="#fff" strokeWidth="7" opacity="0.5" strokeLinecap="round" />
        <rect x="82" y="138" width="26" height="34" fill="#eab308" stroke={INK} strokeWidth="5" />
        <rect x="50" y="170" width="90" height="22" rx="5" fill="#a16207" stroke={INK} strokeWidth="5" />
        <rect x="40" y="190" width="110" height="26" rx="6" fill="#78350f" stroke={INK} strokeWidth="5" />
        <path d="M95 46 L101 62 L118 62 L104 72 L110 88 L95 78 L80 88 L86 72 L72 62 L89 62 Z" fill="#fff7cc" stroke={INK} strokeWidth="3" />
      </svg>
      <BurstStars count={stars} delay={1.1} />
    </div>
  );
}

function Rocket({ stars }) {
  return (
    <div className="relative w-[320px] h-[320px]">
      <div className="absolute left-1/2 bottom-0 ca-rocketfly" style={{ marginLeft: -36 }}>
        <svg width="72" height="150" viewBox="0 0 72 150" style={{ overflow: 'visible' }}>
          <path d="M22 110 Q36 160 50 110 Z" fill="#fb923c" className="ca-flame" />
          <path d="M28 110 Q36 140 44 110 Z" fill="#fde047" className="ca-flame" />
          <path d="M36 4 Q66 40 58 112 L14 112 Q6 40 36 4 Z" fill="#f8fafc" stroke={INK} strokeWidth="5" />
          <circle cx="36" cy="54" r="12" fill="#38bdf8" stroke={INK} strokeWidth="4" />
          <path d="M14 82 L0 116 L16 112 Z M58 82 L72 116 L56 112 Z" fill="#ef4444" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M36 4 Q48 16 54 30 L18 30 Q24 16 36 4 Z" fill="#ef4444" stroke={INK} strokeWidth="4" />
        </svg>
      </div>
      <BurstStars count={stars} delay={1.3} radius={150} />
    </div>
  );
}

function Rainbow({ stars }) {
  const cols = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'];
  return (
    <div className="relative w-[320px] h-[320px] flex items-center justify-center">
      <svg width="320" height="220" viewBox="0 0 320 220" style={{ overflow: 'visible' }}>
        {cols.map((c, i) => (
          <path key={c} d={`M${30 + i * 12} 200 A${130 - i * 12} ${130 - i * 12} 0 0 1 ${290 - i * 12} 200`} fill="none" stroke={c} strokeWidth="13" className="ca-drawarc" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
        {[[34, 196], [286, 196]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle cx="-20" cy="0" r="22" fill="#fff" stroke={INK} strokeWidth="4" /><circle cx="14" cy="-6" r="26" fill="#fff" stroke={INK} strokeWidth="4" /><circle cx="40" cy="4" r="18" fill="#fff" stroke={INK} strokeWidth="4" />
            <rect x="-40" y="0" width="98" height="22" fill="#fff" />
          </g>
        ))}
      </svg>
      <div className="absolute" style={{ top: 70 }}><StarShape size={90} glow className="ca-starpulse" /></div>
      <BurstStars count={stars} delay={1.3} radius={110} />
    </div>
  );
}

function Magnifier({ game, itemMap }) {
  return (
    <div className="relative w-[320px] h-[320px] flex items-end justify-center">
      <div className="absolute left-2 bottom-4 ca-bob"><Avatar game={game} itemMap={itemMap} size={150} /></div>
      <svg className="absolute right-4 top-10 ca-searching" width="140" height="140" viewBox="0 0 140 140" style={{ overflow: 'visible' }}>
        <line x1="88" y1="88" x2="130" y2="130" stroke={INK} strokeWidth="16" strokeLinecap="round" />
        <line x1="88" y1="88" x2="128" y2="128" stroke="#a16207" strokeWidth="9" strokeLinecap="round" />
        <circle cx="58" cy="58" r="46" fill="#e0f2fe" fillOpacity="0.6" stroke={INK} strokeWidth="9" />
        <circle cx="58" cy="58" r="46" fill="none" stroke="#94a3b8" strokeWidth="4" />
        <path d="M30 42 Q38 26 56 22" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
        <text x="58" y="76" fontSize="48" textAnchor="middle" fontWeight="900" fill="#ef4444">?</text>
      </svg>
    </div>
  );
}

function Wave({ game, itemMap }) {
  return (
    <div className="relative w-[320px] h-[300px] flex items-end justify-center">
      <svg className="absolute right-6 bottom-6" width="110" height="200" viewBox="0 0 110 200">
        <rect x="8" y="10" width="94" height="186" rx="8" fill="#92400e" stroke={INK} strokeWidth="5" />
        <rect x="20" y="22" width="70" height="164" rx="4" fill="#fbbf24" stroke={INK} strokeWidth="4" className="ca-doorswing" style={{ transformOrigin: '20px 100px' }} />
        <circle cx="78" cy="104" r="6" fill={INK} />
      </svg>
      <div className="relative ca-waddle" style={{ marginRight: 80 }}>
        <Avatar game={game} itemMap={itemMap} size={150} />
        <svg className="absolute ca-wavehand" style={{ right: -26, top: 70, transformOrigin: '20px 60px' }} width="50" height="70" viewBox="0 0 50 70">
          <path d="M20 66 L20 30" stroke={INK} strokeWidth="14" strokeLinecap="round" /><path d="M20 66 L20 30" stroke={game?.skin || '#f6c9a0'} strokeWidth="8" strokeLinecap="round" />
          <circle cx="20" cy="22" r="15" fill={game?.skin || '#f6c9a0'} stroke={INK} strokeWidth="4" />
          {[-9, -3, 3, 9].map((x, i) => <path key={i} d={`M${20 + x} 14 L${20 + x * 1.3} 2`} stroke={INK} strokeWidth="9" strokeLinecap="round" />)}
          {[-9, -3, 3, 9].map((x, i) => <path key={`f${i}`} d={`M${20 + x} 14 L${20 + x * 1.3} 2`} stroke={game?.skin || '#f6c9a0'} strokeWidth="4.5" strokeLinecap="round" />)}
        </svg>
      </div>
    </div>
  );
}

const ANIM_COMPONENTS = { giftBox: GiftBox, chest: Chest, fireworks: Fireworks, starRain: StarRain, balloons: Balloons, trophy: Trophy, rocket: Rocket, rainbow: Rainbow, tryAgain: Magnifier, wave: Wave };

// --- AÇIKLAMA PANELİ: "1 yıldız aldın, tam çözersen 3 olur" ---
export function ExplainPanel({ reward, difficulty, explain }) {
  const total = Math.max(1, Number(reward?.perfect) || 0);
  const got = Math.min(total, Number(reward?.completed) || 0);
  const missing = Math.max(0, total - got);
  const diff = DIFFICULTY_BY_ID[difficulty] || DIFFICULTY_BY_ID.easy;
  const text = fillTemplate(explain?.text, { kazandin: got, tam: total, eksik: missing, zorluk: diff.label.toLocaleLowerCase('tr') });
  const shown = Math.min(total, 10);
  return (
    <div className="ca-pop mt-3 bg-white/95 rounded-3xl p-3 border-4 border-amber-200 shadow-lg" style={{ animationDelay: '1.6s' }}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold text-white" style={{ background: diff.color }}>{diff.label} test</span>
        <span className="text-xs font-extrabold text-slate-500">yıldızların</span>
      </div>
      {explain?.image && <img src={explain.image} alt="" draggable="false" className="mx-auto max-h-28 object-contain mb-1" />}
      <div className="flex items-center justify-center flex-wrap gap-1">
        {Array.from({ length: shown }).map((_, i) => (
          <div key={i} className={i < got ? 'ca-pop' : 'ca-ghoststar'} style={{ animationDelay: `${1.8 + i * 0.15}s` }}>
            <StarShape size={total > 6 ? 30 : 42} filled={i < got} />
          </div>
        ))}
        {total > shown && <span className="font-extrabold text-amber-600">+{total - shown}</span>}
      </div>
      <div className="flex items-center justify-center gap-2 mt-1 text-sm font-extrabold">
        <span className="text-amber-600">⭐ {got} aldın</span>
        <span className="text-slate-300">→</span>
        <span className="ca-nudge inline-flex items-center gap-1 text-indigo-600"><span className="ca-spin-slow inline-block">↻</span> tam çöz: {total}</span>
      </div>
      <div className="text-[15px] leading-snug font-bold text-slate-600 mt-1.5 text-center">{text}</div>
    </div>
  );
}

export function Celebration({ kind, ev, explain, data = {}, game, itemMap, onDone, onRetry, preview = false }) {
  const [ready, setReady] = useState(false);
  const positive = ['first_perfect', 'retry_perfect', 'replay_perfect', 'map_done'].includes(kind);
  // görsel olarak fırlayan yıldız sayısı (kazanılan yıldıza göre, en az 5)
  const starCount = kind === 'exit' ? 0 : Math.max(positive ? 6 : 3, Math.min(12, (Number(data.starsGained) || 0) * 2));
  const Anim = ANIM_COMPONENTS[ev?.anim] || null;
  const showExplain = ev?.showExplain && data.newStatus !== 'perfect' && data.reward && Number(data.reward.perfect) > Number(data.reward.completed);

  useEffect(() => {
    const t0 = setTimeout(() => setReady(true), Anim ? 2000 : 300);
    // 1) efekt sesi (yüklenen ya da hazır), 2) konuşma sesi, 3) açıklama sesi
    playSound(ev?.sound || ev?.synth);
    let voiceAudio = null, explainAudio = null;
    const t1 = setTimeout(() => {
      if (ev?.voice) {
        voiceAudio = playSound(ev.voice);
        if (voiceAudio && showExplain && explain?.voice) voiceAudio.onended = () => { explainAudio = playSound(explain.voice); };
      } else if (showExplain && explain?.voice) explainAudio = playSound(explain.voice);
    }, 900);
    return () => { clearTimeout(t0); clearTimeout(t1); try { voiceAudio?.pause(); explainAudio?.pause(); } catch (_) {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => { stopAllFx(); onDone?.(); };
  const bg = kind === 'exit'
    ? 'radial-gradient(circle at 50% 40%, #e0e7ff 0%, #a5b4fc 55%, #4338ca 100%)'
    : positive
      ? 'radial-gradient(circle at 50% 38%, #fff7cc 0%, #fbbf24 45%, #c2410c 100%)'
      : 'radial-gradient(circle at 50% 38%, #ecfeff 0%, #67e8f9 50%, #0e7490 100%)';

  return (
    <div className="ca-game fixed inset-0 z-[150000] overflow-y-auto ca-scroll select-none" style={{ background: bg }} onClick={() => ready || setReady(true)}>
      {positive && <Confetti delay={1.2} />}
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-6">
        {preview && <div className="mb-2 bg-black/40 text-white text-xs font-extrabold px-3 py-1 rounded-full">önizleme · {kind}</div>}
        {ev?.image && <img src={ev.image} alt="" draggable="false" className="ca-pop max-h-40 max-w-[80vw] object-contain drop-shadow-xl mb-1" />}
        {Anim && <div className="relative" style={{ transform: 'scale(var(--ca-stage-scale,1))' }}><Anim stars={starCount} game={game} itemMap={itemMap} /></div>}

        <div className="ca-pop text-center mt-1" style={{ animationDelay: Anim ? '1.1s' : '0s' }}>
          <div className="text-4xl sm:text-5xl font-extrabold text-white" style={{ textShadow: `0 3px 0 ${INK}, 0 0 18px rgba(0,0,0,.25)` }}>{ev?.title}</div>
          {data.testName && <div className="text-sm font-extrabold text-white/85 mt-0.5">{data.testName}</div>}
        </div>

        {kind !== 'exit' && Number(data.starsGained) > 0 && (
          <div className="ca-pop mt-3 flex items-center gap-2 bg-white rounded-full pl-2 pr-5 py-1.5 border-4 border-amber-300 shadow-xl" style={{ animationDelay: '1.5s' }}>
            <StarShape size={46} />
            <span className="text-4xl font-extrabold text-amber-600">+{data.starsGained}</span>
            <span className="text-xs font-extrabold text-amber-500 leading-tight">yıldız<br />kazandın</span>
          </div>
        )}

        <div className="w-full max-w-md">
          {ev?.message && <div className="ca-pop mt-3 bg-white/90 rounded-3xl px-4 py-3 text-center text-lg font-bold text-slate-700 shadow" style={{ animationDelay: '1.3s' }}>{ev.message}</div>}
          {kind !== 'exit' && (data.correct !== undefined) && (
            <div className="ca-pop mt-2 flex justify-center gap-2" style={{ animationDelay: '1.4s' }}>
              <span className="bg-green-500 text-white font-extrabold rounded-full px-3 py-1 text-sm border-2 border-white">✔ {data.correct} doğru</span>
              <span className={`${data.wrong ? 'bg-rose-500' : 'bg-slate-400'} text-white font-extrabold rounded-full px-3 py-1 text-sm border-2 border-white`}>✖ {data.wrong || 0} yanlış</span>
            </div>
          )}
          {showExplain && <ExplainPanel reward={data.reward} difficulty={data.difficulty} explain={explain} />}
          {data.unlockedNext && <div className="ca-pop mt-2 text-center font-extrabold text-white text-lg" style={{ animationDelay: '1.7s', textShadow: `0 2px 0 ${INK}` }}>🏝️ yeni ada açıldı!</div>}

          <div className={`mt-4 flex gap-2 transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            {onRetry && data.newStatus !== 'perfect' && kind !== 'exit' && (
              <button onClick={(e) => { e.stopPropagation(); stopAllFx(); onRetry(); }} className="flex-1 py-4 rounded-3xl text-lg font-extrabold bg-white text-indigo-600 border-4 border-indigo-200 shadow-lg active:scale-95">↻ hemen tekrar dene</button>
            )}
            <button onClick={(e) => { e.stopPropagation(); close(); }} className="flex-[1.4] py-4 rounded-3xl text-xl font-extrabold text-white bg-gradient-to-b from-orange-400 to-orange-600 border-4 border-white shadow-xl active:scale-95">
              {preview ? 'kapat' : data.unlockedNext ? 'yeni adaya git 🏝️' : 'haritaya dön 🗺️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
