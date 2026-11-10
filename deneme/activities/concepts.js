import { createSeededRng } from './shared';
import { ART, FX, face, card, put, PALETTE, OL, S, SN, lighten, darken, fade, mix, SKINS, HAIRS } from './conceptArt';
import { make3DDataUrl } from './svg3d';

// ============================================================================
// --- GRUP: KAVRAM SORULARI (EK-7 KAVRAM LİSTESİ) - ŞABLON ÜRETİCİ ---
// ============================================================================
// Her soru kalıbı (ör. "Hangisi kapalıdır?") bir GRUP'tur ve varsayılan 50 şablon üretir.
// Ses grup bazında (o kalıptaki tüm sorulara) eklenir; görseller soru bazında değiştirilebilir.
// Boyut kavramlarında (büyük-küçük, uzun-kısa, ince-kalın, geniş-dar, az-çok...) şıklar AYNI nesnedir.
// Nitelik kavramlarında (canlı-cansız, eğri-düz, hızlı-yavaş, tatlı...) şıklar FARKLI nesnelerdir.

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------
const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
const makeRng = (key, i) => { const r = createSeededRng((hashStr(key) + i * 7919 + 13) >>> 0); r(); r(); return r; };
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length) % arr.length];
const shuffle = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickN = (arr, n, rng, exclude = []) => shuffle(arr.filter(x => !exclude.includes(x)), rng).slice(0, n);
const colorOf = (rng, exclude = []) => pick(PALETTE.filter(c => !exclude.includes(c)), rng);
const uid = (rng) => 'k' + Math.floor(rng() * 1e8).toString(36);

// Doğru şıkkın yeri: her 3 soruluk blokta 0,1,2 konumları karışık sırayla bir kez kullanılır (dengeli dağılım)
const slotFor = (key, i) => { const perm = shuffle([0, 1, 2], makeRng(key + '#slot', Math.floor(i / 3))); return perm[i % 3]; };
const arrange = (key, i, correct, wrongs, mainImage = '') => {
  const slot = slotFor(key, i);
  const opts = [...wrongs.slice(0, 2)];
  opts.splice(slot, 0, correct);
  return { options: opts, correctIndex: slot, mainImage };
};

const draw = (k, c, o) => ART[k](c, o || {});
const objCard = (k, c, o = {}, s = 0.84, extra = '', bg) => card(put(draw(k, c, o), 50, 50, s) + extra, bg ? { bg } : undefined);

const arrow = (x1, y1, x2, y2, col = '#ef4444', w = 5) => {
  const a = Math.atan2(y2 - y1, x2 - x1); const hl = w * 2.6;
  const bx = x2 - hl * Math.cos(a), by = y2 - hl * Math.sin(a);
  const p1 = `${(bx + hl * 0.6 * Math.sin(a)).toFixed(1)},${(by - hl * 0.6 * Math.cos(a)).toFixed(1)}`;
  const p2 = `${(bx - hl * 0.6 * Math.sin(a)).toFixed(1)},${(by + hl * 0.6 * Math.cos(a)).toFixed(1)}`;
  return `<line x1="${x1}" y1="${y1}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${x2},${y2} ${p1} ${p2}" fill="${col}" stroke="${col}" stroke-width="1.5" stroke-linejoin="round"/>`;
};
const txt = (x, y, t, size = 40, col = OL) => `<text x="${x}" y="${y}" font-size="${size}" font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="central" fill="${col}">${t}</text>`;

// N adet çizimi kutuya düzgünce dizer (beşli satırlar -> sayma kolaylığı)
const groupLayout = (n, inner, box = { x: 7, y: 7, w: 86, h: 86 }, maxS = 0.5) => {
  if (n <= 0) return '';
  const cols = n <= 3 ? n : n === 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 5;
  const rows = Math.ceil(n / cols);
  const cell = Math.min(box.w / cols, box.h / rows);
  const s = Math.min(maxS, (cell / 100) * 0.92);
  const oy = box.y + (box.h - rows * cell) / 2;
  let out = '';
  for (let k = 0; k < n; k++) {
    const r = Math.floor(k / cols); const inRow = Math.min(cols, n - r * cols); const ci = k % cols;
    const ox = box.x + (box.w - inRow * cell) / 2;
    out += put(inner, ox + ci * cell + cell / 2, oy + r * cell + cell / 2, s);
  }
  return out;
};

// ---------------------------------------------------------------------------
// Nesne havuzları
// ---------------------------------------------------------------------------
const COLORABLE = ['ball', 'star', 'heart', 'fish', 'balloon', 'umbrella', 'cup', 'book', 'car', 'flower', 'butterfly', 'shirt', 'sock', 'shoe', 'kite', 'boat', 'giftBox', 'candy', 'truck', 'bus', 'yarn', 'pillow', 'drum', 'clock', 'mushroom', 'house'];
const isColorable = (k) => COLORABLE.includes(k);
const colFor = (k, rng, exclude) => (isColorable(k) ? colorOf(rng, exclude) : undefined);

const SIZE_OBJS = ['ball', 'star', 'heart', 'apple', 'fish', 'balloon', 'car', 'house', 'tree', 'flower', 'umbrella', 'cup', 'teddy', 'duck', 'cat', 'dog', 'butterfly', 'mushroom', 'giftBox', 'boat', 'bird', 'chick', 'rabbit', 'turtle', 'elephant', 'icecream', 'cake', 'sun', 'leaf', 'kite', 'strawberry', 'orange', 'frog', 'snail', 'pine'];
const ITEM_OBJS = ['apple', 'ball', 'star', 'heart', 'fish', 'balloon', 'car', 'flower', 'duck', 'cat', 'butterfly', 'mushroom', 'cup', 'chick', 'strawberry', 'leaf', 'umbrella', 'teddy', 'kite', 'orange', 'bird', 'giftBox', 'frog', 'rabbit', 'icecream', 'lollipop'];
const COUNT_OBJS = ['apple', 'ball', 'star', 'heart', 'fish', 'balloon', 'flower', 'duck', 'butterfly', 'mushroom', 'chick', 'strawberry', 'leaf', 'orange', 'candy', 'cookie', 'egg', 'car', 'cup', 'kite'];
const SIDE_OBJS = ['duck', 'fish', 'bird', 'car', 'truck', 'bus', 'turtle', 'snail', 'elephant', 'sheep', 'airplane'];

// ============================================================================
// --- GENEL ÜRETİCİLER ---
// ============================================================================

// 1) Aynı nesnenin 3 farklı seviyesi (boyut / uzunluk / kalınlık / genişlik / doluluk ...)
//    renderLevel(objIdx, levelValue, color, rng) -> şık görseli
const genLevels = ({ objs, levels, correctLevel, render }) => (key, i) => {
  const rng = makeRng(key, i);
  const k = objs[i % objs.length];
  const c = colorOf(rng);
  const others = levels.filter((_, li) => li !== correctLevel);
  return arrange(key, i, render(k, levels[correctLevel], c, rng), others.map(l => render(k, l, c, rng)));
};

// 2) Farklı nesneler: doğru şık A havuzundan, yanlışlar B havuzundan
const genPools = ({ yes, no, cardFn }) => (key, i) => {
  const rng = makeRng(key, i);
  const a = yes[i % yes.length];
  const bs = pickN(no, 2, rng);
  const render = cardFn || ((it) => { const [k, c, o] = Array.isArray(it) ? it : [it]; return objCard(k, c ?? colFor(k, rng), o); });
  return arrange(key, i, render(a, rng), bs.map(b => render(b, rng)));
};

// 3) İkili durum (açık/kapalı, ıslak/kuru, kirli/temiz ...):
//    doğru = A nesnesi istenen durumda, yanlışlar = A nesnesi zıt durumda + B nesnesi zıt durumda
const genBinary = ({ objs, target, render }) => (key, i) => {
  const rng = makeRng(key, i);
  const a = objs[i % objs.length];
  const b = pick(objs.filter(o => o !== a), rng);
  const ca = colorOf(rng); const cb = colorOf(rng, [ca]);
  return arrange(key, i, render(a, target, ca, rng), [render(a, !target, ca, rng), render(b, !target, cb, rng)]);
};

// ============================================================================
// --- BOYUT ---
// ============================================================================
const sizeRender = (k, s, c) => card(put(draw(k, isColorable(k) ? c : undefined), 50, 92 - 42 * s, s));

const LENGTH_OBJS = ['pencil', 'ruler', 'crayon', 'train', 'caterpillar', 'candle', 'ladder', 'snakeLen', 'rope'];
const lengthRender = (k, L, c) => {
  let inner;
  if (k === 'pencil') inner = draw('pencil', c, { len: L * 0.92 });
  else if (k === 'ruler') inner = draw('ruler', '#facc15', { len: L });
  else if (k === 'crayon') inner = draw('crayon', c, { len: L * 0.95 });
  else if (k === 'train') inner = draw('train', c, { cars: L > 0.9 ? 4 : L > 0.5 ? 2 : 0 });
  else if (k === 'caterpillar') inner = draw('caterpillar', '#22c55e', { n: L > 0.9 ? 6 : L > 0.5 ? 3 : 1 });
  else if (k === 'candle') inner = draw('candle', c, { h: L * 0.95, w: 16 });
  else if (k === 'ladder') inner = ladder(L, c);
  else if (k === 'snakeLen') inner = `<g transform="translate(50 50) scale(${L} 1) translate(-50 -50)">${draw('rope', c, { th: 10 })}</g><circle cx="${50 + 42 * L}" cy="50" r="8" fill="${c}" ${S}/><circle cx="${52 + 42 * L}" cy="47" r="1.8" fill="${OL}"/>`;
  else inner = `<g transform="translate(50 50) scale(${L} 1) translate(-50 -50)">${draw('rope', c, { th: 7 })}</g>`;
  return card(inner);
};
const ladder = (L, c = '#b45309') => {
  const h = 80 * L; const top = 90 - h; let r = '';
  for (let y = top + 8; y < 88; y += 11) r += `<line x1="36" y1="${y}" x2="64" y2="${y}" stroke="${OL}" stroke-width="5" stroke-linecap="round"/><line x1="36" y1="${y}" x2="64" y2="${y}" stroke="${c}" stroke-width="2.5"/>`;
  return `${r}<rect x="30" y="${top}" width="6" height="${h}" rx="2" fill="${c}" ${S}/><rect x="64" y="${top}" width="6" height="${h}" rx="2" fill="${c}" ${S}/>`;
};

const THICK_OBJS = ['pencil', 'candle', 'rope', 'crayon', 'trunk', 'bookStack'];
const thickRender = (k, t, c) => {
  let inner;
  if (k === 'pencil') inner = draw('pencil', c, { th: 4 + t * 22, len: 0.85 });
  else if (k === 'candle') inner = draw('candle', c, { w: 6 + t * 32, h: 0.75 });
  else if (k === 'rope') inner = draw('rope', c, { th: 2 + t * 18 });
  else if (k === 'crayon') inner = draw('crayon', c, { th: 5 + t * 22 });
  else if (k === 'trunk') { const w = 4 + t * 26; inner = `<path d="M${50 - w / 2},92 L${50 - w / 2},50 L${50 + w / 2},50 L${50 + w / 2},92 Z" fill="#92400e" ${S}/><circle cx="50" cy="34" r="26" fill="#22c55e" ${S}/><circle cx="40" cy="30" r="3.5" fill="#ef4444"/><circle cx="60" cy="38" r="3.5" fill="#ef4444"/>`; }
  else { const pages = Math.round(2 + t * 14); const h = pages * 3.6; inner = `<rect x="18" y="${80 - h}" width="64" height="${h}" rx="2" fill="#fff" ${S}/>${Array.from({ length: pages - 1 }, (_, j) => `<line x1="20" y1="${80 - h + (j + 1) * 3.6}" x2="80" y2="${80 - h + (j + 1) * 3.6}" stroke="#cbd5e1" stroke-width="1"/>`).join('')}<rect x="16" y="80" width="68" height="6" rx="2" fill="${c}" ${S}/><rect x="16" y="${80 - h - 6}" width="68" height="6" rx="2" fill="${c}" ${S}/>`; }
  return card(inner);
};

