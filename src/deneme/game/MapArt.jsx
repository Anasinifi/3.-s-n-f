import React from 'react';

// ============================================================================
// --- GRUP: HARİTA ÇİZİMLERİ (çizgi film tarzı, konturlu, gerçekçi arazi) ---
// ============================================================================
// Emoji yok: ağaçlar, adalar, su, yol, kayalar hepsi SVG ile çizilir.
// Her çizimin (0,0) noktası, nesnenin yere bastığı ALT ORTA noktadır.

export const INK = '#2b2233';
export const seeded = (seed) => { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; };
export const hashStr = (str) => Array.from(String(str)).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

// İki ada arasındaki yolun eğrisi (kübik bezier)
export const bezPoint = (a, p, t) => {
  const my = (a.y + p.y) / 2;
  const c1 = { x: a.x, y: my }, c2 = { x: p.x, y: my };
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p.y,
  };
};
export const bezPath = (pts) => pts.reduce((d, p, i) => {
  if (i === 0) return `M${p.x} ${p.y}`;
  const a = pts[i - 1]; const my = (a.y + p.y) / 2;
  return `${d} C${a.x} ${my} ${p.x} ${my} ${p.x} ${p.y}`;
}, '');

// Düzensiz yuvarlak leke (ada, açıklık, göl)
export const blobPath = (rx, ry, seed, wob = 0.14, n = 14) => {
  const r = seeded(seed);
  const pts = Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 2 * wob;
    return [Math.cos(a) * rx * k, Math.sin(a) * ry * k];
  });
  let d = '';
  pts.forEach((p, i) => {
    const nx = pts[(i + 1) % n];
    const mx = (p[0] + nx[0]) / 2, my = (p[1] + nx[1]) / 2;
    d += i === 0 ? `M${mx} ${my}` : '';
    d += ` Q${nx[0]} ${nx[1]} ${(nx[0] + pts[(i + 2) % n][0]) / 2} ${(nx[1] + pts[(i + 2) % n][1]) / 2}`;
  });
  return `${d} Z`;
};

// ---------------------------------------------------------------------------
// AĞAÇLAR / BİTKİLER
// ---------------------------------------------------------------------------
export function Oak({ s = 1, hue = 0, sway = false }) {
  const leaf = ['#3f9b3a', '#4caf50', '#5cb85c', '#2e8b57'][hue % 4];
  const dark = ['#2e7d32', '#357a38', '#3d8b40', '#22704a'][hue % 4];
  const blobs = [[0, -56, 26], [-20, -44, 20], [20, -44, 21], [-10, -70, 18], [12, -68, 17]];
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="26" ry="7" fill="#000" opacity="0.18" />
      <path d="M-6 0 L-4 -36 L4 -36 L6 0 Z" fill="#7a4a24" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <g className={sway ? 'ca-sway' : ''}>
        {blobs.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + 2.6} fill={INK} />)}
        {blobs.map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={leaf} />)}
        <circle cx="8" cy="-40" r="14" fill={dark} opacity="0.55" />
        <circle cx="-9" cy="-64" r="8" fill="#a5d6a7" opacity="0.55" />
      </g>
    </g>
  );
}

export function Pine({ s = 1, snow = false, hue = 0 }) {
  const c = ['#2f7d4a', '#2b6e44', '#367f52'][hue % 3];
  const layers = [[-26, -16, 26, -16, 0, -48], [-21, -36, 21, -36, 0, -66], [-15, -54, 15, -54, 0, -84]];
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="20" ry="6" fill="#000" opacity="0.18" />
      <rect x="-4" y="-18" width="8" height="18" fill="#6b4226" stroke={INK} strokeWidth="2.5" />
      {layers.map(([x1, y1, x2, y2, x3, y3], i) => (
        <g key={i}>
          <path d={`M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z`} fill={c} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
          {snow && <path d={`M${x1 * 0.55} ${y1 - (y1 - y3) * 0.45} Q0 ${y3 + 10} ${x2 * 0.55} ${y2 - (y2 - y3) * 0.45} L0 ${y3 + 2} Z`} fill="#fff" />}
          <path d={`M${x3 + 2} ${y3 + 6} L${x2 - 6} ${y2 - 2}`} stroke="#000" strokeOpacity="0.15" strokeWidth="4" />
        </g>
      ))}
    </g>
  );
}

export function Palm({ s = 1, flip = false }) {
  return (
    <g transform={`scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="0" cy="0" rx="18" ry="5" fill="#000" opacity="0.18" />
      <path d="M-3 0 Q2 -30 14 -62 L19 -60 Q8 -30 4 0 Z" fill="#a0703c" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${-1 + i * 2.6} ${-8 - i * 11} l6 -2`} stroke={INK} strokeWidth="1.6" opacity="0.5" />)}
      <g className="ca-sway" style={{ transformOrigin: '16px -62px' }}>
        {[[-34, -58], [-26, -80], [6, -88], [40, -74], [42, -50]].map(([x, y], i) => (
          <path key={i} d={`M16 -62 Q${(16 + x) / 2} ${y - 14} ${x} ${y} Q${(16 + x) / 2 + 2} ${y - 2} 16 -60 Z`} fill={i % 2 ? '#3daa4b' : '#2f9a40'} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        ))}
        <circle cx="13" cy="-60" r="4.5" fill="#7a4a24" stroke={INK} strokeWidth="1.5" /><circle cx="20" cy="-58" r="4.5" fill="#7a4a24" stroke={INK} strokeWidth="1.5" />
      </g>
    </g>
  );
}

export function Bush({ s = 1, c = '#4caf50', flowers = false }) {
  const b = [[-12, -10, 12], [6, -12, 14], [18, -6, 9], [-22, -5, 8]];
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="26" ry="5" fill="#000" opacity="0.15" />
      {b.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + 2.4} fill={INK} />)}
      {b.map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={c} />)}
      <circle cx="2" cy="-18" r="5" fill="#fff" opacity="0.25" />
      {flowers && [[-10, -14, '#f472b6'], [8, -20, '#facc15'], [16, -8, '#fff'], [-20, -8, '#f472b6']].map(([x, y, fc], i) => <circle key={`fl${i}`} cx={x} cy={y} r="3" fill={fc} stroke={INK} strokeWidth="1" />)}
    </g>
  );
}

export function Rock({ s = 1, c = '#9ca3af', moss = false }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="20" ry="5" fill="#000" opacity="0.2" />
      <path d="M-18 0 Q-20 -14 -8 -20 Q4 -26 14 -16 Q22 -8 18 0 Z" fill={c} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-8 -16 Q0 -20 6 -16" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" fill="none" strokeLinecap="round" />
      {moss && <path d="M-14 -12 Q-4 -22 10 -18 Q2 -14 -14 -10 Z" fill="#65a30d" />}
    </g>
  );
}

export function Flowers({ s = 1, seed = 1 }) {
  const r = seeded(seed);
  const cols = ['#f472b6', '#facc15', '#ffffff', '#a78bfa', '#fb7185'];
  return (
    <g transform={`scale(${s})`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const x = (r() - 0.5) * 30, y = -r() * 10;
        return <g key={i}><path d={`M${x} ${y} l0 6`} stroke="#3f7d2a" strokeWidth="1.5" /><circle cx={x} cy={y} r="3.2" fill={cols[Math.floor(r() * cols.length)]} stroke={INK} strokeWidth="1" /><circle cx={x} cy={y} r="1" fill="#f59e0b" /></g>;
      })}
    </g>
  );
}

export function Mushroom({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      <rect x="-4" y="-12" width="8" height="12" rx="3" fill="#fef3c7" stroke={INK} strokeWidth="2" />
      <path d="M-14 -11 Q0 -30 14 -11 Z" fill="#ef4444" stroke={INK} strokeWidth="2.2" />
      <circle cx="-5" cy="-17" r="2.4" fill="#fff" /><circle cx="5" cy="-19" r="2" fill="#fff" />
    </g>
  );
}

export function Cactus({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="16" ry="4" fill="#000" opacity="0.18" />
      <path d="M-6 0 L-6 -48 Q0 -56 6 -48 L6 0 Z M-6 -22 L-16 -22 Q-20 -22 -20 -28 L-20 -38 Q-15 -42 -12 -38 L-12 -30 L-6 -30 M6 -28 L14 -28 L14 -40 Q18 -44 22 -40 L22 -26 Q22 -20 16 -20 L6 -20" fill="#4caf50" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-1 -46 L-1 -6" stroke="#2e7d32" strokeWidth="2" />
    </g>
  );
}

