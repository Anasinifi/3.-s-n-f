// ============================================================================
// --- PROBLEM ÇÖZME ÇİZİMLERİ (2): oyuncak, ev, doğa, okul, şekil, yiyecek, bahçe ---
// ============================================================================
import { OL } from '../art';
import { C, P, L, R, Ci, E, star, starPts, heart } from './pdraw';

const dot = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const r1 = (n) => Math.round(n * 10) / 10;
const smile = (x, y, w = 8, sw = 2) => L(`M${x - w / 2},${y} Q${x},${y + w * 0.6} ${x + w / 2},${y}`, OL, sw);
const face = (x, y, s = 1) => dot(x - 4 * s, y - 3 * s, 1.8 * s, OL) + dot(x + 4 * s, y - 3 * s, 1.8 * s, OL) + smile(x, y + 2 * s, 9 * s, 2 * s);
const bow = (x, y, s = 1, c = C.red) => P(`M${x},${y} L${x - 8 * s},${y - 5 * s} L${x - 8 * s},${y + 5 * s} Z`, c, 1.5) + P(`M${x},${y} L${x + 8 * s},${y - 5 * s} L${x + 8 * s},${y + 5 * s} Z`, c, 1.5) + Ci(x, y, 2.2 * s, c, 1.5);
const flower = (x, y, r = 4, c = C.pink) => [0, 72, 144, 216, 288].map(a => { const t = a * Math.PI / 180; return dot(r1(x + Math.cos(t) * r), r1(y + Math.sin(t) * r), r1(r * 0.75), c); }).join('') + dot(x, y, r1(r * 0.55), C.yel);
const wheel = (x, y, r) => Ci(x, y, r, OL, 2) + Ci(x, y, r * 0.45, C.silver, 1.5);
const cloud = (x, y, s = 1, c = '#fff') => P(`M${x - 14 * s},${y + 6 * s} C${x - 22 * s},${y + 6 * s} ${x - 22 * s},${y - 6 * s} ${x - 12 * s},${y - 5 * s} C${x - 10 * s},${y - 14 * s} ${x + 4 * s},${y - 16 * s} ${x + 7 * s},${y - 7 * s} C${x + 18 * s},${y - 10 * s} ${x + 22 * s},${y + 6 * s} ${x + 12 * s},${y + 6 * s} Z`, c, 2);
const clip = (id, shape, inner) => `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`;
let uid = 0; const nid = (p) => `${p}x${++uid}`;
const RAINBOW = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#4f46e5', '#a855f7'];

