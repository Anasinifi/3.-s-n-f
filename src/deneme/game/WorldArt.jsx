import React from 'react';
import { INK, seeded, blobPath, bezPoint, bezPath, Oak, Pine, Palm, Bush, Rock, Flowers, Mushroom, Cactus, Lollipop, CandyCane, Gumdrop, Fern, SnowRock, Penguin, Bones, Asteroid, Stump, Log, ArtByName, Cloud } from './MapArt';

// ============================================================================
// --- GRUP: 1000 DÜNYANIN ÇİZİMLERİ (tema tabanlı arazi, yol, ada, süsler) ---
// ============================================================================
// Her dünya (worlds.js) bir "tema" taşır: zemin renkleri, desen, ada tipi, yol tipi,
// serpiştirilecek süsler, adaların üstündeki simgeler, uzak manzara ve konsept
// (gece, kış, bahar, sonbahar, yağmur, festival, sis, büyülü...).
// Bütün çizimler SVG'dir. Her süsün (0,0) noktası yere bastığı ALT ORTA noktadır.

const K = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' };
const K2 = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' };
const SH = (rx = 22) => <ellipse cx="0" cy="1" rx={rx} ry={rx * 0.24} fill="#000" opacity="0.18" />;

// --- renk yardımcıları ---
const toRgb = (h) => { let c = String(h || '#888').replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); const n = parseInt(c, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { if (!a) return b; if (!b || !t) return a; const A = toRgb(a), B = toRgb(b); return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
export const darken = (c, t = 0.25) => mix(c, '#000000', t);
export const lighten = (c, t = 0.25) => mix(c, '#ffffff', t);

// ---------------------------------------------------------------------------
// SÜSLER (isimle çağrılır)
// ---------------------------------------------------------------------------
const D = {
  // --- AĞAÇLAR / BİTKİLER ---
  maple: ({ c = '#ea580c' }) => <g>{SH(26)}<path d="M-5 0 L-3 -34 L3 -34 L5 0 Z" fill="#7a4a24" {...K} />{[[0, -56, 24], [-18, -44, 18], [18, -44, 19], [-8, -68, 16], [10, -66, 15]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r + 2.5} fill={INK} />)}{[[0, -56, 24], [-18, -44, 18], [18, -44, 19], [-8, -68, 16], [10, -66, 15]].map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={i % 2 ? c : darken(c, 0.12)} />)}<circle cx="-8" cy="-64" r="7" fill="#fff" opacity="0.18" /></g>,
  bamboo: () => <g>{SH(20)}{[-10, 0, 10].map((x, i) => <g key={x}><rect x={x - 3.5} y={-70 + i * 8} width="7" height={70 - i * 8} rx="3" fill="#84cc16" {...K2} />{[-20, -38, -56].map(y => y > -70 + i * 8 && <path key={y} d={`M${x - 4} ${y} L${x + 4} ${y}`} stroke="#3f6212" strokeWidth="2" />)}<path d={`M${x + 3} ${-50 + i * 6} q12 -6 16 2 q-10 2 -16 -2 Z`} fill="#65a30d" stroke={INK} strokeWidth="1.5" /></g>)}</g>,
  baobab: () => <g>{SH(30)}<path d="M-14 0 Q-12 -30 -8 -44 L8 -44 Q12 -30 14 0 Z" fill="#a16207" {...K} /><path d="M-8 -44 L-20 -54 M8 -44 L20 -56 M0 -44 L0 -58" stroke="#a16207" strokeWidth="6" strokeLinecap="round" /><ellipse cx="0" cy="-64" rx="38" ry="12" fill={INK} /><ellipse cx="0" cy="-64" rx="35" ry="9.5" fill="#65a30d" /><ellipse cx="-10" cy="-67" rx="12" ry="3" fill="#a3e635" opacity="0.6" /></g>,
  acacia: () => <g>{SH(30)}<path d="M-2 0 L-2 -36 Q-14 -46 -22 -50 M-2 -36 Q8 -46 20 -52" stroke="#78350f" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M-40 -52 Q-30 -66 0 -66 Q30 -66 40 -52 Q20 -46 0 -48 Q-20 -46 -40 -52 Z" fill="#4d7c0f" {...K} /><path d="M-24 -60 Q0 -66 22 -60" stroke="#84cc16" strokeWidth="3" fill="none" opacity="0.7" /></g>,
  deadtree: () => <g>{SH(18)}<path d="M-5 0 L-3 -40 L3 -40 L5 0 Z" fill="#78716c" {...K} /><path d="M0 -38 L-14 -58 L-22 -60 M-14 -58 L-14 -70 M0 -38 L12 -56 L22 -62 M12 -56 L10 -70 M0 -40 L0 -64" stroke="#57534e" strokeWidth="4" fill="none" strokeLinecap="round" /></g>,
  giantflower: ({ c = '#f472b6' }) => <g><path d="M0 0 Q-3 -26 0 -50" stroke="#15803d" strokeWidth="4" fill="none" /><path d="M0 -20 q-14 -4 -16 6 q10 2 16 -6 Z" fill="#22c55e" stroke={INK} strokeWidth="1.5" />{Array.from({ length: 8 }).map((_, i) => <ellipse key={i} cx="0" cy="-64" rx="6" ry="13" fill={c} stroke={INK} strokeWidth="1.6" transform={`rotate(${i * 45} 0 -52)`} />)}<circle cx="0" cy="-52" r="8" fill="#facc15" stroke={INK} strokeWidth="2" /></g>,
  reeds: () => <g>{[-10, -3, 4, 11].map((x, i) => <g key={x}><path d={`M${x} 0 Q${x - 2} -20 ${x + (i % 2 ? 3 : -2)} -${36 + i * 4}`} stroke="#4d7c0f" strokeWidth="2.5" fill="none" /><rect x={x + (i % 2 ? 1 : -4)} y={-(48 + i * 4)} width="5" height="13" rx="2.5" fill="#78350f" stroke={INK} strokeWidth="1.2" /></g>)}</g>,
  lilypad: ({ c = '#f9a8d4' }) => <g><ellipse cx="0" cy="-2" rx="18" ry="7" fill="#22c55e" stroke={INK} strokeWidth="2" /><path d="M0 -2 L14 -6" stroke="#166534" strokeWidth="2" /><circle cx="-5" cy="-6" r="4" fill={c} stroke={INK} strokeWidth="1.2" /></g>,
  coral: ({ c = '#fb7185' }) => <g>{SH(18)}<path d="M0 0 L0 -26 M0 -18 L-12 -30 L-14 -42 M-12 -30 L-20 -34 M0 -22 L12 -36 L12 -48 M12 -36 L20 -40 M0 -26 L2 -44" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" /><path d="M0 0 L0 -26 M0 -18 L-12 -30 L-14 -42 M-12 -30 L-20 -34 M0 -22 L12 -36 L12 -48 M12 -36 L20 -40 M0 -26 L2 -44" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" /></g>,
  seaweed: ({ c = '#22c55e' }) => <g className="ca-sway" style={{ transformOrigin: '0px 0px' }}>{[-8, 0, 8].map((x, i) => <path key={x} d={`M${x} 0 Q${x - 8} -16 ${x} -30 Q${x + 8} -44 ${x} -${56 - i * 6}`} stroke={i === 1 ? darken(c, 0.2) : c} strokeWidth="5" fill="none" strokeLinecap="round" />)}</g>,
  glowshroom: ({ c = '#22d3ee' }) => <g><circle cx="0" cy="-22" r="22" fill={c} opacity="0.25" className="ca-glowpulse" /><rect x="-4" y="-18" width="8" height="18" rx="3" fill="#e0f2fe" {...K2} /><path d="M-18 -16 Q-18 -36 0 -36 Q18 -36 18 -16 Z" fill={c} {...K2} /><circle cx="-7" cy="-26" r="3" fill="#fff" opacity="0.8" /><circle cx="6" cy="-30" r="2" fill="#fff" opacity="0.8" /></g>,
  wheat: () => <g>{[-12, -6, 0, 6, 12].map((x, i) => <g key={x}><path d={`M${x} 0 Q${x + 2} -18 ${x + (i - 2) * 2} -34`} stroke="#ca8a04" strokeWidth="2" fill="none" />{[0, 1, 2, 3].map(k => <ellipse key={k} cx={x + (i - 2) * 2 + (k % 2 ? 2 : -2)} cy={-36 - k * 4} rx="2.4" ry="4" fill="#facc15" stroke="#a16207" strokeWidth="0.8" />)}</g>)}</g>,
  corn: () => <g>{SH(14)}{[-7, 7].map((x, i) => <g key={x}><path d={`M${x} 0 L${x} -${64 + i * 6}`} stroke="#4d7c0f" strokeWidth="4" /><path d={`M${x} -30 q-16 -6 -20 -20 M${x} -44 q14 -4 18 -18 M${x} -18 q14 -2 16 -12`} stroke="#65a30d" strokeWidth="4" fill="none" strokeLinecap="round" /><ellipse cx={x + 5} cy={-40 - i * 6} rx="4.5" ry="9" fill="#facc15" stroke={INK} strokeWidth="1.5" /></g>)}</g>,
  grapevine: () => <g>{SH(18)}<path d="M-16 0 L-16 -46 M16 0 L16 -46 M-20 -46 L20 -46" stroke="#78350f" strokeWidth="4" /><path d="M-18 -46 Q0 -54 18 -46" stroke="#4d7c0f" strokeWidth="6" fill="none" />{[[-8, -38], [6, -36]].map(([x, y], k) => <g key={k}>{[[0, 0], [-3, 4], [3, 4], [0, 8], [-2, 12], [2, 12]].map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={y + dy} r="2.6" fill="#7c3aed" stroke={INK} strokeWidth="0.8" />)}</g>)}</g>,
  alienplant: ({ c = '#a855f7' }) => <g>{[-10, 0, 10].map((x, i) => <g key={x}><path d={`M${x} 0 Q${x + (i - 1) * 6} -20 ${x + (i - 1) * 10} -${34 + (i === 1 ? 14 : 0)}`} stroke="#22c55e" strokeWidth="3.5" fill="none" /><circle cx={x + (i - 1) * 10} cy={-(38 + (i === 1 ? 14 : 0))} r={i === 1 ? 9 : 6} fill={c} {...K2} /><circle cx={x + (i - 1) * 10 - 2} cy={-(41 + (i === 1 ? 14 : 0))} r="2" fill="#fff" opacity="0.8" /></g>)}</g>,
  crystal: ({ c = '#a78bfa' }) => <g>{SH(20)}{[[-10, 0, 0.8, -12], [10, 0, 0.9, 14], [0, 0, 1.3, 0]].map(([x, y, s, r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><path d="M-7 0 L-8 -24 L0 -38 L8 -24 L7 0 Z" fill={c} {...K2} /><path d="M0 -38 L-2 0 M-8 -24 L8 -24" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" /><path d="M-4 -24 L-3 -6" stroke="#fff" strokeWidth="2" opacity="0.7" /></g>)}</g>,
  lavarock: () => <g>{SH(22)}<path d="M-22 0 Q-24 -16 -10 -22 Q4 -30 16 -20 Q26 -12 22 0 Z" fill="#292524" {...K} /><path d="M-12 -4 L-6 -14 L2 -10 L8 -18" stroke="#f97316" strokeWidth="2.5" fill="none" className="ca-glowpulse" /></g>,
  stalagmite: ({ c = '#8b7fae' }) => <g>{SH(16)}<path d="M-14 0 L-4 -44 L2 -44 L14 0 Z" fill={c} {...K} /><path d="M10 0 L16 -24 L20 0 Z" fill={darken(c, 0.15)} {...K2} /><path d="M-4 -40 L-8 -10" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" /></g>,
  geyser: () => <g><ellipse cx="0" cy="-3" rx="18" ry="6" fill="#78716c" {...K2} /><g className="ca-glowpulse"><path d="M-6 -4 Q-10 -40 0 -64 Q10 -40 6 -4 Z" fill="#bae6fd" opacity="0.85" /><circle cx="0" cy="-64" r="10" fill="#e0f2fe" opacity="0.9" /></g></g>,
  cherry: () => <ArtByName name="cherry" />,
  appletree: () => <ArtByName name="apple" />,
  orangetree: () => <ArtByName name="orange" />,
  birch: () => <ArtByName name="birch" />,
  willow: () => <ArtByName name="willow" />,
  sunflower: () => <ArtByName name="sunflower" />,
  tulips: ({ c }) => <ArtByName name="tulips" c={c || '#ef4444'} />,
  daisy: () => <ArtByName name="daisy" />,
  lavender: () => <ArtByName name="lavender" c="#a78bfa" />,
  roses: () => <ArtByName name="roses" c="#e11d48" />,
  hedge: () => <ArtByName name="hedge" />,
  oak: ({ r }) => <Oak hue={Math.floor((r?.() || 0) * 4)} />,
  pine: ({ r }) => <Pine hue={Math.floor((r?.() || 0) * 3)} />,
  snowpine: () => <Pine snow />,
  palm: ({ flip }) => <Palm flip={flip} />,
  bush: ({ c }) => <Bush c={c || '#4caf50'} />,
  flowerbush: ({ c }) => <Bush c={c || '#4caf50'} flowers />,
  rock: ({ c }) => <Rock c={c || '#9ca3af'} />,
  mossrock: () => <Rock moss />,
  flowers: ({ r }) => <Flowers s={1.3} seed={Math.floor((r?.() || 0) * 99)} />,
  mushroom: () => <Mushroom s={1.3} />,
  cactus: () => <Cactus />,
  lollipop: ({ c }) => <Lollipop c={c || '#f472b6'} />,
  candycane: () => <CandyCane />,
  gumdrop: ({ c }) => <Gumdrop c={c || '#22c55e'} />,
  fern: () => <Fern />,
  snowrock: () => <SnowRock />,
  penguin: () => <Penguin s={1.1} />,
  bones: () => <Bones />,
  asteroid: () => <Asteroid />,
  stump: () => <Stump />,
  log: () => <Log />,
  cloud: () => <g transform="translate(0 -30)"><Cloud s={0.7} /></g>,
  pumpkin: () => <ArtByName name="pumpkin" c="#f97316" />,
  snowman: () => <ArtByName name="snowman" />,
  umbrella: ({ c }) => <ArtByName name="umbrella" c={c || '#ef4444'} />,
  bench: () => <ArtByName name="bench" />,
  fountain: () => <ArtByName name="fountain" />,
  lamppost: () => <ArtByName name="lamppost" />,
  well: () => <ArtByName name="well" />,
  beehive: () => <ArtByName name="beehive" c="#facc15" />,
  scarecrow: () => <ArtByName name="scarecrow" />,
  swing: () => <ArtByName name="swing" c="#f43f5e" />,
  slide: () => <ArtByName name="slide2" c="#38bdf8" />,
  sandbox: () => <ArtByName name="sandbox" />,
  trampoline: () => <ArtByName name="trampoline" c="#22c55e" />,
  picnic: () => <ArtByName name="picnic" />,
  statue: () => <ArtByName name="statue" />,
  flag: ({ c }) => <ArtByName name="flag" c={c || '#ef4444'} />,
  birdhouse: () => <ArtByName name="birdhouse" c="#60a5fa" />,
  gnome: () => <ArtByName name="gnome" c="#ef4444" />,
  veggies: () => <ArtByName name="veggies" />,
  pond: () => <ArtByName name="pond" />,
  doghouse: () => <ArtByName name="doghouse" c="#fbbf24" />,
  mailbox: () => <ArtByName name="mailbox" c="#ef4444" />,

  // --- YAPILAR ---
  windmill: () => <g>{SH(20)}<path d="M-14 0 L-9 -50 L9 -50 L14 0 Z" fill="#f5f5f4" {...K} /><path d="M-11 -50 L0 -62 L11 -50 Z" fill="#b91c1c" {...K} /><rect x="-4" y="-14" width="8" height="14" fill="#7a4a24" {...K2} /><g transform="translate(0 -52)"><g className="ca-spin-slow" style={{ transformOrigin: '0 0' }}>{[0, 90, 180, 270].map(a => <g key={a} transform={`rotate(${a})`}><path d="M-2 0 L-2 -34 L8 -34 L6 0 Z" fill="#fde68a" {...K2} /><path d="M0 -6 L0 -32 M0 -18 L6 -18" stroke="#a16207" strokeWidth="1" /></g>)}</g><circle r="4" fill={INK} /></g></g>,
  lighthouse: () => <g>{SH(18)}<path d="M-10 0 L-7 -54 L7 -54 L10 0 Z" fill="#fff" {...K} />{[-12, -28, -44].map(y => <path key={y} d={`M-9 ${y} L9 ${y} L8.6 ${y - 7} L-8.6 ${y - 7} Z`} fill="#ef4444" />)}<rect x="-9" y="-66" width="18" height="12" fill="#fde047" {...K} className="ca-glowpulse" /><path d="M-11 -66 L0 -76 L11 -66 Z" fill="#ef4444" {...K} /></g>,
  hut: () => <g>{SH(26)}<path d="M-20 0 L-20 -24 L20 -24 L20 0 Z" fill="#c08457" {...K} /><path d="M-28 -22 L0 -44 L28 -22 Z" fill="#e2c275" {...K} />{[-18, -8, 2, 12].map(x => <path key={x} d={`M${x} -24 l-4 -8`} stroke="#b4924c" strokeWidth="2" />)}<rect x="-6" y="-14" width="12" height="14" fill="#7a4a24" {...K2} /></g>,
  castle: ({ c = '#e2e8f0' }) => <g>{SH(32)}<rect x="-26" y="-34" width="52" height="34" fill={c} {...K} />{[-26, -12, 2, 16].map(x => <rect key={x} x={x} y="-40" width="8" height="7" fill={c} {...K2} />)}<rect x="-34" y="-56" width="16" height="56" fill={darken(c, 0.06)} {...K} /><rect x="18" y="-56" width="16" height="56" fill={darken(c, 0.06)} {...K} /><path d="M-37 -56 L-26 -74 L-15 -56 Z M15 -56 L26 -74 L37 -56 Z" fill="#3b82f6" {...K} /><path d="M-8 0 L-8 -16 Q0 -24 8 -16 L8 0 Z" fill="#7a4a24" {...K2} /><path d="M26 -74 L26 -86" stroke={INK} strokeWidth="2" /><path d="M26 -86 L38 -82 L26 -78 Z" fill="#ef4444" className="ca-flag" /><rect x="-29" y="-46" width="6" height="8" rx="3" fill="#1e3a8a" /><rect x="23" y="-46" width="6" height="8" rx="3" fill="#1e3a8a" /></g>,
  tent: ({ c = '#f97316' }) => <g>{SH(26)}<path d="M-26 0 L0 -36 L26 0 Z" fill={c} {...K} /><path d="M0 -36 L-8 0 L8 0 Z" fill={darken(c, 0.35)} {...K2} /><path d="M0 -36 L0 -44" stroke={INK} strokeWidth="2.5" /><path d="M-26 0 L-34 4 M26 0 L34 4" stroke={INK} strokeWidth="1.5" /></g>,
  yurt: () => <g>{SH(28)}<path d="M-26 0 L-26 -20 Q0 -44 26 -20 L26 0 Z" fill="#fef3c7" {...K} /><path d="M-26 -20 Q0 -14 26 -20" stroke="#b91c1c" strokeWidth="4" fill="none" /><path d="M-6 0 L-6 -14 L6 -14 L6 0 Z" fill="#b91c1c" {...K2} /><circle cx="0" cy="-34" r="3" fill="#b91c1c" /></g>,
  pagoda: () => <g>{SH(26)}<rect x="-16" y="-20" width="32" height="20" fill="#fca5a5" {...K} /><path d="M-28 -18 Q0 -30 28 -18 L20 -26 L-20 -26 Z" fill="#b91c1c" {...K} /><rect x="-12" y="-42" width="24" height="16" fill="#fca5a5" {...K} /><path d="M-24 -40 Q0 -52 24 -40 L16 -48 L-16 -48 Z" fill="#b91c1c" {...K} /><rect x="-8" y="-60" width="16" height="12" fill="#fca5a5" {...K} /><path d="M-18 -58 Q0 -70 18 -58 L0 -76 Z" fill="#b91c1c" {...K} /><rect x="-4" y="-14" width="8" height="14" fill="#7c2d12" /></g>,
  pyramid: () => <g>{SH(32)}<path d="M-32 0 L0 -44 L32 0 Z" fill="#e7b75c" {...K} /><path d="M0 -44 L32 0 L8 0 Z" fill="#c9952f" /><path d="M-20 -16 L20 -16 M-12 -28 L12 -28" stroke="#b07c25" strokeWidth="2" /><path d="M-32 0 L0 -44 L32 0 Z" fill="none" {...K} /></g>,
  column: () => <g>{SH(14)}<rect x="-12" y="-6" width="24" height="6" fill="#e7e5e4" {...K2} /><rect x="-8" y="-50" width="16" height="44" fill="#f5f5f4" {...K2} />{[-4, 0, 4].map(x => <path key={x} d={`M${x} -48 L${x} -8`} stroke="#d6d3d1" strokeWidth="1.6" />)}<rect x="-13" y="-56" width="26" height="6" fill="#e7e5e4" {...K2} /></g>,
  ruins: () => <g>{SH(28)}<rect x="-26" y="-6" width="52" height="6" fill="#d6d3d1" {...K2} /><rect x="-22" y="-40" width="10" height="34" fill="#e7e5e4" {...K2} /><rect x="12" y="-26" width="10" height="20" fill="#e7e5e4" {...K2} /><path d="M-24 -40 L-8 -40 L-6 -46 L-24 -46 Z" fill="#d6d3d1" {...K2} /><path d="M-20 -30 q-6 4 -4 10 M18 -20 q6 2 4 8" stroke="#16a34a" strokeWidth="2.5" fill="none" /><rect x="-4" y="-12" width="12" height="6" fill="#a8a29e" {...K2} transform="rotate(-12)" /></g>,
  temple: () => <g>{SH(30)}<rect x="-26" y="-8" width="52" height="8" fill="#a8a29e" {...K2} /><rect x="-20" y="-16" width="40" height="8" fill="#a8a29e" {...K2} /><rect x="-14" y="-40" width="28" height="24" fill="#d6d3d1" {...K2} /><path d="M-18 -40 L0 -54 L18 -40 Z" fill="#78716c" {...K2} /><rect x="-5" y="-30" width="10" height="14" fill="#292524" /><path d="M-14 -40 q-8 12 -2 22 M14 -36 q8 6 4 18" stroke="#16a34a" strokeWidth="3" fill="none" /></g>,
  cottage: ({ c = '#fde68a' }) => <g>{SH(26)}<rect x="-20" y="-26" width="40" height="26" fill={c} {...K} /><path d="M-26 -24 L0 -46 L26 -24 Z" fill="#dc2626" {...K} /><rect x="-5" y="-14" width="10" height="14" fill="#7a4a24" {...K2} /><rect x="9" y="-20" width="8" height="8" fill="#bae6fd" {...K2} /><rect x="-17" y="-20" width="8" height="8" fill="#bae6fd" {...K2} /><rect x="10" y="-44" width="6" height="12" fill="#78716c" {...K2} /><g className="ca-smoke"><circle cx="13" cy="-50" r="4" fill="#e5e7eb" /></g></g>,
  barn: () => <g>{SH(28)}<path d="M-24 0 L-24 -26 L0 -42 L24 -26 L24 0 Z" fill="#dc2626" {...K} /><path d="M-26 -26 L0 -44 L26 -26" stroke="#fff" strokeWidth="3" fill="none" /><rect x="-9" y="-20" width="18" height="20" fill="#fff" {...K2} /><path d="M-9 -20 L9 0 M9 -20 L-9 0" stroke="#dc2626" strokeWidth="2.5" /><circle cx="0" cy="-30" r="4" fill="#fde68a" {...K2} /></g>,
  haystack: () => <g>{SH(22)}<path d="M-22 0 Q-24 -26 0 -32 Q24 -26 22 0 Z" fill="#facc15" {...K} />{[-14, -6, 2, 10].map(x => <path key={x} d={`M${x} -4 l3 -10`} stroke="#ca8a04" strokeWidth="1.6" />)}<path d="M-18 -16 Q0 -20 18 -16" stroke="#ca8a04" strokeWidth="2" fill="none" /></g>,
  igloo: () => <g>{SH(28)}<path d="M-26 0 Q-26 -30 0 -30 Q26 -30 26 0 Z" fill="#f8fafc" {...K} /><path d="M-26 -10 L26 -10 M-22 -20 L22 -20 M-8 -30 L-8 -20 M8 -30 L8 -20 M0 -20 L0 -10 M-14 -10 L-14 0 M14 -10 L14 0" stroke="#bfdbfe" strokeWidth="2" /><path d="M-8 0 Q-8 -12 0 -12 Q8 -12 8 0 Z" fill="#1e3a8a" {...K2} /></g>,
  mushroomhouse: ({ c = '#ef4444' }) => <g>{SH(26)}<path d="M-14 0 L-12 -24 L12 -24 L14 0 Z" fill="#fef3c7" {...K} /><path d="M-30 -22 Q-30 -54 0 -54 Q30 -54 30 -22 Z" fill={c} {...K} />{[[-16, -36, 5], [4, -44, 6], [18, -32, 4]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />)}<path d="M-5 0 L-5 -10 Q0 -16 5 -10 L5 0 Z" fill="#7a4a24" {...K2} /><circle cx="8" cy="-14" r="3" fill="#bae6fd" {...K2} /></g>,
  treehouse: () => <g>{SH(26)}<path d="M-6 0 L-4 -50 L4 -50 L6 0 Z" fill="#7a4a24" {...K} />{[[0, -66, 28], [-22, -52, 18], [22, -54, 18]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r + 2.5} fill={INK} />)}{[[0, -66, 28], [-22, -52, 18], [22, -54, 18]].map(([x, y, r], i) => <circle key={`g${i}`} cx={x} cy={y} r={r} fill="#4caf50" />)}<rect x="-16" y="-50" width="32" height="18" fill="#c08457" {...K2} /><path d="M-20 -48 L0 -62 L20 -48 Z" fill="#b91c1c" {...K2} /><rect x="-4" y="-46" width="8" height="10" fill="#5b3a1e" /><path d="M10 -32 L10 0 M16 -32 L16 0" stroke="#a16207" strokeWidth="1.6" />{[-26, -20, -14, -8].map(y => <path key={y} d={`M10 ${y} L16 ${y}`} stroke="#a16207" strokeWidth="1.6" />)}</g>,
  ferris: () => <g>{SH(28)}<path d="M-22 0 L0 -40 L22 0" stroke="#64748b" strokeWidth="4" fill="none" /><g transform="translate(0 -44)"><g className="ca-spin-slow" style={{ transformOrigin: '0 0', animationDuration: '18s' }}><circle r="32" fill="none" stroke="#f472b6" strokeWidth="3.5" />{Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M0 0 L${Math.cos(i * Math.PI / 4) * 32} ${Math.sin(i * Math.PI / 4) * 32}`} stroke="#94a3b8" strokeWidth="1.6" />)}{Array.from({ length: 8 }).map((_, i) => <rect key={`c${i}`} x={Math.cos(i * Math.PI / 4) * 32 - 5} y={Math.sin(i * Math.PI / 4) * 32 - 4} width="10" height="8" rx="2" fill={['#ef4444', '#facc15', '#22c55e', '#3b82f6'][i % 4]} stroke={INK} strokeWidth="1.4" />)}</g><circle r="4" fill={INK} /></g></g>,
  circustent: () => <g>{SH(30)}<path d="M-28 0 L-28 -22 L28 -22 L28 0 Z" fill="#fff" {...K} />{[-28, -14, 0, 14].map(x => <rect key={x} x={x} y="-22" width="7" height="22" fill="#ef4444" />)}<path d="M-28 0 L-28 -22 L28 -22 L28 0 Z" fill="none" {...K} /><path d="M-32 -20 L0 -50 L32 -20 Z" fill="#ef4444" {...K} /><path d="M-16 -20 L0 -50 L-4 -20 Z M8 -20 L0 -50 L16 -20 Z" fill="#fff" /><path d="M0 -50 L0 -60" stroke={INK} strokeWidth="2" /><path d="M0 -60 L10 -57 L0 -54 Z" fill="#facc15" className="ca-flag" /><path d="M-6 0 L0 -12 L6 0 Z" fill="#1e3a8a" /></g>,
  clocktower: () => <g>{SH(18)}<rect x="-12" y="-62" width="24" height="62" fill="#d6b88a" {...K} /><path d="M-15 -62 L0 -80 L15 -62 Z" fill="#475569" {...K} /><circle cx="0" cy="-48" r="8" fill="#fff" {...K2} /><path d="M0 -48 L0 -53 M0 -48 L4 -46" stroke={INK} strokeWidth="1.8" /><rect x="-5" y="-14" width="10" height="14" fill="#7a4a24" {...K2} /></g>,
  fairychimney: () => <g>{SH(22)}<path d="M-18 0 Q-14 -30 -8 -48 L8 -48 Q14 -30 18 0 Z" fill="#f2c79a" {...K} /><path d="M-14 -46 Q0 -64 14 -46 Q0 -42 -14 -46 Z" fill="#a16207" {...K2} /><rect x="-4" y="-12" width="8" height="12" rx="4" fill="#7a4a24" /><rect x="-10" y="-30" width="5" height="6" rx="2.5" fill="#7a4a24" /><rect x="5" y="-26" width="5" height="6" rx="2.5" fill="#7a4a24" /></g>,
  hotballoon: ({ c = '#ef4444' }) => <g className="ca-hover"><path d="M-8 -34 L-6 -22 M8 -34 L6 -22" stroke={INK} strokeWidth="1.5" /><rect x="-7" y="-22" width="14" height="10" rx="2" fill="#a16207" {...K2} /><path d="M-20 -60 Q-22 -86 0 -88 Q22 -86 20 -60 Q14 -42 0 -36 Q-14 -42 -20 -60 Z" fill={c} {...K} /><path d="M-8 -86 Q-12 -60 -4 -38 M8 -86 Q12 -60 4 -38" stroke="#fff" strokeWidth="3" fill="none" opacity="0.65" /></g>,
  travertine: () => <g>{[[0, 0, 34], [0, -10, 26], [0, -20, 18]].map(([x, y, r], i) => <g key={i}><path d={`M${-r} ${y} Q${-r} ${y - 8} 0 ${y - 9} Q${r} ${y - 8} ${r} ${y} Q0 ${y + 4} ${-r} ${y} Z`} fill="#f8fafc" {...K2} /><ellipse cx="0" cy={y - 5} rx={r - 6} ry="3" fill="#67e8f9" /></g>)}</g>,
  woodenhorse: () => <g>{SH(28)}<rect x="-26" y="-8" width="52" height="6" fill="#78350f" {...K2} />{[-20, 20].map(x => <circle key={x} cx={x} cy="-2" r="5" fill="#a16207" {...K2} />)}<path d="M-18 -8 L-16 -24 M-8 -8 L-8 -24 M8 -8 L8 -24 M18 -8 L16 -24" stroke="#a16207" strokeWidth="5" /><path d="M-22 -26 Q-22 -36 -10 -36 L14 -36 Q22 -36 22 -26 Z" fill="#c08457" {...K} /><path d="M14 -34 L18 -58 L30 -56 L28 -48 L20 -46 L20 -34 Z" fill="#c08457" {...K} /><path d="M16 -56 L12 -42" stroke="#78350f" strokeWidth="3" /><circle cx="24" cy="-52" r="1.6" fill={INK} /></g>,
  maidentower: () => <g><ellipse cx="0" cy="-2" rx="24" ry="7" fill="#a8a29e" {...K2} /><rect x="-10" y="-46" width="20" height="44" fill="#f5f5f4" {...K} /><rect x="-13" y="-52" width="26" height="6" fill="#e7e5e4" {...K2} /><path d="M-8 -52 L0 -66 L8 -52 Z" fill="#94a3b8" {...K2} /><path d="M0 -66 L0 -72" stroke={INK} strokeWidth="2" /><rect x="-3" y="-38" width="6" height="8" rx="3" fill="#1e3a8a" /><rect x="-3" y="-22" width="6" height="8" rx="3" fill="#1e3a8a" /></g>,
  domehouse: ({ c = '#bae6fd' }) => <g>{SH(28)}<rect x="-24" y="-20" width="48" height="20" fill="#f1f5f9" {...K} /><path d="M-18 -20 Q-18 -46 0 -46 Q18 -46 18 -20 Z" fill={c} {...K} /><path d="M0 -46 L0 -54" stroke={INK} strokeWidth="2" /><circle cx="0" cy="-56" r="3" fill="#facc15" {...K2} />{[-16, -6, 4, 14].map(x => <rect key={x} x={x} y="-14" width="4" height="8" rx="2" fill="#1e3a8a" />)}</g>,
  skyscraper: ({ c = '#93c5fd' }) => <g>{SH(18)}<rect x="-14" y="-78" width="28" height="78" fill={c} {...K} />{Array.from({ length: 6 }).map((_, i) => [-8, 2].map(x => <rect key={`${i}_${x}`} x={x} y={-72 + i * 12} width="6" height="7" fill="#fef9c3" opacity={(i + x) % 3 ? 0.9 : 0.4} />))}<rect x="-2" y="-90" width="4" height="12" fill="#64748b" /></g>,
  shop: ({ c = '#f472b6' }) => <g>{SH(24)}<rect x="-20" y="-28" width="40" height="28" fill="#fff7ed" {...K} /><path d="M-24 -28 L24 -28 L20 -38 L-20 -38 Z" fill={c} {...K2} />{[-16, -8, 0, 8].map(x => <path key={x} d={`M${x} -28 L${x + 4} -38`} stroke="#fff" strokeWidth="3" />)}<rect x="-14" y="-22" width="14" height="12" fill="#bae6fd" {...K2} /><rect x="4" y="-20" width="10" height="20" fill="#7a4a24" {...K2} /></g>,
  signpost: () => <g>{SH(10)}<rect x="-2.5" y="-46" width="5" height="46" fill="#7a4a24" {...K2} /><path d="M-2 -44 L22 -44 L28 -38 L22 -32 L-2 -32 Z" fill="#c08457" {...K2} /><path d="M2 -26 L-20 -26 L-26 -20 L-20 -14 L2 -14 Z" fill="#c08457" {...K2} /></g>,
  lantern: ({ c = '#fbbf24' }) => <g><circle cx="0" cy="-38" r="16" fill={c} opacity="0.3" className="ca-glowpulse" /><rect x="-1.5" y="-30" width="3" height="30" fill="#334155" /><path d="M-8 -48 L8 -48 L6 -30 L-6 -30 Z" fill={c} {...K2} /><path d="M-9 -48 L0 -54 L9 -48 Z" fill="#334155" {...K2} /></g>,
  torch: () => <g><rect x="-2.5" y="-30" width="5" height="30" fill="#7a4a24" {...K2} /><g className="ca-fire" style={{ transformOrigin: '0px -30px' }}><path d="M-6 -30 Q-8 -44 0 -52 Q8 -44 6 -30 Z" fill="#f97316" {...K2} /><path d="M-3 -30 Q-3 -40 0 -44 Q3 -40 3 -30 Z" fill="#fde047" /></g></g>,
  campfire: () => <g>{SH(16)}{[-14, -5, 5, 14].map((x, i) => <ellipse key={i} cx={x} cy={-3} rx="7" ry="4" fill="#78716c" stroke={INK} strokeWidth="1.6" />)}<path d="M-8 -4 L8 -12 M8 -4 L-8 -12" stroke="#7a4a24" strokeWidth="5" strokeLinecap="round" /><g className="ca-fire"><path d="M-8 -6 Q-10 -20 0 -30 Q4 -20 10 -22 Q10 -10 8 -6 Z" fill="#f97316" stroke={INK} strokeWidth="2" /><path d="M-3 -6 Q-4 -14 1 -20 Q4 -12 5 -6 Z" fill="#fde047" /></g></g>,
  balloons: () => <g className="ca-hover">{[[-10, -54, '#ef4444'], [4, -62, '#3b82f6'], [14, -50, '#facc15']].map(([x, y, c], i) => <g key={i}><path d={`M${x} ${y + 12} Q${x / 2} ${y + 30} 0 0`} stroke={INK} strokeWidth="1.2" fill="none" /><ellipse cx={x} cy={y} rx="9" ry="11" fill={c} {...K2} /><ellipse cx={x - 3} cy={y - 4} rx="2.5" ry="3.5" fill="#fff" opacity="0.6" /></g>)}</g>,
  bunting: () => <g><path d="M-30 0 L-30 -50 M30 0 L30 -50" stroke="#7a4a24" strokeWidth="3.5" /><path d="M-30 -46 Q0 -32 30 -46" stroke={INK} strokeWidth="1.5" fill="none" />{[-22, -12, -2, 8, 18].map((x, i) => { const y = -46 + 14 * (1 - ((x / 30) ** 2)) * 0.9; return <path key={x} d={`M${x - 4} ${y} L${x + 4} ${y} L${x} ${y + 9} Z`} fill={['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'][i]} stroke={INK} strokeWidth="1" />; })}</g>,
  kite: ({ c = '#f43f5e' }) => <g className="ca-hover"><path d="M0 0 Q-10 -30 6 -56" stroke={INK} strokeWidth="1.2" fill="none" /><path d="M6 -84 L20 -66 L6 -48 L-8 -66 Z" fill={c} {...K2} /><path d="M6 -84 L6 -48 M-8 -66 L20 -66" stroke="#fff" strokeWidth="1.5" /><path d="M6 -48 q-4 6 0 10 q4 4 0 8" stroke={INK} strokeWidth="1.2" fill="none" /></g>,
  rainbow: () => <g>{['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'].map((c, i) => <path key={c} d={`M${-34 + i * 4} 0 A${34 - i * 4} ${34 - i * 4} 0 0 1 ${34 - i * 4} 0`} fill="none" stroke={c} strokeWidth="4" />)}</g>,
  robot: () => <g>{SH(16)}<rect x="-12" y="-18" width="24" height="18" rx="4" fill="#94a3b8" {...K2} /><rect x="-10" y="-36" width="20" height="16" rx="5" fill="#cbd5e1" {...K2} /><circle cx="-4" cy="-28" r="2.6" fill="#22d3ee" className="ca-blink" /><circle cx="4" cy="-28" r="2.6" fill="#22d3ee" className="ca-blink" /><path d="M0 -36 L0 -42" stroke={INK} strokeWidth="2" /><circle cx="0" cy="-44" r="2.5" fill="#f43f5e" /><path d="M-12 -14 L-18 -6 M12 -14 L18 -6" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" /></g>,
  gear: ({ c = '#94a3b8' }) => <g transform="translate(0 -20)"><g className="ca-spin-slow" style={{ transformOrigin: '0 0' }}>{Array.from({ length: 8 }).map((_, i) => <rect key={i} x="-3.5" y="-22" width="7" height="8" fill={c} stroke={INK} strokeWidth="1.5" transform={`rotate(${i * 45})`} />)}<circle r="16" fill={c} {...K2} /><circle r="5" fill="#475569" /></g></g>,
  books: () => <g>{SH(18)}{[['#ef4444', 0, 30], ['#3b82f6', -8, 26], ['#22c55e', -16, 32], ['#facc15', -24, 24]].map(([c, y, w], i) => <g key={i}><rect x={-w / 2 + (i % 2 ? 2 : -2)} y={y - 8} width={w} height="8" rx="1.5" fill={c} {...K2} /><path d={`M${-w / 2 + (i % 2 ? 4 : 0)} ${y - 4} L${w / 2 - 2} ${y - 4}`} stroke="#fff" strokeWidth="1" opacity="0.6" /></g>)}</g>,
  pencil: () => <g>{SH(10)}<g transform="rotate(-8)"><rect x="-6" y="-60" width="12" height="52" fill="#facc15" {...K2} /><path d="M-6 -8 L0 4 L6 -8 Z" fill="#fde68a" {...K2} /><path d="M-2 -2 L0 4 L2 -2 Z" fill={INK} /><rect x="-6" y="-66" width="12" height="7" fill="#f472b6" {...K2} /></g></g>,
  blocks: () => <g>{SH(22)}{[[-12, 0, '#ef4444', 'A'], [10, 0, '#3b82f6', 'B'], [-1, -20, '#22c55e', 'C']].map(([x, y, c, l], i) => <g key={i}><rect x={x - 10} y={y - 20} width="20" height="20" rx="2" fill={c} {...K2} /><text x={x} y={y - 5} fontSize="13" fontWeight="900" textAnchor="middle" fill="#fff">{l}</text></g>)}</g>,
  teddy: () => <g>{SH(14)}<circle cx="-9" cy="-38" r="5" fill="#b45309" {...K2} /><circle cx="9" cy="-38" r="5" fill="#b45309" {...K2} /><ellipse cx="0" cy="-12" rx="12" ry="13" fill="#b45309" {...K2} /><circle cx="0" cy="-30" r="11" fill="#b45309" {...K2} /><ellipse cx="0" cy="-27" rx="5" ry="4" fill="#fde68a" /><circle cx="-4" cy="-32" r="1.5" fill={INK} /><circle cx="4" cy="-32" r="1.5" fill={INK} /><ellipse cx="0" cy="-11" rx="6" ry="7" fill="#fde68a" /></g>,
  drum: () => <g>{SH(16)}<rect x="-16" y="-24" width="32" height="20" fill="#ef4444" {...K2} /><ellipse cx="0" cy="-24" rx="16" ry="5" fill="#f8fafc" {...K2} /><path d="M-16 -20 L-8 -6 L0 -20 L8 -6 L16 -20" stroke="#facc15" strokeWidth="2" fill="none" /><path d="M6 -28 L20 -44 M-4 -28 L-14 -46" stroke="#a16207" strokeWidth="3" strokeLinecap="round" /></g>,
  notes: () => <g className="ca-hover">{[[-10, -30, '#a855f7'], [8, -46, '#ec4899']].map(([x, y, c], i) => <g key={i}><ellipse cx={x} cy={y} rx="5" ry="4" fill={c} {...K2} /><path d={`M${x + 4} ${y} L${x + 4} ${y - 18} L${x + 12} ${y - 14}`} stroke={INK} strokeWidth="2.5" fill="none" /></g>)}</g>,
  rocket: () => <g>{SH(14)}<path d="M0 -60 Q14 -44 12 -14 L-12 -14 Q-14 -44 0 -60 Z" fill="#f8fafc" {...K} /><circle cx="0" cy="-38" r="5" fill="#38bdf8" {...K2} /><path d="M-12 -24 L-20 -6 L-10 -10 Z M12 -24 L20 -6 L10 -10 Z" fill="#ef4444" {...K2} /><path d="M-6 -14 L-4 -4 L4 -4 L6 -14 Z" fill="#64748b" {...K2} /><path d="M-4 -4 Q0 8 4 -4 Z" fill="#fb923c" className="ca-flame" /></g>,
  satellite: () => <g transform="translate(0 -30)" className="ca-hover"><rect x="-6" y="-6" width="12" height="12" fill="#cbd5e1" {...K2} /><rect x="-30" y="-5" width="20" height="10" fill="#3b82f6" {...K2} /><rect x="10" y="-5" width="20" height="10" fill="#3b82f6" {...K2} /><path d="M-26 -5 L-26 5 M-18 -5 L-18 5 M14 -5 L14 5 M22 -5 L22 5" stroke="#bfdbfe" strokeWidth="1" /><path d="M0 -6 L0 -14" stroke={INK} strokeWidth="1.6" /><circle cx="0" cy="-15" r="2" fill="#ef4444" /></g>,
  ufo: () => <g className="ca-hover" transform="translate(0 -26)"><path d="M-10 4 L-18 22 M10 4 L18 22" stroke="#fde047" strokeWidth="6" opacity="0.4" /><ellipse cx="0" cy="0" rx="26" ry="8" fill="#94a3b8" {...K2} /><path d="M-12 -2 Q-12 -16 0 -16 Q12 -16 12 -2 Z" fill="#a5f3fc" {...K2} />{[-16, -6, 6, 16].map(x => <circle key={x} cx={x} cy="2" r="2" fill="#fde047" className="ca-blink" />)}</g>,
  moonflag: () => <g>{SH(10)}<path d="M0 0 L0 -50" stroke="#cbd5e1" strokeWidth="3" /><rect x="0" y="-50" width="22" height="14" fill="#ef4444" {...K2} /><circle cx="9" cy="-43" r="3.5" fill="#fff" /><circle cx="10.5" cy="-43" r="2.8" fill="#ef4444" /></g>,
  rover: () => <g>{SH(22)}<rect x="-20" y="-18" width="40" height="10" rx="3" fill="#e2e8f0" {...K2} />{[-14, 0, 14].map(x => <circle key={x} cx={x} cy="-5" r="5" fill="#475569" {...K2} />)}<rect x="-6" y="-30" width="12" height="12" fill="#cbd5e1" {...K2} /><path d="M6 -26 L18 -36" stroke={INK} strokeWidth="2" /><rect x="14" y="-40" width="10" height="5" fill="#3b82f6" {...K2} /></g>,
  dinoegg: () => <g>{SH(16)}<ellipse cx="0" cy="-16" rx="12" ry="16" fill="#fef3c7" {...K} />{[[-4, -24], [5, -14], [-5, -8]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill="#84cc16" />)}<path d="M-12 -14 L-6 -18 L-1 -12 L4 -18 L9 -13 L12 -16" stroke={INK} strokeWidth="1.6" fill="none" /></g>,
  obelisk: () => <g>{SH(14)}<rect x="-10" y="-6" width="20" height="6" fill="#a8a29e" {...K2} /><path d="M-7 -6 L-5 -56 L0 -64 L5 -56 L7 -6 Z" fill="#d6d3d1" {...K2} />{[-44, -32, -20].map(y => <path key={y} d={`M-3 ${y} L3 ${y}`} stroke="#78716c" strokeWidth="1.5" />)}</g>,
  chest: () => <g>{SH(20)}<rect x="-18" y="-18" width="36" height="18" rx="3" fill="#92400e" {...K2} /><path d="M-18 -18 Q-18 -32 0 -32 Q18 -32 18 -18 Z" fill="#b45309" {...K2} />{[-12, 8].map(x => <rect key={x} x={x} y="-32" width="4" height="32" fill="#facc15" />)}<rect x="-4" y="-22" width="8" height="8" rx="1.5" fill="#fde047" {...K2} /><g className="ca-glowpulse">{[-10, 0, 10].map(x => <circle key={x} cx={x} cy={-36 - Math.abs(x) / 2} r="2.4" fill="#fde047" />)}</g></g>,
  anchor: () => <g>{SH(12)}<path d="M0 -8 L0 -44" stroke="#475569" strokeWidth="5" /><circle cx="0" cy="-48" r="5" fill="none" stroke="#475569" strokeWidth="3.5" /><path d="M-10 -38 L10 -38" stroke="#475569" strokeWidth="4" /><path d="M-18 -18 Q-14 -2 0 -4 Q14 -2 18 -18" stroke="#475569" strokeWidth="5" fill="none" strokeLinecap="round" /></g>,
  shipwreck: () => <g>{SH(30)}<path d="M-30 -4 Q-24 6 0 4 Q24 2 30 -10 L22 -18 L-26 -12 Z" fill="#7a4a24" {...K} /><path d="M-4 -14 L-8 -52" stroke="#5b3a1e" strokeWidth="4" /><path d="M-8 -50 Q6 -42 -6 -26 Z" fill="#e7e5e4" opacity="0.8" {...K2} /><path d="M-18 -8 L-12 -8 M2 -10 L8 -10" stroke="#3f2a1d" strokeWidth="3" /></g>,
  pirateship: () => <g className="ca-bobboat"><path d="M-32 -10 L32 -10 L24 4 L-24 4 Z" fill="#92400e" {...K} /><path d="M-32 -10 L-36 -18 L-26 -12 Z" fill="#92400e" {...K2} /><path d="M0 -10 L0 -64" stroke="#5b3a1e" strokeWidth="3.5" /><path d="M2 -60 Q22 -48 2 -28 Z" fill="#f8fafc" {...K2} /><path d="M-2 -56 Q-20 -44 -2 -26 Z" fill="#f8fafc" {...K2} /><path d="M0 -64 L14 -60 L0 -56 Z" fill={INK} />{[-20, -8, 8, 20].map(x => <circle key={x} cx={x} cy="-3" r="2.5" fill={INK} />)}</g>,
  boat: ({ c = '#ef4444' }) => <g className="ca-bobboat"><path d="M-22 -6 L22 -6 L16 4 L-16 4 Z" fill={c} {...K2} /><path d="M0 -6 L0 -40" stroke="#5b3a1e" strokeWidth="2.5" /><path d="M2 -38 L20 -10 L2 -10 Z" fill="#fff" {...K2} /></g>,
  submarine: () => <g className="ca-hover" transform="translate(0 -14)"><ellipse cx="0" cy="0" rx="28" ry="12" fill="#facc15" {...K} /><rect x="-6" y="-20" width="14" height="10" rx="3" fill="#facc15" {...K2} /><path d="M4 -20 L4 -28 L10 -28" stroke={INK} strokeWidth="2" fill="none" />{[-14, -2, 10].map(x => <circle key={x} cx={x} cy="0" r="4" fill="#7dd3fc" {...K2} />)}<path d="M28 0 L36 -8 L36 8 Z" fill="#f59e0b" {...K2} /></g>,
  jellyfish: ({ c = '#f0abfc' }) => <g className="ca-hover" transform="translate(0 -20)"><path d="M-14 0 Q-14 -18 0 -18 Q14 -18 14 0 Z" fill={c} {...K2} opacity="0.9" />{[-10, -4, 2, 8].map(x => <path key={x} d={`M${x} 0 q-3 8 0 14 q3 6 0 12`} stroke={c} strokeWidth="2.5" fill="none" />)}<circle cx="-5" cy="-10" r="2" fill="#fff" opacity="0.8" /></g>,
  fish: ({ c = '#fb923c' }) => <g className="ca-hover" transform="translate(0 -18)">{[[0, 0, 1], [-18, 10, 0.7], [14, 12, 0.6]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path d="M-12 0 Q0 -10 12 0 Q0 10 -12 0 Z M12 0 L20 -7 L20 7 Z" fill={i === 1 ? '#38bdf8' : c} {...K2} /><circle cx="-5" cy="-2" r="1.6" fill={INK} /></g>)}</g>,
  crab: () => <g>{SH(14)}<ellipse cx="0" cy="-8" rx="14" ry="9" fill="#ef4444" {...K2} /><path d="M-12 -4 L-20 2 M-12 -8 L-22 -4 M12 -4 L20 2 M12 -8 L22 -4" stroke="#ef4444" strokeWidth="2.5" /><circle cx="-18" cy="-18" r="5" fill="#ef4444" {...K2} /><circle cx="18" cy="-18" r="5" fill="#ef4444" {...K2} /><path d="M-4 -16 L-4 -22 M4 -16 L4 -22" stroke={INK} strokeWidth="1.8" /><circle cx="-4" cy="-23" r="2" fill="#fff" stroke={INK} strokeWidth="1" /><circle cx="4" cy="-23" r="2" fill="#fff" stroke={INK} strokeWidth="1" /></g>,
  turtle: () => <g>{SH(18)}<path d="M-16 -2 Q-16 -22 0 -22 Q16 -22 16 -2 Z" fill="#16a34a" {...K2} /><path d="M-8 -16 L0 -10 L8 -16 M0 -10 L0 -2 M-12 -6 L-6 -10 M12 -6 L6 -10" stroke="#14532d" strokeWidth="1.5" fill="none" /><circle cx="20" cy="-8" r="5.5" fill="#86efac" {...K2} /><circle cx="22" cy="-9" r="1.2" fill={INK} /><path d="M-12 -2 L-14 4 M10 -2 L12 4" stroke="#86efac" strokeWidth="4" strokeLinecap="round" /></g>,
  whaletail: () => <g><ellipse cx="0" cy="-2" rx="22" ry="5" fill="#fff" opacity="0.6" className="ca-foam" /><path d="M-2 -2 Q0 -18 0 -24 Q-14 -30 -24 -24 Q-12 -22 -4 -16 M2 -2 Q0 -18 0 -24 Q14 -30 24 -24 Q12 -22 4 -16" fill="#475569" {...K2} /></g>,
  dolphin: () => <g className="ca-bobboat"><path d="M-20 -6 Q-6 -26 16 -14 Q22 -10 24 -6 L16 -8 Q4 -16 -12 -2 Z" fill="#60a5fa" {...K2} /><path d="M-2 -18 L2 -26 L6 -16" fill="#60a5fa" {...K2} /><circle cx="14" cy="-12" r="1.4" fill={INK} /></g>,
  starfish: ({ c = '#fb923c' }) => <g transform="translate(0 -8)"><path d="M0 -10 L3 -3 L10 -3 L4 1 L6 8 L0 4 L-6 8 L-4 1 L-10 -3 L-3 -3 Z" fill={c} {...K2} /></g>,
  shell: () => <g><path d="M-12 0 Q-14 -16 0 -18 Q14 -16 12 0 Z" fill="#fecdd3" {...K2} />{[-6, 0, 6].map(x => <path key={x} d={`M${x} 0 L${x / 2} -16`} stroke="#fb7185" strokeWidth="1.5" />)}</g>,
  sandcastle: () => <g>{SH(24)}<rect x="-18" y="-18" width="36" height="18" fill="#fcd34d" {...K2} />{[-18, -10, -2, 6, 14].map(x => <rect key={x} x={x} y="-22" width="4" height="4" fill="#fcd34d" {...K2} />)}<rect x="-8" y="-36" width="16" height="18" fill="#fcd34d" {...K2} /><path d="M0 -36 L0 -46" stroke={INK} strokeWidth="1.5" /><path d="M0 -46 L8 -43 L0 -40 Z" fill="#ef4444" /><path d="M-4 0 L-4 -8 Q0 -12 4 -8 L4 0 Z" fill="#b45309" /></g>,
  beachball: () => <g transform="translate(0 -10)"><circle r="10" fill="#fff" {...K2} /><path d="M0 -10 Q-8 0 0 10 M0 -10 Q8 0 0 10" stroke="#ef4444" strokeWidth="3" fill="none" /><path d="M-10 0 Q0 -4 10 0" stroke="#3b82f6" strokeWidth="3" fill="none" /></g>,
  cupcake: ({ c = '#f9a8d4' }) => <g>{SH(14)}<path d="M-12 -16 L12 -16 L9 0 L-9 0 Z" fill="#f59e0b" {...K2} />{[-6, 0, 6].map(x => <path key={x} d={`M${x} -16 L${x * 0.8} 0`} stroke="#b45309" strokeWidth="1.5" />)}<path d="M-14 -16 Q-16 -28 -6 -28 Q-4 -38 4 -34 Q14 -34 14 -24 Q16 -16 14 -16 Z" fill={c} {...K2} /><circle cx="2" cy="-38" r="4" fill="#ef4444" {...K2} /></g>,
  donut: ({ c = '#f472b6' }) => <g transform="translate(0 -14)">{SH(14)}<circle r="14" fill="#d97706" {...K2} /><path d="M-13 -3 Q-12 -14 0 -14 Q13 -14 13 -2 Q8 2 4 -2 Q0 4 -4 -1 Q-9 4 -13 -3 Z" fill={c} /><circle r="4.5" fill="#fde7f3" {...K2} />{[[-8, -6], [6, -8], [0, -11], [9, -2]].map(([x, y], i) => <rect key={i} x={x} y={y} width="3" height="1.5" fill={['#facc15', '#22c55e', '#3b82f6', '#fff'][i]} transform={`rotate(${i * 40} ${x} ${y})`} />)}</g>,
  icecream: ({ c = '#f9a8d4' }) => <g>{SH(8)}<path d="M-9 -24 L0 0 L9 -24 Z" fill="#f59e0b" {...K2} /><path d="M-6 -20 L3 -8 M6 -20 L-3 -8" stroke="#b45309" strokeWidth="1.2" /><circle cx="0" cy="-30" r="10" fill={c} {...K2} /><circle cx="-4" cy="-42" r="8" fill="#fef3c7" {...K2} /><circle cx="5" cy="-46" r="3" fill="#ef4444" {...K2} /></g>,
  cake: () => <g>{SH(22)}<rect x="-20" y="-16" width="40" height="16" rx="3" fill="#fbcfe8" {...K2} /><rect x="-14" y="-30" width="28" height="14" rx="3" fill="#fde68a" {...K2} /><path d="M-20 -14 q5 6 10 0 q5 6 10 0 q5 6 10 0 q5 6 10 0" stroke="#f472b6" strokeWidth="2.5" fill="none" />{[-6, 0, 6].map(x => <g key={x}><rect x={x - 1.2} y="-40" width="2.4" height="10" fill="#60a5fa" /><path d={`M${x} -40 q-2 -4 0 -6 q2 2 0 6`} fill="#f97316" className="ca-fire" /></g>)}</g>,
  cookie: () => <g transform="translate(0 -13)">{SH(13)}<circle r="13" fill="#d6a35c" {...K2} />{[[-5, -4], [4, -6], [6, 4], [-3, 6], [0, 0]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="#5b3a1e" />)}</g>,
  chocolate: () => <g>{SH(14)}<rect x="-14" y="-26" width="28" height="24" rx="2" fill="#7c2d12" {...K2} />{[-7, 7].map(x => [-20, -10].map(y => <rect key={`${x}${y}`} x={x - 5} y={y - 3} width="10" height="7" rx="1" fill="#9a3412" />))}<path d="M-14 -10 L14 -10 L14 -2 L-14 -2 Z" fill="#facc15" opacity="0.85" /></g>,
  watermelon: () => <g>{SH(18)}<path d="M-20 -2 A20 20 0 0 1 20 -2 Z" fill="#16a34a" {...K2} /><path d="M-16 -2 A16 16 0 0 1 16 -2 Z" fill="#f43f5e" />{[-8, -2, 4, 9].map((x, i) => <ellipse key={x} cx={x} cy={-6 - (i % 2) * 4} rx="1.3" ry="2" fill={INK} />)}</g>,
  strawberry: () => <g><path d="M-12 -22 Q-14 -6 0 0 Q14 -6 12 -22 Q0 -28 -12 -22 Z" fill="#ef4444" {...K2} /><path d="M-8 -24 L-4 -30 L0 -24 L4 -30 L8 -24 Z" fill="#16a34a" {...K2} />{[[-5, -16], [3, -18], [-1, -9], [6, -10]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="1" ry="1.6" fill="#fde047" />)}</g>,
  cheese: () => <g>{SH(18)}<path d="M-18 0 L-18 -14 L18 -26 L18 0 Z" fill="#facc15" {...K2} /><path d="M-18 -14 L18 -26 L10 -28 L-22 -16 Z" fill="#fde047" {...K2} />{[[-8, -6, 3], [6, -10, 4], [10, -4, 2]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#ca8a04" />)}</g>,
  teapot: () => <g>{SH(18)}<ellipse cx="0" cy="-14" rx="16" ry="13" fill="#ef4444" {...K2} /><path d="M16 -18 Q24 -22 26 -30" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" /><path d="M-16 -18 Q-26 -14 -16 -6" stroke="#ef4444" strokeWidth="4" fill="none" /><path d="M-8 -26 L8 -26 L4 -32 L-4 -32 Z" fill="#facc15" {...K2} /><path d="M-10 -14 L10 -14" stroke="#fff" strokeWidth="2" opacity="0.6" /></g>,
  teacup: () => <g>{SH(12)}<path d="M-10 -14 L10 -14 L8 -2 L-8 -2 Z" fill="#fff" {...K2} /><ellipse cx="0" cy="-14" rx="10" ry="3" fill="#b45309" {...K2} /><ellipse cx="0" cy="-1" rx="14" ry="3" fill="#fff" {...K2} /><g className="ca-smoke"><path d="M-2 -20 q-3 -6 0 -10" stroke="#e5e7eb" strokeWidth="2" fill="none" /></g></g>,
  gift: ({ c = '#ef4444' }) => <g>{SH(14)}<rect x="-12" y="-20" width="24" height="20" fill={c} {...K2} /><rect x="-14" y="-24" width="28" height="6" fill={darken(c, 0.1)} {...K2} /><rect x="-2" y="-24" width="4" height="24" fill="#facc15" /><path d="M0 -24 Q-10 -34 -6 -26 Z M0 -24 Q10 -34 6 -26 Z" fill="#facc15" {...K2} /></g>,
  xmastree: () => <g><Pine snow={false} />{[[-10, -30, '#ef4444'], [8, -38, '#facc15'], [-4, -52, '#3b82f6'], [12, -22, '#f472b6'], [-14, -18, '#facc15']].map(([x, y, c], i) => <circle key={i} cx={x} cy={y} r="3" fill={c} stroke={INK} strokeWidth="1" className={i % 2 ? 'ca-blink' : undefined} />)}<path d="M0 -84 L3 -78 L9 -78 L4 -74 L6 -68 L0 -72 L-6 -68 L-4 -74 L-9 -78 L-3 -78 Z" fill="#facc15" {...K2} /></g>,
  chessking: () => <g>{SH(14)}<rect x="-12" y="-6" width="24" height="6" rx="2" fill="#1f2937" {...K2} /><path d="M-8 -6 Q-6 -24 -10 -32 L10 -32 Q6 -24 8 -6 Z" fill="#374151" {...K2} /><rect x="-10" y="-38" width="20" height="6" rx="2" fill="#1f2937" {...K2} /><path d="M0 -38 L0 -50 M-5 -45 L5 -45" stroke="#1f2937" strokeWidth="3.5" /></g>,
  chessknight: () => <g>{SH(14)}<rect x="-12" y="-6" width="24" height="6" rx="2" fill="#f5f5f4" {...K2} /><path d="M-8 -6 L-6 -22 Q-12 -30 -6 -38 Q2 -48 10 -40 L12 -30 L6 -28 L8 -6 Z" fill="#fafaf9" {...K2} /><circle cx="2" cy="-36" r="1.6" fill={INK} /></g>,
  trainengine: () => <g>{SH(26)}<rect x="-24" y="-24" width="30" height="18" rx="3" fill="#ef4444" {...K2} /><rect x="2" y="-36" width="18" height="30" rx="3" fill="#3b82f6" {...K2} /><rect x="6" y="-32" width="10" height="8" fill="#bae6fd" {...K2} /><rect x="-18" y="-34" width="8" height="10" fill="#475569" {...K2} />{[-16, -2, 12].map(x => <circle key={x} cx={x} cy="-5" r="6" fill="#1f2937" {...K2} />)}<g className="ca-smoke"><circle cx="-14" cy="-42" r="5" fill="#e5e7eb" /></g></g>,
  minecart: () => <g>{SH(20)}<path d="M-18 -22 L18 -22 L14 -6 L-14 -6 Z" fill="#78716c" {...K2} />{[[-8, -26, '#facc15'], [2, -28, '#a78bfa'], [10, -25, '#facc15']].map(([x, y, c], i) => <path key={i} d={`M${x - 5} ${y + 4} L${x} ${y - 4} L${x + 5} ${y + 4} Z`} fill={c} {...K2} />)}{[-10, 10].map(x => <circle key={x} cx={x} cy="-4" r="4" fill="#374151" {...K2} />)}</g>,
  goldpile: () => <g>{SH(20)}<path d="M-20 0 Q-16 -18 0 -20 Q16 -18 20 0 Z" fill="#facc15" {...K2} />{[[-10, -6], [-2, -12], [8, -8], [2, -4], [-6, -14]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="4" ry="2.5" fill="#fde047" stroke="#a16207" strokeWidth="1" />)}<path d="M6 -20 L10 -28 L14 -20 Z" fill="#38bdf8" {...K2} /></g>,
  puddle: () => <g><ellipse cx="0" cy="-2" rx="20" ry="6" fill="#7dd3fc" opacity="0.8" /><ellipse cx="-4" cy="-3" rx="8" ry="1.6" fill="#fff" opacity="0.7" /><ellipse cx="6" cy="-2" rx="4" ry="1.4" fill="none" stroke="#fff" strokeWidth="1" className="ca-ripple" /></g>,
  leafpile: () => <g>{[[-10, -4, '#ea580c'], [0, -8, '#f59e0b'], [8, -3, '#dc2626'], [-3, -2, '#facc15'], [4, -5, '#ea580c']].map(([x, y, c], i) => <ellipse key={i} cx={x} cy={y} rx="7" ry="3.5" fill={c} stroke={INK} strokeWidth="1" transform={`rotate(${i * 35 - 40} ${x} ${y})`} />)}</g>,
  icecrystal: () => <g>{SH(20)}{[[-10, 0, 0.8, -12], [10, 0, 0.9, 14], [0, 0, 1.3, 0]].map(([x, y, s, r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><path d="M-7 0 L-8 -24 L0 -38 L8 -24 L7 0 Z" fill="#bae6fd" {...K2} /><path d="M-4 -24 L-3 -6" stroke="#fff" strokeWidth="2" opacity="0.8" /></g>)}</g>,
  icicles: () => <g>{SH(20)}<path d="M-22 0 Q-22 -16 -8 -18 Q8 -22 22 -10 L22 0 Z" fill="#e0f2fe" {...K2} />{[-14, -4, 6, 14].map((x, i) => <path key={x} d={`M${x - 3} -14 L${x} ${-34 - (i % 2) * 8} L${x + 3} -14 Z`} fill="#bae6fd" {...K2} />)}</g>,
  sled: () => <g>{SH(18)}<path d="M-20 -2 L18 -2 Q24 -2 24 -8" stroke="#475569" strokeWidth="3" fill="none" /><rect x="-18" y="-12" width="32" height="7" rx="2" fill="#dc2626" {...K2} /><path d="M-12 -5 L-12 -2 M8 -5 L8 -2" stroke="#475569" strokeWidth="2.5" /></g>,
  // --- HAYVANLAR ---
  frog: () => <g>{SH(14)}<ellipse cx="0" cy="-8" rx="13" ry="9" fill="#4ade80" {...K2} /><circle cx="-6" cy="-17" r="5" fill="#4ade80" {...K2} /><circle cx="6" cy="-17" r="5" fill="#4ade80" {...K2} /><circle cx="-6" cy="-17" r="2.2" fill={INK} /><circle cx="6" cy="-17" r="2.2" fill={INK} /><path d="M-6 -6 Q0 -2 6 -6" stroke="#166534" strokeWidth="1.6" fill="none" /></g>,
  duck: () => <g className="ca-bobboat"><path d="M-14 -6 Q-16 -18 -2 -16 L8 -16 Q16 -16 16 -8 Q14 0 0 0 Q-12 0 -14 -6 Z" fill="#fde047" {...K2} /><circle cx="10" cy="-22" r="7" fill="#fde047" {...K2} /><path d="M16 -22 L24 -20 L16 -18 Z" fill="#f97316" {...K2} /><circle cx="12" cy="-24" r="1.4" fill={INK} /><path d="M-8 -10 Q0 -6 6 -12" stroke="#ca8a04" strokeWidth="1.6" fill="none" /></g>,
  rabbit: () => <g>{SH(12)}<ellipse cx="0" cy="-10" rx="10" ry="10" fill="#f5f5f4" {...K2} /><circle cx="6" cy="-22" r="7" fill="#f5f5f4" {...K2} /><ellipse cx="3" cy="-36" rx="2.6" ry="9" fill="#f5f5f4" {...K2} /><ellipse cx="9" cy="-36" rx="2.6" ry="9" fill="#f5f5f4" {...K2} /><circle cx="9" cy="-23" r="1.4" fill={INK} /><circle cx="12" cy="-20" r="1.2" fill="#f472b6" /><circle cx="-9" cy="-10" r="3" fill="#fff" {...K2} /></g>,
  sheep: () => <g>{SH(18)}{[[-8, -16], [0, -20], [8, -16], [-4, -10], [6, -10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" fill="#fff" {...K2} />)}{[[-8, -16], [0, -20], [8, -16], [-4, -10], [6, -10]].map(([x, y], i) => <circle key={`i${i}`} cx={x} cy={y} r="6.6" fill="#fff" />)}<ellipse cx="16" cy="-16" rx="5" ry="6" fill="#374151" {...K2} /><circle cx="17" cy="-17" r="1.2" fill="#fff" /><path d="M-6 -4 L-6 0 M6 -4 L6 0" stroke="#374151" strokeWidth="3" /></g>,
  cow: () => <g>{SH(22)}<rect x="-18" y="-24" width="32" height="16" rx="7" fill="#fff" {...K2} /><path d="M-10 -24 Q-6 -16 -12 -10 M4 -22 Q8 -16 2 -12" fill="#1f2937" stroke="none" /><ellipse cx="-8" cy="-18" rx="5" ry="4" fill="#1f2937" /><ellipse cx="6" cy="-16" rx="4" ry="3" fill="#1f2937" /><rect x="12" y="-30" width="12" height="14" rx="5" fill="#fff" {...K2} /><ellipse cx="18" cy="-18" rx="6" ry="4" fill="#fda4af" {...K2} /><path d="M14 -30 L12 -34 M22 -30 L24 -34" stroke="#a16207" strokeWidth="2" /><path d="M-12 -8 L-12 0 M-2 -8 L-2 0 M8 -8 L8 0" stroke={INK} strokeWidth="3" /></g>,
  owl: () => <g>{SH(10)}<path d="M-12 0 Q-14 -28 0 -30 Q14 -28 12 0 Z" fill="#a16207" {...K2} /><path d="M-12 -26 L-14 -34 L-6 -28 M12 -26 L14 -34 L6 -28" fill="#a16207" {...K2} /><circle cx="-5" cy="-20" r="5" fill="#fef3c7" {...K2} /><circle cx="5" cy="-20" r="5" fill="#fef3c7" {...K2} /><circle cx="-5" cy="-20" r="2.2" fill={INK} /><circle cx="5" cy="-20" r="2.2" fill={INK} /><path d="M-2 -15 L0 -12 L2 -15 Z" fill="#f97316" /><ellipse cx="0" cy="-7" rx="6" ry="5" fill="#fde68a" /></g>,
  snail: () => <g>{SH(14)}<path d="M-16 0 Q-18 -6 -10 -6 L12 -6 Q18 -6 18 0 Z" fill="#fcd34d" {...K2} /><circle cx="0" cy="-14" r="11" fill="#f97316" {...K2} /><path d="M0 -14 m-6 0 a6 6 0 1 1 6 6 a3 3 0 1 1 -3 -3" stroke="#9a3412" strokeWidth="2" fill="none" /><path d="M14 -6 L16 -16 M18 -6 L22 -14" stroke="#fcd34d" strokeWidth="2" /><circle cx="16" cy="-17" r="1.6" fill={INK} /></g>,
  butterfly: ({ c = '#f472b6' }) => <g className="ca-hover" transform="translate(0 -30)"><g className="ca-flap"><path d="M0 0 Q-14 -16 -16 -2 Q-14 8 0 2 Z" fill={c} {...K2} /><path d="M0 0 Q14 -16 16 -2 Q14 8 0 2 Z" fill={c} {...K2} /></g><path d="M0 -6 L0 6" stroke={INK} strokeWidth="2.5" /></g>,
  bee: () => <g className="ca-hover" transform="translate(0 -28)"><ellipse cx="-3" cy="-8" rx="5" ry="7" fill="#e0f2fe" opacity="0.9" {...K2} /><ellipse cx="4" cy="-8" rx="5" ry="7" fill="#e0f2fe" opacity="0.9" {...K2} /><ellipse cx="0" cy="0" rx="9" ry="6.5" fill="#facc15" {...K2} /><path d="M-3 -6 L-3 6 M3 -6 L3 6" stroke={INK} strokeWidth="2.5" /></g>,
  ladybug: () => <g><path d="M-10 0 Q-10 -14 0 -14 Q10 -14 10 0 Z" fill="#ef4444" {...K2} /><path d="M0 -14 L0 0" stroke={INK} strokeWidth="1.5" /><circle cx="-5" cy="-6" r="2" fill={INK} /><circle cx="5" cy="-8" r="2" fill={INK} /><circle cx="10" cy="-4" r="4" fill={INK} /></g>,
  camel: () => <g>{SH(24)}<path d="M-20 -26 Q-16 -40 -8 -30 Q-2 -42 6 -30 Q10 -26 12 -26 L14 -40 Q16 -46 24 -44 L26 -38 L18 -36 L18 -20 Q10 -14 -14 -16 Q-22 -18 -20 -26 Z" fill="#d6a35c" {...K2} />{[-14, -6, 6, 12].map(x => <path key={x} d={`M${x} -16 L${x} 0`} stroke="#d6a35c" strokeWidth="4" />)}<circle cx="22" cy="-41" r="1.3" fill={INK} /></g>,
  flamingo: () => <g>{SH(10)}<path d="M0 0 L0 -22 M0 -22 L4 -14" stroke="#f472b6" strokeWidth="2" fill="none" /><ellipse cx="2" cy="-28" rx="11" ry="7" fill="#f9a8d4" {...K2} /><path d="M10 -30 Q16 -44 8 -52" stroke="#f9a8d4" strokeWidth="4" fill="none" strokeLinecap="round" /><circle cx="8" cy="-54" r="4" fill="#f9a8d4" {...K2} /><path d="M11 -54 L16 -50 L12 -50 Z" fill={INK} /></g>,
  polarbear: () => <g>{SH(22)}<ellipse cx="0" cy="-14" rx="20" ry="12" fill="#f8fafc" {...K2} /><circle cx="18" cy="-22" r="8" fill="#f8fafc" {...K2} /><circle cx="14" cy="-29" r="3" fill="#f8fafc" {...K2} /><circle cx="21" cy="-23" r="1.3" fill={INK} /><circle cx="25" cy="-20" r="1.6" fill={INK} />{[-12, -4, 6, 12].map(x => <path key={x} d={`M${x} -6 L${x} 0`} stroke="#e2e8f0" strokeWidth="5" />)}</g>,
  giraffe: () => <g>{SH(16)}<ellipse cx="-4" cy="-24" rx="14" ry="8" fill="#fbbf24" {...K2} /><path d="M6 -28 L14 -64" stroke={INK} strokeWidth="9" strokeLinecap="round" /><path d="M6 -28 L14 -64" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" /><ellipse cx="18" cy="-66" rx="7" ry="5" fill="#fbbf24" {...K2} /><path d="M14 -71 L13 -76 M18 -71 L19 -76" stroke={INK} strokeWidth="2" /><circle cx="19" cy="-67" r="1.3" fill={INK} />{[-12, -6, 2, 8].map(x => <path key={x} d={`M${x} -18 L${x} 0`} stroke="#fbbf24" strokeWidth="3" />)}{[[-8, -26], [0, -22], [8, -40], [11, -52]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill="#b45309" />)}</g>,
  elephant: () => <g>{SH(24)}<ellipse cx="-2" cy="-20" rx="20" ry="14" fill="#94a3b8" {...K2} /><circle cx="18" cy="-26" r="10" fill="#94a3b8" {...K2} /><ellipse cx="12" cy="-26" rx="7" ry="9" fill="#cbd5e1" {...K2} /><path d="M26 -22 Q30 -10 26 -2" stroke="#94a3b8" strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="20" cy="-29" r="1.4" fill={INK} />{[-14, -4, 6].map(x => <rect key={x} x={x - 3} y="-10" width="6" height="10" fill="#94a3b8" {...K2} />)}</g>,
  monkey: () => <g>{SH(12)}<path d="M8 -6 Q20 -10 18 -26" stroke="#92400e" strokeWidth="3" fill="none" /><ellipse cx="0" cy="-10" rx="8" ry="10" fill="#92400e" {...K2} /><circle cx="0" cy="-26" r="9" fill="#92400e" {...K2} /><circle cx="-9" cy="-26" r="3.5" fill="#fcd9b6" {...K2} /><circle cx="9" cy="-26" r="3.5" fill="#fcd9b6" {...K2} /><ellipse cx="0" cy="-24" rx="6" ry="5" fill="#fcd9b6" /><circle cx="-2.5" cy="-27" r="1.2" fill={INK} /><circle cx="2.5" cy="-27" r="1.2" fill={INK} /></g>,
  parrot: () => <g transform="translate(0 -6)"><path d="M-2 0 L-2 -10" stroke="#7a4a24" strokeWidth="3" /><path d="M-6 -10 Q-10 -26 0 -32 Q8 -28 6 -12 Z" fill="#ef4444" {...K2} /><path d="M-4 -12 L-8 4 L0 -6 Z" fill="#3b82f6" {...K2} /><path d="M4 -28 L10 -26 L5 -22 Z" fill="#facc15" {...K2} /><circle cx="1" cy="-27" r="1.3" fill={INK} /><path d="M-6 -20 Q-2 -16 4 -18" stroke="#facc15" strokeWidth="2.5" fill="none" /></g>,
  panda: () => <g>{SH(14)}<ellipse cx="0" cy="-10" rx="11" ry="10" fill="#f8fafc" {...K2} /><circle cx="0" cy="-26" r="9" fill="#f8fafc" {...K2} /><circle cx="-7" cy="-33" r="3.5" fill="#1f2937" /><circle cx="7" cy="-33" r="3.5" fill="#1f2937" /><ellipse cx="-3.5" cy="-27" rx="2.6" ry="3.2" fill="#1f2937" /><ellipse cx="3.5" cy="-27" rx="2.6" ry="3.2" fill="#1f2937" /><path d="M-10 -12 L-14 -4 M10 -12 L14 -4" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" /></g>,
  fox: () => <g>{SH(14)}<path d="M-14 -6 Q-28 -14 -22 -24 Q-14 -12 -8 -12" fill="#fb923c" {...K2} /><ellipse cx="0" cy="-10" rx="10" ry="8" fill="#fb923c" {...K2} /><path d="M2 -16 L10 -32 L12 -22 L18 -30 L18 -14 Q12 -10 4 -12 Z" fill="#fb923c" {...K2} /><path d="M14 -18 L20 -14 L12 -12 Z" fill="#fff" /><circle cx="13" cy="-20" r="1.2" fill={INK} /></g>,
  bird: () => <g className="ca-hover" transform="translate(0 -40)"><path d="M-12 0 Q-6 -8 0 0 Q6 -8 12 0" stroke={INK} strokeWidth="2.5" fill="none" className="ca-flap" /></g>,
  dragon: () => <g>{SH(20)}<path d="M-14 -8 Q-28 -10 -30 -22 Q-20 -16 -12 -16" fill="#4ade80" {...K2} /><ellipse cx="0" cy="-12" rx="14" ry="10" fill="#4ade80" {...K2} /><path d="M-4 -20 Q-8 -36 2 -34 L6 -20 Z" fill="#a7f3d0" {...K2} opacity="0.9" /><circle cx="12" cy="-24" r="8" fill="#4ade80" {...K2} /><circle cx="14" cy="-26" r="1.6" fill={INK} /><path d="M8 -32 L6 -38 M14 -32 L16 -38" stroke="#facc15" strokeWidth="2.5" /><path d="M20 -22 q6 -2 8 2" stroke="#f97316" strokeWidth="2.5" fill="none" className="ca-fire" /></g>,
};
export const DECOR_NAMES = Object.keys(D);

// Bir süsü adıyla çizer
export function Deco({ name, s = 1, flip = false, c, r }) {
  const fn = D[name];
  if (!fn) return <ArtByName name={name} s={s} c={c} />;
  return <g transform={`scale(${flip ? -s : s} ${s})`}>{fn({ c, r, flip })}</g>;
}

// ---------------------------------------------------------------------------
// ADA TEMELLERİ (tema tipine göre)
// ---------------------------------------------------------------------------
export function ThemeBase({ wt, seed, idx = 0 }) {
  const t = wt || {};
  const fill = t.baseFill || '#a8d97a';
  const stroke = t.baseStroke || darken(fill, 0.25);
  switch (t.base) {
    case 'island': {
      const sand = blobPath(66, 40, seed, 0.12);
      const grass = blobPath(48, 28, seed + 3, 0.16);
      return (
        <g>
          <ellipse cx="0" cy="8" rx="90" ry="56" fill={t.shallow || '#7fdcf3'} opacity="0.6" />
          <path d={blobPath(76, 48, seed + 9, 0.1)} fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="10 8" opacity="0.85" className="ca-foam" />
          <g transform="translate(0 7)"><path d={sand} fill={INK} transform="scale(1.04)" /></g>
          <path d={sand} fill={t.sand || '#fde7a3'} transform="translate(0 5)" />
          <path d={sand} fill={darken(t.sand || '#fde7a3', 0.06)} transform="translate(0 5) scale(0.98 0.9)" />
          <path d={grass} fill={INK} transform="translate(0 -4) scale(1.05)" />
          <path d={grass} fill={fill} transform="translate(0 -4)" />
          <path d={blobPath(32, 16, seed + 5, 0.2)} fill={lighten(fill, 0.2)} transform="translate(-10 -12)" />
        </g>
      );
    }
    case 'planet': {
      const cols = t.planetColors || [['#f97316', '#fdba74'], ['#3b82f6', '#93c5fd'], ['#a855f7', '#d8b4fe'], ['#22c55e', '#86efac'], ['#ef4444', '#fca5a5'], ['#eab308', '#fde047']];
      const [c, l] = cols[idx % cols.length];
      const r = seeded(seed);
      return (
        <g transform="translate(0 -18)">
          <circle r="52" fill={c} opacity="0.15" />
          {idx % 2 === 0 && <ellipse rx="62" ry="12" fill="none" stroke={l} strokeWidth="6" transform="rotate(-14)" opacity="0.9" />}
          <circle r="41" fill={INK} /><circle r="38" fill={c} />
          <path d="M-38 0 A38 38 0 0 0 38 0 A38 26 0 0 1 -38 0 Z" fill="#000" opacity="0.15" />
          {Array.from({ length: 4 }).map((_, i) => <circle key={i} cx={(r() - 0.5) * 44} cy={(r() - 0.5) * 44} r={3 + r() * 5} fill="#000" opacity="0.15" />)}
          <circle cx="-14" cy="-16" r="9" fill="#fff" opacity="0.3" />
          {idx % 2 === 0 && <path d="M-60 14 A62 12 0 0 0 60 -14" fill="none" stroke={l} strokeWidth="6" transform="rotate(-14)" />}
        </g>
      );
    }
    case 'cloud':
      return (
        <g>
          <ellipse cx="0" cy="22" rx="62" ry="10" fill="#000" opacity="0.08" />
          {[[-40, 0, 24], [-14, -10, 30], [16, -8, 28], [42, 2, 22], [0, 6, 30]].map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + 3} fill={INK} opacity="0.8" />)}
          {[[-40, 0, 24], [-14, -10, 30], [16, -8, 28], [42, 2, 22], [0, 6, 30]].map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={fill} />)}
          <ellipse cx="0" cy="-6" rx="46" ry="16" fill={lighten(fill, 0.4)} opacity="0.7" />
          <path d="M-36 18 Q0 26 36 18" stroke={darken(fill, 0.12)} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'floe':
      return (
        <g>
          <ellipse cx="0" cy="10" rx="84" ry="50" fill="#bfe3ff" opacity="0.5" />
          <path d={blobPath(66, 38, seed, 0.18, 10)} fill="#93c5fd" transform="translate(0 8)" />
          <path d={blobPath(66, 38, seed, 0.18, 10)} fill={INK} transform="translate(0 2) scale(1.03)" />
          <path d={blobPath(66, 38, seed, 0.18, 10)} fill="#f8fafc" />
          <path d={blobPath(30, 12, seed + 2, 0.2)} fill="#e0f2fe" transform="translate(-12 -8)" />
        </g>
      );
    case 'reef':
      return (
        <g>
          <path d={blobPath(70, 40, seed, 0.14)} fill={INK} transform="translate(0 4) scale(1.03)" />
          <path d={blobPath(70, 40, seed, 0.14)} fill={t.sand || '#fcd34d'} />
          {[[-46, -4, '#fb7185'], [44, 0, '#a78bfa'], [-30, 18, '#fb923c'], [34, 20, '#f472b6']].map(([x, y, c], i) => <g key={i} transform={`translate(${x} ${y}) scale(0.55)`}><Deco name="coral" c={c} /></g>)}
          <path d={blobPath(30, 12, seed + 2, 0.2)} fill="#fff" opacity="0.2" transform="translate(-12 -8)" />
        </g>
      );
    case 'rock':
    case 'plaza':
    case 'clearing':
    default: {
      const tile = t.base === 'plaza';
      return (
        <g>
          <path d={blobPath(66, 38, seed, tile ? 0.04 : 0.14)} fill={stroke} transform="translate(0 5)" />
          <path d={blobPath(64, 36, seed, tile ? 0.04 : 0.14)} fill={fill} />
          {tile && <path d={blobPath(48, 24, seed, 0.04)} fill="none" stroke={darken(fill, 0.12)} strokeWidth="3" strokeDasharray="8 6" />}
          {t.base === 'rock' && [[-30, 4], [24, -6], [6, 14]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l8 -6 l6 4`} stroke={darken(fill, 0.25)} strokeWidth="2" fill="none" />)}
          <path d={blobPath(28, 11, seed + 2, 0.2)} fill="#fff" opacity="0.18" transform="translate(-14 -10)" />
        </g>
      );
    }
  }
}

