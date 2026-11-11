import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './game.css';
import { Avatar } from './Avatar';
import { playSound, sfx, fillTemplate, stopAllFx, sayIfVoice, fxTtsOn } from './fx';
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

// ELMAS (eşyalar elmasla alınır)
export function DiamondShape({ size = 40, filled = true, glow = false, style, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="-2 -2 54 54" style={{ overflow: 'visible', ...style }} className={className}>
      {glow && <circle cx="25" cy="24" r="24" fill="#67e8f9" opacity="0.35" />}
      <path d="M12 6 L38 6 L49 19 L25 47 L1 19 Z" fill={filled ? '#22d3ee' : '#ffffff'} fillOpacity={filled ? 1 : 0.25} stroke={filled ? '#0e7490' : '#94a3b8'} strokeWidth="3" strokeLinejoin="round" strokeDasharray={filled ? 'none' : '5 4'} />
      {filled && (
        <g>
          <path d="M12 6 L18 19 L1 19 Z" fill="#a5f3fc" />
          <path d="M25 6 L18 19 L32 19 Z" fill="#cffafe" />
          <path d="M38 6 L32 19 L49 19 Z" fill="#06b6d4" />
          <path d="M18 19 L25 47 L1 19 Z" fill="#67e8f9" />
          <path d="M1 19 L49 19 M12 6 L18 19 L25 47 L32 19 L38 6 M18 19 L25 6 L32 19" stroke="#0e7490" strokeWidth="1.6" fill="none" strokeLinejoin="round" opacity="0.75" />
          <path d="M8 14 L12 9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

// Yıldızların patlama yönleri (yukarı yarım daire)
const burstVectors = (n, radius = 150) => Array.from({ length: n }).map((_, i) => {
  const a = Math.PI * (1.08 + (0.84 * (n === 1 ? 0.5 : i / (n - 1))));
  const r = radius * (0.75 + ((i * 37) % 10) / 30);
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, rot: (i % 2 ? 1 : -1) * (180 + i * 40) };
});

function BurstStars({ count, delay = 1.2, radius, gems = 0 }) {
  const vecs = useMemo(() => burstVectors(count + gems, radius), [count, gems, radius]);
  useEffect(() => {
    const ts = vecs.slice(0, 6).map((_, i) => setTimeout(() => sfx('starPop'), (delay + i * 0.07) * 1000));
    return () => ts.forEach(clearTimeout);
  }, [vecs, delay]);
  return (
    <div className="absolute left-1/2 top-1/2 pointer-events-none" style={{ width: 0, height: 0 }}>
      {vecs.map((v, i) => (
        <div key={i} className="ca-burst absolute" style={{ '--dx': `${v.dx}px`, '--dy': `${v.dy}px`, '--rot': `${v.rot}deg`, animationDelay: `${delay + i * 0.07}s`, left: -22, top: -22 }}>
          {i % 2 === 1 && Math.floor(i / 2) < gems ? <DiamondShape size={42} /> : <StarShape size={44} />}
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
function GiftBox({ stars, gems = 0 }) {
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
      <BurstStars gems={gems} count={stars} delay={1.3} />
    </div>
  );
}

function Chest({ stars, gems = 0 }) {
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
      <BurstStars gems={gems} count={stars} delay={1.2} />
    </div>
  );
}

function Fireworks({ stars, gems = 0 }) {
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
      <BurstStars gems={gems} count={stars} delay={0.6} radius={130} />
    </div>
  );
}

function StarRain({ stars, gems = 0 }) {
  const drops = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({ x: (i * 41) % 300, d: (i * 0.17) % 1.6, s: 22 + (i % 4) * 8, dur: 1.6 + (i % 5) * 0.25 })), []);
  return (
    <div className="relative w-[320px] h-[320px] overflow-visible">
      {drops.map((d, i) => <div key={i} className="ca-fallstar absolute" style={{ left: d.x, top: -60, animationDelay: `${d.d}s`, animationDuration: `${d.dur}s` }}><StarShape size={d.s} /></div>)}
      <div className="absolute inset-0 flex items-center justify-center"><StarShape size={120} glow className="ca-starpulse" /></div>
      <BurstStars gems={gems} count={stars} delay={1.8} radius={120} />
    </div>
  );
}

function Balloons({ stars, gems = 0 }) {
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
      <BurstStars gems={gems} count={stars} delay={1.75} radius={140} />
    </div>
  );
}

function Trophy({ stars, gems = 0 }) {
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
      <BurstStars gems={gems} count={stars} delay={1.1} />
    </div>
  );
}

function Rocket({ stars, gems = 0 }) {
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
      <BurstStars gems={gems} count={stars} delay={1.3} radius={150} />
    </div>
  );
}