const WIDTH_OBJS = ['door', 'window', 'road', 'table', 'bed', 'bridge'];
const widthRender = (k, wv, c) => {
  const W = 14 + wv * 70; const x0 = 50 - W / 2;
  let inner;
  if (k === 'door') inner = `<rect x="${x0}" y="12" width="${W}" height="80" fill="${c}" ${S}/><rect x="${x0 + 4}" y="18" width="${W - 8}" height="28" rx="2" fill="none" stroke="${darken(c, 0.3)}" stroke-width="2"/><circle cx="${x0 + W - 6}" cy="56" r="3" fill="#facc15" ${S} stroke-width="1.5"/><rect x="6" y="90" width="88" height="4" fill="#cbd5e1"/>`;
  else if (k === 'window') inner = `<rect x="${x0}" y="20" width="${W}" height="56" fill="#bae6fd" ${S}/><line x1="50" y1="20" x2="50" y2="76" stroke="${c}" stroke-width="4"/><line x1="${x0}" y1="48" x2="${x0 + W}" y2="48" stroke="${c}" stroke-width="4"/><rect x="${x0}" y="20" width="${W}" height="56" ${SN}/><rect x="${x0 - 5}" y="76" width="${W + 10}" height="7" fill="${c}" ${S}/>`;
  else if (k === 'road') inner = `<rect x="2" y="2" width="96" height="96" rx="10" fill="#bbf7d0"/><rect x="${x0}" y="4" width="${W}" height="92" fill="#64748b" ${S}/><line x1="50" y1="8" x2="50" y2="92" stroke="#fff" stroke-width="3" stroke-dasharray="8 7"/>`;
  else if (k === 'table') inner = `<rect x="${x0}" y="40" width="${W}" height="9" rx="2" fill="${c}" ${S}/><rect x="${x0 + 4}" y="49" width="6" height="40" fill="${darken(c, 0.2)}" ${S}/><rect x="${x0 + W - 10}" y="49" width="6" height="40" fill="${darken(c, 0.2)}" ${S}/>`;
  else if (k === 'bed') inner = `<rect x="${x0}" y="24" width="${W}" height="64" rx="4" fill="#92400e" ${S}/><rect x="${x0 + 4}" y="30" width="${W - 8}" height="56" rx="3" fill="${c}" ${S}/><rect x="${x0 + 6}" y="32" width="${W - 12}" height="12" rx="4" fill="#fff" ${S}/>`;
  else inner = `<rect x="2" y="54" width="96" height="40" rx="8" fill="#38bdf8"/><path d="M8,62 q6,-4 12,0 q6,4 12,0 M60,78 q6,-4 12,0 q6,4 12,0" fill="none" stroke="#e0f2fe" stroke-width="2.5"/><rect x="${x0}" y="10" width="${W}" height="80" fill="#a16207" ${S}/>${Array.from({ length: 6 }, (_, j) => `<line x1="${x0}" y1="${22 + j * 12}" x2="${x0 + W}" y2="${22 + j * 12}" stroke="${OL}" stroke-width="1.5"/>`).join('')}`;
  return card(inner);
};

const HEIGHT_OBJS = ['balloon', 'bird', 'kite', 'airplane', 'butterfly', 'star', 'ball', 'cloud'];
const heightRender = (k, hv, c) => {
  const y = 78 - hv * 58;
  const extra = k === 'kite' ? `<path d="M88,86 C80,70 66,${y + 20} 64,${y + 12}" ${SN} stroke-width="1.4"/>` : '';
  return card(`<rect x="2" y="2" width="96" height="96" rx="10" fill="#e0f2fe"/>${ART.ground(100, 86)}${put(ART.house('#ef4444'), 18, 74, 0.3)}<line x1="34" y1="${y}" x2="44" y2="${y}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3"/>${extra}${put(draw(k, isColorable(k) ? c : undefined), 64, y, 0.4)}`);
};

// ============================================================================
// --- MİKTAR ---
// ============================================================================
const countCard = (k, n, c, rng, box) => card(groupLayout(n, draw(k, isColorable(k) ? c : undefined), box));

const genCounts = (sets) => (key, i) => {
  const rng = makeRng(key, i);
  const k = COUNT_OBJS[i % COUNT_OBJS.length]; const c = colorOf(rng);
  const [cor, w1, w2] = sets.map(([a, b]) => a + Math.floor(rng() * (b - a + 1)));
  return arrange(key, i, countCard(k, cor, c, rng), [countCard(k, w1, c, rng), countCard(k, w2, c, rng)]);
};

// Kaplar (boş / dolu)
const CONTAINERS = ['glass', 'jar', 'bucket', 'aquarium', 'bottle', 'basket', 'plate'];
const container = (type, level, c, rng) => {
  const id = uid(rng);
  if (type === 'basket') {
    const n = Math.round(level * 7); let apples = '';
    const spots = [[34, 50], [50, 46], [66, 50], [42, 40], [58, 40], [50, 32], [26, 44]];
    for (let j = 0; j < n; j++) apples += put(ART.apple(), spots[j][0], spots[j][1], 0.24);
    return `${apples}<path d="M14,52 L86,52 L76,88 L24,88 Z" fill="#d97706" ${S}/><path d="M18,62 L82,62 M20,72 L80,72 M22,80 L78,80 M34,52 L38,88 M50,52 L50,88 M66,52 L62,88" ${SN} stroke="#92400e" stroke-width="1.6"/><path d="M14,52 C14,20 86,20 86,52" ${SN} stroke="#92400e" stroke-width="4"/>`;
  }
  if (type === 'plate') {
    const n = Math.round(level * 6); let cookies = '';
    const spots = [[38, 58], [62, 58], [50, 54], [30, 50], [70, 50], [50, 42]];
    for (let j = 0; j < n; j++) cookies += put(ART.cookie(), spots[j][0], spots[j][1], 0.26);
    return `<ellipse cx="50" cy="66" rx="42" ry="14" fill="#f8fafc" ${S}/><ellipse cx="50" cy="64" rx="30" ry="8" fill="none" stroke="#cbd5e1" stroke-width="2"/>${cookies}`;
  }
  const shapes = {
    glass: { d: 'M26,16 L74,16 L66,90 L34,90 Z', top: 16, bot: 90, liquid: c },
    jar: { d: 'M30,26 L70,26 L78,40 L78,84 C78,90 74,92 68,92 L32,92 C26,92 22,90 22,84 L22,40 Z', top: 30, bot: 92, liquid: '#f59e0b', lid: `<rect x="28" y="14" width="44" height="12" rx="3" fill="${c}" ${S}/>` },
    bucket: { d: 'M16,30 L84,30 L74,90 L26,90 Z', top: 30, bot: 90, liquid: '#38bdf8', lid: `<path d="M16,30 C16,6 84,6 84,30" ${SN} stroke-width="3"/>` },
    aquarium: { d: 'M10,26 L90,26 L90,88 L10,88 Z', top: 26, bot: 88, liquid: '#7dd3fc' },
    bottle: { d: 'M42,10 L58,10 L58,26 C70,32 72,40 72,48 L72,86 C72,90 68,92 64,92 L36,92 C32,92 28,90 28,86 L28,48 C28,40 30,32 42,26 Z', top: 26, bot: 92, liquid: c }
  };
  const sh = shapes[type];
  const ly = sh.bot - level * (sh.bot - sh.top);
  const fishy = type === 'aquarium' && level > 0.2 ? put(ART.fish('#f97316'), 50, Math.max(ly + 16, 62), 0.3) : '';
  return `<defs><clipPath id="${id}"><path d="${sh.d}"/></clipPath></defs>
    <path d="${sh.d}" fill="#f1f5f9"/>
    ${level > 0 ? `<g clip-path="url(#${id})"><rect x="0" y="${ly}" width="100" height="100" fill="${sh.liquid}"/><line x1="0" y1="${ly}" x2="100" y2="${ly}" stroke="#fff" stroke-width="2" opacity=".6"/></g>` : ''}
    ${fishy}<path d="${sh.d}" ${SN} stroke-width="3"/>${sh.lid || ''}
    <path d="M${type === 'aquarium' ? 16 : 36},${sh.top + 8} L${type === 'aquarium' ? 16 : 36},${sh.top + 30}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
};
const genFill = (target) => (key, i) => {
  const rng = makeRng(key, i);
  const k = CONTAINERS[i % CONTAINERS.length]; const c = colorOf(rng);
  const lv = target === 'full' ? [1, 0, 0.3] : [0, 1, 0.65];
  return arrange(key, i, card(container(k, lv[0], c, rng)), [card(container(k, lv[1], c, rng)), card(container(k, lv[2], c, rng))]);
};

// Yarım / Tam / Parça / Bütün (yuvarlak yiyecekler)
const FOODS = ['pizza', 'orange', 'cookie', 'cake', 'watermelon', 'lemon'];
const foodWhole = (t) => {
  if (t === 'pizza') return `<circle cx="50" cy="50" r="36" fill="#d97706" ${S}/><circle cx="50" cy="50" r="30" fill="#fde047"/><circle cx="38" cy="38" r="5" fill="#dc2626"/><circle cx="62" cy="40" r="5" fill="#dc2626"/><circle cx="56" cy="62" r="5" fill="#dc2626"/><circle cx="36" cy="60" r="5" fill="#dc2626"/><circle cx="50" cy="50" r="2.5" fill="#16a34a"/><circle cx="66" cy="54" r="2.5" fill="#16a34a"/><circle cx="44" cy="70" r="2.5" fill="#16a34a"/>`;
  if (t === 'orange' || t === 'lemon') {
    const a = t === 'orange' ? '#f97316' : '#facc15'; const b = t === 'orange' ? '#fdba74' : '#fef08a'; let seg = '';
    for (let j = 0; j < 8; j++) { const ang = j * 45 * Math.PI / 180; seg += `<line x1="50" y1="50" x2="${50 + 29 * Math.cos(ang)}" y2="${50 + 29 * Math.sin(ang)}" stroke="#fff" stroke-width="2.5"/>`; }
    return `<circle cx="50" cy="50" r="36" fill="${a}" ${S}/><circle cx="50" cy="50" r="30" fill="${b}"/>${seg}<circle cx="50" cy="50" r="3" fill="#fff"/>`;
  }
  if (t === 'cookie') return ART.cookie();
  if (t === 'cake') return `<circle cx="50" cy="50" r="36" fill="#f9a8d4" ${S}/><circle cx="50" cy="50" r="27" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="4 5"/><circle cx="50" cy="50" r="8" fill="#ef4444" ${S}/><circle cx="34" cy="34" r="2.5" fill="#3b82f6"/><circle cx="66" cy="66" r="2.5" fill="#22c55e"/><circle cx="66" cy="34" r="2.5" fill="#facc15"/><circle cx="34" cy="66" r="2.5" fill="#8b5cf6"/>`;
  return `<circle cx="50" cy="50" r="36" fill="#16a34a" ${S}/><circle cx="50" cy="50" r="32" fill="#f1f5f9"/><circle cx="50" cy="50" r="29" fill="#ef4444"/><ellipse cx="40" cy="40" rx="2" ry="3.5" fill="${OL}"/><ellipse cx="60" cy="42" rx="2" ry="3.5" fill="${OL}"/><ellipse cx="44" cy="60" rx="2" ry="3.5" fill="${OL}"/><ellipse cx="62" cy="60" rx="2" ry="3.5" fill="${OL}"/><ellipse cx="50" cy="50" rx="2" ry="3.5" fill="${OL}"/>`;
};
const foodCard = (t, mode, rot, rng) => {
  const id = uid(rng);
  if (mode === 'whole') return card(put(foodWhole(t), 50, 50, 1.05, rot));
  if (mode === 'half') {
    const th = rot * Math.PI / 180; const dx = (15 * Math.cos(th)).toFixed(1); const dy = (15 * Math.sin(th)).toFixed(1);
    return card(`<g transform="translate(${dx} ${dy})"><g transform="rotate(${rot} 50 50)"><defs><clipPath id="${id}"><rect x="0" y="0" width="50" height="100"/></clipPath></defs><g clip-path="url(#${id})">${put(foodWhole(t), 50, 50, 1.05)}</g><line x1="50" y1="12" x2="50" y2="88" ${S} stroke-width="3"/></g></g>`);
  }
  // dilim (çeyrek parça)
  return card(`<g transform="translate(50 54) scale(1.45) translate(-66 -34) rotate(${rot % 40 - 20} 50 50)"><defs><clipPath id="${id}"><path d="M50,50 L50,0 L100,0 L100,50 Z"/></clipPath></defs><g clip-path="url(#${id})">${put(foodWhole(t), 50, 50, 1.05)}</g><path d="M50,12 L50,50 L88,50" ${SN} stroke-width="2.5"/></g>`);
};
const genFood = (target, wrongMode) => (key, i) => {
  const rng = makeRng(key, i);
  const t = FOODS[i % FOODS.length]; const t2 = pick(FOODS.filter(f => f !== t), rng);
  const rot = Math.floor(rng() * 4) * 90;
  return arrange(key, i, foodCard(t, target, rot, rng), [foodCard(t, wrongMode, rot, rng), foodCard(t2, wrongMode, (rot + 90) % 360, rng)]);
};

// Eşit
const equalCard = (k, a, b, c) => card(`<rect x="6" y="20" width="42" height="64" rx="8" fill="#f1f5f9" ${S} stroke-width="2"/><rect x="52" y="20" width="42" height="64" rx="8" fill="#f1f5f9" ${S} stroke-width="2"/>
  ${groupLayoutCol(a, draw(k, isColorable(k) ? c : undefined), { x: 8, y: 22, w: 38, h: 60 })}${groupLayoutCol(b, draw(k, isColorable(k) ? c : undefined), { x: 54, y: 22, w: 38, h: 60 })}`);
const groupLayoutCol = (n, inner, box) => { // 2 sütunlu dizilim
  if (n <= 0) return ''; const cols = n === 1 ? 1 : 2; const rows = Math.ceil(n / cols); const cell = Math.min(box.w / cols, box.h / rows); const s = Math.min(0.4, cell / 100 * 0.92);
  let out = ''; const oy = box.y + (box.h - rows * cell) / 2;
  for (let j = 0; j < n; j++) { const r = Math.floor(j / cols); const inRow = Math.min(cols, n - r * cols); const ox = box.x + (box.w - inRow * cell) / 2; out += put(inner, ox + (j % cols) * cell + cell / 2, oy + r * cell + cell / 2, s); }
  return out;
};
const genEqual = () => (key, i) => {
  const rng = makeRng(key, i);
  const k = COUNT_OBJS[i % COUNT_OBJS.length]; const c = colorOf(rng);
  const n = 1 + Math.floor(rng() * 5);
  const w1 = n + 1 + Math.floor(rng() * 2); const w2a = Math.max(1, n - 1 - Math.floor(rng() * 2)); const w2b = Math.min(6, w2a + 2 + Math.floor(rng() * 2));
  return arrange(key, i, equalCard(k, n, n, c), [equalCard(k, n, Math.min(6, w1), c), equalCard(k, w2a === w2b ? 1 : w2a, w2a === w2b ? 3 : w2b, c)]);
};

// Hepsi / Hiçbiri
const PAINT_OBJS = ['star', 'heart', 'balloon', 'shirt', 'cup', 'umbrella', 'sock', 'kite', 'fish'];
const paintRow = (k, painted, c) => {
  let out = ''; const pos = [[29, 29], [71, 29], [29, 71], [71, 71]];
  for (let j = 0; j < 4; j++) out += put(draw(k, j < painted ? c : '#ffffff'), pos[j][0], pos[j][1], 0.38);
  return card(out);
};
const genPaint = (target) => (key, i) => {
  const rng = makeRng(key, i);
  const k = PAINT_OBJS[i % PAINT_OBJS.length]; const c = colorOf(rng);
  const w = target === 4 ? [0, 2 + Math.floor(rng() * 2)] : [4, 1 + Math.floor(rng() * 2)];
  return arrange(key, i, paintRow(k, target, c), w.map(x => paintRow(k, x, c)));
};

// ============================================================================
// --- SAYI / SAYMA ---
// ============================================================================
const numberMain = (n) => card(`${txt(100, 52, n, 64, '#4f46e5')}`, { w: 200, h: 100, bg: '#eef2ff' });
const numCard = (n, col = '#4f46e5') => card(txt(50, 52, n, 52, col));
const genNumbers = () => (key, i) => {
  const rng = makeRng(key, i);
  const n = (i % 20) + 1;
  const k = COUNT_OBJS[(i * 7 + 3) % COUNT_OBJS.length]; const c = colorOf(rng);
  const d = n > 10 ? 2 : 1;
  let w1 = n + d, w2 = n - d;
  if (w2 < 1) w2 = n + d * 2;
  if (w1 > 20) w1 = n - d * 2;
  return arrange(key, i, countCard(k, n, c, rng), [countCard(k, w1, c, rng), countCard(k, w2, c, rng)], numberMain(n));
};

const ZERO_SCENES = ['plate', 'basket', 'aquarium', 'nest', 'tree', 'vase'];
const zeroCard = (t, n, rng) => {
  if (t === 'plate') return card(container('plate', n / 6, '#ef4444', rng));
  if (t === 'basket') return card(container('basket', n / 7, '#ef4444', rng));
  if (t === 'aquarium') {
    let f = ''; const sp = [[34, 62], [64, 54], [48, 76]];
    for (let j = 0; j < n; j++) f += put(ART.fish(PALETTE[j + 2]), sp[j][0], sp[j][1], 0.3);
    return card(`<rect x="10" y="26" width="80" height="62" fill="#7dd3fc"/>${f}<rect x="10" y="26" width="80" height="62" ${SN} stroke-width="3"/><path d="M14,84 q4,-10 8,0 q4,-12 8,0" fill="#22c55e"/>`);
  }
  if (t === 'nest') {
    let e = ''; const sp = [[40, 52], [60, 52], [50, 48]];
    for (let j = 0; j < n; j++) e += put(ART.egg(), sp[j][0], sp[j][1], 0.24);
    return card(`${e}<path d="M14,54 C14,84 86,84 86,54 Z" fill="#a16207" ${S}/><path d="M16,60 L84,58 M20,68 L80,70 M28,76 L72,74" ${SN} stroke="#713f12" stroke-width="2"/>`);
  }
  if (t === 'tree') {
    let a = ''; const sp = [[36, 32], [62, 38], [48, 52]];
    for (let j = 0; j < n; j++) a += `<circle cx="${sp[j][0]}" cy="${sp[j][1]}" r="6" fill="#ef4444" ${S} stroke-width="1.6"/>`;
    return card(`<path d="M44,92 L46,60 L54,60 L56,92 Z" fill="#92400e" ${S}/><path d="M50,12 C66,12 76,24 74,36 C86,40 86,60 72,64 C68,74 56,74 50,68 C44,74 30,74 28,64 C14,60 14,40 26,36 C24,24 34,12 50,12 Z" fill="#22c55e" ${S}/>${a}`);
  }
  let fl = ''; const sp = [[-14, 0], [14, 0], [0, -8]];
  for (let j = 0; j < n; j++) fl += `<path d="M50,58 L${50 + sp[j][0]},${30 + sp[j][1]}" ${SN} stroke="#16a34a" stroke-width="3"/>${put(ART.flower(PALETTE[j + 4]), 50 + sp[j][0], 26 + sp[j][1], 0.26)}`;
  return card(`${fl}<path d="M34,56 L66,56 L60,90 L40,90 Z" fill="#60a5fa" ${S}/>`);
};
const genZero = () => (key, i) => {
  const rng = makeRng(key, i);
  const t = ZERO_SCENES[i % ZERO_SCENES.length];
  const a = 1 + Math.floor(rng() * 2); const b = a === 1 ? 2 + Math.floor(rng() * 2) : 3;
  return arrange(key, i, zeroCard(t, 0, rng), [zeroCard(t, a, rng), zeroCard(t, b, rng)]);
};

// Sıra sahnesi: soldan sağa 5 farklı nesne, ok yönü
const rowScene = (items, rng) => {
  let s = `<line x1="16" y1="104" x2="276" y2="104" stroke="#cbd5e1" stroke-width="3"/>${arrow(20, 116, 140, 116, '#22c55e', 4)}`;
  s += `<path d="M12,30 L12,100 M12,30 L28,36 L12,42" fill="#22c55e" ${S}/>`;
  items.forEach((it, j) => { s += put(draw(it.k, it.c), 60 + j * 52, 64, 0.5); });
  return card(s, { w: 300, h: 126 });
};
const pickRowItems = (rng, n = 5) => pickN(ITEM_OBJS, n, rng).map(k => ({ k, c: isColorable(k) ? colorOf(rng) : undefined }));
const genRow = (posFn) => (key, i) => {
  const rng = makeRng(key, i);
  const items = pickRowItems(rng);
  const pos = posFn(items.length);
  const others = pickN([0, 1, 2, 3, 4].filter(p => p !== pos), 2, rng);
  const oc = (it) => objCard(it.k, it.c, {}, 0.8);
  return arrange(key, i, oc(items[pos]), others.map(p => oc(items[p])), rowScene(items, rng));
};

// Önceki / Sonraki sayı
const seqMain = (n, missingBefore) => {
  const box = (x, t, q) => `<rect x="${x}" y="18" width="70" height="70" rx="12" fill="${q ? '#fef3c7' : '#fff'}" stroke="${q ? '#f59e0b' : '#6366f1'}" stroke-width="3" ${q ? 'stroke-dasharray="7 5"' : ''}/>${txt(x + 35, 54, t, 40, q ? '#d97706' : '#4f46e5')}`;
  return card(missingBefore ? `${box(28, '?', true)}${arrow(106, 53, 140, 53, '#64748b', 4)}${box(150, n)}` : `${box(28, n)}${arrow(106, 53, 140, 53, '#64748b', 4)}${box(150, '?', true)}`, { w: 248, h: 106, bg: '#f8fafc' });
};
const genSeqNum = (before) => (key, i) => {
  const rng = makeRng(key, i);
  const n = 2 + (i % 18);
  const cor = before ? n - 1 : n + 1;
  const pool = [n - 2, n - 1, n + 1, n + 2, n].filter(x => x >= 0 && x <= 21 && x !== cor);
  const w = pickN(pool, 2, rng);
  return arrange(key, i, numCard(cor), w.map(x => numCard(x)), seqMain(n, before));
};

// ============================================================================
// --- YÖN / MEKÂNDA KONUM SAHNELERİ ---
// ============================================================================
const sceneBg = (w, h, groundY) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="12" fill="#f0f9ff"/><rect x="2" y="${groundY}" width="${w - 4}" height="${h - groundY - 2}" fill="#dcfce7"/><line x1="2" y1="${groundY}" x2="${w - 2}" y2="${groundY}" stroke="#86efac" stroke-width="2.5"/>`;
const sceneItems = (rng, n, exclude = []) => pickN(ITEM_OBJS.filter(k => !exclude.includes(k)), n, rng).map(k => ({ k, c: isColorable(k) ? colorOf(rng) : undefined }));
const itemCard = (it) => objCard(it.k, it.c, {}, 0.8);
// sahne + üç nesne -> doğru index
const sceneTemplate = (key, i, sceneSvg, items, correctPos) => {
  const wrongs = items.filter((_, j) => j !== correctPos);
  return arrange(key, i, itemCard(items[correctPos]), wrongs.map(itemCard), sceneSvg);
};

// Kuyruk (en önde / en arkada) - yandan görünen nesneler sağa doğru yürür
const genQueue = (front) => (key, i) => {
  const rng = makeRng(key, i);
  const items = pickN(SIDE_OBJS, 3, rng).map(k => ({ k, c: isColorable(k) ? colorOf(rng) : undefined }));
  let s = sceneBg(300, 130, 96) + arrow(190, 22, 280, 22, '#ef4444', 4.5);
  items.forEach((it, j) => { s += put(draw(it.k, it.c), 58 + j * 86, 66, 0.74); });
  s += `<path d="M286,96 L286,40 M286,40 L270,46 L286,52" fill="#ef4444" ${S}/>`;
  return sceneTemplate(key, i, card(s, { w: 300, h: 130 }), items, front ? 2 : 0);
};

// Kutunun önünde / arkasında / yanında
const genBox = (front) => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['umbrella', 'kite']);
  const bc = pick(['#d97706', '#a16207', '#b45309', '#c2410c'], rng);
  const box = `<rect x="66" y="52" width="88" height="62" fill="${bc}" ${S}/><path d="M66,52 L80,40 L168,40 L154,52 Z" fill="${lighten(bc, 0.25)}" ${S}/><path d="M154,52 L168,40 L168,102 L154,114 Z" fill="${darken(bc, 0.2)}" ${S}/><path d="M66,66 L154,66" stroke="${darken(bc, 0.25)}" stroke-width="2"/>`;
  let s = sceneBg(240, 140, 112);
  s += put(draw(items[1].k, items[1].c), 118, 26, 0.56);          // arkasında (kutu altını kapatır)
  s += box;
  s += put(draw(items[0].k, items[0].c), 106, 104, 0.5);          // önünde (kutunun önünü kapatır)
  s += put(draw(items[2].k, items[2].c), 206, 90, 0.48);          // yanında
  return sceneTemplate(key, i, card(s, { w: 240, h: 140 }), items, front ? 0 : 1);
};

