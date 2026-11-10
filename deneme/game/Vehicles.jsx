import React, { useId } from 'react';
import { shade } from './Avatar';
import { PaintedLayer } from './Paint';

// ============================================================================
// --- GRUP: ARAÇ ÇİZİMLERİ (araba, kamyon, otobüs, uçak, helikopter, balon, tekne) ---
// ============================================================================
// Hepsi 240x130 tuvalde, yandan görünüş, öne (sağa) bakar. Zemin y=116.
// Araba modifiyeleri (jant, spoiler, çıkartma, neon, tavan, egzoz, cam filmi, far) sadece
// vtype === 'car' araçlarda çizilir.

const INK = '#2b2233';

// --- ARABA GÖVDE ŞABLONLARI ---
// body: gövde, glass: camlar, wheels: tekerlek x'leri, r: tekerlek yarıçapı, roof: [x1,x2,y]
// rear: spoiler noktası, panel: çıkartma alanı [x1,y1,x2,y2], lf/lb: ön/arka far
const CAR = {
  sedan: { body: 'M14 96 Q12 80 26 76 L66 72 L88 50 Q96 44 120 44 L150 44 Q164 44 174 54 L192 72 L216 76 Q230 80 228 96 L226 104 L16 104 Z', glass: 'M94 54 Q100 50 120 50 L138 50 L138 72 L80 72 Z M144 50 L150 50 Q160 50 168 58 L180 72 L144 72 Z', wheels: [58, 186], r: 17, roof: [98, 164, 44], rear: [20, 74], panel: [40, 78, 212, 100], lf: [222, 82], lb: [16, 82], doors: [80, 142] },
  hatch: { body: 'M18 98 Q16 76 34 72 L60 70 L84 44 Q92 38 132 38 Q156 38 168 52 L184 70 L206 74 Q220 78 220 96 L218 104 L20 104 Z', glass: 'M88 50 Q94 44 120 44 L122 44 L122 68 L74 68 Z M128 44 Q150 44 160 54 L172 68 L128 68 Z', wheels: [60, 180], r: 17, roof: [90, 158, 38], rear: [24, 70], panel: [40, 76, 202, 100], lf: [214, 84], lb: [20, 84], doors: [124] },
  suv: { body: 'M14 100 L14 64 Q14 54 26 52 L52 50 L66 26 Q70 20 82 20 L172 20 Q184 20 190 30 L202 50 L218 54 Q228 58 228 70 L228 100 Z', glass: 'M72 28 L110 28 L110 50 L60 50 Z M116 28 L150 28 L150 50 L116 50 Z M156 28 L176 28 Q184 28 188 36 L196 50 L156 50 Z', wheels: [56, 186], r: 20, roof: [72, 182, 20], rear: [16, 52], panel: [30, 58, 212, 94], lf: [222, 64], lb: [16, 66], doors: [113, 153], spare: true },
  sport: { body: 'M8 98 L10 84 Q14 74 40 70 L84 64 L110 46 Q122 40 150 42 Q172 44 190 58 L222 70 Q234 76 232 92 L230 100 Z', glass: 'M116 50 Q128 46 148 47 Q164 48 176 58 L184 64 L104 64 Z', wheels: [56, 190], r: 17, roof: [120, 168, 42], rear: [14, 72], panel: [40, 74, 214, 96], lf: [226, 80], lb: [12, 84], doors: [150] },
  pickup: { body: 'M10 100 L10 66 L92 66 L92 34 Q92 26 104 26 L148 26 Q160 26 166 36 L178 56 L214 60 Q228 64 228 80 L228 100 Z', glass: 'M100 34 L140 34 Q150 34 156 42 L166 56 L100 56 Z', wheels: [52, 188], r: 19, roof: [98, 160, 26], rear: [12, 66], panel: [100, 62, 222, 96], lf: [222, 72], lb: [12, 74], doors: [] },
  van: { body: 'M12 100 L12 40 Q12 22 32 22 L170 22 Q184 22 194 36 L214 62 Q228 66 228 80 L228 100 Z', glass: 'M24 32 L64 32 L64 56 L24 56 Z M72 32 L112 32 L112 56 L72 56 Z M120 32 L160 32 L160 56 L120 56 Z M168 32 Q182 32 188 42 L200 58 L168 58 Z', wheels: [54, 186], r: 18, roof: [26, 178, 22], rear: [14, 30], panel: [24, 62, 210, 96], lf: [222, 72], lb: [14, 70], doors: [116, 164] },
  bus: { body: 'M8 102 L8 30 Q8 16 24 16 L196 16 Q210 16 216 30 L222 60 Q230 62 230 76 L230 102 Z', glass: 'M18 26 L44 26 L44 52 L18 52 Z M50 26 L76 26 L76 52 L50 52 Z M82 26 L108 26 L108 52 L82 52 Z M114 26 L140 26 L140 52 L114 52 Z M146 26 L172 26 L172 52 L146 52 Z M180 26 L206 26 Q212 26 214 34 L218 58 L180 58 Z', wheels: [48, 192], r: 17, roof: [20, 200, 16], rear: [10, 20], panel: [14, 62, 176, 96], lf: [224, 84], lb: [10, 84], doors: [176] },
  limo: { body: 'M8 96 Q6 80 18 76 L50 72 L66 54 Q72 48 90 48 L170 48 Q182 48 190 56 L204 72 L222 76 Q234 80 232 96 L230 104 L10 104 Z', glass: 'M72 56 L98 56 L98 72 L62 72 Z M104 56 L130 56 L130 72 L104 72 Z M136 56 L162 56 L162 72 L136 72 Z M168 56 Q180 56 186 62 L194 72 L168 72 Z', wheels: [44, 196], r: 16, roof: [70, 186, 48], rear: [14, 74], panel: [30, 78, 220, 100], lf: [226, 84], lb: [12, 84], doors: [100, 166] },
  classic: { body: 'M20 98 Q16 70 50 66 Q70 30 120 28 Q170 30 190 66 Q224 70 220 98 Z', glass: 'M78 44 Q96 36 118 36 L118 64 L66 64 Z M124 36 Q150 38 166 64 L124 64 Z', wheels: [64, 178], r: 18, roof: [84, 160, 30], rear: [24, 70], panel: [50, 70, 200, 94], lf: [214, 78], lb: [22, 80], doors: [121] },
  caravan: { body: 'M10 100 L10 30 Q10 16 26 16 L176 16 Q190 16 198 30 L216 60 Q228 64 228 80 L228 100 Z', glass: 'M24 28 L56 28 L56 50 L24 50 Z M70 28 L102 28 L102 50 L70 50 Z M170 28 Q184 28 190 38 L202 56 L170 56 Z', wheels: [50, 190], r: 18, roof: [26, 180, 16], rear: [12, 24], panel: [20, 60, 160, 96], lf: [222, 72], lb: [12, 70], doors: [] },
  truck: { body: 'M8 102 L8 18 L146 18 L146 40 L186 40 Q196 40 202 48 L218 64 Q230 68 230 82 L230 102 Z', glass: 'M154 46 L184 46 Q192 46 196 52 L206 64 L154 64 Z', wheels: [44, 92, 196], r: 16, roof: [10, 144, 18], rear: [10, 18], panel: [14, 26, 140, 92], lf: [224, 76], lb: [10, 80], doors: [] },
  firetruck: { body: 'M8 102 L8 46 L160 46 L160 30 Q160 22 170 22 L192 22 Q202 22 208 32 L222 56 Q230 60 230 74 L230 102 Z', glass: 'M168 30 L190 30 Q198 30 202 38 L212 56 L168 56 Z', wheels: [44, 92, 198], r: 16, roof: [12, 156, 46], rear: [10, 46], panel: [14, 54, 156, 94], lf: [224, 68], lb: [10, 64], doors: [] },
};