function Rainbow({ stars, gems = 0 }) {
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
      <BurstStars gems={gems} count={stars} delay={1.3} radius={110} />
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


// --- YENİ ANİMASYONLAR ---
const RAND_VECS = (n, r1, r2, up = false) => Array.from({ length: n }).map((_, i) => {
  const a = up ? Math.PI * (1.05 + 0.9 * (i / Math.max(1, n - 1))) : (i / n) * Math.PI * 2;
  const r = r1 + ((i * 37) % 10) / 10 * (r2 - r1);
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, rot: (i % 2 ? 1 : -1) * (90 + i * 30) };
});

function Crown({ stars, gems = 0 }) {
  return (
    <div className="relative w-[320px] h-[320px] flex items-center justify-center">
      <Rays color="#fde047" delay={0.8} />
      <div className="absolute" style={{ top: 150 }}><StarShape size={120} glow className="ca-starpulse" /></div>
      <svg className="absolute ca-crowndrop" style={{ top: 50 }} width="170" height="120" viewBox="0 0 170 120">
        <path d="M10 100 L20 30 L55 65 L85 15 L115 65 L150 30 L160 100 Z" fill="#facc15" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <rect x="10" y="94" width="150" height="20" rx="6" fill="#eab308" stroke={INK} strokeWidth="5" />
        {[[20, 30, '#f43f5e'], [85, 15, '#22d3ee'], [150, 30, '#22c55e']].map(([x, y, c], i) => <circle key={i} cx={x} cy={y} r="9" fill={c} stroke={INK} strokeWidth="4" />)}
        {[45, 85, 125].map((x, i) => <circle key={i} cx={x} cy="104" r="5" fill={['#a855f7', '#f43f5e', '#3b82f6'][i]} />)}
        <path d="M32 80 L40 50" stroke="#fff" strokeWidth="6" opacity="0.6" strokeLinecap="round" />
      </svg>
      <BurstStars gems={gems} count={stars} delay={1.2} />
    </div>
  );
}

function Medal({ stars, gems = 0 }) {
  return (
    <div className="relative w-[320px] h-[320px] flex items-start justify-center">
      <Rays color="#fef3c7" delay={0.5} />
      <svg className="relative ca-swing" style={{ transformOrigin: '80px 0px', marginTop: 10 }} width="160" height="290" viewBox="0 0 160 290">
        <path d="M40 0 L80 150 L120 0" fill="none" stroke={INK} strokeWidth="26" strokeLinejoin="round" />
        <path d="M40 0 L80 150 L120 0" fill="none" stroke="#3b82f6" strokeWidth="18" strokeLinejoin="round" />
        <path d="M58 0 L80 110 L102 0" fill="none" stroke="#ef4444" strokeWidth="8" />
        <circle cx="80" cy="200" r="70" fill="#facc15" stroke={INK} strokeWidth="7" />
        <circle cx="80" cy="200" r="52" fill="#fde047" stroke="#b45309" strokeWidth="5" />
        <text x="80" y="224" textAnchor="middle" fontSize="70" fontWeight="900" fill="#b45309">1</text>
        <path d="M38 170 Q46 150 66 142" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.7" />
      </svg>
      <BurstStars gems={gems} count={stars} delay={1} />
    </div>
  );
}