export function Lollipop({ s = 1, c = '#f472b6' }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="14" ry="4" fill="#000" opacity="0.15" />
      <rect x="-2.5" y="-46" width="5" height="46" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="0" cy="-58" r="18" fill={c} stroke={INK} strokeWidth="2.6" />
      <path d="M0 -58 m-12 0 a12 12 0 1 1 12 12 a8 8 0 1 1 -8 -8 a4 4 0 1 1 4 4" stroke="#fff" strokeWidth="3" fill="none" />
    </g>
  );
}

export function CandyCane({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M0 0 L0 -40 Q0 -54 12 -54 Q24 -54 24 -42" stroke={INK} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M0 0 L0 -40 Q0 -54 12 -54 Q24 -54 24 -42" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M0 0 L0 -40 Q0 -54 12 -54 Q24 -54 24 -42" stroke="#ef4444" strokeWidth="7" fill="none" strokeLinecap="butt" strokeDasharray="6 6" />
    </g>
  );
}

export function Gumdrop({ s = 1, c = '#22c55e' }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M-14 0 Q-14 -24 0 -24 Q14 -24 14 0 Z" fill={c} stroke={INK} strokeWidth="2.5" />
      {[[-6, -14], [4, -18], [6, -6], [-4, -6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" />)}
    </g>
  );
}

export function Fern({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      {[-50, -25, 0, 25, 50].map((a, i) => (
        <g key={i} transform={`rotate(${a})`}>
          <path d="M0 0 Q4 -20 0 -40 Q-4 -20 0 0 Z" fill={i % 2 ? '#3f8f2f' : '#4caf50'} stroke={INK} strokeWidth="2" />
          {[-10, -20, -30].map(y => <path key={y} d={`M0 ${y} l-7 -4 M0 ${y} l7 -4`} stroke="#2e6b22" strokeWidth="2" />)}
        </g>
      ))}
    </g>
  );
}

export function SnowRock({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M-18 0 Q-20 -14 -8 -20 Q4 -26 14 -16 Q22 -8 18 0 Z" fill="#94a3b8" stroke={INK} strokeWidth="2.5" />
      <path d="M-14 -14 Q-6 -24 6 -22 Q16 -18 14 -12 Q4 -16 -14 -12 Z" fill="#fff" />
    </g>
  );
}

export function Penguin({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="10" ry="3" fill="#000" opacity="0.2" />
      <ellipse cx="0" cy="-14" rx="10" ry="14" fill="#1f2937" stroke={INK} strokeWidth="2" />
      <ellipse cx="0" cy="-12" rx="6" ry="10" fill="#fff" />
      <circle cx="-3" cy="-22" r="1.6" fill={INK} /><circle cx="3" cy="-22" r="1.6" fill={INK} />
      <path d="M-2 -19 L2 -19 L0 -16 Z" fill="#f59e0b" />
      <path d="M-5 0 l-3 1 M5 0 l3 1" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

export function Bones({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M-14 -4 L14 -10" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M-14 -4 L14 -10" stroke="#f5f5f4" strokeWidth="4" strokeLinecap="round" />
      <circle cx="-16" cy="-6" r="3.5" fill="#f5f5f4" stroke={INK} strokeWidth="1.6" /><circle cx="-14" cy="-1" r="3.5" fill="#f5f5f4" stroke={INK} strokeWidth="1.6" />
      <circle cx="16" cy="-12" r="3.5" fill="#f5f5f4" stroke={INK} strokeWidth="1.6" /><circle cx="15" cy="-7" r="3.5" fill="#f5f5f4" stroke={INK} strokeWidth="1.6" />
    </g>
  );
}

export function Asteroid({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      <path d={blobPath(14, 11, 7, 0.25, 9)} fill="#78716c" stroke={INK} strokeWidth="2.2" />
      <circle cx="-4" cy="-2" r="3" fill="#57534e" /><circle cx="5" cy="3" r="2" fill="#57534e" />
    </g>
  );
}

export function Stump({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="18" ry="5" fill="#000" opacity="0.2" />
      <path d="M-13 0 L-12 -14 L12 -14 L13 0 Z" fill="#8d5a2b" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="0" cy="-14" rx="12" ry="5" fill="#e3b778" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="0" cy="-14" rx="6" ry="2.4" fill="none" stroke="#b8864b" strokeWidth="1.5" />
    </g>
  );
}

export function Log({ s = 1, rot = 0 }) {
  return (
    <g transform={`rotate(${rot}) scale(${s})`}>
      <rect x="-34" y="-12" width="68" height="14" rx="7" fill="#8d5a2b" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="34" cy="-5" rx="5" ry="7" fill="#e3b778" stroke={INK} strokeWidth="2.2" />
      <path d="M-24 -6 L10 -6" stroke="#6b4226" strokeWidth="2" />
      {[-30, -8, 18].map(x => <path key={x} d={`M${x} -12 l4 -6 l3 6`} fill="#4caf50" stroke={INK} strokeWidth="1.4" />)}
    </g>
  );
}

// ---------------------------------------------------------------------------
// ADA / AÇIKLIK TEMELLERİ VE SİMGE YAPILAR
// ---------------------------------------------------------------------------
export function IslandBase({ seed }) {
  const sand = blobPath(74, 46, seed, 0.12);
  const grass = blobPath(54, 32, seed + 3, 0.16);
  return (
    <g>
      <ellipse cx="0" cy="8" rx="100" ry="64" fill="#7fdcf3" opacity="0.65" />
      <path d={blobPath(84, 54, seed + 9, 0.1)} fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="10 8" opacity="0.85" className="ca-foam" />
      <g transform="translate(0 8)"><path d={sand} fill={INK} transform="scale(1.04)" /></g>
      <path d={sand} fill="#fde7a3" transform="translate(0 6)" />
      <path d={sand} fill="#f8d77d" transform="translate(0 6) scale(0.98 0.9)" />
      <path d={grass} fill={INK} transform="translate(0 -4) scale(1.05)" />
      <path d={grass} fill="#5cbf4a" transform="translate(0 -4)" />
      <path d={blobPath(36, 18, seed + 5, 0.2)} fill="#7fd36b" transform="translate(-10 -12)" />
    </g>
  );
}

export function ClearingBase({ seed, fill = '#a8d97a', stroke = '#6fae45' }) {
  return (
    <g>
      <path d={blobPath(72, 42, seed, 0.14)} fill={stroke} transform="translate(0 4)" />
      <path d={blobPath(68, 38, seed, 0.14)} fill={fill} />
      <path d={blobPath(30, 12, seed + 2, 0.2)} fill="#fff" opacity="0.15" transform="translate(-14 -10)" />
    </g>
  );
}

export function PlanetBase({ seed, idx }) {
  const cols = [['#f97316', '#fdba74'], ['#3b82f6', '#93c5fd'], ['#a855f7', '#d8b4fe'], ['#22c55e', '#86efac'], ['#ef4444', '#fca5a5'], ['#eab308', '#fde047']];
  const [c, l] = cols[idx % cols.length];
  const r = seeded(seed);
  return (
    <g transform="translate(0 -20)">
      <circle r="58" fill={c} opacity="0.15" />
      {idx % 2 === 0 && <ellipse rx="70" ry="14" fill="none" stroke={l} strokeWidth="7" transform="rotate(-14)" opacity="0.9" />}
      <circle r="46" fill={INK} />
      <circle r="43" fill={c} />
      <path d="M-43 0 A43 43 0 0 0 43 0 A43 30 0 0 1 -43 0 Z" fill="#000" opacity="0.15" />
      {Array.from({ length: 4 }).map((_, i) => <circle key={i} cx={(r() - 0.5) * 50} cy={(r() - 0.5) * 50} r={4 + r() * 6} fill="#000" opacity="0.15" />)}
      <circle cx="-16" cy="-18" r="10" fill="#fff" opacity="0.3" />
      {idx % 2 === 0 && <path d="M-68 16 A70 14 0 0 0 68 -16" fill="none" stroke={l} strokeWidth="7" transform="rotate(-14)" />}
    </g>
  );
}

// Adanın üstündeki simge (her adada farklı)
export function Landmark({ art, idx }) {
  const k = idx % 5;
  const shadow = <ellipse cx="0" cy="2" rx="26" ry="6" fill="#000" opacity="0.18" />;
  if (art === 'space') {
    return (
      <g transform="translate(0 -62)">
        {k % 2 === 0
          ? <g><path d="M0 -26 L0 0" stroke={INK} strokeWidth="3" /><path d="M0 -26 L16 -21 L0 -16 Z" fill="#ef4444" stroke={INK} strokeWidth="2" /></g>
          : <g><path d="M-14 0 Q-14 -18 0 -18 Q14 -18 14 0 Z" fill="#e2e8f0" stroke={INK} strokeWidth="2.5" /><circle cx="0" cy="-8" r="5" fill="#38bdf8" stroke={INK} strokeWidth="2" /></g>}
      </g>
    );
  }
  switch (`${art}:${k}`) {
    case 'ocean:0': return <g>{shadow}<path d="M-20 0 L-20 -24 L20 -24 L20 0 Z" fill="#c08457" stroke={INK} strokeWidth="2.5" /><path d="M-28 -22 L0 -44 L28 -22 Z" fill="#e2c275" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />{[-18, -8, 2, 12].map(x => <path key={x} d={`M${x} -24 l-4 -8`} stroke="#b4924c" strokeWidth="2" />)}<rect x="-6" y="-14" width="12" height="14" fill="#7a4a24" stroke={INK} strokeWidth="2" /></g>;
    case 'ocean:1': return <g>{shadow}<path d="M-10 0 L-7 -54 L7 -54 L10 0 Z" fill="#fff" stroke={INK} strokeWidth="2.5" />{[-12, -28, -44].map(y => <path key={y} d={`M-9 ${y} L9 ${y} L8.6 ${y - 7} L-8.6 ${y - 7} Z`} fill="#ef4444" />)}<rect x="-9" y="-66" width="18" height="12" fill="#fde047" stroke={INK} strokeWidth="2.5" /><path d="M-11 -66 L0 -76 L11 -66 Z" fill="#ef4444" stroke={INK} strokeWidth="2.5" /></g>;
    case 'ocean:2': return <g>{shadow}<path d="M-18 -2 L18 -2 L14 -18 L-14 -18 Z" fill="#92400e" stroke={INK} strokeWidth="2.5" /><path d="M-14 -18 Q0 -32 14 -18 Z" fill="#b45309" stroke={INK} strokeWidth="2.5" /><rect x="-3" y="-14" width="6" height="7" fill="#facc15" stroke={INK} strokeWidth="1.5" /></g>;
    case 'ocean:3': return <g>{shadow}<path d="M-24 0 Q-26 -10 -14 -12 L18 -14 Q28 -8 24 0 Z" fill="#7a4a24" stroke={INK} strokeWidth="2.5" /><path d="M-2 -12 L-2 -48" stroke={INK} strokeWidth="3" /><path d="M-1 -46 Q16 -36 -1 -22 Z" fill="#f8fafc" stroke={INK} strokeWidth="2" /></g>;
    case 'ocean:4': return <g>{shadow}{[[-10, -6], [8, -4], [0, -14]].map(([x, y], i) => <path key={i} d={`M${x - 7} ${y} L${x + 7} ${y - 10} M${x - 7} ${y - 10} L${x + 7} ${y}`} stroke="#ef4444" strokeWidth="4" strokeLinecap="round" opacity={i === 2 ? 1 : 0} />)}<path d="M-8 -6 L8 -18 M-8 -18 L8 -6" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" /><Palm s={0.55} flip /></g>;
    case 'forest:0': return <g>{shadow}<path d="M-22 0 L0 -36 L22 0 Z" fill="#f97316" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" /><path d="M0 -36 L-6 0 L6 0 Z" fill="#7c2d12" stroke={INK} strokeWidth="2" /><path d="M0 -36 L0 -44" stroke={INK} strokeWidth="2.5" /></g>;
    case 'forest:1': return <g>{shadow}<rect x="-22" y="-26" width="44" height="26" fill="#a0703c" stroke={INK} strokeWidth="2.5" />{[-20, -13, -6].map(y => <path key={y} d={`M-22 ${y} L22 ${y}`} stroke="#6b4226" strokeWidth="2" />)}<path d="M-28 -24 L0 -46 L28 -24 Z" fill="#b91c1c" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" /><rect x="-5" y="-14" width="10" height="14" fill="#5b3a1e" stroke={INK} strokeWidth="2" /><rect x="10" y="-20" width="8" height="8" fill="#fde68a" stroke={INK} strokeWidth="1.6" /><g className="ca-smoke"><circle cx="16" cy="-50" r="4" fill="#e5e7eb" /></g></g>;
    case 'forest:2': return <g>{shadow}{[-14, -5, 5, 14].map((x, i) => <ellipse key={i} cx={x} cy={-3} rx="7" ry="4" fill="#78716c" stroke={INK} strokeWidth="1.6" />)}<path d="M-8 -4 L8 -12 M8 -4 L-8 -12" stroke="#7a4a24" strokeWidth="5" strokeLinecap="round" /><g className="ca-fire"><path d="M-8 -6 Q-10 -20 0 -30 Q4 -20 10 -22 Q10 -10 8 -6 Z" fill="#f97316" stroke={INK} strokeWidth="2" /><path d="M-3 -6 Q-4 -14 1 -20 Q4 -12 5 -6 Z" fill="#fde047" /></g></g>;
    case 'forest:3': return <g>{shadow}<rect x="-3" y="-34" width="6" height="34" fill="#7a4a24" stroke={INK} strokeWidth="2" /><path d="M-22 -34 L16 -34 L24 -27 L16 -20 L-22 -20 Z" fill="#c08457" stroke={INK} strokeWidth="2.5" /><path d="M-16 -27 L12 -27" stroke="#7a4a24" strokeWidth="2" /></g>;
    case 'forest:4': return <g>{shadow}<Mushroom s={1.6} /><g transform="translate(16 0)"><Mushroom s={0.9} /></g><g transform="translate(-16 2)"><Mushroom s={0.7} /></g></g>;
    case 'desert:0': return <g>{shadow}<path d="M-30 0 L0 -40 L30 0 Z" fill="#e7b75c" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" /><path d="M0 -40 L30 0 L8 0 Z" fill="#c9952f" /><path d="M-18 -14 L18 -14 M-10 -26 L10 -26" stroke="#b07c25" strokeWidth="2" /></g>;
    case 'desert:1': return <g><ellipse cx="0" cy="-2" rx="30" ry="12" fill="#38bdf8" stroke={INK} strokeWidth="2.5" /><ellipse cx="-6" cy="-5" rx="12" ry="3" fill="#fff" opacity="0.5" /><g transform="translate(22 -2)"><Palm s={0.6} /></g></g>;
    case 'desert:2': return <g>{shadow}<path d="M-24 0 L0 -32 L24 0 Z" fill="#fef3c7" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" /><path d="M0 -32 L-6 0 L6 0 Z" fill="#b45309" stroke={INK} strokeWidth="2" /><path d="M0 -32 L0 -42" stroke={INK} strokeWidth="2" /><path d="M0 -42 L10 -38 L0 -35 Z" fill="#ef4444" /></g>;
    case 'desert:3': return <g>{shadow}<Cactus s={1.2} /></g>;
    case 'desert:4': return <g>{shadow}<rect x="-14" y="-18" width="28" height="18" rx="3" fill="#a8a29e" stroke={INK} strokeWidth="2.5" /><ellipse cx="0" cy="-18" rx="14" ry="4" fill="#1e3a8a" stroke={INK} strokeWidth="2" /><path d="M-16 -18 L-16 -36 L16 -36 L16 -18" stroke="#7a4a24" strokeWidth="3" fill="none" /><path d="M-18 -36 L18 -36 L0 -46 Z" fill="#b45309" stroke={INK} strokeWidth="2" /></g>;
    case 'ice:0': return <g>{shadow}<path d="M-26 0 Q-26 -30 0 -30 Q26 -30 26 0 Z" fill="#f8fafc" stroke={INK} strokeWidth="2.5" /><path d="M-26 -10 L26 -10 M-22 -20 L22 -20 M-8 -30 L-8 -20 M8 -30 L8 -20 M0 -20 L0 -10 M-14 -10 L-14 0 M14 -10 L14 0" stroke="#bfdbfe" strokeWidth="2" /><path d="M-8 0 Q-8 -12 0 -12 Q8 -12 8 0 Z" fill="#1e3a8a" stroke={INK} strokeWidth="2" /></g>;
    case 'ice:1': return <g>{shadow}<circle cx="0" cy="-10" r="11" fill="#fff" stroke={INK} strokeWidth="2.5" /><circle cx="0" cy="-27" r="8" fill="#fff" stroke={INK} strokeWidth="2.5" /><path d="M-1 -27 L8 -25 L-1 -23 Z" fill="#f97316" /><path d="M-6 -35 L6 -35 L5 -42 L-5 -42 Z" fill="#1f2937" /><circle cx="-3" cy="-29" r="1.2" fill={INK} /><circle cx="3" cy="-29" r="1.2" fill={INK} /></g>;
    case 'ice:2': return <g>{shadow}{[[-10, 0, 1.2], [8, -2, 0.9], [0, -4, 1.6]].map(([x, y, s], i) => <path key={i} d={`M${x} ${y} l${-6 * s} ${-10 * s} l${6 * s} ${-16 * s} l${6 * s} ${16 * s} Z`} fill="#bae6fd" stroke={INK} strokeWidth="2" />)}</g>;
    case 'ice:3': return <g>{shadow}<Penguin s={1.4} /><g transform="translate(16 2)"><Penguin s={0.9} /></g></g>;
    case 'ice:4': return <g>{shadow}<Pine s={0.7} snow /></g>;
    case 'candy:0': return <g>{shadow}<rect x="-20" y="-24" width="40" height="24" fill="#fde68a" stroke={INK} strokeWidth="2.5" /><path d="M-26 -22 Q0 -50 26 -22 Z" fill="#f472b6" stroke={INK} strokeWidth="2.5" />{[-16, -6, 4, 14].map(x => <circle key={x} cx={x} cy={-26} r="3" fill="#fff" stroke={INK} strokeWidth="1" />)}<rect x="-5" y="-14" width="10" height="14" fill="#7c2d12" stroke={INK} strokeWidth="2" /></g>;
    case 'candy:1': return <g>{shadow}<path d="M-16 0 L-20 -18 L20 -18 L16 0 Z" fill="#f9a8d4" stroke={INK} strokeWidth="2.5" />{[-12, -4, 4, 12].map(x => <path key={x} d={`M${x} 0 L${x * 1.2} -18`} stroke="#ec4899" strokeWidth="2" />)}<path d="M-22 -18 Q-24 -36 0 -40 Q24 -36 22 -18 Z" fill="#fff" stroke={INK} strokeWidth="2.5" /><circle cx="0" cy="-42" r="5" fill="#ef4444" stroke={INK} strokeWidth="2" /></g>;
    case 'candy:2': return <g><Lollipop s={1.1} c="#a78bfa" /></g>;
    case 'candy:3': return <g>{shadow}<Gumdrop s={1.4} c="#f87171" /><g transform="translate(18 2)"><Gumdrop s={0.9} c="#facc15" /></g></g>;
    case 'candy:4': return <g><CandyCane s={1} /></g>;
    case 'dino:0': return <g>{shadow}<ellipse cx="0" cy="-6" rx="24" ry="9" fill="#a16207" stroke={INK} strokeWidth="2.5" />{[[-8, -14], [6, -15], [-1, -18]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="6" ry="8" fill="#fef3c7" stroke={INK} strokeWidth="2" />)}</g>;
    case 'dino:1': return <g>{shadow}<path d="M-28 0 Q-30 -34 0 -38 Q30 -34 28 0 Z" fill="#78716c" stroke={INK} strokeWidth="2.5" /><path d="M-12 0 Q-12 -20 0 -20 Q12 -20 12 0 Z" fill="#1c1917" /></g>;
    case 'dino:2': return <g><Bones s={1.2} /><g transform="translate(0 -4)"><Fern s={0.6} /></g></g>;
    case 'dino:3': return <g>{shadow}<Fern s={0.9} /></g>;
    case 'dino:4': return <g>{shadow}<Rock s={1.3} c="#a8a29e" moss /></g>;
    default: return <g>{shadow}<Rock s={1} /></g>;
  }
}

// ---------------------------------------------------------------------------
// ARAZİ (arka plan + serpiştirilmiş süsler)
// ---------------------------------------------------------------------------
const ART_BG = {
  ocean: ['#4fc3f7', '#0288d1'],
  forest: ['#86c95a', '#4f9a2f'],
  desert: ['#fde9a8', '#efbf62'],
  ice: ['#f4f9ff', '#cfe6fb'],
  candy: ['#ffe4ef', '#f9b4d4'],
  dino: ['#9ccc65', '#5d7c2f'],
  space: ['#1e1b4b', '#020617'],
};

const nearPath = (x, y, samples, d) => samples.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < d * d);

function decorFor(art, r, x, y, key) {
  const v = r();
  const s = 0.75 + r() * 0.5;
  const flip = r() < 0.5;
  const t = `translate(${x} ${y})`;
  switch (art) {
    case 'forest':
      if (v < 0.42) return <g key={key} transform={t}><Pine s={s} hue={Math.floor(r() * 3)} /></g>;
      if (v < 0.78) return <g key={key} transform={t}><Oak s={s} hue={Math.floor(r() * 4)} /></g>;
      if (v < 0.86) return <g key={key} transform={t}><Bush s={s} flowers={r() < 0.5} /></g>;
      if (v < 0.92) return <g key={key} transform={t}><Rock s={s * 0.8} moss /></g>;
      if (v < 0.96) return <g key={key} transform={t}><Mushroom s={s} /></g>;
      return <g key={key} transform={t}><Flowers seed={key.length + Math.floor(v * 100)} /></g>;
    case 'desert':
      if (v < 0.35) return <g key={key} transform={t}><Cactus s={s} /></g>;
      if (v < 0.6) return <g key={key} transform={t}><Rock s={s * 0.9} c="#d6a35c" /></g>;
      if (v < 0.72) return <g key={key} transform={t}><Bones s={s * 0.8} /></g>;
      if (v < 0.85) return <g key={key} transform={t}><Palm s={s * 0.8} flip={flip} /></g>;
      return <g key={key} transform={t}><path d="M-30 0 Q0 -16 30 0 Z" fill="#f7d48a" stroke="#d9a748" strokeWidth="2" /></g>;
    case 'ice':
      if (v < 0.5) return <g key={key} transform={t}><Pine s={s} snow hue={Math.floor(r() * 3)} /></g>;
      if (v < 0.7) return <g key={key} transform={t}><SnowRock s={s} /></g>;
      if (v < 0.82) return <g key={key} transform={t}><Penguin s={s} /></g>;
      return <g key={key} transform={t}><ellipse cx="0" cy="-4" rx={28 * s} ry={10 * s} fill="#bfe3ff" stroke="#fff" strokeWidth="3" /><path d={`M${-14 * s} -6 L${4 * s} -8`} stroke="#fff" strokeWidth="3" strokeLinecap="round" /></g>;
    case 'candy':
      if (v < 0.4) return <g key={key} transform={t}><Lollipop s={s} c={['#f472b6', '#a78bfa', '#38bdf8', '#facc15'][Math.floor(r() * 4)]} /></g>;
      if (v < 0.6) return <g key={key} transform={t}><CandyCane s={s * 0.9} /></g>;
      if (v < 0.85) return <g key={key} transform={t}><Gumdrop s={s} c={['#22c55e', '#f87171', '#facc15', '#60a5fa'][Math.floor(r() * 4)]} /></g>;
      return <g key={key} transform={t}><Bush s={s} c="#f9a8d4" flowers /></g>;
    case 'dino':
      if (v < 0.4) return <g key={key} transform={t}><Fern s={s} /></g>;
      if (v < 0.65) return <g key={key} transform={t}><Palm s={s} flip={flip} /></g>;
      if (v < 0.8) return <g key={key} transform={t}><Rock s={s} c="#a8a29e" moss /></g>;
      if (v < 0.9) return <g key={key} transform={t}><Bones s={s * 0.8} /></g>;
      return <g key={key} transform={t}><Bush s={s} c="#558b2f" /></g>;
    case 'space':
      if (v < 0.6) return <g key={key} transform={t}><Asteroid s={s} /></g>;
      return <g key={key} transform={t}><circle r={2 + r() * 2} fill="#fff" className="ca-twinkle2" style={{ animationDelay: `${r() * 2}s` }} /></g>;
    case 'ocean':
    default:
      if (v < 0.45) return <g key={key} transform={t}><Rock s={s * 0.8} c="#94a3b8" /><ellipse cx="0" cy="1" rx={24 * s} ry={6 * s} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.8" className="ca-foam" /></g>;
      if (v < 0.7) return <g key={key} transform={t}><path d={`M-10 0 Q-14 -14 -6 -26 M0 0 Q4 -16 -2 -30 M8 0 Q12 -10 6 -22`} stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" /></g>;
      return <g key={key} transform={t}><ellipse rx={14 * s} ry={5 * s} fill="#01579b" opacity="0.35" /><g className="ca-fishjump" style={{ animationDelay: `${r() * 7}s` }}><path d="M-8 0 q8 -7 16 0 q-8 7 -16 0 Z M8 0 l6 -5 l0 10 Z" fill="#fb923c" stroke={INK} strokeWidth="1.5" /></g></g>;
  }
}

export function Terrain({ art, W, H, pts, seed }) {
  const [c1, c2] = ART_BG[art] || ART_BG.ocean;
  const r = seeded(seed);
  // yol örnekleri (süsler yolun ve adaların üstüne gelmesin)
  const samples = [];
  for (let i = 1; i < pts.length; i++) for (let k = 0; k <= 10; k++) samples.push(bezPoint(pts[i - 1], pts[i], k / 10));
  const decor = [];
  const cell = art === 'space' ? 46 : 54;
  for (let y = 40; y < H + 20; y += cell) {
    for (let x = 0; x < W + 20; x += cell) {
      const jx = x + (r() - 0.5) * cell * 0.8, jy = y + (r() - 0.5) * cell * 0.8;
      if (r() > (art === 'forest' ? 0.85 : art === 'ocean' ? 0.18 : 0.42)) continue;
      if (pts.some(p => (p.x - jx) ** 2 + ((p.y - jy) * 1.4) ** 2 < 104 * 104)) continue;
      if (art !== 'ocean' && art !== 'space' && nearPath(jx, jy, samples, 40)) continue;
      decor.push({ x: jx, y: jy, key: `d${x}_${y}` });
    }
  }
  decor.sort((a, b) => a.y - b.y);
  const gid = `tg_${art}_${seed}`;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient>
        <pattern id={`${gid}_tuft`} width="46" height="40" patternUnits="userSpaceOnUse">
          <path d="M8 30 l3 -7 l3 7 M30 14 l3 -6 l3 6" stroke="#000" strokeOpacity="0.12" strokeWidth="2" fill="none" />
        </pattern>
        <pattern id={`${gid}_wave`} width="70" height="34" patternUnits="userSpaceOnUse">
          <path d="M6 20 q8 -7 16 0 M40 6 q8 -7 16 0" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </pattern>
        <pattern id={`${gid}_dune`} width="120" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 40 Q30 22 60 40 T120 40" stroke="#c9952f" strokeOpacity="0.35" strokeWidth="3" fill="none" />
        </pattern>
        <radialGradient id={`${gid}_neb`}><stop offset="0" stopColor="#a855f7" stopOpacity="0.45" /><stop offset="1" stopColor="#a855f7" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="-40" y="-40" width={W + 80} height={H + 80} fill={`url(#${gid})`} />
      {art === 'ocean' && (
        <g>
          {Array.from({ length: Math.ceil(H / 260) }).map((_, i) => <ellipse key={i} cx={(i * 137) % W} cy={i * 260 + 120} rx="140" ry="70" fill="#0277bd" opacity="0.25" />)}
          <g className="ca-wavesea"><rect x="-40" y="-40" width={W + 160} height={H + 80} fill={`url(#${gid}_wave)`} /></g>
        </g>
      )}
      {(art === 'forest' || art === 'dino') && <rect x="-40" y="-40" width={W + 80} height={H + 80} fill={`url(#${gid}_tuft)`} />}
      {art === 'desert' && <rect x="-40" y="-40" width={W + 80} height={H + 80} fill={`url(#${gid}_dune)`} />}
      {art === 'ice' && Array.from({ length: Math.ceil(H / 300) }).map((_, i) => <path key={i} d={blobPath(90, 40, i + seed, 0.2)} transform={`translate(${(i * 173) % W} ${i * 300 + 160})`} fill="#bfe3ff" stroke="#fff" strokeWidth="5" />)}
      {art === 'space' && (
        <g>
          {Array.from({ length: Math.ceil(H / 400) }).map((_, i) => <circle key={i} cx={(i * 211) % W} cy={i * 400 + 200} r="180" fill={`url(#${gid}_neb)`} />)}
          {Array.from({ length: Math.ceil(W * H / 2200) }).map((_, i) => <circle key={`s${i}`} cx={r() * W} cy={r() * H} r={r() * 1.6 + 0.4} fill="#fff" opacity={0.4 + r() * 0.6} />)}
        </g>
      )}
      {art === 'dino' && (
        <g transform="translate(0 0)">
          <path d={`M${W * 0.55} 130 L${W * 0.72} 20 L${W * 0.8} 20 L${W * 0.98} 130 Z`} fill="#6d4c41" stroke={INK} strokeWidth="3" />
          <path d={`M${W * 0.72} 20 L${W * 0.8} 20 L${W * 0.79} 50 Q${W * 0.76} 40 ${W * 0.73} 52 Z`} fill="#f97316" />
          <g className="ca-smoke"><circle cx={W * 0.76} cy="6" r="12" fill="#9ca3af" /></g>
          <g className="ca-smoke" style={{ animationDelay: '1.2s' }}><circle cx={W * 0.78} cy="0" r="9" fill="#9ca3af" /></g>
        </g>
      )}
      {art === 'desert' && (
        <g opacity="0.85">
          <path d={`M${W * 0.08} 120 L${W * 0.2} 40 L${W * 0.32} 120 Z`} fill="#e0aa4f" stroke={INK} strokeWidth="2.5" />
          <path d={`M${W * 0.2} 40 L${W * 0.32} 120 L${W * 0.24} 120 Z`} fill="#b98535" />
        </g>
      )}
      {decor.map(d => decorFor(art, r, d.x, d.y, d.key))}
    </g>
  );
}

// Adalar arasındaki yol (temaya göre: patika, nehir, buz, yörünge)
export function PathLayer({ art, pts, openUpTo }) {
  if (pts.length < 2) return null;
  const segs = [];
  for (let i = 1; i < pts.length; i++) segs.push({ i, d: bezPath([pts[i - 1], pts[i]]), open: i <= openUpTo });
  const styleFor = (open) => {
    switch (art) {
      case 'forest': return [[INK, 40, 1], ['#d9bb80', 33, 1], ['#e9d3a0', 12, 0.6, '2 14']];
      case 'desert': return [['#c9952f', 30, 0.35], ['#fff3c4', 6, 0.9, '4 16']];
      case 'ice': return [[INK, 38, 1], ['#9fd8ff', 31, 1], ['#ffffff', 8, 0.8, '30 20']];
      case 'candy': return [[INK, 46, 1], ['#7b4a2a', 39, 1], ['#a0663e', 14, 0.7, '20 18']];
      case 'dino': return [[INK, 46, 1], ['#f97316', 39, 1], ['#fde047', 10, 0.8, '18 22']];
      case 'space': return [['#c4b5fd', 4, open ? 0.9 : 0.35, '2 12']];
      case 'ocean': default: return open ? [['#e0f7ff', 5, 0.7, '1 14']] : [];
    }
  };
  return (
    <g>
      {segs.map(sg => styleFor(sg.open).map(([c, w, o, dash], k) => (
        <path key={`${sg.i}_${k}`} d={sg.d} stroke={c} strokeWidth={w} strokeOpacity={o} fill="none" strokeLinecap="round" strokeDasharray={dash}
          className={(art === 'dino' || art === 'candy') && k === 2 ? 'ca-lavaflow' : undefined} />
      )))}
      {/* zıplama taşları */}
      {(art === 'candy' || art === 'dino') && segs.map(sg => [0.2, 0.35, 0.5, 0.65, 0.8].map(t => {
        const p = bezPoint(pts[sg.i - 1], pts[sg.i], t);
        return art === 'candy'
          ? <g key={`${sg.i}_${t}`} transform={`translate(${p.x} ${p.y})`}><rect x="-11" y="-8" width="22" height="16" rx="7" fill="#fff" stroke={INK} strokeWidth="2.4" /><rect x="-11" y="-8" width="22" height="6" rx="3" fill="#fce7f3" /></g>
          : <g key={`${sg.i}_${t}`} transform={`translate(${p.x} ${p.y + 6})`}><Rock s={0.7} c="#57534e" /></g>;
      }))}
    </g>
  );
}

// Orman geçişindeki engel: kapalıyken yolun ortasında koca ağaç, açılınca kütük + yere devrilmiş gövde
export function TreeBarrier({ state, flip }) {
  // state: 'closed' | 'chopping' | 'falling' | 'open'
  if (state === 'open') {
    return (
      <g>
        <Stump s={1.1} />
        <g transform={`translate(${flip ? -46 : 46} 10)`}><Log s={0.9} rot={flip ? -8 : 8} /></g>
      </g>
    );
  }
  return (
    <g>
      {state === 'falling' && <Stump s={1.1} />}
      <g className={`${state === 'chopping' ? 'ca-treeshake' : ''} ca-treefall`} style={{ transform: state === 'falling' ? `rotate(${flip ? -88 : 88}deg)` : 'rotate(0deg)' }}>
        <Oak s={1.12} hue={1} />
      </g>
    </g>
  );
}

// Kilitli adayı örten sis bulutu
export function Mist() {
  return (
    <g className="ca-mist" opacity="0.9">
      {[[-40, -20, 30], [-10, -34, 34], [26, -24, 30], [44, -6, 22], [-46, 2, 22], [0, -2, 36]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity="0.82" />)}
    </g>
  );
}

// Haritanın sonundaki sandık (emoji yerine çizim)
export function GoalChest({ open }) {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="44" ry="9" fill="#000" opacity="0.2" />
      {open && Array.from({ length: 10 }).map((_, i) => <path key={i} d="M0 -30 L-6 -110 L6 -110 Z" fill="#fde047" opacity="0.35" transform={`rotate(${-60 + i * 13} 0 -30)`} />)}
      <rect x="-36" y="-34" width="72" height="34" rx="5" fill="#92400e" stroke={INK} strokeWidth="3" />
      {[-24, -4, 16].map(x => <rect key={x} x={x} y="-34" width="8" height="34" fill="#facc15" stroke={INK} strokeWidth="2" />)}
      <g transform={open ? 'rotate(-35 -36 -34)' : undefined}>
        <path d="M-36 -34 Q-36 -58 0 -58 Q36 -58 36 -34 Z" fill="#b45309" stroke={INK} strokeWidth="3" />
      </g>
      <rect x="-6" y="-28" width="12" height="12" rx="2" fill="#fde047" stroke={INK} strokeWidth="2" />
    </g>
  );
}

export function Cloud({ s = 1 }) {
  const b = [[-26, 0, 16], [-8, -10, 22], [14, -6, 18], [30, 2, 12]];
  return (
    <g transform={`scale(${s})`}>
      {b.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + 2.5} fill={INK} opacity="0.85" />)}
      <rect x="-30" y="0" width="64" height="14" rx="7" fill={INK} opacity="0.85" />
      {b.map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill="#fff" />)}
      <rect x="-28" y="0" width="60" height="12" rx="6" fill="#fff" />
      <path d="M-20 8 L24 8" stroke="#dbeafe" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