// Raf: yukarıda / aşağıda
const genShelf = (up) => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['kite', 'balloon']);
  const wc = pick(['#a16207', '#92400e', '#b45309'], rng);
  let s = `<rect x="2" y="2" width="196" height="196" rx="12" fill="#fefce8"/><rect x="44" y="12" width="112" height="180" fill="${lighten(wc, 0.55)}" ${S}/>`;
  [70, 128, 186].forEach(y => { s += `<rect x="44" y="${y - 4}" width="112" height="8" fill="${wc}" ${S}/>`; });
  s += `<rect x="40" y="10" width="8" height="184" fill="${wc}" ${S}/><rect x="152" y="10" width="8" height="184" fill="${wc}" ${S}/>`;
  items.forEach((it, j) => { s += put(draw(it.k, it.c), 100, 44 + j * 58, 0.42); });
  return sceneTemplate(key, i, card(s, { w: 200, h: 200 }), items, up ? 0 : 2);
};

// Ortada (dikey/yatay sıra değil: masa üstünde 3 nesne -> ortadaki)
const tableSvg = (c) => `<rect x="50" y="62" width="140" height="10" rx="3" fill="${c}" ${S}/><rect x="58" y="72" width="8" height="48" fill="${darken(c, 0.2)}" ${S}/><rect x="174" y="72" width="8" height="48" fill="${darken(c, 0.2)}" ${S}/>`;
const genTable = (mode) => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['kite', 'balloon', 'umbrella']);
  const tc = pick(['#b45309', '#a16207', '#7c2d12', '#0e7490'], rng);
  let s = sceneBg(240, 140, 120) + tableSvg(tc);
  if (mode === 'middle') {
    [80, 120, 160].forEach((x, j) => { s += put(draw(items[j].k, items[j].c), x, 40, 0.42); });
    return sceneTemplate(key, i, card(s, { w: 240, h: 140 }), items, 1);
  }
  s += put(draw(items[0].k, items[0].c), 120, 38, 0.48);  // üstünde
  s += put(draw(items[1].k, items[1].c), 120, 98, 0.42);  // altında
  s += put(draw(items[2].k, items[2].c), 214, 98, 0.42);  // yanında
  return sceneTemplate(key, i, card(s, { w: 240, h: 140 }), items, mode === 'on' ? 0 : 1);
};

// Arasında: iki ağaç
const genBetween = () => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['kite', 'balloon']);
  let s = sceneBg(300, 130, 110);
  s += put(ART.pine(), 100, 70, 0.8) + put(ART.pine(), 200, 70, 0.8);
  s += put(draw(items[0].k, items[0].c), 150, 90, 0.44);
  s += put(draw(items[1].k, items[1].c), 36, 90, 0.44);
  s += put(draw(items[2].k, items[2].c), 264, 90, 0.44);
  return sceneTemplate(key, i, card(s, { w: 300, h: 130 }), items, 0);
};

// Yanında: ev
const genBeside = () => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['umbrella']);
  const hc = colorOf(rng);
  let s = sceneBg(240, 160, 138) + put(ART.house(hc), 84, 96, 0.92);
  s += put(draw(items[0].k, items[0].c), 150, 116, 0.42); // yanında
  s += put(draw(items[1].k, items[1].c), 84, 30, 0.36);   // çatının üstünde
  s += put(draw(items[2].k, items[2].c), 204, 30, 0.36);  // gökyüzünde uzakta
  return sceneTemplate(key, i, card(s, { w: 240, h: 160 }), items, 0);
};