function Cannons({ stars, gems = 0 }) {
  const bits = useMemo(() => [...RAND_VECS(14, 120, 220, true).map(v => ({ ...v, dx: Math.abs(v.dx) * 0.9 + 30, side: 0 })), ...RAND_VECS(14, 120, 220, true).map(v => ({ ...v, dx: -Math.abs(v.dx) * 0.9 - 30, side: 1 }))], []);
  const cols = ['#f43f5e', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#fb923c'];
  return (
    <div className="relative w-[320px] h-[320px]">
      {[0, 1].map(side => (
        <svg key={side} className="absolute bottom-2 ca-cannon" style={{ [side ? 'right' : 'left']: 4, transform: side ? 'scaleX(-1)' : undefined, animationDelay: `${0.3 + side * 0.25}s` }} width="110" height="90" viewBox="0 0 110 90">
          <g transform="rotate(-35 40 60)"><rect x="20" y="40" width="90" height="36" rx="12" fill="#475569" stroke={INK} strokeWidth="5" /><rect x="96" y="36" width="14" height="44" rx="4" fill="#334155" stroke={INK} strokeWidth="4" /></g>
          <circle cx="34" cy="70" r="18" fill="#92400e" stroke={INK} strokeWidth="5" /><circle cx="34" cy="70" r="5" fill={INK} />
        </svg>
      ))}
      {bits.map((b, i) => (
        <span key={i} className="ca-burst absolute" style={{ left: b.side ? 270 : 50, top: 240, width: 12, height: i % 3 ? 8 : 12, borderRadius: i % 3 ? 2 : 99, background: cols[i % cols.length], '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--rot': `${b.rot * 3}deg`, animationDelay: `${0.35 + b.side * 0.25 + (i % 5) * 0.03}s` }} />
      ))}
      <BurstStars gems={gems} count={stars} delay={1.2} />
    </div>
  );
}

function Bubbles({ stars, gems = 0 }) {
  const bs = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({ x: (i * 47) % 290, s: 26 + (i % 5) * 10, d: (i * 0.13) % 1.4, dur: 2.2 + (i % 4) * 0.4, c: ['#67e8f9', '#f9a8d4', '#a5b4fc', '#86efac', '#fde68a'][i % 5] })), []);
  return (
    <div className="relative w-[320px] h-[320px]">
      {bs.map((b, i) => (
        <div key={i} className="absolute ca-bubbleup rounded-full" style={{ left: b.x, bottom: -10, width: b.s, height: b.s, animationDelay: `${b.d}s`, animationDuration: `${b.dur}s`, background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${b.c}aa 40%, ${b.c}55 70%)`, border: `3px solid ${b.c}` }} />
      ))}
      <div className="absolute inset-0 flex items-center justify-center"><StarShape size={110} glow className="ca-starpulse" /></div>
      <BurstStars gems={gems} count={stars} delay={1.5} radius={120} />
    </div>
  );
}

function MagicWand({ stars, gems = 0 }) {
  const sp = useMemo(() => RAND_VECS(18, 60, 150), []);
  return (
    <div className="relative w-[320px] h-[320px]">
      <svg className="absolute ca-wand" style={{ left: 40, top: 120, transformOrigin: '10px 170px' }} width="200" height="180" viewBox="0 0 200 180" overflow="visible">
        <line x1="10" y1="170" x2="150" y2="40" stroke={INK} strokeWidth="16" strokeLinecap="round" />
        <line x1="10" y1="170" x2="150" y2="40" stroke="#7c3aed" strokeWidth="9" strokeLinecap="round" />
        <path d="M160 0 L168 22 L190 24 L172 38 L178 60 L160 47 L142 60 L148 38 L130 24 L152 22 Z" fill="#facc15" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <div className="absolute" style={{ left: 200, top: 130 }}>
        {sp.map((v, i) => (
          <span key={i} className="ca-sparkle absolute" style={{ '--dx': `${v.dx}px`, '--dy': `${v.dy}px`, animationDelay: `${0.9 + (i % 6) * 0.08}s`, left: -10, top: -10, fontSize: 18 + (i % 3) * 6 }}>{['✨', '⭐', '💫'][i % 3]}</span>
        ))}
      </div>
      <BurstStars gems={gems} count={stars} delay={1.4} radius={130} />
    </div>
  );
}

function Sunrise({ stars, gems = 0 }) {
  return (
    <div className="relative w-[320px] h-[320px] overflow-hidden rounded-[40px]">
      <div className="absolute inset-x-0 flex justify-center ca-sunup" style={{ top: 40 }}>
        <svg width="220" height="220" viewBox="-110 -110 220 220" overflow="visible">
          <g className="ca-spin-slow">{Array.from({ length: 12 }).map((_, i) => <path key={i} d="M-10 -78 L0 -104 L10 -78 Z" fill="#fb923c" stroke={INK} strokeWidth="4" transform={`rotate(${i * 30})`} />)}</g>
          <circle r="66" fill="#facc15" stroke={INK} strokeWidth="6" />
          <circle cx="-22" cy="-12" r="7" fill={INK} /><circle cx="22" cy="-12" r="7" fill={INK} />
          <circle cx="-38" cy="10" r="9" fill="#fb7185" opacity="0.6" /><circle cx="38" cy="10" r="9" fill="#fb7185" opacity="0.6" />
          <path d="M-28 14 Q0 44 28 14" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <svg className="absolute bottom-0 left-0" width="320" height="110" viewBox="0 0 320 110"><path d="M0 60 Q80 10 160 50 Q240 90 320 40 L320 110 L0 110 Z" fill="#4ade80" stroke={INK} strokeWidth="5" /></svg>
      <BurstStars gems={gems} count={stars} delay={1.5} radius={120} />
    </div>
  );
}

function Butterflies({ stars, gems = 0 }) {
  const bs = useMemo(() => [[20, 250, 240, -180, '#f472b6'], [280, 260, -220, -160, '#60a5fa'], [150, 290, 60, -230, '#facc15'], [40, 120, 220, -40, '#a78bfa'], [260, 140, -200, -60, '#34d399']], []);
  return (
    <div className="relative w-[320px] h-[320px]">
      <div className="absolute inset-0 flex items-center justify-center"><StarShape size={100} glow className="ca-starpulse" /></div>
      {bs.map(([x, y, dx, dy, c], i) => (
        <div key={i} className="absolute ca-flutter" style={{ left: x, top: y, '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${i * 0.3}s` }}>
          <svg width="52" height="44" viewBox="-26 -22 52 44">
            <g className="ca-wings"><path d="M0 0 C-30 -30 -30 10 0 2 Z M0 0 C30 -30 30 10 0 2 Z" fill={c} stroke={INK} strokeWidth="3" /><path d="M0 2 C-20 22 -10 22 0 6 Z M0 2 C20 22 10 22 0 6 Z" fill={c} stroke={INK} strokeWidth="3" opacity="0.85" /></g>
            <rect x="-2.5" y="-10" width="5" height="22" rx="2.5" fill={INK} />
          </svg>
        </div>
      ))}
      <BurstStars gems={gems} count={stars} delay={1.4} radius={120} />
    </div>
  );
}

