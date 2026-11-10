import { createSeededRng } from './shared';

// ============================================================================
// --- GRUP: 12. ETKİLEŞİMLİ BİLEŞEN - GÖLGE BULMA (SHADOW QUIZ) ---
// ============================================================================
// TÜM SEVİYELER 3 ŞIKLI (okul öncesi için 4 şık fazla).
// KOLAY SEVİYE: basit nesneler (kelebek, ağaç, roket ...). Eskiden yanlış şıklar BAŞKA
//   nesnelerdi (çok kolaydı). Artık yanlış şıklar AYNI nesnenin gölgesidir; bir parçası
//   eksik, fazladan bir parçası var ya da oranı (en/boy) değişmiş.
// ORTA SEVİYE : eskinin "zor" seviyesi — parçalı resimler, tek ayrıntı farkı:
// ZOR SEVİYE  : yanlış şıklar yalnızca KÜÇÜK bir ayrıntıyla ayrılır (gözlük, fiyonk, anten,
//   bayrak, top ...), ayrıca iki nesneli sahneler (çocuk + ev) ve ayna görüntüsü çeldiricisi.
// Eski açıklama:
//   - Önden insan figürleri (şapka, saç, kollar, balon, şemsiye, pelerin ...)
//   - Yandan (profilden) çocuklar (gözlük çerçevesi, şapka siperi, sırt çantası ...)
//   - Evler (çatı tipi, baca, anten, bayrak, ağaç, çit, garaj ...)
//   - Topluluklar (el ele tutuşan 2-3 kişi)
// Zor seviyede yanlış şıklar, doğru gölgeden SADECE BİR görünür ayrıntıyla ayrılır
// (ör. profildeki gözlük çerçevesi yok, şapkanın siperi yok, bir kol aşağıda).
// Farklar tablette rahatça görülecek büyüklüktedir; piksel düzeyinde minik fark yoktur.

const SHADOW_COLOR = '#0f172a';

// ---------------------------------------------------------------------------
// ORTA SEVİYE (tek parça basit nesneler)
// ---------------------------------------------------------------------------
export const SHADOW_SHAPES_POOL = [
  { name: 'Kelebek', paths: ['M50,50 C25,15 5,25 15,50 C5,75 25,85 50,55 C75,85 95,75 85,50 C95,25 75,15 50,50 Z', 'M48,25 L52,25 L52,80 L48,80 Z', 'M49,26 L40,12 L42,11 L51,25 Z M51,26 L60,12 L58,11 L49,25 Z'] },
  { name: 'Çam Ağacı', paths: ['M50,10 L80,45 L62,45 L85,72 L15,72 L38,45 L20,45 Z', 'M43,72 L57,72 L57,92 L43,92 Z'] },
  { name: 'Roket', paths: ['M50,8 C65,28 68,55 65,75 L80,88 L62,82 L38,82 L20,88 L35,75 C32,55 35,28 50,8 Z', 'M44,82 L56,82 L50,95 Z'] },
  { name: 'Balık', paths: ['M15,50 C30,22 65,22 75,50 C65,78 30,78 15,50 Z', 'M72,50 L92,30 L88,50 L92,70 Z', 'M40,30 L50,16 L58,28 Z'] },
  { name: 'Ev', paths: ['M50,12 L88,45 L76,45 L76,88 L24,88 L24,45 L12,45 Z', 'M62,20 L72,20 L72,38 L62,38 Z'] },
  { name: 'Yelkenli', paths: ['M48,14 L48,68 L18,68 Z', 'M52,22 L78,68 L52,68 Z', 'M15,72 L85,72 L72,88 L28,88 Z'] },
  { name: 'Taç', paths: ['M14,76 L20,30 L40,54 L50,22 L60,54 L80,30 L86,76 Z', 'M14,78 L86,78 L86,86 L14,86 Z'] },
  { name: 'Kupa', paths: ['M26,18 L74,18 L68,56 C66,70 34,70 32,56 Z', 'M45,66 L55,66 L55,82 L45,82 Z', 'M30,82 L70,82 L70,90 L30,90 Z', 'M26,24 C10,24 12,46 30,48 L31,42 C20,40 19,30 27,30 Z'] },
  { name: 'Kuş', paths: ['M20,55 C30,30 55,28 70,42 L88,36 L75,52 C72,72 42,78 20,55 Z', 'M36,70 L34,88 L40,88 L42,70 Z M52,70 L50,88 L56,88 L58,70 Z'] },
  { name: 'Uçak', paths: ['M50,10 L58,38 L90,52 L58,58 L56,80 L70,90 L30,90 L44,80 L42,58 L10,52 L42,38 Z'] },
  { name: 'Mantar', paths: ['M12,54 C12,20 88,20 88,54 Z', 'M38,54 L62,54 L64,88 L36,88 Z'] },
  { name: 'Şemsiye', paths: ['M10,50 C10,12 90,12 90,50 Z', 'M48,50 L52,50 L52,82 C52,92 38,92 38,82 L42,82 C42,86 48,86 48,82 Z'] },
  { name: 'Araba', paths: ['M8,62 L14,46 L32,44 L42,30 L68,30 L80,44 L92,48 L92,64 L8,64 Z', 'M18,64 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 Z', 'M62,64 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 Z'] },
  { name: 'Kaktüs', paths: ['M42,90 L42,20 C42,10 58,10 58,20 L58,90 Z', 'M42,56 L28,56 L28,34 C28,28 36,28 36,34 L36,48 L42,48 Z', 'M58,46 L72,46 L72,28 C72,22 80,22 80,28 L80,54 L58,54 Z'] },
  { name: 'Ayıcık', paths: ['M50,30 C72,30 80,46 80,60 C80,80 66,90 50,90 C34,90 20,80 20,60 C20,46 28,30 50,30 Z', 'M18,30 a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0 Z', 'M60,30 a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0 Z'] },
  { name: 'Dondurma', paths: ['M32,46 L68,46 L50,92 Z', 'M30,46 C24,30 40,18 50,26 C60,18 76,30 70,46 Z', 'M47,22 C47,14 53,14 53,22 Z'] }
];