export const VEHICLE_KINDS = {
  car: ['sedan', 'hatch', 'suv', 'sport', 'pickup', 'van', 'bus', 'limo', 'classic', 'caravan', 'truck', 'firetruck', 'tractor', 'motorbike', 'kart'],
  air: ['plane', 'jet', 'helicopter', 'balloon', 'blimp', 'seaplane'],
  sea: ['sailboat', 'speedboat', 'yacht', 'rowboat', 'submarine'],
};

// --- TEKERLEK + JANT ---
function Wheel({ x, y, r, rim = {} }) {
  const rc = rim.color || '#d1d5db';
  const style = rim.style || 'classic';
  const spokes = style === 'star' ? 6 : style === 'sport' ? 5 : style === 'mesh' ? 10 : 0;
  return (
    <g className="ca-wheelspin" style={{ transformOrigin: `${x}px ${y}px` }}>
      <circle cx={x} cy={y} r={r} fill="#1f2937" stroke={INK} strokeWidth="2.5" />
      <circle cx={x} cy={y} r={r * 0.82} fill="none" stroke="#374151" strokeWidth="2" />
      <circle cx={x} cy={y} r={r * 0.58} fill={rc} stroke={shade(rc, -60)} strokeWidth="1.5" />
      {style === 'gold' && <circle cx={x} cy={y} r={r * 0.46} fill="none" stroke="#fde68a" strokeWidth="2" />}
      {Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return <path key={i} d={`M${x} ${y} L${x + Math.cos(a) * r * 0.55} ${y + Math.sin(a) * r * 0.55}`} stroke={shade(rc, -50)} strokeWidth={style === 'mesh' ? 1.2 : 2.6} />;
      })}
      {style === 'classic' && <circle cx={x} cy={y} r={r * 0.4} fill="none" stroke={shade(rc, -40)} strokeWidth="1.5" />}
      {style === 'neon' && <circle cx={x} cy={y} r={r * 0.62} fill="none" stroke={rc} strokeWidth="3" opacity="0.8" className="ca-glowpulse" />}
      <circle cx={x} cy={y} r={r * 0.16} fill={shade(rc, -50)} />
      <path d={`M${x - r * 0.4} ${y - r * 0.2} Q${x - r * 0.2} ${y - r * 0.45} ${x + r * 0.05} ${y - r * 0.5}`} stroke="#fff" strokeWidth="1.6" opacity="0.6" fill="none" />
    </g>
  );
}