function DiamondRain({ stars, gems = 0 }) {
  const drops = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({ x: (i * 43) % 300, d: (i * 0.19) % 1.6, s: 22 + (i % 4) * 8, dur: 1.5 + (i % 5) * 0.25 })), []);
  return (
    <div className="relative w-[320px] h-[320px] overflow-visible">
      {drops.map((d, i) => <div key={i} className="ca-fallstar absolute" style={{ left: d.x, top: -60, animationDelay: `${d.d}s`, animationDuration: `${d.dur}s` }}><DiamondShape size={d.s} /></div>)}
      <div className="absolute inset-0 flex items-center justify-center"><DiamondShape size={120} glow className="ca-starpulse" /></div>
      <BurstStars gems={gems} count={stars} delay={1.8} radius={120} />
    </div>
  );
}

function Dance({ game, itemMap, stars, gems = 0 }) {
  const notes = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({ dx: (i % 2 ? 1 : -1) * (30 + i * 12), rot: (i % 2 ? 1 : -1) * 30, d: i * 0.28, c: ['#f43f5e', '#8b5cf6', '#0ea5e9', '#22c55e'][i % 4] })), []);
  return (
    <div className="relative w-[320px] h-[320px] flex items-end justify-center">
      <div className="ca-dance relative" style={{ marginBottom: 6 }}><Avatar game={game} itemMap={itemMap} size={170} /></div>
      <div className="absolute" style={{ left: 160, top: 120 }}>
        {notes.map((n, i) => <span key={i} className="ca-note absolute font-black" style={{ '--dx': `${n.dx}px`, '--rot': `${n.rot}deg`, animationDelay: `${n.d}s`, color: n.c, fontSize: 30, textShadow: `0 2px 0 ${INK}` }}>{i % 2 ? '♪' : '♫'}</span>)}
      </div>
      <BurstStars gems={gems} count={stars} delay={1.4} radius={130} />
    </div>
  );
}

function Hearts({ stars, gems = 0 }) {
  const vs = useMemo(() => RAND_VECS(16, 80, 160), []);
  return (
    <div className="relative w-[320px] h-[320px] flex items-center justify-center">
      <svg width="140" height="130" viewBox="0 0 140 130" className="ca-starpulse"><path d="M70 120 C10 80 0 40 25 20 C45 4 65 14 70 32 C75 14 95 4 115 20 C140 40 130 80 70 120 Z" fill="#f43f5e" stroke={INK} strokeWidth="6" /><path d="M32 34 Q38 22 52 22" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.7" /></svg>
      <div className="absolute left-1/2 top-1/2" style={{ width: 0, height: 0 }}>
        {vs.map((v, i) => <span key={i} className="ca-burst absolute" style={{ '--dx': `${v.dx}px`, '--dy': `${v.dy}px`, '--rot': `${v.rot / 3}deg`, animationDelay: `${0.5 + (i % 8) * 0.06}s`, left: -14, top: -14, fontSize: 24 + (i % 3) * 6 }}>{['💖', '💗', '💛', '💜'][i % 4]}</span>)}
      </div>
      <BurstStars gems={gems} count={stars} delay={1.3} />
    </div>
  );
}

const ANIM_COMPONENTS = { giftBox: GiftBox, chest: Chest, fireworks: Fireworks, starRain: StarRain, balloons: Balloons, trophy: Trophy, rocket: Rocket, rainbow: Rainbow, tryAgain: Magnifier, wave: Wave,
  crown: Crown, medal: Medal, cannons: Cannons, bubbles: Bubbles, magicWand: MagicWand, sunrise: Sunrise, butterflies: Butterflies, diamondRain: DiamondRain, dance: Dance, hearts: Hearts };

