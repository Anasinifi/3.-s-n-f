// ============================================================================
// --- PROBLEM ÇÖZME (öğretmenin 200 sorusu): NESNE ÇİZİMLERİ ---
// ============================================================================
// Her nesne: draw(f) -> SVG içi (100x100). f: özellik anahtarları (true/false).
// Bir özellik kapalıyken çizim gözle görülür şekilde değişir (parça yok / başka renk / başka şekil).
import { OL, S, SN } from '../art';

export const C = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', dgreen: '#15803d', yel: '#facc15', ora: '#f97316', pink: '#f472b6', pur: '#a855f7', brown: '#92400e', wood: '#d6a35c', gray: '#94a3b8', lgray: '#e2e8f0', white: '#ffffff', black: '#1e293b', navy: '#1e3a8a', sky: '#7dd3fc', cream: '#fef3c7', silver: '#cbd5e1', tan: '#fdba74' };
const S2 = `stroke="${OL}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
const r1 = (n) => Math.round(n * 10) / 10;
export const P = (d, fill, sw = 2.5) => `<path d="${d}" fill="${fill}" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
export const L = (d, col = OL, sw = 2.5) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const R = (x, y, w, h, fill, rx = 0, sw = 2.5) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}" fill="${fill}" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"/>`;
export const Ci = (x, y, r, fill, sw = 2.5) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}" stroke="${OL}" stroke-width="${sw}"/>`;
export const E = (x, y, rx, ry, fill, sw = 2.5) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${fill}" stroke="${OL}" stroke-width="${sw}"/>`;
const dot = (x, y, r, fill) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}"/>`;
export const starPts = (x, y, r, n = 5, inner = 0.45) => { const p = []; for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * inner : r; const a = (-90 + i * 180 / n) * Math.PI / 180; p.push(`${r1(x + rr * Math.cos(a))},${r1(y + rr * Math.sin(a))}`); } return p.join(' '); };
export const star = (x, y, r = 7, c = C.yel, sw = 1.5, n = 5) => `<polygon points="${starPts(x, y, r, n)}" fill="${c}" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"/>`;
export const heart = (x, y, s = 1, c = C.red, sw = 1.5) => `<path d="M${x},${y + 7 * s} C${x - 9 * s},${y + 1 * s} ${x - 9 * s},${y - 6 * s} ${x - 4 * s},${y - 7 * s} C${x - 1 * s},${y - 8 * s} ${x},${y - 5 * s} ${x},${y - 4 * s} C${x},${y - 5 * s} ${x + 1 * s},${y - 8 * s} ${x + 4 * s},${y - 7 * s} C${x + 9 * s},${y - 6 * s} ${x + 9 * s},${y + 1 * s} ${x},${y + 7 * s} Z" fill="${c}" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"/>`;
const flower = (x, y, r = 4, c = C.pink) => [0, 72, 144, 216, 288].map(a => { const t = a * Math.PI / 180; return dot(x + Math.cos(t) * r, y + Math.sin(t) * r, r * 0.75, c); }).join('') + dot(x, y, r * 0.55, C.yel);
const smile = (x, y, w = 8, sw = 2) => L(`M${x - w / 2},${y} Q${x},${y + w * 0.6} ${x + w / 2},${y}`, OL, sw);
const eyes = (x, y, gap = 8, r = 1.8) => dot(x - gap / 2, y, r, OL) + dot(x + gap / 2, y, r, OL);
const face = (x, y, s = 1) => eyes(x, y - 3 * s, 8 * s, 1.8 * s) + smile(x, y + 2 * s, 9 * s, 2 * s);
const bow = (x, y, s = 1, c = C.red) => P(`M${x},${y} L${x - 8 * s},${y - 5 * s} L${x - 8 * s},${y + 5 * s} Z`, c, 1.5) + P(`M${x},${y} L${x + 8 * s},${y - 5 * s} L${x + 8 * s},${y + 5 * s} Z`, c, 1.5) + Ci(x, y, 2.2 * s, c, 1.5);
const wheel = (x, y, r, thick = true) => Ci(x, y, r, OL, 2) + Ci(x, y, r * (thick ? 0.45 : 0.7), C.silver, 1.5);
const zipper = (x, y1, y2) => { let d = `M${x},${y1}`; for (let y = y1; y < y2; y += 4) d += ` L${x - 2},${y + 2} L${x + 2},${y + 4}`; return L(d, OL, 1.4); };
const stripesClip = (id, shape, ys, col = '#fff', h = 5, op = 0.9) => `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs><g clip-path="url(#${id})">${ys.map(y => `<rect x="0" y="${y}" width="100" height="${h}" fill="${col}" opacity="${op}"/>`).join('')}</g>`;
const vstripesClip = (id, shape, xs, col = OL, w = 4) => `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs><g clip-path="url(#${id})">${xs.map(x => `<rect x="${x}" y="0" width="${w}" height="100" fill="${col}" opacity=".95"/>`).join('')}</g>`;
const spotsClip = (id, shape, pts, col = OL) => `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs><g clip-path="url(#${id})">${pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity=".95"/>`).join('')}</g>`;
let uid = 0; const nid = (p) => `${p}${++uid}`;

// ---------------------------------------------------------------------------
// ÇİZİMLER
// ---------------------------------------------------------------------------
export const DRAW = {
  // ======================= KIYAFETLER =======================
  mont: (f) => {
    const c = f.kirmizi ? C.red : C.blue;
    let s = '';
    if (f.kapuson) s += P('M30,26 C22,2 78,2 70,26 C62,12 38,12 30,26 Z', c) + L('M36,20 C40,12 60,12 64,20', OL, 1.6);
    const body = 'M34,20 C40,24 60,24 66,20 L88,34 L94,82 L82,84 L76,44 L76,92 L24,92 L24,44 L18,84 L6,82 L12,34 Z';
    s += P(body, c);
    s += P('M40,21 C44,27 56,27 60,21', '#fff', 1.8);
    if (f.fermuar) s += zipper(50, 26, 90); else s += L('M50,26 L50,90', OL, 1.6);
    if (f.cep) s += R(30, 62, 14, 12, c, 2, 1.8) + R(56, 62, 14, 12, c, 2, 1.8) + L('M30,66 L44,66 M56,66 L70,66', OL, 1.5);
    return s;
  },
  ust: (f) => { // tişört / gömlek
    const c = f.renk || C.green;
    const short = f.kisakol === true || f.uzunkol === false;
    const body = short ? 'M32,16 C40,22 60,22 68,16 L90,30 L82,46 L72,40 L72,90 L28,90 L28,40 L18,46 L10,30 Z'
      : 'M32,16 C40,22 60,22 68,16 L86,28 L96,80 L84,82 L74,40 L74,90 L26,90 L26,40 L16,82 L4,80 L14,28 Z';
    let s = '';
    if (f.acik) s += P(body, c) + P('M44,20 L56,20 L56,90 L44,90 Z', '#fff', 2) + L('M44,20 L44,90 M56,20 L56,90', OL, 2.5);
    else s += P(body, c);
    if (f.yaka) s += P('M38,18 L50,30 L62,18 L56,15 L50,23 L44,15 Z', '#fff', 1.8);
    else s += L('M38,18 C42,25 58,25 62,18', OL, 2);
    if (f.dugme) [36, 48, 60, 72, 84].forEach(y => { s += Ci(f.acik ? 41 : 50, y, 2.2, '#fff', 1.4); });
    if (f.yildiz) s += star(50, 54, 12, C.yel, 1.8);
    if (f.cep) s += R(55, 32, 12, 12, '#fff', 2, 1.8) + L('M55,36 L67,36', OL, 1.4);
    return s;
  },
  elbise: (f) => {
    const c = f.pembe ? C.pink : C.sky;
    const body = 'M38,22 L62,22 L64,44 L86,88 L14,88 L36,44 Z';
    let s = '';
    if (f.askili) s += L('M40,22 L38,8 M60,22 L62,8', OL, 3);
    else s += P('M38,22 L28,30 L22,22 L36,12 L64,12 L78,22 L72,30 L62,22 Z', c, 2);
    s += P(body, c);
    s += L('M36,44 L64,44', OL, 2);
    if (f.cicek) [[50, 32], [40, 62], [62, 66], [50, 78], [30, 80], [70, 82]].forEach(([x, y]) => { s += flower(x, y, 3.2, '#fff'); });
    if (f.firfir) { let d = 'M14,88'; for (let x = 14; x < 86; x += 8) d += ` Q${x + 4},${98} ${x + 8},88`; s += P(d + ' Z', '#fff', 1.8); }
    return s;
  },
  pantolon: (f) => {
    const c = f.mavi ? C.blue : C.brown;
    const iki = f.paca !== false;
    const body = iki ? 'M28,14 L72,14 L78,92 L56,92 L50,44 L44,92 L22,92 Z' : 'M28,14 L72,14 L84,80 L16,80 Z';
    let s = P(body, c);
    if (f.kemer) s += R(26, 12, 48, 8, C.black, 1, 2) + R(45, 11, 10, 10, C.yel, 1, 1.6);
    else s += L('M28,20 L72,20', OL, 1.8);
    if (f.cep) s += P('M30,22 Q34,32 42,24', 'none', 1.8) + P('M70,22 Q66,32 58,24', 'none', 1.8);
    if (f.yama) s += R(iki ? 25 : 30, 56, 14, 12, C.yel, 2, 1.8) + L(`M${iki ? 27 : 32},58 L${iki ? 37 : 42},66 M${iki ? 37 : 42},58 L${iki ? 27 : 32},66`, OL, 1.2);
    return s;
  },
  ayakkabi: (f) => { // spor ayakkabı
    const c = C.blue;
    let s = '';
    const sole = f.kalintaban ? R(6, 70, 88, 14, '#fff', 6) : R(8, 72, 84, 6, '#fff', 3, 2);
    s += P('M10,72 L12,40 C14,32 30,30 36,36 C46,46 60,50 76,52 C90,54 94,64 92,72 Z', c);
    s += sole;
    if (f.bagcik) [44, 52, 60].forEach(x => { s += L(`M${x - 4},${42 + (x - 44) / 3} L${x + 4},${48 + (x - 44) / 3}`, '#fff', 2.5); });
    if (f.yildiz) s += star(26, 56, 8, C.yel);
    return s;
  },
  ayakkabi2: (f) => { // topuklu ayakkabı / terlik
    const c = f.sari === false ? C.pur : C.yel;
    let s = '';
    if (f.topuk) s += P('M18,62 L28,62 L26,90 L20,90 Z', c);
    s += P(f.topuk ? 'M8,62 C8,48 22,46 34,54 C48,64 66,66 86,68 C94,69 94,78 86,80 L46,80 C34,80 26,70 18,66 L8,66 Z' : 'M6,72 C6,62 20,62 34,64 C50,66 68,66 86,68 C94,69 94,78 86,80 L10,80 Z', c);
    if (f.bagcik) s += L('M50,64 L58,58 M56,66 L64,60 M62,67 L70,62', OL, 2.2);
    if (f.fiyonk) s += bow(76, 66, 0.9, C.red);
    return s;
  },
  atki: (f) => {
    const c = C.green;
    const w = f.kalin ? 20 : 11;
    const body = `M14,${30 - w / 2} L86,${30 - w / 2} L86,${30 + w / 2} L${60 + w / 2},${30 + w / 2} L${60 + w / 2},86 L${60 - w / 2},86 L${60 - w / 2},${30 + w / 2} L14,${30 + w / 2} Z`;
    let s = P(body, c);
    const id = nid('atk');
    if (f.cizgi) s += `<defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs><g clip-path="url(#${id})"><rect x="30" y="0" width="6" height="100" fill="${C.red}"/><rect x="44" y="0" width="6" height="100" fill="${C.red}"/><rect x="0" y="58" width="100" height="6" fill="${C.red}"/><rect x="0" y="72" width="100" height="6" fill="${C.red}"/></g>` + P(body, 'none');
    if (f.kalin) for (let x = 18; x < 84; x += 7) s += L(`M${x},${24} l3,4 l3,-4 M${x},${32} l3,4 l3,-4`, OL, 1);
    if (f.puskul) { for (let x = 60 - w / 2 + 2; x <= 60 + w / 2 - 1; x += 3.5) s += L(`M${r1(x)},86 L${r1(x)},96`, OL, 1.8); for (let y = 30 - w / 2 + 2; y <= 30 + w / 2 - 1; y += 3.5) s += L(`M14,${r1(y)} L5,${r1(y)}`, OL, 1.8); }
    return s;
  },
  bere: (f) => {
    const c = C.pur;
    let s = '';
    if (f.ip) s += L('M22,66 C20,80 24,88 20,96 M78,66 C80,80 76,88 80,96', OL, 2.2);
    if (f.kulaklik) s += P('M18,56 C16,72 24,78 30,74 L32,60 Z', c) + P('M82,56 C84,72 76,78 70,74 L68,60 Z', c);
    const dome = 'M16,62 C16,26 84,26 84,62 Z';
    s += P(dome, c);
    if (f.cizgi) s += stripesClip(nid('br'), dome, [36, 46], '#fff', 4) + P(dome, 'none');
    if (f.kivrik) s += R(14, 56, 72, 12, c, 5);
    if (f.ponpon) { s += Ci(50, 22, 10, '#fff', 2); for (let a = 0; a < 360; a += 40) { const t = a * Math.PI / 180; s += L(`M${r1(50 + Math.cos(t) * 6)},${r1(22 + Math.sin(t) * 6)} L${r1(50 + Math.cos(t) * 10)},${r1(22 + Math.sin(t) * 10)}`, OL, 1); } }
    return s;
  },
  eldiven: (f) => {
    const c = C.red;
    let s = '';
    if (f.besparmak) s += P('M28,58 L26,26 C26,20 34,20 34,26 L36,46 L38,18 C38,12 46,12 46,18 L47,44 L50,16 C50,10 58,10 58,16 L57,44 L62,22 C63,16 70,17 69,23 L66,50 L76,40 C80,36 86,40 82,46 L68,66 C64,72 58,74 50,74 L34,74 Z', c);
    else s += P('M30,72 L28,30 C28,10 66,10 66,30 L66,50 L76,40 C80,36 86,40 82,46 L68,66 C64,72 58,74 50,74 Z', c);
    if (f.bileklik) s += R(28, 72, 30, 22, '#fff', 3) + L('M33,74 L33,92 M38,74 L38,92 M43,74 L43,92 M48,74 L48,92 M53,74 L53,92', OL, 1);
    else s += R(30, 72, 26, 6, c, 2, 2);
    if (f.dugme) s += Ci(43, 64, 4, C.yel, 1.6) + dot(42, 63, 0.8, OL) + dot(44, 65, 0.8, OL);
    return s;
  },

  // ======================= HAYVANLAR =======================
  dort: (f) => { // dört ayaklı hayvanlar (sağa bakar). f.tur: kedi | fil | zurafa | aslan | zebra | inek
    const t = f.tur;
    const cfg = {
      kedi: { c: C.ora, bx: 46, by: 58, brx: 26, bry: 14, hx: 76, hy: 40, hr: 12, leg: 18, lw: 6 },
      fil: { c: C.gray, bx: 44, by: 52, brx: 32, bry: 22, hx: 78, hy: 42, hr: 15, leg: 20, lw: 11 },
      zurafa: { c: C.yel, bx: 40, by: 60, brx: 24, bry: 12, hx: 76, hy: f.uzunboyun === false ? 46 : 16, hr: 9, leg: 26, lw: 5 },
      aslan: { c: '#f59e0b', bx: 44, by: 58, brx: 28, bry: 14, hx: 76, hy: 42, hr: 12, leg: 20, lw: 7 },
      zebra: { c: '#fff', bx: 44, by: 54, brx: 28, bry: 14, hx: 78, hy: 34, hr: 10, leg: 24, lw: 6 },
      inek: { c: '#fff', bx: 44, by: 54, brx: 30, bry: 17, hx: 79, hy: 42, hr: 12, leg: 20, lw: 7 }
    }[t];
    const { c, bx, by, brx, bry, hx, hy, hr, leg, lw } = cfg;
    let s = '';
    const four = f.dortbacak !== false;
    const legsX = four ? [bx - brx * 0.7, bx - brx * 0.4, bx + brx * 0.35, bx + brx * 0.65] : [bx - brx * 0.55, bx + brx * 0.5];
    // kuyruk
    const tailLong = f.uzunkuyruk !== false && f.kuyruk !== false;
    if (f.kuyruk !== false) {
      if (t === 'kedi') s += L(tailLong ? `M${bx - brx},${by - 4} C${bx - brx - 18},${by - 8} ${bx - brx - 14},${by - 34} ${bx - brx - 4},${by - 36}` : `M${bx - brx},${by - 4} L${bx - brx - 7},${by - 10}`, OL, 6.5) + L(tailLong ? `M${bx - brx},${by - 4} C${bx - brx - 18},${by - 8} ${bx - brx - 14},${by - 34} ${bx - brx - 4},${by - 36}` : `M${bx - brx},${by - 4} L${bx - brx - 7},${by - 10}`, c, 3.5);
      else {
        const d = tailLong ? `M${bx - brx + 2},${by - 6} C${bx - brx - 10},${by} ${bx - brx - 12},${by + 14} ${bx - brx - 10},${by + 22}` : `M${bx - brx + 2},${by - 6} L${bx - brx - 6},${by + 2}`;
        s += L(d, OL, 4) + L(d, c === '#fff' ? '#fff' : c, 2);
        if (tailLong || t === 'aslan' || t === 'inek') s += P(tailLong ? `M${bx - brx - 10},${by + 20} l-3,8 l6,0 Z` : `M${bx - brx - 6},${by + 2} l-4,5 l5,1 Z`, t === 'zebra' || t === 'inek' ? OL : C.brown, 1.5);
      }
    }
    legsX.forEach((x, k) => { s += R(x - lw / 2, by + bry * 0.4, lw, leg, k === 0 || k === 2 ? c : c, 2, 2.2); });
    // gövde
    const bodyD = `M${bx - brx},${by} a${brx},${bry} 0 1,0 ${2 * brx},0 a${brx},${bry} 0 1,0 ${-2 * brx},0 Z`;
    s += P(bodyD, c);
    if (t === 'zebra' && f.cizgi !== false) s += vstripesClip(nid('zb'), bodyD, [bx - 20, bx - 10, bx, bx + 10, bx + 20], OL, 3.5) + P(bodyD, 'none');
    if (t === 'zurafa' && f.benek !== false) s += spotsClip(nid('zf'), bodyD, [[bx - 12, by - 4, 4], [bx + 2, by + 4, 4.5], [bx + 14, by - 5, 3.5], [bx - 4, by - 9, 3]], C.brown) + P(bodyD, 'none');
    if (t === 'inek' && f.benek !== false) s += spotsClip(nid('ik'), bodyD, [[bx - 14, by - 6, 7], [bx + 10, by + 4, 8], [bx + 18, by - 10, 5]], OL) + P(bodyD, 'none');
    // boyun
    if (t === 'zurafa') { const nd = `M${bx + brx - 12},${by - 6} L${hx - 6},${hy + 4} L${hx + 2},${hy + 8} L${bx + brx - 2},${by - 2} Z`; s += P(nd, c); if (f.benek !== false) s += spotsClip(nid('zn'), nd, [[hx - 6, hy + 18, 2.5], [hx - 10, hy + 30, 3], [hx - 3, hy + 38, 2.5]], C.brown) + P(nd, 'none'); }
    if (t === 'zebra') s += P(`M${bx + brx - 12},${by - 8} L${hx - 7},${hy + 2} L${hx + 4},${hy + 6} L${bx + brx},${by} Z`, c);
    // kulak arkası / yele
    if (t === 'aslan' && f.yele !== false) s += Ci(hx - 2, hy, hr + 9, C.brown, 2.2);
    // baş
    if (t === 'fil') {
      if (f.buyukkulak !== false) s += P(`M${hx - 6},${hy - 14} C${hx - 30},${hy - 18} ${hx - 30},${hy + 18} ${hx - 6},${hy + 16} Z`, c);
      else s += E(hx - 8, hy - 4, 5, 7, c, 2);
      s += Ci(hx, hy, hr, c);
      if (f.hortum !== false) s += L(`M${hx + 10},${hy + 4} C${hx + 18},${hy + 20} ${hx + 10},${hy + 36} ${hx + 18},${hy + 40}`, OL, 9) + L(`M${hx + 10},${hy + 4} C${hx + 18},${hy + 20} ${hx + 10},${hy + 36} ${hx + 18},${hy + 40}`, c, 5.5);
      else s += E(hx + 13, hy + 4, 4, 3, c, 2);
      s += dot(hx + 4, hy - 4, 2, OL);
      return s;
    }
    if (t === 'kedi' || t === 'aslan') {
      const sharp = t === 'kedi' ? f.sivrikulak !== false : false;
      s += sharp ? P(`M${hx - 10},${hy - 6} L${hx - 8},${hy - 22} L${hx - 1},${hy - 10} Z`, c, 2) + P(`M${hx + 2},${hy - 10} L${hx + 9},${hy - 22} L${hx + 11},${hy - 6} Z`, c, 2)
        : Ci(hx - 8, hy - 9, 4.5, c, 2) + Ci(hx + 8, hy - 9, 4.5, c, 2);
      s += Ci(hx, hy, hr, c);
      s += dot(hx - 4, hy - 2, 1.8, OL) + dot(hx + 5, hy - 2, 1.8, OL) + P(`M${hx - 1},${hy + 3} l3,0 l-1.5,2 Z`, C.pink, 1);
      if (t === 'aslan' && f.dis) s += P(`M${hx - 8},${hy + 4} Q${hx},${hy + 18} ${hx + 8},${hy + 4} Z`, '#7f1d1d', 1.4) + P(`M${hx - 7},${hy + 4.5} l2.5,5 l2.5,-5 Z M${hx + 2},${hy + 4.5} l2.5,5 l2.5,-5 Z`, '#fff', 1);
      else s += L(`M${hx - 3},${hy + 7} Q${hx + 1},${hy + 9} ${hx + 4},${hy + 7}`, OL, 1.4);
      if (t === 'kedi' && f.biyik) s += L(`M${hx - 3},${hy + 4} L${hx - 18},${hy + 1} M${hx - 3},${hy + 6} L${hx - 18},${hy + 8} M${hx + 4},${hy + 4} L${hx + 19},${hy + 1} M${hx + 4},${hy + 6} L${hx + 19},${hy + 8}`, OL, 1.2);
      if (t === 'kedi' && f.tasma) s += R(hx - 10, hy + 10, 20, 5, C.red, 2, 1.6) + Ci(hx, hy + 17, 2.5, C.yel, 1.2);
      return s;
    }
    if (t === 'zurafa') {
      if (f.kulak !== false) s += P(`M${hx - 8},${hy - 4} L${hx - 16},${hy - 8} L${hx - 9},${hy - 10} Z`, c, 1.6);
      s += L(`M${hx - 2},${hy - 8} L${hx - 3},${hy - 16} M${hx + 3},${hy - 8} L${hx + 3},${hy - 16}`, OL, 2) + dot(hx - 3, hy - 17, 2, C.brown) + dot(hx + 3, hy - 17, 2, C.brown);
      s += E(hx + 3, hy, hr + 2, hr - 2, c) + dot(hx + 3, hy - 2, 1.6, OL);
      return s;
    }
    if (t === 'zebra') {
      s += P(`M${hx - 6},${hy - 6} L${hx - 4},${hy - 16} L${hx},${hy - 7} Z`, c, 1.6);
      s += E(hx + 4, hy + 2, hr + 3, hr - 3, c) + R(hx + 10, hy - 2, 7, 10, OL, 3, 1) + dot(hx + 2, hy - 2, 1.6, OL);
      s += L(`M${hx - 10},${hy + 6} L${hx - 14},${hy + 18}`, OL, 3);
      return s;
    }
    if (t === 'inek') {
      if (f.boynuz) s += P(`M${hx - 8},${hy - 9} C${hx - 14},${hy - 14} ${hx - 14},${hy - 22} ${hx - 9},${hy - 22} L${hx - 5},${hy - 10} Z`, C.cream, 1.6) + P(`M${hx + 8},${hy - 9} C${hx + 14},${hy - 14} ${hx + 14},${hy - 22} ${hx + 9},${hy - 22} L${hx + 5},${hy - 10} Z`, C.cream, 1.6);
      s += E(hx - 13, hy - 4, 6, 3.5, c, 1.8) + E(hx + 13, hy - 4, 6, 3.5, c, 1.8);
      s += Ci(hx, hy, hr, c) + E(hx, hy + 8, 9, 5.5, C.pink, 1.8) + dot(hx - 3, hy + 8, 1.2, OL) + dot(hx + 3, hy + 8, 1.2, OL) + dot(hx - 4, hy - 3, 1.8, OL) + dot(hx + 4, hy - 3, 1.8, OL);
      return s;
    }
    return s;
  },
  kus: (f) => {
    const c = C.sky;
    let s = '';
    if (f.kuyruk !== false) s += f.kisakuyruk ? P('M24,56 L12,52 L14,62 Z', C.blue) : P('M26,56 L4,46 L6,58 L4,70 Z', C.blue);
    s += L('M44,74 L42,88 M54,74 L56,88', C.ora, 2.5);
    s += E(44, 58, 22, 16, c);
    s += Ci(68, 40, 12, c);
    if (f.gaga !== false) s += P('M79,38 L94,42 L79,46 Z', C.ora, 1.8);
    s += dot(71, 37, 2, OL);
    if (f.kanat !== false) s += P('M30,52 C36,40 56,42 60,54 C50,62 38,62 30,52 Z', C.blue, 2) + (f.ikikanat !== false ? P('M36,48 C40,30 56,30 58,46', C.blue, 2) : '');
    return s;
  },
  balik: (f) => {
    const c = C.ora;
    let s = '';
    s += P('M22,50 L4,34 L8,50 L4,66 Z', c);
    if (f.yuzgec) s += P('M40,32 C46,18 60,20 62,32 Z', c, 2) + P('M44,68 C48,80 58,80 58,68 Z', c, 2);
    const body = 'M18,50 C26,28 70,24 88,50 C70,76 26,72 18,50 Z';
    s += P(body, c);
    if (f.pul) for (let x = 34; x <= 66; x += 10) for (let y = 40; y <= 60; y += 10) s += L(`M${x},${y} q4,5 0,10`, '#fff', 1.6);
    s += Ci(74, 44, 4, '#fff', 1.6) + dot(75, 44, 2, OL);
    if (f.gulen) s += L('M70,56 Q76,62 82,55', OL, 2);
    else s += L('M72,58 L82,57', OL, 2);
    return s;
  },
  tavsan: (f) => {
    const c = C.lgray;
    let s = '';
    if (f.ponpon) s += Ci(20, 66, 8, '#fff', 2);
    else s += P('M24,64 L14,70 L24,70 Z', c, 1.8);
    s += E(40, 68, 20, 18, c);
    if (f.uzunkulak !== false) s += E(56, 18, 5, 16, c, 2) + E(68, 18, 5, 16, c, 2) + E(56, 19, 2, 11, C.pink, 0) + E(68, 19, 2, 11, C.pink, 0);
    else s += E(55, 30, 5, 6, c, 2) + E(69, 30, 5, 6, c, 2);
    s += Ci(62, 42, 13, c) + dot(57, 40, 1.8, OL) + dot(67, 40, 1.8, OL) + P('M61,45 l2,0 l-1,1.5 Z', C.pink, 1);
    if (f.havuc) s += P('M70,66 L92,52 L94,56 L74,72 Z', C.ora, 1.8) + L('M92,52 l4,-6 M93,54 l6,-3', C.green, 2) + Ci(70, 68, 5, c, 2);
    return s;
  },
  kelebek: (f) => {
    const wc = f.renkli === false ? C.gray : C.pur, wc2 = f.renkli === false ? C.lgray : C.pink;
    let s = '';
    if (f.kanat !== false) {
      s += P('M50,48 C30,14 6,22 12,44 C16,54 34,54 50,50 Z', wc) + P('M50,48 C70,14 94,22 88,44 C84,54 66,54 50,50 Z', wc);
      s += P('M50,52 C34,58 16,70 26,82 C34,90 46,72 50,56 Z', wc2) + P('M50,52 C66,58 84,70 74,82 C66,90 54,72 50,56 Z', wc2);
      if (f.benek) s += dot(26, 36, 4, OL) + dot(74, 36, 4, OL) + dot(32, 72, 3, OL) + dot(68, 72, 3, OL) + dot(18, 44, 2.5, OL) + dot(82, 44, 2.5, OL);
    }
    s += E(50, 54, 4, 20, OL, 1);
    if (f.anten !== false) s += L('M48,36 C44,24 40,20 36,18 M52,36 C56,24 60,20 64,18', OL, 1.8) + dot(36, 18, 2.5, OL) + dot(64, 18, 2.5, OL);
    return s;
  },
  kaplumbaga: (f) => {
    const c = C.green;
    let s = '';
    const legs = f.dortbacak !== false ? [24, 36, 62, 74] : [30, 68];
    legs.forEach(x => { s += R(x - 4, 64, 9, 14, c, 4, 2); });
    if (f.kafa !== false) { const r = f.kucukkafa === false ? 14 : 8; s += Ci(86 - (r > 10 ? 2 : 0), 60 - r / 2, r, c) + dot(88, 57 - r / 2, 1.8, OL); }
    if (f.kabuk !== false) { const sh = 'M14,68 C14,30 86,30 86,68 Z'; s += P(sh, C.brown); s += L('M34,40 L40,54 L60,54 L66,40 M40,54 L34,68 M60,54 L66,68', C.tan, 2); }
    else s += P('M14,68 C18,56 82,56 86,68 Z', c);
    s += R(12, 64, 76, 6, '#fde68a', 3, 2);
    return s;
  },

  // ======================= TAŞITLAR =======================
  araba: (f) => {
    const c = C.red;
    let s = '';
    if (f.dortteker !== false) s += wheel(38, 72, 8) + wheel(88, 72, 8);
    s += P('M6,72 L6,54 C6,48 12,46 18,46 L28,46 L38,30 L70,30 L82,46 L92,48 C96,50 96,56 96,62 L96,72 Z', c);
    if (f.pencere !== false) s += P('M41,34 L52,34 L52,46 L33,46 Z', C.sky, 2) + P('M56,34 L68,34 L77,46 L56,46 Z', C.sky, 2);
    const doors = f.kapi === false ? 0 : f.ikikapi === false ? 1 : 2;
    if (doors >= 1) s += L('M54,48 L54,68 M54,48 L80,48 L80,66 L54,68', OL, 1.8) + R(70, 52, 6, 2.5, OL, 1, 1);
    if (doors >= 2) s += L('M30,48 L30,68 L54,68 M30,48 L54,48', OL, 1.8) + R(44, 52, 6, 2.5, OL, 1, 1);
    s += wheel(24, 76, 10) + wheel(76, 76, 10);
    s += R(90, 54, 6, 5, C.yel, 1, 1.5);
    return s;
  },
  bisiklet: (f) => {
    let s = '';
    const three = f.ikiteker === false;
    const wh = (x, y, r) => Ci(x, y, r, 'none', 3) + Ci(x, y, 2.5, OL, 1) + L(`M${x - r},${y} L${x + r},${y} M${x},${y - r} L${x},${y + r}`, OL, 1);
    s += wh(24, 70, 16) + wh(76, 70, 16);
    if (three) s += wh(30, 74, 10);
    s += L('M24,70 L42,46 L66,46 L76,70 M42,46 L50,70 L24,70 M50,70 L66,46', C.red, 3.5);
    s += L('M38,40 L48,40', OL, 3.5) + L('M42,46 L42,40', OL, 2);
    if (f.gidon !== false) s += L('M66,46 L64,30 M58,28 C62,30 66,30 72,26', OL, 3);
    else s += L('M66,46 L66,38', OL, 3);
    if (f.sepet) s += P('M68,32 L90,32 L86,46 L72,46 Z', C.wood, 2) + L('M72,36 L88,36 M74,40 L86,40', OL, 1);
    return s;
  },
  ucak: (f) => {
    const c = C.blue;
    let s = '';
    if (f.teker) s += L('M40,62 L40,74 M66,62 L66,74', OL, 2) + Ci(40, 77, 4.5, OL, 1.5) + Ci(66, 77, 4.5, OL, 1.5);
    s += P('M10,40 L18,40 L26,50 Z', c, 2);
    s += P('M12,50 C12,44 20,42 30,42 L80,42 C92,42 96,50 92,56 C88,62 80,62 70,62 L24,62 C16,62 12,58 12,50 Z', '#fff');
    if (f.ikikanat !== false && f.kanat !== false) s += P('M44,50 L60,50 L44,82 L34,82 Z', c, 2) + P('M46,48 L58,48 L48,22 L40,22 Z', c, 2);
    else if (f.kanat !== false) s += P('M44,50 L60,50 L44,82 L34,82 Z', c, 2);
    if (f.pencere !== false) [36, 46, 56, 66, 76].forEach(x => { s += Ci(x, 49, 2.6, C.sky, 1.4); });
    if (f.pervane) s += R(93, 44, 3, 14, OL, 1, 1) + E(95, 38, 2.5, 8, C.gray, 1.4) + E(95, 64, 2.5, 8, C.gray, 1.4);
    return s;
  },
  tren: (f) => {
    let s = '';
    const n = f.ucvagon === false ? 2 : 3;
    const vw = 18; const x0 = 70 - n * (vw + 3);
    if (f.baca !== false) { s += R(78, 30, 8, 14, OL, 1, 1.5); if (f.baca !== 'no-smoke') s += Ci(82, 22, 5, C.lgray, 1.5) + Ci(76, 14, 6, C.lgray, 1.5) + Ci(86, 10, 4, C.lgray, 1.5); }
    s += R(70, 44, 26, 26, C.red, 3) + R(62, 34, 14, 36, C.red, 2) + R(65, 38, 8, 8, C.sky, 1, 1.5);
    for (let k = 0; k < n; k++) { const x = x0 + k * (vw + 3); s += R(x, 46, vw, 22, [C.blue, C.green, C.yel][k % 3], 2) + R(x + 4, 50, vw - 8, 7, C.sky, 1, 1.4); if (k < n) s += L(`M${x + vw},60 L${x + vw + 3},60`, OL, 2); }
    if (f.teker !== false) { for (let k = 0; k < n; k++) { const x = x0 + k * (vw + 3); s += wheel(x + 5, 72, 4.5) + wheel(x + vw - 5, 72, 4.5); } s += wheel(70, 72, 6) + wheel(88, 72, 6); }
    else s += R(x0 - 2, 66, 100 - x0, 10, C.gray, 2, 2);
    return s;
  },
  kayik: (f) => {
    let s = '';
    s += L('M50,70 L50,12', OL, 3);
    if (f.bayrak) s += P('M50,12 L64,16 L50,20 Z', C.red, 1.5);
    if (f.ucgenyelken === false) s += R(22, 22, 26, 38, '#fff', 2, 2) + R(53, 22, 22, 38, '#fff', 2, 2);
    else s += P('M47,20 L47,62 L18,62 Z', '#fff') + P('M53,24 L53,62 L80,62 Z', '#fff');
    s += P('M8,68 L92,68 L80,88 L20,88 Z', f.ahsap === false ? C.blue : C.wood);
    if (f.ahsap !== false) s += L('M14,75 L86,75 M18,81 L82,81', C.brown, 1.4);
    if (f.dumen) s += Ci(78, 62, 6, 'none', 2) + L('M72,62 L84,62 M78,56 L78,68 M74,58 L82,66 M82,58 L74,66', OL, 1.4);
    s += L('M2,92 Q12,86 22,92 T42,92 T62,92 T82,92 T100,92', C.blue, 2);
    return s;
  },
  helikopter: (f) => {
    const c = C.yel;
    let s = '';
    if (f.kuyruk !== false) s += P('M14,44 L46,48 L46,56 L14,50 Z', c, 2) + P('M8,36 L16,36 L18,54 L10,54 Z', c, 1.8);
    if (f.ayak !== false) s += L('M44,74 L40,84 M70,74 L74,84 M30,84 L86,84', OL, 3);
    s += P('M40,52 C40,34 56,30 72,32 C88,34 94,48 90,60 C86,72 72,76 56,76 C44,76 40,66 40,52 Z', c);
    if (f.pencere !== false) s += f.yuvarlak ? Ci(76, 48, 8, C.sky, 2) + Ci(58, 50, 6, C.sky, 2) : R(68, 40, 16, 14, C.sky, 1, 2) + R(52, 44, 11, 11, C.sky, 1, 2);
    s += R(62, 22, 4, 10, OL, 1, 1);
    if (f.pervane !== false) s += R(28, 18, 72, 5, OL, 2, 1);
    return s;
  },
  otobus: (f) => {
    const c = C.red;
    let s = '';
    const top = f.ikikat === false ? 40 : 14;
    s += R(6, top, 88, 74 - top, c, 6);
    const rows = f.ikikat === false ? [48] : [22, 48];
    rows.forEach(y => { [12, 28, 44, 60, 76].forEach(x => { s += R(x, y, 12, 11, C.sky, 2, 1.6); }); });
    if (f.ikikat !== false) s += L('M6,40 L94,40', OL, 2);
    // kapı
    if (f.acikkapi) s += R(20, 60, 12, 14, '#334155', 1, 1.8) + R(14, 60, 5, 14, C.sky, 1, 1.4) + R(33, 60, 5, 14, C.sky, 1, 1.4);
    else s += R(20, 60, 14, 14, C.sky, 1, 1.8) + L('M27,60 L27,74', OL, 1.6);
    if (f.dortteker !== false) s += wheel(26, 76, 7) + wheel(46, 76, 7) + wheel(62, 76, 7) + wheel(80, 76, 7);
    else s += wheel(26, 76, 7) + wheel(76, 76, 7);
    return s;
  },
  kamyon: (f) => {
    let s = '';
    if (f.kasa !== false) s += R(4, 26, 58, 42, C.blue, 2);
    else s += R(4, 60, 58, 8, C.gray, 1, 2);
    if (f.yuk) s += R(10, 12, 16, 14, C.wood, 1, 2) + R(28, 12, 16, 14, C.wood, 1, 2) + R(19, 0, 16, 12, C.wood, 1, 2);
    s += P('M64,68 L64,34 L82,34 L94,50 L94,68 Z', C.red) + P('M68,38 L80,38 L88,50 L68,50 Z', C.sky, 2);
    if (f.yuvarlakfar !== false) s += Ci(90, 58, 6, C.yel, 1.8); else s += R(85, 53, 10, 10, C.yel, 0, 1.8);
    const r = f.kalinteker === false || f.buyukteker === false ? 6 : 10;
    s += wheel(18, 72, r, f.kalinteker !== false) + wheel(46, 72, r, f.kalinteker !== false) + wheel(80, 72, r, f.kalinteker !== false);
    return s;
  },
  ambulans: (f) => {
    let s = '';
    if (f.siren !== false) s += R(36, 14, 14, 8, C.blue, 2, 1.8) + (f.isik ? L('M32,12 L28,8 M54,12 L58,8 M43,10 L43,4', C.blue, 1.8) : '');
    s += P('M6,74 L6,22 L66,22 L66,30 L82,30 L94,48 L94,74 Z', '#fff');
    s += P('M70,34 L80,34 L88,48 L70,48 Z', C.sky, 2);
    if (f.arti !== false) s += P('M30,36 L38,36 L38,44 L46,44 L46,52 L38,52 L38,60 L30,60 L30,52 L22,52 L22,44 L30,44 Z', C.red, 1.8);
    if (f.arkakapi) s += L('M10,26 L10,70 M18,26 L18,70', OL, 1.6) + R(12, 44, 4, 2, OL, 0, 1);
    s += R(6, 62, 88, 4, C.red, 0, 1.4);
    s += f.faryanik ? Ci(91, 58, 4, C.yel, 1.5) + L('M96,54 L100,52 M97,58 L100,58 M96,62 L100,64', '#f59e0b', 1.8) : Ci(91, 58, 4, C.lgray, 1.5);
    s += wheel(24, 76, 9) + wheel(74, 76, 9);
    return s;
  },
  roket: (f) => {
    let s = '';
    if (f.ates !== false) s += P('M40,76 C38,88 46,94 50,100 C54,94 62,88 60,76 Z', C.ora, 2) + P('M45,76 C44,84 48,88 50,92 C52,88 56,84 55,76 Z', C.yel, 1.4);
    s += P('M36,62 L24,80 L38,76 Z', C.red, 2) + P('M64,62 L76,80 L62,76 Z', C.red, 2);
    s += f.sivri !== false ? P('M36,78 L36,34 C36,20 44,10 50,4 C56,10 64,20 64,34 L64,78 Z', C.lgray) : P('M36,78 L36,22 C36,14 64,14 64,22 L64,78 Z', C.lgray);
    if (f.sivri !== false) s += P('M38,26 C40,18 46,10 50,6 C54,10 60,18 62,26 Z', C.red, 2);
    if (f.pencere !== false) s += Ci(50, 42, 8, C.sky, 2.5);
    return s;
  },

  // ======================= MEYVE - SEBZE =======================
  elma: (f) => {
    const c = f.kirmizi === false ? C.green : C.red;
    let s = f.yuvarlak === false ? P('M50,26 C34,22 28,40 32,58 C34,80 42,92 50,90 C58,92 66,80 68,58 C72,40 66,22 50,26 Z', c) : P('M50,30 C34,20 12,30 14,56 C16,80 34,92 50,86 C66,92 84,80 86,56 C88,30 66,20 50,30 Z', c);
    if (f.sap !== false) s += L('M50,30 C50,22 52,16 56,12', C.brown, 3.5);
    if (f.yaprak) s += P('M54,18 C62,8 76,10 78,16 C70,22 60,22 54,18 Z', C.green, 1.8);
    s += E(34, 46, 4, 8, '#fff', 0).replace('stroke-width="0"', 'opacity=".5" stroke="none"');
    return s;
  },
  muz: (f) => {
    const c = f.sari === false ? C.green : C.yel;
    let s = f.uzun === false ? P('M30,40 C40,70 62,74 74,62 C64,60 46,56 38,38 Z', c) : P('M14,30 C20,70 60,90 90,70 C70,72 34,60 22,26 Z', c);
    if (f.sap !== false) s += f.uzun === false ? P('M30,40 L26,32 L32,30 L38,38 Z', C.brown, 1.6) : P('M14,30 L12,20 L18,18 L22,26 Z', C.brown, 1.6);
    if (f.leke) s += dot(38, 62, 2.5, C.brown) + dot(54, 72, 3, C.brown) + dot(66, 74, 2, C.brown) + dot(30, 50, 2, C.brown);
    return s;
  },
  havuc: (f) => {
    const c = f.turuncu === false ? C.pur : C.ora;
    let s = '';
    if (f.yaprak !== false) s += P('M48,24 C40,10 42,4 46,4 C50,10 50,16 50,24 Z', C.green, 1.6) + P('M52,24 C56,8 64,6 66,10 C62,16 58,20 54,26 Z', C.green, 1.6) + P('M46,26 C34,14 30,16 32,20 C36,24 40,26 46,28 Z', C.green, 1.6);
    s += f.sivri === false ? P('M34,26 L66,26 C68,60 64,82 50,84 C36,82 32,60 34,26 Z', c) : P('M36,24 L64,24 L52,96 L48,96 Z', c);
    if (f.cizgi) s += L('M42,40 L50,42 M50,54 L58,56 M44,66 L52,68', '#9a3412', 1.8);
    return s;
  },
  karpuz: (f) => {
    let s = '';
    if (f.dilim === false) {
      s += E(50, 54, 40, 30, C.green);
      if (f.cizgi !== false) s += L('M24,30 Q20,54 26,78 M40,25 Q36,54 40,84 M60,25 Q64,54 60,84 M76,30 Q80,54 74,78', C.dgreen, 3);
      return s;
    }
    const red = f.kirmiziic === false ? C.yel : C.red;
    if (f.kabuk !== false) s += P('M6,36 C14,84 86,84 94,36 Z', C.green) + (f.cizgi !== false ? L('M20,56 L18,62 M34,68 L33,74 M50,72 L50,78 M66,68 L67,74 M80,56 L82,62', C.dgreen, 2.5) : '') + P('M12,36 C20,72 80,72 88,36 Z', '#f0fdf4', 1.6) + P('M16,36 C24,66 76,66 84,36 Z', red, 1.6);
    else s += P('M14,36 C22,72 78,72 86,36 Z', red);
    if (f.cekirdek !== false) [[34, 46], [50, 52], [66, 46], [42, 58], [58, 58], [50, 42]].forEach(([x, y]) => { s += E(x, y, 1.8, 3, OL, 0).replace('stroke-width="0"', 'stroke="none"'); });
    return s;
  },
  portakal: (f) => {
    const c = f.turuncu === false ? C.yel : C.ora;
    let s = '';
    if (f.dal) s += L('M50,22 C54,12 64,8 74,8', C.brown, 3) + P('M60,12 C66,2 80,4 82,10 C74,16 66,16 60,12 Z', C.green, 1.6);
    s += f.yuvarlak === false ? E(50, 58, 26, 36, c) : Ci(50, 58, 36, c);
    if (f.puruzlu !== false) [[36, 44], [56, 38], [66, 56], [44, 66], [60, 76], [32, 60], [72, 42], [48, 50], [40, 82]].forEach(([x, y]) => { s += dot(x, y, 1.4, '#c2410c'); });
    s += Ci(50, 24, 2.5, C.green, 1.4);
    return s;
  },
  cilek: (f) => {
    const c = f.kirmizi === false ? C.green : C.red;
    let s = '';
    if (f.dilim) s += P('M20,30 L80,30 C80,60 64,90 50,92 C36,90 20,60 20,30 Z', c) + P('M28,34 L72,34 C70,58 60,80 50,82 C40,80 30,58 28,34 Z', '#fecaca', 1.4);
    else s += P('M50,92 C30,86 14,60 18,38 C22,26 40,26 50,30 C60,26 78,26 82,38 C86,60 70,86 50,92 Z', c);
    if (f.yaprak !== false) s += P('M30,30 L38,18 L44,28 L50,14 L56,28 L62,18 L70,30 C60,36 40,36 30,30 Z', C.green, 1.8);
    if (f.nokta !== false) [[36, 46], [50, 44], [64, 46], [30, 60], [44, 60], [58, 60], [70, 60], [40, 74], [54, 74], [48, 84]].forEach(([x, y]) => { s += E(x, y, 1.2, 2, f.dilim ? '#991b1b' : OL, 0).replace('stroke-width="0"', 'stroke="none"'); });
    return s;
  },
  uzum: (f) => {
    const c = f.mor === false ? C.green : C.pur;
    const rx = f.yuvarlaktane === false ? 5 : 7.5, ry = f.yuvarlaktane === false ? 9 : 7.5;
    let s = '';
    s += L('M50,20 L50,8', C.brown, 3);
    if (f.yaprak !== false) s += P('M52,14 C62,2 80,6 84,14 C76,22 62,22 52,14 Z', C.green, 1.8);
    const pts = f.salkim === false ? [[22, 40], [70, 34], [46, 60], [80, 78], [24, 80]] : [[38, 28], [52, 26], [66, 30], [32, 42], [46, 40], [60, 40], [72, 44], [38, 54], [52, 54], [66, 56], [44, 68], [58, 68], [50, 82]];
    if (f.salkim === false) s += '';
    pts.forEach(([x, y]) => { s += E(x, y, rx, ry, c, 2); });
    return s;
  },
  mantar: (f) => {
    const c = f.kirmizi === false ? C.brown : C.red;
    let s = '';
    s += f.kalinsap === false ? R(44, 46, 12, 44, C.cream, 4) : P('M34,50 L66,50 C70,70 68,86 64,90 L36,90 C32,86 30,70 34,50 Z', C.cream);
    if (f.sapka !== false) s += P('M8,54 C8,16 92,16 92,54 Z', c);
    if (f.sapka !== false && f.benek !== false) s += Ci(32, 38, 5, '#fff', 1.4) + Ci(54, 28, 6, '#fff', 1.4) + Ci(72, 42, 4.5, '#fff', 1.4) + Ci(22, 50, 3, '#fff', 1.2) + Ci(46, 46, 3.5, '#fff', 1.2);
    return s;
  },
  salatalik: (f) => {
    const c = f.yesil === false ? C.yel : C.green;
    let s = f.uzun === false ? E(50, 54, 22, 16, c) : P('M10,60 C10,40 30,30 60,30 C82,30 92,40 92,50 C92,62 80,70 60,70 L30,70 C18,70 10,68 10,60 Z', c);
    if (f.putur !== false) (f.uzun === false ? [[42, 48], [56, 46], [48, 60], [62, 58]] : [[22, 52], [34, 44], [46, 52], [58, 40], [68, 54], [80, 46], [30, 62], [52, 62], [74, 60]]).forEach(([x, y]) => { s += Ci(x, y, 1.8, '#86efac', 1.2); });
    s += R(f.uzun === false ? 70 : 90, f.uzun === false ? 52 : 48, 4, 4, C.brown, 1, 1.4);
    return s;
  },
  kiraz: (f) => {
    let s = '';
    const two = f.ikikiraz !== false;
    if (f.sap !== false) s += L(two ? 'M30,66 C34,40 46,20 56,12 M70,62 C66,40 60,22 56,12' : 'M50,66 C52,40 54,20 56,12', C.green, 3);
    else s += L(two ? 'M30,66 C30,48 26,34 22,24 M70,62 C70,46 74,34 80,24' : 'M50,66 C52,40 54,20 56,12', C.green, 3);
    if (f.yaprak !== false) s += P('M56,12 C66,2 84,6 88,12 C80,20 66,20 56,12 Z', C.green, 1.8);
    if (two) s += Ci(30, 74, 14, C.red) + Ci(70, 70, 14, C.red) + E(25, 69, 3, 4.5, '#fff', 0).replace('stroke-width="0"', 'opacity=".55" stroke="none"') + E(65, 65, 3, 4.5, '#fff', 0).replace('stroke-width="0"', 'opacity=".55" stroke="none"');
    else s += Ci(50, 74, 15, C.red);
    return s;
  }
};
