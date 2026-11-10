// ============================================================================
// --- 3D / GERÇEKÇİ GÖRÜNÜM (SVG metni için) ---
// ============================================================================
// Düz renkli SVG çizimlerini "hacimli" gösterir:
//  * Her dolu parçaya kendi renginden üretilmiş ışık-gölge geçişi (sol üstten ışık)
//  * Parçaların kenarına hafif koyu kenar (yuvarlaklık hissi)
//  * Çizimin altına yumuşak gölge
// Renkler korunur: "kırmızı" nesne yine açıkça kırmızı görünür (renk soruları bozulmaz).
// Arka plan kartı, yazılar, yarı saydam parlaklıklar ve çok açık/çok koyu küçük
// parçalar (göz bebeği, parıltı) olduğu gibi bırakılır.

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const norm = (h) => {
  let x = h.toLowerCase();
  if (x.length === 4) x = '#' + x[1] + x[1] + x[2] + x[2] + x[3] + x[3];
  return x;
};
const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixC = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
const lum = (h) => { const [r, g, b] = rgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

// Bir renk için ışık-gölge durakları
export const shadeStops = (c) => {
  const L = lum(c);
  const hi = mixC(c, '#ffffff', L > 0.8 ? 0.7 : 0.55);
  const mid = c;
  const lo = mixC(c, '#000000', L < 0.15 ? 0.15 : 0.32);
  return [[0, hi], [0.22, mixC(c, '#ffffff', 0.18)], [0.55, mid], [1, lo]];
};

const gradId = (c) => `g3d${c.slice(1)}`;

const gradientDef = (c) => {
  const st = shadeStops(c).map(([o, col]) => `<stop offset="${Math.round(o * 100)}%" stop-color="${col}"/>`).join('');
  return `<radialGradient id="${gradId(c)}" cx="38%" cy="30%" r="78%" fx="30%" fy="22%">${st}</radialGradient>`;
};

// SVG kökünde kullanılacak filtre: yumuşak gölge
const SHADOW_FILTER = '<filter id="g3dShadow" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.8"/><feOffset dx="1.2" dy="2.6" result="o"/><feComponentTransfer><feFuncA type="linear" slope="0.32"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

const SHAPE_TAG_RE = /<(path|circle|ellipse|rect|polygon)\b([^>]*?)(\/?)>/g;

/**
 * İç çizim (arka plan kartı HARİÇ) için 3D dönüşümü.
 * @returns {{ inner: string, defs: string }}
 */
export const shadeInner = (inner) => {
  const used = new Set();
  const out = inner.replace(SHAPE_TAG_RE, (m, tag, attrs, close) => {
    const fm = attrs.match(/\sfill="([^"]+)"/);
    if (!fm) return m;
    const f = fm[1].trim();
    if (!HEX_RE.test(f)) return m;
    if (/\s(opacity|fill-opacity)="/.test(attrs)) return m; // parıltı / gölge katmanları
    const c = norm(f);
    const L = lum(c);
    // çok açık (beyaz parıltı) ya da çok koyu küçük parçalar (göz bebeği) düz kalsın
    if (L > 0.96) return m;
    if (L < 0.12 && (tag === 'circle' || tag === 'ellipse')) return m;
    used.add(c);
    return `<${tag}${attrs.replace(/\sfill="[^"]+"/, ` fill="url(#${gradId(c)})"`)}${close}>`;
  });
  const defs = [...used].map(gradientDef).join('');
  return { inner: out, defs };
};

/**
 * Tam bir <svg> metnini 3D görünüme çevirir.
 * Kökün ilk <rect> öğesi (kart arka planı) değiştirilmez.
 */
export const make3DSvg = (svg) => {
  if (!svg || svg.includes('data-g3d')) return svg;
  const open = svg.match(/^<svg\b[^>]*>/);
  if (!open) return svg;
  let body = svg.slice(open[0].length, svg.lastIndexOf('</svg>'));
  // arka plan kartı
  let bg = '';
  const bgM = body.match(/^\s*<rect\b[^>]*\/>/);
  if (bgM) { bg = bgM[0]; body = body.slice(bgM[0].length); }
  const { inner, defs } = shadeInner(body);
  const openTag = open[0].replace('<svg', '<svg data-g3d="1"');
  return `${openTag}<defs>${SHADOW_FILTER}${defs}</defs>${bg}<g filter="url(#g3dShadow)">${inner}</g></svg>`;
};

const PREFIX = 'data:image/svg+xml;utf8,';

/** data:image/svg+xml;utf8,... adresini 3D görünüme çevirir (başka türleri olduğu gibi döndürür). */
export const make3DDataUrl = (url) => {
  if (typeof url !== 'string' || !url.startsWith(PREFIX)) return url;
  try {
    const svg = decodeURIComponent(url.slice(PREFIX.length));
    return PREFIX + encodeURIComponent(make3DSvg(svg));
  } catch (_) { return url; }
};