export const DRAW2 = {
  // ======================= OYUNCAKLAR =======================
  top: (f) => {
    const c = f.kirmizi === false ? C.blue : C.red;
    const sh = f.yuvarlak === false ? 'M14,50 C14,28 86,28 86,50 C86,72 14,72 14,50 Z' : 'M14,50 C14,2 86,2 86,50 C86,98 14,98 14,50 Z';
    let s = P(sh, c);
    if (f.cizgi) s += clip(nid('tp'), sh, `<rect x="0" y="34" width="100" height="8" fill="#fff"/><rect x="0" y="58" width="100" height="8" fill="#fff"/>`) + P(sh, 'none');
    if (f.yildiz !== false) s += star(50, 50, 15, C.yel, 2);
    return s;
  },
  ayi: (f) => {
    const c = C.brown;
    let s = '';
    s += f.yuvarlakkulak === false ? P('M22,30 L26,8 L40,22 Z', c) + P('M78,30 L74,8 L60,22 Z', c) : Ci(26, 22, 10, c) + Ci(74, 22, 10, c) + Ci(26, 22, 5, C.tan, 0) + Ci(74, 22, 5, C.tan, 0);
    s += E(50, 78, 24, 18, c);
    s += Ci(50, 42, 26, c) + E(50, 52, 11, 8, C.tan, 2) + E(50, 48, 4, 3, OL, 0);
    s += L('M50,51 L50,55 M46,56 Q50,59 54,56', OL, 1.6);
    s += f.goz === false ? L('M36,38 q4,3 8,0 M56,38 q4,3 8,0', OL, 2) : dot(40, 37, 3.5, OL) + dot(60, 37, 3.5, OL) + dot(41, 36, 1, '#fff') + dot(61, 36, 1, '#fff');
    if (f.kurdele) s += bow(50, 66, 1.1, C.red);
    if (f.sapka) s += R(30, 12, 40, 6, OL, 2, 1.5) + R(38, 0, 24, 14, OL, 2, 1.5);
    return s;
  },
  blok: (f) => {
    const kare = f.kare !== false;
    const x = kare ? 22 : 32, w = kare ? 52 : 34, h = kare ? 52 : 66, y = kare ? 30 : 18;
    const cs = f.renkli ? [C.red, C.blue, C.green] : f.ahsap === false ? [C.blue, '#1d4ed8', '#60a5fa'] : [C.wood, '#b7853f', '#e9c08a'];
    let s = '';
    s += P(`M${x},${y} L${x + 12},${y - 12} L${x + w + 12},${y - 12} L${x + w},${y} Z`, cs[2]);
    s += P(`M${x + w},${y} L${x + w + 12},${y - 12} L${x + w + 12},${y + h - 12} L${x + w},${y + h} Z`, cs[1]);
    s += R(x, y, w, h, cs[0], 2);
    if (f.harfA !== false) s += `<text x="${x + w / 2}" y="${y + h / 2 + 2}" font-size="${kare ? 38 : 30}" font-weight="900" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" fill="${OL}">A</text>`;
    return s;
  },
  oyuncakaraba: (f) => {
    let s = '';
    if (f.ip !== false) s += L('M84,62 C92,70 90,84 98,92', OL, 2);
    s += R(16, 44, 68, 24, C.yel, 6);
    if (f.sofor) s += Ci(46, 34, 8, C.tan, 2) + R(38, 22, 16, 6, C.blue, 2, 1.4);
    s += R(28, 36, 30, 10, C.yel, 3, 2);
    if (f.gulen !== false) s += face(72, 56, 0.9);
    if (f.dortteker !== false) s += wheel(26, 70, 7) + wheel(42, 72, 7) + wheel(60, 72, 7) + wheel(76, 70, 7);
    else s += wheel(28, 70, 8) + wheel(72, 70, 8);
    return s;
  },
  ev: (f) => {
    let s = '';
    if (f.cati !== false) s += P('M10,46 L50,12 L90,46 Z', C.red);
    else s += R(16, 36, 68, 10, C.red, 1);
    s += R(20, 46, 60, 44, C.cream);
    const one = f.birpencere === true || f.ikipencere === false;
    if (f.kapi !== false) s += R(44, 64, 14, 26, C.brown, 2) + dot(54, 78, 1.6, C.yel);
    if (one) s += R(26, 54, 14, 14, C.sky, 1, 2) + L('M33,54 L33,68 M26,61 L40,61', OL, 1.4);
    else s += R(24, 54, 14, 14, C.sky, 1, 2) + R(64, 54, 13, 14, C.sky, 1, 2) + L('M31,54 L31,68 M24,61 L38,61 M70.5,54 L70.5,68 M64,61 L77,61', OL, 1.4);
    return s;
  },
  ucurtma: (f) => {
    let s = '';
    if (f.ip !== false) s += L('M50,64 C40,78 30,86 6,96', OL, 1.6);
    const tl = f.uzunkuyruk === false ? 'M50,64 C56,70 52,74 58,78' : 'M50,64 C60,72 52,80 62,86 C70,92 66,96 74,100';
    s += L(tl, OL, 2);
    s += f.elmas === false ? R(28, 10, 44, 44, C.pur) : P('M50,4 L76,32 L50,64 L24,32 Z', C.pur);
    s += f.elmas === false ? L('M28,10 L72,54 M72,10 L28,54', OL, 1.4) : L('M50,4 L50,64 M24,32 L76,32', OL, 1.4);
    if (f.fiyonk) (f.uzunkuyruk === false ? [[56, 72]] : [[57, 74], [58, 84], [69, 93]]).forEach(([x, y], k) => { s += bow(x, y, 0.55, [C.red, C.yel, C.green][k]); });
    return s;
  },
  gemi: (f) => {
    let s = '';
    s += L('M50,64 L50,8', OL, 3);
    if (f.bayrak) s += P('M50,8 L64,12 L50,16 Z', C.red, 1.5);
    if (f.yelken !== false) s += P('M52,14 C70,22 74,44 52,58 Z', f.kumas === false ? C.lgray : '#fff') + (f.kumas !== false ? L('M54,24 L64,26 M54,36 L68,38 M54,48 L64,48', C.sky, 1.2) : '');
    s += P('M8,62 L92,62 L80,84 L20,84 Z', C.blue);
    if (f.ahsap !== false) s += R(14, 56, 72, 6, C.wood, 1, 2) + L('M24,56 L24,62 M36,56 L36,62 M48,56 L48,62 M60,56 L60,62 M72,56 L72,62', C.brown, 1);
    if (f.capa) s += L('M28,66 L28,82 M22,78 Q28,86 34,78 M24,68 L32,68', '#fff', 2.2);
    return s;
  },
  robot: (f) => {
    const c = C.silver;
    let s = '';
    if (f.anten !== false) s += L('M50,16 L50,6', OL, 2) + Ci(50, 5, 3.5, C.red, 1.5);
    if (f.ayak !== false) s += R(36, 78, 10, 14, c, 2) + R(54, 78, 10, 14, c, 2);
    if (f.ikikol !== false) s += R(14, 46, 12, 8, c, 3, 2) + R(74, 46, 12, 8, c, 3, 2) + Ci(14, 50, 5, c, 2) + Ci(86, 50, 5, c, 2);
    s += R(26, 40, 48, 40, C.blue, 4);
    s += R(32, 16, 36, 24, c, 5) + Ci(42, 27, 4, '#fff', 1.6) + Ci(58, 27, 4, '#fff', 1.6) + dot(42, 27, 1.8, OL) + dot(58, 27, 1.8, OL) + R(42, 33, 16, 3, OL, 1, 1);
    if (f.dugme) s += Ci(40, 56, 4, C.red, 1.6) + Ci(50, 56, 4, C.yel, 1.6) + Ci(60, 56, 4, C.green, 1.6);
    return s;
  },
  yoyo: (f) => {
    let s = '';
    if (f.ip !== false) s += L('M50,48 L50,4', OL, 1.8) + Ci(50, 6, 3, 'none', 1.5);
    s += f.yuvarlak === false ? R(18, 46, 64, 50, C.green, 6) : Ci(50, 70, 28, C.green);
    if (f.sarmal) s += L('M50,70 m-4,0 a4,4 0 1,1 8,0 a8,8 0 1,1 -16,0 a12,12 0 1,1 24,0 a16,16 0 1,1 -32,0', '#fff', 2);
    if (f.delik !== false) s += Ci(50, 70, 5, '#fff', 2);
    return s;
  },
  kule: (f) => {
    let s = '';
    s += R(22, 86, 56, 8, C.wood, 2);
    if (f.cubuk !== false) s += R(47, 12, 6, 76, C.wood, 2, 2);
    const cols = f.renkli === false ? [C.blue, C.blue, C.blue, C.blue] : [C.red, C.yel, C.green, C.blue];
    if (f.dizili === false) [[22, 70, 16], [76, 72, 14], [28, 40, 12], [74, 40, 10]].forEach(([x, y, r], k) => { s += E(x, y, r, 6, cols[k], 2) + E(x, y, r * 0.35, 2, '#fff', 1); });
    else [[80, 16], [68, 14], [56, 12], [44, 10]].forEach(([y, rx], k) => { s += E(50, y, rx, 6, cols[k], 2); });
    if (f.top !== false) s += Ci(50, 14, 7, C.pur, 2);
    return s;
  },

  // ======================= EV EŞYALARI =======================
  sandalye: (f) => {
    let s = '';
    if (f.sirt !== false) s += R(26, 8, 6, 52, C.wood, 2) + R(68, 8, 6, 52, C.wood, 2) + R(26, 12, 48, 10, C.wood, 2) + R(26, 28, 48, 8, C.wood, 2);
    const legs = f.dortbacak === false ? [28, 66] : [26, 36, 62, 68];
    legs.forEach((x, k) => { s += R(x, 58, 6, 34 - (k === 1 || k === 2 ? 4 : 0), f.dortbacak === false ? C.wood : (k === 1 || k === 2 ? '#b7853f' : C.wood), 1, 2); });
    s += R(22, 54, 56, 8, C.wood, 2);
    if (f.minder) s += R(24, 46, 52, 10, C.red, 5);
    return s;
  },
  kupa: (f) => {
    const c = '#fff';
    let s = '';
    if (f.kulp !== false) s += P('M76,40 C94,40 94,70 74,70 L74,62 C84,62 84,48 74,48 Z', C.blue, 2);
    s += P('M22,30 L78,30 L74,86 C72,90 28,90 26,86 Z', C.blue);
    const full = f.cay || f.bos === false;
    s += E(50, 30, 28, 7, full ? '#b45309' : '#fff', 2.2);
    if (f.cicek) s += `${'' }` + [[38, 54], [56, 62], [44, 74], [62, 44]].map(([x, y]) => flower(x, y, 4, '#fff')).join('');
    void c;
    return s;
  },
  tv: (f) => {
    let s = '';
    if (f.anten) s += L('M50,20 L34,4 M50,20 L66,4', OL, 2) + Ci(34, 4, 2, OL, 1) + Ci(66, 4, 2, OL, 1);
    if (f.ikiayak !== false) s += L('M30,76 L24,90 M70,76 L76,90', OL, 3.5);
    s += R(8, 20, 84, 58, C.gray, 5);
    s += f.ekran === false ? E(42, 49, 28, 22, C.sky, 2) : R(14, 26, 62, 46, C.sky, 2, 2);
    if (f.tus !== false && f.tus !== undefined) s += Ci(84, 34, 3, OL, 1) + Ci(84, 44, 3, OL, 1) + Ci(84, 54, 3, OL, 1);
    if (f.kumanda) s += R(80, 82, 10, 16, OL, 2, 1.5) + dot(85, 86, 1.6, C.red) + dot(85, 92, 1.2, '#fff');
    return s;
  },
  dolap: (f) => {
    let s = '';
    if (f.ayna) s += E(50, 12, 18, 10, C.sky, 2);
    if (f.kisabacak !== false) [18, 30, 66, 76].forEach(x => { s += R(x, 84, 6, 10, C.brown, 1, 2); });
    s += R(14, 22, 72, 64, C.wood);
    const knob = (x, y) => (f.yuvarlakkulp === false ? R(x - 6, y - 1.5, 12, 3, OL, 1, 1) : Ci(x, y, 3, C.yel, 1.6));
    if (f.cekmece === false) s += L('M50,26 L50,82', OL, 2) + R(18, 26, 64, 56, 'none', 2, 2) + knob(44, 54) + knob(56, 54);
    else { const n = f.uccekmece === false ? 2 : 3; const h = 56 / n; for (let k = 0; k < n; k++) s += R(18, 26 + k * h + 1, 64, h - 2, C.wood, 2, 2) + knob(50, 26 + k * h + h / 2); }
    return s;
  },
  lamba: (f) => {
    let s = '';
    s += R(28, 86, 44, 8, C.gray, 3);
    s += f.ince === false ? R(40, 40, 20, 48, C.gray, 4) : R(47, 40, 6, 48, C.gray, 2, 2);
    s += (f.sapka === false || f.kumas === false) ? Ci(50, 34, 12, C.yel) : P('M30,44 L38,12 L62,12 L70,44 Z', C.ora) + (f.kumas !== false ? L('M36,24 L64,24 M33,34 L67,34', '#fdba74', 1.4) : '');
    if (f.zincir) s += L('M64,44 L64,62', OL, 1.4) + [48, 52, 56, 60].map(y => Ci(64, y, 1.4, 'none', 1)).join('') + Ci(64, 64, 2.5, C.yel, 1.2);
    if (f.dugme) s += R(56, 66, 8, 6, C.red, 1.5, 1.4);
    return s;
  },
  yatak: (f) => {
    let s = '';
    if (f.dortbacak !== false) [10, 22, 78, 88].forEach(x => { s += R(x, 74, 5, 16, C.brown, 1, 2); });
    else s += R(8, 74, 84, 10, C.brown, 2, 2);
    s += R(6, 30, 8, 50, C.brown, 2) + R(8, 56, 86, 20, C.wood, 3);
    if (f.ikiyastik !== false) s += R(16, 44, 20, 12, '#fff', 5, 2) + R(38, 44, 20, 12, '#fff', 5, 2);
    else s += R(18, 44, 24, 12, '#fff', 5, 2);
    if (f.battaniye) s += P('M46,52 L94,52 L94,70 L46,70 C42,64 42,58 46,52 Z', C.blue, 2) + L('M60,52 L60,70 M76,52 L76,70', '#93c5fd', 2);
    return s;
  },
  buzdolabi: (f) => {
    let s = '';
    s += R(20, 6, 60, 88, '#f1f5f9');
    if (f.ikikapi !== false) s += L('M20,36 L80,36', OL, 2.2);
    const kulp = f.kulp === false ? (y) => Ci(28, y + 4, 2.5, OL, 1) : (y, h) => R(24, y, 6, h, C.gray, 3, 1.8);
    s += f.ikikapi !== false ? kulp(14, 16) + kulp(44, 30) : kulp(30, 40);
    if (f.magnet) s += star(62, 20, 6, C.yel) + heart(66, 54, 0.8, C.red) + R(50, 66, 14, 10, C.sky, 1, 1.4) + Ci(57, 70, 2.5, C.yel, 1) + Ci(68, 80, 4, C.green, 1.4);
    return s;
  },
  hali: (f) => {
    const kare = f.kare !== false;
    const x = kare ? 18 : 6, w = kare ? 64 : 88, y = kare ? 18 : 30, h = kare ? 64 : 40;
    let s = '';
    if (f.sacak !== false) { for (let k = x + 3; k < x + w; k += 5) s += L(`M${k},${y} L${k},${y - 7} M${k},${y + h} L${k},${y + h + 7}`, OL, 1.4); }
    s += R(x, y, w, h, C.red, 2);
    s += R(x + 5, y + 5, w - 10, h - 10, 'none', 1, 1.6);
    if (f.desen !== false) { let d = `M${x + 8},${y + h / 2}`; for (let k = x + 8; k < x + w - 8; k += 8) d += ` L${k + 4},${y + h / 2 - 8} L${k + 8},${y + h / 2}`; s += L(d, C.yel, 3); }
    return s;
  },
  ayna: (f) => {
    let s = '';
    if (f.ip !== false) s += L('M26,30 L50,6 L74,30', OL, 2) + Ci(50, 6, 2.5, C.gray, 1);
    const frame = f.ahsap === false ? C.silver : f.renkli ? C.pink : C.wood;
    if (f.yuvarlak === false) s += R(18, 22, 64, 72, frame, 6) + R(26, 30, 48, 56, C.sky, 3, 2);
    else s += Ci(50, 60, 34, frame) + Ci(50, 60, 25, C.sky, 2);
    if (f.renkli && f.yuvarlak !== false) [0, 60, 120, 180, 240, 300].forEach((a, k) => { const t = a * Math.PI / 180; s += Ci(r1(50 + Math.cos(t) * 30), r1(60 + Math.sin(t) * 30), 3.5, [C.yel, C.green, C.blue, C.red, C.pur, C.ora][k], 1.2); });
    s += L(f.yuvarlak === false ? 'M34,40 L44,34 M34,50 L52,38' : 'M38,50 L48,42 M38,60 L56,46', '#fff', 2.5);
    return s;
  },
  akvaryum: (f) => {
    let s = '';
    const box = f.cam === false ? 'M28,14 C6,30 6,82 30,92 L70,92 C94,82 94,30 72,14 Z' : 'M10,16 L90,16 L90,90 L10,90 Z';
    if (f.su !== false) s += clip(nid('aq'), box, `<rect x="0" y="30" width="100" height="70" fill="#7dd3fc"/>`);
    if (f.tas) s += clip(nid('aqt'), box, [[18, 88, 6, C.gray], [30, 90, 5, '#a8a29e'], [70, 89, 6, '#78716c'], [82, 90, 5, C.gray], [50, 91, 4, '#a8a29e']].map(([x, y, r, c]) => Ci(x, y, r, c, 1.4)).join(''));
    if (f.balik !== false) s += P('M38,58 L28,50 L28,66 Z', C.ora, 1.6) + E(48, 58, 13, 9, C.ora, 2) + dot(54, 56, 1.6, OL);
    s += P(box, 'none', 3);
    if (f.su !== false) s += L(f.cam === false ? 'M14,30 Q30,26 50,30 T86,30' : 'M10,30 Q30,26 50,30 T90,30', '#0284c7', 1.6);
    return s;
  },

  // ======================= GÖKYÜZÜ - DOĞA =======================
  gunes: (f) => {
    const c = f.sari === false ? C.ora : C.yel;
    let s = '';
    if (f.isin !== false) for (let a = 0; a < 360; a += 30) { const t = a * Math.PI / 180; s += L(`M${r1(50 + Math.cos(t) * 30)},${r1(50 + Math.sin(t) * 30)} L${r1(50 + Math.cos(t) * 46)},${r1(50 + Math.sin(t) * 46)}`, '#f59e0b', 4); }
    s += Ci(50, 50, 26, c);
    if (f.gozluk) s += R(32, 38, 15, 10, OL, 4, 1) + R(53, 38, 15, 10, OL, 4, 1) + L('M47,42 L53,42', OL, 2);
    else if (f.gulen !== false) s += dot(41, 44, 2.8, OL) + dot(59, 44, 2.8, OL);
    if (f.gulen !== false) s += smile(50, 56, 18, 2.5);
    else s += L('M42,60 L58,60', OL, 2.5);
    return s;
  },
  bulut: (f) => {
    const c = f.mavi ? C.sky : f.beyaz === false ? C.gray : '#fff';
    let s = '';
    if (f.damla !== false && f.damla !== undefined) [[30, 72], [46, 82], [62, 72], [74, 86], [38, 92]].forEach(([x, y]) => { s += P(`M${x},${y - 6} C${x + 4},${y} ${x + 4},${y + 3} ${x},${y + 3} C${x - 4},${y + 3} ${x - 4},${y} ${x},${y - 6} Z`, C.blue, 1.4); });
    s += f.pofuduk === false ? E(50, 46, 40, 14, c) : P('M20,62 C4,62 4,40 20,40 C20,22 44,16 52,30 C60,14 88,20 84,40 C98,42 98,62 82,62 Z', c);
    return s;
  },
  yildiz: (f) => { // gökyüzü yıldızı
    const c = f.sari === false ? C.lgray : C.yel;
    let s = '';
    if (f.kuyruk) s += P('M40,60 L4,90 L12,94 L46,68 Z', C.ora, 1.8);
    if (f.parilti) s += L('M50,4 L50,10 M90,50 L84,50 M10,48 L16,48 M82,16 L76,22 M18,16 L24,22', '#f59e0b', 3);
    s += `<polygon points="${starPts(50, 52, 36, f.bes === false ? 4 : 5, f.bes === false ? 0.4 : 0.45)}" fill="${c}" stroke="${OL}" stroke-width="2.5" stroke-linejoin="round"/>`;
    return s;
  },
  ay: (f) => {
    const c = f.beyaz === false ? C.yel : C.lgray;
    let s = '';
    s += f.hilal === false ? Ci(50, 50, 34, c) : P('M58,10 C30,14 18,40 24,60 C30,82 54,94 76,86 C52,82 40,64 42,46 C44,30 52,18 58,10 Z', c);
    if (f.delik !== false) s += f.hilal === false ? Ci(40, 40, 6, C.silver, 1.6) + Ci(60, 58, 8, C.silver, 1.6) + Ci(42, 66, 4, C.silver, 1.4) : Ci(32, 50, 4.5, C.silver, 1.4) + Ci(40, 72, 4, C.silver, 1.4) + Ci(36, 32, 3, C.silver, 1.2);
    if (f.yildiz) s += star(76, 30, 9, C.yel, 1.6);
    return s;
  },
  gokkusagi: (f) => {
    const cols = f.renk === false ? ['#94a3b8', '#cbd5e1', '#94a3b8', '#cbd5e1', '#94a3b8', '#cbd5e1', '#94a3b8'] : f.yedirenk === false ? ['#ef4444', '#facc15', '#3b82f6'] : RAINBOW;
    let s = '';
    if (f.yarim === false) { const h = 42 / cols.length; cols.forEach((c, k) => { s += R(10, 30 + k * h, 80, h, c, 0, 1.4); }); }
    else { const w = 28 / cols.length; cols.forEach((c, k) => { const r = 42 - k * w; s += P(`M${r1(50 - r)},74 A${r1(r)},${r1(r)} 0 0,1 ${r1(50 + r)},74 L${r1(50 + r - w)},74 A${r1(r - w)},${r1(r - w)} 0 0,0 ${r1(50 - r + w)},74 Z`, c, 1.4); }); }
    if (f.bulut) s += cloud(f.yarim === false ? 12 : 15, f.yarim === false ? 50 : 74, 0.7) + cloud(f.yarim === false ? 88 : 85, f.yarim === false ? 50 : 74, 0.7);
    return s;
  },
  kartanesi: (f) => {
    const c = f.beyaz === false ? C.blue : f.beyaz ? '#fff' : f.buz === false ? C.brown : '#bae6fd';
    const n = f.alti === false ? 4 : 6;
    let s = '';
    if (f.parilti) s += L('M14,14 L22,22 M86,14 L78,22 M14,86 L22,78 M86,86 L78,78', '#38bdf8', 2.5);
    for (let k = 0; k < n; k++) {
      const a = (k * 360 / n - 90) * Math.PI / 180; const ex = 50 + Math.cos(a) * 38, ey = 50 + Math.sin(a) * 38;
      s += L(`M50,50 L${r1(ex)},${r1(ey)}`, OL, 6.5) + L(`M50,50 L${r1(ex)},${r1(ey)}`, c, 3.5);
      if (f.dantel !== false) [0.45, 0.72].forEach(t => { const mx = 50 + Math.cos(a) * 38 * t, my = 50 + Math.sin(a) * 38 * t; [-1, 1].forEach(sg => { const b = a + sg * 0.75; s += L(`M${r1(mx)},${r1(my)} L${r1(mx + Math.cos(b) * 9)},${r1(my + Math.sin(b) * 9)}`, OL, 1.6); }); });
    }
    s += Ci(50, 50, 6, c, 2);
    return s;
  },
  damla: (f) => {
    const c = f.mavi === false ? C.lgray : C.blue;
    let s = f.damla === false ? Ci(50, 56, 32, c) : P('M50,6 C62,30 84,46 84,64 C84,84 68,96 50,96 C32,96 16,84 16,64 C16,46 38,30 50,6 Z', c);
    if (f.gulen !== false) s += dot(41, 60, 3, OL) + dot(59, 60, 3, OL) + smile(50, 70, 16, 2.5);
    return s;
  },
  agac: (f) => {
    let s = '';
    s += f.govde === false ? R(44, 66, 12, 26, C.gray, 2) : P('M42,92 L44,52 L56,52 L58,92 Z', C.brown);
    if (f.yaprak !== false) s += P('M50,6 C70,4 90,20 86,40 C96,54 80,72 62,66 C54,76 34,74 30,64 C12,68 4,50 16,40 C10,22 30,6 50,6 Z', C.green);
    else s += L('M50,52 L34,30 M50,50 L66,28 M50,46 L50,20', C.brown, 4);
    if (f.elma !== false && f.elma !== undefined) [[34, 34], [60, 24], [70, 50], [44, 54], [24, 52]].forEach(([x, y]) => { s += Ci(x, y, 5, C.red, 1.6); });
    return s;
  },
  papatya: (f) => {
    let s = '';
    if (f.sap !== false) s += L('M50,52 C48,70 52,84 50,98', C.green, 4) + P('M50,80 C60,70 70,72 72,76 C64,82 56,82 50,80 Z', C.green, 1.6);
    const pc = f.beyazyaprak === false ? C.pink : '#fff';
    for (let a = 0; a < 360; a += 30) s += `<ellipse cx="50" cy="20" rx="6" ry="14" fill="${pc}" stroke="${OL}" stroke-width="1.8" transform="rotate(${a} 50 34)"/>`;
    s += Ci(50, 34, 10, f.sariorta === false ? C.brown : C.yel);
    if (f.ugur) s += E(66, 18, 7, 6, C.red, 1.6) + L('M66,12 L66,24', OL, 1.2) + dot(63, 16, 1.4, OL) + dot(69, 20, 1.4, OL) + Ci(72, 15, 2.5, OL, 0);
    return s;
  },
  yonca: (f) => {
    const c = f.yesil === false ? C.yel : C.green;
    let s = '';
    if (f.sap !== false) s += L('M50,52 C52,70 46,84 52,96', C.dgreen, 4);
    const n = f.ucyaprak === false ? 4 : 3;
    for (let k = 0; k < n; k++) { const a = -90 + k * 360 / n; s += `<g transform="rotate(${a + 90} 50 50)">${heart(50, 30, 2.3, c, 2)}</g>`; }
    s += Ci(50, 50, 3, C.dgreen, 1.2);
    return s;
  },
  simsek: (f) => {
    let s = '';
    if (f.bulut) s += cloud(50, 18, 1.5, C.gray);
    s += f.zikzak === false ? P('M44,26 L58,26 L56,96 L46,96 Z', f.sari === false ? C.blue : C.yel) : P('M56,26 L34,60 L50,60 L40,96 L72,50 L56,50 L66,26 Z', f.sari === false ? C.blue : C.yel);
    return s;
  },
  gezegen: (f) => {
    let s = '';
    if (f.halka !== false) s += P('M6,58 C6,46 94,40 94,52 C94,56 84,60 72,62 L72,56 C82,54 86,52 84,50 C70,46 18,54 16,58 Z', C.yel, 1.8);
    s += f.yuvarlak === false ? E(50, 52, 34, 22, C.pur) : Ci(50, 52, 28, C.pur);
    if (f.halka !== false) s += P('M16,58 C30,66 78,62 84,52 L94,52 C94,64 6,70 6,58 Z', C.yel, 1.8);
    if (f.benek) s += Ci(40, 40, 5, '#c084fc', 1.2) + Ci(60, 48, 3.5, '#c084fc', 1.2) + Ci(52, 70, 4, '#c084fc', 1.2);
    return s;
  },
  kuyrukluyildiz: (f) => {
    let s = '';
    if (f.ates !== false) s += P('M62,34 L6,88 L22,94 L74,52 Z', C.ora, 2) + P('M64,40 L18,84 L28,86 L70,50 Z', C.yel, 1.4);
    if (f.yildiz) s += star(18, 22, 7, C.yel) + star(86, 82, 6, C.yel) + star(30, 50, 4, C.yel);
    s += f.yuvarlak === false ? `<polygon points="${starPts(72, 32, 18, 5)}" fill="${C.yel}" stroke="${OL}" stroke-width="2.5" stroke-linejoin="round"/>` : Ci(72, 32, 16, C.yel);
    return s;
  },

  // ======================= OKUL EŞYALARI =======================
  kalem: (f) => {
    let s = '';
    const body = f.ahsap === false ? C.blue : C.yel;
    s += R(14, 40, 62, 20, body, 0);
    if (f.cizgi) s += L('M14,47 L76,47 M14,53 L76,53', '#ca8a04', 2);
    if (f.silgi !== false) s += R(4, 40, 12, 20, C.pink, 3) + R(13, 38, 6, 24, C.silver, 1, 2);
    s += f.sivri === false ? R(76, 40, 12, 20, C.wood, 2) : P('M76,40 L96,50 L76,60 Z', C.wood);
    if (f.sivri !== false) s += P('M84,44 L96,50 L84,56 Z', f.siyahuc === false ? C.red : OL, 1.4);
    return s;
  },
  defter: (f) => {
    let s = '';
    if (f.ikikapak === false) { s += R(22, 12, 56, 76, C.blue, 3); if (f.yildiz) s += star(50, 50, 14, C.yel, 2); if (f.yazi) s += L('M32,26 L68,26 M32,34 L60,34', '#fff', 3); return s; }
    s += R(4, 18, 46, 70, C.blue, 3) + R(50, 18, 46, 70, C.blue, 3);
    if (f.sayfa !== false) { const pc = f.beyazsayfa === false ? '#fef08a' : '#fff'; s += R(8, 22, 41, 62, pc, 1, 1.6) + R(51, 22, 41, 62, pc, 1, 1.6); }
    if (f.beyazsayfa === false) s += L('M12,34 L46,34 M12,44 L46,44 M12,54 L46,54 M54,34 L88,34 M54,44 L88,44 M54,54 L88,54', '#60a5fa', 1);
    if (f.yildiz) s += star(71, 48, 12, C.yel, 2);
    if (f.yazi) s += L('M14,32 L42,32 M14,40 L38,40 M14,48 L42,48 M56,32 L84,32', OL, 2);
    s += L('M50,18 L50,88', OL, 2.5);
    return s;
  },
  makas: (f) => {
    let s = '';
    if (f.kilif) s += R(46, 4, 16, 54, C.ora, 6);
    const blade = f.metal === false ? C.wood : C.silver;
    s += P('M52,58 L44,6 L50,6 L58,54 Z', blade) + P('M48,58 L62,8 L66,10 L54,56 Z', blade);
    const round = f.yuvarlaksap !== false;
    s += round ? Ci(38, 76, 12, C.red, 3) + Ci(66, 76, 12, C.red, 3) + Ci(38, 76, 6, '#fff', 2) + Ci(66, 76, 6, '#fff', 2) : R(26, 66, 22, 20, C.red, 2) + R(56, 66, 22, 20, C.red, 2);
    s += L('M44,64 L50,56 M60,64 L54,56', C.red, 5);
    if (f.vida !== false) s += Ci(52, 56, 3.5, C.yel, 1.6);
    return s;
  },
  canta: (f) => {
    let s = '';
    if (f.ikiaski !== false) s += L('M30,24 C26,10 40,6 44,20 M70,24 C74,10 60,6 56,20', OL, 4);
    else s += L('M36,24 C34,6 66,6 64,24', OL, 4);
    s += R(16, 22, 68, 72, C.red, 10);
    if (f.fermuar !== false) s += L('M24,34 C40,28 60,28 76,34', OL, 2) + R(62, 30, 4, 8, C.yel, 1, 1.2);
    if (f.oncep !== false && f.oncep !== undefined) s += R(28, 56, 44, 28, '#f87171', 6, 2);
    if (f.yancep) s += R(8, 52, 10, 30, '#f87171', 3, 2) + R(82, 52, 10, 30, '#f87171', 3, 2);
    return s;
  },
  yapistirici: (f) => {
    let s = '';
    if (f.sise === false) { s += P('M30,90 L30,30 L70,30 L70,90 L60,96 L40,96 Z', '#fff') + R(42, 16, 16, 14, C.ora, 2); }
    else s += P('M28,94 L28,46 C28,38 36,34 40,34 L60,34 C64,34 72,38 72,46 L72,94 Z', '#fff') + R(38, 22, 24, 14, C.ora, 3);
    if (f.firca !== false) s += R(48, 4, 4, 20, C.wood, 1, 1.4) + P('M45,4 L55,4 L53,-2 L47,-2 Z', C.brown, 1.2);
    if (f.etiket !== false) s += R(32, 56, 36, 24, C.blue, 3, 2) + star(50, 68, 7, C.yel, 1.2);
    return s;
  },
  cetvel: (f) => {
    let s = '';
    const c = f.plastik === false ? C.wood : '#a5f3fc';
    s += f.uzun === false ? R(30, 36, 40, 28, c, 2) : R(4, 36, 92, 28, c, 2);
    const x0 = f.uzun === false ? 34 : 8, x1 = f.uzun === false ? 66 : 92;
    for (let x = x0; x <= x1; x += 4) s += L(`M${x},36 L${x},${(x - x0) % 12 === 0 ? 46 : 42}`, OL, 1.2);
    if (f.sayi !== false) for (let x = x0, k = 0; x <= x1; x += 12, k++) s += `<text x="${x}" y="56" font-size="8" font-weight="900" text-anchor="middle" font-family="Arial, sans-serif" fill="${OL}">${k}</text>`;
    if (f.delik) s += Ci(f.uzun === false ? 64 : 88, 56, 3.5, '#fff', 1.6);
    return s;
  },
  silgi: (f) => {
    const c = f.kirmizi === false ? C.blue : C.red;
    let s = f.dikdortgen === false ? E(50, 52, 28, 22, c) : R(14, 34, 72, 34, c, 8);
    if (f.dikdortgen !== false) s += R(54, 34, 32, 34, C.lgray, 0, 2.2);
    if (f.toz) [[30, 80], [40, 84], [54, 82], [66, 86], [72, 80], [46, 90]].forEach(([x, y]) => { s += Ci(x, y, 2, '#e2e8f0', 1); });
    return s;
  },
  kalemlik: (f) => {
    let s = '';
    if (f.kalem !== false && f.kalem !== undefined) [[30, C.red], [42, C.blue], [54, C.green], [66, C.yel]].forEach(([x, c], k) => { s += R(x, 14 + (k % 2) * 6, 7, 40, c, 1, 1.6) + P(`M${x},${14 + (k % 2) * 6} L${x + 3.5},${6 + (k % 2) * 6} L${x + 7},${14 + (k % 2) * 6} Z`, C.wood, 1.2); });
    s += f.kutu === false ? P('M30,92 L22,40 L78,40 L70,92 Z', C.pur) : R(14, 40, 72, 52, C.pur, 4);
    if (f.fermuar !== false && f.fermuar !== undefined) s += L('M18,46 L82,46', OL, 2) + R(76, 42, 4, 9, C.yel, 1, 1);
    if (f.kapak) s += P('M12,40 L88,40 L84,30 L16,30 Z', '#7c3aed', 2);
    return s;
  },
  firca: (f) => {
    let s = '';
    s += R(44, 34, 12, 62, f.ahsap === false ? C.blue : C.wood, 5);
    if (f.metal !== false) s += R(43, 22, 14, 14, C.silver, 1, 2);
    if (f.tuy !== false) s += P('M43,22 C40,10 46,2 50,0 C54,2 60,10 57,22 Z', f.boya ? C.red : '#78350f', 2);
    if (f.boya) s += P('M44,14 C44,8 48,4 50,2 C52,4 56,8 56,14 Z', C.red, 1);
    return s;
  },
  suluboya: (f) => {
    let s = '';
    const round = f.ykutu === true || f.dkutu === false;
    const cols = f.altirenk === false ? [C.red, C.yel, C.blue] : [C.red, C.ora, C.yel, C.green, C.blue, C.pur];
    if (round) { s += Ci(50, 50, 44, C.lgray); cols.forEach((c, k) => { const a = (k * 360 / cols.length - 90) * Math.PI / 180; s += f.yuvarlakboya === false ? R(r1(50 + Math.cos(a) * 28 - 6), r1(50 + Math.sin(a) * 28 - 6), 12, 12, c, 1, 1.6) : Ci(r1(50 + Math.cos(a) * 28), r1(50 + Math.sin(a) * 28), 8, c, 1.6); }); if (f.firca) s += R(46, 30, 8, 40, C.wood, 3, 1.6); return s; }
    s += R(6, 22, 88, 56, C.lgray, 6);
    const n = cols.length; const per = n > 3 ? 3 : 3; void per;
    cols.forEach((c, k) => { const col = k % 3, row = Math.floor(k / 3); const x = (n > 3 ? 18 + col * 16 : 18 + col * 16), y = (n > 3 ? 36 + row * 26 : 50); s += f.yuvarlakboya === false ? R(x - 6, y - 6, 12, 12, c, 1, 1.6) : Ci(x, y, 7, c, 1.6); });
    if (f.fircayeri !== false && f.fircayeri !== undefined) s += R(68, 30, 18, 40, '#fff', 4, 1.8);
    if (f.firca) s += R(73, 26, 8, 46, C.wood, 3, 1.6);
    return s;
  },

  // ======================= ŞEKİLLER =======================
  sekil: (f) => { // f.sk: kare | daire | ucgen | dikdortgen | kalp | yildiz | oval | hilal
    // renk özelliği kapalıysa başka renk
    const COLK = { mavi: C.blue, kirmizi: C.red, yesil: C.green, sari: C.yel, pembe: C.pink, turuncu: C.ora, lacivert: C.navy, mor: C.pur, beyaz: '#fff' };
    let base = f.renk || C.blue;
    Object.keys(COLK).forEach(k => { if (f[k] === false) base = COLK[k] === C.pur ? C.green : C.pur; });
    const fill = f.bos ? '#fff' : f.boyali === false ? '#fff' : base;
    const sw = f.teker ? 9 : f.kalinkenar === false ? 1.5 : f.kalinkenar ? 6 : f.siyahkenar === false ? 1.2 : 3;
    const stroke = f.kirmizikenar ? C.red : f.siyahkenar === false ? fill : OL;
    const sp = (d) => `<path d="${d}" fill="${fill}" stroke="${stroke === '#fff' ? '#cbd5e1' : stroke}" stroke-width="${f.kirmizikenar ? 4 : sw}" stroke-linejoin="round"/>`;
    let s = '';
    switch (f.sk) {
      case 'kare': s += f.kare === false ? sp('M14,30 L86,30 L86,70 L14,70 Z') : f.dortkose === false ? sp('M50,12 C72,12 88,28 88,50 C88,72 72,88 50,88 C28,88 12,72 12,50 C12,28 28,12 50,12 Z') : sp('M16,16 L84,16 L84,84 L16,84 Z'); break;
      case 'daire': s += f.yuvarlak === false ? sp('M20,20 L80,20 L80,80 L20,80 Z') : sp('M50,14 A36,36 0 1,1 49.9,14 Z');
        if (f.cizgi) s += L('M50,16 L50,84 M16,50 L84,50 M26,26 L74,74 M74,26 L26,74', OL, 2.5) + Ci(50, 50, 5, C.gray, 1.6);
        if (f.nokta) s += dot(50, 50, 6, OL);
        break;
      case 'ucgen': s += f.ucgen === false ? sp('M18,22 L82,22 L82,82 L18,82 Z') : f.cati === false ? sp('M14,20 L86,20 L50,84 Z') : sp('M50,14 L88,80 L12,80 Z');
        if (f.baca) s += R(64, 22, 10, 22, C.brown, 1, 2);
        break;
      case 'dikdortgen': s += f.dik === false ? sp('M20,20 L80,20 L80,80 L20,80 Z') : sp('M8,30 L92,30 L92,70 L8,70 Z'); break;
      case 'kalp': s += f.kalp === false ? sp('M50,14 A36,36 0 1,1 49.9,14 Z') : sp('M50,88 C16,64 6,44 14,28 C22,12 42,14 50,30 C58,14 78,12 86,28 C94,44 84,64 50,88 Z');
        if (f.ok) s += L('M10,80 L88,18', OL, 3) + P('M88,18 L78,20 L86,28 Z', OL, 1.5) + P('M10,80 L6,72 M10,80 L18,84', 'none', 2);
        break;
      case 'yildiz': s += `<polygon points="${starPts(50, 52, 40, f.bes === false ? 6 : 5)}" fill="${fill}" stroke="${stroke}" stroke-width="${f.kirmizikenar ? 4 : sw}" stroke-linejoin="round"/>`; break;
      case 'oval': s += f.yumurta === false ? sp('M50,14 A36,36 0 1,1 49.9,14 Z') : f.basik === false ? sp('M50,8 C70,8 80,40 80,60 C80,80 68,92 50,92 C32,92 20,80 20,60 C20,40 30,8 50,8 Z') : sp('M8,52 C8,34 36,26 54,26 C76,26 92,38 92,52 C92,66 74,76 50,76 C30,76 8,70 8,52 Z');
        if (f.benek) s += dot(36, 46, 4, '#fff') + dot(56, 56, 5, '#fff') + dot(66, 42, 3, '#fff');
        break;
      case 'hilal': s += f.hilal === false ? sp('M50,14 A36,36 0 1,1 49.9,14 Z') : f.kivrik === false ? sp('M62,10 A40,40 0 0,0 62,90 Z') : sp('M62,8 C34,14 24,40 28,58 C32,78 50,92 74,92 C50,98 16,82 14,52 C12,22 40,4 62,8 Z');
        if (f.goz) s += dot(22, 42, 3, OL) + smile(23, 56, 7, 2);
        break;
      default: break;
    }
    if (f.gulen) s += dot(f.sk === 'ucgen' ? 42 : 38, f.sk === 'ucgen' ? 56 : 42, 3.5, OL) + dot(f.sk === 'ucgen' ? 58 : 62, f.sk === 'ucgen' ? 56 : 42, 3.5, OL) + smile(50, f.sk === 'ucgen' ? 66 : 58, 22, 3);
    return s;
  },

  // ======================= YİYECEKLER =======================
  pasta: (f) => {
    let s = '';
    const two = f.ikikat !== false;
    s += R(14, 60, 72, 30, C.tan, 4);
    if (two) s += R(26, 34, 48, 28, C.tan, 4);
    const top = two ? 34 : 60, x = two ? 26 : 14, w = two ? 48 : 72;
    if (f.krema !== false) { const kc = f.pembe === false ? '#fff' : C.pink; s += P(`M${x},${top + 2} L${x + w},${top + 2} L${x + w},${top + 8} Q${x + w - 6},${top + 14} ${x + w - 12},${top + 8} Q${x + w - 18},${top + 14} ${x + w - 24},${top + 8} Q${x + w - 30},${top + 14} ${x + w - 36},${top + 8} Q${x + w - 42},${top + 14} ${x},${top + 8} Z`, kc, 2); if (two) s += P('M14,62 L86,62 L86,68 Q80,74 74,68 Q68,74 62,68 Q56,74 50,68 Q44,74 38,68 Q32,74 26,68 Q20,74 14,68 Z', kc, 2); }
    if (f.mum !== false) s += R(47, top - 18, 6, 18, C.sky, 1, 1.8) + P(`M50,${top - 28} C54,${top - 22} 54,${top - 19} 50,${top - 19} C46,${top - 19} 46,${top - 22} 50,${top - 28} Z`, C.ora, 1.4);
    return s;
  },
  pizza: (f) => {
    let s = '';
    const tri = f.ucgen !== false;
    s += tri ? P('M10,20 Q50,6 90,20 L50,94 Z', '#f59e0b') : Ci(50, 50, 40, '#f59e0b');
    if (f.peynir !== false) s += tri ? P('M16,24 Q50,12 84,24 L72,48 Q66,56 60,48 L50,86 L40,52 Q34,58 30,50 Z', C.yel, 1.8) : Ci(50, 50, 33, C.yel, 1.8);
    if (f.sucuk !== false) (tri ? [[36, 30], [60, 30], [48, 50], [50, 68]] : [[34, 36], [62, 34], [48, 54], [30, 62], [66, 64]]).forEach(([x, y]) => { s += Ci(x, y, 6, '#b91c1c', 1.6); });
    return s;
  },
  dondurma: (f) => {
    let s = '';
    if (f.kulah !== false) s += P('M28,52 L72,52 L50,98 Z', C.wood) + L('M36,58 L58,90 M48,56 L64,78 M64,56 L44,92 M52,56 L38,78', '#b7853f', 1.4);
    else s += P('M24,56 C24,90 76,90 76,56 Z', C.blue);
    const two = f.ikitop !== false;
    if (two) s += Ci(50, 46, 20, C.pink) + Ci(50, 24, 17, '#fef3c7');
    else s += Ci(50, 42, 22, C.pink);
    if (f.cilek !== false) s += P(`M50,${two ? 2 : 14} C42,${two ? 4 : 16} 42,${two ? 14 : 26} 50,${two ? 18 : 30} C58,${two ? 14 : 26} 58,${two ? 4 : 16} 50,${two ? 2 : 14} Z`, C.red, 1.6) + L(`M46,${two ? 3 : 15} L50,${two ? 0 : 12} L54,${two ? 3 : 15}`, C.green, 2);
    return s;
  },
  donut: (f) => {
    let s = '';
    const hole = f.delik !== false;
    s += Ci(50, 50, 40, '#d97706');
    if (f.sos !== false) s += P('M50,16 C70,14 86,28 86,46 C88,56 80,58 78,66 C74,80 62,86 50,84 C36,86 24,80 20,68 C12,60 12,50 16,42 C18,26 32,16 50,16 Z', f.pembe === false ? '#78350f' : C.pink, 2);
    if (f.seker) [[30, 34, 20, C.yel], [62, 28, -30, C.sky], [72, 52, 60, C.green], [40, 70, 0, '#fff'], [66, 70, 40, C.yel], [26, 56, 80, C.sky], [50, 26, 10, C.green]].forEach(([x, y, a, c]) => { s += `<rect x="${x - 4}" y="${y - 1.5}" width="8" height="3" rx="1.5" fill="${c}" stroke="${OL}" stroke-width=".8" transform="rotate(${a} ${x} ${y})"/>`; });
    if (hole) s += Ci(50, 50, 11, '#fff', 2.5);
    return s;
  },
  hamburger: (f) => {
    let s = '';
    const iki = f.ekmek !== false;
    if (iki) s += P('M14,74 L86,74 C86,86 76,90 50,90 C24,90 14,86 14,74 Z', '#f59e0b');
    s += P('M12,62 C20,58 80,58 88,62 L84,68 L16,68 Z', C.green, 1.8);
    if (f.kofte !== false) s += R(14, 64, 72, 12, '#78350f', 6);
    s += P(iki ? 'M14,58 C14,30 86,30 86,58 Z' : 'M14,58 C14,30 86,30 86,58 Z', '#f59e0b');
    if (f.susam !== false) [[34, 44], [46, 38], [58, 40], [68, 46], [42, 50], [56, 50], [28, 52]].forEach(([x, y]) => { s += E(x, y, 1.8, 1.2, '#fff', 0.8); });
    if (!iki) s += P('M14,76 L86,76 L86,84 L14,84 Z', '#a16207', 1.6);
    return s;
  },
  patates: (f) => {
    let s = '';
    const yc = f.sari === false ? '#a16207' : C.yel;
    const sticks = f.cubuk === false ? [[30, 30], [46, 26], [62, 30]].map(([x, y]) => E(x, y, 9, 7, yc, 1.8)).join('') : [26, 34, 42, 50, 58, 66].map((x, k) => R(x, 10 + (k % 3) * 5, 6, 40, yc, 1, 1.6)).join('');
    if (f.kutu === false) return sticks + P('M14,50 L86,50 C86,80 70,90 50,90 C30,90 14,80 14,50 Z', C.lgray);
    s += sticks;
    s += P('M18,40 L82,40 L74,94 L26,94 Z', f.kirmizi === false ? C.blue : C.red);
    s += L('M38,58 Q50,66 62,58', '#fff', 3);
    return s;
  },
  cikolata: (f) => {
    const c = f.kahve === false ? '#fff7ed' : '#78350f';
    let s = f.dikdortgen === false ? Ci(50, 50, 38, c) : R(14, 8, 72, 84, c, 4);
    if (f.kare !== false) {
      if (f.dikdortgen === false) s += L('M50,14 L50,86 M14,50 L86,50 M24,24 L76,76 M76,24 L24,76', '#451a03', 1.6);
      else for (let y = 12; y < 88; y += 20) for (let x = 18; x < 82; x += 22) s += R(x, y, 18, 16, f.kahve === false ? '#fde68a' : '#92400e', 2, 1.4);
    }
    return s;
  },
  corba: (f) => {
    let s = '';
    if (f.sicak !== false) s += L('M36,30 C30,22 42,16 36,6 M50,30 C44,22 56,16 50,6 M64,30 C58,22 70,16 64,6', C.gray, 2.5);
    if (f.cubuk !== false) s += R(58, 6, 4, 50, C.wood, 1.5, 1.4).replace('<rect', '<rect transform="rotate(20 60 40)"') + R(66, 6, 4, 50, C.wood, 1.5, 1.4).replace('<rect', '<rect transform="rotate(28 68 40)"');
    if (f.kase === false) s += R(18, 40, 64, 34, C.red, 2) + E(50, 40, 32, 6, f.su === false ? C.wood : C.ora, 2);
    else s += P('M10,44 L90,44 C88,72 72,86 50,86 C28,86 12,72 10,44 Z', C.red) + E(50, 44, 40, 8, C.ora, 2) + R(38, 84, 24, 6, C.red, 2, 2);
    return s;
  },
  sut: (f) => {
    let s = '';
    if (f.kulp !== false) s += P('M72,40 C92,40 92,72 70,72 L70,64 C82,64 82,48 72,48 Z', C.blue, 2);
    s += R(22, 30, 52, 62, C.blue, 6);
    s += E(48, 32, 26, 6, f.sut === false ? '#92400e' : '#fff', 2);
    if (f.kopuk !== false) s += Ci(36, 26, 6, '#fff', 1.6) + Ci(48, 22, 7, '#fff', 1.6) + Ci(60, 26, 6, '#fff', 1.6) + Ci(54, 16, 4, '#fff', 1.4) + Ci(42, 14, 3, '#fff', 1.2);
    return s;
  },
  lolipop: (f) => {
    let s = '';
    s += f.cubuk === false ? R(46, 70, 8, 8, '#fff', 2, 2) : R(47, 52, 6, 46, '#fff', 2, 2);
    const sh = f.yuvarlak === false ? 'M20,10 L80,10 L80,62 L20,62 Z' : 'M50,4 A30,30 0 1,1 49.9,4 Z';
    s += P(sh, f.cizgi === false ? C.pink : '#fff');
    if (f.cizgi !== false) s += f.yuvarlak === false ? clip(nid('lp'), sh, [14, 30, 46].map(y => `<rect x="0" y="${y}" width="100" height="8" fill="${C.red}"/>`).join('')) + P(sh, 'none') : L('M50,34 m-4,0 a4,4 0 1,1 8,0 a8,8 0 1,1 -16,0 a12,12 0 1,1 24,0 a16,16 0 1,1 -32,0 a20,20 0 1,1 40,0 a24,24 0 1,1 -48,0', C.red, 4);
    return s;
  },

  // ======================= BAHÇE =======================
  gul: (f) => {
    let s = '';
    s += L('M50,40 C48,60 52,78 50,98', C.dgreen, 4);
    if (f.diken) s += P('M49,56 L42,52 L49,60 Z M51,70 L58,66 L51,74 Z M49,84 L42,80 L49,88 Z', C.dgreen, 1.2);
    if (f.yesilyaprak !== false) s += P('M50,64 C38,54 26,58 22,62 C30,70 42,70 50,64 Z', C.green, 1.8) + P('M50,78 C62,68 74,72 78,76 C70,84 58,84 50,78 Z', C.green, 1.8);
    const c = f.kirmizi === false ? C.yel : C.red;
    s += P('M26,24 C26,8 40,4 50,10 C60,4 74,8 74,24 C74,40 62,48 50,48 C38,48 26,40 26,24 Z', c);
    s += L('M40,20 C44,12 56,12 58,22 C58,30 46,32 44,24 C44,20 50,18 52,22', '#7f1d1d', 1.8);
    return s;
  },
  lale: (f) => {
    let s = '';
    const c = f.turuncu === false ? C.pur : C.ora;
    s += L(f.uzunsap === false ? 'M50,58 L50,80' : 'M50,40 L50,98', C.dgreen, 4);
    s += P('M50,86 C40,74 30,72 26,74 C32,84 42,90 50,92 Z', C.green, 1.8);
    const y = f.uzunsap === false ? 44 : 26;
    if (f.acik) s += P(`M50,${y + 16} C30,${y + 14} 18,${y} 16,${y - 16} C28,${y - 8} 38,${y - 6} 50,${y + 2} C62,${y - 6} 72,${y - 8} 84,${y - 16} C82,${y} 70,${y + 14} 50,${y + 16} Z`, c) + P(`M42,${y - 2} C44,${y - 18} 56,${y - 18} 58,${y - 2} Z`, c, 1.8);
    else s += P(`M36,${y - 14} L43,${y - 6} L50,${y - 16} L57,${y - 6} L64,${y - 14} C66,${y + 4} 62,${y + 16} 50,${y + 16} C38,${y + 16} 34,${y + 4} 36,${y - 14} Z`, c);
    return s;
  },
  yaprak: (f) => {
    let s = '';
    const n = f.dort === false ? 3 : 4;
    s += L('M50,96 L50,50', C.dgreen, 3.5);
    for (let k = 0; k < n; k++) {
      const a = -90 + (k - (n - 1) / 2) * (n === 4 ? 46 : 60);
      const leaf = f.tirtik ? 'M50,50 L46,40 L41,38 L43,32 L38,28 L42,22 L40,14 L50,6 L60,14 L58,22 L62,28 L57,32 L59,38 L54,40 Z' : 'M50,50 C36,40 38,16 50,6 C62,16 64,40 50,50 Z';
      s += `<g transform="rotate(${a + 90} 50 50)">${P(leaf, C.green, 2)}${f.cizgi !== false ? L('M50,48 L50,12', C.dgreen, 1.6) : ''}</g>`;
    }
    return s;
  },
  balkabagi: (f) => {
    const c = f.turuncu === false ? C.green : C.ora;
    let s = '';
    if (f.sap !== false) s += P('M46,22 L48,6 L58,8 L54,24 Z', C.dgreen, 2);
    s += E(30, 58, 20, 30, c) + E(70, 58, 20, 30, c) + E(50, 58, 20, 32, c);
    if (f.yuz) s += P('M38,48 L44,40 L50,48 Z M50,48 L56,40 L62,48 Z', OL, 1) + P('M34,64 L66,64 L60,76 L40,76 Z', OL, 1);
    return s;
  },
  kaktus: (f) => {
    const c = f.yesil === false ? C.brown : C.green;
    let s = '';
    s += P('M20,80 L80,80 L72,98 L28,98 Z', '#c2410c');
    s += P('M42,80 L42,24 C42,12 58,12 58,24 L58,80 Z', c) + P('M42,56 L30,56 C24,56 22,52 22,46 L22,34 C22,28 30,28 30,34 L30,48 L42,48 Z', c, 2) + P('M58,48 L70,48 L70,40 C70,34 78,34 78,40 L78,52 C78,58 74,60 70,60 L58,60 Z', c, 2);
    if (f.diken !== false) [[46, 30], [54, 40], [46, 52], [54, 64], [26, 40], [74, 46], [46, 72]].forEach(([x, y]) => { s += L(`M${x - 4},${y} L${x + 4},${y} M${x},${y - 4} L${x},${y + 4}`, OL, 1.2); });
    if (f.cicek) s += Ci(50, 12, 4, C.yel, 1.2) + [0, 72, 144, 216, 288].map(a => { const t = a * Math.PI / 180; return Ci(r1(50 + Math.cos(t) * 7), r1(12 + Math.sin(t) * 7), 4, C.pink, 1.2); }).join('');
    return s;
  },
  saksi: (f) => {
    let s = '';
    if (f.bitki !== false) s += L('M50,60 L50,30 M50,46 L36,34 M50,40 L64,28', C.dgreen, 3) + E(34, 32, 7, 4, C.green, 1.6) + E(66, 26, 7, 4, C.green, 1.6) + E(50, 24, 4, 7, C.green, 1.6);
    if (f.cicek) s += flower(50, 20, 6, C.pink) + flower(68, 24, 4, C.yel);
    s += f.toprak === false ? P('M26,58 L74,58 L70,96 L30,96 Z', C.blue) : P('M26,58 L74,58 L70,96 L30,96 Z', '#c2410c');
    s += R(22, 54, 56, 10, f.toprak === false ? C.blue : '#c2410c', 2);
    return s;
  }
};
