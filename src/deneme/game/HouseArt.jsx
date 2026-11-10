import React, { useId } from 'react';
import { shade } from './Avatar';

// ============================================================================
// --- GRUP: EV ÇİZİMLERİ (parametrik, gerçekçi çizgi film) ---
// ============================================================================
// Tuval 400x300, ev zemini y=260, orta x=200.
// render: { style, mat, roof, w, floors, wall, roofC, trim, chimney, porch, garage, balcony, flowers, solar }
//   style: 'house' (genel) | 'castle' | 'lighthouse' | 'igloo' | 'treehouse' | 'windmill' | 'dome' | 'tent' | 'shack' | 'barn' | 'mushroom'
//   mat  : 'brick' | 'siding' | 'stone' | 'wood' | 'plaster' | 'log'
//   roof : 'gable' | 'hip' | 'flat' | 'mansard' | 'round' | 'thatch'

const INK = '#2b2233';
const GY = 260;

function Defs({ id, wall }) {
  return (
    <defs>
      <pattern id={`${id}_brick`} width="24" height="12" patternUnits="userSpaceOnUse">
        <rect width="24" height="12" fill="none" />
        <path d="M0 0 L24 0 M0 6 L24 6 M6 0 L6 6 M18 6 L18 12" stroke={shade(wall, -40)} strokeWidth="1.2" opacity="0.6" />
      </pattern>
      <pattern id={`${id}_siding`} width="20" height="9" patternUnits="userSpaceOnUse"><path d="M0 8.5 L20 8.5" stroke={shade(wall, -35)} strokeWidth="1.5" opacity="0.6" /></pattern>
      <pattern id={`${id}_wood`} width="14" height="40" patternUnits="userSpaceOnUse"><path d="M13 0 L13 40" stroke={shade(wall, -40)} strokeWidth="1.5" opacity="0.7" /><circle cx="6" cy="22" r="1.4" fill={shade(wall, -45)} opacity="0.5" /></pattern>
      <pattern id={`${id}_log`} width="40" height="14" patternUnits="userSpaceOnUse"><rect width="40" height="13" rx="6" fill={shade(wall, 10)} stroke={shade(wall, -40)} strokeWidth="1.2" /></pattern>
      <pattern id={`${id}_stone`} width="36" height="26" patternUnits="userSpaceOnUse">
        {[[8, 7, 8, 6], [26, 6, 9, 5], [16, 19, 10, 6], [33, 20, 5, 5], [2, 20, 4, 5]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={shade(wall, (i % 2) ? -12 : 10)} stroke={shade(wall, -45)} strokeWidth="1" />)}
      </pattern>
      <linearGradient id={`${id}_glass`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fef9c3" /><stop offset="0.5" stopColor="#bae6fd" /><stop offset="1" stopColor="#60a5fa" /></linearGradient>
      <linearGradient id={`${id}_shade`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.7" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.18" /></linearGradient>
    </defs>
  );
}

function Win({ x, y, w = 34, h = 36, id, trim = '#fff', shutters, flowers, round }) {
  return (
    <g>
      {shutters && <g><rect x={x - 11} y={y} width="10" height={h} fill={shutters} stroke={INK} strokeWidth="2" /><rect x={x + w + 1} y={y} width="10" height={h} fill={shutters} stroke={INK} strokeWidth="2" />{[0.3, 0.55, 0.8].map(k => <g key={k}><path d={`M${x - 9} ${y + h * k} L${x - 3} ${y + h * k}`} stroke={shade(shutters, -40)} strokeWidth="1.5" /><path d={`M${x + w + 3} ${y + h * k} L${x + w + 9} ${y + h * k}`} stroke={shade(shutters, -40)} strokeWidth="1.5" /></g>)}</g>}
      {round
        ? <path d={`M${x} ${y + h} L${x} ${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L${x + w} ${y + h} Z`} fill={`url(#${id}_glass)`} stroke={trim} strokeWidth="4" />
        : <rect x={x} y={y} width={w} height={h} fill={`url(#${id}_glass)`} stroke={trim} strokeWidth="4" />}
      <path d={`M${x + w / 2} ${y + 2} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}`} stroke={trim} strokeWidth="3" />
      <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} fill="none" stroke={INK} strokeWidth="1.6" rx={round ? w / 2 : 1} opacity="0.7" />
      <path d={`M${x + 5} ${y + h - 8} L${x + w / 2 - 4} ${y + 6}`} stroke="#fff" strokeWidth="3" opacity="0.6" />
      <rect x={x - 4} y={y + h} width={w + 8} height="5" rx="2" fill={trim} stroke={INK} strokeWidth="1.5" />
      {flowers && <g><rect x={x - 2} y={y + h + 4} width={w + 4} height="8" rx="2" fill="#a16207" stroke={INK} strokeWidth="1.5" />{Array.from({ length: Math.floor(w / 7) }).map((_, i) => <circle key={i} cx={x + 3 + i * 7} cy={y + h + 3} r="3.2" fill={['#f472b6', '#facc15', '#fb7185', '#a78bfa'][i % 4]} stroke={INK} strokeWidth="0.8" />)}</g>}
    </g>
  );
}

function Door({ x, w = 36, h = 58, color = '#7c2d12', onDoor, round = true }) {
  return (
    <g onClick={onDoor} style={{ cursor: onDoor ? 'pointer' : 'default' }} className={onDoor ? 'ca-door' : ''}>
      <rect x={x - 6} y={GY - 4} width={w + 12} height="6" fill="#d6d3d1" stroke={INK} strokeWidth="1.5" />
      <path d={round ? `M${x} ${GY - 4} L${x} ${GY - h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${GY - h + w / 2} L${x + w} ${GY - 4} Z` : `M${x} ${GY - 4} L${x} ${GY - h} L${x + w} ${GY - h} L${x + w} ${GY - 4} Z`} fill={color} stroke={INK} strokeWidth="3" />
      <rect x={x + 6} y={GY - h + (round ? w / 2 : 8)} width={w - 12} height={h * 0.32} rx="3" fill={shade(color, -18)} />
      <rect x={x + 6} y={GY - h * 0.42} width={w - 12} height={h * 0.3} rx="3" fill={shade(color, -18)} />
      <circle cx={x + w - 8} cy={GY - h * 0.45} r="3.2" fill="#facc15" stroke={INK} strokeWidth="1" />
      <g><rect x={x + w + 8} y={GY - h + 4} width="6" height="10" rx="2" fill="#fde047" stroke={INK} strokeWidth="1.5" className="ca-glow" /></g>
    </g>
  );
}

function Roof({ kind, x0, W, top, color, id }) {
  const L = x0 - 16, R = x0 + W + 16, mid = x0 + W / 2;
  const shingles = (d, h) => <g clipPath={`url(#${id}_rc)`}>{Array.from({ length: Math.ceil(h / 10) }).map((_, i) => <path key={i} d={`M${L - 20} ${top - h + i * 10 + 8} L${R + 20} ${top - h + i * 10 + 8}`} stroke={shade(color, -35)} strokeWidth="2" opacity="0.6" strokeDasharray={i % 2 ? '14 3' : '9 3'} />)}</g>;
  switch (kind) {
    case 'flat':
      return <g><rect x={x0 - 8} y={top - 14} width={W + 16} height="16" fill={color} stroke={INK} strokeWidth="3" /><rect x={x0 - 8} y={top - 14} width={W + 16} height="5" fill={shade(color, 30)} /></g>;
    case 'hip': {
      const d = `M${L} ${top + 2} L${x0 + 34} ${top - 56} L${x0 + W - 34} ${top - 56} L${R} ${top + 2} Z`;
      return <g><clipPath id={`${id}_rc`}><path d={d} /></clipPath><path d={d} fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />{shingles(d, 58)}<path d={d} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" /></g>;
    }
    case 'mansard': {
      const d = `M${L + 4} ${top + 2} L${x0 + 6} ${top - 50} L${x0 + W - 6} ${top - 50} L${R - 4} ${top + 2} Z`;
      return <g><clipPath id={`${id}_rc`}><path d={d} /></clipPath><path d={d} fill={color} stroke={INK} strokeWidth="3" />{shingles(d, 52)}<path d={d} fill="none" stroke={INK} strokeWidth="3" />{[0.3, 0.7].map(k => <g key={k}><rect x={x0 + W * k - 12} y={top - 38} width="24" height="26" fill={`url(#${id}_glass)`} stroke="#fff" strokeWidth="3" /><path d={`M${x0 + W * k - 16} ${top - 38} L${x0 + W * k} ${top - 50} L${x0 + W * k + 16} ${top - 38} Z`} fill={shade(color, -15)} stroke={INK} strokeWidth="2" /></g>)}<rect x={x0 - 2} y={top - 56} width={W + 4} height="8" fill={shade(color, -25)} stroke={INK} strokeWidth="2" /></g>;
    }
    case 'round':
      return <g><path d={`M${L} ${top + 2} Q${mid} ${top - 110} ${R} ${top + 2} Z`} fill={color} stroke={INK} strokeWidth="3" /><path d={`M${L + 20} ${top - 8} Q${mid} ${top - 86} ${R - 20} ${top - 8}`} stroke={shade(color, 30)} strokeWidth="4" fill="none" opacity="0.6" /></g>;
    case 'thatch': {
      const d = `M${L - 6} ${top + 6} Q${L + 10} ${top - 30} ${mid} ${top - 66} Q${R - 10} ${top - 30} ${R + 6} ${top + 6} Q${mid} ${top + 14} ${L - 6} ${top + 6} Z`;
      return <g><path d={d} fill={color} stroke={INK} strokeWidth="3" />{Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M${L + i * (R - L) / 15} ${top + 6} L${mid + (i - 7.5) * 6} ${top - 50}`} stroke={shade(color, -30)} strokeWidth="1.5" opacity="0.6" />)}</g>;
    }
    case 'gable':
    default: {
      const d = `M${L} ${top + 2} L${mid} ${top - 66} L${R} ${top + 2} Z`;
      return <g><clipPath id={`${id}_rc`}><path d={d} /></clipPath><path d={d} fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />{shingles(d, 68)}<path d={d} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" /><path d={`M${L} ${top + 2} L${R} ${top + 2}`} stroke={shade(color, -45)} strokeWidth="6" /></g>;
    }
  }
}

function GenericHouse({ p, wall, roofC, onDoor, id }) {
  const floors = Math.max(1, Math.min(3, p.floors || 1));
  const W = p.w || 180;
  const FH = 72;
  const x0 = 200 - W / 2 + (p.garage ? -26 : 0);
  const top = GY - floors * FH;
  const trim = p.trim || '#ffffff';
  const nWin = Math.max(1, Math.floor((W - 20) / 62));
  const mat = p.mat || 'plaster';
  const doorX = x0 + W / 2 - 18;
  return (
    <g>
      {p.chimney !== false && p.roof !== 'flat' && p.roof !== 'round' && (
        <g><rect x={x0 + W * 0.72} y={top - 66} width="22" height="44" fill="#9a3412" stroke={INK} strokeWidth="2.5" /><rect x={x0 + W * 0.72 - 3} y={top - 70} width="28" height="8" fill="#7c2d12" stroke={INK} strokeWidth="2" /><g className="ca-smoke"><circle cx={x0 + W * 0.72 + 11} cy={top - 80} r="7" fill="#e5e7eb" opacity="0.8" /></g></g>
      )}
      {p.garage && (
        <g>
          <rect x={x0 + W} y={GY - 60} width="70" height="60" fill={shade(wall, -8)} stroke={INK} strokeWidth="3" />
          {mat !== 'plaster' && <rect x={x0 + W} y={GY - 60} width="70" height="60" fill={`url(#${id}_${mat})`} />}
          <rect x={x0 + W - 4} y={GY - 66} width="78" height="8" fill={roofC} stroke={INK} strokeWidth="2.5" />
          <rect x={x0 + W + 10} y={GY - 46} width="50" height="46" fill="#e5e7eb" stroke={INK} strokeWidth="2.5" />
          {[0, 1, 2, 3].map(i => <path key={i} d={`M${x0 + W + 10} ${GY - 46 + 11 * (i + 1)} L${x0 + W + 60} ${GY - 46 + 11 * (i + 1)}`} stroke="#9ca3af" strokeWidth="2" />)}
        </g>
      )}
      <rect x={x0} y={top} width={W} height={floors * FH} fill={wall} stroke={INK} strokeWidth="3" />
      {mat !== 'plaster' && <rect x={x0} y={top} width={W} height={floors * FH} fill={`url(#${id}_${mat})`} />}
      <rect x={x0} y={top} width={W} height={floors * FH} fill={`url(#${id}_shade)`} />
      <rect x={x0 - 3} y={GY - 8} width={W + 6} height="8" fill={shade(wall, -35)} stroke={INK} strokeWidth="2" />
      {floors > 1 && Array.from({ length: floors - 1 }).map((_, i) => <rect key={i} x={x0 - 2} y={top + FH * (i + 1) - 3} width={W + 4} height="5" fill={trim} stroke={INK} strokeWidth="1.5" />)}
      {/* pencereler */}
      {Array.from({ length: floors }).map((_, f) => {
        const y = top + f * FH + 16;
        const isGround = f === floors - 1;
        const count = Math.max(2, nWin + 1);
        return Array.from({ length: count }).map((__, i) => {
          const cx = x0 + (W * (i + 1)) / (count + 1);
          if (isGround && Math.abs(cx - (doorX + 18)) < 42) return null;
          return <Win key={`${f}_${i}`} x={cx - 17} y={y} id={id} trim={trim} shutters={p.shutters} flowers={p.flowers && isGround} round={p.archWin} />;
        });
      })}
      {p.balcony && floors > 1 && (
        <g><rect x={x0 + W / 2 - 40} y={top + FH - 6} width="80" height="8" fill={trim} stroke={INK} strokeWidth="2" />{Array.from({ length: 9 }).map((_, i) => <rect key={i} x={x0 + W / 2 - 38 + i * 9.5} y={top + FH - 26} width="3" height="20" fill={trim} stroke={INK} strokeWidth="0.8" />)}<rect x={x0 + W / 2 - 40} y={top + FH - 28} width="80" height="4" fill={trim} stroke={INK} strokeWidth="1.5" /></g>
      )}
      <Roof kind={p.roof} x0={x0} W={W} top={top} color={roofC} id={id} />
      {p.solar && <g>{[0, 1, 2].map(i => { const x = x0 + 12 + i * 24, y = p.roof === 'flat' ? top - 26 : top - 20; return <path key={i} d={`M${x} ${y + 12} L${x + 8} ${y} L${x + 30} ${y} L${x + 22} ${y + 12} Z`} fill="#1e3a8a" stroke="#cbd5e1" strokeWidth="1.5" />; })}</g>}
      {p.porch && (
        <g>
          <path d={`M${doorX - 26} ${GY - 76} L${doorX + 62} ${GY - 76} L${doorX + 54} ${GY - 88} L${doorX - 18} ${GY - 88} Z`} fill={roofC} stroke={INK} strokeWidth="2.5" />
          <rect x={doorX - 22} y={GY - 76} width="6" height="72" fill={trim} stroke={INK} strokeWidth="1.5" /><rect x={doorX + 52} y={GY - 76} width="6" height="72" fill={trim} stroke={INK} strokeWidth="1.5" />
        </g>
      )}
      <Door x={doorX} color={p.doorC || '#7c2d12'} onDoor={onDoor} round={p.roundDoor !== false} />
    </g>
  );
}

function Special({ p, wall, roofC, onDoor, id }) {
  switch (p.style) {
    case 'castle': {
      const tower = (x) => (
        <g>
          <rect x={x} y="80" width="56" height={GY - 80} fill={shade(wall, -10)} stroke={INK} strokeWidth="3" />
          <rect x={x} y="80" width="56" height={GY - 80} fill={`url(#${id}_stone)`} opacity="0.7" />
          <path d={`M${x - 8} 84 L${x + 28} 20 L${x + 64} 84 Z`} fill={roofC} stroke={INK} strokeWidth="3" />
          <path d={`M${x + 28} 20 L${x + 28} 2`} stroke={INK} strokeWidth="3" />
          <path d={`M${x + 28} 2 L${x + 48} 8 L${x + 28} 14 Z`} fill="#ef4444" className="ca-flag" />
          <Win x={x + 14} y={118} w={28} h={34} id={id} round />
        </g>
      );
      return (
        <g>
          <rect x="110" y="122" width="180" height={GY - 122} fill={wall} stroke={INK} strokeWidth="3" />
          <rect x="110" y="122" width="180" height={GY - 122} fill={`url(#${id}_stone)`} opacity="0.7" />
          {[110, 140, 170, 200, 230, 260].map(x => <rect key={x} x={x} y="106" width="20" height="18" fill={wall} stroke={INK} strokeWidth="2.5" />)}
          {tower(62)}{tower(282)}
          <Win x={140} y={150} id={id} round /><Win x={226} y={150} id={id} round />
          <g onClick={onDoor} style={{ cursor: onDoor ? 'pointer' : 'default' }} className={onDoor ? 'ca-door' : ''}>
            <path d={`M176 ${GY} L176 210 Q200 180 224 210 L224 ${GY} Z`} fill="#78350f" stroke={INK} strokeWidth="3" />
            {[184, 192, 200, 208, 216].map(x => <path key={x} d={`M${x} 200 L${x} ${GY}`} stroke="#451a03" strokeWidth="2" />)}
          </g>
          <path d="M188 140 L194 128 L200 136 L206 128 L212 140 Z" fill="#facc15" stroke={INK} strokeWidth="2" />
        </g>
      );
    }
    case 'lighthouse':
      return (
        <g>
          <path d={`M168 ${GY} L176 70 L224 70 L232 ${GY} Z`} fill="#fff" stroke={INK} strokeWidth="3" />
          {[0, 1, 2].map(i => <path key={i} d={`M${170 + i * 2.7} ${GY - 40 - i * 60} L${230 - i * 2.7} ${GY - 40 - i * 60} L${229 - i * 2.7} ${GY - 70 - i * 60} L${171 + i * 2.7} ${GY - 70 - i * 60} Z`} fill={wall} />)}
          <rect x="174" y="40" width="52" height="30" fill="#fde047" stroke={INK} strokeWidth="3" className="ca-glow" />
          <path d="M168 40 L200 14 L232 40 Z" fill={roofC} stroke={INK} strokeWidth="3" />
          <rect x="166" y="66" width="68" height="6" fill="#1f2937" />
          <rect x="230" y={GY - 60} width="80" height="60" fill="#f8fafc" stroke={INK} strokeWidth="3" /><path d={`M224 ${GY - 58} L270 ${GY - 92} L316 ${GY - 58} Z`} fill={roofC} stroke={INK} strokeWidth="3" />
          <Door x={186} w={28} h={50} onDoor={onDoor} />
          <Win x={252} y={GY - 46} id={id} />
        </g>
      );
    case 'igloo':
      return (
        <g>
          <path d={`M90 ${GY} Q90 110 200 110 Q310 110 310 ${GY} Z`} fill="#f8fafc" stroke={INK} strokeWidth="3" />
          {[150, 190, 230].map((y, i) => <path key={y} d={`M${100 + i * 6} ${y} Q200 ${y - 20} ${300 - i * 6} ${y}`} stroke="#bfdbfe" strokeWidth="3" fill="none" />)}
          {[130, 170, 210, 250, 280].map((x, i) => <path key={x} d={`M${x} ${150 + (i % 2) * 40} L${x} ${190 + (i % 2) * 40}`} stroke="#bfdbfe" strokeWidth="3" />)}
          <g onClick={onDoor} style={{ cursor: onDoor ? 'pointer' : 'default' }} className={onDoor ? 'ca-door' : ''}>
            <path d={`M170 ${GY} L170 210 Q200 180 230 210 L230 ${GY} Z`} fill="#f8fafc" stroke={INK} strokeWidth="3" /><path d={`M182 ${GY} L182 216 Q200 198 218 216 L218 ${GY} Z`} fill="#1e3a8a" />
          </g>
        </g>
      );
    case 'treehouse':
      return (
        <g>
          <path d={`M180 ${GY} L186 130 L214 130 L220 ${GY} Z`} fill="#8d5a2b" stroke={INK} strokeWidth="3" />
          {[[120, 70, 50], [200, 40, 60], [280, 70, 50], [160, 100, 40], [250, 100, 40]].map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + 3} fill={INK} />)}
          {[[120, 70, 50], [200, 40, 60], [280, 70, 50], [160, 100, 40], [250, 100, 40]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#4caf50' : '#3f9b3a'} />)}
          <rect x="130" y="110" width="140" height="64" fill={wall} stroke={INK} strokeWidth="3" /><rect x="130" y="110" width="140" height="64" fill={`url(#${id}_wood)`} />
          <path d="M118 112 L200 66 L282 112 Z" fill={roofC} stroke={INK} strokeWidth="3" />
          <rect x="120" y="172" width="160" height="8" fill="#7a4a24" stroke={INK} strokeWidth="2" />
          <Win x={150} y={124} id={id} />
          <g onClick={onDoor} style={{ cursor: onDoor ? 'pointer' : 'default' }} className={onDoor ? 'ca-door' : ''}><rect x="214" y="126" width="30" height="46" rx="4" fill="#7c2d12" stroke={INK} strokeWidth="2.5" /></g>
          <g stroke={INK} strokeWidth="3"><path d={`M232 180 L232 ${GY} M250 180 L250 ${GY}`} />{[196, 212, 228, 244].map(y => <path key={y} d={`M232 ${y} L250 ${y}`} />)}</g>
        </g>
      );
    case 'windmill':
      return (
        <g>
          <path d={`M150 ${GY} L166 100 L234 100 L250 ${GY} Z`} fill={wall} stroke={INK} strokeWidth="3" />
          <path d={`M150 ${GY} L166 100 L234 100 L250 ${GY} Z`} fill={`url(#${id}_stone)`} opacity="0.5" />
          <path d="M158 102 Q200 46 242 102 Z" fill={roofC} stroke={INK} strokeWidth="3" />
          <g className="ca-windmill" style={{ transformOrigin: '200px 96px' }}>
            {[0, 90, 180, 270].map(a => <g key={a} transform={`rotate(${a} 200 96)`}><rect x="196" y="0" width="8" height="96" fill="#7a4a24" stroke={INK} strokeWidth="1.5" /><rect x="204" y="8" width="22" height="80" fill="#f8fafc" stroke={INK} strokeWidth="2" opacity="0.95" /></g>)}
          </g>
          <circle cx="200" cy="96" r="8" fill="#451a03" />
          <Door x={182} onDoor={onDoor} />
          <Win x={183} y={130} id={id} round />
        </g>
      );
    case 'dome':
      return (
        <g>
          <path d={`M90 ${GY} Q90 100 200 100 Q310 100 310 ${GY} Z`} fill={`url(#${id}_glass)`} stroke={INK} strokeWidth="3" opacity="0.95" />
          {[130, 170, 230, 270].map(x => <path key={x} d={`M${x} ${GY} Q${x + (200 - x) * 0.2} 130 200 100`} stroke="#fff" strokeWidth="3" fill="none" opacity="0.8" />)}
          <path d={`M95 200 Q200 170 305 200`} stroke="#fff" strokeWidth="3" fill="none" opacity="0.8" />
          <rect x="80" y={GY - 12} width="240" height="12" fill={roofC} stroke={INK} strokeWidth="2.5" />
          <Door x={182} color="#334155" onDoor={onDoor} round={false} />
        </g>
      );
    case 'tent':
      return (
        <g>
          <path d={`M110 ${GY} L200 90 L290 ${GY} Z`} fill={wall} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          {[0, 1, 2, 3].map(i => <path key={i} d={`M${200 - (i + 1) * 20} ${GY - 30 - i * 30} L${200 + (i + 1) * 20} ${GY - 30 - i * 30}`} stroke={roofC} strokeWidth="6" />)}
          <path d="M190 84 L196 60 M210 84 L204 60" stroke="#7a4a24" strokeWidth="4" />
          <g onClick={onDoor} style={{ cursor: onDoor ? 'pointer' : 'default' }} className={onDoor ? 'ca-door' : ''}><path d={`M176 ${GY} L200 170 L224 ${GY} Z`} fill="#451a03" /></g>
        </g>
      );
    case 'barn':
      return (
        <g>
          <path d={`M100 ${GY} L100 140 L140 96 L260 96 L300 140 L300 ${GY} Z`} fill={wall} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d={`M100 ${GY} L100 140 L140 96 L260 96 L300 140 L300 ${GY} Z`} fill={`url(#${id}_wood)`} opacity="0.6" />
          <path d="M92 144 L140 90 L260 90 L308 144" stroke={roofC} strokeWidth="12" fill="none" strokeLinejoin="round" />
          <g onClick={onDoor} style={{ cursor: onDoor ? 'pointer' : 'default' }} className={onDoor ? 'ca-door' : ''}>
            <rect x="160" y="170" width="80" height={GY - 170} fill="#fff" stroke={INK} strokeWidth="3" />
            <rect x="168" y="178" width="64" height={GY - 186} fill={wall} />
            <path d={`M168 178 L232 ${GY - 8} M232 178 L168 ${GY - 8}`} stroke="#fff" strokeWidth="6" />
          </g>
          <rect x="182" y="118" width="36" height="30" fill="#fff" stroke={INK} strokeWidth="2.5" /><path d="M182 118 L218 148 M218 118 L182 148" stroke={wall} strokeWidth="4" />
        </g>
      );
    case 'mushroom':
      return (
        <g>
          <path d={`M150 ${GY} Q146 170 160 150 L240 150 Q254 170 250 ${GY} Z`} fill="#fef3c7" stroke={INK} strokeWidth="3" />
          <path d="M90 156 Q90 60 200 56 Q310 60 310 156 Q200 172 90 156 Z" fill={roofC} stroke={INK} strokeWidth="3" />
          {[[140, 110, 16], [200, 86, 20], [262, 112, 15], [176, 132, 10], [236, 136, 10]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />)}
          <Door x={182} w={36} h={56} onDoor={onDoor} />
          <Win x={156} y={176} w={22} h={22} id={id} round /><Win x={224} y={176} w={22} h={22} id={id} round />
        </g>
      );
    case 'shack':
    default:
      return (
        <g transform="rotate(-2 200 200)">
          <rect x="128" y="150" width="144" height="110" fill={wall} stroke={INK} strokeWidth="3" />
          <rect x="128" y="150" width="144" height="110" fill={`url(#${id}_wood)`} />
          <path d="M112 156 L200 92 L290 158 Z" fill={roofC} stroke={INK} strokeWidth="3" />
          <rect x="150" y="122" width="26" height="16" fill={shade(roofC, 25)} stroke={INK} strokeWidth="1.5" transform="rotate(12 163 130)" />
          <rect x="226" y="126" width="22" height="14" fill={shade(roofC, -20)} stroke={INK} strokeWidth="1.5" transform="rotate(-8 237 133)" />
          <rect x="146" y="176" width="40" height="34" fill="#334155" stroke={INK} strokeWidth="2" />
          <path d="M142 182 L190 200 M142 200 L190 184" stroke="#a16207" strokeWidth="6" />
          <g onClick={onDoor} style={{ cursor: onDoor ? 'pointer' : 'default' }} className={onDoor ? 'ca-door' : ''}><rect x="210" y="196" width="40" height="64" fill="#5b3a1e" stroke={INK} strokeWidth="3" /><circle cx="242" cy="228" r="3" fill="#facc15" /></g>
          <path d="M258 98 L262 74 L272 74 L272 112" fill="#57534e" stroke={INK} strokeWidth="2" />
        </g>
      );
  }
}

// Eski hazır evlerin parametreleri
const LEGACY = {
  shack: { style: 'shack', wall: '#a47551', roofC: '#6b4f3a' },
  cottage: { style: 'house', mat: 'siding', roof: 'gable', w: 170, floors: 1, wall: '#fde68a', roofC: '#b91c1c', shutters: '#16a34a', flowers: true },
  twostory: { style: 'house', mat: 'brick', roof: 'gable', w: 190, floors: 2, wall: '#93c5fd', roofC: '#1e3a8a', balcony: true },
  villa: { style: 'house', mat: 'plaster', roof: 'flat', w: 230, floors: 2, wall: '#f8fafc', roofC: '#374151', garage: true, chimney: false },
  castle: { style: 'castle', wall: '#e2e8f0', roofC: '#6d28d9' },
};

export function HouseArt({ house, wallPaint, roofPaint, onDoor }) {
  const id = `h${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const r = house?.render || {};
  const p = { ...(LEGACY[r.kind] || {}), ...r };
  const wall = wallPaint || p.wall || '#fde68a';
  const roofC = roofPaint || p.roofC || '#b91c1c';
  return (
    <g>
      <Defs id={id} wall={wall} />
      <ellipse cx="200" cy={GY + 2} rx="150" ry="8" fill="#000" opacity="0.15" />
      {(!p.style || p.style === 'house')
        ? <GenericHouse p={p} wall={wall} roofC={roofC} onDoor={onDoor} id={id} />
        : <Special p={p} wall={wall} roofC={roofC} onDoor={onDoor} id={id} />}
    </g>
  );
}
