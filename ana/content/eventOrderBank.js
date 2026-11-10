// ============================================================================
// --- ETKİLEŞİMLİ: OLAY SIRALAMA — ŞABLON ÜRETİCİ (sadece yönetici) ---
// ============================================================================
// Her olay dizisi 4-5 aşamadan oluşur (ör. mum erir, balon şişer, tohum çiçek olur).
// Kolay: 3 resim • Orta: 4 resim • Zor: 5 resim. Her seviye 150 şablon.
// Resimler ekranda karışık sırada gösterilir; çocuk önce olana ilk dokunur.
import { ART, card, put, OL, S, SN, lighten, darken } from './art';
import { makeRng, pick, shuffle } from './helpers';

const COLS = ['#ef4444', '#3b82f6', '#22c55e', '#8b5cf6', '#f97316', '#ec4899', '#06b6d4', '#f59e0b'];
const soil = `<path d="M6,82 C20,70 80,70 94,82 L94,94 L6,94 Z" fill="#92400e" ${S}/>`;
const grass = `<rect x="4" y="84" width="92" height="10" fill="#86efac"/><line x1="4" y1="84" x2="96" y2="84" stroke="#16a34a" stroke-width="2.5"/>`;

// --- Aşama çizimleri (100x100) ---
const glass = (fill, c) => {
  const top = 22, bot = 88, y = bot - (bot - top - 6) * fill;
  return `${fill > 0 ? `<path d="M${30 + (y - top) * 0.12},${y} L${70 - (y - top) * 0.12},${y} L64,${bot} L36,${bot} Z" fill="${c}" opacity=".85"/>` : ''}<path d="M28,${top} L72,${top} L64,${bot} L36,${bot} Z" fill="#e0f2fe" fill-opacity=".35" ${S}/>`;
};
const blocks = (n, cols) => Array.from({ length: n }, (_, k) => `<rect x="${30 + (k % 2 ? 4 : 0)}" y="${80 - (k + 1) * 14}" width="36" height="14" rx="2" fill="${cols[k % cols.length]}" ${S}/>`).join('') + `<rect x="14" y="80" width="72" height="6" rx="2" fill="#a16207" ${S}/>`;
const pizza = (left) => { // left: kalan dilim (0-8)
  let s = '';
  for (let k = 0; k < 8; k++) {
    if (k >= left) continue;
    const a0 = (k * 45 - 90) * Math.PI / 180, a1 = ((k + 1) * 45 - 90) * Math.PI / 180;
    s += `<path d="M50,52 L${(50 + 38 * Math.cos(a0)).toFixed(1)},${(52 + 38 * Math.sin(a0)).toFixed(1)} A38,38 0 0 1 ${(50 + 38 * Math.cos(a1)).toFixed(1)},${(52 + 38 * Math.sin(a1)).toFixed(1)} Z" fill="#fbbf24" ${S}/>`;
    const am = ((k + 0.5) * 45 - 90) * Math.PI / 180;
    s += `<circle cx="${(50 + 24 * Math.cos(am)).toFixed(1)}" cy="${(52 + 24 * Math.sin(am)).toFixed(1)}" r="4" fill="#dc2626"/>`;
  }
  return `<ellipse cx="50" cy="56" rx="44" ry="40" fill="#f8fafc" ${S}/>${s}${left === 0 ? `<circle cx="40" cy="56" r="2" fill="#d97706"/><circle cx="58" cy="50" r="2.5" fill="#d97706"/><circle cx="54" cy="64" r="1.8" fill="#d97706"/>` : ''}`;
};
const appleBites = (b, c) => {
  if (b >= 3) return `<path d="M50,26 C50,18 52,12 56,8" ${SN}/><path d="M40,24 C46,28 54,28 60,24 C54,40 54,62 60,78 C54,74 46,74 40,78 C46,62 46,40 40,24 Z" fill="#fef9c3" ${S}/><path d="M38,22 C42,18 46,20 50,26 C54,20 58,18 62,22" fill="${c}" ${S}/><path d="M38,80 C46,76 54,76 62,80 C58,86 42,86 38,80 Z" fill="${c}" ${S}/>`;
  let s = ART.apple(c);
  if (b >= 1) s += `<circle cx="84" cy="48" r="14" fill="#fff"/><path d="M80,30 C70,40 70,58 80,68" fill="#fef9c3" ${S}/>`;
  if (b >= 2) s += `<circle cx="16" cy="56" r="13" fill="#fff"/><path d="M20,40 C30,48 30,64 20,72" fill="#fef9c3" ${S}/>`;
  return s;
};
const snowman = (st) => {
  let s = `<ellipse cx="50" cy="90" rx="40" ry="6" fill="#e0f2fe"/>`;
  if (st >= 0) s += `<circle cx="50" cy="72" r="18" fill="#fff" ${S}/>`;
  if (st >= 1) s += `<circle cx="50" cy="44" r="13" fill="#fff" ${S}/>`;
  if (st >= 2) s += `<circle cx="50" cy="22" r="10" fill="#fff" ${S}/>`;
  if (st >= 3) s += `<circle cx="46" cy="20" r="1.8" fill="${OL}"/><circle cx="54" cy="20" r="1.8" fill="${OL}"/><path d="M50,23 L60,25 L50,27 Z" fill="#f97316"/><circle cx="50" cy="40" r="1.8" fill="${OL}"/><circle cx="50" cy="48" r="1.8" fill="${OL}"/>`;
  if (st >= 4) s += `<rect x="40" y="2" width="20" height="10" fill="${OL}"/><rect x="36" y="11" width="28" height="3" fill="${OL}"/><path d="M38,32 L62,32 L60,38 L40,38 Z" fill="#ef4444" ${S}/><path d="M58,36 L62,50" stroke="#ef4444" stroke-width="5"/>`;
  return s;
};
const plant = (st, c) => {
  if (st === 0) return `${soil}<ellipse cx="50" cy="80" rx="6" ry="4" fill="#78350f" ${S}/>`;
  if (st === 1) return `${soil}<path d="M50,78 L50,64" ${SN} stroke="#16a34a" stroke-width="4"/><path d="M50,66 C42,58 36,62 38,66 C42,68 46,68 50,66 Z" fill="#22c55e" ${S}/>`;
  if (st === 2) return `${soil}<path d="M50,78 L50,46" ${SN} stroke="#16a34a" stroke-width="4"/><path d="M50,60 C38,50 30,54 30,60 C38,64 46,62 50,60 Z M50,54 C62,44 70,48 70,54 C62,58 54,56 50,54 Z" fill="#22c55e" ${S}/>`;
  if (st === 3) return `${soil}<path d="M50,78 L50,32" ${SN} stroke="#16a34a" stroke-width="4"/><path d="M50,62 C38,52 30,56 30,62 C38,66 46,64 50,62 Z M50,52 C62,42 70,46 70,52 C62,56 54,54 50,52 Z" fill="#22c55e" ${S}/><path d="M50,34 C44,26 46,16 50,12 C54,16 56,26 50,34 Z" fill="${c}" ${S}/>`;
  return `${soil}${put(ART.flower(c), 50, 40, 0.8)}`;
};
const ice = (st) => {
  if (st === 0) return put(ART.icecube(), 50, 52, 1);
  if (st === 1) return `<ellipse cx="50" cy="86" rx="24" ry="5" fill="#7dd3fc"/>${put(ART.icecube(), 50, 62, 0.75)}`;
  if (st === 2) return `<ellipse cx="50" cy="84" rx="32" ry="7" fill="#7dd3fc"/>${put(ART.icecube(), 50, 72, 0.45)}`;
  if (st === 3) return `<ellipse cx="50" cy="78" rx="40" ry="12" fill="#7dd3fc" ${S}/><ellipse cx="40" cy="74" rx="10" ry="3" fill="#fff" opacity=".6"/>`;
  return `<ellipse cx="50" cy="80" rx="28" ry="6" fill="#bae6fd" opacity=".5"/><path d="M40,60 C40,52 44,48 44,40 M52,58 C52,50 56,46 56,38" ${SN} stroke="#94a3b8" stroke-width="2"/>`;
};
const eggSeq = (st) => {
  if (st === 0) return put(ART.egg(), 50, 54, 0.9);
  if (st === 1) return `${put(ART.egg(), 50, 54, 0.9)}<path d="M44,22 L50,32 L46,40 L54,48" ${SN} stroke-width="2"/>`;
  if (st === 2) return `<path d="M20,60 C20,82 34,90 50,90 C66,90 80,82 80,60 L70,52 L62,62 L54,50 L46,62 L38,50 L30,62 Z" fill="#fef3c7" ${S}/>${put(ART.chick(), 50, 38, 0.6)}`;
  if (st === 3) return `${put(ART.chick(), 50, 56, 0.8)}<path d="M10,84 L30,84 L22,74 Z M70,84 L90,84 L80,74 Z" fill="#fef3c7" ${S}/>`;
  return put(ART.chick('#facc15'), 50, 50, 1.05);
};
const bug = (st, c) => {
  if (st === 0) return `${put(ART.leaf(), 50, 50, 1)}<circle cx="46" cy="50" r="4" fill="#fef3c7" ${S} stroke-width="1.5"/><circle cx="54" cy="46" r="4" fill="#fef3c7" ${S} stroke-width="1.5"/><circle cx="56" cy="56" r="4" fill="#fef3c7" ${S} stroke-width="1.5"/>`;
  if (st === 1) return put(ART.caterpillar('#22c55e', { n: 4 }), 50, 54, 0.95);
  if (st === 2) return `<path d="M50,8 L50,20" ${SN}/><path d="M50,20 C66,24 70,50 60,80 C56,90 44,90 40,80 C30,50 34,24 50,20 Z" fill="#a16207" ${S}/><path d="M40,40 L60,44 M38,56 L62,58 M42,70 L58,72" ${SN} stroke-width="1.8"/>`;
  return put(ART.butterfly(c), 50, 50, 1);
};
const sky = (st) => {
  const bgs = ['#fde68a', '#bae6fd', '#7dd3fc', '#fdba74', '#1e3a8a'];
  const pos = [[50, 82], [26, 46], [50, 22], [74, 46], null];
  let s = `<rect x="4" y="4" width="92" height="92" rx="10" fill="${bgs[st]}"/>`;
  if (pos[st]) s += put(ART.sun(), pos[st][0], pos[st][1], st === 0 ? 0.5 : st === 3 ? 0.5 : 0.42);
  else s += `${put(ART.moon(), 50, 38, 0.5)}<circle cx="20" cy="20" r="2" fill="#fff"/><circle cx="78" cy="16" r="2" fill="#fff"/><circle cx="84" cy="44" r="1.5" fill="#fff"/>`;
  s += `<path d="M4,82 L96,82 L96,90 C96,94 92,96 88,96 L12,96 C8,96 4,94 4,90 Z" fill="${st === 4 ? '#166534' : '#22c55e'}"/>`;
  return s;
};
const coloring = (st, c) => {
  const pts = '50,10 61,36 90,38 68,56 75,86 50,70 25,86 32,56 10,38 39,36';
  const clips = [0, 0.34, 0.67, 1];
  const h = clips[Math.min(st, 3)] * 80;
  return `<defs><clipPath id="cl${st}"><rect x="0" y="${90 - h}" width="100" height="${h}"/></clipPath></defs><polygon points="${pts}" fill="#fff" ${S}/><polygon points="${pts}" fill="${c}" clip-path="url(#cl${st})"/><polygon points="${pts}" fill="none" ${S}/>${st < 3 ? put(ART.crayon(c), 84, 76, 0.4, -30) : ''}`;
};
const jarFill = (n) => {
  let s = `<rect x="28" y="12" width="44" height="10" rx="3" fill="#ef4444" ${S}/><path d="M24,24 L76,24 L80,86 C80,90 76,92 72,92 L28,92 C24,92 20,90 20,86 Z" fill="#e0f2fe" fill-opacity=".45" ${S}/>`;
  const spots = [[50, 78], [36, 78], [64, 78], [43, 62], [57, 62], [50, 46]];
  for (let k = 0; k < n; k++) s += put(ART.cookie(), spots[k][0], spots[k][1], 0.2);
  return s;
};
const drive = (st, c) => {
  const x = [14, 32, 50, 68, 86][st];
  return `${grass}<rect x="4" y="74" width="92" height="10" fill="#94a3b8"/>${put(ART.house('#ef4444'), 14, 52, 0.36)}<rect x="78" y="40" width="16" height="34" fill="#fef3c7" ${S}/><path d="M86,40 L86,26 L96,30 L86,34" fill="#22c55e" ${S}/>${put(ART.car(c), x, 66, 0.26)}`;
};
const sandwich = (st) => {
  let s = `<ellipse cx="50" cy="84" rx="42" ry="7" fill="#e2e8f0"/>`;
  s += `<rect x="16" y="68" width="68" height="14" rx="6" fill="#fcd34d" ${S}/>`;
  if (st >= 1) s += `<path d="M14,66 L86,66 L82,70 L18,70 Z" fill="#facc15" ${S}/>`;
  if (st >= 2) s += `<ellipse cx="34" cy="62" rx="12" ry="4" fill="#ef4444" ${S}/><ellipse cx="62" cy="62" rx="12" ry="4" fill="#ef4444" ${S}/>`;
  if (st >= 3) s += `<path d="M14,58 C20,52 26,60 32,54 C38,60 44,52 50,58 C56,52 62,60 68,54 C74,60 80,52 86,58" fill="#22c55e" ${S}/>`;
  if (st >= 4) s += `<path d="M16,54 C16,38 84,38 84,54 Z" fill="#fcd34d" ${S}/>`;
  return s;
};
const iceCream = (st, c) => {
  const cone = `<path d="M34,56 L50,94 L66,56 Z" fill="#fbbf24" ${S}/>`;
  const sc = [c, lighten(c, 0.4), '#a16207'];
  let s = cone;
  const n = [3, 2, 1, 0, 0][st];
  for (let k = 0; k < n; k++) s += `<circle cx="50" cy="${50 - k * 16}" r="16" fill="${sc[k % 3]}" ${S}/>`;
  if (st === 4) s = `<path d="M40,80 L50,94 L60,80 Z" fill="#fbbf24" ${S}/><circle cx="34" cy="70" r="2" fill="#d97706"/><circle cx="66" cy="74" r="2" fill="#d97706"/>`;
  return s;
};
const rain = (st) => {
  if (st === 0) return `${put(ART.sun(), 30, 30, 0.5)}${put(ART.cloud(), 64, 40, 0.5)}${grass}`;
  if (st === 1) return `${put(ART.cloud('#cbd5e1'), 34, 30, 0.55)}${put(ART.cloud('#94a3b8'), 66, 34, 0.55)}${grass}`;
  if (st === 2) return `${put(ART.cloud('#94a3b8'), 50, 28, 0.8)}<path d="M30,52 L26,62 M46,54 L42,64 M62,52 L58,62 M74,56 L70,66 M38,66 L34,76 M56,68 L52,78" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>${grass}`;
  if (st === 3) return `${put(ART.cloud('#cbd5e1'), 66, 26, 0.45)}${grass}<ellipse cx="40" cy="86" rx="22" ry="5" fill="#60a5fa" ${S}/>`;
  return `${put(ART.rainbow(), 50, 52, 0.9)}${put(ART.sun(), 84, 18, 0.32)}${grass}`;
};
const candle = (st, c) => ART.candle(c, { h: [0.95, 0.72, 0.5, 0.3, 0.1][st] });
const balloon = (st, c) => put(ART.balloon(c), 50, [80, 70, 60, 52, 46][st], [0.32, 0.48, 0.64, 0.8, 0.94][st]);
const drink = (st, c) => glass([1, 0.75, 0.5, 0.25, 0][st], c);
const tower = (st, c) => blocks(st + 1, [c, lighten(c, 0.35), darken(c, 0.2)]);
const pizzaSt = (st) => pizza([8, 6, 4, 2, 0][st]);