// --- AÇIKLAMA PANELİ: "1 yıldız aldın, tam çözersen 3 olur" ---
export function ExplainPanel({ reward, difficulty, explain, compact = false }) {
  const total = Math.max(1, Number(reward?.perfect) || 0);
  const got = Math.min(total, Number(reward?.completed) || 0);
  const missing = Math.max(0, total - got);
  const diff = DIFFICULTY_BY_ID[difficulty] || DIFFICULTY_BY_ID.easy;
  const text = fillTemplate(explain?.text, { kazandin: got, tam: total, eksik: missing, zorluk: diff.label.toLocaleLowerCase('tr') });
  const shown = Math.min(total, 10);
  return (
    <div className={`ca-pop ${compact ? 'mt-2 p-2 w-full' : 'mt-3 p-3'} bg-white/95 rounded-3xl border-4 border-amber-200 shadow-lg`} style={{ animationDelay: '1.6s' }}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold text-white" style={{ background: diff.color }}>{diff.label} test</span>
        <span className="text-xs font-extrabold text-slate-500">yıldızların</span>
      </div>
      {explain?.image && !compact && <img src={explain.image} alt="" draggable="false" className="mx-auto max-h-28 object-contain mb-1" />}
      <div className="flex items-center justify-center flex-wrap gap-1">
        {Array.from({ length: shown }).map((_, i) => (
          <div key={i} className={i < got ? 'ca-pop' : 'ca-ghoststar'} style={{ animationDelay: `${1.8 + i * 0.15}s` }}>
            <StarShape size={compact ? (total > 6 ? 22 : 30) : (total > 6 ? 30 : 42)} filled={i < got} />
          </div>
        ))}
        {total > shown && <span className="font-extrabold text-amber-600">+{total - shown}</span>}
      </div>
      <div className="flex items-center justify-center gap-2 mt-1 text-sm font-extrabold">
        <span className="text-amber-600">⭐ {got} aldın</span>
        <span className="text-slate-300">→</span>
        <span className="ca-nudge inline-flex items-center gap-1 text-indigo-600"><span className="ca-spin-slow inline-block">↻</span> tam çöz: {total}</span>
      </div>
      <div className={`${compact ? 'text-[13px] line-clamp-2' : 'text-[15px]'} leading-snug font-bold text-slate-600 mt-1 text-center`}>{text}</div>
    </div>
  );
}

// --- TAM EKRAN HAVAİ FİŞEK + KONFETİ (canvas) ---
// strong: tam doğru / harita bitti -> roketler patlar, iki köşeden konfeti fışkırır, ekran parlar
function FxCanvas({ strong = true, duration = 5200 }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    if (!ctx) return undefined;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    const fit = () => { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit();
    window.addEventListener('resize', fit);
    const COLS = ['#f43f5e', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#fb923c', '#22d3ee', '#ffffff', '#f472b6'];
    const parts = [];
    const rockets = [];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const confettiBurst = (x, y, n, angle, spread, speed) => {
      for (let i = 0; i < n; i++) {
        const a = angle + rnd(-spread, spread);
        const v = rnd(speed * 0.5, speed);
        parts.push({ kind: 'c', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.16, drag: 0.985, w: rnd(6, 12), h: rnd(4, 8), rot: rnd(0, 6.28), vr: rnd(-0.3, 0.3), c: COLS[i % COLS.length], life: rnd(140, 220), age: 0, round: Math.random() < 0.3 });
      }
    };
    const sparkBurst = (x, y, c, n = 46) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rnd(-0.05, 0.05);
        const v = rnd(2.2, 5.6);
        parts.push({ kind: 's', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.05, drag: 0.972, r: rnd(1.6, 3.2), c: Math.random() < 0.25 ? '#ffffff' : c, life: rnd(60, 95), age: 0 });
      }
      parts.push({ kind: 'ring', x, y, r: 4, c, life: 26, age: 0 });
      flash = Math.min(0.35, flash + 0.16);
      try { sfx('crackle'); } catch (_) {}
    };
    const launch = () => {
      const x = rnd(W * 0.15, W * 0.85);
      rockets.push({ x, y: H + 10, vx: rnd(-1, 1), vy: -rnd(H * 0.0155, H * 0.0195), c: COLS[Math.floor(rnd(0, 7))], trail: [], ty: rnd(H * 0.12, H * 0.42) });
      try { sfx('rocketUp'); } catch (_) {}
    };
    let flash = 0;
    const t0 = performance.now();
    let lastLaunch = 0, lastRain = 0;
    let raf = 0;
    // açılış: iki alt köşeden konfeti topu
    confettiBurst(0, H * 0.95, strong ? 120 : 60, -Math.PI / 3.2, 0.42, strong ? 17 : 13);
    confettiBurst(W, H * 0.95, strong ? 120 : 60, -Math.PI + Math.PI / 3.2, 0.42, strong ? 17 : 13);
    if (strong) setTimeout(() => confettiBurst(W / 2, H * 0.55, 90, -Math.PI / 2, 1.3, 12), 350);
    const tick = (now) => {
      const el = now - t0;
      ctx.clearRect(0, 0, W, H);
      if (flash > 0) { ctx.fillStyle = `rgba(255,255,240,${flash})`; ctx.fillRect(0, 0, W, H); flash *= 0.88; if (flash < 0.01) flash = 0; }
      if (strong && el < duration && now - lastLaunch > 420) { lastLaunch = now; launch(); if (Math.random() < 0.4) launch(); }
      if (el < duration + 2500 && now - lastRain > 90) { lastRain = now; for (let i = 0; i < (strong ? 3 : 1); i++) parts.push({ kind: 'c', x: rnd(0, W), y: -10, vx: rnd(-0.6, 0.6), vy: rnd(1.5, 3), g: 0.03, drag: 0.995, w: rnd(6, 10), h: rnd(4, 7), rot: rnd(0, 6.28), vr: rnd(-0.2, 0.2), c: COLS[Math.floor(rnd(0, COLS.length))], life: 400, age: 0 }); }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push([r.x, r.y]); if (r.trail.length > 10) r.trail.shift();
        r.x += r.vx; r.y += r.vy; r.vy *= 0.985;
        ctx.strokeStyle = r.c; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); r.trail.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r.x, r.y, 3, 0, 6.28); ctx.fill();
        if (r.y <= r.ty || r.vy > -2) { sparkBurst(r.x, r.y, r.c); rockets.splice(i, 1); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age++;
        if (p.age > p.life || p.y > H + 40) { parts.splice(i, 1); continue; }
        const fade = Math.max(0, 1 - p.age / p.life);
        if (p.kind === 'ring') {
          p.r += 6; ctx.strokeStyle = p.c; ctx.globalAlpha = fade * 0.8; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.stroke(); ctx.globalAlpha = 1; continue;
        }
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy;
        if (p.kind === 's') {
          ctx.globalAlpha = fade; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
          if (Math.random() < 0.08) { ctx.fillStyle = '#fff'; ctx.fillRect(p.x - 1, p.y - 1, 2, 2); }
          ctx.globalAlpha = 1;
        } else {
          p.rot += p.vr;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(p.rot * 1.7)) * 0.8 + 0.2);
          ctx.globalAlpha = Math.min(1, fade * 2); ctx.fillStyle = p.c;
          if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2.4, 0, 6.28); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore(); ctx.globalAlpha = 1;
        }
      }
      if (el < duration + 7000 || parts.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', fit); };
  }, [strong, duration]);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none" style={{ width: '100vw', height: '100vh', zIndex: 2 }} />;
}