// Sağında / solunda (top referans)
const genSideOf = (right) => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['ball']);
  const bc = colorOf(rng);
  let s = sceneBg(300, 150, 122) + put(ART.ball(bc), 150, 92, 0.52);
  s += put(draw(items[0].k, items[0].c), 232, 96, 0.48);
  s += put(draw(items[1].k, items[1].c), 68, 96, 0.48);
  s += put(draw(items[2].k, items[2].c), 150, 32, 0.4);
  return sceneTemplate(key, i, card(s, { w: 300, h: 150 }), items, right ? 0 : 1);
};

// En sağda / en solda
const genLeftRight = (right) => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3);
  let s = sceneBg(300, 120, 100);
  items.forEach((it, j) => { s += put(draw(it.k, it.c), 60 + j * 90, 60, 0.62); });
  return sceneTemplate(key, i, card(s, { w: 300, h: 120 }), items, right ? 2 : 0);
};

// İç / Dış (çit)
const fencePen = (cx, cy, rx, ry) => {
  let posts = '';
  for (let j = 0; j < 18; j++) { const a = j * 20 * Math.PI / 180; const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a); posts += `<rect x="${x - 3}" y="${y - 12}" width="6" height="14" rx="1.5" fill="#d97706" ${S} stroke-width="1.5"/>`; }
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#bbf7d0" stroke="#a16207" stroke-width="4"/>${posts}`;
};
const genPen = (inside) => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['kite', 'balloon', 'umbrella']);
  let s = `<rect x="2" y="2" width="296" height="146" rx="12" fill="#fefce8"/>` + fencePen(150, 80, 70, 46);
  if (inside) {
    s += put(draw(items[0].k, items[0].c), 150, 76, 0.5);
    s += put(draw(items[1].k, items[1].c), 38, 80, 0.46);
    s += put(draw(items[2].k, items[2].c), 262, 80, 0.46);
  } else {
    s += put(draw(items[0].k, items[0].c), 262, 80, 0.46);
    s += put(draw(items[1].k, items[1].c), 122, 78, 0.42);
    s += put(draw(items[2].k, items[2].c), 178, 78, 0.42);
  }
  return sceneTemplate(key, i, card(s, { w: 300, h: 150 }), items, 0);
};

// İçinde / Dışında (sepet)
const genBasket = (inside) => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['kite', 'balloon', 'umbrella']);
  const front = `<path d="M84,74 L216,74 L200,124 L100,124 Z" fill="#d97706" ${S}/><path d="M90,88 L210,88 M95,102 L205,102 M98,114 L202,114 M120,74 L124,124 M150,74 L150,124 M180,74 L176,124" ${SN} stroke="#92400e" stroke-width="1.8"/>`;
  const handle = `<path d="M84,74 C84,24 216,24 216,74" ${SN} stroke="#92400e" stroke-width="5"/>`;
  let s = sceneBg(300, 140, 124) + handle;
  if (inside) {
    s += put(draw(items[0].k, items[0].c), 150, 56, 0.52) + front;
    s += put(draw(items[1].k, items[1].c), 40, 100, 0.46) + put(draw(items[2].k, items[2].c), 260, 100, 0.46);
  } else {
    s += put(draw(items[1].k, items[1].c), 122, 58, 0.46) + put(draw(items[2].k, items[2].c), 178, 58, 0.46) + front;
    s += put(draw(items[0].k, items[0].c), 260, 100, 0.46);
  }
  return sceneTemplate(key, i, card(s, { w: 300, h: 140 }), items, 0);
};

// Uzak / yakın (eve göre)
const genDistance = (near) => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['kite', 'balloon']);
  const hc = colorOf(rng);
  let s = sceneBg(300, 120, 100) + put(ART.house(hc), 36, 64, 0.62);
  [100, 176, 264].forEach((x, j) => { s += put(draw(items[j].k, items[j].c), x, 78, 0.42); });
  return sceneTemplate(key, i, card(s, { w: 300, h: 120 }), items, near ? 0 : 2);
};

// Başlangıç / bitiş (yol)
const genPath = (start) => (key, i) => {
  const rng = makeRng(key, i);
  const items = sceneItems(rng, 3, ['kite', 'balloon']);
  const road = 'M30,100 C80,100 90,50 150,60 C210,70 220,100 270,96';
  let s = `<rect x="2" y="2" width="296" height="136" rx="12" fill="#dcfce7"/><path d="${road}" fill="none" stroke="${OL}" stroke-width="26" stroke-linecap="round"/><path d="${road}" fill="none" stroke="#fde68a" stroke-width="21" stroke-linecap="round"/>`;
  s += `<path d="M18,104 L18,40" ${SN} stroke-width="3"/><path d="M18,40 L44,48 L18,56 Z" fill="#22c55e" ${S}/>`;
  let checks = ''; for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) if ((r + q) % 2 === 0) checks += `<rect x="${284 - 26 + q * 6.5}" y="${30 + r * 6.5}" width="6.5" height="6.5" fill="${OL}"/>`;
  s += `<path d="M284,100 L284,30" ${SN} stroke-width="3"/><rect x="258" y="30" width="26" height="19.5" fill="#fff" ${S} stroke-width="1.6"/>${checks}`;
  s += arrow(120, 120, 180, 120, '#ef4444', 4);
  s += put(draw(items[0].k, items[0].c), 50, 82, 0.42) + put(draw(items[1].k, items[1].c), 150, 42, 0.42) + put(draw(items[2].k, items[2].c), 248, 78, 0.42);
  return sceneTemplate(key, i, card(s, { w: 300, h: 140 }), items, start ? 0 : 2);
};

// Yön kartları: yukarı / aşağı, ileri / geri, içeri / dışarı
const DIR_OBJS = ['rocket', 'airplane', 'bird', 'balloon', 'ball', 'butterfly', 'fish', 'kite', 'star'];
const dirCard = (k, dir, c) => {
  // yandan görünenler (uçak, kuş, balık) sağa bakar; roket yukarı bakar
  const facesRight = ['airplane', 'bird', 'fish'].includes(k);
  let rot = 0; let flip = false;
  if (k === 'rocket') rot = dir === 'up' ? 0 : dir === 'down' ? 180 : dir === 'right' ? 90 : -90;
  else if (facesRight) { if (dir === 'up') rot = -70; else if (dir === 'down') rot = 70; else if (dir === 'left') flip = true; }
  const ar = dir === 'up' ? arrow(86, 80, 86, 18, '#ef4444', 5) : dir === 'down' ? arrow(86, 20, 86, 82, '#ef4444', 5) : dir === 'right' ? arrow(18, 88, 82, 88, '#ef4444', 5) : arrow(82, 88, 18, 88, '#ef4444', 5);
  return card(put(draw(k, isColorable(k) ? c : undefined), 46, 48, 0.62, rot, flip) + ar);
};
const genUpDown = (up) => (key, i) => {
  const rng = makeRng(key, i);
  const k = DIR_OBJS[i % DIR_OBJS.length]; const c = colorOf(rng);
  const side = rng() < 0.5 ? 'right' : 'left';
  return arrange(key, i, dirCard(k, up ? 'up' : 'down', c), [dirCard(k, up ? 'down' : 'up', c), dirCard(k, side, c)]);
};

const MOVERS = ['car', 'truck', 'bus', 'duck', 'turtle', 'elephant', 'sheep', 'snail', 'bird', 'fish'];
const moveCard = (k, forward, c, faceLeft) => {
  const flip = !!faceLeft;
  const ahead = forward !== flip; // ok sağa mı?
  const ar = ahead ? arrow(22, 90, 84, 90, '#ef4444', 5) : arrow(78, 90, 16, 90, '#ef4444', 5);
  return card(put(draw(k, isColorable(k) ? c : undefined), 50, 46, 0.7, 0, flip) + ar);
};
const genForward = (forward) => (key, i) => {
  const rng = makeRng(key, i);
  const k = MOVERS[i % MOVERS.length]; const k2 = pick(MOVERS.filter(m => m !== k), rng);
  const c = colorOf(rng); const c2 = colorOf(rng, [c]);
  const fl = i % 5 === 4;
  return arrange(key, i, moveCard(k, forward, c, fl), [moveCard(k, !forward, c, fl), moveCard(k2, !forward, c2, false)]);
};

const ENTRANTS = ['kid', 'cat', 'dog', 'chick', 'duck', 'rabbit', 'teddy'];
const doorCard = (who, inward, hc, cc) => {
  const fig = who === 'kid' ? ART.kid(cc) : draw(who, isColorable(who) ? cc : undefined);
  const ar = inward ? arrow(94, 92, 52, 92, '#ef4444', 4.5) : arrow(46, 92, 92, 92, '#ef4444', 4.5);
  return card(`<rect x="2" y="2" width="96" height="96" rx="10" fill="#f0f9ff"/>${put(ART.door('#b45309', { open: true }), 30, 50, 0.7)}<rect x="6" y="18" width="16" height="66" fill="${hc}" ${S} stroke-width="1.5"/>${put(fig, 72, 56, 0.5)}${ar}`);
};
const genInOut = (inward) => (key, i) => {
  const rng = makeRng(key, i);
  const who = ENTRANTS[i % ENTRANTS.length]; const who2 = pick(ENTRANTS.filter(w => w !== who), rng);
  const hc = colorOf(rng); const cc = colorOf(rng, [hc]);
  return arrange(key, i, doorCard(who, inward, hc, cc), [doorCard(who, !inward, hc, cc), doorCard(who2, !inward, hc, colorOf(rng))]);
};

// ============================================================================
// --- ZAMAN ---
// ============================================================================
const SKY_OBJS = ['house', 'tree', 'pine', 'car', 'tent', 'kid', 'boat'];
const skyCard = (k, night, c) => {
  const sky = night ? '#1e1b4b' : '#bae6fd'; const ground = night ? '#14532d' : '#86efac';
  let s = `<rect x="2" y="2" width="96" height="96" rx="10" fill="${sky}"/><rect x="2" y="74" width="96" height="24" fill="${ground}"/>`;
  if (night) s += put(ART.moon(), 80, 20, 0.28) + [[16, 14], [36, 26], [56, 12], [24, 40], [64, 34], [88, 44]].map(([x, y]) => `<polygon points="${x},${y - 3.5} ${x + 1.2},${y - 1} ${x + 3.5},${y} ${x + 1.2},${y + 1} ${x},${y + 3.5} ${x - 1.2},${y + 1} ${x - 3.5},${y} ${x - 1.2},${y - 1}" fill="#fde68a"/>`).join('');
  else s += put(ART.sun(), 80, 20, 0.32) + put(ART.cloud(), 30, 22, 0.3);
  let obj;
  if (k === 'tent') obj = `<path d="M10,88 L50,20 L90,88 Z" fill="${c}" ${S}/><path d="M50,20 L38,88 L62,88 Z" fill="${night ? '#fde047' : darken(c, 0.3)}" ${S}/>`;
  else if (k === 'kid') obj = ART.kid(c);
  else obj = draw(k, isColorable(k) ? c : undefined);
  s += put(obj, 50, 64, 0.5);
  if (night && k === 'house') s += `<rect x="40" y="61" width="6" height="6" fill="#fde047"/><rect x="58" y="61" width="6" height="6" fill="#fde047"/>`;
  if (night) s += `<rect x="2" y="2" width="96" height="96" rx="10" fill="#0f172a" opacity=".22"/>`;
  return card(s);
};
const genDayNight = (night) => (key, i) => {
  const rng = makeRng(key, i);
  const k = SKY_OBJS[i % SKY_OBJS.length]; const k2 = pick(SKY_OBJS.filter(x => x !== k), rng);
  const c = colorOf(rng);
  return arrange(key, i, skyCard(k, night, c), [skyCard(k, !night, c), skyCard(k2, !night, colorOf(rng))]);
};

