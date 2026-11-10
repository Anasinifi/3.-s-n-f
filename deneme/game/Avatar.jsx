import React, { useId } from 'react';
import { AVATAR_BOXES, SKIN_TONES } from './catalog';

// ============================================================================
// --- GRUP: KARAKTER ÇİZİMİ (KATMANLI SVG AVATAR) ---
// ============================================================================
// Çizim alanı 200x260. Katman sırası:
//  pelerin/arka saç -> gövde -> alt -> ayakkabı -> üst -> baş/yüz -> ön saç -> aksesuar -> şapka
// Yöneticinin yüklediği resimli eşyalar AVATAR_BOXES içindeki kutuya oturtulur
// (adjust: { x, y, s } ile ince ayar yapılabilir).

const shade = (hex, amt) => {
  try {
    let c = String(hex || '#999999').replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  } catch (_) { return hex; }
};
export { shade };

// Yöneticinin yüklediği resim katmanı
//  fit: 'template' -> resim karakter şablonunun TAMAMINA (200x260) çizilmiştir, aynen üst üste oturur
//                     (şablonu "Dünya Kurucu"dan indirip üstüne çizin: her kıyafet her karaktere uyar)
//  fit: 'box'      -> resim o parçanın kutusuna sığdırılır (eski yöntem)
//  adjust: { x, y, s } ince ayar
//  fitByBase: { [karakterId]: { x, y, s } } -> bu parça o karakterde giyilince özel ince ayar
const ImageLayer = ({ item, slot, baseId }) => {
  const a = (baseId && item.fitByBase?.[baseId]) || item.adjust || {};
  const s = Number(a.s) || 1;
  const box = item.fit === 'template' ? AVATAR_BOXES.base : (AVATAR_BOXES[slot] || AVATAR_BOXES.base);
  const w = box.w * s, h = box.h * s;
  const x = box.x + (box.w - w) / 2 + (Number(a.x) || 0);
  const y = box.y + (box.h - h) / 2 + (Number(a.y) || 0);
  return <image href={item.image} x={x} y={y} width={w} height={h} preserveAspectRatio={item.fit === 'template' ? 'none' : 'xMidYMid meet'} />;
};

// --- SAÇ ---
const HairBack = ({ kind, c }) => {
  switch (kind) {
    case 'long': return <path d="M54 62 Q52 16 100 14 Q148 16 146 62 L150 150 Q132 160 122 138 L122 84 L78 84 L78 138 Q68 160 50 150 Z" fill={c} />;
    case 'ponytail': return <g><path d="M140 52 Q178 60 168 120 Q164 150 150 160 Q156 120 140 92 Z" fill={c} /><circle cx="142" cy="54" r="7" fill="#f43f5e" /></g>;
    case 'braids': return <g fill={c}>{[0, 1, 2, 3, 4].map(i => <g key={i}><ellipse cx="56" cy={98 + i * 14} rx="9" ry="8" /><ellipse cx="144" cy={98 + i * 14} rx="9" ry="8" /></g>)}<circle cx="56" cy="168" r="5" fill="#f43f5e" /><circle cx="144" cy="168" r="5" fill="#f43f5e" /></g>;
    case 'afro': return <circle cx="100" cy="56" r="60" fill={c} />;
    case 'curly': return <g fill={c}>{[[60, 50], [70, 30], [88, 20], [112, 20], [130, 30], [140, 50], [146, 72], [54, 72]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="16" />)}</g>;
    case 'bob': return <path d="M54 62 Q52 16 100 14 Q148 16 146 62 L148 104 Q140 112 128 104 L128 70 L72 70 L72 104 Q60 112 52 104 Z" fill={c} />;
    case 'pigtails': return <g fill={c}><path d="M50 60 Q24 70 30 118 Q38 98 52 92 Z" /><path d="M150 60 Q176 70 170 118 Q162 98 148 92 Z" /><circle cx="48" cy="62" r="6" fill="#f43f5e" /><circle cx="152" cy="62" r="6" fill="#f43f5e" /></g>;
    case 'wavy': return <path d="M54 62 Q50 16 100 14 Q150 16 146 62 Q156 90 146 110 Q156 130 140 150 Q132 130 124 120 L124 80 L76 80 L76 120 Q68 130 60 150 Q44 130 54 110 Q44 90 54 62 Z" fill={c} />;
    case 'longCurly': return <g fill={c}>{[[52, 70], [48, 96], [52, 122], [58, 146], [148, 70], [152, 96], [148, 122], [142, 146], [70, 34], [100, 22], [130, 34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="17" />)}</g>;
    case 'puffs': return <g fill={c}><circle cx="58" cy="28" r="22" /><circle cx="142" cy="28" r="22" /></g>;
    default: return null;
  }
};

const HairFront = ({ kind, c }) => {
  const d = shade(c, -30);
  switch (kind) {
    case 'messy': return <g><path d="M58 64 Q58 20 100 20 Q142 20 142 64 L136 50 L130 62 L122 46 L114 60 L106 44 L98 60 L90 46 L82 62 L74 48 L66 64 Z" fill={c} /><path d="M78 26 L70 14 M104 20 L108 6 M126 28 L138 18" stroke={c} strokeWidth="5" strokeLinecap="round" /></g>;
    case 'short': return <path d="M57 64 Q56 18 100 18 Q144 18 143 64 Q136 40 100 38 Q70 40 57 64 Z" fill={c} />;
    case 'long': return <path d="M57 66 Q56 18 100 18 Q144 18 143 66 Q128 36 104 40 Q96 52 72 50 Q62 56 57 66 Z" fill={c} />;
    case 'spiky': return <path d="M58 62 L52 30 L72 40 L74 10 L92 32 L102 4 L112 32 L128 10 L130 40 L150 30 L142 62 Q130 42 100 40 Q72 42 58 62 Z" fill={c} />;
    case 'ponytail': return <path d="M57 64 Q56 18 100 18 Q144 18 143 64 Q132 38 100 36 Q70 38 57 64 Z" fill={c} />;
    case 'curly': return <g fill={c}>{[[72, 36], [90, 30], [110, 30], [128, 36]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="13" />)}</g>;
    case 'bun': return <g><circle cx="100" cy="14" r="18" fill={c} /><path d="M57 64 Q56 20 100 20 Q144 20 143 64 Q134 40 100 38 Q68 40 57 64 Z" fill={c} /><path d="M86 12 Q100 4 114 12" stroke={d} strokeWidth="3" fill="none" /></g>;
    case 'braids': return <path d="M57 64 Q56 18 100 18 Q144 18 143 64 Q130 34 100 34 L100 22 L100 34 Q70 34 57 64 Z" fill={c} />;
    case 'afro': return <path d="M60 58 Q66 34 100 32 Q134 34 140 58 Q120 44 100 44 Q80 44 60 58 Z" fill={d} opacity="0.35" />;
    case 'mohawk': return <g><path d="M90 40 L86 6 L96 18 L100 0 L104 18 L114 6 L110 40 Z" fill={c} /><path d="M62 60 Q60 40 72 32 M138 60 Q140 40 128 32" stroke={shade(c, 40)} strokeWidth="4" fill="none" opacity="0.6" /></g>;
    case 'bob': return <path d="M56 70 Q54 18 100 18 Q146 18 144 70 Q140 48 128 44 L128 52 Q100 40 72 52 L72 44 Q60 48 56 70 Z" fill={c} />;
    case 'pigtails': return <path d="M57 64 Q56 18 100 18 Q144 18 143 64 Q132 36 100 36 Q68 36 57 64 Z" fill={c} />;
    case 'sidepart': return <g><path d="M57 66 Q54 18 100 18 Q146 18 143 62 Q140 44 120 40 Q84 34 70 50 Q62 56 57 66 Z" fill={c} /><path d="M118 22 Q112 30 120 40" stroke={d} strokeWidth="3" fill="none" /></g>;
    case 'buzz': return <path d="M58 58 Q58 22 100 22 Q142 22 142 58 Q136 40 100 38 Q64 40 58 58 Z" fill={c} opacity="0.85" />;
    case 'wavy': return <path d="M57 66 Q56 18 100 18 Q144 18 143 66 Q136 46 124 44 Q116 54 104 44 Q92 54 80 44 Q68 50 57 66 Z" fill={c} />;
    case 'topknot': return <g><circle cx="100" cy="6" r="14" fill={c} /><rect x="92" y="16" width="16" height="6" rx="3" fill="#f43f5e" /><path d="M57 62 Q56 20 100 20 Q144 20 143 62 Q132 36 100 34 Q68 36 57 62 Z" fill={c} /></g>;
    case 'bangs': return <path d="M56 68 Q54 18 100 18 Q146 18 144 68 L136 56 L136 50 L64 50 L64 56 Z" fill={c} />;
    case 'longCurly': return <g fill={c}>{[[70, 34], [88, 28], [106, 28], [124, 32], [138, 46], [62, 46]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="13" />)}</g>;
    case 'puffs': return <path d="M58 60 Q58 24 100 24 Q142 24 142 60 Q132 40 100 38 Q68 40 58 60 Z" fill={c} />;
    case 'quiff': return <g><path d="M60 60 Q60 26 92 22 Q112 2 140 18 Q124 18 128 30 Q142 40 140 60 Q130 40 100 38 Q70 40 60 60 Z" fill={c} /></g>;
    case 'twinBuns': return <g><circle cx="66" cy="22" r="15" fill={c} /><circle cx="134" cy="22" r="15" fill={c} /><path d="M57 64 Q56 20 100 20 Q144 20 143 64 Q132 38 100 38 Q68 38 57 64 Z" fill={c} /></g>;
    case 'shag': return <path d="M54 72 Q50 16 100 16 Q150 16 146 72 L140 58 L136 70 L128 52 L118 60 L110 46 L100 56 L90 46 L82 60 L72 52 L64 70 L60 58 Z" fill={c} />;
    default: return null;
  }
};

// Gerçekçi fiyonk / toka (katlı kurdele, düğüm, parlama)
export const Bow = ({ c, x = 0, y = 0, s = 1, rot = -12 }) => {
  const dk = shade(c, -40), lt = shade(c, 60);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M-2 2 L-8 14 L-4.5 12.5 L-2.5 15 L0 3 Z" fill={dk} />
      <path d="M2 2 L7 14 L3.5 12.5 L2 15 L0 3 Z" fill={dk} />
      <path d="M0 0 C-5 -11 -17 -11 -17 0 C-17 11 -5 11 0 0 Z" fill={c} />
      <path d="M0 0 C5 -11 17 -11 17 0 C17 11 5 11 0 0 Z" fill={c} />
      <path d="M-3 -2 Q-9 -6 -13 -1 M-3 2 Q-9 6 -13 2 M3 -2 Q9 -6 13 -1 M3 2 Q9 6 13 2" stroke={dk} strokeWidth="1.3" fill="none" opacity="0.7" />
      <rect x="-3.5" y="-4.5" width="7" height="9" rx="2.5" fill={shade(c, -20)} stroke={dk} strokeWidth="0.8" />
      <path d="M-14 -4 Q-11 -7 -7 -6.5" stroke={lt} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
    </g>
  );
};