// Olay dizileri: stages = aşama sayısı, title = ad
const SEQS = [
  { id: 'mum', title: 'Mum eriyor', stages: 5, draw: candle, color: true },
  { id: 'balon', title: 'Balon şişiyor', stages: 5, draw: balloon, color: true },
  { id: 'icecek', title: 'Bardaktaki meyve suyu içiliyor', stages: 5, draw: drink, color: true },
  { id: 'kule', title: 'Bloklarla kule yapılıyor', stages: 5, draw: tower, color: true },
  { id: 'pizza', title: 'Pizza yeniyor', stages: 5, draw: pizzaSt },
  { id: 'cicek', title: 'Tohum çiçek oluyor', stages: 5, draw: plant, color: true },
  { id: 'kardan', title: 'Kardan adam yapılıyor', stages: 5, draw: snowman },
  { id: 'buz', title: 'Buz eriyor', stages: 5, draw: ice },
  { id: 'civciv', title: 'Yumurtadan civciv çıkıyor', stages: 5, draw: eggSeq },
  { id: 'gun', title: 'Sabahtan geceye bir gün', stages: 5, draw: sky },
  { id: 'kurabiye', title: 'Kavanoz kurabiyeyle doluyor', stages: 5, draw: (st) => jarFill([0, 1, 2, 4, 6][st]) },
  { id: 'yolculuk', title: 'Araba evden okula gidiyor', stages: 5, draw: drive, color: true },
  { id: 'sandvic', title: 'Sandviç hazırlanıyor', stages: 5, draw: sandwich },
  { id: 'dondurma', title: 'Dondurma yeniyor', stages: 5, draw: iceCream, color: true },
  { id: 'yagmur', title: 'Yağmur yağıyor, gökkuşağı çıkıyor', stages: 5, draw: rain },
  { id: 'elma', title: 'Elma yeniyor', stages: 4, draw: (st, c) => appleBites(st, c), color: true },
  { id: 'kelebek', title: 'Tırtıl kelebek oluyor', stages: 4, draw: bug, color: true },
  { id: 'boyama', title: 'Yıldız boyanıyor', stages: 4, draw: coloring, color: true }
];