// Önce - Şimdi - Sonra dizileri
const soil = `<path d="M8,80 C20,66 80,66 92,80 L92,92 L8,92 Z" fill="#92400e" ${S}/>`;
const SEQUENCES = [
  [() => `${soil}<ellipse cx="50" cy="78" rx="6" ry="4" fill="#78350f" ${S}/>`, () => `${soil}<path d="M50,74 L50,50" ${SN} stroke="#16a34a" stroke-width="4"/><path d="M50,56 C38,46 30,50 30,56 C38,60 46,58 50,56 Z M50,52 C62,42 70,46 70,52 C62,56 54,54 50,52 Z" fill="#22c55e" ${S}/>`, () => `${soil}${put(ART.flower('#ec4899'), 50, 40, 0.75)}`],
  [() => ART.egg(), () => `${ART.egg()}<path d="M22,50 L32,42 L40,52 L50,40 L58,52 L68,42 L78,50" ${SN} stroke-width="3"/><path d="M30,46 L70,46" stroke="#fef3c7" stroke-width="0"/>${put(ART.chick(), 50, 30, 0.42)}`, () => ART.chick()],
  [() => ART.caterpillar('#22c55e', { n: 4 }), () => `<path d="M50,8 L50,20" ${SN}/><path d="M50,20 C66,24 70,50 60,80 C56,90 44,90 40,80 C30,50 34,24 50,20 Z" fill="#a16207" ${S}/><path d="M40,40 L60,44 M38,56 L62,58 M42,70 L58,72" ${SN} stroke-width="1.8"/>`, () => ART.butterfly('#8b5cf6')],
  [() => ART.candle('#ef4444', { h: 0.95 }), () => ART.candle('#ef4444', { h: 0.55 }), () => ART.candle('#ef4444', { h: 0.15 })],
  [() => ART.icecube(), () => `<ellipse cx="50" cy="84" rx="30" ry="6" fill="#7dd3fc"/>${put(ART.icecube(), 50, 62, 0.6)}`, () => `<ellipse cx="50" cy="76" rx="40" ry="12" fill="#7dd3fc" ${S}/><ellipse cx="40" cy="72" rx="10" ry="3" fill="#fff" opacity=".6"/>`],
  [() => ART.apple(), () => `${ART.apple()}<circle cx="84" cy="50" r="14" fill="#fff"/><path d="M80,30 C70,40 70,60 80,70" fill="#fef9c3" ${S}/>`, () => `<path d="M50,30 C50,22 52,16 56,11" ${SN}/><path d="M38,26 C46,30 54,30 62,26 C54,40 54,64 62,80 C54,76 46,76 38,80 C46,64 46,40 38,26 Z" fill="#fef9c3" ${S}/><path d="M36,24 C40,20 46,22 50,30 C54,22 60,20 64,24" fill="#ef4444" ${S}/><path d="M36,82 C44,78 56,78 64,82 C60,88 40,88 36,82 Z" fill="#ef4444" ${S}/>`],
  [() => `<path d="M40,80 C36,70 44,64 50,66 C56,64 64,70 60,80 Z" fill="#ef4444" ${S}/><path d="M50,80 L50,94" ${SN}/>`, () => put(ART.balloon('#ef4444'), 50, 60, 0.6), () => ART.balloon('#ef4444')],
  [(r) => container('glass', 1, '#f97316', r), (r) => container('glass', 0.5, '#f97316', r), (r) => container('glass', 0, '#f97316', r)],
  [() => ART.snowman(), () => `<ellipse cx="50" cy="84" rx="32" ry="7" fill="#bae6fd"/>${put(ART.snowman(), 50, 62, 0.7)}`, () => `<ellipse cx="50" cy="78" rx="40" ry="12" fill="#bae6fd" ${S}/><rect x="26" y="66" width="20" height="8" fill="${OL}" transform="rotate(-12 36 70)"/><path d="M58,72 L74,76 L58,78 Z" fill="#f97316"/>`],
  [() => `${soil}<path d="M50,74 L50,56" ${SN} stroke="#92400e" stroke-width="4"/><circle cx="50" cy="50" r="10" fill="#22c55e" ${S}/>`, () => `${soil}<path d="M46,74 L48,46 L52,46 L54,74 Z" fill="#92400e" ${S}/><circle cx="50" cy="38" r="18" fill="#22c55e" ${S}/>`, () => put(ART.tree('#22c55e'), 50, 50, 1)],
  [(r) => foodWhole('pizza'), (r) => `<defs><clipPath id="pz"><rect x="0" y="0" width="50" height="100"/></clipPath></defs><g clip-path="url(#pz)">${foodWhole('pizza')}</g><line x1="50" y1="14" x2="50" y2="86" ${S}/>`, (r) => `<ellipse cx="50" cy="70" rx="36" ry="10" fill="#f8fafc" ${S}/><circle cx="40" cy="66" r="2.5" fill="#d97706"/><circle cx="56" cy="70" r="2" fill="#d97706"/><circle cx="62" cy="64" r="1.6" fill="#d97706"/>`]
];
const stageCard = (seq, st, rng) => card(put(seq[st](rng), 50, 50, 0.86));
const seqScene = (seq, missing, rng) => {
  let s = '';
  [0, 1, 2].forEach(st => {
    const x = 10 + st * 100;
    if (st === missing) s += `<rect x="${x}" y="12" width="80" height="80" rx="12" fill="#fef3c7" stroke="#f59e0b" stroke-width="3" stroke-dasharray="7 5"/>${txt(x + 40, 54, '?', 46, '#d97706')}`;
    else s += `<rect x="${x}" y="12" width="80" height="80" rx="12" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>${put(seq[st](rng), x + 40, 52, 0.72)}`;
    if (st < 2) s += arrow(x + 82, 52, x + 98, 52, '#64748b', 3.5);
  });
  return card(s, { w: 300, h: 104, bg: '#f8fafc' });
};
const genSequence = (missing) => (key, i) => {
  const rng = makeRng(key, i);
  const seq = SEQUENCES[i % SEQUENCES.length];
  const others = [0, 1, 2].filter(x => x !== missing);
  return arrange(key, i, stageCard(seq, missing, rng), others.map(o => stageCard(seq, o, rng)), seqScene(seq, missing, rng));
};

// ============================================================================
// --- DUYU ---
// ============================================================================
const TATLI = ['cake', 'icecream', 'lollipop', ['candy'], 'donut', 'cookie', 'chocolate', 'honey'];
const TUZLU = ['salt', 'pretzel', 'chips', 'cheese'];
const ACI = [['chili', '#ef4444'], ['chili', '#16a34a'], 'hotSauce', ['chili', '#dc2626']];
const EKSI = ['lemon', ['lemon', '#84cc16'], 'plum', 'pickleJar'];
const tasteGen = (yes, others) => (key, i) => {
  const rng = makeRng(key, i);
  const a = yes[i % yes.length];
  const groups = shuffle(others, rng).slice(0, 2);
  const render = (it) => { const [k, c] = Array.isArray(it) ? it : [it]; return objCard(k, c ?? (isColorable(k) ? colorOf(rng) : undefined), {}, 0.84); };
  return arrange(key, i, render(a), groups.map(g => render(pick(g, rng))));
};

const SICAK = ['sun', 'fire', ['hotTea', '#ef4444'], 'soup', ['hotTea', '#3b82f6'], ['candle', '#f97316']];
const SOGUK = ['icecube', 'snowman', 'snowflake', 'icecream'];
const SERT = ['rock', 'brick', 'hammer', 'key', 'dumbbell', 'coin'];
const YUMUSAK = ['pillow', 'cotton', 'sponge', 'teddy', 'yarn'];
const KAYGAN = ['soap', 'bananaPeel', 'slide', 'icecube', 'fish'];
const PUTURLU = ['strawberry', 'pineapple', 'log', 'sandpaper'];
ART.sandpaper = () => { let d = ''; for (let y = 24; y < 80; y += 7) for (let x = 20 + ((y / 7) % 2) * 3; x < 82; x += 7) d += `<circle cx="${x}" cy="${y}" r="1.6" fill="#92400e"/>`; return `<rect x="14" y="18" width="72" height="66" rx="4" fill="#fbbf24" ${S}/>${d}`; };
const TUYLU = ['cat', 'sheep', 'dog', 'teddy', 'chick', 'rabbit'];
const TUYSUZ = ['fish', 'frog', 'turtle', 'snail', 'egg', 'ball', 'apple'];

// Islak / kuru, kirli / temiz, eski / yeni, parlak / mat, sesli / sessiz, hareketli / hareketsiz ...
const stateObjCard = (k, c, o, fx, bg) => card(put(draw(k, isColorable(k) ? c : undefined, o), 50, 48, 0.78) + (fx || ''), bg ? { bg } : undefined);
const WET_OBJS = ['shirt', 'sock', 'umbrella', 'cat', 'dog', 'teddy', 'shoe', 'chick', 'flower', 'car'];
const wetRender = (k, wet, c) => wet ? stateObjCard(k, darken(c, 0.25), {}, FX.wet(), '#f0f9ff') : stateObjCard(k, c, {});
const DIRTY_OBJS = ['shirt', 'sock', 'shoe', 'plate', 'car', 'cup', 'teddy', 'ball', 'dog'];
ART.plate = (c = '#3b82f6') => `<ellipse cx="50" cy="56" rx="42" ry="26" fill="#f8fafc" ${S}/><ellipse cx="50" cy="56" rx="28" ry="16" fill="none" stroke="${c}" stroke-width="3"/>`;
COLORABLE.push('plate');
const dirtyRender = (k, dirty, c) => dirty ? stateObjCard(k, mix(c, '#78350f', 0.35), {}, FX.dirty()) : stateObjCard(k, c, {}, FX.clean());
const OLD_OBJS = ['shirt', 'shoe', 'book', 'teddy', 'ball', 'car', 'chair', 'umbrella', 'sock', 'giftBox'];
COLORABLE.push('chair');
const oldRender = (k, old, c) => old ? stateObjCard(k, fade(c), {}, FX.old()) : stateObjCard(k, c, {}, FX.shine());
const SHINY_OBJS = ['star', 'coin', 'apple', 'ball', 'diamond', 'heart', 'car', 'bell', 'cup'];
const shinyRender = (k, shiny, c) => {
  const col = ({ coin: '#facc15', bell: '#facc15', diamond: '#38bdf8' })[k] || c;
  return shiny
    ? card(put(draw(k, col), 50, 50, 0.78) + `<ellipse cx="36" cy="34" rx="6" ry="10" fill="#fff" opacity=".75" transform="rotate(30 36 34)"/>` + FX.shine())
    : card(put(draw(k, mix(col, '#78716c', 0.55)), 50, 50, 0.78));
};
const SOUND_OBJS = ['bell', 'drum', 'clock', 'phone', 'radio', 'trumpet'];
const soundRender = (k, loud, c) => card(put(draw(k, isColorable(k) ? c : undefined), 50, 52, 0.7) + (loud ? FX.sound() : ''));
const MOVE_OBJS = ['ball', 'car', 'rabbit', 'dog', 'bus', 'truck', 'duck', 'turtle'];
const moveRender = (k, moving, c) => card(put(draw(k, isColorable(k) ? c : undefined), 56, 50, 0.72) + (moving ? FX.motion() : ''));
const SHARP_OBJS = ['pencil', 'crayon', 'carrot', 'star', 'nail', 'coneHat'];
const sharpRender = (k, sharp, c) => {
  if (k === 'star') return card(put(ART.star(c, { round: !sharp }), 50, 50, 0.84));
  const upright = k === 'nail' || k === 'carrot' || k === 'coneHat';
  return card(put(draw(k, k === 'nail' ? '#94a3b8' : k === 'carrot' ? '#f97316' : c, { blunt: !sharp, len: 0.8, th: 20 }), upright ? 50 : 46, 50, upright ? 0.86 : 1.0, upright ? 0 : -25));
};
const FRESH_OBJS = ['apple', 'banana', 'bread', 'flower', 'cheese', 'strawberry', 'carrot'];
const freshRender = (k, fresh, c) => card(put(draw(k, k === 'flower' ? c : undefined, { stale: !fresh }), 50, 50, 0.82) + (fresh ? '' : `<path d="M78,14 C82,8 86,18 90,12 M10,24 C14,18 18,28 22,22" ${SN} stroke="#65a30d" stroke-width="2"/><circle cx="84" cy="30" r="2.5" fill="${OL}"/>`));
const OPEN_OBJS = ['door', 'giftBox', 'book', 'umbrella', 'window', 'eye', 'flower', 'jar'];
const openRender = (k, open, c) => {
  if (k === 'umbrella') return card(put(ART.umbrella(c, { closed: !open }), 50, 50, 0.84));
  if (k === 'flower') return card(put(ART.flower(c, { bud: !open }), 50, 50, 0.84));
  if (k === 'eye') return card(put(ART.eye(c, { closed: !open }), 50, 50, 0.84));
  return card(put(draw(k, k === 'door' ? mix(c, '#92400e', 0.45) : c, { open }), 50, 50, 0.84));
};
const UPSIDE_OBJS = ['house', 'tree', 'cup', 'kid', 'cat', 'car', 'umbrella', 'flower', 'rocket', 'teddy', 'duck', 'mushroom', 'icecream'];
const upsideRender = (k, upside, c) => card(put(k === 'kid' ? ART.kid(c) : draw(k, isColorable(k) ? c : undefined), 50, 50, 0.82, upside ? 180 : 0));

const LIGHT_SRC = ['lamp', 'candle', 'lamp', 'candle'];
const roomRender = (k, dark, c, rng) => {
  const wall = dark ? '#1e293b' : '#fef9c3';
  let s = `<rect x="2" y="2" width="96" height="96" rx="10" fill="${wall}"/><rect x="2" y="76" width="96" height="22" fill="${dark ? '#0f172a' : '#fcd34d'}"/>`;
  s += `<rect x="58" y="12" width="30" height="28" fill="${dark ? '#020617' : '#bae6fd'}" ${S}/><path d="M73,12 L73,40 M58,26 L88,26" ${SN} stroke-width="2"/>`;
  if (dark) s += `<circle cx="66" cy="18" r="3" fill="#475569"/>`;
  else s += `<circle cx="66" cy="20" r="4" fill="#facc15"/>`;
  s += k === 'lamp'
    ? put(ART.lamp(c, { on: !dark }), 28, 58, 0.5)
    : put(ART.candle(c, { lit: !dark, h: 0.6 }), 28, 56, 0.5) + (dark ? '' : `<circle cx="28" cy="34" r="20" fill="#fde047" opacity=".35"/>`);
  s += put(ART.teddy(dark ? '#334155' : '#a16207'), 70, 70, 0.32);
  if (dark) s += `<rect x="2" y="2" width="96" height="96" rx="10" fill="#020617" opacity=".35"/>`;
  else s += `<circle cx="28" cy="40" r="34" fill="#fff7ae" opacity=".25"/>`;
  return card(s);
};