// Fazladan eklenecek küçük parçalar (yanlış şık "fazla parça" için)
const EXTRA_BITS = [
  'M76,14 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0 Z',
  'M8,80 L22,70 L22,90 Z',
  'M80,74 L94,80 L80,88 Z',
  'M8,18 L20,10 L22,24 Z'
];

// mod: 'none' | { drop: k } | { extra: j } | { sx, sy }
const shapeSvg = (item, idxColor, colorMode, transformAttr, mod = 'none') => {
  const palette = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
  const shadow = colorMode === 'shadow';
  const mainFill = shadow ? SHADOW_COLOR : palette[idxColor % palette.length];
  const secFill = shadow ? SHADOW_COLOR : palette[(idxColor + 2) % palette.length];
  const strokeCol = shadow ? SHADOW_COLOR : '#1e293b';
  let paths = item.paths.map((d, i) => ({ d, i }));
  if (mod && mod.drop !== undefined) paths = paths.filter(p => p.i !== mod.drop);
  let inner = paths.map(p => `<path d="${p.d}" fill="${p.i === 0 ? mainFill : secFill}" stroke="${strokeCol}" stroke-width="3" stroke-linejoin="round"/>`).join('');
  if (mod && mod.extra !== undefined) inner += `<path d="${EXTRA_BITS[mod.extra % EXTRA_BITS.length]}" fill="${mainFill}" stroke="${strokeCol}" stroke-width="3" stroke-linejoin="round"/>`;
  if (mod && mod.sx) inner = `<g transform="translate(50 50) scale(${mod.sx} ${mod.sy}) translate(-50 -50)">${inner}</g>`;
  return `<g transform="${transformAttr}">${inner}</g>`;
};

const ORIENTS = { none: '', flipX: 'translate(100,0) scale(-1,1)', tilt: 'rotate(-14 50 50)' };