const useViewport = () => {
  const get = () => ({ w: typeof window !== 'undefined' ? window.innerWidth : 400, h: typeof window !== 'undefined' ? window.innerHeight : 700 });
  const [vp, setVp] = useState(get);
  useEffect(() => { const on = () => setVp(get()); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, []);
  return vp;
};

/**
 * Test sonu ekranı. TAM EKRAN, kaydırma yok: her şey ekrana sığacak şekilde küçülür.
 * data: { starsGained, diamondsGained, reward, dreward, difficulty, correct, wrong, testName, newStatus, unlockedNext }
 * onFixWrongs: varsa "yanlışlarını çöz" düğmesi çıkar (sadece yanlış sorular çözülür)
 * backLabel: geri düğmesinin yazısı (haritaya dön / ödevlere dön)
 * extraVoice: (Sınıfım) öğretmenin yüklediği başarı / gayret sesi
 */
export function Celebration({ kind, ev, explain, data = {}, game, itemMap, onDone, onRetry, onFixWrongs, fixLabel, fixSpeech, backLabel, extraVoice, preview = false, tts }) {
  const [ready, setReady] = useState(false);
  const vp = useViewport();
  const positive = ['first_perfect', 'retry_perfect', 'replay_perfect', 'map_done'].includes(kind);
  const gained = Number(data.starsGained) || 0;
  const gainedD = Number(data.diamondsGained) || 0;
  const starCount = kind === 'exit' ? 0 : Math.max(positive ? 6 : 3, Math.min(12, gained * 2));
  const gemCount = kind === 'exit' ? 0 : Math.min(6, gainedD);
  const Anim = ANIM_COMPONENTS[ev?.anim] || null;
  const Anim2 = (ev?.anim2 && ev.anim2 !== ev?.anim && ANIM_COMPONENTS[ev.anim2]) || null; // üst üste ikinci animasyon
  const showExplain = false; // "tam çözersen" açıklama paneli kaldırıldı
  const ttsOn = tts === undefined ? fxTtsOn() : tts !== false; // telefon sesiyle otomatik okuma
  const canFix = !!onFixWrongs && kind !== 'exit' && data.newStatus !== 'perfect' && Number(data.wrong) > 0;

  useEffect(() => {
    const t0 = setTimeout(() => setReady(true), (Anim || Anim2) ? 1600 : 300);
    // 1) efekt sesi (yüklenen ya da hazır), 2) konuşma sesi, 3) açıklama sesi, 4) "yanlışını çöz" sesi
    playSound(ev?.sound || ev?.synth);
    if (ev?.sound2 || ev?.synth2) playSound(ev.sound2 || ev.synth2); // üst üste ikinci efekt
    if (positive) { [250, 650, 1100].forEach((ms, i) => setTimeout(() => sfx(i === 2 ? 'cheer' : 'starPop'), ms)); }
    let voiceAudio = null, explainAudio = null, fixAudio = null;
    const playFix = () => { if (canFix) { fixAudio = sfx('fixPrompt'); if (!fixAudio && ttsOn) sayIfVoice(fixSpeech || 'yanlışlarını çöz, yıldızını kap!'); } };
    const voice = ev?.voice || extraVoice;
    const t1 = setTimeout(() => {
      if (voice) {
        voiceAudio = playSound(voice);
        if (voiceAudio) voiceAudio.onended = () => { if (showExplain && explain?.voice) { explainAudio = playSound(explain.voice); if (explainAudio) explainAudio.onended = playFix; else playFix(); } else playFix(); };
        else playFix();
      } else if (showExplain && explain?.voice) { explainAudio = playSound(explain.voice); if (explainAudio) explainAudio.onended = playFix; else playFix(); }
      else setTimeout(playFix, 700);
    }, 900);
    return () => { clearTimeout(t0); clearTimeout(t1); try { voiceAudio?.pause(); explainAudio?.pause(); fixAudio?.pause(); } catch (_) {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => { stopAllFx(); onDone?.(); };
  const bg = kind === 'exit'
    ? 'radial-gradient(circle at 50% 40%, #e0e7ff 0%, #a5b4fc 55%, #4338ca 100%)'
    : positive
      ? 'radial-gradient(circle at 50% 38%, #fff7cc 0%, #fbbf24 42%, #ea580c 78%, #9a3412 100%)'
      : 'radial-gradient(circle at 50% 38%, #ecfeff 0%, #67e8f9 46%, #0891b2 80%, #155e75 100%)';

  // --- yerleşim: ekrana sığdır (bilgi bölümü ölçülür, animasyon kalan yere sığacak kadar küçülür) ---
  const infoRef = useRef(null);
  const [infoH, setInfoH] = useState(420);
  useLayoutEffect(() => {
    const el = infoRef.current;
    if (!el) return undefined;
    const upd = () => setInfoH(el.offsetHeight || 0);
    upd();
    let ro = null;
    try { ro = new ResizeObserver(upd); ro.observe(el); } catch (_) {}
    return () => { try { ro?.disconnect(); } catch (_) {} };
  }, []);
  const landscape = vp.w > vp.h * 1.15 && vp.h < 620;
  const availH = vp.h - 20;
  const stageBox = landscape ? Math.min(vp.h - 30, vp.w * 0.42, 340) : Math.max(0, Math.min(320, availH - infoH - 8, vp.w - 24));
  const showStage = !!(Anim || Anim2) && stageBox >= 70;
  const stageScale = Math.max(0.2, stageBox / 320);
  const infoFit = Math.min(1, (landscape ? availH : availH - (showStage ? stageBox : 0)) / Math.max(1, infoH));
  const tight = !landscape && stageBox < 150;

  return (
    <div className="ca-game fixed inset-0 z-[150000] overflow-hidden select-none" style={{ background: bg, height: '100dvh' }} onClick={() => ready || setReady(true)}>
      <div className="absolute inset-0 ca-bgspin pointer-events-none" style={{ background: positive ? 'repeating-conic-gradient(from 0deg at 50% 38%, rgba(255,255,255,.16) 0deg 10deg, transparent 10deg 22deg)' : 'repeating-conic-gradient(from 0deg at 50% 38%, rgba(255,255,255,.10) 0deg 8deg, transparent 8deg 24deg)' }} />
      {kind !== 'exit' && <FxCanvas strong={positive} />}
      {positive && <Confetti delay={1.2} n={30} />}
      <div className={`relative z-[3] h-full w-full flex ${landscape ? 'flex-row items-center justify-center gap-4 px-4' : 'flex-col items-center justify-center px-3'} py-2`}>
        {showStage && (
          <div className="relative shrink-0 flex items-center justify-center" style={{ width: stageBox, height: stageBox }}>
            <div style={{ transform: `scale(${stageScale})`, transformOrigin: 'center center', width: 320, height: 320 }} className="relative">
              {Anim && <Anim stars={starCount} gems={gemCount} game={game} itemMap={itemMap} />}
              {Anim2 && <div className="absolute inset-0"><Anim2 stars={Anim ? 0 : starCount} gems={Anim ? 0 : gemCount} game={game} itemMap={itemMap} /></div>}
            </div>
          </div>
        )}
        <div ref={infoRef} className="w-full max-w-md flex flex-col items-center shrink-0" style={infoFit < 1 ? { transform: `scale(${infoFit})`, transformOrigin: 'center center' } : undefined}>
          {preview && <div className="mb-1 bg-black/40 text-white text-xs font-extrabold px-3 py-1 rounded-full">önizleme · {kind}</div>}
          {ev?.image && <img src={ev.image} alt="" draggable="false" className="ca-pop max-h-16 max-w-[70vw] object-contain drop-shadow-xl" />}
          <div className="ca-pop text-center" style={{ animationDelay: (Anim || Anim2) ? '0.9s' : '0s' }}>
            <div className={`${tight ? 'text-3xl' : 'text-4xl sm:text-5xl'} font-extrabold text-white leading-tight ca-titlebounce`} style={{ textShadow: `0 3px 0 ${INK}, 0 0 22px rgba(0,0,0,.25)` }}>{ev?.title}</div>
            {data.testName && <div className="text-sm font-extrabold text-white/90 mt-0.5 truncate max-w-[86vw]">{data.testName}</div>}
          </div>

          {kind !== 'exit' && (gained > 0 || gainedD > 0) && (
            <div className="ca-pop mt-2 flex items-center gap-2 flex-wrap justify-center" style={{ animationDelay: '1.2s' }}>
              {gained > 0 && (
                <div className="flex items-center gap-1.5 bg-white rounded-full pl-1.5 pr-4 py-1 border-4 border-amber-300 shadow-xl ca-gainpulse">
                  <StarShape size={tight ? 34 : 42} /><span className="text-3xl font-extrabold text-amber-600">+{gained}</span>
                  <span className="text-[11px] font-extrabold text-amber-500 leading-tight">yıldız<br />kazandın</span>
                </div>
              )}
              {gainedD > 0 && (
                <div className="flex items-center gap-1.5 bg-white rounded-full pl-1.5 pr-4 py-1 border-4 border-cyan-300 shadow-xl ca-gainpulse" style={{ animationDelay: '.3s' }}>
                  <DiamondShape size={tight ? 34 : 42} /><span className="text-3xl font-extrabold text-cyan-600">+{gainedD}</span>
                  <span className="text-[11px] font-extrabold text-cyan-600 leading-tight">elmas<br />kazandın</span>
                </div>
              )}
            </div>
          )}

          {ev?.message && <div className="ca-pop mt-2 w-full bg-white/90 rounded-3xl px-4 py-2 text-center text-base sm:text-lg font-bold text-slate-700 shadow line-clamp-2" style={{ animationDelay: '1.1s' }}>{ev.message}</div>}
          {kind !== 'exit' && (data.correct !== undefined) && (
            <div className="ca-pop mt-1.5 flex justify-center gap-2" style={{ animationDelay: '1.3s' }}>
              <span className="bg-green-500 text-white font-extrabold rounded-full px-3 py-1 text-sm border-2 border-white shadow">✔ {data.correct} doğru</span>
              <span className={`${data.wrong ? 'bg-rose-500' : 'bg-slate-400'} text-white font-extrabold rounded-full px-3 py-1 text-sm border-2 border-white shadow`}>✖ {data.wrong || 0} yanlış</span>
            </div>
          )}
          {showExplain && <ExplainPanel reward={data.reward} difficulty={data.difficulty} explain={explain} compact />}
          {data.unlockedNext && <div className="ca-pop mt-1 text-center font-extrabold text-white text-lg" style={{ animationDelay: '1.6s', textShadow: `0 2px 0 ${INK}` }}>🏝️ yeni ada açıldı!</div>}

          <div className={`mt-3 w-full flex flex-col gap-2 transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            {canFix && (
              <button onClick={(e) => { e.stopPropagation(); stopAllFx(); onFixWrongs(); }} className="w-full py-4 rounded-3xl text-xl font-extrabold text-white bg-gradient-to-b from-pink-400 via-fuchsia-500 to-purple-600 border-4 border-white shadow-2xl active:scale-95 ca-fixbtn">
                {fixLabel || '⭐ yanlışlarını çöz, yıldızını kap!'}
              </button>
            )}
            <div className="flex gap-2">
              {!canFix && onRetry && data.newStatus !== 'perfect' && kind !== 'exit' && (
                <button onClick={(e) => { e.stopPropagation(); stopAllFx(); onRetry(); }} className="flex-1 py-4 rounded-3xl text-lg font-extrabold bg-white text-indigo-600 border-4 border-indigo-200 shadow-lg active:scale-95">↻ tekrar dene</button>
              )}
              <button onClick={(e) => { e.stopPropagation(); close(); }} className={`flex-[1.4] ${canFix ? 'py-3 text-lg' : 'py-4 text-xl'} rounded-3xl font-extrabold text-white bg-gradient-to-b from-orange-400 to-orange-600 border-4 border-white shadow-xl active:scale-95`}>
                {preview ? 'kapat' : backLabel || (data.unlockedNext ? 'yeni adaya git 🏝️' : 'haritaya dön 🗺️')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