const tidyRender = (dummy, tidy, c, rng) => {
  const items = pickN(['ball', 'teddy', 'car', 'book', 'duck', 'giftBox', 'cup', 'star'], 5, rng).map(k => ({ k, c: isColorable(k) ? colorOf(rng) : undefined }));
  let s = `<rect x="2" y="2" width="96" height="96" rx="10" fill="#fff7ed"/><rect x="2" y="78" width="96" height="20" fill="#fde68a"/><rect x="10" y="40" width="80" height="5" fill="#a16207" ${S} stroke-width="1.8"/>`;
  if (tidy) {
    items.slice(0, 3).forEach((it, j) => { s += put(draw(it.k, it.c), 24 + j * 26, 30, 0.2); });
    items.slice(3).forEach((it, j) => { s += put(draw(it.k, it.c), 36 + j * 28, 68, 0.22); });
  } else {
    const spots = [[18, 64], [44, 84], [78, 70], [62, 52], [30, 32], [84, 30]];
    items.forEach((it, j) => { s += put(draw(it.k, it.c), spots[j][0], spots[j][1], 0.22, Math.floor(rng() * 140) - 70); });
    s += `<path d="M48,62 l12,4 M14,86 l10,-3" ${SN} stroke-width="2"/>`;
  }
  return card(s);
};

const hungryRender = (k, hungry, c, rng) => {
  const skin = SKINS[1 + (k % (SKINS.length - 1))]; const hair = HAIRS[k % 5];
  let s = `<rect x="2" y="2" width="96" height="96" rx="10" fill="#f8fafc"/>`;
  s += hungry
    ? `<path d="M30,58 L36,94 L60,94 L66,58 Z" fill="${c}" ${S}/>`
    : `<ellipse cx="48" cy="78" rx="24" ry="20" fill="${c}" ${S}/><path d="M36,72 C40,66 50,66 54,72" ${SN} stroke-width="2"/>`;
  s += put(face(hungry ? 'hungry' : 'content', { skin, hair }), 48, 36, 0.52);
  s += `<path d="M66,86 L92,86 C92,96 66,96 66,86 Z" fill="#fff" ${S}/>`;
  if (hungry) s += `<circle cx="72" cy="22" r="2.5" fill="#fff" ${S} stroke-width="1.2"/><circle cx="78" cy="15" r="3.5" fill="#fff" ${S} stroke-width="1.2"/><ellipse cx="84" cy="10" rx="12" ry="8" fill="#fff" ${S} stroke-width="1.5"/>${put(ART.apple(), 84, 10, 0.12)}`;
  else s += `<path d="M76,84 C78,80 82,80 84,84" ${SN} stroke-width="1.6"/><path d="M86,20 q4,-4 8,0" ${SN} stroke="#ef4444" stroke-width="2"/>`;
  return card(s);
};

// ============================================================================
// --- DUYGU / YAŞ ---
// ============================================================================
const EMOTIONS = ['happy', 'sad', 'angry', 'scared', 'surprised'];
const charStyle = (i, rng) => ({ skin: SKINS[i % SKINS.length], hair: i % SKINS.length === 0 ? null : HAIRS[Math.floor(rng() * 5)], bow: i % 4 === 1, cap: i % 7 === 3 ? colorOf(rng) : null });
const genEmotion = (emo) => (key, i) => {
  const rng = makeRng(key, i);
  const st = charStyle(i, rng);
  const w = pickN(EMOTIONS, 2, rng, [emo]);
  return arrange(key, i, card(face(emo, st)), w.map(e => card(face(e, st))));
};
const genAge = (old) => (key, i) => {
  const rng = makeRng(key, i);
  const mk = (isOld) => { const st = charStyle(i + (isOld ? 0 : Math.floor(rng() * 6)), rng); return card(face(pick(['happy', 'content', 'neutral'], rng), { ...st, skin: st.skin === '#fde047' ? '#fcd9b6' : st.skin, hair: st.hair || '#451a03', age: isOld ? 'old' : 'kid' })); };
  return arrange(key, i, mk(old), [mk(!old), mk(!old)]);
};

// ============================================================================
// --- ZIT KAVRAMLAR (ek) ---
// ============================================================================
const SAME_OBJS = ['apple', 'ball', 'star', 'heart', 'fish', 'balloon', 'car', 'flower', 'duck', 'cat', 'butterfly', 'mushroom', 'cup', 'umbrella', 'kite', 'house', 'tree', 'teddy', 'leaf', 'boat'];
const genDifferent = () => (key, i) => {
  const rng = makeRng(key, i);
  const k = SAME_OBJS[i % SAME_OBJS.length]; const c = colorOf(rng);
  let odd;
  if (isColorable(k) && i % 2 === 0) odd = objCard(k, colorOf(rng, [c]));
  else { const k2 = pick(SAME_OBJS.filter(x => x !== k), rng); odd = objCard(k2, isColorable(k2) ? c : undefined); }
  const same = objCard(k, isColorable(k) ? c : undefined);
  return arrange(key, i, odd, [same, same]);
};
const genSame = () => (key, i) => {
  const rng = makeRng(key, i);
  const k = SAME_OBJS[i % SAME_OBJS.length]; const c = colorOf(rng);
  const col = isColorable(k) ? c : undefined;
  const main = card(put(draw(k, col), 100, 50, 0.8), { w: 200, h: 100, bg: '#eef2ff' });
  const [k2, k3] = pickN(SAME_OBJS, 2, rng, [k]);
  const w1 = isColorable(k) ? objCard(k, colorOf(rng, [c])) : objCard(k2, isColorable(k2) ? c : undefined);
  const w2 = objCard(k3, isColorable(k3) ? c : undefined);
  return arrange(key, i, objCard(k, col), [w1, w2], main);
};

const DUZ = ['ruler', 'pencil', 'stick', ['rope', '#ef4444', {}], ['road', '#475569', {}], ['rope', '#3b82f6', {}]];
const EGRI = ['snake', 'banana', 'rainbow', ['rope', '#22c55e', { wavy: true }], ['road', '#475569', { curved: true }], 'hook', 'moon'];

const TONE_OBJS = ['balloon', 'car', 'star', 'heart', 'umbrella', 'shirt', 'cup', 'fish', 'kite', 'sock', 'flower', 'book'];
const genTone = (light) => (key, i) => {
  const rng = makeRng(key, i);
  const k = TONE_OBJS[i % TONE_OBJS.length]; const c = colorOf(rng, ['#f59e0b']);
  const L = lighten(c, 0.62), M = c, D = darken(c, 0.5);
  return arrange(key, i, objCard(k, light ? L : D), [objCard(k, M), objCard(k, light ? D : L)]);
};

const crowdCard = (n, rng) => {
  let s = `<rect x="2" y="2" width="96" height="96" rx="10" fill="#e0f2fe"/><rect x="2" y="56" width="96" height="42" fill="#bbf7d0"/>${put(ART.tree(), 82, 40, 0.34)}`;
  const spots = [];
  for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) spots.push([13 + q * 18 + (r % 2) * 6, 50 + r * 17]);
  const chosen = shuffle(spots, rng).slice(0, n).sort((a, b) => a[1] - b[1]);
  chosen.forEach(([x, y]) => { s += put(ART.kid(colorOf(rng), { skin: pick(SKINS.slice(1), rng), hair: pick(HAIRS.slice(0, 5), rng) }), x, y, 0.28); });
  return card(s);
};
const genCrowd = (crowded) => (key, i) => {
  const rng = makeRng(key, i);
  const cor = crowded ? 10 + Math.floor(rng() * 4) : 1;
  const w = crowded ? [1, 2 + Math.floor(rng() * 2)] : [9 + Math.floor(rng() * 3), 11 + Math.floor(rng() * 3)];
  return arrange(key, i, crowdCard(cor, rng), w.map(n => crowdCard(n, rng)));
};

const truthCard = (k, numeral, count, c) => card(`<circle cx="18" cy="18" r="13" fill="#4f46e5"/>${txt(18, 19, numeral, 18, '#fff')}${groupLayout(count, draw(k, isColorable(k) ? c : undefined), { x: 30, y: 10, w: 64, h: 82 }, 0.36)}`);
const genTruth = (correct) => (key, i) => {
  const rng = makeRng(key, i);
  const k = COUNT_OBJS[i % COUNT_OBJS.length]; const c = colorOf(rng);
  const mk = (ok) => { const n = 1 + Math.floor(rng() * 6); const shown = ok ? n : (n === 1 ? 2 + Math.floor(rng() * 2) : n + (rng() < 0.5 ? -1 : 1)); return truthCard(k, n, Math.max(1, shown), c); };
  return arrange(key, i, mk(correct), [mk(!correct), mk(!correct)]);
};