export const buildShadowSvgDataUrl = (shapeIdx, colorMode = 'colored', transformType = 'none', mod = 'none') => {
  const item = SHADOW_SHAPES_POOL[shapeIdx % SHADOW_SHAPES_POOL.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="220" height="220"><rect width="100%" height="100%" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>${shapeSvg(item, shapeIdx, colorMode, ORIENTS[transformType] || '', mod)}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Aynı nesne için 2 farklı "bozuk" gölge (eksik parça / fazla parça / oran)
const easyMods = (item, i) => {
  const mods = [];
  if (item.paths.length > 1) {
    const k = 1 + (i % (item.paths.length - 1));
    mods.push({ drop: k });
  }
  mods.push({ extra: i % EXTRA_BITS.length });
  mods.push(i % 2 === 0 ? { sx: 1, sy: 0.72 } : { sx: 0.7, sy: 1 });
  // her soruda farklı ikili
  const start = i % mods.length;
  return [mods[start], mods[(start + 1) % mods.length]];
};

const generateEasyShadowTemplates = (count = 300) => {
  const templates = [];
  const N = SHADOW_SHAPES_POOL.length;
  for (let i = 0; i < count; i++) {
    const baseShapeIdx = i % N;
    const round = Math.floor(i / N);
    const baseOrient = round % 3 === 0 ? 'none' : round % 3 === 1 ? 'flipX' : 'tilt';
    const item = SHADOW_SHAPES_POOL[baseShapeIdx];
    const [m1, m2] = easyMods(item, i + round);
    const rawOpts = [
      buildShadowSvgDataUrl(baseShapeIdx, 'shadow', baseOrient, 'none'),
      buildShadowSvgDataUrl(baseShapeIdx, 'shadow', baseOrient, m1),
      buildShadowSvgDataUrl(baseShapeIdx, 'shadow', baseOrient, m2)
    ];
    const correctSlot = (i * 2 + round) % 3;
    const opts = [];
    for (let k = 0; k < 3; k++) opts[(k + correctSlot) % 3] = rawOpts[k];
    templates.push({
      id: i + 1,
      level: 'easy',
      title: `Kolay Gölge Bulma #${i + 1} (${item.name})`,
      mainImage: buildShadowSvgDataUrl(baseShapeIdx, 'colored', baseOrient, 'none'),
      options: opts.map(img => ({ text: '', image: img, audio: '' })),
      correctIndex: correctSlot
    });
  }
  return templates;
};

// ---------------------------------------------------------------------------
// ZOR SEVİYE - PARÇALI RESİM ÇİZİCİ
// ---------------------------------------------------------------------------
// Her parça bir "rol" ile boyanır. Renkli görselde rol renkleri, gölgede hepsi siyah.
const OUTLINE = '#1e293b';

const el = {
  path: (d, role) => ({ t: 'p', d, role }),
  line: (d, role, w = 6) => ({ t: 'l', d, role, w }),
  circle: (cx, cy, r, role) => ({ t: 'p', d: `M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0 Z`, role }),
  ellipse: (cx, cy, rx, ry, role) => ({ t: 'p', d: `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0 Z`, role }),
  rect: (x, y, w, h, role) => ({ t: 'p', d: `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`, role }),
  group: (items, transform) => ({ t: 'g', items, transform })
};

const renderItems = (items, colorOf, shadow) => items.map(it => {
  if (it.t === 'g') return `<g transform="${it.transform}">${renderItems(it.items, colorOf, shadow)}</g>`;
  if (it.t === 'l') {
    const col = shadow ? SHADOW_COLOR : colorOf(it.role);
    const outline = shadow ? SHADOW_COLOR : OUTLINE;
    return `<path d="${it.d}" fill="none" stroke="${outline}" stroke-width="${it.w + 2.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${it.d}" fill="none" stroke="${col}" stroke-width="${it.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const fill = shadow ? SHADOW_COLOR : colorOf(it.role);
  const stroke = shadow ? SHADOW_COLOR : OUTLINE;
  return `<path d="${it.d}" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>`;
}).join('');

const svgUrl = (inner) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="220" height="220"><rect width="100%" height="100%" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>${inner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// --- RENK TAKIMLARI ---
const SKINS = ['#fcd5b5', '#e8b48a', '#c68a5a', '#8d5a3b'];
const HAIRS = ['#3f2a1d', '#111827', '#b45309', '#facc15', '#7c2d12'];
const SHIRTS = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#0ea5e9', '#ec4899', '#14b8a6'];
const PANTS = ['#1d4ed8', '#334155', '#7c3aed', '#047857', '#9a3412', '#be185d'];
const ACCENTS = ['#f43f5e', '#facc15', '#22d3ee', '#84cc16', '#fb923c', '#c084fc'];

const makePalette = (rng) => {
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  return {
    skin: pick(SKINS), hair: pick(HAIRS), shirt: pick(SHIRTS), pants: pick(PANTS),
    shoe: '#1f2937', hat: pick(SHIRTS), accent: pick(ACCENTS), accent2: pick(ACCENTS), string: '#475569',
    glasses: '#111827', wall: pick(['#fde68a', '#fecaca', '#bfdbfe', '#ddd6fe', '#bbf7d0']), wall2: pick(['#e5e7eb', '#fed7aa', '#c7d2fe']),
    roof: pick(['#b91c1c', '#7c2d12', '#1e3a8a', '#065f46']), roof2: '#57534e', metal: '#64748b', trunk: '#92400e', leaf: pick(['#16a34a', '#15803d', '#65a30d']), fence: '#a16207'
  };
};

// --- ÖNDEN İNSAN ---
const ARM_HANDS = { down: [66, 57], out: [81, 36], up: [69, 10] };
const personParts = (f) => {
  const back = [];
  const body = [];
  const front = [];
  // Saç (arkada kalan kısımlar)
  if (f.hair === 'ponytail') back.push(el.ellipse(62, 23, 4.5, 8.5, 'hair'));
  if (f.hair === 'long') back.push(el.path('M40,20 C40,8 60,8 60,20 L63,41 L37,41 Z', 'hair'));
  if (f.hair === 'pigtails') { back.push(el.circle(38.5, 25, 4.8, 'hair')); back.push(el.circle(61.5, 25, 4.8, 'hair')); }
  if (f.hair === 'bun') back.push(el.circle(50, 10.5, 5.5, 'hair'));
  // Pelerin
  if (f.cape) back.push(el.path('M40,34 L60,34 L71,73 L29,73 Z', 'accent'));

  // Bacaklar
  const walk = f.legs === 'walk';
  if (f.lower === 'skirt') {
    body.push(el.rect(41.5, 66, 6, 22, 'skin'));
    body.push(walk ? el.path('M53,66 L59,66 L66,86 L60,88 Z', 'skin') : el.rect(52.5, 66, 6, 22, 'skin'));
  } else {
    body.push(el.rect(39.5, 56, 9, 32, 'pants'));
    body.push(walk ? el.path('M51.5,56 L60.5,56 L69,85 L61,88 Z', 'pants') : el.rect(51.5, 56, 9, 32, 'pants'));
  }
  body.push(el.ellipse(43.5, 90, 6, 3.5, 'shoe'));
  body.push(walk ? el.ellipse(66, 88, 6, 3.5, 'shoe') : el.ellipse(56.5, 90, 6, 3.5, 'shoe'));
  // Gövde
  body.push(el.path('M40,33 L60,33 L62,58 L38,58 Z', 'shirt'));
  if (f.lower === 'skirt') body.push(el.path('M38,54 L62,54 L69,70 L31,70 Z', 'pants'));

  // Kollar
  const armPath = (pose, side) => {
    const sx = side === 'R' ? 59 : 41;
    const mx = (x) => (side === 'R' ? x : 100 - x);
    if (pose === 'hip') return { d: `M${sx},36 L${mx(70)},46 L${mx(62)},55`, hand: null };
    const [hx, hy] = ARM_HANDS[pose];
    return { d: `M${sx},36 L${mx(hx)},${hy}`, hand: [mx(hx), hy] };
  };
  const L = armPath(f.lArm, 'L');
  const R = armPath(f.rArm, 'R');
  body.push(el.line(L.d, 'shirt', 6));
  body.push(el.line(R.d, 'shirt', 6));
  if (L.hand) body.push(el.circle(L.hand[0], L.hand[1], 3.4, 'skin'));
  if (R.hand) body.push(el.circle(R.hand[0], R.hand[1], 3.4, 'skin'));

  // Baş
  body.push(el.circle(50, 22, 9, 'skin'));
  if (f.hair !== 'none') body.push(el.path('M41,21 C41,10 59,10 59,21 C55,15.5 45,15.5 41,21 Z', 'hair'));

  // Şapkalar
  if (f.hat === 'cap') { front.push(el.path('M41,18 C41,7.5 59,7.5 59,18 Z', 'hat')); front.push(el.path(`M${f.capDir === 'L' ? 43 : 57},15.5 L${f.capDir === 'L' ? 28 : 72},15.5 L${f.capDir === 'L' ? 28 : 72},19.5 L${f.capDir === 'L' ? 43 : 57},19.5 Z`, 'hat')); }
  if (f.hat === 'tophat') { front.push(el.rect(43, 0.5, 14, 13, 'hat')); front.push(el.rect(37, 12.5, 26, 4, 'hat')); }
  if (f.hat === 'party') { front.push(el.path('M41.5,16 L58.5,16 L50,1 Z', 'hat')); }
  if (f.hat === 'bow') { front.push(el.path('M56,12 L64,6 L64,18 Z', 'accent')); front.push(el.path('M56,12 L48,6 L48,18 Z', 'accent')); }

  // Sağ eldeki eşya
  if (R.hand && f.item !== 'none' && f.item !== 'ball') {
    const [hx, hy] = R.hand;
    if (f.item === 'balloon') {
      const by = Math.max(13, hy - 34);
      front.push(el.line(`M${hx},${hy} L${hx + 3},${by + 9}`, 'string', 1.3));
      front.push(el.ellipse(hx + 3, by, 7.5, 9.5, 'accent2'));
    } else if (f.item === 'umbrella') {
      const top = Math.max(16, hy - 30);
      front.push(el.line(`M${hx},${hy} L${hx},${top}`, 'metal', 2.2));
      front.push(el.path(`M${hx - 15},${top} A15,15 0 0 1 ${hx + 15},${top} Z`, 'accent2'));
    } else if (f.item === 'flag') {
      const top = Math.max(4, hy - 30);
      front.push(el.line(`M${hx},${hy} L${hx},${top}`, 'metal', 2.2));
      front.push(el.path(`M${hx},${top} L${hx + 16},${top + 5} L${hx},${top + 10} Z`, 'accent2'));
    } else if (f.item === 'bag') {
      front.push(el.line(`M${hx - 4},${hy + 4} L${hx},${hy} L${hx + 4},${hy + 4}`, 'string', 1.5));
      front.push(el.rect(hx - 7, hy + 4, 14, 12, 'accent2'));
    }
  }
  if (f.item === 'ball') front.push(el.circle(f.legs === 'walk' ? 82 : 76, 87, 7, 'accent2'));
  return [...back, ...body, ...front];
};

// --- YANDAN (PROFİL) ÇOCUK ---
const profileParts = (f) => {
  const back = [];
  const body = [];
  const front = [];
  if (f.hair === 'ponytail') back.push(el.ellipse(38.5, 26, 4.5, 9, 'hair'));
  if (f.backpack) back.push(el.path('M31,36 L43,36 L44,58 L32,58 Z', 'accent2'));
  // Bacaklar
  if (f.legs === 'walk') {
    body.push(el.path('M44,56 L52,56 L45,88 L37,87 Z', 'pants'));
    body.push(el.path('M47,56 L55,56 L63,86 L55,88 Z', 'pants'));
    body.push(el.ellipse(42, 89.5, 6.5, 3.5, 'shoe'));
    body.push(el.ellipse(62, 89, 6.5, 3.5, 'shoe'));
  } else {
    body.push(el.rect(44, 56, 10, 32, 'pants'));
    body.push(el.ellipse(52, 90, 7.5, 3.5, 'shoe'));
  }
  body.push(el.path('M42,33 L57,33 L58.5,58 L41.5,58 Z', 'shirt'));
  // Kol
  const hand = f.arm === 'forward' ? [72, 41] : f.arm === 'up' ? [61, 10] : [55, 58];
  body.push(el.line(`M50,37 L${hand[0]},${hand[1]}`, 'shirt', 6));
  body.push(el.circle(hand[0], hand[1], 3.4, 'skin'));
  if (f.arm === 'forward' && f.book) front.push(el.rect(71, 31, 7, 17, 'accent'));
  // Baş + burun
  body.push(el.path('M58.5,20 L64.5,25.5 L58,27.5 Z', 'skin'));
  body.push(el.circle(50, 22, 9, 'skin'));
  body.push(el.path('M41,24 C40,10 58,9 59.5,18 L51,17 L46,29 L41.5,29 Z', 'hair'));
  // Gözlük: yüzün önünden taşan çerçeve (gölgede görünür!)
  if (f.glasses) {
    front.push(el.line('M47,21 L57,20.5', 'glasses', 1.6));
    front.push(el.path('M55,17 L67.5,17 L67.5,25.5 L55,25.5 Z', 'glasses'));
  }
  if (f.headwear === 'cap') { front.push(el.path('M41,18 C41,7.5 59,7.5 59,18 Z', 'hat')); front.push(el.path('M57,15 L72,16 L72,19.5 L57,19 Z', 'hat')); }
  if (f.headwear === 'beanie') { front.push(el.path('M40.5,19 C40.5,6 59.5,6 59.5,19 Z', 'hat')); front.push(el.circle(50, 5, 3.6, 'accent')); }
  return [...back, ...body, ...front];
};

// --- EV ---
const houseParts = (f) => {
  const items = [];
  const roofTopY = f.roof === 'triangle' ? 24 : f.roof === 'mansard' ? 34 : 46;
  // Yanlar
  const tree = (x) => [el.rect(x - 2, 70, 4, 22, 'trunk'), el.circle(x, 61, 10.5, 'leaf')];
  const fence = (x0) => {
    const out = [el.rect(x0 - 1, 81, 23, 3, 'fence')];
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * 6;
      out.push(el.path(`M${x},92 L${x},78 L${x + 2},75 L${x + 4},78 L${x + 4},92 Z`, 'fence'));
    }
    return out;
  };
  if (f.left === 'tree') items.push(...tree(12));
  if (f.left === 'fence') items.push(...fence(2));
  if (f.right === 'tree') items.push(...tree(88));
  if (f.right === 'fence') items.push(...fence(76));
  if (f.right === 'garage') { items.push(el.rect(70, 68, 25, 24, 'wall2')); items.push(el.rect(69, 64.5, 27, 4.5, 'roof')); }
  // Baca (çatının arkasında)
  if (f.chimney !== 'none') {
    const cx = f.chimney === 'right' ? 60 : 33;
    const top = roofTopY + (f.roof === 'triangle' ? 4 : -9);
    items.push(el.rect(cx, top, 7, 52 - top, 'roof2'));
  }
  // Duvar + çatı
  items.push(el.rect(30, 52, 40, 40, 'wall'));
  items.push(el.rect(45, 72, 10, 20, 'roof2'));
  if (f.roof === 'triangle') items.push(el.path('M24,53 L76,53 L50,24 Z', 'roof'));
  if (f.roof === 'mansard') items.push(el.path('M26,53 L74,53 L66,34 L34,34 Z', 'roof'));
  if (f.roof === 'flat') items.push(el.rect(27, 46, 46, 7, 'roof'));
  // Çatı üstü
  if (f.topper === 'antenna') {
    items.push(el.line(`M50,${roofTopY} L50,${roofTopY - 15}`, 'metal', 2));
    items.push(el.line(`M43,${roofTopY - 11} L57,${roofTopY - 11}`, 'metal', 2));
  }
  if (f.topper === 'flag') {
    items.push(el.line(`M50,${roofTopY} L50,${roofTopY - 17}`, 'metal', 2));
    items.push(el.path(`M50,${roofTopY - 17} L64,${roofTopY - 13} L50,${roofTopY - 9} Z`, 'accent'));
  }
  return items;
};

// --- TOPLULUK (2-3 kişi el ele) ---
const groupParts = (f) => {
  const n = f.members.length;
  const xs = n === 2 ? [32, 68] : [19, 50, 81];
  const out = [];
  f.members.forEach((m, i) => {
    const s = m.tall ? 0.8 : 0.66;
    const isFirst = i === 0;
    const isLast = i === n - 1;
    const person = {
      hair: m.hair, hat: m.hat, cape: false, lower: m.lower, legs: 'stand',
      lArm: isFirst ? m.outerArm : 'out',
      rArm: isLast ? m.outerArm : 'out',
      item: isLast && m.outerArm !== 'up' ? m.item : 'none', capDir: 'R'
    };
    out.push(el.group(personParts(person), `translate(${xs[i]},95) scale(${s}) translate(-50,-95)`));
  });
  return out;
};

// ---------------------------------------------------------------------------
// ZOR SEVİYE - ÖZELLİK ÜRETİCİ VE "TEK FARK" (ÇELDİRİCİ) ÜRETİCİ
// ---------------------------------------------------------------------------
const PERSON_OPTS = {
  hair: ['none', 'ponytail', 'pigtails', 'bun'],
  hat: ['none', 'cap', 'tophat', 'party', 'bow'],
  lArm: ['down', 'out', 'up', 'hip'],
  rArm: ['down', 'out', 'up', 'hip'],
  lower: ['pants', 'skirt'],
  legs: ['stand', 'walk'],
  item: ['none', 'balloon', 'umbrella', 'bag', 'flag', 'ball'],
  cape: [false, true]
};
const validPerson = (f) => {
  if (f.hair === 'bun' && f.hat !== 'none' && f.hat !== 'bow') return false;
  if (f.hair === 'long' && f.cape) return false;
  if (['balloon', 'umbrella', 'flag'].includes(f.item) && !['down', 'out'].includes(f.rArm)) return false;
  if (f.item === 'bag' && !['down', 'out'].includes(f.rArm)) return false;
  if (f.item === 'umbrella' && f.hat === 'tophat') return false;
  if (f.lArm === 'up' && f.rArm === 'up' && f.item === 'none' && f.hat === 'none') return false;
  return true;
};

const PROFILE_OPTS = {
  glasses: [true, false],
  headwear: ['none', 'cap', 'beanie'],
  hair: ['short', 'ponytail'],
  backpack: [false, true],
  arm: ['down', 'forward', 'up'],
  legs: ['stand', 'walk'],
  book: [false, true]
};
const validProfile = (f) => !(f.book && f.arm !== 'forward');

const HOUSE_OPTS = {
  roof: ['triangle', 'mansard', 'flat'],
  chimney: ['none', 'left', 'right'],
  topper: ['none', 'antenna', 'flag'],
  left: ['none', 'tree', 'fence'],
  right: ['none', 'tree', 'garage', 'fence']
};
const validHouse = () => true;

const MEMBER_OPTS = {
  hair: ['none', 'pigtails', 'bun', 'ponytail'],
  hat: ['none', 'cap', 'party', 'bow'],
  lower: ['pants', 'skirt'],
  outerArm: ['down', 'up', 'hip'],
  item: ['none', 'balloon', 'flag'],
  tall: [false, true]
};
const validMember = (m) => !(m.hair === 'bun' && (m.hat === 'cap' || m.hat === 'party'));

const KIND_DEFS = {
  person: { label: 'Çocuk', opts: PERSON_OPTS, valid: validPerson, parts: personParts },
  profile: { label: 'Yandan Çocuk', opts: PROFILE_OPTS, valid: validProfile, parts: profileParts },
  house: { label: 'Ev', opts: HOUSE_OPTS, valid: validHouse, parts: houseParts }
};

const randomFrom = (opts, rng) => {
  const f = {};
  Object.keys(opts).forEach(k => { f[k] = opts[k][Math.floor(rng() * opts[k].length)]; });
  return f;
};

const sigOf = (kind, f) => `${kind}:${JSON.stringify(f)}`;

// Bir özelliği değiştirerek geçerli ve farklı bir çeldirici üretir
const mutateOnce = (kind, f, rng, avoidKeys = []) => {
  if (kind === 'group') {
    const idx = Math.floor(rng() * f.members.length);
    // Küçük ölçekte saç farkı zor seçildiği için toplulukta saç değiştirilmez
    const keys = Object.keys(MEMBER_OPTS).filter(k => k !== 'tall' && k !== 'hair' && !avoidKeys.includes(`${idx}.${k}`));
    const key = keys[Math.floor(rng() * keys.length)];
    const choices = MEMBER_OPTS[key].filter(v => v !== f.members[idx][key]);
    const val = choices[Math.floor(rng() * choices.length)];
    const members = f.members.map((m, i) => (i === idx ? { ...m, [key]: val } : m));
    if (!validMember(members[idx])) return null;
    // Ortadaki/ilk kişide eşya görünmez; görünmeyen değişiklikleri engelle
    const isEdge = idx === 0 || idx === f.members.length - 1;
    if (key === 'outerArm' && !isEdge) return null;
    if (key === 'item' && idx !== f.members.length - 1) return null;
    if (key === 'item' && ['up', 'hip'].includes(members[idx].outerArm)) return null;
    return { f: { ...f, members }, key: `${idx}.${key}` };
  }
  const def = KIND_DEFS[kind];
  const keys = Object.keys(def.opts).filter(k => !avoidKeys.includes(k));
  const key = keys[Math.floor(rng() * keys.length)];
  const choices = def.opts[key].filter(v => v !== f[key]);
  const val = choices[Math.floor(rng() * choices.length)];
  const nf = { ...f, [key]: val };
  if (!def.valid(nf)) return null;
  // Görünmeyen değişiklikler: eşya yoksa eşya kolu değişimi vb. hepsi görünür kabul edilir
  if (kind === 'person' && key === 'capDir') return null;
  return { f: nf, key };
};

const partsFor = (kind, f) => (kind === 'group' ? groupParts(f) : KIND_DEFS[kind].parts(f));

const buildHardImage = (kind, f, palette, shadow, mirror = false) => {
  const inner = renderItems(partsFor(kind, f), (role) => palette[role] || '#94a3b8', shadow);
  return svgUrl(mirror ? `<g transform="translate(100,0) scale(-1,1)">${inner}</g>` : inner);
};

const KIND_LABELS = { person: 'Çocuk', profile: 'Yandan Çocuk', house: 'Ev', group: 'Topluluk', scene: 'Çocuk ve Ev' };

// ZOR seviyede sadece KÜÇÜK ayrıntılar değişir (büyük kol / bacak / çatı farkı yok)
const SMALL_KEYS = {
  person: ['hat', 'item', 'hair'],
  profile: ['glasses', 'headwear', 'book', 'backpack'],
  house: ['topper', 'chimney'],
  group: ['hat', 'item']
};

// --- SAHNE: çocuk (solda) + ev (sağda) ---
const sceneParts = (f) => [
  el.group(houseParts(f.house), 'translate(64,95) scale(0.62) translate(-50,-95)'),
  el.group(personParts(f.person), 'translate(24,95) scale(0.62) translate(-50,-95)')
];

const partsForKind = (kind, f) => (kind === 'scene' ? sceneParts(f) : partsFor(kind, f));

const mutateSmall = (kind, f, rng, avoidKeys) => {
  if (kind === 'scene') {
    const side = rng() < 0.5 ? 'person' : 'house';
    const m = mutateSmall(side, f[side], rng, avoidKeys.filter(k => k.startsWith(side + '.')).map(k => k.slice(side.length + 1)));
    if (!m) return null;
    return { f: { ...f, [side]: m.f }, key: `${side}.${m.key}` };
  }
  if (kind === 'group') {
    for (let t = 0; t < 8; t++) {
      const m = mutateOnce(kind, f, rng, avoidKeys);
      if (m && SMALL_KEYS.group.includes(m.key.split('.')[1])) return m;
    }
    return null;
  }
  const def = KIND_DEFS[kind];
  const keys = SMALL_KEYS[kind].filter(k => !avoidKeys.includes(k));
  if (keys.length === 0) return null;
  const key = keys[Math.floor(rng() * keys.length)];
  const choices = def.opts[key].filter(v => v !== f[key]);
  const val = choices[Math.floor(rng() * choices.length)];
  const nf = { ...f, [key]: val };
  if (!def.valid(nf)) return null;
  return { f: nf, key };
};

const randomFigure = (kind, rng) => {
  if (kind === 'group') {
    const size = rng() < 0.5 ? 2 : 3;
    const members = [];
    for (let m = 0; m < size; m++) {
      let mm;
      do { mm = randomFrom(MEMBER_OPTS, rng); } while (!validMember(mm));
      members.push(mm);
    }
    return { members };
  }
  if (kind === 'scene') {
    const person = randomFigure('person', rng);
    const house = randomFigure('house', rng);
    if (!person || !house) return null;
    return { person: { ...person, item: person.item === 'ball' ? 'none' : person.item }, house: { ...house, left: 'none', right: 'none' } };
  }
  const cand = randomFrom(KIND_DEFS[kind].opts, rng);
  if (kind === 'person') cand.capDir = rng() < 0.5 ? 'L' : 'R';
  if (!KIND_DEFS[kind].valid(cand)) return null;
  return cand;
};

// Simetrik olmayan resimlerde ayna görüntüsü gerçekten farklı görünür
const isAsymmetric = (kind) => kind === 'profile' || kind === 'scene';

/**
 * level: 'medium' | 'hard'
 *  medium: (eski zor) her yanlış şık TEK bir özellikle ayrılır
 *  hard  : yanlış şıklar sadece KÜÇÜK ayrıntıyla ayrılır, sahneler + ayna çeldiricisi
 * Her soruda 2 yanlış (toplam 3 şık).
 */
export const generateShadowSpecs = (count = 300, level = 'medium') => {
  const hard = level === 'hard';
  const rng = createSeededRng(hard ? 99117733 : 55443322);
  const plan = [];
  const quota = hard
    ? { person: Math.round(count * 0.3), profile: Math.round(count * 0.25), scene: Math.round(count * 0.25) }
    : { person: Math.round(count * 0.4), profile: Math.round(count * 0.2), house: Math.round(count * 0.2) };
  quota.group = count - Object.values(quota).reduce((a, b) => a + b, 0);
  Object.entries(quota).forEach(([k, q]) => { for (let i = 0; i < q; i++) plan.push(k); });
  for (let i = plan.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [plan[i], plan[j]] = [plan[j], plan[i]]; }

  const seen = new Set();
  const specs = [];
  for (const kind of plan) {
    let f = null;
    for (let tries = 0; tries < 500; tries++) {
      const cand = randomFigure(kind, rng);
      if (!cand) continue;
      if (kind === 'profile' && specs.filter(sp => sp.kind === 'profile').length % 2 === 0) cand.glasses = true;
      const sig = sigOf(kind, cand);
      if (seen.has(sig)) continue;
      seen.add(sig);
      f = cand;
      break;
    }
    if (!f) continue;

    const distractors = [];
    const usedKeys = [];
    const usedSigs = new Set([sigOf(kind, f)]);
    // ZOR: asimetrik resimlerde yanlışlardan biri doğru gölgenin AYNA görüntüsü
    if (hard && isAsymmetric(kind) && specs.length % 3 === 0) {
      distractors.push({ f, mirrorFlip: true, key: 'ayna' });
    }
    if (kind === 'profile' && f.glasses && distractors.length < 2) {
      const nf = { ...f, glasses: false };
      distractors.push({ f: nf, key: 'glasses' });
      usedKeys.push('glasses');
      usedSigs.add(sigOf(kind, nf));
    }
    let guard = 0;
    while (distractors.length < 2 && guard < 300) {
      guard++;
      const m = hard ? mutateSmall(kind, f, rng, usedKeys) : (kind === 'scene' ? mutateSmall(kind, f, rng, usedKeys) : mutateOnce(kind, f, rng, usedKeys));
      if (!m) continue;
      const sg = sigOf(kind, m.f);
      if (usedSigs.has(sg)) continue;
      usedSigs.add(sg);
      usedKeys.push(m.key);
      distractors.push({ f: m.f, key: m.key });
    }
    if (distractors.length < 2) continue;
    const palette = makePalette(rng);
    const mirror = kind !== 'group' && rng() < 0.3;
    specs.push({ kind, f, distractors, palette, mirror, level });
  }
  return specs.slice(0, count);
};
// Eski ad (geriye dönük)
export const generateHardShadowSpecs = (count = 300) => generateShadowSpecs(count, 'medium');

const buildKindImage = (kind, f, palette, shadow, mirror = false) => {
  const inner = renderItems(partsForKind(kind, f), (role) => palette[role] || '#94a3b8', shadow);
  return svgUrl(mirror ? `<g transform="translate(100,0) scale(-1,1)">${inner}</g>` : inner);
};

const LEVEL_LABEL = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' };

// Görseller SADECE ihtiyaç duyulduğunda üretilir (sayfa hızlı açılsın diye)
const makeLazyTemplate = (spec, i) => {
  const correctSlot = (i * 7 + 2) % 3;
  let cache = null;
  const build = () => {
    if (cache) return cache;
    const correct = buildKindImage(spec.kind, spec.f, spec.palette, true, spec.mirror);
    const wrongs = spec.distractors.map(d => buildKindImage(spec.kind, d.f, spec.palette, true, d.mirrorFlip ? !spec.mirror : spec.mirror));
    const raw = [correct, ...wrongs];
    const opts = [];
    for (let k = 0; k < 3; k++) opts[(k + correctSlot) % 3] = raw[k];
    cache = {
      mainImage: buildKindImage(spec.kind, spec.f, spec.palette, false, spec.mirror),
      options: opts.map(img => ({ text: '', image: img, audio: '' }))
    };
    return cache;
  };
  return {
    id: i + 1,
    level: spec.level,
    kind: spec.kind,
    title: `${LEVEL_LABEL[spec.level] || 'Orta'} Gölge Bulma #${i + 1} (${KIND_LABELS[spec.kind]})`,
    correctIndex: correctSlot,
    differenceKeys: spec.distractors.map(d => d.key),
    get mainImage() { return build().mainImage; },
    get options() { return build().options; }
  };
};

const caches = {};
const makeLevel = (level) => {
  if (!caches[level]) caches[level] = level === 'easy' ? generateEasyShadowTemplates(300) : generateShadowSpecs(300, level).map(makeLazyTemplate);
  return caches[level];
};

export const SHADOW_LEVELS = [
  { id: 'easy', label: 'Kolay (300 Soru)' },
  { id: 'medium', label: 'Orta (300 Soru)' },
  { id: 'hard', label: 'Zor (300 Soru)' }
];

export const SHADOW_QUIZ_TEMPLATES = {
  get easy() { return makeLevel('easy'); },
  get medium() { return makeLevel('medium'); },
  get hard() { return makeLevel('hard'); }
};

export const generateShadowTemplatesForLevel = (level = 'medium') => makeLevel(level);