// Toka (saç klipsi): metal çerçeveli, taşlı
const Barrette = ({ c, x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-20)`}>
    <rect x="-12" y="-4" width="24" height="8" rx="4" fill={c} stroke={shade(c, -45)} strokeWidth="1" />
    <rect x="-10" y="-2.5" width="20" height="2" rx="1" fill="#fff" opacity="0.55" />
    {[-6, 0, 6].map(dx => <circle key={dx} cx={dx} cy="1" r="1.8" fill="#fff" stroke={shade(c, -30)} strokeWidth="0.6" />)}
  </g>
);

// Saç parlaması ve tutam çizgileri
const HairShine = ({ kind, c }) => {
  if (['none', 'buzz', 'mohawk'].includes(kind)) return null;
  return (
    <g pointerEvents="none">
      <path d="M72 34 Q94 21 122 29" stroke="#fff" strokeOpacity="0.32" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M86 24 Q82 34 76 44 M104 22 Q104 32 100 40 M118 26 Q120 36 124 44" stroke={shade(c, -45)} strokeOpacity="0.35" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  );
};

// --- BAŞ VE YÜZ (karakter tipine göre) ---
// Hayvan karakterlerin sabit renkleri (ten rengi seçilse de bu renkte olur)
export const ANIMAL_SKIN = { robot: '#cbd5e1', panda: '#f8fafc', frog: '#86efac', koala: '#cbd5e1', tiger: '#fb923c', lion: '#fbbf24', fox: '#fb923c', unicorn: '#fdf4ff', penguin: '#334155', dino: '#4ade80' };
const HUMAN_EARS = ['kid'];

const Head = ({ kind, skin }) => {
  const sk = ANIMAL_SKIN[kind] || skin;
  const dk = shade(sk, -28);
  const lt = shade(sk, 30);
  return (
    <g>
      {/* kulaklar / arkada kalanlar */}
      {kind === 'bear' && <g><circle cx="64" cy="30" r="16" fill={sk} /><circle cx="136" cy="30" r="16" fill={sk} /><circle cx="64" cy="30" r="8" fill={dk} /><circle cx="136" cy="30" r="8" fill={dk} /></g>}
      {(kind === 'cat' || kind === 'fox') && <g><path d="M60 46 L58 6 L92 30 Z" fill={sk} /><path d="M140 46 L142 6 L108 30 Z" fill={sk} /><path d="M64 38 L63 16 L82 30 Z" fill={kind === 'fox' ? '#fff' : '#fda4af'} /><path d="M136 38 L137 16 L118 30 Z" fill={kind === 'fox' ? '#fff' : '#fda4af'} /></g>}
      {kind === 'bunny' && <g><ellipse cx="80" cy="0" rx="12" ry="34" fill={sk} /><ellipse cx="120" cy="0" rx="12" ry="34" fill={sk} /><ellipse cx="80" cy="2" rx="5" ry="24" fill="#fda4af" /><ellipse cx="120" cy="2" rx="5" ry="24" fill="#fda4af" /></g>}
      {kind === 'robot' && <g><line x1="100" y1="22" x2="100" y2="2" stroke="#64748b" strokeWidth="4" /><circle cx="100" cy="2" r="6" fill="#f43f5e" className="ca-blink" /></g>}
      {kind === 'dog' && <g><ellipse cx="56" cy="62" rx="13" ry="28" fill={dk} transform="rotate(18 56 62)" /><ellipse cx="144" cy="62" rx="13" ry="28" fill={dk} transform="rotate(-18 144 62)" /></g>}
      {kind === 'panda' && <g><circle cx="64" cy="30" r="16" fill="#1f2937" /><circle cx="136" cy="30" r="16" fill="#1f2937" /></g>}
      {kind === 'koala' && <g><circle cx="56" cy="40" r="24" fill={sk} /><circle cx="144" cy="40" r="24" fill={sk} /><circle cx="56" cy="40" r="13" fill="#f9a8d4" /><circle cx="144" cy="40" r="13" fill="#f9a8d4" /></g>}
      {kind === 'mouse' && <g><circle cx="60" cy="28" r="22" fill={sk} /><circle cx="140" cy="28" r="22" fill={sk} /><circle cx="60" cy="28" r="12" fill="#fda4af" /><circle cx="140" cy="28" r="12" fill="#fda4af" /></g>}
      {kind === 'monkey' && <g><circle cx="54" cy="66" r="16" fill={dk} /><circle cx="146" cy="66" r="16" fill={dk} /><circle cx="54" cy="66" r="8" fill="#fcd9b6" /><circle cx="146" cy="66" r="8" fill="#fcd9b6" /></g>}
      {kind === 'lion' && <g>{Array.from({ length: 14 }).map((_, i) => { const a = i / 14 * Math.PI * 2; return <circle key={i} cx={100 + Math.cos(a) * 46} cy={66 + Math.sin(a) * 46} r="16" fill="#b45309" />; })}</g>}
      {kind === 'tiger' && <g><circle cx="66" cy="32" r="12" fill={sk} /><circle cx="134" cy="32" r="12" fill={sk} /><circle cx="66" cy="32" r="6" fill="#1f2937" /><circle cx="134" cy="32" r="6" fill="#1f2937" /></g>}
      {kind === 'frog' && <g><circle cx="76" cy="32" r="17" fill={sk} /><circle cx="124" cy="32" r="17" fill={sk} /></g>}
      {kind === 'unicorn' && <g><path d="M94 26 L100 -16 L106 26 Z" fill="#facc15" /><path d="M96 14 L104 10 M95 4 L104 0" stroke="#f59e0b" strokeWidth="2" /><path d="M62 40 Q60 10 92 14 Q76 24 72 44 Z" fill="#c084fc" /><path d="M66 50 Q50 40 54 22 Q62 34 72 38 Z" fill="#f472b6" /></g>}
      {kind === 'dino' && <g>{[70, 86, 100, 114, 130].map((x, i) => <path key={i} d={`M${x - 8} ${30 - Math.sin(i / 4 * Math.PI) * 8 + 4} L${x} ${16 - Math.sin(i / 4 * Math.PI) * 8} L${x + 8} ${30 - Math.sin(i / 4 * Math.PI) * 8 + 4} Z`} fill="#f97316" />)}</g>}
      {HUMAN_EARS.includes(kind) && <g><circle cx="58" cy="68" r="9" fill={sk} /><circle cx="142" cy="68" r="9" fill={sk} /></g>}
      {kind === 'robot'
        ? <g><rect x="56" y="24" width="88" height="84" rx="22" fill={sk} stroke="#94a3b8" strokeWidth="3" /><circle cx="54" cy="66" r="7" fill="#94a3b8" /><circle cx="146" cy="66" r="7" fill="#94a3b8" /></g>
        : kind === 'frog' ? <ellipse cx="100" cy="72" rx="48" ry="38" fill={sk} />
          : <circle cx="100" cy="66" r="43" fill={sk} />}
      {/* yüz lekeleri */}
      {kind === 'panda' && <g><ellipse cx="83" cy="68" rx="12" ry="15" fill="#1f2937" transform="rotate(20 83 68)" /><ellipse cx="117" cy="68" rx="12" ry="15" fill="#1f2937" transform="rotate(-20 117 68)" /></g>}
      {(kind === 'fox' || kind === 'monkey' || kind === 'dog') && <path d="M66 74 Q100 120 134 74 Q118 98 100 100 Q82 98 66 74 Z" fill={kind === 'monkey' ? '#fcd9b6' : '#fff7ed'} />}
      {kind === 'monkey' && <ellipse cx="100" cy="66" rx="30" ry="22" fill="#fcd9b6" />}
      {kind === 'tiger' && <path d="M58 54 L72 58 M56 70 L70 70 M142 54 L128 58 M144 70 L130 70 M92 26 L94 38 M100 24 L100 38 M108 26 L106 38" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />}
      {kind === 'penguin' && <ellipse cx="100" cy="74" rx="32" ry="30" fill="#f8fafc" />}
      {/* gözler */}
      {kind === 'frog'
        ? <g><circle cx="76" cy="32" r="9" fill="#fff" /><circle cx="124" cy="32" r="9" fill="#fff" /><circle cx="77" cy="33" r="5" fill="#1f2937" /><circle cx="125" cy="33" r="5" fill="#1f2937" /></g>
        : <g>
          {/* sevimli parlak gözler */}
          {[84, 116].map((ex, i) => (
            <g key={ex}>
              <ellipse cx={ex} cy="68" rx="7.6" ry="9.2" fill={kind === 'panda' ? '#fff' : '#1b1410'} />
              {kind !== 'panda' && <ellipse cx={ex} cy="71" rx="5.4" ry="5.8" fill="#5b3a26" />}
              {kind !== 'panda' && <ellipse cx={ex} cy="70.5" rx="3" ry="3.4" fill="#1b1410" />}
              {kind === 'panda' && <circle cx={ex + (i ? -1 : 1)} cy="69" r="4.4" fill="#1b1410" />}
              <circle cx={ex - 2.6} cy="64.6" r="2.9" fill="#fff" />
              <circle cx={ex + 2.8} cy="72.6" r="1.3" fill="#fff" opacity="0.9" />
              <path d={`M${ex - 7} ${62} Q${ex - 9} ${59} ${ex - 10} ${57.5}`} stroke="#1b1410" strokeWidth="1.6" strokeLinecap="round" opacity={i ? 0 : 0.0} />
            </g>
          ))}
          {/* kaşlar */}
          {!['robot', 'frog'].includes(kind) && <g stroke={kind === 'kid' ? shade(skin, -90) : shade(ANIMAL_SKIN[kind] || skin, -70)} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.55"><path d="M77 55 Q84 51 91 54" /><path d="M109 54 Q116 51 123 55" /></g>}
        </g>}
      <ellipse cx="72" cy="83" rx="9" ry="5.2" fill="#fb7185" opacity="0.42" />
      <ellipse cx="128" cy="83" rx="9" ry="5.2" fill="#fb7185" opacity="0.42" />
      <circle cx="69" cy="81" r="1.3" fill="#fff" opacity="0.7" /><circle cx="125" cy="81" r="1.3" fill="#fff" opacity="0.7" />
      {kind === 'kid' && <ellipse cx="100" cy="79" rx="2.6" ry="1.8" fill={shade(skin, -35)} opacity="0.7" />}
      {['cat', 'bunny', 'bear', 'panda', 'koala', 'mouse', 'tiger', 'lion', 'fox', 'dog', 'monkey'].includes(kind) && <ellipse cx="100" cy="80" rx={kind === 'koala' ? 9 : 5.5} ry={kind === 'koala' ? 7 : 4} fill={['bear', 'panda', 'koala', 'dog', 'fox', 'lion', 'tiger'].includes(kind) ? '#3f2a1d' : '#f472b6'} />}
      {kind === 'penguin' && <path d="M92 78 L108 78 L100 88 Z" fill="#f59e0b" />}
      {(kind === 'cat' || kind === 'mouse' || kind === 'tiger') && <path d="M70 82 L52 78 M70 86 L52 88 M130 82 L148 78 M130 86 L148 88" stroke="#475569" strokeWidth="1.5" />}
      {kind === 'frog'
        ? <path d="M72 82 Q100 104 128 82" stroke="#166534" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        : <g><path d="M90 87 Q100 99 110 87 Q100 92 90 87 Z" fill="#9f1239" stroke="#7c2d12" strokeWidth="1.6" strokeLinejoin="round" /><path d="M95 92.5 Q100 96 105 92.5 Q100 90.5 95 92.5 Z" fill="#fb7185" /></g>}
      {kind === 'dog' && <path d="M97 95 Q100 106 104 95 Z" fill="#f43f5e" />}
    </g>
  );
};

// --- ÜST GİYİM ---
const TORSO = "M62 132 Q62 112 82 112 L118 112 Q138 112 138 132 L138 190 L62 190 Z";

const TopBack = ({ r }) => {
  if (r.kind === 'hero') return <path d="M70 112 L130 112 L156 232 Q100 248 44 232 Z" fill={r.color2 || '#ef4444'} />;
  if (r.kind === 'hoodie') return <path d="M74 106 Q100 122 126 106 L124 120 L76 120 Z" fill={shade(r.color, -25)} />;
  return null;
};

const Sleeves = ({ color, long }) => (
  <g fill={color}>
    <rect x="44" y="116" width="22" height={long ? 60 : 30} rx="10" transform="rotate(8 55 118)" />
    <rect x="134" y="116" width="22" height={long ? 60 : 30} rx="10" transform="rotate(-8 145 118)" />
  </g>
);

const TopBase = ({ r }) => {
  const c = r.color || '#9ca3af';
  switch (r.kind) {
    case 'ragged':
      return (
        <g>
          <Sleeves color={c} />
          <path d="M62 132 Q62 112 82 112 L118 112 Q138 112 138 132 L138 186 L130 194 L122 184 L114 194 L106 185 L98 195 L90 184 L82 194 L74 185 L66 193 L62 186 Z" fill={c} />
          <rect x="72" y="130" width="18" height="16" fill="#7b6a50" stroke="#5c4f3b" strokeDasharray="3 2" strokeWidth="1.5" transform="rotate(-6 81 138)" />
          <rect x="108" y="154" width="16" height="14" fill="#b5a383" stroke="#5c4f3b" strokeDasharray="3 2" strokeWidth="1.5" transform="rotate(8 116 161)" />
          <circle cx="118" cy="128" r="4" fill="#5c4f3b" opacity="0.6" />
          <path d="M88 112 Q100 122 112 112" stroke="#5c4f3b" strokeWidth="2" fill="none" />
        </g>
      );
    case 'tshirt':
      return <g><Sleeves color={c} /><path d={TORSO} fill={c} /><path d="M86 112 Q100 124 114 112" stroke={shade(c, -40)} strokeWidth="3" fill="none" /></g>;
    case 'stripe':
      return (
        <g>
          <Sleeves color={c} />
          <path d={TORSO} fill={r.color2 || '#fff'} />
          {[0, 1, 2, 3, 4].map(i => <rect key={i} x="62" y={118 + i * 15} width="76" height="7" fill={c} />)}
          <path d="M86 112 Q100 124 114 112" stroke={shade(c, -40)} strokeWidth="3" fill="none" />
        </g>
      );
    case 'hoodie':
      return (
        <g>
          <Sleeves color={c} long />
          <path d={TORSO} fill={c} />
          <path d="M76 162 L124 162 L120 184 L80 184 Z" fill={shade(c, -20)} />
          <path d="M92 116 L90 138 M108 116 L110 138" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'sweater':
      return (
        <g>
          <Sleeves color={c} long />
          <path d={TORSO} fill={c} />
          <path d="M100 168 C82 154 84 138 94 140 C98 141 100 145 100 147 C100 145 102 141 106 140 C116 138 118 154 100 168 Z" fill="#fff" />
          <rect x="62" y="182" width="76" height="8" fill={shade(c, -25)} />
        </g>
      );
    case 'dress':
      return (
        <g>
          <Sleeves color={c} />
          <path d="M66 130 Q66 112 84 112 L116 112 Q134 112 134 130 L134 168 L156 230 Q100 244 44 230 L66 168 Z" fill={c} />
          <path d="M66 168 L134 168" stroke={shade(c, -30)} strokeWidth="4" />
          {[[80, 200], [104, 214], [126, 196], [92, 184], [116, 184]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="#fff" opacity="0.8" />)}
        </g>
      );
    case 'gown':
      return (
        <g>
          <Sleeves color={c} />
          <path d="M68 130 Q68 112 86 112 L114 112 Q132 112 132 130 L132 164 L164 242 Q100 256 36 242 L68 164 Z" fill={c} />
          <path d="M68 164 Q100 176 132 164" stroke="#facc15" strokeWidth="5" fill="none" />
          <path d="M44 236 Q100 250 156 236" stroke="#facc15" strokeWidth="4" fill="none" />
          <circle cx="100" cy="128" r="6" fill="#facc15" />
        </g>
      );
    case 'jacket':
      return (
        <g>
          <Sleeves color={c} long />
          <path d={TORSO} fill="#f8fafc" />
          <path d="M62 132 Q62 112 82 112 L94 112 L94 190 L62 190 Z" fill={c} />
          <path d="M106 112 L118 112 Q138 112 138 132 L138 190 L106 190 Z" fill={c} />
          <path d="M94 112 L84 136 L94 146 M106 112 L116 136 L106 146" stroke={shade(c, 50)} strokeWidth="2" fill="none" />
        </g>
      );
    case 'hero':
      return (
        <g>
          <Sleeves color={c} long />
          <path d={TORSO} fill={c} />
          <path d="M100 128 L105 142 L120 142 L108 151 L112 166 L100 157 L88 166 L92 151 L80 142 L95 142 Z" fill="#facc15" />
          <rect x="62" y="178" width="76" height="9" fill={r.color2 || '#ef4444'} />
        </g>
      );
    case 'astro':
      return (
        <g>
          <Sleeves color={c} long />
          <path d={TORSO} fill={c} stroke="#cbd5e1" strokeWidth="2" />
          <rect x="84" y="132" width="32" height="24" rx="4" fill="#334155" />
          <circle cx="92" cy="140" r="3" fill="#22c55e" className="ca-blink" /><circle cx="100" cy="140" r="3" fill="#ef4444" /><circle cx="108" cy="140" r="3" fill="#facc15" />
          <rect x="88" y="148" width="24" height="4" rx="2" fill="#38bdf8" />
          <circle cx="76" cy="124" r="6" fill="#ef4444" /><circle cx="76" cy="124" r="3" fill="#fff" />
        </g>
      );
    case 'polo':
      return <g><Sleeves color={c} /><path d={TORSO} fill={c} /><path d="M84 112 L100 128 L116 112 L110 108 L100 118 L90 108 Z" fill={r.color2 || '#fff'} /><circle cx="100" cy="134" r="2.5" fill={shade(c, -40)} /><circle cx="100" cy="144" r="2.5" fill={shade(c, -40)} /></g>;
    case 'jersey':
      return <g><Sleeves color={r.color2 || '#fff'} /><path d={TORSO} fill={c} /><path d="M62 132 L62 124 M138 132 L138 124" stroke={r.color2 || '#fff'} strokeWidth="6" /><path d="M86 112 Q100 124 114 112" stroke={r.color2 || '#fff'} strokeWidth="4" fill="none" /><text x="100" y="170" fontSize="30" fontWeight="900" textAnchor="middle" fill={r.color2 || '#fff'} fontFamily="Arial">{r.num || 10}</text></g>;
    case 'tank':
      return <g><path d="M70 132 Q70 112 82 112 L86 112 Q100 124 114 112 L118 112 Q130 112 130 132 L132 190 L68 190 Z" fill={c} /><path d="M70 134 L70 190" stroke={shade(c, -20)} strokeWidth="2" /></g>;
    case 'overall':
      return <g><Sleeves color={r.color2 || '#fde68a'} /><path d={TORSO} fill={r.color2 || '#fde68a'} /><path d="M76 132 L124 132 L126 190 L74 190 Z" fill={c} /><path d="M78 132 L72 112 M122 132 L128 112" stroke={c} strokeWidth="7" /><circle cx="80" cy="136" r="3" fill="#facc15" /><circle cx="120" cy="136" r="3" fill="#facc15" /><rect x="90" y="146" width="20" height="14" rx="3" fill={shade(c, -20)} /></g>;
    case 'vest':
      return <g><Sleeves color="#f8fafc" /><path d={TORSO} fill="#f8fafc" /><path d="M62 132 Q62 112 82 112 L92 112 L98 150 L98 190 L62 190 Z M108 112 L118 112 Q138 112 138 132 L138 190 L102 190 L102 150 Z" fill={c} /><circle cx="94" cy="160" r="2.5" fill="#facc15" /><circle cx="94" cy="174" r="2.5" fill="#facc15" /></g>;
    case 'raincoat':
      return <g><Sleeves color={c} long /><path d="M62 132 Q62 112 82 112 L118 112 Q138 112 138 132 L142 206 L58 206 Z" fill={c} /><path d="M100 114 L100 204" stroke={shade(c, -30)} strokeWidth="3" />{[130, 150, 170, 190].map(y => <circle key={y} cx="108" cy={y} r="3" fill={shade(c, -40)} />)}<path d="M80 108 Q100 126 120 108" stroke={shade(c, -25)} strokeWidth="6" fill="none" /></g>;
    case 'pajama':
      return <g><Sleeves color={c} long /><path d={TORSO} fill={c} />{[[76, 128], [118, 140], [88, 160], [122, 176], [72, 180], [104, 132]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill={r.color2 || '#fff'} />)}<path d="M84 112 L100 126 L116 112" stroke={r.color2 || '#fff'} strokeWidth="5" fill="none" /></g>;
    case 'chef':
      return <g><Sleeves color="#f8fafc" long /><path d={TORSO} fill="#f8fafc" stroke="#e2e8f0" />{[[88, 130], [112, 130], [88, 150], [112, 150], [88, 170], [112, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#94a3b8" />)}<path d="M84 112 L100 120 L116 112" stroke="#cbd5e1" strokeWidth="5" fill="none" /><rect x="118" y="134" width="12" height="10" fill="#ef4444" /></g>;
    case 'doctor':
      return <g><Sleeves color="#f8fafc" long /><path d="M62 132 Q62 112 82 112 L118 112 Q138 112 138 132 L140 204 L60 204 Z" fill="#f8fafc" /><path d="M92 112 L100 150 L108 112" fill="#7dd3fc" /><path d="M100 150 L100 202" stroke="#cbd5e1" strokeWidth="3" /><path d="M82 116 Q72 150 88 160 Q100 166 104 154" stroke="#334155" strokeWidth="3" fill="none" /><circle cx="104" cy="152" r="5" fill="#94a3b8" /><rect x="114" y="138" width="14" height="4" fill="#3b82f6" /></g>;
    case 'police':
      return <g><Sleeves color={c} /><path d={TORSO} fill={c} /><path d="M84 112 L100 126 L116 112" stroke="#1e3a8a" strokeWidth="5" fill="none" /><path d="M118 132 L124 128 L130 132 L130 142 L124 148 L118 142 Z" fill="#facc15" stroke="#a16207" /><rect x="74" y="134" width="14" height="10" rx="2" fill={shade(c, -25)} /><rect x="62" y="180" width="76" height="8" fill="#1f2937" /></g>;
    case 'firefighter':
      return <g><Sleeves color={c} long /><path d={TORSO} fill={c} />{[150, 176].map(y => <rect key={y} x="62" y={y} width="76" height="7" fill="#facc15" />)}<rect x="62" y={152} width="76" height="3" fill="#e5e7eb" /><path d="M100 114 L100 190" stroke={shade(c, -30)} strokeWidth="3" /></g>;
    case 'pilot':
      return <g><Sleeves color="#f8fafc" /><path d={TORSO} fill="#f8fafc" /><path d="M96 114 L100 160 L104 114 Z" fill="#1e3a8a" /><rect x="64" y="114" width="16" height="6" fill="#1e3a8a" /><rect x="120" y="114" width="16" height="6" fill="#1e3a8a" />{[66, 70, 74].map(x => <rect key={x} x={x + 56} y="115" width="2" height="4" fill="#facc15" />)}<rect x="74" y="134" width="14" height="4" fill="#facc15" /></g>;
    case 'sailor':
      return <g><Sleeves color="#f8fafc" /><path d={TORSO} fill="#f8fafc" /><path d="M76 112 L100 146 L124 112 L132 120 L100 160 L68 120 Z" fill={c} /><path d="M78 118 L100 150 L122 118" stroke="#fff" strokeWidth="2" fill="none" /><path d="M94 150 L100 162 L106 150 Z" fill="#ef4444" /></g>;
    case 'kimono':
      return <g><Sleeves color={c} long /><path d={TORSO} fill={c} /><path d="M84 112 L116 168 M116 112 L96 146" stroke={r.color2 || '#fff'} strokeWidth="6" /><rect x="62" y="160" width="76" height="12" fill={r.color2 || '#facc15'} />{[[76, 132], [124, 186], [80, 184]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={r.color2 || '#fff'} opacity="0.7" />)}</g>;
    default:
      return <g><Sleeves color={c} /><path d={TORSO} fill={c} /></g>;
  }
};

// Tişört üstüne desen (puantiye, yıldız, kalp, çizgi)
const PatternOverlay = ({ kind, c }) => {
  const pid = `pt${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const shapes = {
    dots: [[74, 128], [96, 122], [118, 130], [84, 150], [108, 152], [130, 156], [72, 174], [96, 178], [120, 176]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" fill={c} />),
    stars: [[78, 132], [118, 128], [98, 156], [74, 176], [124, 172]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y - 2} L${x + 3} ${y + 2} L${x + 5} ${y + 7} L${x} ${y + 4} L${x - 5} ${y + 7} L${x - 3} ${y + 2} L${x - 7} ${y - 2} L${x - 2} ${y - 2} Z`} fill={c} />),
    hearts: [[100, 152]].map(([x, y], i) => <path key={i} d={`M${x} ${y + 14} C${x - 22} ${y} ${x - 16} ${y - 16} ${x - 6} ${y - 14} C${x - 2} ${y - 13} ${x} ${y - 9} ${x} ${y - 7} C${x} ${y - 9} ${x + 2} ${y - 13} ${x + 6} ${y - 14} C${x + 16} ${y - 16} ${x + 22} ${y} ${x} ${y + 14} Z`} fill={c} />),
    stripesV: [70, 84, 98, 112, 126].map(x => <rect key={x} x={x} y="112" width="6" height="80" fill={c} />),
    lightning: [<path key="l" d="M106 124 L88 156 L100 156 L92 182 L114 146 L102 146 Z" fill={c} />],
    smile: [<g key="s"><circle cx="100" cy="152" r="16" fill={c} /><circle cx="94" cy="148" r="2" fill="#1f2937" /><circle cx="106" cy="148" r="2" fill="#1f2937" /><path d="M92 156 Q100 164 108 156" stroke="#1f2937" strokeWidth="2" fill="none" /></g>],
  }[kind];
  if (!shapes) return null;
  return <g><clipPath id={pid}><path d={TORSO} /></clipPath><g clipPath={`url(#${pid})`}>{shapes}</g></g>;
};

const OWN_COLLAR = ['polo', 'sailor', 'overall', 'vest', 'jacket', 'doctor', 'pilot', 'kimono', 'police', 'chef', 'hoodie', 'raincoat', 'pajama', 'astro'];
const LONG_SLEEVE = ['hoodie', 'sweater', 'jacket', 'raincoat', 'pajama', 'chef', 'doctor', 'firefighter', 'kimono', 'astro', 'hero'];
// Kıyafete kumaş görünümü: kol/etek dikişleri, koltuk altı kırışıkları, yaka ribanası
const TopFolds = ({ r }) => {
  const c = r.color || '#9ca3af';
  const lt = shade(c, 50);
  const dress = ['dress', 'gown'].includes(r.kind);
  const sleeveless = r.kind === 'tank';
  const long = LONG_SLEEVE.includes(r.kind);
  return (
    <g pointerEvents="none">
      <Fold d="M67 136 Q75 148 70 164" o={0.2} w={2.4} />
      <Fold d="M133 136 Q125 148 130 164" o={0.2} w={2.4} />
      <Fold d="M92 160 Q98 170 95 182" o={0.12} />
      <Fold d="M110 146 Q105 156 109 168" o={0.12} />
      <path d="M78 122 Q84 118 90 124" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" fill="none" strokeLinecap="round" />
      {!dress && <Stitch d="M64 185 L136 185" c={lt} />}
      {!OWN_COLLAR.includes(r.kind) && !sleeveless && <path d="M85 112.5 Q100 125 115 112.5" stroke={shade(c, -25)} strokeWidth="4" fill="none" />}
      {!OWN_COLLAR.includes(r.kind) && !sleeveless && <Stitch d="M87 115 Q100 125 113 115" c={lt} />}
      {!sleeveless && (long
        ? <g><path d="M42 172 L64 176" stroke={shade(c, -25)} strokeWidth="6" strokeLinecap="round" /><path d="M136 176 L158 172" stroke={shade(c, -25)} strokeWidth="6" strokeLinecap="round" /></g>
        : <g><Stitch d="M46 141 L68 145" c={lt} /><Stitch d="M132 145 L154 141" c={lt} /></g>)}
    </g>
  );
};

const Top = ({ r }) => <g><TopBase r={r} />{r.pattern && <PatternOverlay kind={r.pattern} c={r.color2 || '#fff'} />}<TopFolds r={r} /></g>;

// --- ALT GİYİM ---
// Ortak: dikiş çizgisi (açık renkli kesik çizgi)
const Stitch = ({ d, c = '#fff', o = 0.55, w = 1.2 }) => <path d={d} stroke={c} strokeOpacity={o} strokeWidth={w} strokeDasharray="3 2.2" fill="none" strokeLinecap="round" />;
const Fold = ({ d, c = '#000', o = 0.18, w = 2 }) => <path d={d} stroke={c} strokeOpacity={o} strokeWidth={w} fill="none" strokeLinecap="round" />;

// Pantolon/şort gövdesi: legLen = paça yüksekliği (214 şort, 236 uzun)
const pantsPath = (bottomY, flare = 0) => `M66 184 L134 184 L${132 - (bottomY > 220 ? 4 : 0) + flare} ${bottomY} L104 ${bottomY} L100 ${Math.min(204, bottomY - 8)} L96 ${bottomY} L${68 + (bottomY > 220 ? 4 : 0) - flare} ${bottomY} Z`;

function PantsBase({ c, bottomY, denim, cuffs = true, pockets = true, belt = true, stitchC }) {
  const dk = shade(c, -32), lt = shade(c, 38);
  const sc = stitchC || (denim ? '#f59e0b' : lt);
  const long = bottomY > 220;
  return (
    <g>
      <path d={pantsPath(bottomY)} fill={c} />
      {/* bel bandı + kemer köprüleri */}
      <path d="M66 184 L134 184 L134 192 L66 192 Z" fill={dk} />
      {belt && [72, 88, 112, 128].map(x => <rect key={x} x={x - 1.5} y="183" width="3" height="10" rx="1" fill={shade(c, -45)} />)}
      <circle cx="100" cy="188" r="2.6" fill={denim ? '#d4a24c' : shade(c, -50)} stroke={shade(c, -60)} strokeWidth="0.8" />
      {/* fermuar dikişi */}
      <Stitch d={`M100 192 L100 ${Math.min(204, bottomY - 8)} M100 192 Q106 196 104 202`} c={sc} />
      {/* cepler */}
      {pockets && <g><Stitch d="M70 193 Q78 196 82 204" c={sc} /><Stitch d="M130 193 Q122 196 118 204" c={sc} /><Fold d="M69 194 Q77 198 81 206" o={0.25} w={2.4} /><Fold d="M131 194 Q123 198 119 206" o={0.25} w={2.4} /></g>}
      {/* yan dikişler + kırışıklar */}
      <Stitch d={`M68 194 L${long ? 72 : 68} ${bottomY - 3}`} c={sc} o={0.4} />
      <Stitch d={`M132 194 L${long ? 128 : 132} ${bottomY - 3}`} c={sc} o={0.4} />
      <Fold d={`M90 ${bottomY - 10} Q92 ${bottomY - 14} 94 ${bottomY - 11}`} o={0.22} />
      <Fold d={`M106 ${bottomY - 11} Q108 ${bottomY - 15} 110 ${bottomY - 10}`} o={0.22} />
      {long && <g><ellipse cx="84" cy="216" rx="6" ry="9" fill={lt} opacity="0.28" /><ellipse cx="116" cy="216" rx="6" ry="9" fill={lt} opacity="0.28" /><Fold d="M80 224 Q86 221 92 225" o={0.2} /><Fold d="M108 225 Q114 221 120 224" o={0.2} /></g>}
      {/* paça kıvrımı */}
      {cuffs && <g><rect x={long ? 71 : 67} y={bottomY - 5} width={long ? 25 : 30} height="5" rx="1.5" fill={lt} opacity="0.85" /><rect x="104" y={bottomY - 5} width={long ? 25 : 30} height="5" rx="1.5" fill={lt} opacity="0.85" /></g>}
    </g>
  );
}

const Bottom = ({ r }) => {
  const c = r.color || '#6b7280';
  const dk = shade(c, -30), lt = shade(c, 40);
  switch (r.kind) {
    case 'oldShorts':
      return (
        <g>
          <path d="M66 184 L134 184 L132 214 L127 209 L122 216 L104 214 L100 200 L96 214 L78 216 L73 209 L68 214 Z" fill={c} />
          <path d="M66 184 L134 184 L134 191 L66 191 Z" fill={dk} />
          <path d="M70 212 l2 5 M76 213 l1 5 M84 212 l1 4 M110 212 l1 5 M120 213 l2 5 M128 211 l1 4" stroke={dk} strokeWidth="1.5" />
          <rect x="112" y="194" width="13" height="11" fill="#8d7b63" stroke="#4a3f30" strokeDasharray="2 2" transform="rotate(6 118 200)" />
          <Fold d="M82 196 Q86 204 84 210" o={0.25} /><Stitch d="M100 191 L100 200" c={lt} />
        </g>
      );
    case 'shorts': return <PantsBase c={c} bottomY={214} />;
    case 'jeans': return <PantsBase c={c} bottomY={236} denim />;
    case 'capri': return <PantsBase c={c} bottomY={224} denim={false} />;
    case 'cargo':
      return (
        <g>
          <PantsBase c={c} bottomY={236} pockets={false} />
          {[70, 116].map(x => <g key={x}><rect x={x} y="204" width="15" height="16" rx="2" fill={shade(c, -10)} stroke={dk} strokeWidth="1" /><path d={`M${x - 1} 204 L${x + 16} 204 L${x + 16} 209 L${x - 1} 209 Z`} fill={shade(c, -22)} /><circle cx={x + 7.5} cy="207" r="1.6" fill={lt} /></g>)}
        </g>
      );
    case 'track':
      return (
        <g>
          <path d={pantsPath(236)} fill={c} />
          <rect x="66" y="184" width="68" height="8" rx="3" fill={dk} />
          <path d="M96 188 Q100 196 104 188" stroke="#fff" strokeWidth="1.5" fill="none" /><path d="M98 190 l-2 8 M102 190 l2 8" stroke="#fff" strokeWidth="1.5" />
          <path d="M69 192 L73 234 M131 192 L127 234" stroke="#fff" strokeWidth="3.5" /><path d="M72 192 L76 234 M128 192 L124 234" stroke="#fff" strokeWidth="1.5" opacity="0.7" />
          <rect x="72" y="230" width="24" height="6" rx="2" fill={dk} /><rect x="104" y="230" width="24" height="6" rx="2" fill={dk} />
          <Fold d="M82 214 Q88 211 92 216" o={0.22} /><Fold d="M108 216 Q113 211 118 214" o={0.22} />
        </g>
      );
    case 'leggings':
      return (
        <g>
          <path d="M68 184 L132 184 L126 238 L106 238 L100 204 L94 238 L74 238 Z" fill={c} />
          <rect x="68" y="184" width="64" height="6" fill={dk} />
          {r.color2 && [196, 210, 224].map(y => <g key={y}><circle cx="84" cy={y} r="3" fill={r.color2} /><circle cx="116" cy={y + 6} r="3" fill={r.color2} /></g>)}
          <path d="M80 196 Q78 216 82 234 M120 196 Q122 216 118 234" stroke={lt} strokeWidth="3" opacity="0.35" fill="none" />
        </g>
      );
    case 'skirt':
      return (
        <g>
          <path d="M68 182 L132 182 L146 220 Q100 230 54 220 Z" fill={c} />
          {[70, 82, 94, 106, 118, 130].map((x, i) => <path key={x} d={`M${x + 4} 190 L${x - 8 + i * 4.5} 222`} stroke={i % 2 ? dk : lt} strokeOpacity="0.45" strokeWidth="2" />)}
          <path d="M68 182 L132 182 L133 190 L67 190 Z" fill={dk} />
          <Stitch d="M57 217 Q100 226 143 217" c={lt} />
        </g>
      );
    case 'tutu':
      return (
        <g>
          {[0, 1].map(k => <g key={k} opacity={k ? 0.95 : 0.7}>{[52, 64, 76, 88, 100, 112, 124, 136, 148].map((x, i) => <ellipse key={i} cx={x} cy={204 + k * 4 - (i % 2) * 2} rx="11" ry={12 - k * 2} fill={k ? c : lt} />)}</g>)}
          {[60, 80, 100, 120, 140].map(x => <path key={x} d={`M${x} 196 L${x + 2} 214`} stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" />)}
          <path d="M66 184 L134 184 L132 196 L68 196 Z" fill={dk} /><circle cx="118" cy="190" r="3" fill="#fff" opacity="0.8" />
        </g>
      );
    default: return <PantsBase c={c} bottomY={214} />;
  }
};

// --- AYAKKABI (her ayak ayrı, önden-yandan gerçekçi) ---
function Foot({ x, kind, c, c2, skin, flip }) {
  const dk = shade(c, -35), lt = shade(c, 45);
  const s = flip ? -1 : 1; // ayakkabı burnu dışa baksın
  switch (kind) {
    case 'boots':
      return (
        <g>
          <path d={`M${x - 11} 214 L${x + 11} 214 L${x + 12} 240 Q${x + 16 * s} 241 ${x + 16 * s} 245 L${x - 14 * s} 245 L${x - 13 * s} 238 Z`} fill={c} />
          <rect x={x - 15} y="244" width="31" height="5" rx="2" fill="#3f2a1d" />
          <rect x={x - 12} y="214" width="24" height="6" rx="2" fill={dk} />
          {[222, 228, 234].map(y => <path key={y} d={`M${x - 5} ${y} L${x + 5} ${y + 3} M${x + 5} ${y} L${x - 5} ${y + 3}`} stroke={lt} strokeWidth="1.4" />)}
          <path d={`M${x - 9} 238 Q${x} 236 ${x + 9} 239`} stroke={lt} strokeOpacity="0.5" strokeWidth="2" fill="none" />
        </g>
      );
    case 'hightop':
    case 'skates':
      return (
        <g>
          <path d={`M${x - 12} 222 L${x + 11} 222 L${x + 12} 238 Q${x + 17 * s} 239 ${x + 16 * s} 244 L${x - 14 * s} 244 L${x - 13 * s} 236 Z`} fill={c} />
          <circle cx={x - 5 * s} cy="230" r="4.5" fill="#fff" stroke={dk} strokeWidth="1" /><path d={`M${x - 7 * s} 230 l2 -2 l2 2`} stroke={c} strokeWidth="1" fill="none" />
          {[226, 231, 236].map(y => <path key={y} d={`M${x + 1} ${y} L${x + 8} ${y + 2}`} stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />)}
          <path d={`M${x - 14} 240 Q${x} 237 ${x + 16} 240 L${x + 16} 245 L${x - 14} 245 Z`} fill="#f8fafc" />
          {kind === 'skates'
            ? <g><rect x={x - 13} y="245" width="27" height="3" fill="#94a3b8" />{[x - 9, x + 9].map(wx => <g key={wx}><circle cx={wx} cy="251" r="4" fill={c2 || '#facc15'} stroke="#1f2937" strokeWidth="1" /><circle cx={wx} cy="251" r="1.4" fill="#fff" /></g>)}</g>
            : <rect x={x - 15} y="245" width="32" height="3.5" rx="1.5" fill={dk} />}
        </g>
      );
    case 'sandals':
      return (
        <g>
          <path d={`M${x - 10} 238 Q${x - 11} 232 ${x} 231 Q${x + 11} 232 ${x + 10} 238 L${x + 11} 244 L${x - 11} 244 Z`} fill={skin} />
          {[-6, -2, 2, 6].map(dx => <ellipse key={dx} cx={x + dx * s + 2 * s} cy="244" rx="2" ry="1.6" fill={shade(skin, 15)} stroke={shade(skin, -25)} strokeWidth="0.6" />)}
          <path d={`M${x - 15} 245 Q${x} 243 ${x + 15} 245 L${x + 15} 249 L${x - 15} 249 Z`} fill={dk} />
          <path d={`M${x - 15} 245 Q${x} 243 ${x + 15} 245`} stroke={lt} strokeWidth="1.5" fill="none" />
          <path d={`M${x - 10} 241 Q${x} 235 ${x + 10} 241`} stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d={`M${x - 8} 235 Q${x} 230 ${x + 8} 235`} stroke={c} strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <rect x={x + 6 * s - 2} y="237" width="4" height="4" rx="1" fill="#facc15" stroke={dk} strokeWidth="0.6" />
        </g>
      );
    case 'slippers':
      return (
        <g>
          <ellipse cx={x} cy="246" rx="16" ry="4.5" fill={dk} />
          <path d={`M${x - 13} 245 Q${x - 12} 234 ${x} 233 Q${x + 12} 234 ${x + 13} 245 Z`} fill={c} />
          <path d={`M${x - 11} 242 Q${x} 237 ${x + 11} 242`} stroke={lt} strokeWidth="2" fill="none" opacity="0.6" />
          <circle cx={x} cy="238" r="3.5" fill="#fff" opacity="0.85" /><circle cx={x} cy="238" r="1.5" fill={c2 || '#f472b6'} />
        </g>
      );
    case 'ballet':
    case 'glitter':
      return (
        <g>
          <path d={`M${x - 14} 244 Q${x - 15} 234 ${x - 4} 233 L${x + 4} 233 Q${x + 15} 234 ${x + 14} 244 Q${x} 248 ${x - 14} 244 Z`} fill={c} />
          <path d={`M${x - 8} 236 Q${x} 240 ${x + 8} 236`} fill={skin} />
          <path d={`M${x - 12} 244 Q${x} 247 ${x + 12} 244`} stroke={dk} strokeWidth="1.5" fill="none" />
          <path d={`M${x - 10} 238 Q${x - 6} 236 ${x - 3} 238`} stroke="#fff" strokeOpacity="0.6" strokeWidth="1.6" fill="none" />
          {kind === 'ballet'
            ? <g transform={`translate(${x} 235)`}><path d="M0 0 L-5 -3 L-5 3 Z M0 0 L5 -3 L5 3 Z" fill={lt} stroke={dk} strokeWidth="0.6" /><circle r="1.4" fill={dk} /></g>
            : [[-7, 240], [0, 242], [7, 240], [-3, 238], [4, 238]].map(([dx, y], i) => <circle key={i} cx={x + dx} cy={y} r="1.3" fill="#fff" className="ca-twinkle" style={{ animationDelay: `${i * 0.25}s` }} />)}
        </g>
      );
    case 'clogs':
      return (
        <g>
          <path d={`M${x - 14} 244 Q${x - 15} 230 ${x} 229 Q${x + 15} 230 ${x + 14} 244 Z`} fill={c} />
          <rect x={x - 15} y="243" width="30" height="5" rx="2" fill={dk} />
          {[[-7, 236], [0, 234], [7, 236], [-4, 240], [4, 240]].map(([dx, y], i) => <ellipse key={i} cx={x + dx} cy={y} rx="1.8" ry="1.4" fill={dk} />)}
          <path d={`M${x - 10} 234 Q${x - 6} 231 ${x - 2} 232`} stroke={lt} strokeWidth="1.6" fill="none" opacity="0.7" />
        </g>
      );
    case 'sneakers':
    default:
      return (
        <g>
          {/* üst kısım */}
          <path d={`M${x - 13} 243 Q${x - 14} 231 ${x - 5} 229 L${x + 5} 229 Q${x + 14} 231 ${x + 14} 243 Z`} fill={c} />
          {/* burun kapağı */}
          <path d={`M${x - 12} 243 Q${x - 11} 237 ${x} 237 Q${x + 11} 237 ${x + 13} 243 Z`} fill={lt} opacity="0.85" />
          {/* dil ve bağcık */}
          <rect x={x - 4} y="228" width="8" height="8" rx="2" fill={shade(c, 20)} />
          {[231, 234, 237].map(y => <path key={y} d={`M${x - 4} ${y} L${x + 4} ${y}`} stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />)}
          {/* yan şerit */}
          <path d={`M${x - 11 * s} 240 Q${x - 4 * s} 236 ${x + 2 * s} 233`} stroke={c2 || '#fff'} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          {/* taban */}
          <path d={`M${x - 15} 243 L${x + 15} 243 Q${x + 16} 249 ${x + 12} 249 L${x - 12} 249 Q${x - 16} 249 ${x - 15} 243 Z`} fill="#f8fafc" />
          <path d={`M${x - 13} 247.5 L${x + 13} 247.5`} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 1.5" />
        </g>
      );
  }
}

const Shoes = ({ r, skin }) => {
  const c = r.color || '#374151';
  return <g><Foot x={86} kind={r.kind} c={c} c2={r.color2} skin={skin} flip /><Foot x={114} kind={r.kind} c={c} c2={r.color2} skin={skin} /></g>;
};

// --- ŞAPKA ---
const Hat = ({ r }) => {
  const c = r.color || '#ef4444';
  switch (r.kind) {
    case 'cap': return <g><path d="M58 50 Q60 14 100 14 Q140 14 142 50 Z" fill={c} /><path d="M100 14 L100 50 M100 14 Q80 24 76 50 M100 14 Q120 24 124 50" stroke={shade(c, -30)} strokeWidth="1.4" fill="none" opacity="0.7" />{[70, 88, 112, 130].map(x => <circle key={x} cx={x} cy="30" r="1.6" fill={shade(c, -40)} />)}<path d="M60 46 Q100 40 140 46" stroke={shade(c, 40)} strokeWidth="1.2" strokeDasharray="3 2" fill="none" /><path d="M120 46 Q160 40 170 52 Q150 58 120 53 Z" fill={shade(c, -25)} /><path d="M124 50 Q150 48 164 52" stroke={shade(c, 30)} strokeWidth="1.2" strokeDasharray="3 2" fill="none" /><circle cx="100" cy="15" r="4.5" fill={shade(c, -30)} /><path d="M72 24 Q86 16 100 16" stroke="#fff" strokeOpacity="0.35" strokeWidth="4" fill="none" strokeLinecap="round" /></g>;
    case 'beanie': return <g><path d="M58 52 Q58 12 100 12 Q142 12 142 52 Z" fill={c} />{[66, 76, 86, 96, 106, 116, 126, 136].map(x => <path key={x} d={`M${x} 46 Q${x + (100 - x) * 0.3} 26 ${100 + (x - 100) * 0.4} 14`} stroke={shade(c, -25)} strokeWidth="1.4" fill="none" opacity="0.6" />)}<rect x="56" y="42" width="88" height="14" rx="6" fill={shade(c, -22)} />{Array.from({ length: 15 }).map((_, i) => <path key={i} d={`M${60 + i * 5.6} 44 L${60 + i * 5.6} 54`} stroke={shade(c, -45)} strokeWidth="1.3" />)}{Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={100 + Math.cos(i * 0.63) * (5 + (i % 3) * 2)} cy={8 + Math.sin(i * 0.63) * (5 + (i % 3) * 2)} r="4.5" fill={i % 2 ? '#fff' : '#f1f5f9'} />)}<path d="M70 24 Q84 16 98 16" stroke="#fff" strokeOpacity="0.3" strokeWidth="4" fill="none" strokeLinecap="round" /></g>;
    case 'party': return <g><path d="M78 30 L100 -18 L122 30 Z" fill={c} /><circle cx="100" cy="-18" r="6" fill="#facc15" /><circle cx="92" cy="12" r="3" fill="#fff" /><circle cx="106" cy="0" r="3" fill="#fff" /><circle cx="110" cy="20" r="3" fill="#fff" /></g>;
    case 'flower': return <g>{[62, 76, 92, 108, 124, 138].map((x, i) => <g key={x}><circle cx={x} cy={30 - Math.sin(i / 5 * Math.PI) * 12} r="8" fill={['#f472b6', '#facc15', '#a78bfa', '#fb7185', '#34d399', '#60a5fa'][i]} /><circle cx={x} cy={30 - Math.sin(i / 5 * Math.PI) * 12} r="3" fill="#fff" /></g>)}</g>;
    case 'cowboy': return <g><ellipse cx="100" cy="36" rx="68" ry="12" fill={c} /><path d="M70 36 Q70 0 100 2 Q130 0 130 36 Z" fill={shade(c, 15)} /><rect x="70" y="26" width="60" height="7" fill={shade(c, -40)} /></g>;
    case 'pirate': return <g><path d="M48 40 Q100 -16 152 40 Q100 26 48 40 Z" fill={c} /><circle cx="100" cy="20" r="7" fill="#fff" /><path d="M94 30 L106 34 M106 30 L94 34" stroke="#fff" strokeWidth="2" /></g>;
    case 'wizard': return <g><ellipse cx="100" cy="34" rx="56" ry="10" fill={shade(c, -20)} /><path d="M66 34 L108 -30 L134 34 Z" fill={c} /><text x="98" y="12" fontSize="14" textAnchor="middle">⭐</text><text x="114" y="28" fontSize="9" textAnchor="middle">✨</text></g>;
    case 'crown': return <g><path d="M64 36 L64 6 L80 22 L100 0 L120 22 L136 6 L136 36 Z" fill={c} stroke={shade(c, -45)} strokeWidth="2" strokeLinejoin="round" /><rect x="62" y="30" width="76" height="8" rx="3" fill={shade(c, -20)} /><path d="M68 12 L70 30 M100 6 L100 22" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.5" />{[[64, 6, 3], [100, 0, 3.5], [136, 6, 3]].map(([x, y, r2], i) => <circle key={i} cx={x} cy={y} r={r2} fill="#fef3c7" stroke={shade(c, -40)} strokeWidth="1" />)}{[[100, 24, 5.5, '#ef4444'], [80, 28, 4, '#3b82f6'], [120, 28, 4, '#22c55e']].map(([x, y, r2, gc], i) => <g key={i}><path d={`M${x} ${y - r2} L${x + r2} ${y} L${x} ${y + r2} L${x - r2} ${y} Z`} fill={gc} stroke={shade(gc, -40)} strokeWidth="0.8" /><path d={`M${x - r2 * 0.4} ${y - r2 * 0.3} L${x} ${y - r2 * 0.7}`} stroke="#fff" strokeWidth="1.2" /></g>)}</g>;
    case 'helmet': return <g><path d="M54 52 Q54 8 100 8 Q146 8 146 52 Z" fill={c} /><path d="M76 14 L76 50 M100 8 L100 50 M124 14 L124 50" stroke="#fff" strokeWidth="4" opacity="0.6" /><path d="M58 52 Q100 44 142 52" stroke={shade(c, -30)} strokeWidth="5" fill="none" /></g>;
    case 'chefhat': return <g><rect x="70" y="30" width="60" height="18" fill="#fff" stroke="#e2e8f0" /><circle cx="78" cy="18" r="16" fill="#fff" /><circle cx="100" cy="8" r="18" fill="#fff" /><circle cx="122" cy="18" r="16" fill="#fff" /></g>;
    case 'policehat': return <g><path d="M60 38 Q60 6 100 4 Q140 6 140 38 Z" fill={c} /><rect x="58" y="34" width="84" height="12" rx="3" fill="#111827" /><path d="M64 46 Q100 58 136 46 L130 52 Q100 60 70 52 Z" fill="#111827" /><path d="M94 16 L100 10 L106 16 L106 26 L100 30 L94 26 Z" fill="#facc15" /></g>;
    case 'firehat': return <g><ellipse cx="100" cy="42" rx="60" ry="10" fill={shade(c, -20)} /><path d="M64 42 Q64 4 100 4 Q136 4 136 42 Z" fill={c} /><path d="M90 12 L110 12 L110 32 L90 32 Z" fill="#facc15" /></g>;
    case 'tiara': return <g><path d="M60 42 Q100 30 140 42" stroke={shade(c, -30)} strokeWidth="3" fill="none" /><path d="M66 38 L72 22 L82 32 L92 14 L100 26 L108 14 L118 32 L128 22 L134 38 Q100 30 66 38 Z" fill={c} stroke={shade(c, -40)} strokeWidth="1.5" strokeLinejoin="round" />{[[100, 24, 4.5, '#f472b6'], [82, 30, 3, '#38bdf8'], [118, 30, 3, '#38bdf8'], [92, 18, 2.4, '#fff'], [108, 18, 2.4, '#fff']].map(([x, y, r2, gc], i) => <g key={i}><circle cx={x} cy={y} r={r2} fill={gc} stroke={shade(gc === '#fff' ? '#cbd5e1' : gc, -30)} strokeWidth="0.7" /><circle cx={x - r2 * 0.35} cy={y - r2 * 0.35} r={r2 * 0.35} fill="#fff" /></g>)}<path d="M98 6 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 Z" fill="#fff" className="ca-twinkle" /></g>;
    case 'bow': return <Bow c={c} x={126} y={26} s={1.25} />;
    case 'bunnyEars': return <g><rect x="60" y="34" width="80" height="8" rx="4" fill={c} /><ellipse cx="80" cy="4" rx="10" ry="30" fill={c} /><ellipse cx="120" cy="4" rx="10" ry="30" fill={c} /><ellipse cx="80" cy="6" rx="4" ry="20" fill="#fda4af" /><ellipse cx="120" cy="6" rx="4" ry="20" fill="#fda4af" /></g>;
    case 'catEars': return <g><rect x="60" y="34" width="80" height="8" rx="4" fill={c} /><path d="M64 38 L66 6 L90 30 Z M136 38 L134 6 L110 30 Z" fill={c} /><path d="M70 30 L71 16 L82 28 Z M130 30 L129 16 L118 28 Z" fill="#fda4af" /></g>;
    case 'headband': return <g><path d="M58 50 Q60 22 100 20 Q140 22 142 50" stroke={c} strokeWidth="9" fill="none" strokeLinecap="round" />{r.color2 && <circle cx="122" cy="26" r="9" fill={r.color2} />}</g>;
    case 'beret': return <g><ellipse cx="96" cy="30" rx="50" ry="18" fill={c} transform="rotate(-8 96 30)" /><rect x="60" y="38" width="80" height="6" rx="3" fill={shade(c, -25)} /><circle cx="96" cy="10" r="4" fill={shade(c, -25)} /></g>;
    case 'sunhat': return <g><ellipse cx="100" cy="40" rx="74" ry="14" fill={c} /><path d="M66 40 Q66 4 100 4 Q134 4 134 40 Z" fill={c} /><rect x="66" y="28" width="68" height="8" fill={r.color2 || '#f472b6'} /><circle cx="128" cy="30" r="7" fill={r.color2 || '#f472b6'} /></g>;
    case 'propeller': return <g><path d="M58 50 Q58 12 100 12 Q142 12 142 50 Z" fill={c} /><path d="M58 50 Q58 12 100 12 L100 50 Z" fill={r.color2 || '#facc15'} /><rect x="98" y="0" width="4" height="12" fill="#1f2937" /><g className="ca-spin-slow" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}><path d="M76 0 L124 0" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" /></g></g>;
    case 'santa': return <g><path d="M60 44 Q66 0 112 4 Q140 10 150 36 L136 40 Q128 22 112 20 L134 44 Z" fill="#dc2626" /><rect x="56" y="38" width="88" height="14" rx="7" fill="#fff" /><circle cx="150" cy="38" r="8" fill="#fff" /></g>;
    case 'grad': return <g><path d="M62 40 Q62 22 100 22 Q138 22 138 40 Z" fill={c} /><path d="M40 22 L100 4 L160 22 L100 40 Z" fill={c} /><path d="M140 22 L144 44" stroke="#facc15" strokeWidth="3" /><circle cx="144" cy="46" r="4" fill="#facc15" /></g>;
    default: return null;
  }
};

// --- AKSESUAR ---
const Accessory = ({ r }) => {
  const c = r.color || '#111827';
  switch (r.kind) {
    case 'glasses': { const fc = r.color || '#1f2937'; return <g><circle cx="84" cy="68" r="12" fill="#e0f2fe" fillOpacity="0.35" stroke={fc} strokeWidth="3.2" /><circle cx="116" cy="68" r="12" fill="#e0f2fe" fillOpacity="0.35" stroke={fc} strokeWidth="3.2" /><path d="M96 66 Q100 62 104 66" stroke={fc} strokeWidth="3" fill="none" /><path d="M72 66 L60 62 M128 66 L140 62" stroke={fc} strokeWidth="3" /><path d="M77 62 L83 58 M109 62 L115 58" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" /></g>; }
    case 'sunglasses': { const fc = r.color || '#111827'; return <g><defs><linearGradient id="sgl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#334155" /><stop offset="1" stopColor="#020617" /></linearGradient></defs><path d="M68 58 L97 58 L95 72 Q90 78 80 77 Q70 76 69 68 Z" fill="url(#sgl)" stroke={fc} strokeWidth="3" strokeLinejoin="round" /><path d="M103 58 L132 58 L131 68 Q130 76 120 77 Q110 78 105 72 Z" fill="url(#sgl)" stroke={fc} strokeWidth="3" strokeLinejoin="round" /><path d="M97 61 Q100 58 103 61" stroke={fc} strokeWidth="3" fill="none" /><path d="M73 62 L80 62 L74 70 Z M108 62 L115 62 L109 70 Z" fill="#fff" opacity="0.35" /><path d="M68 59 L58 56 M132 59 L142 56" stroke={fc} strokeWidth="3" /></g>; }
    case 'bowtie': return <g><path d="M100 115 C94 106 84 104 82 106 C80 112 80 118 82 124 C84 126 94 124 100 115 Z" fill={c} /><path d="M100 115 C106 106 116 104 118 106 C120 112 120 118 118 124 C116 126 106 124 100 115 Z" fill={c} /><path d="M86 110 Q92 114 86 120 M114 110 Q108 114 114 120" stroke={shade(c, -40)} strokeWidth="1.3" fill="none" /><rect x="96" y="110" width="8" height="10" rx="3" fill={shade(c, -25)} /><path d="M84 108 Q88 107 90 109" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" fill="none" /></g>;
    case 'scarf': return <g><path d="M70 106 Q100 122 130 106 L130 118 Q100 132 70 118 Z" fill={c} />{[78, 90, 102, 114, 124].map(x => <path key={x} d={`M${x} ${110 + (x > 100 ? (130 - x) * 0.1 : (x - 70) * 0.1)} l0 10`} stroke={shade(c, 45)} strokeWidth="3" opacity="0.5" />)}<path d="M108 114 L120 114 L122 152 L106 152 Z" fill={shade(c, -12)} />{[118, 128, 138].map(y => <path key={y} d={`M107 ${y} L121 ${y}`} stroke={shade(c, 45)} strokeWidth="3" opacity="0.5" />)}{[107, 110, 113, 116, 119].map(x => <path key={x} d={`M${x} 152 l0 6`} stroke={c} strokeWidth="2" />)}<path d="M74 110 Q100 124 126 110" stroke="#000" strokeOpacity="0.15" strokeWidth="2" fill="none" /></g>;
    case 'medal': return <g><path d="M88 110 L98 140 M112 110 L102 140" stroke="#ef4444" strokeWidth="6" /><path d="M92 110 L100 136 M108 110 L100 136" stroke="#fff" strokeWidth="2" /><circle cx="100" cy="148" r="12" fill="#facc15" stroke="#a16207" strokeWidth="2" /><circle cx="100" cy="148" r="8" fill="none" stroke="#fde68a" strokeWidth="1.5" /><path d="M100 142 L102 146 L106 146 L103 149 L104 153 L100 151 L96 153 L97 149 L94 146 L98 146 Z" fill="#a16207" /><path d="M92 143 Q95 139 99 139" stroke="#fff" strokeWidth="1.8" fill="none" opacity="0.8" /></g>;
    case 'headphones': return <g><path d="M56 70 Q56 12 100 12 Q144 12 144 70" stroke={shade(c, -25)} strokeWidth="9" fill="none" /><path d="M58 66 Q58 16 100 16 Q142 16 142 66" stroke={c} strokeWidth="5" fill="none" /><rect x="44" y="56" width="18" height="32" rx="8" fill={c} /><rect x="138" y="56" width="18" height="32" rx="8" fill={c} /><rect x="56" y="60" width="7" height="24" rx="3.5" fill="#1f2937" /><rect x="137" y="60" width="7" height="24" rx="3.5" fill="#1f2937" /><path d="M48 62 L48 80 M152 62 L152 80" stroke="#fff" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" /></g>;
    case 'necklace': { const gc = r.color2 || '#f472b6'; return <g>{Array.from({ length: 15 }).map((_, i) => { const t = i / 14; const x = 78 + t * 44; const y = 108 + Math.sin(t * Math.PI) * 18; return <circle key={i} cx={x} cy={y} r="1.6" fill={c} stroke={shade(c, -40)} strokeWidth="0.4" />; })}<path d="M100 126 L106 132 L100 142 L94 132 Z" fill={gc} stroke={shade(gc === '#f8fafc' ? '#cbd5e1' : gc, -35)} strokeWidth="1" /><path d="M94 132 L106 132 M100 126 L100 142" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" /><path d="M97 129 L99 127" stroke="#fff" strokeWidth="1.4" /><path d="M108 124 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 Z" fill="#fff" className="ca-twinkle" /></g>; }
    case 'backpack': return <g>{[[74, 114, 78, 170], [126, 114, 122, 170]].map(([x1, y1, x2, y2], i) => <g key={i}><path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c} strokeWidth="9" strokeLinecap="round" /><path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={shade(c, 40)} strokeWidth="1.2" strokeDasharray="3 2" /><rect x={x1 + (x2 - x1) * 0.55 - 6} y="146" width="12" height="8" rx="2" fill="#1f2937" /><rect x={x1 + (x2 - x1) * 0.55 - 3.5} y="148" width="7" height="4" rx="1" fill="#9ca3af" /></g>)}</g>;
    case 'watch': return <g transform="rotate(8 50 170)"><rect x="38" y="165" width="24" height="10" rx="3" fill={shade(c, -15)} />{[42, 58].map(x => <circle key={x} cx={x} cy="170" r="0.9" fill={shade(c, -50)} />)}<circle cx="50" cy="170" r="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" /><circle cx="50" cy="170" r="6" fill="#fff" />{[0, 90, 180, 270].map(a => <path key={a} d={`M${50 + Math.cos(a * Math.PI / 180) * 5} ${170 + Math.sin(a * Math.PI / 180) * 5} L${50 + Math.cos(a * Math.PI / 180) * 4} ${170 + Math.sin(a * Math.PI / 180) * 4}`} stroke="#1f2937" strokeWidth="1" />)}<path d="M50 166.5 L50 170 L52.5 171.5" stroke="#1f2937" strokeWidth="1.2" fill="none" /><path d="M46 166 Q48 164.5 50 164.5" stroke="#fff" strokeWidth="1" opacity="0.8" /></g>;
    case 'tie': return <g><path d="M94 112 L106 112 L103 120 L110 168 L100 178 L90 168 L97 120 Z" fill={c} /><path d="M92 128 L108 124 M91 146 L109 142" stroke={shade(c, 40)} strokeWidth="3" /></g>;
    case 'mask': return <g><path d="M66 60 Q84 52 100 62 Q116 52 134 60 Q136 76 120 78 Q106 78 100 70 Q94 78 80 78 Q64 76 66 60 Z" fill={c} /><ellipse cx="84" cy="67" rx="7" ry="6" fill="#fff" /><ellipse cx="116" cy="67" rx="7" ry="6" fill="#fff" /><ellipse cx="84" cy="68" rx="4" ry="4.5" fill="#1f2937" /><ellipse cx="116" cy="68" rx="4" ry="4.5" fill="#1f2937" /></g>;
    case 'freckles': return <g fill="#b45309" opacity="0.6">{[[70, 78], [76, 82], [72, 86], [130, 78], [124, 82], [128, 86]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" />)}</g>;
    case 'flowerEar': return <g transform="translate(140 58)">{[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx={Math.cos(a * Math.PI / 180) * 7} cy={Math.sin(a * Math.PI / 180) * 7} rx="6.5" ry="5" transform={`rotate(${a} ${Math.cos(a * Math.PI / 180) * 7} ${Math.sin(a * Math.PI / 180) * 7})`} fill={c} stroke={shade(c === '#f8fafc' ? '#e5e7eb' : c, -30)} strokeWidth="0.7" />)}{[0, 72, 144, 216, 288].map(a => <path key={`v${a}`} d={`M0 0 L${Math.cos(a * Math.PI / 180) * 9} ${Math.sin(a * Math.PI / 180) * 9}`} stroke="#fff" strokeOpacity="0.45" strokeWidth="1" />)}<circle r="4.2" fill="#facc15" stroke="#a16207" strokeWidth="0.8" />{[[-1.5, -1], [1.5, 0.5], [0, 1.8]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r="0.7" fill="#a16207" />)}<path d="M-12 8 Q-6 14 0 10" fill="#22c55e" stroke="#15803d" strokeWidth="0.7" /></g>;
    default: return null;
  }
};

/**
 * game: oyuncunun oyun durumu (normalizeGame sonrası)
 * itemMap: id -> eşya
 * preview: { [slot]: itemId } (marketten denerken)
 * view: viewBox (ör. sadece kafayı büyük göstermek için)   fluid: kutuyu doldur
 */
export function Avatar({ game, itemMap, preview = {}, size = 160, className = '', bounce = false, style, view, fluid = false, outline = true, shading = true }) {
  const g = game || {};
  const get = (id) => (id && itemMap ? itemMap.get(id) : null);
  const eq = { ...(g.equip || {}), ...preview };
  const baseId = preview.base || g.base;
  const base = get(baseId) || { render: { kind: 'kid' } };
  const hairColorItem = get(preview.hairColor || g.hairColor);
  const hairColor = hairColorItem?.render?.color || '#5b3a1e';
  const skin = preview.skin || g.skin || SKIN_TONES[1];
  const hair = get(eq.hair);
  const top = get(eq.top);
  const bottom = get(eq.bottom);
  const shoes = get(eq.shoes);
  const hat = get(eq.hat);
  const acc = get(eq.accessory);
  const hideBottom = top && (top.render?.kind === 'dress' || top.render?.kind === 'gown' || top.coversBottom);
  const hatMode = hat ? (hat.hideHair || (['cap', 'beanie', 'cowboy', 'pirate', 'wizard', 'helmet', 'policehat', 'firehat', 'santa', 'chefhat', 'grad', 'sunhat', 'beret', 'propeller'].includes(hat.render?.kind) ? 'short' : 'none')) : 'none';
  const hatHidesHair = hatMode === 'short';
  const hk = hair?.render?.kind || 'short';
  const kind = base.render?.kind || 'kid';
  const bodyC = kind === 'robot' ? '#94a3b8' : (ANIMAL_SKIN[kind] || skin);
  // Yönetici karakteri: kıyafet ve kafa katmanlarını karaktere uydurma ayarları
  const cf = base.clothFit || {};
  const hf = base.headFit || {};
  const clothT = (cf.x || cf.y || (cf.sx && cf.sx != 1) || (cf.sy && cf.sy != 1))
    ? `translate(${Number(cf.x) || 0} ${Number(cf.y) || 0}) translate(100 176) scale(${Number(cf.sx) || 1} ${Number(cf.sy) || 1}) translate(-100 -176)` : undefined;
  const headT = (hf.x || hf.y || (hf.s && hf.s != 1))
    ? `translate(${Number(hf.x) || 0} ${Number(hf.y) || 0}) translate(100 64) scale(${Number(hf.s) || 1}) translate(-100 -64)` : undefined;
  const showClothes = !base.hidesClothes;
  const showHair = hair && hatMode !== 'all' && base.showHair !== false;
  const fid = `ca-ink-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const W = fluid ? '100%' : size;
  const H = fluid ? '100%' : size * 300 / 220;
  return (
    <svg viewBox={view || '-10 -40 220 300'} width={W} height={H} preserveAspectRatio="xMidYMid meet" className={`${className} ${bounce ? 'ca-bob' : ''}`} style={{ overflow: view ? 'hidden' : 'visible', ...style }}>
      <defs>
        {/* hacim: kumaş/saç/ten için yumuşak ışık-gölge (düz görünmesin) */}
        <filter id={`${fid}v`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b" />
          <feDiffuseLighting in="b" surfaceScale="2.6" diffuseConstant="1.28" lightingColor="#ffffff" result="d"><feDistantLight azimuth="235" elevation="52" /></feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="m" />
          <feSpecularLighting in="b" surfaceScale="2.6" specularConstant="0.3" specularExponent="16" lightingColor="#ffffff" result="sp"><feDistantLight azimuth="235" elevation="58" /></feSpecularLighting>
          <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2" />
          <feComposite in="m" in2="sp2" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
        <radialGradient id="gemShine" cx="0.35" cy="0.3" r="0.6"><stop offset="0" stopColor="#fff" stopOpacity="0.8" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      {outline && (
        <defs>
          <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="d" />
            <feFlood floodColor="#2b2233" result="c" />
            <feComposite in="c" in2="d" operator="in" result="o" />
            <feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      )}
      <ellipse cx="100" cy="252" rx="52" ry="8" fill="#000" opacity="0.12" />
      <g filter={outline ? `url(#${fid})` : undefined}>
        {showClothes && top && !top.image && <g transform={clothT}><g filter={shading ? `url(#${fid}v)` : undefined}><TopBack r={top.render || {}} /></g></g>}
        {showHair && !hair.image && !(hatHidesHair && hk === 'curly') && <g transform={headT}><g filter={shading ? `url(#${fid}v)` : undefined}><HairBack kind={hk} c={hairColor} /></g></g>}

        {base.image ? <ImageLayer item={base} slot="base" /> : (
          <g filter={shading ? `url(#${fid}v)` : undefined}>
            {/* gövde */}
            <rect x="76" y="182" width="22" height="58" rx="9" fill={bodyC} />
            <rect x="102" y="182" width="22" height="58" rx="9" fill={bodyC} />
            <rect x="44" y="116" width="22" height="64" rx="10" fill={bodyC} transform="rotate(8 55 118)" />
            <rect x="134" y="116" width="22" height="64" rx="10" fill={bodyC} transform="rotate(-8 145 118)" />
            <circle cx="50" cy="182" r="10" fill={kind === 'robot' ? '#64748b' : bodyC} />
            <circle cx="150" cy="182" r="10" fill={kind === 'robot' ? '#64748b' : bodyC} />
            <rect x="62" y="112" width="76" height="80" rx="18" fill={bodyC} />
            <rect x="90" y="98" width="20" height="20" fill={kind === 'robot' ? '#64748b' : bodyC} />
          </g>
        )}

        {showClothes && (
          <g transform={clothT}>
            {!hideBottom && bottom && (bottom.image ? <ImageLayer item={bottom} slot="bottom" baseId={baseId} /> : <g filter={shading ? `url(#${fid}v)` : undefined}><Bottom r={bottom.render || {}} /></g>)}
            {shoes && (shoes.image ? <ImageLayer item={shoes} slot="shoes" baseId={baseId} /> : <g filter={shading ? `url(#${fid}v)` : undefined}><Shoes r={shoes.render || {}} skin={skin} /></g>)}
            {top && (top.image ? <ImageLayer item={top} slot="top" baseId={baseId} /> : <g filter={shading ? `url(#${fid}v)` : undefined}><Top r={top.render || {}} /></g>)}
          </g>
        )}
        {!base.image && <g filter={shading ? `url(#${fid}v)` : undefined}><Head kind={kind} skin={skin} /></g>}
        <g transform={headT}>
          {showHair && (hair.image ? <ImageLayer item={hair} slot="hair" baseId={baseId} /> : <g><g filter={shading ? `url(#${fid}v)` : undefined}><HairFront kind={hatHidesHair && ['spiky', 'mohawk', 'bun', 'messy', 'curly', 'quiff', 'topknot', 'twinBuns', 'puffs'].includes(hk) ? 'short' : hk} c={hairColor} /></g><HairShine kind={hk} c={hairColor} />{hair.render?.clip && !hatHidesHair && (['long', 'wavy', 'longCurly', 'bob', 'bangs'].includes(hk) ? <Barrette c={hair.render.clip} x={126} y={34} /> : <Bow c={hair.render.clip} x={128} y={32} s={0.9} />)}</g>)}
          {acc && (acc.image ? <ImageLayer item={acc} slot="accessory" baseId={baseId} /> : <g filter={shading ? `url(#${fid}v)` : undefined}><Accessory r={acc.render || {}} /></g>)}
          {hat && (hat.image ? <ImageLayer item={hat} slot="hat" baseId={baseId} /> : <g filter={shading ? `url(#${fid}v)` : undefined}><Hat r={hat.render || {}} /></g>)}
        </g>
      </g>
    </svg>
  );
}