// Kolay / Zor (yapboz ve labirent)
const puzzleCard = (rows, cols, c, k) => {
  const x0 = 12, y0 = 12, W = 76;
  let s = `<rect x="${x0}" y="${y0}" width="${W}" height="${W}" fill="${lighten(c, 0.55)}" ${S}/>${put(draw(k, isColorable(k) ? c : undefined), 50, 50, 0.62)}`;
  for (let r = 1; r < rows; r++) { const y = y0 + (W * r) / rows; s += `<line x1="${x0}" y1="${y}" x2="${x0 + W}" y2="${y}" ${S} stroke-width="2"/>`; for (let q = 0; q < cols; q++) s += `<circle cx="${x0 + (W * (q + 0.5)) / cols}" cy="${y}" r="${Math.min(5, 26 / Math.max(rows, cols))}" fill="${lighten(c, 0.3)}" ${S} stroke-width="1.6"/>`; }
  for (let q = 1; q < cols; q++) { const x = x0 + (W * q) / cols; s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + W}" ${S} stroke-width="2"/>`; for (let r = 0; r < rows; r++) s += `<circle cx="${x}" cy="${y0 + (W * (r + 0.5)) / rows}" r="${Math.min(5, 26 / Math.max(rows, cols))}" fill="${lighten(c, 0.3)}" ${S} stroke-width="1.6"/>`; }
  return card(s);
};
const mazeCard = (n, c, rng) => {
  const cells = n * n; const visited = new Array(cells).fill(false); const walls = { h: {}, v: {} };
  for (let r = 0; r <= n; r++) for (let q = 0; q < n; q++) walls.h[`${r},${q}`] = true;
  for (let r = 0; r < n; r++) for (let q = 0; q <= n; q++) walls.v[`${r},${q}`] = true;
  const stack = [0]; visited[0] = true;
  while (stack.length) {
    const cur = stack[stack.length - 1]; const r = Math.floor(cur / n), q = cur % n;
    const nb = [[r - 1, q], [r + 1, q], [r, q - 1], [r, q + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n && !visited[a * n + b]);
    if (!nb.length) { stack.pop(); continue; }
    const [a, b] = nb[Math.floor(rng() * nb.length)];
    if (a !== r) walls.h[`${Math.max(a, r)},${q}`] = false; else walls.v[`${r},${Math.max(b, q)}`] = false;
    visited[a * n + b] = true; stack.push(a * n + b);
  }
  walls.v['0,0'] = false; walls.v[`${n - 1},${n}`] = false;
  const x0 = 12, W = 76, cs = W / n; let s = '';
  Object.entries(walls.h).forEach(([kk, on]) => { if (!on) return; const [r, q] = kk.split(',').map(Number); s += `<line x1="${x0 + q * cs}" y1="${x0 + r * cs}" x2="${x0 + (q + 1) * cs}" y2="${x0 + r * cs}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`; });
  Object.entries(walls.v).forEach(([kk, on]) => { if (!on) return; const [r, q] = kk.split(',').map(Number); s += `<line x1="${x0 + q * cs}" y1="${x0 + r * cs}" x2="${x0 + q * cs}" y2="${x0 + (r + 1) * cs}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`; });
  return card(`${s}<circle cx="6" cy="${x0 + cs / 2}" r="4" fill="#22c55e"/>${put(ART.star('#facc15'), 94, x0 + W - cs / 2, 0.12)}`);
};
const genDifficulty = (easy) => (key, i) => {
  const rng = makeRng(key, i); const c = colorOf(rng);
  const levels = easy ? [0, 1, 2] : [2, 1, 0];
  if (i % 2 === 0) {
    const k = pick(['star', 'heart', 'apple', 'fish', 'car', 'flower', 'house', 'cat', 'sun'], rng);
    const P = [[1, 2], [2, 3], [4, 4]];
    return arrange(key, i, puzzleCard(...P[levels[0]], c, k), [puzzleCard(...P[levels[1]], c, k), puzzleCard(...P[levels[2]], c, k)]);
  }
  const M = [2, 4, 7];
  return arrange(key, i, mazeCard(M[levels[0]], c, rng), [mazeCard(M[levels[1]], c, rng), mazeCard(M[levels[2]], c, rng)]);
};

// Ağır / hafif
const AGIR = ['elephant', 'truck', 'rock', 'dumbbell', 'house', 'train'];
const HAFIF = ['feather', 'balloon', 'leaf', 'butterfly', 'kite'];

// ============================================================================
// --- RENKLER VE ŞEKİLLER ---
// ============================================================================
export const COLOR_NAMES = [
  { id: 'kirmizi', label: 'Kırmızı', hex: '#ef4444', avoid: ['pembe', 'turuncu'] },
  { id: 'mavi', label: 'Mavi', hex: '#3b82f6', avoid: ['mor'] },
  { id: 'sari', label: 'Sarı', hex: '#facc15', avoid: ['turuncu'] },
  { id: 'yesil', label: 'Yeşil', hex: '#22c55e', avoid: [] },
  { id: 'turuncu', label: 'Turuncu', hex: '#f97316', avoid: ['kirmizi', 'sari', 'kahverengi'] },
  { id: 'mor', label: 'Mor', hex: '#8b5cf6', avoid: ['pembe', 'mavi'] },
  { id: 'pembe', label: 'Pembe', hex: '#f472b6', avoid: ['kirmizi', 'mor'] },
  { id: 'kahverengi', label: 'Kahverengi', hex: '#92400e', avoid: ['turuncu'] },
  { id: 'siyah', label: 'Siyah', hex: '#111827', avoid: ['gri'] },
  { id: 'beyaz', label: 'Beyaz', hex: '#ffffff', avoid: ['gri'] },
  { id: 'gri', label: 'Gri', hex: '#9ca3af', avoid: ['beyaz', 'siyah'] }
];
const COLOR_OBJS = ['balloon', 'car', 'star', 'heart', 'umbrella', 'shirt', 'cup', 'fish', 'kite', 'sock', 'book', 'flower', 'ball', 'giftBox', 'boat'];
const genColor = (cid) => (key, i) => {
  const rng = makeRng(key, i);
  const target = COLOR_NAMES.find(c => c.id === cid);
  const pool = COLOR_NAMES.filter(c => c.id !== cid && !target.avoid.includes(c.id));
  const [w1, w2] = pickN(pool, 2, rng);
  const k = COLOR_OBJS[i % COLOR_OBJS.length];
  const bg = cid === 'beyaz' ? '#e2e8f0' : undefined;
  return arrange(key, i, objCard(k, target.hex, {}, 0.84, '', bg), [objCard(k, w1.hex, {}, 0.84, '', w1.id === 'beyaz' ? '#e2e8f0' : undefined), objCard(k, w2.hex, {}, 0.84, '', w2.id === 'beyaz' ? '#e2e8f0' : undefined)]);
};

const SHAPES = {
  daire: (c) => `<circle cx="50" cy="50" r="34" fill="${c}" ${S} stroke-width="3"/>`,
  kare: (c) => `<rect x="18" y="18" width="64" height="64" rx="3" fill="${c}" ${S} stroke-width="3"/>`,
  ucgen: (c) => `<polygon points="50,12 88,82 12,82" fill="${c}" ${S} stroke-width="3"/>`,
  dikdortgen: (c) => `<rect x="8" y="30" width="84" height="40" rx="3" fill="${c}" ${S} stroke-width="3"/>`
};
const genShape = (sid) => (key, i) => {
  const rng = makeRng(key, i);
  const others = pickN(Object.keys(SHAPES), 2, rng, [sid]);
  const c = colorOf(rng);
  const rot = sid === 'daire' ? 0 : [0, 0, 15, -15, 90][i % 5];
  const s1 = 0.7 + rng() * 0.25;
  return arrange(key, i, card(put(SHAPES[sid](c), 50, 50, s1, sid === 'kare' || sid === 'ucgen' ? rot : sid === 'dikdortgen' && rot === 90 ? 90 : 0)), others.map(o => card(put(SHAPES[o](colorOf(rng)), 50, 50, 0.7 + rng() * 0.25, o === 'daire' ? 0 : [0, 15, -15][Math.floor(rng() * 3)]))));
};

// ============================================================================
// --- KAVRAM KATALOĞU ---
// ============================================================================
const G = (key, text, gen, count = 50) => ({ key, text, gen, count });

export const CONCEPT_CATEGORIES = [
  {
    id: 'konum', label: 'Yön / Mekânda Konum', color: 'sky', concepts: [
      { id: 'on_arka', label: 'Ön - Arka', groups: [G('on', 'Hangisi en öndedir?', genQueue(true)), G('arka', 'Hangisi en arkadadır?', genQueue(false))] },
      { id: 'yukari_asagi', label: 'Yukarı - Aşağı', groups: [G('yukari', 'Hangisi yukarı doğru gidiyor?', genUpDown(true)), G('asagi', 'Hangisi aşağı doğru gidiyor?', genUpDown(false))] },
      { id: 'ileri_geri', label: 'İleri - Geri', groups: [G('ileri', 'Hangisi ileri gidiyor?', genForward(true)), G('geri', 'Hangisi geri gidiyor?', genForward(false))] },
      { id: 'sag_sol', label: 'Sağ - Sol', groups: [G('sag', 'Hangisi en sağdadır?', genLeftRight(true)), G('sol', 'Hangisi en soldadır?', genLeftRight(false))] },
      { id: 'onunde_arkasinda', label: 'Önünde - Arkasında', groups: [G('onunde', 'Hangisi kutunun önündedir?', genBox(true)), G('arkasinda', 'Hangisi kutunun arkasındadır?', genBox(false))] },
      { id: 'alt_orta_ust', label: 'Altında - Ortasında - Üstünde', groups: [G('altinda', 'Hangisi masanın altındadır?', genTable('under')), G('ortasinda', 'Hangisi masanın ortasındadır?', genTable('middle')), G('ustunde', 'Hangisi masanın üstündedir?', genTable('on'))] },
      { id: 'arasinda', label: 'Arasında', groups: [G('arasinda', 'Hangisi iki ağacın arasındadır?', genBetween())] },
      { id: 'yaninda', label: 'Yanında', groups: [G('yaninda', 'Hangisi evin yanındadır?', genBeside())] },
      { id: 'yukarida_asagida', label: 'Yukarıda - Aşağıda', groups: [G('yukarida', 'Hangisi yukarıdadır?', genShelf(true)), G('asagida', 'Hangisi aşağıdadır?', genShelf(false))] },
      { id: 'ic_dis', label: 'İç - Dış', groups: [G('ic', 'Hangisi içtedir?', genPen(true)), G('dis', 'Hangisi dıştadır?', genPen(false))] },
      { id: 'icinde_disinda', label: 'İçinde - Dışında', groups: [G('icinde', 'Hangisi sepetin içindedir?', genBasket(true)), G('disinda', 'Hangisi sepetin dışındadır?', genBasket(false))] },
      { id: 'iceri_disari', label: 'İçeri - Dışarı', groups: [G('iceri', 'Hangisi içeri giriyor?', genInOut(true)), G('disari', 'Hangisi dışarı çıkıyor?', genInOut(false))] },
      { id: 'uzak_yakin', label: 'Uzak - Yakın', groups: [G('yakin', 'Hangisi eve en yakındır?', genDistance(true)), G('uzak', 'Hangisi evden en uzaktır?', genDistance(false))] },
      { id: 'alcak_yuksek', label: 'Alçak - Yüksek', groups: [G('yuksek', 'Hangisi en yüksektedir?', genLevels({ objs: HEIGHT_OBJS, levels: [1, 0.5, 0], correctLevel: 0, render: heightRender })), G('alcak', 'Hangisi en alçaktadır?', genLevels({ objs: HEIGHT_OBJS, levels: [1, 0.5, 0], correctLevel: 2, render: heightRender }))] },
      { id: 'saginda_solunda', label: 'Sağında - Solunda', groups: [G('saginda', 'Hangisi topun sağındadır?', genSideOf(true)), G('solunda', 'Hangisi topun solundadır?', genSideOf(false))] }
    ]
  },
  {
    id: 'boyut', label: 'Boyut', color: 'indigo', concepts: [
      { id: 'buyuk_orta_kucuk', label: 'Büyük - Orta - Küçük', groups: [G('buyuk', 'Hangisi büyüktür?', genLevels({ objs: SIZE_OBJS, levels: [0.92, 0.6, 0.34], correctLevel: 0, render: sizeRender })), G('orta', 'Hangisi orta büyüklüktedir?', genLevels({ objs: SIZE_OBJS, levels: [0.92, 0.6, 0.34], correctLevel: 1, render: sizeRender })), G('kucuk', 'Hangisi küçüktür?', genLevels({ objs: SIZE_OBJS, levels: [0.92, 0.6, 0.34], correctLevel: 2, render: sizeRender }))] },
      { id: 'ince_kalin', label: 'İnce - Kalın', groups: [G('kalin', 'Hangisi kalındır?', genLevels({ objs: THICK_OBJS, levels: [1, 0.5, 0.08], correctLevel: 0, render: thickRender })), G('ince', 'Hangisi incedir?', genLevels({ objs: THICK_OBJS, levels: [1, 0.5, 0.08], correctLevel: 2, render: thickRender }))] },
      { id: 'uzun_kisa', label: 'Uzun - Kısa', groups: [G('uzun', 'Hangisi en uzundur?', genLevels({ objs: LENGTH_OBJS, levels: [1, 0.64, 0.34], correctLevel: 0, render: lengthRender })), G('kisa', 'Hangisi en kısadır?', genLevels({ objs: LENGTH_OBJS, levels: [1, 0.64, 0.34], correctLevel: 2, render: lengthRender }))] },
      { id: 'genis_dar', label: 'Geniş - Dar', groups: [G('genis', 'En geniş olanı bul.', genLevels({ objs: WIDTH_OBJS, levels: [1, 0.55, 0.15], correctLevel: 0, render: widthRender })), G('dar', 'En dar olanı bul.', genLevels({ objs: WIDTH_OBJS, levels: [1, 0.55, 0.15], correctLevel: 2, render: widthRender }))] }
    ]
  },
  {
    id: 'miktar', label: 'Miktar', color: 'emerald', concepts: [
      { id: 'az_cok', label: 'Az - Çok', groups: [G('cok', 'Hangisi çoktur?', genCounts([[8, 10], [1, 2], [3, 4]])), G('az', 'Hangisi azdır?', genCounts([[1, 2], [8, 10], [5, 6]]))] },
      { id: 'agir_hafif', label: 'Ağır - Hafif', groups: [G('agir', 'Hangisi ağırdır?', genPools({ yes: AGIR, no: HAFIF })), G('hafif', 'Hangisi hafiftir?', genPools({ yes: HAFIF, no: AGIR }))] },
      { id: 'bos_dolu', label: 'Boş - Dolu', groups: [G('dolu', 'Hangisi doludur?', genFill('full')), G('bos', 'Hangisi boştur?', genFill('empty'))] },
      { id: 'tek_cift', label: 'Tek - Çift', groups: [G('tek', 'Hangisi tektir?', genCounts([[1, 1], [2, 2], [4, 4]])), G('cift', 'Hangisi çifttir?', genCounts([[2, 2], [1, 1], [3, 3]]))] },
      { id: 'yarim_tam', label: 'Yarım - Tam', groups: [G('yarim', 'Hangisi yarımdır?', genFood('half', 'whole')), G('tam', 'Hangisi tamdır?', genFood('whole', 'half'))] },
      { id: 'esit', label: 'Eşit', groups: [G('esit', 'Hangisinde iki taraf eşittir?', genEqual())] },
      { id: 'parca_butun', label: 'Parça - Bütün', groups: [G('parca', 'Hangisi parçadır?', genFood('slice', 'whole')), G('butun', 'Hangisi bütündür?', genFood('whole', 'slice'))] },
      { id: 'hepsi_hicbiri', label: 'Hepsi - Hiçbiri', groups: [G('hepsi', 'Hangisinde hepsi boyalıdır?', genPaint(4)), G('hicbiri', 'Hangisinde hiçbiri boyalı değildir?', genPaint(0))] }
    ]
  },
  {
    id: 'sayi', label: 'Sayı / Sayma', color: 'violet', concepts: [
      { id: 'sayilar', label: '1-20 Arası Sayılar', groups: [G('sayi_kadar', 'Yukarıdaki sayı kadar olanı bul.', genNumbers())] },
      { id: 'sifir', label: 'Sıfır', groups: [G('sifir', 'Hangisinde sıfır tane var?', genZero())] },
      { id: 'ilk_orta_son', label: 'İlk - Orta - Son', groups: [G('ilk', 'Hangisi ilk sıradadır?', genRow(() => 0)), G('ortadaki', 'Hangisi ortadadır?', genRow((n) => Math.floor(n / 2))), G('son', 'Hangisi son sıradadır?', genRow((n) => n - 1))] },
      { id: 'onceki_sonraki', label: 'Önceki - Sonraki', groups: [G('onceki', 'Hangi sayı önce gelir?', genSeqNum(true)), G('sonraki', 'Hangi sayı sonra gelir?', genSeqNum(false))] },
      {
        id: 'sira_sayisi', label: 'Sıra Sayısı (toplam 50)', groups: [
          G('sira_1', 'Birinci (1.) sıradaki hangisidir?', genRow(() => 0), 9),
          G('sira_2', 'İkinci (2.) sıradaki hangisidir?', genRow(() => 1), 9),
          G('sira_3', 'Üçüncü (3.) sıradaki hangisidir?', genRow(() => 2), 8),
          G('sira_4', 'Dördüncü (4.) sıradaki hangisidir?', genRow(() => 3), 8),
          G('sira_5', 'Beşinci (5.) sıradaki hangisidir?', genRow(() => 4), 8),
          G('sira_son', 'Son sıradaki hangisidir?', genRow((n) => n - 1), 8)
        ]
      }
    ]
  },
  {
    id: 'zaman', label: 'Zaman', color: 'amber', concepts: [
      { id: 'gece_gunduz', label: 'Gece - Gündüz', groups: [G('gece', 'Hangisi gecedir?', genDayNight(true)), G('gunduz', 'Hangisi gündüzdür?', genDayNight(false))] },
      { id: 'once_simdi_sonra', label: 'Önce - Şimdi - Sonra', groups: [G('once', 'Önce hangisi olur?', genSequence(0)), G('simdi', 'Şimdi hangisi olur?', genSequence(1)), G('sonra', 'Sonra hangisi olur?', genSequence(2))] }
    ]
  },
  {
    id: 'duyu', label: 'Duyu', color: 'rose', concepts: [
      { id: 'tatli', label: 'Tatlı', groups: [G('tatli', 'Hangisi tatlıdır?', tasteGen(TATLI, [TUZLU, ACI, EKSI]))] },
      { id: 'tuzlu', label: 'Tuzlu', groups: [G('tuzlu', 'Hangisi tuzludur?', tasteGen(TUZLU, [TATLI, ACI, EKSI]))] },
      { id: 'aci', label: 'Acı', groups: [G('aci', 'Hangisi acıdır?', tasteGen(ACI, [TATLI, TUZLU, EKSI]))] },
      { id: 'eksi', label: 'Ekşi', groups: [G('eksi', 'Hangisi ekşidir?', tasteGen(EKSI, [TATLI, TUZLU, ACI]))] },
      { id: 'sicak_soguk', label: 'Sıcak - Soğuk', groups: [G('sicak', 'Hangisi sıcaktır?', genPools({ yes: SICAK, no: SOGUK })), G('soguk', 'Hangisi soğuktur?', genPools({ yes: SOGUK, no: SICAK }))] },
      { id: 'sert_yumusak', label: 'Sert - Yumuşak', groups: [G('sert', 'Hangisi serttir?', genPools({ yes: SERT, no: YUMUSAK })), G('yumusak', 'Hangisi yumuşaktır?', genPools({ yes: YUMUSAK, no: SERT }))] },
      { id: 'kaygan_puturlu', label: 'Kaygan - Pütürlü', groups: [G('kaygan', 'Hangisi kaygandır?', genPools({ yes: KAYGAN, no: PUTURLU })), G('puturlu', 'Hangisi pütürlüdür?', genPools({ yes: PUTURLU, no: KAYGAN }))] },
      { id: 'tuylu_tuysuz', label: 'Tüylü - Tüysüz', groups: [G('tuylu', 'Hangisi tüylüdür?', genPools({ yes: TUYLU, no: TUYSUZ })), G('tuysuz', 'Hangisi tüysüzdür?', genPools({ yes: TUYSUZ, no: TUYLU }))] },
      { id: 'islak_kuru', label: 'Islak - Kuru', groups: [G('islak', 'Hangisi ıslaktır?', genBinary({ objs: WET_OBJS, target: true, render: wetRender })), G('kuru', 'Hangisi kurudur?', genBinary({ objs: WET_OBJS, target: false, render: wetRender }))] },
      { id: 'sivri_kut', label: 'Sivri - Küt', groups: [G('sivri', 'Hangisi sivridir?', genBinary({ objs: SHARP_OBJS, target: true, render: sharpRender })), G('kut', 'Hangisi küttür?', genBinary({ objs: SHARP_OBJS, target: false, render: sharpRender }))] },
      { id: 'parlak_mat', label: 'Parlak - Mat', groups: [G('parlak', 'Hangisi parlaktır?', genBinary({ objs: SHINY_OBJS, target: true, render: shinyRender })), G('mat', 'Hangisi mattır?', genBinary({ objs: SHINY_OBJS, target: false, render: shinyRender }))] },
      { id: 'taze_bayat', label: 'Taze - Bayat', groups: [G('taze', 'Hangisi tazedir?', genBinary({ objs: FRESH_OBJS, target: true, render: freshRender })), G('bayat', 'Hangisi bayattır?', genBinary({ objs: FRESH_OBJS, target: false, render: freshRender }))] },
      { id: 'sesli_sessiz', label: 'Sesli - Sessiz', groups: [G('sesli', 'Hangisi ses çıkarıyor?', genBinary({ objs: SOUND_OBJS, target: true, render: soundRender })), G('sessiz', 'Hangisi sessizdir?', genBinary({ objs: SOUND_OBJS, target: false, render: soundRender }))] }
    ]
  },
  {
    id: 'duygu', label: 'Duygu', color: 'pink', concepts: [
      { id: 'mutluluk', label: 'Mutluluk', groups: [G('mutlu', 'Hangisi mutludur?', genEmotion('happy'))] },
      { id: 'uzuntu', label: 'Üzüntü', groups: [G('uzgun', 'Hangisi üzgündür?', genEmotion('sad'))] },
      { id: 'ofke', label: 'Öfke', groups: [G('ofkeli', 'Hangisi öfkelidir?', genEmotion('angry'))] },
      { id: 'korku', label: 'Korku', groups: [G('korkmus', 'Hangisi korkmuştur?', genEmotion('scared'))] },
      { id: 'saskinlik', label: 'Şaşkınlık', groups: [G('sasirmis', 'Hangisi şaşırmıştır?', genEmotion('surprised'))] }
    ]
  },
  {
    id: 'zit', label: 'Zıt Kavramlar', color: 'orange', concepts: [
      { id: 'ayni_farkli', label: 'Aynı - Farklı', groups: [G('ayni', 'Yukarıdakinin aynısı hangisidir?', genSame()), G('farkli', 'Hangisi farklıdır?', genDifferent())] },
      { id: 'acik_kapali', label: 'Açık - Kapalı', groups: [G('acik', 'Hangisi açıktır?', genBinary({ objs: OPEN_OBJS, target: true, render: openRender })), G('kapali', 'Hangisi kapalıdır?', genBinary({ objs: OPEN_OBJS, target: false, render: openRender }))] },
      { id: 'hizli_yavas', label: 'Hızlı - Yavaş', groups: [G('hizli', 'Hangisi hızlıdır?', genPools({ yes: ['rabbit', ['car', '#ef4444'], 'rocket', 'airplane', 'train', 'bird', ['car', '#3b82f6']], no: ['turtle', 'snail', 'caterpillar'] })), G('yavas', 'Hangisi yavaştır?', genPools({ yes: ['turtle', 'snail', 'caterpillar'], no: ['rabbit', 'car', 'rocket', 'airplane', 'train', 'bird'] }))] },
      { id: 'canli_cansiz', label: 'Canlı - Cansız', groups: [G('canli', 'Hangisi canlıdır?', genPools({ yes: ['cat', 'dog', 'bird', 'fish', 'tree', 'flower', 'rabbit', 'duck', 'turtle', 'frog', 'butterfly', 'elephant', 'chick', 'sheep'], no: ['ball', 'chair', 'car', 'cup', 'book', 'rock', 'house', 'key', 'clock', 'umbrella', 'shoe', 'balloon', 'teddy'] })), G('cansiz', 'Hangisi cansızdır?', genPools({ yes: ['ball', 'chair', 'car', 'cup', 'book', 'rock', 'house', 'key', 'clock', 'umbrella', 'shoe', 'balloon', 'teddy'], no: ['cat', 'dog', 'bird', 'fish', 'tree', 'flower', 'rabbit', 'duck', 'turtle', 'frog', 'butterfly', 'elephant', 'chick', 'sheep'] }))] },
      { id: 'hareketli_hareketsiz', label: 'Hareketli - Hareketsiz', groups: [G('hareketli', 'Hangisi hareketlidir?', genBinary({ objs: MOVE_OBJS, target: true, render: moveRender })), G('hareketsiz', 'Hangisi hareketsizdir?', genBinary({ objs: MOVE_OBJS, target: false, render: moveRender }))] },
      { id: 'kolay_zor', label: 'Kolay - Zor', groups: [G('kolay', 'Hangisi kolaydır?', genDifficulty(true)), G('zor', 'Hangisi zordur?', genDifficulty(false))] },
      { id: 'karanlik_aydinlik', label: 'Karanlık - Aydınlık', groups: [G('karanlik', 'Hangisi karanlıktır?', genBinary({ objs: LIGHT_SRC, target: true, render: roomRender })), G('aydinlik', 'Hangisi aydınlıktır?', genBinary({ objs: LIGHT_SRC, target: false, render: roomRender }))] },
      { id: 'ters_duz', label: 'Ters - Düz', groups: [G('ters', 'Hangisi ters duruyor?', genBinary({ objs: UPSIDE_OBJS, target: true, render: upsideRender })), G('duz_yon', 'Hangisi düz duruyor?', genBinary({ objs: UPSIDE_OBJS, target: false, render: upsideRender }))] },
      { id: 'duzenli_daginik', label: 'Düzenli - Dağınık', groups: [G('duzenli', 'Hangisi düzenlidir?', genBinary({ objs: [0, 1, 2, 3, 4], target: true, render: tidyRender })), G('daginik', 'Hangisi dağınıktır?', genBinary({ objs: [0, 1, 2, 3, 4], target: false, render: tidyRender }))] },
      { id: 'eski_yeni', label: 'Eski - Yeni', groups: [G('eski', 'Hangisi eskidir?', genBinary({ objs: OLD_OBJS, target: true, render: oldRender })), G('yeni', 'Hangisi yenidir?', genBinary({ objs: OLD_OBJS, target: false, render: oldRender }))] },
      { id: 'baslangic_bitis', label: 'Başlangıç - Bitiş', groups: [G('baslangic', 'Hangisi başlangıçtadır?', genPath(true)), G('bitis', 'Hangisi bitiştedir?', genPath(false))] },
      { id: 'kirli_temiz', label: 'Kirli - Temiz', groups: [G('kirli', 'Hangisi kirlidir?', genBinary({ objs: DIRTY_OBJS, target: true, render: dirtyRender })), G('temiz', 'Hangisi temizdir?', genBinary({ objs: DIRTY_OBJS, target: false, render: dirtyRender }))] },
      { id: 'ac_tok', label: 'Aç - Tok', groups: [G('ac', 'Hangisi açtır?', genBinary({ objs: [0, 1, 2, 3, 4, 5], target: true, render: hungryRender })), G('tok', 'Hangisi toktur?', genBinary({ objs: [0, 1, 2, 3, 4, 5], target: false, render: hungryRender }))] },
      { id: 'duz_egri', label: 'Düz - Eğri', groups: [G('duz', 'Hangisi düzdür?', genPools({ yes: DUZ, no: EGRI })), G('egri', 'Hangisi eğridir?', genPools({ yes: EGRI, no: DUZ }))] },
      { id: 'dogru_yanlis', label: 'Doğru - Yanlış', groups: [G('dogru', 'Hangisi doğrudur? (sayı ile resim aynı)', genTruth(true)), G('yanlis', 'Hangisi yanlıştır? (sayı ile resim farklı)', genTruth(false))] },
      { id: 'yasli_genc', label: 'Yaşlı - Genç', groups: [G('yasli', 'Hangisi yaşlıdır?', genAge(true)), G('genc', 'Hangisi gençtir?', genAge(false))] },
      { id: 'acik_koyu', label: 'Açık - Koyu (Renk)', groups: [G('acik_renk', 'Hangisi açık renklidir?', genTone(true)), G('koyu_renk', 'Hangisi koyu renklidir?', genTone(false))] },
      { id: 'kalabalik_tenha', label: 'Kalabalık - Tenha', groups: [G('kalabalik', 'Hangisi kalabalıktır?', genCrowd(true)), G('tenha', 'Hangisi tenhadır?', genCrowd(false))] }
    ]
  },
  {
    id: 'renk', label: 'Renkler', color: 'red', concepts: COLOR_NAMES.map(cn => ({ id: `renk_${cn.id}`, label: cn.label, groups: [G(`renk_${cn.id}`, `Hangisi ${cn.label.toLocaleLowerCase('tr-TR')}${({ kirmizi: 'dır', mavi: 'dir', sari: 'dır', yesil: 'dir', turuncu: 'dur', mor: 'dur', pembe: 'dir', kahverengi: 'dir', siyah: 'tır', beyaz: 'dır', gri: 'dir' })[cn.id]}?`, genColor(cn.id))] }))
  },
  {
    id: 'sekil', label: 'Geometrik Şekiller', color: 'teal', concepts: [
      { id: 'sekil_daire', label: 'Daire', groups: [G('sekil_daire', 'Hangisi dairedir?', genShape('daire'))] },
      { id: 'sekil_kare', label: 'Kare', groups: [G('sekil_kare', 'Hangisi karedir?', genShape('kare'))] },
      { id: 'sekil_ucgen', label: 'Üçgen', groups: [G('sekil_ucgen', 'Hangisi üçgendir?', genShape('ucgen'))] },
      { id: 'sekil_dikdortgen', label: 'Dikdörtgen', groups: [G('sekil_dikdortgen', 'Hangisi dikdörtgendir?', genShape('dikdortgen'))] }
    ]
  }
];

// Grup anahtarına göre hızlı erişim
export const CONCEPT_GROUP_INDEX = (() => {
  const idx = {};
  CONCEPT_CATEGORIES.forEach(cat => cat.concepts.forEach(con => con.groups.forEach(g => { idx[g.key] = { ...g, conceptId: con.id, conceptLabel: con.label, categoryId: cat.id, categoryLabel: cat.label }; })));
  return idx;
})();

const _cache = {};
// Bir grubun tüm şablonlarını üretir (tembel + önbellekli)
export const getConceptTemplates = (groupKey) => {
  if (_cache[groupKey]) return _cache[groupKey];
  const g = CONCEPT_GROUP_INDEX[groupKey];
  if (!g) return [];
  const list = [];
  for (let i = 0; i < g.count; i++) {
    let t;
    try { t = g.gen(groupKey, i); } catch (e) { console.error('kavram şablonu üretilemedi', groupKey, i, e); continue; }
    list.push({
      id: i + 1,
      groupKey,
      title: `${g.conceptLabel} • ${g.text} #${i + 1}`,
      text: g.text,
      mainImage: make3DDataUrl(t.mainImage || ''), // 3D / hacimli görünüm
      options: t.options.map(img => ({ text: '', image: make3DDataUrl(img), audio: '' })),
      correctIndex: t.correctIndex
    });
  }
  _cache[groupKey] = list;
  return list;
};

export const countConceptGroups = () => Object.keys(CONCEPT_GROUP_INDEX).length;
export const countConceptTemplates = () => Object.values(CONCEPT_GROUP_INDEX).reduce((a, g) => a + g.count, 0);
