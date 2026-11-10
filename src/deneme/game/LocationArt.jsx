import React from 'react';
import { Oak, Pine, Palm, Cloud, Cactus, Bush, Flowers, Rock, Lollipop, CandyCane, Fern, seeded, INK } from './MapArt';

// ============================================================================
// --- GRUP: EVİN MEKANI (çayır, ada, sahil, orman, dağ, kar, çöl, göl, şehir...) ---
// ============================================================================
// Tuval 800x450, evin oturduğu zemin y≈340. water: tekne nerede durur.

export const LOCATION_SCENES = {
  meadow: { sky: ['#7dd3fc', '#e0f2fe'], ground: '#4ade80' },
  island: { sky: ['#38bdf8', '#e0f2fe'], ground: '#0ea5e9', boat: [700, 284] },
  beach: { sky: ['#7dd3fc', '#fef9c3'], ground: '#fde68a', boat: [640, 300] },
  forest: { sky: ['#93c5fd', '#e0f2fe'], ground: '#4d9a2e' },
  mountain: { sky: ['#60a5fa', '#dbeafe'], ground: '#65a30d' },
  snow: { sky: ['#bfdbfe', '#f8fafc'], ground: '#f8fafc' },
  desert: { sky: ['#fdba74', '#fef3c7'], ground: '#fcd34d' },
  lake: { sky: ['#7dd3fc', '#e0f2fe'], ground: '#4ade80', boat: [620, 306] },
  city: { sky: ['#a5b4fc', '#e0e7ff'], ground: '#9ca3af' },
  farm: { sky: ['#7dd3fc', '#fef9c3'], ground: '#84cc16' },
  candy: { sky: ['#f9a8d4', '#fdf2f8'], ground: '#fbcfe8' },
  moon: { sky: ['#020617', '#1e1b4b'], ground: '#9ca3af' },
  jungle: { sky: ['#86efac', '#ecfccb'], ground: '#3f8f2f' },
  river: { sky: ['#7dd3fc', '#e0f2fe'], ground: '#4ade80', boat: [640, 322] },
  cliff: { sky: ['#60a5fa', '#e0f2fe'], ground: '#65a30d', boat: [690, 262] },
  night: { sky: ['#0f172a', '#312e81'], ground: '#166534' },
};

const at = (x, y, el, k) => <g key={k} transform={`translate(${x} ${y})`}>{el}</g>;
const G = 340;