// Adanın üstündeki simge
export function ThemeLandmark({ wt, idx = 0 }) {
  const list = (wt?.landmarks && wt.landmarks.length) ? wt.landmarks : ['cottage'];
  const name = list[idx % list.length];
  const s = wt?.base === 'planet' ? 0.8 : 1.05;
  const y = wt?.base === 'planet' ? -54 : 0;
  return <g transform={`translate(0 ${y})`}><Deco name={name} s={s} c={wt?.landmarkColor} /></g>;
}

// ---------------------------------------------------------------------------
// YOL (adalar arası)
// ---------------------------------------------------------------------------
const PATHS = {
  dirt: [[INK, 38, 1], ['#d9bb80', 31, 1], ['#e9d3a0', 10, 0.6, '2 14']],
  sand: [['#c9952f', 28, 0.35], ['#fff3c4', 6, 0.9, '4 16']],
  ice: [[INK, 36, 1], ['#9fd8ff', 29, 1], ['#ffffff', 8, 0.8, '30 20']],
  choco: [[INK, 44, 1], ['#7b4a2a', 37, 1], ['#a0663e', 12, 0.7, '20 18']],
  mud: [[INK, 42, 1], ['#8a6a3a', 35, 1], ['#a3824a', 10, 0.6, '14 18']],
  lava: [[INK, 44, 1], ['#f97316', 37, 1], ['#fde047', 10, 0.8, '18 22']],
  orbit: [['#c4b5fd', 4, 0.9, '2 12']],
  foam: [['#e0f7ff', 5, 0.7, '1 14']],
  rainbow: [['#ef4444', 30, 0.85], ['#facc15', 20, 0.85], ['#22c55e', 11, 0.85], ['#3b82f6', 4, 0.85]],
  bubbles: [['#e0f2fe', 6, 0.8, '1 16']],
  mine: [[INK, 30, 1], ['#78716c', 24, 1], ['#a16207', 20, 1, '4 8'], ['#cbd5e1', 3, 1]],
  road: [[INK, 38, 1], ['#475569', 32, 1], ['#fde047', 3, 1, '14 12']],
  track: [[INK, 36, 1], ['#f472b6', 30, 1], ['#fff', 6, 1, '10 10']],
  boardwalk: [[INK, 30, 1], ['#a16207', 24, 1], ['#78350f', 24, 1, '3 9']],
  cobble: [[INK, 38, 1], ['#cbd5e1', 32, 1], ['#94a3b8', 22, 1, '6 8']],
  snowpath: [[INK, 36, 1], ['#f1f5f9', 30, 1], ['#cbd5e1', 6, 0.7, '2 14']],
  flowerpath: [[INK, 36, 1], ['#fde68a', 30, 1], ['#f472b6', 6, 0.9, '2 16']],
  cloudpath: [['#ffffff', 26, 0.9], ['#e0f2fe', 12, 0.9, '2 12']],
  water: [['#38bdf8', 34, 0.9], ['#bae6fd', 8, 0.8, '12 16']],
};
const STONES = {
  candy: (k) => <g key={k}><rect x="-11" y="-8" width="22" height="16" rx="7" fill="#fff" stroke={INK} strokeWidth="2.4" /><rect x="-11" y="-8" width="22" height="6" rx="3" fill="#fce7f3" /></g>,
  rock: (k) => <g key={k} transform="translate(0 6)"><Rock s={0.7} c="#57534e" /></g>,
  lily: (k) => <g key={k} transform="translate(0 4)"><Deco name="lilypad" s={0.9} /></g>,
  blocks: (k, i) => <g key={k}><rect x="-9" y="-9" width="18" height="18" rx="3" fill={['#ef4444', '#3b82f6', '#22c55e', '#facc15'][i % 4]} stroke={INK} strokeWidth="2.2" /></g>,
  cloud: (k) => <g key={k} transform="scale(0.35)"><Cloud /></g>,
  ice: (k) => <g key={k}><path d={blobPath(14, 8, 3, 0.2, 8)} fill="#f8fafc" stroke={INK} strokeWidth="2" /></g>,
  crater: (k) => <g key={k}><ellipse rx="12" ry="6" fill="#94a3b8" stroke={INK} strokeWidth="2" /><ellipse rx="7" ry="3" fill="#64748b" /></g>,
};
export function ThemePath({ wt, pts, openUpTo }) {
  if (pts.length < 2) return null;
  const style = PATHS[wt?.path] || PATHS.dirt;
  const segs = [];
  for (let i = 1; i < pts.length; i++) segs.push({ i, d: bezPath([pts[i - 1], pts[i]]), open: i <= openUpTo });
  const stone = STONES[wt?.stones];
  return (
    <g>
      {segs.map(sg => style.map(([c, w, o, dash], k) => (
        <path key={`${sg.i}_${k}`} d={sg.d} stroke={c} strokeWidth={w} strokeOpacity={sg.open ? o : o * 0.55} fill="none" strokeLinecap="round" strokeDasharray={dash}
          className={wt?.path === 'lava' && k === 2 ? 'ca-lavaflow' : undefined} />
      )))}
      {stone && segs.map(sg => [0.2, 0.35, 0.5, 0.65, 0.8].map((tt, j) => {
        const p = bezPoint(pts[sg.i - 1], pts[sg.i], tt);
        return <g key={`${sg.i}_${tt}`} transform={`translate(${p.x} ${p.y})`}>{stone(`s${sg.i}_${j}`, j)}</g>;
      }))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// ARAZİ: zemin + desen + uzak manzara + serpiştirilmiş süsler + konsept (gece, kış...)
// ---------------------------------------------------------------------------
const nearPath = (x, y, samples, d) => samples.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < d * d);

const pickWeighted = (list, r) => {
  const total = list.reduce((a, [, w]) => a + (w || 1), 0);
  let v = r() * total;
  for (const [n, w] of list) { v -= (w || 1); if (v <= 0) return n; }
  return list[list.length - 1][0];
};

function Pattern({ id, kind, c }) {
  const col = c || '#000';
  switch (kind) {
    case 'tuft': return <pattern id={id} width="46" height="40" patternUnits="userSpaceOnUse"><path d="M8 30 l3 -7 l3 7 M30 14 l3 -6 l3 6" stroke={col} strokeOpacity="0.14" strokeWidth="2" fill="none" /></pattern>;
    case 'wave': return <pattern id={id} width="70" height="34" patternUnits="userSpaceOnUse"><path d="M6 20 q8 -7 16 0 M40 6 q8 -7 16 0" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.5" fill="none" strokeLinecap="round" /></pattern>;
    case 'dune': return <pattern id={id} width="120" height="60" patternUnits="userSpaceOnUse"><path d="M0 40 Q30 22 60 40 T120 40" stroke={c || '#c9952f'} strokeOpacity="0.35" strokeWidth="3" fill="none" /></pattern>;
    case 'tiles': return <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse"><rect x="1" y="1" width="38" height="38" fill="none" stroke={col} strokeOpacity="0.12" strokeWidth="2" /></pattern>;
    case 'checker': return <pattern id={id} width="60" height="60" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill={col} opacity="0.08" /><rect x="30" y="30" width="30" height="30" fill={col} opacity="0.08" /></pattern>;
    case 'rows': return <pattern id={id} width="60" height="26" patternUnits="userSpaceOnUse"><path d="M0 13 L60 13" stroke={col} strokeOpacity="0.16" strokeWidth="6" /></pattern>;
    case 'strata': return <pattern id={id} width="200" height="50" patternUnits="userSpaceOnUse"><path d="M0 25 Q50 15 100 25 T200 25" stroke={col} strokeOpacity="0.18" strokeWidth="7" fill="none" /></pattern>;
    case 'cracks': return <pattern id={id} width="90" height="90" patternUnits="userSpaceOnUse"><path d="M10 20 l14 10 l-4 14 l16 8 M60 60 l10 -12 l14 4" stroke="#f97316" strokeOpacity="0.55" strokeWidth="2.5" fill="none" /></pattern>;
    case 'craters': return <pattern id={id} width="110" height="110" patternUnits="userSpaceOnUse"><ellipse cx="30" cy="30" rx="16" ry="9" fill="#000" opacity="0.14" /><ellipse cx="82" cy="78" rx="10" ry="6" fill="#000" opacity="0.12" /></pattern>;
    case 'dots': return <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="3" fill={col} opacity="0.14" /><circle cx="27" cy="27" r="2" fill={col} opacity="0.12" /></pattern>;
    case 'cobble': return <pattern id={id} width="34" height="24" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="14" height="9" rx="4" fill={col} opacity="0.1" /><rect x="18" y="13" width="14" height="9" rx="4" fill={col} opacity="0.1" /></pattern>;
    case 'sparkles': return <pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse"><path d="M20 20 l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 Z" fill="#fff" opacity="0.35" /></pattern>;
    default: return null;
  }
}

// Haritanın kenarlarındaki büyük manzara (yolun dışında kalır)
function SideScenery({ kind, W, H, r, c }) {
  if (!kind || kind === 'none') return null;
  const spots = [];
  for (let y = 260; y < H - 120; y += 520) spots.push({ y: y + r() * 160, left: r() < 0.5 });
  const draw = (k, i, left, y) => {
    const x = left ? -10 : W + 10;
    const sx = left ? 1 : -1;
    switch (k) {
      case 'mountains': return <g key={i} transform={`translate(${x} ${y}) scale(${sx} 1)`}><path d="M0 0 L40 -120 L80 -40 L110 -90 L150 0 Z" fill={c || '#94a3b8'} stroke={INK} strokeWidth="3" /><path d="M40 -120 L28 -84 L48 -92 L54 -100 Z M110 -90 L100 -66 L116 -72 Z" fill="#fff" /></g>;
      case 'hills': return <g key={i} transform={`translate(${x} ${y}) scale(${sx} 1)`}><path d="M0 0 Q40 -80 90 -40 Q120 -70 150 0 Z" fill={c || '#65a30d'} stroke={INK} strokeWidth="3" opacity="0.85" /></g>;
      case 'mesa': return <g key={i} transform={`translate(${x} ${y}) scale(${sx} 1)`}><path d="M0 0 L10 -90 L80 -90 L96 0 Z" fill={c || '#c2410c'} stroke={INK} strokeWidth="3" /><path d="M10 -60 L84 -60 M8 -30 L90 -30" stroke="#000" strokeOpacity="0.15" strokeWidth="6" /></g>;
      case 'volcano': return <g key={i} transform={`translate(${x} ${y}) scale(${sx} 1)`}><path d="M0 0 L50 -110 L76 -110 L130 0 Z" fill="#57534e" stroke={INK} strokeWidth="3" /><path d="M50 -110 L76 -110 L72 -80 Q64 -90 56 -76 Z" fill="#f97316" /><g className="ca-smoke"><circle cx="63" cy="-126" r="14" fill="#9ca3af" /></g></g>;
      case 'icebergs': return <g key={i} transform={`translate(${x} ${y}) scale(${sx} 1)`}><path d="M0 0 L20 -70 L54 -90 L80 -40 L110 0 Z" fill="#e0f2fe" stroke={INK} strokeWidth="3" /><path d="M20 -70 L40 -30 L54 -90" stroke="#bae6fd" strokeWidth="3" fill="none" /></g>;
      case 'skyline': return <g key={i} transform={`translate(${x} ${y}) scale(${sx} 1)`}>{[[0, 90, 26], [28, 130, 24], [54, 70, 30], [86, 110, 22]].map(([bx, h, w], k2) => <g key={k2}><rect x={bx} y={-h} width={w} height={h} fill={c || '#64748b'} stroke={INK} strokeWidth="2.5" />{Array.from({ length: Math.floor(h / 18) }).map((_, j) => <rect key={j} x={bx + 6} y={-h + 8 + j * 18} width={w - 12} height="6" fill="#fef9c3" opacity="0.7" />)}</g>)}</g>;
      case 'castle': return <g key={i} transform={`translate(${x + sx * 70} ${y}) scale(1.8)`}><Deco name="castle" /></g>;
      case 'pyramids': return <g key={i} transform={`translate(${x + sx * 60} ${y}) scale(2)`}><Deco name="pyramid" /></g>;
      case 'waterfall': return <g key={i} transform={`translate(${x} ${y}) scale(${sx} 1)`}><path d="M0 0 L0 -130 L70 -130 L90 0 Z" fill="#78716c" stroke={INK} strokeWidth="3" /><path d="M30 -130 L40 0 L64 0 L56 -130 Z" fill="#7dd3fc" /><path d="M36 -110 L42 -20 M50 -120 L54 -30" stroke="#fff" strokeWidth="3" className="ca-glowpulse" /><ellipse cx="52" cy="0" rx="34" ry="8" fill="#e0f2fe" opacity="0.8" className="ca-foam" /></g>;
      case 'trees': return <g key={i} transform={`translate(${x + sx * 30} ${y}) scale(1.6)`}><Oak hue={1} /><g transform={`translate(${sx * 26} 10)`}><Pine /></g></g>;
      case 'palms': return <g key={i} transform={`translate(${x + sx * 30} ${y}) scale(1.5)`}><Palm flip={!left} /></g>;
      case 'crystals': return <g key={i} transform={`translate(${x + sx * 40} ${y}) scale(2.2)`}><Deco name="crystal" c={c || '#a78bfa'} /></g>;
      case 'planet': return <g key={i} transform={`translate(${x + sx * 50} ${y - 60})`}><circle r="56" fill={c || '#f472b6'} stroke={INK} strokeWidth="3" /><ellipse rx="84" ry="16" fill="none" stroke="#fde68a" strokeWidth="6" transform="rotate(-18)" /><circle cx="-18" cy="-18" r="14" fill="#fff" opacity="0.25" /></g>;
      case 'reefwall': return <g key={i} transform={`translate(${x + sx * 30} ${y}) scale(1.8)`}><Deco name="coral" c="#fb7185" /><g transform={`translate(${sx * 24} 4)`}><Deco name="seaweed" /></g></g>;
      case 'clouds': return <g key={i} transform={`translate(${x + sx * 50} ${y - 40})`} className="ca-hover"><Cloud s={1.3} /></g>;
      case 'balloons': return <g key={i} transform={`translate(${x + sx * 50} ${y - 20}) scale(1.8)`}><Deco name="hotballoon" c={['#ef4444', '#3b82f6', '#facc15'][i % 3]} /></g>;
      case 'chimneys': return <g key={i} transform={`translate(${x + sx * 50} ${y}) scale(1.9)`}><Deco name="fairychimney" /><g transform={`translate(${sx * 26} 4) scale(0.8)`}><Deco name="fairychimney" /></g></g>;
      default: return null;
    }
  };
  return <g>{spots.map((sp, i) => draw(kind, i, sp.left, sp.y))}</g>;
}

// Gökyüzü / konsept üst katmanı (gece yıldızları, ay, güneş, gökkuşağı, aurora)
function SkyLayer({ wt, W, H, r }) {
  const v = wt?.variant || {};
  const items = [];
  if (v.sky === 'moon') items.push(<g key="moon" transform={`translate(${W * 0.82} 70)`}><circle r="26" fill="#fef9c3" opacity="0.35" /><circle r="18" fill="#fef3c7" stroke={INK} strokeWidth="2.5" /><circle cx="-5" cy="-4" r="3" fill="#fde68a" /><circle cx="6" cy="5" r="2" fill="#fde68a" /></g>);
  if (v.sky === 'sun') items.push(<g key="sun" transform={`translate(${W * 0.18} 64)`}><circle r="34" fill="#fde047" opacity="0.3" className="ca-glowpulse" /><circle r="22" fill="#fb923c" stroke={INK} strokeWidth="2.5" /></g>);
  if (v.sky === 'rainbow') items.push(<g key="rb" transform={`translate(${W * 0.5} 150) scale(${W / 120})`} opacity="0.7"><Deco name="rainbow" /></g>);
  if (v.sky === 'aurora') items.push(<g key="au" opacity="0.55">{[0, 1, 2].map(i => <path key={i} d={`M-20 ${90 + i * 30} Q${W * 0.3} ${20 + i * 30} ${W * 0.55} ${80 + i * 24} T${W + 20} ${60 + i * 26}`} stroke={['#4ade80', '#22d3ee', '#a78bfa'][i]} strokeWidth="18" fill="none" strokeLinecap="round" className="ca-glowpulse" style={{ animationDelay: `${i * 0.6}s` }} />)}</g>);
  if (v.stars) {
    const n = Math.ceil(W * H / 9000);
    items.push(<g key="st">{Array.from({ length: n }).map((_, i) => <circle key={i} cx={r() * W} cy={r() * H} r={r() * 1.4 + 0.5} fill="#fff" opacity={0.5 + r() * 0.5} className={i % 4 === 0 ? 'ca-twinkle2' : undefined} />)}</g>);
  }
  return <g>{items}</g>;
}

export function ThemeTerrain({ wt, W, H, pts, seed }) {
  const t = wt || {};
  const v = t.variant || {};
  const r = seeded(seed);
  const [c1, c2] = t.bg || ['#86c95a', '#4f9a2f'];
  // yol örnekleri
  const samples = [];
  for (let i = 1; i < pts.length; i++) for (let k = 0; k <= 10; k++) samples.push(bezPoint(pts[i - 1], pts[i], k / 10));
  const decorList = [...(t.decor || [['bush', 1]]), ...(v.decor || [])];
  const density = t.density ?? 0.42;
  const decor = [];
  const cell = 56;
  const avoidPath = !t.water && t.base !== 'planet' && t.base !== 'cloud';
  for (let y = 40; y < H + 20; y += cell) {
    for (let x = 0; x < W + 20; x += cell) {
      const jx = x + (r() - 0.5) * cell * 0.8, jy = y + (r() - 0.5) * cell * 0.8;
      if (r() > density) continue;
      if (pts.some(p => (p.x - jx) ** 2 + ((p.y - jy) * 1.4) ** 2 < 96 * 96)) continue;
      if (avoidPath && nearPath(jx, jy, samples, 38)) continue;
      decor.push({ x: jx, y: jy, key: `d${x}_${y}`, name: pickWeighted(decorList, r), s: 0.72 + r() * 0.5, flip: r() < 0.5 });
    }
  }
  decor.sort((a, b) => a.y - b.y);
  const gid = `wt_${seed}`;
  const tint = v.tint;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient>
        <Pattern id={`${gid}_p`} kind={t.pattern} c={t.patternColor} />
        {t.glowSpots && <radialGradient id={`${gid}_g`}><stop offset="0" stopColor={t.glowSpots} stopOpacity="0.5" /><stop offset="1" stopColor={t.glowSpots} stopOpacity="0" /></radialGradient>}
      </defs>
      <rect x="-40" y="-40" width={W + 80} height={H + 80} fill={`url(#${gid})`} />
      {t.pattern === 'wave'
        ? <g className="ca-wavesea"><rect x="-40" y="-40" width={W + 160} height={H + 80} fill={`url(#${gid}_p)`} /></g>
        : t.pattern && <rect x="-40" y="-40" width={W + 80} height={H + 80} fill={`url(#${gid}_p)`} />}
      {t.water && Array.from({ length: Math.ceil(H / 260) }).map((_, i) => <ellipse key={`w${i}`} cx={(i * 137) % W} cy={i * 260 + 120} rx="140" ry="70" fill={darken(c2, 0.15)} opacity="0.22" />)}
      {t.glowSpots && Array.from({ length: Math.ceil(H / 380) }).map((_, i) => <circle key={`gs${i}`} cx={(i * 211) % W} cy={i * 380 + 180} r="170" fill={`url(#${gid}_g)`} />)}
      {t.ponds && Array.from({ length: Math.ceil(H / 420) }).map((_, i) => <path key={`pd${i}`} d={blobPath(70, 30, seed + i, 0.2)} transform={`translate(${(i % 2 ? W * 0.12 : W * 0.88)} ${i * 420 + 220})`} fill="#38bdf8" stroke="#fff" strokeWidth="4" opacity="0.9" />)}
      <SideScenery kind={t.scenery} W={W} H={H} r={r} c={t.sceneryColor} />
      {decor.map(d => <g key={d.key} transform={`translate(${d.x} ${d.y})`}><Deco name={d.name} s={d.s} flip={d.flip} r={r} c={t.decorColor} /></g>)}
      {v.snowCover && <rect x="-40" y="-40" width={W + 80} height={H + 80} fill="#ffffff" opacity="0.18" />}
      {tint && <rect x="-40" y="-40" width={W + 80} height={H + 80} fill={tint[0]} opacity={tint[1]} />}
      <SkyLayer wt={t} W={W} H={H} r={r} />
    </g>
  );
}

// Sis katmanı (konsept: sisli sabah)
export function FogLayer({ W, H }) {
  return (
    <g pointerEvents="none" opacity="0.55">
      {Array.from({ length: Math.ceil(H / 300) }).map((_, i) => (
        <g key={i} className="ca-mist" style={{ animationDelay: `${-i * 1.3}s` }}>
          <ellipse cx={(i * 173) % W} cy={i * 300 + 140} rx={W * 0.55} ry="40" fill="#fff" opacity="0.6" />
        </g>
      ))}
    </g>
  );
}

// Haritanın görüntü önizlemesi (yönetici paneli / dünya galerisi için küçük kart)
// Gerçek harita ölçüsünde (360x230) çizilip küçültülür: süsler ve yol doğal oranda görünür.
export function WorldThumb({ wt, w = 160, h = 110, seed = 1 }) {
  const VW = 360, VH = 230;
  const pts = [{ x: VW * 0.26, y: VH * 0.8 }, { x: VW * 0.62, y: VH * 0.5 }, { x: VW * 0.36, y: VH * 0.16 }];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" style={{ borderRadius: 12, overflow: 'hidden', display: 'block' }}>
      <ThemeTerrain wt={wt} W={VW} H={VH} pts={pts} seed={seed} />
      <ThemePath wt={wt} pts={pts} openUpTo={1} />
      {pts.map((p, i) => <g key={i} transform={`translate(${p.x} ${p.y}) scale(0.62)`}><ThemeBase wt={wt} seed={seed + i} idx={i} /><g transform={`translate(${wt?.base === 'planet' ? 0 : -18} -4)`}><ThemeLandmark wt={wt} idx={i} /></g></g>)}
    </svg>
  );
}