// Seviyelere göre seçilecek aşamalar (aralıklı seçimler sıralamayı netleştirir)
const PICKS = {
  3: { 5: [[0, 2, 4], [0, 1, 4], [0, 3, 4], [1, 2, 4], [0, 2, 3], [1, 3, 4]], 4: [[0, 1, 3], [0, 2, 3], [0, 1, 2], [1, 2, 3]] },
  4: { 5: [[0, 1, 2, 4], [0, 2, 3, 4], [0, 1, 3, 4], [1, 2, 3, 4], [0, 1, 2, 3]], 4: [[0, 1, 2, 3]] },
  5: { 5: [[0, 1, 2, 3, 4]] }
};

export const EVENT_ORDER_LEVELS = {
  easy: { label: 'Kolay', n: 3 },
  medium: { label: 'Orta', n: 4 },
  hard: { label: 'Zor', n: 5 }
};
export const EVENT_ORDER_COUNT = 150;
export const EVENT_ORDER_TEXT = 'Olayları oluş sırasına göre sırala. Önce olana ilk dokun.';

const stageCard = (seq, st, c) => card(put(seq.draw(st, c), 50, 50, 0.92));

const buildLevel = (level) => {
  const n = EVENT_ORDER_LEVELS[level].n;
  const seqs = SEQS.filter(s => PICKS[n][s.stages]);
  const out = []; const seen = new Set();
  for (let i = 0; out.length < EVENT_ORDER_COUNT && i < EVENT_ORDER_COUNT * 20; i++) {
    const rng = makeRng(`event_order_${level}`, i);
    const seq = seqs[i % seqs.length];
    const pickSet = pick(PICKS[n][seq.stages], rng);
    const c = seq.color ? pick(COLS, rng) : '';
    const sig = `${seq.id}|${pickSet.join('')}|${c}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    let order = shuffle(pickSet.map((_, k) => k), rng);
    if (order.every((v, k) => v === k)) order = [...order.slice(1), order[0]]; // zaten doğru sırada olmasın
    out.push({ id: `${level}-${out.length + 1}`, level, title: seq.title, seqId: seq.id, stages: pickSet, color: c, order });
  }
  return out;
};

const cache = {};
export const getEventOrderTemplates = (level) => (cache[level] || (cache[level] = buildLevel(level)));

// Şablon -> soru verisi (resimler doğru sırada, order = ekrandaki dizilim)
export const buildEventOrderPayload = (tpl) => {
  const seq = SEQS.find(s => s.id === tpl.seqId);
  return { items: tpl.stages.map(st => stageCard(seq, st, tpl.color)), order: tpl.order, level: tpl.level, title: tpl.title };
};