// Ev bahçesi / oda için çizim adıyla primitif (r.art). (0,0) = yere bastığı nokta
const Blossom = ({ s = 1, leaf, fruit, petals }) => {
  const b = [[0, -56, 26], [-20, -44, 20], [20, -44, 21], [-10, -70, 18], [12, -68, 17]];
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="26" ry="7" fill="#000" opacity="0.18" />
      <path d="M-6 0 L-4 -36 L4 -36 L6 0 Z" fill="#7a4a24" stroke={INK} strokeWidth="2.5" />
      {b.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + 2.6} fill={INK} />)}
      {b.map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={leaf} />)}
      {fruit && [[-14, -50], [10, -62], [18, -42], [-4, -40], [-18, -66], [4, -76]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={petals ? 3 : 4.5} fill={fruit} stroke={petals ? 'none' : INK} strokeWidth="1.2" />)}
    </g>
  );
};

export function ArtByName({ name, s = 1, c, flowers }) {
  const col = c || '#ef4444';
  const g = (children) => <g transform={`scale(${s})`}>{children}</g>;
  const shadow = (rx = 24) => <ellipse cx="0" cy="0" rx={rx} ry="5" fill="#000" opacity="0.18" />;
  switch (name) {
    case 'oak': return <Oak s={s} />;
    case 'oak2': return <Oak s={s} hue={3} />;
    case 'pine': return <Pine s={s} />;
    case 'palm': return <Palm s={s} />;
    case 'cherry': return <Blossom s={s} leaf="#fbcfe8" fruit="#f472b6" petals />;
    case 'apple': return <Blossom s={s} leaf="#4caf50" fruit="#ef4444" />;
    case 'orange': return <Blossom s={s} leaf="#3f9b3a" fruit="#f97316" />;
    case 'birch': return g(<g>{shadow(20)}<rect x="-5" y="-60" width="10" height="60" fill="#f5f5f4" stroke={INK} strokeWidth="2.5" />{[-50, -36, -20].map(y => <path key={y} d={`M-5 ${y} L1 ${y}`} stroke={INK} strokeWidth="2.5" />)}<ellipse cx="0" cy="-74" rx="26" ry="32" fill={INK} /><ellipse cx="0" cy="-74" rx="23" ry="29" fill="#a3e635" /><ellipse cx="-6" cy="-84" rx="9" ry="10" fill="#d9f99d" opacity="0.7" /></g>);
    case 'willow': return g(<g>{shadow(30)}<path d="M-5 0 L-3 -50 L3 -50 L5 0 Z" fill="#7a4a24" stroke={INK} strokeWidth="2.5" /><path d="M-36 -10 Q-40 -80 0 -84 Q40 -80 36 -10 Q30 -40 24 -12 Q16 -44 8 -14 Q0 -46 -8 -14 Q-16 -44 -24 -12 Q-30 -40 -36 -10 Z" fill="#65a30d" stroke={INK} strokeWidth="2.5" /></g>);
    case 'bush': return <Bush s={s} c={c || '#4caf50'} flowers={flowers} />;
    case 'hedge': return g(<g>{shadow(34)}<rect x="-34" y="-30" width="68" height="30" rx="8" fill={c || '#15803d'} stroke={INK} strokeWidth="2.5" />{[-22, -6, 10, 24].map(x => <circle key={x} cx={x} cy="-30" r="8" fill={c || '#15803d'} />)}<path d="M-30 -18 L30 -18" stroke="#000" strokeOpacity="0.15" strokeWidth="3" /></g>);
    case 'cone': return g(<g>{shadow(14)}<rect x="-8" y="-14" width="16" height="14" fill="#a16207" stroke={INK} strokeWidth="2" /><path d="M-16 -14 L0 -76 L16 -14 Z" fill={c || '#166534'} stroke={INK} strokeWidth="2.5" /></g>);
    case 'ball': return g(<g>{shadow(14)}<rect x="-10" y="-16" width="20" height="16" fill="#c2410c" stroke={INK} strokeWidth="2" /><rect x="-2" y="-30" width="4" height="14" fill="#7a4a24" /><circle cx="0" cy="-48" r="20" fill={c || '#22c55e'} stroke={INK} strokeWidth="2.5" /><circle cx="-7" cy="-55" r="6" fill="#fff" opacity="0.25" /></g>);
    case 'tulips': return g(<g>{[-18, -9, 0, 9, 18].map((x, i) => <g key={x}><path d={`M${x} 0 L${x} -${18 + (i % 2) * 6}`} stroke="#15803d" strokeWidth="2.5" /><path d={`M${x - 6} -${20 + (i % 2) * 6} Q${x} -${34 + (i % 2) * 6} ${x + 6} -${20 + (i % 2) * 6} L${x + 4} -${14 + (i % 2) * 6} L${x - 4} -${14 + (i % 2) * 6} Z`} fill={col} stroke={INK} strokeWidth="1.5" /></g>)}</g>);
    case 'roses': return <g><Bush s={s} c="#15803d" />{g([[-12, -14], [4, -20], [16, -8], [-20, -6]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="5" fill={col} stroke={INK} strokeWidth="1.2" /><path d={`M${x - 2} ${y} Q${x} ${y - 3} ${x + 2} ${y}`} stroke={shade0(col)} strokeWidth="1.2" fill="none" /></g>))}</g>;
    case 'sunflower': return g(<g>{[-12, 12].map((x, k) => <g key={x}><path d={`M${x} 0 L${x} -${44 + k * 8}`} stroke="#15803d" strokeWidth="3" /><path d={`M${x} -20 q-10 -4 -12 4`} stroke="#15803d" strokeWidth="3" fill="#22c55e" />{Array.from({ length: 10 }).map((_, i) => <ellipse key={i} cx={x} cy={-44 - k * 8 - 10} rx="3.5" ry="8" fill="#facc15" stroke={INK} strokeWidth="1" transform={`rotate(${i * 36} ${x} ${-44 - k * 8})`} />)}<circle cx={x} cy={-44 - k * 8} r="7" fill="#78350f" stroke={INK} strokeWidth="1.5" /></g>)}</g>);
    case 'daisy': return g(<g>{[-16, 0, 16, -8, 8].map((x, i) => { const y = -10 - (i % 3) * 6; return <g key={i}><path d={`M${x} 0 L${x} ${y}`} stroke="#15803d" strokeWidth="2" />{[0, 60, 120, 180, 240, 300].map(a => <ellipse key={a} cx={x} cy={y - 4} rx="2" ry="4" fill="#fff" stroke={INK} strokeWidth="0.8" transform={`rotate(${a} ${x} ${y})`} />)}<circle cx={x} cy={y} r="2.5" fill="#facc15" /></g>; })}</g>);
    case 'lavender': return g(<g>{[-14, -7, 0, 7, 14].map((x, i) => <g key={x}><path d={`M${x} 0 L${x * 1.3} -30`} stroke="#4d7c0f" strokeWidth="2" />{[0, 1, 2, 3].map(k => <ellipse key={k} cx={x * 1.3} cy={-30 - k * 5} rx="3" ry="3.5" fill={col} />)}</g>)}</g>);
    case 'pot': return g(<g>{shadow(14)}<path d="M-14 -22 L14 -22 L10 0 L-10 0 Z" fill="#c2410c" stroke={INK} strokeWidth="2.5" /><rect x="-16" y="-26" width="32" height="6" rx="2" fill="#ea580c" stroke={INK} strokeWidth="2" />{[[-8, -34], [0, -40], [8, -34], [-3, -30], [5, -28]].map(([x, y], i) => <g key={i}><path d={`M0 -24 L${x} ${y}`} stroke="#15803d" strokeWidth="2" /><circle cx={x} cy={y} r="4.5" fill={col} stroke={INK} strokeWidth="1" /></g>)}</g>);
    case 'fountain': return g(<g>{shadow(34)}<ellipse cx="0" cy="-6" rx="34" ry="10" fill="#94a3b8" stroke={INK} strokeWidth="2.5" /><ellipse cx="0" cy="-8" rx="28" ry="6" fill="#38bdf8" /><rect x="-5" y="-40" width="10" height="34" fill="#cbd5e1" stroke={INK} strokeWidth="2" /><ellipse cx="0" cy="-40" rx="16" ry="5" fill="#94a3b8" stroke={INK} strokeWidth="2" /><g className="ca-glowpulse"><path d="M0 -44 Q-14 -64 -20 -42 M0 -44 Q14 -64 20 -42 M0 -44 L0 -62" stroke="#7dd3fc" strokeWidth="3" fill="none" /></g></g>);
    case 'pond': return g(<g><ellipse cx="0" cy="-6" rx="40" ry="13" fill="#78716c" stroke={INK} strokeWidth="2.5" /><ellipse cx="0" cy="-7" rx="34" ry="9" fill="#38bdf8" /><ellipse cx="-10" cy="-9" rx="8" ry="2" fill="#fff" opacity="0.6" /><ellipse cx="14" cy="-6" rx="6" ry="3" fill="#22c55e" /><circle cx="14" cy="-8" r="2" fill="#f472b6" /></g>);
    case 'pool': return g(<g><ellipse cx="0" cy="-8" rx="38" ry="12" fill={col} stroke={INK} strokeWidth="2.5" /><ellipse cx="0" cy="-10" rx="30" ry="7" fill="#bae6fd" /><path d="M-38 -8 L-38 -2 Q0 8 38 -2 L38 -8" fill={col} stroke={INK} strokeWidth="2.5" /><circle cx="10" cy="-12" r="5" fill="#facc15" stroke={INK} strokeWidth="1" /></g>);
    case 'bench': return g(<g>{shadow(30)}<rect x="-30" y="-24" width="60" height="6" rx="2" fill={c || '#a16207'} stroke={INK} strokeWidth="2" /><rect x="-30" y="-38" width="60" height="6" rx="2" fill={c || '#a16207'} stroke={INK} strokeWidth="2" /><path d="M-24 -18 L-24 0 M24 -18 L24 0 M-26 -32 L-26 -24 M26 -32 L26 -24" stroke="#374151" strokeWidth="4" /></g>);
    case 'swing': return g(<g>{shadow(34)}<path d="M-34 0 L-24 -70 L24 -70 L34 0 M-28 0 L-22 -70 M28 0 L22 -70" stroke="#7a4a24" strokeWidth="5" fill="none" /><rect x="-26" y="-73" width="52" height="6" fill="#7a4a24" stroke={INK} strokeWidth="1.5" /><g className="ca-sway" style={{ transformOrigin: '0px -70px' }}><path d="M-8 -70 L-8 -22 M8 -70 L8 -22" stroke="#475569" strokeWidth="2" /><rect x="-12" y="-24" width="24" height="5" rx="2" fill={col} stroke={INK} strokeWidth="1.5" /></g></g>);
    case 'slide2': return g(<g>{shadow(34)}<path d="M-26 0 L-26 -60 M-14 0 L-14 -60" stroke="#475569" strokeWidth="4" />{[-12, -24, -36, -48].map(y => <path key={y} d={`M-26 ${y} L-14 ${y}`} stroke="#475569" strokeWidth="3" />)}<path d="M-14 -60 Q10 -50 22 -14 Q26 -4 36 -2 L36 4 Q20 4 14 -10 Q4 -42 -14 -52 Z" fill={col} stroke={INK} strokeWidth="2.5" /></g>);
    case 'sandbox': return g(<g><rect x="-34" y="-14" width="68" height="14" fill="#a16207" stroke={INK} strokeWidth="2.5" /><path d="M-30 -14 Q0 -26 30 -14 Z" fill="#fde68a" stroke={INK} strokeWidth="2" /><path d="M8 -18 L18 -30" stroke="#ef4444" strokeWidth="3" /><path d="M-14 -16 L-6 -16 L-8 -22 L-12 -22 Z" fill="#3b82f6" /></g>);
    case 'trampoline': return g(<g>{shadow(36)}<ellipse cx="0" cy="-22" rx="36" ry="9" fill={col} stroke={INK} strokeWidth="2.5" /><ellipse cx="0" cy="-22" rx="28" ry="6" fill="#111827" /><path d="M-30 -18 L-30 0 M30 -18 L30 0 M0 -14 L0 0" stroke="#475569" strokeWidth="3" /></g>);
    case 'lamppost': return g(<g>{shadow(12)}<rect x="-3" y="-80" width="6" height="80" fill="#1f2937" stroke={INK} strokeWidth="1.5" /><path d="M-10 -80 L10 -80 L6 -94 L-6 -94 Z" fill="#fde047" stroke={INK} strokeWidth="2" className="ca-glow" /><path d="M-12 -94 L12 -94 L0 -102 Z" fill="#1f2937" /></g>);
    case 'mailbox': return g(<g>{shadow(12)}<rect x="-3" y="-34" width="6" height="34" fill="#7a4a24" /><path d="M-14 -34 L-14 -50 Q-14 -58 0 -58 Q14 -58 14 -50 L14 -34 Z" fill={col} stroke={INK} strokeWidth="2.5" /><rect x="14" y="-56" width="3" height="12" fill="#facc15" /></g>);
    case 'birdhouse': return g(<g>{shadow(12)}<rect x="-3" y="-50" width="6" height="50" fill="#7a4a24" /><rect x="-14" y="-74" width="28" height="26" fill={col} stroke={INK} strokeWidth="2.5" /><path d="M-18 -72 L0 -88 L18 -72 Z" fill="#b91c1c" stroke={INK} strokeWidth="2.5" /><circle cx="0" cy="-62" r="5" fill="#1f2937" /></g>);
    case 'gnome': return g(<g>{shadow(14)}<path d="M-12 0 Q-14 -20 0 -22 Q14 -20 12 0 Z" fill="#3b82f6" stroke={INK} strokeWidth="2" /><circle cx="0" cy="-28" r="8" fill="#fcd9b6" stroke={INK} strokeWidth="1.5" /><path d="M-8 -26 Q0 -10 8 -26 Z" fill="#fff" /><path d="M-10 -32 L0 -58 L10 -32 Z" fill={col} stroke={INK} strokeWidth="2" /></g>);
    case 'scarecrow': return g(<g>{shadow(14)}<path d="M0 0 L0 -70 M-30 -50 L30 -50" stroke="#7a4a24" strokeWidth="5" /><path d="M-16 -54 L16 -54 L12 -24 L-12 -24 Z" fill="#3b82f6" stroke={INK} strokeWidth="2" /><circle cx="0" cy="-66" r="10" fill="#fde68a" stroke={INK} strokeWidth="2" /><path d="M-16 -72 L16 -72 L8 -84 L-8 -84 Z" fill="#a16207" stroke={INK} strokeWidth="2" /><path d="M-30 -50 l-6 6 M30 -50 l6 6" stroke="#facc15" strokeWidth="3" /></g>);
    case 'snowman': return g(<g><circle cx="0" cy="-16" r="16" fill="#fff" stroke={INK} strokeWidth="2.5" /><circle cx="0" cy="-42" r="11" fill="#fff" stroke={INK} strokeWidth="2.5" /><path d="M0 -42 L12 -40 L0 -38 Z" fill="#f97316" /><circle cx="-4" cy="-45" r="1.6" fill={INK} /><circle cx="4" cy="-45" r="1.6" fill={INK} /><path d="M-9 -52 L9 -52 L7 -62 L-7 -62 Z" fill="#1f2937" stroke={INK} strokeWidth="2" /></g>);
    case 'picnic': return g(<g>{shadow(34)}<rect x="-30" y="-30" width="60" height="7" rx="2" fill={c || '#a16207'} stroke={INK} strokeWidth="2" />{[-24, -12, 0, 12].map(x => <rect key={x} x={x} y="-30" width="10" height="7" fill="#ef4444" opacity="0.6" />)}<path d="M-22 -23 L-30 0 M22 -23 L30 0" stroke="#7a4a24" strokeWidth="4" /><rect x="-36" y="-12" width="72" height="5" rx="2" fill="#a16207" stroke={INK} strokeWidth="1.5" /></g>);
    case 'bbq': return g(<g>{shadow(18)}<path d="M-18 -30 Q0 -14 18 -30 Z" fill="#1f2937" stroke={INK} strokeWidth="2" /><path d="M-12 -24 L-18 0 M12 -24 L18 0 M0 -20 L0 0" stroke="#374151" strokeWidth="3" /><g className="ca-smoke"><circle cx="0" cy="-40" r="5" fill="#d1d5db" /></g><path d="M-14 -32 L14 -32" stroke="#ef4444" strokeWidth="3" /></g>);
    case 'umbrella': return g(<g>{shadow(30)}<path d="M0 0 L0 -60" stroke="#475569" strokeWidth="3" /><path d="M-34 -56 Q0 -90 34 -56 Q26 -62 17 -56 Q8 -62 0 -56 Q-8 -62 -17 -56 Q-26 -62 -34 -56 Z" fill={col} stroke={INK} strokeWidth="2.5" /><path d="M-17 -56 Q-8 -80 0 -82 M17 -56 Q8 -80 0 -82" stroke="#fff" strokeWidth="2" opacity="0.6" fill="none" /></g>);
    case 'doghouse': return g(<g>{shadow(30)}<rect x="-26" y="-36" width="52" height="36" fill={col} stroke={INK} strokeWidth="2.5" /><path d="M-32 -34 L0 -58 L32 -34 Z" fill="#7c2d12" stroke={INK} strokeWidth="2.5" /><path d="M-10 0 L-10 -18 Q0 -28 10 -18 L10 0 Z" fill="#1f2937" /></g>);
    case 'well': return g(<g>{shadow(24)}<rect x="-22" y="-26" width="44" height="26" fill="#a8a29e" stroke={INK} strokeWidth="2.5" /><path d="M-18 -26 L-18 -60 M18 -26 L18 -60" stroke="#7a4a24" strokeWidth="4" /><path d="M-26 -58 L0 -74 L26 -58 Z" fill="#b91c1c" stroke={INK} strokeWidth="2.5" /><path d="M0 -58 L0 -40" stroke="#475569" strokeWidth="2" /><rect x="-5" y="-40" width="10" height="9" fill="#78350f" /></g>);
    case 'pumpkin': return g(<g>{[[-14, 0, 12], [12, 0, 10], [0, -6, 14]].map(([x, y, r], i) => <g key={i}><ellipse cx={x} cy={y - r * 0.8} rx={r} ry={r * 0.8} fill={col} stroke={INK} strokeWidth="2" /><path d={`M${x} ${y - r * 1.6} l2 -6`} stroke="#4d7c0f" strokeWidth="3" /></g>)}</g>);
    case 'veggies': return g(<g><rect x="-36" y="-12" width="72" height="12" fill="#78350f" stroke={INK} strokeWidth="2" />{[-26, -12, 2, 16, 28].map((x, i) => <g key={x}>{i % 2 ? <path d={`M${x} -12 L${x - 4} -26 M${x} -12 L${x + 4} -26 M${x} -12 L${x} -28`} stroke="#22c55e" strokeWidth="3" /> : <g><circle cx={x} cy="-18" r="6" fill="#ef4444" stroke={INK} strokeWidth="1.5" /><path d={`M${x} -24 l0 -4`} stroke="#15803d" strokeWidth="2" /></g>}</g>)}</g>);
    case 'beehive': return g(<g>{shadow(14)}<rect x="-3" y="-24" width="6" height="24" fill="#7a4a24" />{[0, 1, 2, 3].map(i => <ellipse key={i} cx="0" cy={-28 - i * 9} rx={16 - i * 3} ry="6" fill={col} stroke={INK} strokeWidth="1.5" />)}<circle cx="0" cy="-30" r="3" fill="#1f2937" /></g>);
    case 'flag': return g(<g>{shadow(10)}<path d="M0 0 L0 -96" stroke="#9ca3af" strokeWidth="4" /><path d="M2 -94 L40 -84 L2 -72 Z" fill={col} stroke={INK} strokeWidth="2" className="ca-flag" /></g>);
    case 'statue': return g(<g>{shadow(22)}<rect x="-18" y="-16" width="36" height="16" fill="#d6d3d1" stroke={INK} strokeWidth="2" /><circle cx="0" cy="-48" r="9" fill="#e7e5e4" stroke={INK} strokeWidth="2" /><path d="M-10 -16 L-8 -38 L8 -38 L10 -16 Z M-8 -36 L-18 -50 M8 -36 L18 -50" fill="#e7e5e4" stroke={INK} strokeWidth="2" /></g>);
    case 'mushroom': return <Mushroom s={s * 1.6} />;
    case 'cactus': return <Cactus s={s} />;
    case 'flowers': return <Flowers s={s * 1.4} seed={3} />;
    case 'rock': return <Rock s={s} moss />;
    default: return null;
  }
}
const shade0 = (c) => c === '#fff' ? '#ddd' : '#00000055';