export function LocationBackdrop({ scene = 'meadow', id = 'lb' }) {
  const L = LOCATION_SCENES[scene] || LOCATION_SCENES.meadow;
  const r = seeded(scene.length * 97 + 3);
  const gid = `${id}_${scene}`;
  const sky = (
    <g>
      <defs>
        <linearGradient id={`${gid}_sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={L.sky[0]} /><stop offset="1" stopColor={L.sky[1]} /></linearGradient>
        <linearGradient id={`${gid}_sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#0369a1" /></linearGradient>
      </defs>
      <rect x="-400" y="-600" width="1600" height="1100" fill={`url(#${gid}_sky)`} />
    </g>
  );
  const clouds = <g className="ca-drift">{at(150, 80, <Cloud s={1.1} />, 'c1')}{at(560, 60, <Cloud s={0.9} />, 'c2')}{at(380, 120, <Cloud s={0.6} />, 'c3')}</g>;
  const sun = <circle cx="680" cy="80" r="40" fill="#fde047" stroke="#facc15" strokeWidth="6" className="ca-sun" />;
  const hills = (c1, c2) => <g><path d={`M-400 300 L0 300 Q140 220 300 280 T600 260 T800 270 L1200 270 L1200 ${G + 40} L-400 ${G + 40} Z`} fill={c1} /><path d={`M-400 320 L0 330 Q200 290 400 320 T800 315 L1200 315 L1200 ${G + 40} L-400 ${G + 40} Z`} fill={c2} /></g>;
  const ground = (c) => <rect x="-400" y={G} width="1600" height="700" fill={c} />;
  const waves = (y0, n = 6) => Array.from({ length: n }).map((_, i) => <path key={i} d={`M${(i * 157) % 760} ${y0 + (i % 3) * 18} q10 -6 20 0 q10 -6 20 0`} stroke="#fff" strokeWidth="3" fill="none" opacity="0.7" className="ca-wave" />);

  switch (scene) {
    case 'island':
      return <g>{sky}{sun}{clouds}
        <rect x="-400" y="250" width="1600" height="800" fill={`url(#${gid}_sea)`} />{waves(270, 8)}
        <ellipse cx="400" cy="370" rx="360" ry="92" fill="#7fdcf3" opacity="0.7" />
        <ellipse cx="400" cy="372" rx="330" ry="78" fill={INK} /><ellipse cx="400" cy="366" rx="326" ry="74" fill="#fde7a3" />
        <ellipse cx="400" cy="356" rx="290" ry="56" fill="#5cbf4a" stroke={INK} strokeWidth="3" />
        {at(110, 360, <Palm s={1.2} />, 'p1')}{at(700, 360, <Palm s={1.1} flip />, 'p2')}{at(170, 330, <Bush s={0.9} flowers />, 'b')}
        {waves(420, 6)}</g>;
    case 'beach':
      return <g>{sky}{sun}{clouds}
        <rect x="-400" y="240" width="1600" height="110" fill={`url(#${gid}_sea)`} />{waves(260, 8)}
        <path d={`M-400 ${G - 20} Q200 ${G - 40} 400 ${G - 16} T1200 ${G - 20} L1200 800 L-400 800 Z`} fill="#fde68a" />
        <path d={`M-400 ${G - 20} Q200 ${G - 40} 400 ${G - 16} T1200 ${G - 20}`} stroke="#fff" strokeWidth="6" fill="none" opacity="0.8" />
        {at(90, 400, <Palm s={1.3} />, 'p')}{at(720, 410, <g><path d="M0 0 L0 -60" stroke="#475569" strokeWidth="3" /><path d="M-36 -56 Q0 -92 36 -56 Z" fill="#ef4444" stroke={INK} strokeWidth="2.5" /><path d="M-12 -60 Q0 -86 12 -60" fill="#fff" /></g>, 'u')}
        {[[200, 420], [560, 430], [640, 400]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="10" ry="4" fill="#fbbf24" />)}</g>;
    case 'forest':
      return <g>{sky}{clouds}
        {Array.from({ length: 16 }).map((_, i) => at(i * 56 - 20, 300 + (i % 3) * 6, <Pine s={1.3 + (i % 2) * 0.3} hue={i % 3} />, `bp${i}`))}
        {ground(L.ground)}<rect x="-400" y={G} width="1600" height="12" fill="#3f7d24" />
        {[[40, 420, 1.5], [150, 380, 1.1], [690, 400, 1.4], [770, 370, 1.2]].map(([x, y, s], i) => at(x, y, i % 2 ? <Oak s={s} hue={i} /> : <Pine s={s} hue={i} />, `ft${i}`))}
        {at(600, 420, <Rock s={1} moss />, 'r')}</g>;
    case 'mountain':
      return <g>{sky}{clouds}
        <path d="M-100 300 L120 90 L260 240 L400 60 L560 230 L680 120 L900 300 Z" fill="#94a3b8" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M120 90 L160 128 L132 138 L104 120 Z M400 60 L446 104 L414 118 L380 100 L366 92 Z M680 120 L716 152 L690 160 L664 140 Z" fill="#fff" />
        {hills('#86efac', '#65a30d')}{ground(L.ground)}
        {[60, 140, 680, 760].map((x, i) => at(x, 390 + (i % 2) * 20, <Pine s={1.3} hue={i} />, `mp${i}`))}</g>;
    case 'snow':
      return <g>{sky}
        <path d="M-400 290 Q100 230 400 280 T1200 270 L1200 800 L-400 800 Z" fill="#e0f2fe" />
        {ground('#f8fafc')}
        {[30, 120, 690, 770, 220].map((x, i) => at(x, 360 + (i % 2) * 40, <Pine s={1.2 + (i % 2) * 0.3} snow hue={i} />, `sp${i}`))}
        {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={r() * 800} cy={r() * 330} r={2 + r() * 2.5} fill="#fff" className="ca-twinkle2" style={{ animationDelay: `${r() * 2}s` }} />)}</g>;
    case 'desert':
      return <g>{sky}<circle cx="660" cy="90" r="46" fill="#fde047" className="ca-sun" />
        <path d="M480 300 L560 200 L640 300 Z" fill="#e0aa4f" stroke={INK} strokeWidth="3" /><path d="M560 200 L640 300 L590 300 Z" fill="#b98535" />
        <path d="M600 300 L650 240 L700 300 Z" fill="#e0aa4f" stroke={INK} strokeWidth="2.5" />
        <path d="M-400 300 Q100 260 300 300 T900 290 L1200 290 L1200 800 L-400 800 Z" fill="#f7d48a" />{ground(L.ground)}
        {[[60, 400], [740, 420], [180, 370]].map(([x, y], i) => at(x, y, <Cactus s={1.3} />, `ct${i}`))}
        <ellipse cx="660" cy="400" rx="60" ry="14" fill="#38bdf8" stroke={INK} strokeWidth="2.5" />{at(700, 400, <Palm s={0.9} />, 'op')}</g>;
    case 'lake':
      return <g>{sky}{sun}{clouds}
        {hills('#86efac', '#4ade80')}
        <path d="M-400 290 Q200 270 600 286 T1200 290 L1200 335 L-400 335 Z" fill={`url(#${gid}_sea)`} />{waves(300, 6)}
        {ground(L.ground)}
        {[[40, 345], [64, 348], [740, 346], [764, 344]].map(([x, y], i) => <path key={i} d={`M${x} ${y} L${x - 4} ${y - 30} M${x + 4} ${y} L${x + 6} ${y - 26}`} stroke="#4d7c0f" strokeWidth="3" />)}
        {at(80, 420, <Oak s={1.3} />, 'lo')}{at(730, 430, <Oak s={1.2} hue={2} />, 'lo2')}</g>;
    case 'city':
      return <g>{sky}{clouds}
        {Array.from({ length: 11 }).map((_, i) => {
          const h = 90 + ((i * 53) % 130), x = i * 76 - 20;
          const c = ['#64748b', '#94a3b8', '#475569', '#7c8aa5'][i % 4];
          return <g key={i}><rect x={x} y={G - h - 20} width="66" height={h + 20} fill={c} stroke={INK} strokeWidth="2.5" />{Array.from({ length: Math.floor(h / 22) }).map((_, j) => [10, 30, 48].map(dx => <rect key={`${j}_${dx}`} x={x + dx} y={G - h - 8 + j * 22} width="10" height="12" fill={(i + j + dx) % 3 ? '#fde68a' : '#bae6fd'} />))}</g>;
        })}
        {ground('#9ca3af')}<rect x="-400" y={G + 70} width="1600" height="60" fill="#374151" />{Array.from({ length: 14 }).map((_, i) => <rect key={i} x={i * 70 - 40} y={G + 98} width="36" height="5" fill="#fde047" />)}
        {[60, 740].map((x, i) => at(x, G + 20, <g><rect x="-14" y="-16" width="28" height="16" fill="#a16207" stroke={INK} strokeWidth="2" /><g transform="translate(0 -14)"><Oak s={0.8} hue={i} /></g></g>, `ct${i}`))}</g>;
    case 'farm':
      return <g>{sky}{sun}{clouds}
        {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M-400 ${270 + i * 14} L1200 ${270 + i * 14} L1200 ${284 + i * 14} L-400 ${284 + i * 14} Z`} fill={i % 2 ? '#facc15' : '#a3e635'} />)}
        <g transform="translate(640 230)"><rect x="0" y="20" width="70" height="50" fill="#b91c1c" stroke={INK} strokeWidth="2.5" /><path d="M-6 22 L35 -6 L76 22 Z" fill="#7f1d1d" stroke={INK} strokeWidth="2.5" /><rect x="24" y="40" width="22" height="30" fill="#fff" /></g>
        {ground(L.ground)}
        <g>{Array.from({ length: 22 }).map((_, i) => <rect key={i} x={i * 40 - 30} y={G - 6} width="8" height="34" fill="#f8fafc" stroke={INK} strokeWidth="1.5" />)}<rect x="-40" y={G + 2} width="900" height="6" fill="#f8fafc" stroke={INK} strokeWidth="1.5" /></g>
        {at(80, 430, <Oak s={1.3} hue={1} />, 'fo')}</g>;
    case 'candy':
      return <g>{sky}{at(160, 90, <Cloud s={1} />, 'c')}
        <path d="M-400 300 Q100 220 300 290 T800 270 L1200 270 L1200 800 L-400 800 Z" fill="#f9a8d4" />
        <path d="M-400 320 Q200 290 400 320 T1200 315 L1200 800 L-400 800 Z" fill="#c084fc" opacity="0.5" />
        {ground(L.ground)}
        {[[60, 400, '#f472b6'], [150, 370, '#38bdf8'], [700, 410, '#facc15'], [770, 380, '#a78bfa']].map(([x, y, c], i) => at(x, y, <Lollipop s={1.4} c={c} />, `ll${i}`))}
        {at(620, 420, <CandyCane s={1.2} />, 'cc')}</g>;
    case 'moon':
      return <g>{sky}
        {Array.from({ length: 80 }).map((_, i) => <circle key={i} cx={r() * 800} cy={r() * 330} r={r() * 1.8 + 0.4} fill="#fff" opacity={0.5 + r() * 0.5} />)}
        <g transform="translate(650 90)"><circle r="44" fill="#3b82f6" stroke={INK} strokeWidth="3" /><path d="M-30 -10 Q-10 -30 10 -16 Q20 0 0 10 Q-20 20 -30 -10 Z M14 18 Q30 10 34 24 Q20 34 14 18 Z" fill="#22c55e" /></g>
        <path d="M-400 320 Q100 290 400 318 T1200 310 L1200 800 L-400 800 Z" fill="#6b7280" />{ground(L.ground)}
        {[[120, 400, 40], [620, 420, 30], [300, 440, 20], [720, 380, 24]].map(([x, y, rx], i) => <g key={i}><ellipse cx={x} cy={y} rx={rx} ry={rx * 0.3} fill="#6b7280" stroke={INK} strokeWidth="2" /><ellipse cx={x} cy={y - 2} rx={rx * 0.8} ry={rx * 0.2} fill="#4b5563" /></g>)}</g>;
    case 'jungle':
      return <g>{sky}{sun}
        {Array.from({ length: 14 }).map((_, i) => at(i * 64 - 20, 320 + (i % 2) * 10, <Palm s={1.3 + (i % 3) * 0.2} flip={i % 2 === 1} />, `jp${i}`))}
        {ground(L.ground)}
        {[[40, 400], [120, 430], [700, 420], [770, 390], [600, 440]].map(([x, y], i) => at(x, y, <Fern s={1.4} />, `jf${i}`))}</g>;
    case 'river':
      return <g>{sky}{sun}{clouds}{hills('#86efac', '#4ade80')}
        <path d="M-400 296 Q0 286 400 300 T1200 296 L1200 334 Q800 326 400 336 T-400 330 Z" fill={`url(#${gid}_sea)`} stroke="#bae6fd" strokeWidth="4" />
        {[[60, 312], [260, 318], [480, 316], [700, 310]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l18 0 l-5 -4 M${x + 18} ${y} l-5 4`} stroke="#fff" strokeWidth="2.5" fill="none" className="ca-wave" />)}
        {ground(L.ground)}<rect x="-400" y={G - 4} width="1600" height="8" fill="#a16207" opacity="0.5" />
        {at(80, 420, <Oak s={1.3} />, 'ro')}{at(500, 440, <Rock s={1.2} moss />, 'rr')}{at(740, 430, <Oak s={1.1} hue={2} />, 'ro2')}</g>;
    case 'cliff':
      return <g>{sky}{sun}{clouds}
        <rect x="-400" y="230" width="1600" height="90" fill={`url(#${gid}_sea)`} />{waves(250, 8)}
        <path d="M-400 300 L1200 300 L1200 330 L-400 330 Z" fill="#a8a29e" />
        {Array.from({ length: 18 }).map((_, i) => <path key={i} d={`M${i * 50 - 20} 302 l12 26 l14 -20 l10 22`} stroke="#78716c" strokeWidth="3" fill="none" />)}
        <path d={`M-400 ${G - 14} Q100 ${G - 26} 400 ${G - 14} T1200 ${G - 14} L1200 800 L-400 800 Z`} fill={L.ground} />
        <path d={`M-400 ${G - 14} Q100 ${G - 26} 400 ${G - 14} T1200 ${G - 14}`} stroke={INK} strokeWidth="2.5" fill="none" />
        {at(60, 410, <Pine s={1.3} />, 'cp')}{at(740, 420, <Pine s={1.2} hue={1} />, 'cp2')}</g>;
    case 'night':
      return <g>{sky}
        {Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={r() * 800} cy={r() * 300} r={r() * 1.8 + 0.4} fill="#fff" className="ca-twinkle2" style={{ animationDelay: `${r() * 2}s` }} />)}
        <g transform="translate(650 90)"><circle r="38" fill="#fef9c3" /><circle cx="-14" cy="-6" r="8" fill="#fde68a" /><circle cx="10" cy="12" r="6" fill="#fde68a" /></g>
        {hills('#14532d', '#166534')}{ground(L.ground)}
        {[60, 740].map((x, i) => at(x, 400, <Pine s={1.3} hue={i} />, `np${i}`))}
        {Array.from({ length: 12 }).map((_, i) => <circle key={`f${i}`} cx={r() * 800} cy={G + r() * 90} r="3" fill="#fef08a" className="ca-twinkle2" style={{ animationDelay: `${r() * 2}s`, filter: 'drop-shadow(0 0 4px #fde047)' }} />)}</g>;
    case 'meadow':
    default:
      return <g>{sky}{sun}{clouds}{hills('#86efac', '#4ade80')}{ground('#22c55e')}
        {[[70, 335, 1.2, 'o'], [200, 300, 0.8, 'p'], [720, 340, 1.1, 'p'], [650, 320, 0.8, 'o']].map(([x, y, s, k], i) => at(x, y, k === 'o' ? <Oak s={s} hue={i} /> : <Pine s={s} hue={i} />, `mt${i}`))}
        {at(750, 410, <Flowers s={1.4} seed={4} />, 'mf')}{at(130, 425, <Flowers s={1.3} seed={9} />, 'mf2')}</g>;
  }
}