// --- ÇIKARTMALAR ---
function Sticker({ kind, c, p }) {
  const [x1, y1, x2, y2] = p;
  const w = x2 - x1, h = y2 - y1, cy = (y1 + y2) / 2;
  switch (kind) {
    case 'stripes': return <g><rect x={x1} y={cy - 5} width={w} height="4" fill={c} /><rect x={x1} y={cy + 2} width={w} height="4" fill={c} /></g>;
    case 'flames': return <path d={`M${x2 - 4} ${cy} Q${x2 - w * 0.25} ${y1 - 2} ${x2 - w * 0.35} ${cy - 2} Q${x2 - w * 0.45} ${y1 + 2} ${x2 - w * 0.55} ${cy} Q${x2 - w * 0.65} ${y1 + 4} ${x2 - w * 0.7} ${cy + 2} Q${x2 - w * 0.6} ${y2} ${x2 - 4} ${cy + 6} Z`} fill={c} stroke="#facc15" strokeWidth="2" />;
    case 'stars': return <g>{[0.2, 0.45, 0.7].map((k, i) => { const x = x1 + w * k, y = cy + (i % 2 ? -3 : 3); return <path key={i} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y - 2} L${x + 3} ${y + 2} L${x + 5} ${y + 7} L${x} ${y + 4} L${x - 5} ${y + 7} L${x - 3} ${y + 2} L${x - 7} ${y - 2} L${x - 2} ${y - 2} Z`} fill={c} />; })}</g>;
    case 'lightning': return <path d={`M${x1 + w * 0.2} ${cy - 3} L${x1 + w * 0.5} ${cy - 6} L${x1 + w * 0.46} ${cy} L${x1 + w * 0.8} ${cy - 4} L${x1 + w * 0.5} ${cy + 7} L${x1 + w * 0.54} ${cy + 1} Z`} fill={c} stroke={INK} strokeWidth="1" />;
    case 'number': return <g><circle cx={x1 + w * 0.5} cy={cy} r={Math.min(h * 0.5, 13)} fill="#fff" stroke={INK} strokeWidth="1.5" /><text x={x1 + w * 0.5} y={cy + 6} fontSize="16" fontWeight="900" textAnchor="middle" fill={c} fontFamily="Arial">{7}</text></g>;
    case 'hearts': return <g>{[0.25, 0.5, 0.75].map((k, i) => { const x = x1 + w * k; return <path key={i} d={`M${x} ${cy + 6} C${x - 10} ${cy} ${x - 7} ${cy - 8} ${x - 3} ${cy - 7} C${x - 1} ${cy - 6} ${x} ${cy - 4} ${x} ${cy - 3} C${x} ${cy - 4} ${x + 1} ${cy - 6} ${x + 3} ${cy - 7} C${x + 7} ${cy - 8} ${x + 10} ${cy} ${x} ${cy + 6} Z`} fill={c} />; })}</g>;
    case 'checker': return <g>{Array.from({ length: Math.floor(w / 8) }).map((_, i) => <g key={i}><rect x={x1 + i * 8} y={cy - 6} width="4" height="4" fill={i % 2 ? c : '#fff'} /><rect x={x1 + i * 8 + 4} y={cy - 6} width="4" height="4" fill={i % 2 ? '#fff' : c} /><rect x={x1 + i * 8} y={cy - 2} width="4" height="4" fill={i % 2 ? '#fff' : c} /><rect x={x1 + i * 8 + 4} y={cy - 2} width="4" height="4" fill={i % 2 ? c : '#fff'} /></g>)}</g>;
    case 'paw': return <g>{[0.3, 0.65].map((k, i) => { const x = x1 + w * k; return <g key={i} fill={c}><ellipse cx={x} cy={cy + 3} rx="5" ry="4" /><circle cx={x - 5} cy={cy - 3} r="2" /><circle cx={x} cy={cy - 5} r="2" /><circle cx={x + 5} cy={cy - 3} r="2" /></g>; })}</g>;
    default: return null;
  }
}

function CarBody({ kind, color, mods = {}, uid }) {
  const sp = CAR[kind] || CAR.sedan;
  const c = color;
  const gy = 116;
  const wy = gy - sp.r;
  const get = (k) => mods[k]?.render || null;
  const rim = get('rims') || {};
  const spoiler = get('spoiler');
  const sticker = get('sticker');
  const neon = get('neon');
  const roof = get('roof');
  const exhaust = get('exhaust');
  const tint = get('tint');
  const lights = get('lights');
  const glassFill = tint ? tint.color : `url(#${uid}_glass)`;
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}_body`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={shade(c, 45)} /><stop offset="0.45" stopColor={c} /><stop offset="1" stopColor={shade(c, -45)} /></linearGradient>
        <linearGradient id={`${uid}_glass`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e0f2fe" /><stop offset="0.5" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0369a1" /></linearGradient>
      </defs>
      {neon && <ellipse cx="120" cy={gy - 2} rx="104" ry="9" fill={neon.color} opacity="0.55" className="ca-glowpulse" style={{ filter: 'blur(3px)' }} />}
      <ellipse cx="120" cy={gy + 2} rx="108" ry="6" fill="#000" opacity="0.22" />
      {/* tavan */}
      {roof && sp.roof && (
        <g>
          {roof.kind === 'rack' && <g><rect x={sp.roof[0] + 4} y={sp.roof[2] - 8} width={sp.roof[1] - sp.roof[0] - 8} height="4" rx="2" fill="#475569" stroke={INK} strokeWidth="1.5" /><rect x={sp.roof[0] + 14} y={sp.roof[2] - 22} width={(sp.roof[1] - sp.roof[0]) * 0.55} height="14" rx="3" fill={roof.color || '#a16207'} stroke={INK} strokeWidth="2" /></g>}
          {roof.kind === 'surf' && <g><rect x={sp.roof[0] + 4} y={sp.roof[2] - 6} width={sp.roof[1] - sp.roof[0] - 8} height="3" fill="#475569" /><path d={`M${sp.roof[0] - 6} ${sp.roof[2] - 10} Q${(sp.roof[0] + sp.roof[1]) / 2} ${sp.roof[2] - 20} ${sp.roof[1] + 10} ${sp.roof[2] - 10} Q${(sp.roof[0] + sp.roof[1]) / 2} ${sp.roof[2] - 4} ${sp.roof[0] - 6} ${sp.roof[2] - 10} Z`} fill={roof.color || '#38bdf8'} stroke={INK} strokeWidth="2" /><path d={`M${sp.roof[0] + 10} ${sp.roof[2] - 11} L${sp.roof[1] - 4} ${sp.roof[2] - 11}`} stroke="#fff" strokeWidth="2" /></g>}
          {roof.kind === 'box' && <path d={`M${sp.roof[0] + 6} ${sp.roof[2] - 2} Q${sp.roof[0] + 10} ${sp.roof[2] - 22} ${(sp.roof[0] + sp.roof[1]) / 2} ${sp.roof[2] - 22} Q${sp.roof[1] - 6} ${sp.roof[2] - 22} ${sp.roof[1] - 4} ${sp.roof[2] - 2} Z`} fill={roof.color || '#111827'} stroke={INK} strokeWidth="2" />}
          {roof.kind === 'lightbar' && <g><rect x={(sp.roof[0] + sp.roof[1]) / 2 - 24} y={sp.roof[2] - 9} width="48" height="8" rx="3" fill="#1f2937" />{[0, 1, 2, 3, 4].map(i => <circle key={i} cx={(sp.roof[0] + sp.roof[1]) / 2 - 18 + i * 9} cy={sp.roof[2] - 5} r="3" fill={roof.color || '#fde047'} className="ca-blink" style={{ animationDelay: `${i * 0.1}s` }} />)}</g>}
        </g>
      )}
      {sp.spare && <g><circle cx="10" cy="74" r="14" fill="#1f2937" stroke={INK} strokeWidth="2.5" /><circle cx="10" cy="74" r="7" fill="#9ca3af" /></g>}
      {exhaust && <g><rect x={sp.lb[0] - 12} y={gy - 18} width="14" height="5" rx="2" fill="#9ca3af" stroke={INK} strokeWidth="1.5" /><rect x={sp.lb[0] - 12} y={gy - 12} width="14" height="5" rx="2" fill="#9ca3af" stroke={INK} strokeWidth="1.5" />{exhaust.kind === 'flame' && <path d={`M${sp.lb[0] - 12} ${gy - 15} Q${sp.lb[0] - 26} ${gy - 18} ${sp.lb[0] - 34} ${gy - 12} Q${sp.lb[0] - 24} ${gy - 10} ${sp.lb[0] - 12} ${gy - 10} Z`} fill="#f97316" className="ca-flame" />}</g>}
      {/* gövde */}
      <path d={sp.body} fill={`url(#${uid}_body)`} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d={sp.glass} fill={glassFill} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {!tint && <path d={sp.glass} fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />}
      {/* cam yansıması */}
      {sp.roof && <path d={`M${sp.roof[0] + 10} ${sp.roof[2] + 12} L${sp.roof[0] + 22} ${sp.roof[2] + 6}`} stroke="#fff" strokeWidth="4" opacity="0.55" strokeLinecap="round" />}
      {/* gövde çizgisi + kapılar + kulp */}
      <path d={`M${sp.panel[0] - 10} ${sp.panel[1] + 2} L${sp.panel[2] + 4} ${sp.panel[1] + 2}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
      {(sp.doors || []).map(x => <g key={x}><path d={`M${x} ${sp.panel[1] - 4} L${x} ${sp.panel[3]}`} stroke={shade(c, -60)} strokeWidth="1.5" opacity="0.7" /><rect x={x + 6} y={sp.panel[1] + 6} width="10" height="3" rx="1.5" fill={shade(c, -55)} /></g>)}
      {sticker && <Sticker kind={sticker.kind} c={sticker.color || '#fff'} p={sp.panel} />}
      {/* farlar, tamponlar */}
      <ellipse cx={sp.lf[0]} cy={sp.lf[1]} rx="5" ry="4" fill={lights?.color || '#fef9c3'} stroke={INK} strokeWidth="1.5" />
      {lights && <path d={`M${sp.lf[0] + 4} ${sp.lf[1]} L${sp.lf[0] + 40} ${sp.lf[1] - 12} L${sp.lf[0] + 40} ${sp.lf[1] + 12} Z`} fill={lights.color} opacity="0.3" />}
      <rect x={sp.lb[0] - 2} y={sp.lb[1] - 4} width="6" height="8" rx="2" fill="#ef4444" stroke={INK} strokeWidth="1.5" />
      <rect x={sp.lf[0] - 8} y="98" width="16" height="6" rx="3" fill="#9ca3af" stroke={INK} strokeWidth="1.5" />
      <rect x={sp.lb[0] - 6} y="98" width="16" height="6" rx="3" fill="#9ca3af" stroke={INK} strokeWidth="1.5" />
      {/* spoiler */}
      {spoiler && <g><path d={`M${sp.rear[0] + 10} ${sp.rear[1]} L${sp.rear[0] + 12} ${sp.rear[1] - 12}`} stroke={INK} strokeWidth="4" /><path d={`M${sp.rear[0] - 4} ${sp.rear[1] - 18} L${sp.rear[0] + 34} ${sp.rear[1] - 16} L${sp.rear[0] + 32} ${sp.rear[1] - 10} L${sp.rear[0] - 6} ${sp.rear[1] - 12} Z`} fill={spoiler.color || '#111827'} stroke={INK} strokeWidth="2" /></g>}
      {/* çamurluk gölgesi + tekerlekler */}
      {sp.wheels.map(x => <path key={`a${x}`} d={`M${x - sp.r - 5} ${wy + 4} A${sp.r + 5} ${sp.r + 5} 0 0 1 ${x + sp.r + 5} ${wy + 4} Z`} fill="#111827" />)}
      {sp.wheels.map(x => <Wheel key={x} x={x} y={wy} r={sp.r} rim={rim} />)}
      {/* yöneticinin resimli modifiyeleri: 240x130 araç tuvaline çizilmiş şeffaf PNG */}
      {Object.values(mods).filter(m => m?.image).map(m => <image key={m.id} href={m.image} x="0" y="0" width="240" height="130" preserveAspectRatio="none" />)}
    </g>
  );
}

// Özel araçlar (gövde şablonu dışında)
function Tractor({ c }) {
  return (
    <g>
      <ellipse cx="120" cy="118" rx="100" ry="6" fill="#000" opacity="0.22" />
      <path d="M60 92 L60 58 L120 58 L120 28 L172 28 L178 60 L214 64 L218 92 Z" fill={c} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M128 36 L166 36 L170 58 L128 58 Z" fill="#bae6fd" stroke={INK} strokeWidth="2.5" />
      <rect x="196" y="40" width="8" height="24" fill="#475569" stroke={INK} strokeWidth="2" /><g className="ca-smoke"><circle cx="200" cy="34" r="6" fill="#d1d5db" /></g>
      <rect x="178" y="70" width="40" height="6" fill={shade(c, -30)} />
      <Wheel x={92} y={88} r={30} rim={{ color: '#facc15', style: 'star' }} />
      <Wheel x={198} y={100} r={16} rim={{ color: '#facc15', style: 'star' }} />
    </g>
  );
}
function Motorbike({ c }) {
  return (
    <g>
      <ellipse cx="120" cy="118" rx="80" ry="5" fill="#000" opacity="0.2" />
      <Wheel x={66} y={98} r={18} rim={{ style: 'sport' }} />
      <Wheel x={176} y={98} r={18} rim={{ style: 'sport' }} />
      <path d="M66 98 L110 70 L150 70 L176 98" stroke="#475569" strokeWidth="6" fill="none" />
      <path d="M96 66 Q100 50 128 50 L150 52 Q160 56 156 70 L100 76 Z" fill={c} stroke={INK} strokeWidth="3" />
      <path d="M74 70 L104 62 L108 70 L80 76 Z" fill="#1f2937" stroke={INK} strokeWidth="2" />
      <path d="M156 54 L172 40 L182 42" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="184" cy="56" rx="6" ry="5" fill="#fef9c3" stroke={INK} strokeWidth="1.5" />
      <rect x="54" y="84" width="24" height="5" rx="2" fill="#9ca3af" />
    </g>
  );
}
function Kart({ c }) {
  return (
    <g>
      <ellipse cx="120" cy="118" rx="90" ry="5" fill="#000" opacity="0.2" />
      <path d="M40 98 L44 84 L120 80 L196 84 L206 96 L200 102 L44 104 Z" fill={c} stroke={INK} strokeWidth="3" />
      <path d="M90 82 Q96 58 120 58 L128 82 Z" fill={shade(c, -30)} stroke={INK} strokeWidth="2.5" />
      <path d="M150 78 L170 62" stroke={INK} strokeWidth="4" /><circle cx="172" cy="60" r="7" fill="none" stroke={INK} strokeWidth="3" />
      <rect x="20" y="70" width="30" height="6" rx="2" fill={shade(c, -40)} stroke={INK} strokeWidth="1.5" />
      <Wheel x={62} y={102} r={14} rim={{ style: 'sport', color: '#facc15' }} />
      <Wheel x={186} y={102} r={14} rim={{ style: 'sport', color: '#facc15' }} />
    </g>
  );
}

// --- UÇAN ARAÇLAR ---
function AirCraft({ kind, c, c2 }) {
  switch (kind) {
    case 'helicopter':
      return (
        <g>
          <path d="M20 54 L118 50 L118 58 L24 62 Z" fill={shade(c, -15)} stroke={INK} strokeWidth="2.5" />
          <path d="M10 40 L24 40 L28 62 L16 62 Z" fill={c} stroke={INK} strokeWidth="2.5" />
          <g className="ca-rotor-small" style={{ transformOrigin: '18px 48px' }}><path d="M18 30 L18 66" stroke="#374151" strokeWidth="4" strokeLinecap="round" /></g>
          <path d="M108 40 Q112 22 150 22 Q196 22 204 52 Q206 78 172 80 L120 80 Q104 76 108 40 Z" fill={c} stroke={INK} strokeWidth="3" />
          <path d="M160 28 Q192 28 198 52 L162 52 Z" fill="#bae6fd" stroke={INK} strokeWidth="2.5" />
          <path d="M120 40 L150 40 L150 56 L120 56 Z" fill="#bae6fd" stroke={INK} strokeWidth="2" />
          <rect x="142" y="12" width="8" height="12" fill="#475569" stroke={INK} strokeWidth="1.5" />
          <g className="ca-rotor" style={{ transformOrigin: '146px 10px' }}><rect x="52" y="7" width="188" height="6" rx="3" fill="#374151" /></g>
          <path d="M120 80 L116 96 M180 80 L184 96 M104 96 L200 96" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case 'balloon':
      return (
        <g>
          <path d="M120 4 C70 4 62 54 92 80 L104 92 L136 92 L148 80 C178 54 170 4 120 4 Z" fill={c} stroke={INK} strokeWidth="3" />
          {[-24, 0, 24].map(dx => <path key={dx} d={`M${120 + dx * 0.2} 4 C${120 + dx * 1.6} 30 ${120 + dx * 1.4} 64 ${120 + dx * 0.55} 92`} stroke={c2 || '#fde047'} strokeWidth="9" fill="none" />)}
          <path d="M120 4 C70 4 62 54 92 80 L104 92 L136 92 L148 80 C178 54 170 4 120 4 Z" fill="none" stroke={INK} strokeWidth="3" />
          <path d="M106 92 L110 108 M134 92 L130 108" stroke={INK} strokeWidth="2" />
          <rect x="106" y="106" width="28" height="18" rx="3" fill="#a16207" stroke={INK} strokeWidth="2.5" />
          <path d="M108 112 L132 112" stroke="#78350f" strokeWidth="2" />
          <ellipse cx="96" cy="26" rx="8" ry="14" fill="#fff" opacity="0.35" />
        </g>
      );
    case 'blimp':
      return (
        <g>
          <ellipse cx="124" cy="48" rx="100" ry="34" fill={c} stroke={INK} strokeWidth="3" />
          <path d="M30 40 L8 18 L18 48 L8 78 L30 56 Z" fill={c2 || '#ef4444'} stroke={INK} strokeWidth="2.5" />
          <path d="M70 26 Q124 16 190 30" stroke="#fff" strokeWidth="5" opacity="0.4" fill="none" />
          <rect x="104" y="80" width="40" height="16" rx="6" fill="#e5e7eb" stroke={INK} strokeWidth="2.5" />
          {[112, 124, 136].map(x => <circle key={x} cx={x} cy="88" r="3" fill="#38bdf8" />)}
          <text x="124" y="56" fontSize="18" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily="Arial">★</text>
        </g>
      );
    case 'jet':
      return (
        <g>
          <path d="M10 60 L20 26 L40 26 L52 54 Z" fill={c2 || shade(c, -20)} stroke={INK} strokeWidth="2.5" />
          <path d="M14 58 Q14 48 40 48 L190 46 Q224 48 232 58 Q224 68 190 70 L40 70 Q14 68 14 58 Z" fill={c} stroke={INK} strokeWidth="3" />
          <path d="M196 50 Q218 52 224 58 L196 58 Z" fill="#1e3a8a" stroke={INK} strokeWidth="2" />
          {[70, 84, 98, 112, 126, 140, 154, 168].map(x => <circle key={x} cx={x} cy="56" r="3" fill="#bae6fd" stroke={INK} strokeWidth="1" />)}
          <path d="M100 62 L150 62 L118 100 L96 100 Z" fill={shade(c, -25)} stroke={INK} strokeWidth="2.5" />
          <rect x="112" y="78" width="24" height="10" rx="5" fill="#9ca3af" stroke={INK} strokeWidth="2" />
          <path d="M16 62 L190 62" stroke={c2 || '#ef4444'} strokeWidth="3" />
        </g>
      );
    case 'seaplane':
    case 'plane':
    default:
      return (
        <g>
          <path d="M14 56 L24 24 L44 24 L54 52 Z" fill={c2 || shade(c, -20)} stroke={INK} strokeWidth="2.5" />
          <path d="M16 56 Q18 44 50 44 L170 40 Q200 40 208 56 Q200 72 170 72 L50 70 Q18 68 16 56 Z" fill={c} stroke={INK} strokeWidth="3" />
          <path d="M150 44 Q176 42 190 54 L150 56 Z" fill="#bae6fd" stroke={INK} strokeWidth="2.5" />
          {[80, 98, 116, 134].map(x => <rect key={x} x={x} y="49" width="10" height="8" rx="2" fill="#bae6fd" stroke={INK} strokeWidth="1.5" />)}
          <rect x="84" y="30" width="80" height="10" rx="5" fill={shade(c, -15)} stroke={INK} strokeWidth="2.5" />
          <rect x="206" y="50" width="8" height="12" rx="2" fill="#475569" stroke={INK} strokeWidth="1.5" />
          <g className="ca-prop" style={{ transformOrigin: '216px 56px' }}><ellipse cx="216" cy="56" rx="3" ry="22" fill="#374151" opacity="0.8" /></g>
          <path d="M16 60 L208 60" stroke={c2 || '#ef4444'} strokeWidth="3" />
          {kind === 'seaplane'
            ? <g><path d="M80 72 L84 92 M150 72 L146 92" stroke={INK} strokeWidth="3" /><path d="M54 92 L182 92 Q196 92 190 100 L60 100 Q48 98 54 92 Z" fill="#e5e7eb" stroke={INK} strokeWidth="2.5" /></g>
            : <g><path d="M120 70 L116 88" stroke={INK} strokeWidth="3" /><circle cx="116" cy="92" r="6" fill="#1f2937" stroke={INK} strokeWidth="2" /><circle cx="40" cy="74" r="4" fill="#1f2937" /></g>}
        </g>
      );
  }
}

// --- TEKNELER ---
function Boat({ kind, c, c2 }) {
  const water = <g><path d="M0 100 Q30 94 60 100 T120 100 T180 100 T240 100 L240 130 L0 130 Z" fill="#38bdf8" opacity="0.85" /><path d="M10 104 Q30 100 50 104 M150 106 Q170 102 190 106" stroke="#fff" strokeWidth="2.5" fill="none" className="ca-wave" /></g>;
  switch (kind) {
    case 'sailboat':
      return <g><path d="M118 8 L118 86" stroke={INK} strokeWidth="4" /><path d="M122 12 Q190 50 190 82 L122 82 Z" fill="#f8fafc" stroke={INK} strokeWidth="2.5" /><path d="M114 20 Q70 60 66 82 L114 82 Z" fill={c2 || '#fde047'} stroke={INK} strokeWidth="2.5" /><path d="M118 8 L138 14 L118 20 Z" fill="#ef4444" /><path d="M40 86 L206 86 Q196 106 170 108 L72 108 Q50 106 40 86 Z" fill={c} stroke={INK} strokeWidth="3" /><path d="M48 92 L198 92" stroke="#fff" strokeWidth="3" opacity="0.7" />{water}</g>;
    case 'speedboat':
      return <g><path d="M20 84 L210 70 Q232 72 228 84 L200 104 L40 104 Z" fill={c} stroke={INK} strokeWidth="3" /><path d="M24 90 L212 80" stroke={c2 || '#fff'} strokeWidth="5" /><path d="M120 72 L146 54 L158 56 L140 74 Z" fill="#bae6fd" stroke={INK} strokeWidth="2.5" /><rect x="70" y="62" width="34" height="12" rx="5" fill="#f8fafc" stroke={INK} strokeWidth="2" /><rect x="14" y="74" width="10" height="26" rx="2" fill="#374151" stroke={INK} strokeWidth="1.5" /><path d="M0 104 Q20 96 30 104" stroke="#fff" strokeWidth="4" fill="none" />{water}</g>;
    case 'yacht':
      return <g><path d="M16 80 L222 74 Q236 76 230 86 L206 106 L36 106 Z" fill="#f8fafc" stroke={INK} strokeWidth="3" /><path d="M20 90 L226 84" stroke={c} strokeWidth="6" /><path d="M60 74 L60 52 L170 52 L196 74 Z" fill="#f8fafc" stroke={INK} strokeWidth="2.5" /><path d="M86 52 L86 36 L150 36 L166 52 Z" fill="#f8fafc" stroke={INK} strokeWidth="2.5" />{[70, 90, 110, 130, 150].map(x => <rect key={x} x={x} y="58" width="14" height="9" rx="2" fill="#0ea5e9" stroke={INK} strokeWidth="1.2" />)}<path d="M96 42 L146 42" stroke="#0ea5e9" strokeWidth="6" /><path d="M120 36 L120 16" stroke={INK} strokeWidth="3" /><path d="M120 16 L136 20 L120 24 Z" fill={c2 || '#ef4444'} />{water}</g>;
    case 'rowboat':
      return <g><path d="M50 86 L196 86 Q190 108 160 110 L80 110 Q56 108 50 86 Z" fill={c} stroke={INK} strokeWidth="3" />{[90, 120, 150].map(x => <path key={x} d={`M${x} 88 L${x} 108`} stroke={shade(c, -35)} strokeWidth="2" />)}<path d="M100 84 L60 110 M150 84 L190 110" stroke="#a16207" strokeWidth="4" strokeLinecap="round" /><ellipse cx="58" cy="112" rx="8" ry="3" fill="#a16207" /><ellipse cx="192" cy="112" rx="8" ry="3" fill="#a16207" />{water}</g>;
    case 'submarine':
    default:
      return <g><ellipse cx="120" cy="86" rx="96" ry="26" fill={c} stroke={INK} strokeWidth="3" /><rect x="100" y="48" width="44" height="22" rx="8" fill={c} stroke={INK} strokeWidth="3" /><path d="M126 48 L126 26 L144 26" stroke={INK} strokeWidth="4" fill="none" />{[80, 120, 160].map(x => <g key={x}><circle cx={x} cy="86" r="9" fill="#bae6fd" stroke={INK} strokeWidth="2.5" /><circle cx={x - 3} cy="83" r="3" fill="#fff" /></g>)}<path d="M24 86 L6 70 L6 102 Z" fill={c2 || shade(c, -25)} stroke={INK} strokeWidth="2.5" />{water}</g>;
  }
}

/**
 * Bir aracı çizer (240x130 içinde).
 * item: araç eşyası (render.kind, render.vtype, render.color, render.color2) ya da resimli
 * paint: araba boyası rengi (sadece arabalar)
 * mods: { rims, spoiler, sticker, neon, roof, exhaust, tint, lights } -> eşya nesneleri
 */
export function VehicleArt({ item, paint, mods, onClick, strokes }) {
  const uid = `v${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  if (!item) return null;
  const r = item.render || {};
  const vtype = r.vtype || 'car';
  const kind = r.kind || 'sedan';
  const c = (vtype === 'car' && paint) || r.color || '#38bdf8';
  let art;
  if (item.image) art = <image href={item.image} x="0" y="0" width="240" height="124" preserveAspectRatio="xMidYMax meet" />;
  else if (vtype === 'air') art = <AirCraft kind={kind} c={c} c2={r.color2} />;
  else if (vtype === 'sea') art = <Boat kind={kind} c={c} c2={r.color2} />;
  else if (kind === 'tractor') art = <Tractor c={c} />;
  else if (kind === 'motorbike') art = <Motorbike c={c} />;
  else if (kind === 'kart') art = <Kart c={c} />;
  else {
    // eski hazır arabaların türleri
    const map = { old: 'classic', city: 'hatch', jeep: 'suv' };
    const k = map[kind] || kind;
    art = (
      <g>
        <CarBody kind={k} color={c} mods={mods || {}} uid={uid} />
        {r.extra === 'taxi' && <g><rect x="110" y="32" width="34" height="12" rx="3" fill="#facc15" stroke={INK} strokeWidth="2" /><text x="127" y="42" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="Arial">TAKSİ</text><g>{Array.from({ length: 12 }).map((_, i) => <rect key={i} x={40 + i * 14} y="86" width="7" height="5" fill={i % 2 ? '#111827' : '#fff'} />)}</g></g>}
        {r.extra === 'police' && <g><rect x="112" y="34" width="30" height="9" rx="3" fill="#1f2937" /><circle cx="120" cy="38" r="4" fill="#ef4444" className="ca-blink" /><circle cx="134" cy="38" r="4" fill="#3b82f6" className="ca-blink" style={{ animationDelay: '.6s' }} /><rect x="40" y="82" width="170" height="8" fill="#fff" /><text x="125" y="98" fontSize="9" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily="Arial">POLİS</text></g>}
        {r.extra === 'ambulance' && <g><rect x="60" y="14" width="30" height="9" rx="3" fill="#1f2937" /><circle cx="68" cy="18" r="4" fill="#ef4444" className="ca-blink" /><circle cx="82" cy="18" r="4" fill="#3b82f6" className="ca-blink" style={{ animationDelay: '.6s' }} /><path d="M86 66 L98 66 L98 74 L106 74 L106 86 L98 86 L98 94 L86 94 L86 86 L78 86 L78 74 L86 74 Z" fill="#ef4444" /></g>}
        {r.extra === 'ladder' && <g><rect x="18" y="34" width="130" height="8" fill="#e5e7eb" stroke={INK} strokeWidth="2" />{Array.from({ length: 12 }).map((_, i) => <rect key={i} x={22 + i * 10} y="34" width="3" height="8" fill="#9ca3af" />)}<rect x="160" y="14" width="24" height="8" rx="3" fill="#1f2937" /><circle cx="172" cy="18" r="4" fill="#ef4444" className="ca-blink" /></g>}
        {r.extra === 'icecream' && <g><rect x="16" y="56" width="124" height="10" fill="#f9a8d4" /><path d="M60 18 L70 -6 L80 18 Z" fill="#fbbf24" stroke={INK} strokeWidth="2" /><circle cx="70" cy="-8" r="9" fill="#f472b6" stroke={INK} strokeWidth="2" /></g>}
        {r.extra === 'school' && <g><rect x="14" y="56" width="200" height="6" fill="#111827" /><text x="94" y="80" fontSize="10" fontWeight="900" textAnchor="middle" fill="#111827" fontFamily="Arial">OKUL TAŞITI</text></g>}
        {r.extra === 'camper' && <g><rect x="12" y="60" width="160" height="8" fill={r.color2 || '#f97316'} /><rect x="120" y="30" width="26" height="62" rx="3" fill="#e5e7eb" stroke={INK} strokeWidth="2" /><circle cx="140" cy="62" r="2" fill={INK} /></g>}
      </g>
    );
  }
  return <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>{strokes?.length ? <PaintedLayer strokes={strokes}>{art}</PaintedLayer> : art}</g>;
}

// Uçan aracın havada süzülmesi için sarmalayıcı
export function FlyingVehicle({ item, x, y, w = 140 }) {
  return (
    <svg x={x} y={y} width={w} height={w * 130 / 240} viewBox="0 0 240 130" overflow="visible">
      <g className="ca-hover"><VehicleArt item={item} /></g>
    </svg>
  );
}
