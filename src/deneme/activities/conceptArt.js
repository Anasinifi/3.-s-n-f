// ============================================================================
// --- GRUP: KAVRAM SORULARI - SVG ÇİZİM KÜTÜPHANESİ ---
// ============================================================================
// Her çizim 100x100'lük bir kutuya, merkezi (50,50) olacak şekilde çizilir.
// Hayvan ve taşıtların yandan görünenleri SAĞA bakar (sıra / ön-arka soruları için).

export const OL = '#1e293b';
export const S = `stroke="${OL}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
export const SN = `fill="none" ${S}`;

export const PALETTE = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

// Aynı etikette tekrar eden öznitelikleri temizler (sonraki değer geçerli olur) -> geçerli XML
const dedupeAttrs = (svg) => svg.replace(/<([a-zA-Z]+)((?:\s+[\w:-]+="[^"]*")+)\s*(\/?)>/g, (m, tag, attrs, selfClose) => {
  const map = new Map();
  attrs.replace(/([\w:-]+)="([^"]*)"/g, (_, k, v) => { map.delete(k); map.set(k, v); return ''; });
  return `<${tag} ${[...map].map(([k, v]) => `${k}="${v}"`).join(' ')}${selfClose ? '/' : ''}>`;
});
export const encodeSvg = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(dedupeAttrs(svg.replace(/\s+/g, ' ')))}`;

// Şık kartı / sahne kartı
export const card = (inner, { w = 100, h = 100, bg = '#ffffff', border = '#e2e8f0' } = {}) =>
  encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${Math.round(w * 2.2)}" height="${Math.round(h * 2.2)}"><rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="12" fill="${bg}" stroke="${border}" stroke-width="3"/>${inner}</svg>`);

// Bir çizimi (cx,cy) merkezine s ölçeğiyle yerleştir
export const put = (inner, cx, cy, s = 1, rot = 0, flip = false) =>
  `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${flip ? -s : s} ${s}) translate(-50 -50)">${inner}</g>`;

// Renk yardımcıları
const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
export const lighten = (c, t = 0.5) => mix(c, '#ffffff', t);
export const darken = (c, t = 0.35) => mix(c, '#000000', t);
export const fade = (c) => mix(c, '#a8a29e', 0.6); // soluk / eski / mat

const starPts = (cx, cy, R, r, n = 5, rot = -90) => {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = (i % 2 === 0 ? R : r);
    const a = (rot + (i * 180) / n) * Math.PI / 180;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
};

const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${OL}"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;

// ============================================================================
// --- TEMEL NESNELER ---
// ============================================================================
export const ART = {
  apple: (c = '#ef4444', o = {}) => {
    const col = o.stale ? '#a16207' : c;
    return `<path d="M50,30 C38,20 16,24 16,48 C16,70 34,90 50,82 C66,90 84,70 84,48 C84,24 62,20 50,30 Z" fill="${col}" ${S}/>
      <path d="M50,30 C50,22 52,16 56,11" ${SN}/>
      <path d="M54,22 C62,11 75,13 77,17 C71,26 60,27 54,22 Z" fill="${o.stale ? '#78716c' : '#22c55e'}" ${S}/>
      ${o.stale ? `<circle cx="62" cy="60" r="6" fill="#57534e"/><circle cx="36" cy="66" r="4" fill="#57534e"/><path d="M30,48 q6,4 12,0 M56,44 q6,4 12,0" ${SN}/>` : `<ellipse cx="32" cy="44" rx="5" ry="10" fill="#fff" opacity=".45"/>`}`;
  },
  ball: (c = '#3b82f6', o = {}) => `<circle cx="50" cy="52" r="34" fill="${c}"/>
      <path d="M50,18 C36,34 36,70 50,86" fill="none" stroke="#fff" stroke-width="7"/>
      <path d="M50,18 C64,34 64,70 50,86" fill="none" stroke="${o.c2 || '#facc15'}" stroke-width="7"/>
      <circle cx="50" cy="52" r="34" ${SN}/>`,
  star: (c = '#facc15', o = {}) => o.round
    ? `<polygon points="${starPts(50, 52, 36, 19)}" fill="${OL}" stroke="${OL}" stroke-width="19" stroke-linejoin="round"/><polygon points="${starPts(50, 52, 36, 19)}" fill="${c}" stroke="${c}" stroke-width="14" stroke-linejoin="round"/>`
    : `<polygon points="${starPts(50, 52, 40, 17)}" fill="${c}" ${S}/>`,
  heart: (c = '#ec4899') => `<path d="M50,86 C18,64 10,44 18,30 C26,15 46,17 50,32 C54,17 74,15 82,30 C90,44 82,64 50,86 Z" fill="${c}" ${S}/><ellipse cx="30" cy="36" rx="5" ry="8" fill="#fff" opacity=".45"/>`,
  fish: (c = '#f97316') => `<path d="M24,50 L6,34 L9,50 L6,66 Z" fill="${darken(c, 0.15)}" ${S}/>
      <ellipse cx="50" cy="50" rx="30" ry="20" fill="${c}" ${S}/>
      <path d="M44,32 C50,22 60,24 62,32" fill="${darken(c, 0.15)}" ${S}/>
      <path d="M40,40 C46,48 46,54 40,60" ${SN}/>
      ${eye(66, 45, 3.5)}<path d="M74,56 q4,1 6,-2" ${SN}/>`,
  cat: (c = '#f59e0b') => `<path d="M70,78 C88,78 92,60 84,52" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round"/><path d="M70,78 C88,78 92,60 84,52" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="50" cy="70" rx="22" ry="20" fill="${c}" ${S}/>
      <path d="M30,30 L32,10 L46,22 Z M70,30 L68,10 L54,22 Z" fill="${c}" ${S}/>
      <circle cx="50" cy="38" r="21" fill="${c}" ${S}/>
      ${eye(42, 36)}${eye(58, 36)}
      <path d="M47,44 L53,44 L50,48 Z" fill="#f472b6" ${S}/>
      <path d="M50,48 q-4,5 -8,2 M50,48 q4,5 8,2 M26,42 L38,44 M26,48 L38,47 M74,42 L62,44 M74,48 L62,47" ${SN} stroke-width="1.5"/>`,
  dog: (c = '#b45309') => `<ellipse cx="50" cy="74" rx="22" ry="16" fill="${c}" ${S}/>
      <ellipse cx="26" cy="38" rx="9" ry="18" fill="${darken(c, 0.3)}" ${S} transform="rotate(15 26 38)"/>
      <ellipse cx="74" cy="38" rx="9" ry="18" fill="${darken(c, 0.3)}" ${S} transform="rotate(-15 74 38)"/>
      <circle cx="50" cy="40" r="22" fill="${c}" ${S}/>
      <ellipse cx="50" cy="51" rx="12" ry="9" fill="#fef3c7" ${S}/>
      ${eye(41, 36)}${eye(59, 36)}
      <ellipse cx="50" cy="47" rx="4.5" ry="3.5" fill="${OL}"/>
      <path d="M50,51 v3 M45,55 q5,4 10,0" ${SN}/>`,
  bird: (c = '#3b82f6') => `<path d="M24,52 L6,44 L10,58 Z" fill="${darken(c, 0.2)}" ${S}/>
      <ellipse cx="44" cy="56" rx="26" ry="19" fill="${c}" ${S}/>
      <circle cx="66" cy="38" r="14" fill="${c}" ${S}/>
      <path d="M78,36 L92,40 L78,44 Z" fill="#f59e0b" ${S}/>
      ${eye(69, 35)}
      <path d="M30,52 C40,44 52,48 56,58 C46,64 36,62 30,52 Z" fill="${darken(c, 0.2)}" ${S}/>
      <path d="M40,74 L38,86 M50,74 L52,86" ${SN}/>`,
  duck: (c = '#facc15') => `<path d="M18,56 C18,44 24,40 30,44" fill="${c}" ${S}/>
      <path d="M16,58 C16,76 34,82 50,82 C70,82 80,70 76,56 C72,46 56,46 46,52 C38,48 22,46 16,58 Z" fill="${c}" ${S}/>
      <circle cx="66" cy="36" r="14" fill="${c}" ${S}/>
      <path d="M78,36 C88,36 92,40 90,44 L76,44 Z" fill="#f97316" ${S}/>
      ${eye(68, 32)}
      <path d="M32,62 C40,56 52,58 56,66 C46,72 38,70 32,62 Z" fill="${darken(c, 0.12)}" ${S}/>`,
  chick: (c = '#fde047') => `<circle cx="50" cy="56" r="28" fill="${c}" ${S}/>
      <path d="M24,56 C14,52 14,64 24,66 M76,56 C86,52 86,64 76,66" fill="${c}" ${S}/>
      ${eye(41, 48)}${eye(59, 48)}
      <path d="M44,56 L56,56 L50,64 Z" fill="#f97316" ${S}/>
      <path d="M44,22 C46,30 48,30 50,28 C52,30 54,30 56,22" ${SN}/>
      <path d="M42,84 L40,92 M42,84 L44,92 M58,84 L56,92 M58,84 L60,92" ${SN}/>`,
  rabbit: (c = '#f1f5f9') => `<ellipse cx="40" cy="22" rx="7" ry="18" fill="${c}" ${S}/><ellipse cx="60" cy="22" rx="7" ry="18" fill="${c}" ${S}/>
      <ellipse cx="40" cy="22" rx="3" ry="12" fill="#fbcfe8"/><ellipse cx="60" cy="22" rx="3" ry="12" fill="#fbcfe8"/>
      <ellipse cx="50" cy="76" rx="22" ry="16" fill="${c}" ${S}/>
      <circle cx="50" cy="50" r="20" fill="${c}" ${S}/>
      ${eye(43, 47)}${eye(57, 47)}
      <path d="M47,54 L53,54 L50,57 Z" fill="#f472b6" ${S}/><path d="M50,57 q-3,4 -6,2 M50,57 q3,4 6,2" ${SN} stroke-width="1.6"/>`,
  turtle: (c = '#22c55e') => `<ellipse cx="78" cy="58" rx="11" ry="9" fill="#86efac" ${S}/>${eye(81, 55, 2.5)}
      <ellipse cx="30" cy="72" rx="7" ry="9" fill="#86efac" ${S}/><ellipse cx="62" cy="72" rx="7" ry="9" fill="#86efac" ${S}/>
      <path d="M14,66 C14,36 30,26 46,26 C62,26 74,36 74,66 Z" fill="${c}" ${S}/>
      <path d="M30,66 L34,46 L46,38 L58,46 L62,66 M34,46 L22,52 M58,46 L70,52" ${SN} stroke-width="2"/>
      <path d="M12,66 L76,66" ${SN}/>`,
  snail: (c = '#f472b6') => `<path d="M10,78 L80,78 C88,78 90,70 86,62 L80,48" fill="#fde68a" ${S}/>
      <path d="M78,50 L74,32 M84,50 L88,32" ${SN}/><circle cx="74" cy="30" r="3" fill="${OL}"/><circle cx="88" cy="30" r="3" fill="${OL}"/>
      <circle cx="46" cy="52" r="26" fill="${c}" ${S}/>
      <path d="M46,52 m0,-4 a4,4 0 1,1 -4,4 a8,8 0 1,1 8,8 a13,13 0 1,1 -13,-13 a18,18 0 1,1 18,18" ${SN} stroke-width="2"/>`,
  caterpillar: (c = '#22c55e', o = {}) => {
    const n = o.n || 5; const step = 70 / n; let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${14 + i * step}" cy="${56 + (i % 2 ? -4 : 4)}" r="${Math.min(13, step * 0.75)}" fill="${i % 2 ? lighten(c, 0.25) : c}" ${S}/>`;
    const hx = 14 + n * step;
    return `${s}<circle cx="${hx}" cy="48" r="14" fill="${c}" ${S}/>${eye(hx + 4, 45)}<path d="M${hx - 2},34 L${hx - 6},22 M${hx + 6},34 L${hx + 10},22" ${SN}/><path d="M${hx},54 q4,3 8,0" ${SN}/>`;
  },
  butterfly: (c = '#8b5cf6') => `<ellipse cx="30" cy="36" rx="20" ry="16" fill="${c}" ${S}/><ellipse cx="70" cy="36" rx="20" ry="16" fill="${c}" ${S}/>
      <ellipse cx="34" cy="66" rx="15" ry="13" fill="${lighten(c, 0.3)}" ${S}/><ellipse cx="66" cy="66" rx="15" ry="13" fill="${lighten(c, 0.3)}" ${S}/>
      <circle cx="30" cy="36" r="6" fill="#fff" opacity=".7"/><circle cx="70" cy="36" r="6" fill="#fff" opacity=".7"/>
      <ellipse cx="50" cy="52" rx="5" ry="26" fill="${OL}"/><path d="M48,28 C44,18 40,16 36,14 M52,28 C56,18 60,16 64,14" ${SN}/>`,
  teddy: (c = '#a16207') => `<circle cx="30" cy="22" r="10" fill="${c}" ${S}/><circle cx="70" cy="22" r="10" fill="${c}" ${S}/>
      <ellipse cx="50" cy="72" rx="24" ry="20" fill="${c}" ${S}/><ellipse cx="50" cy="74" rx="13" ry="11" fill="${lighten(c, 0.45)}"/>
      <circle cx="26" cy="66" r="8" fill="${c}" ${S}/><circle cx="74" cy="66" r="8" fill="${c}" ${S}/>
      <circle cx="50" cy="38" r="22" fill="${c}" ${S}/>
      <ellipse cx="50" cy="46" rx="10" ry="8" fill="${lighten(c, 0.45)}" ${S}/>
      ${eye(42, 34)}${eye(58, 34)}<ellipse cx="50" cy="42" rx="4" ry="3" fill="${OL}"/><path d="M46,48 q4,3 8,0" ${SN}/>`,
  sheep: () => `<path d="M30,72 v14 M42,74 v12 M62,74 v12 M72,72 v14" ${SN} stroke-width="4"/>
      <path d="M22,58 C12,56 14,40 26,42 C26,30 42,28 46,36 C52,26 68,30 66,40 C78,38 82,54 72,58 C76,70 62,78 54,72 C48,80 30,78 32,70 C20,72 16,62 22,58 Z" fill="#f8fafc" ${S}/>
      <ellipse cx="78" cy="46" rx="11" ry="13" fill="#334155" ${S}/>${`<circle cx="81" cy="43" r="2.5" fill="#fff"/>`}
      <path d="M70,38 C64,36 64,44 68,44" fill="#334155" ${S}/>`,
  frog: (c = '#22c55e') => `<ellipse cx="50" cy="62" rx="34" ry="24" fill="${c}" ${S}/>
      <circle cx="34" cy="38" r="12" fill="${c}" ${S}/><circle cx="66" cy="38" r="12" fill="${c}" ${S}/>
      <circle cx="34" cy="38" r="6" fill="#fff"/><circle cx="66" cy="38" r="6" fill="#fff"/>${eye(35, 38, 3.5)}${eye(67, 38, 3.5)}
      <path d="M32,64 C42,74 58,74 68,64" ${SN}/><circle cx="28" cy="58" r="3" fill="#fda4af"/><circle cx="72" cy="58" r="3" fill="#fda4af"/>
      <path d="M18,80 C10,86 14,90 24,88 M82,80 C90,86 86,90 76,88" fill="${c}" ${S}/>`,
  elephant: (c = '#94a3b8') => `<path d="M24,70 v16 h10 v-14 M58,70 v16 h10 v-16" fill="${c}" ${S}/>
      <path d="M10,52 C10,30 30,22 50,24 C64,24 72,32 72,46 C72,64 64,74 46,74 C26,74 10,70 10,52 Z" fill="${c}" ${S}/>
      <path d="M12,48 L4,56" ${SN}/>
      <circle cx="74" cy="44" r="16" fill="${c}" ${S}/>
      <path d="M86,50 C92,60 90,74 84,82 C82,86 76,84 78,80 C82,72 82,62 78,58" fill="${c}" ${S}/>
      <path d="M58,34 C48,38 48,58 60,62 C66,54 66,40 58,34 Z" fill="${darken(c, 0.12)}" ${S}/>
      ${eye(78, 40)}`,
  car: (c = '#ef4444') => `<path d="M8,66 L8,52 C8,48 12,46 16,46 L28,46 L38,30 C40,28 42,27 46,27 L66,27 C70,27 72,28 74,31 L84,46 C90,46 94,50 94,56 L94,66 Z" fill="${c}" ${S}/>
      <path d="M40,46 L47,33 L58,33 L58,46 Z M63,46 L63,33 L70,33 L78,46 Z" fill="#bae6fd" ${S}/>
      <circle cx="90" cy="54" r="3" fill="#fde047" ${S}/>
      <circle cx="28" cy="68" r="10" fill="#334155" ${S}/><circle cx="28" cy="68" r="4" fill="#cbd5e1"/>
      <circle cx="74" cy="68" r="10" fill="#334155" ${S}/><circle cx="74" cy="68" r="4" fill="#cbd5e1"/>`,
  truck: (c = '#f59e0b') => `<rect x="6" y="28" width="54" height="40" rx="3" fill="${c}" ${S}/>
      <path d="M60,40 L80,40 L92,54 L92,68 L60,68 Z" fill="${darken(c, 0.1)}" ${S}/>
      <path d="M66,44 L78,44 L86,54 L66,54 Z" fill="#bae6fd" ${S}/>
      <circle cx="24" cy="70" r="10" fill="#334155" ${S}/><circle cx="24" cy="70" r="4" fill="#cbd5e1"/>
      <circle cx="76" cy="70" r="10" fill="#334155" ${S}/><circle cx="76" cy="70" r="4" fill="#cbd5e1"/>`,
  bus: (c = '#facc15') => `<rect x="6" y="24" width="88" height="46" rx="8" fill="${c}" ${S}/>
      <rect x="12" y="32" width="14" height="14" rx="2" fill="#bae6fd" ${S}/><rect x="30" y="32" width="14" height="14" rx="2" fill="#bae6fd" ${S}/><rect x="48" y="32" width="14" height="14" rx="2" fill="#bae6fd" ${S}/>
      <path d="M70,32 h16 l4,14 h-20 Z" fill="#bae6fd" ${S}/>
      <circle cx="90" cy="60" r="3" fill="#fde047" ${S}/>
      <circle cx="26" cy="72" r="9" fill="#334155" ${S}/><circle cx="74" cy="72" r="9" fill="#334155" ${S}/>`,
  train: (c = '#ef4444', o = {}) => {
    const cars = o.cars || 1; const w = 92 / (cars + 1.2);
    let s = '';
    for (let i = 0; i < cars; i++) {
      const x = 4 + i * w;
      s += `<rect x="${x}" y="40" width="${w - 4}" height="26" rx="3" fill="${PALETTE[(i + 1) % PALETTE.length]}" ${S}/><circle cx="${x + w * 0.28}" cy="70" r="6" fill="#334155" ${S}/><circle cx="${x + w * 0.7}" cy="70" r="6" fill="#334155" ${S}/>`;
    }
    const ex = 4 + cars * w;
    const ew = w * 1.2;
    return `${s}<rect x="${ex}" y="34" width="${ew * 0.55}" height="32" fill="${c}" ${S}/><rect x="${ex + ew * 0.5}" y="44" width="${ew * 0.45}" height="22" rx="2" fill="${c}" ${S}/>
      <rect x="${ex + ew * 0.62}" y="32" width="${ew * 0.14}" height="12" fill="#334155" ${S}/>
      <rect x="${ex + ew * 0.1}" y="38" width="${ew * 0.32}" height="12" fill="#bae6fd" ${S}/>
      <circle cx="${ex + ew * 0.25}" cy="70" r="7" fill="#334155" ${S}/><circle cx="${ex + ew * 0.75}" cy="70" r="7" fill="#334155" ${S}/>`;
  },
  airplane: (c = '#3b82f6') => `<path d="M40,52 L22,82 L34,82 L60,54 Z" fill="${darken(c, 0.15)}" ${S}/>
      <path d="M8,48 L4,30 L14,30 L24,44 Z" fill="${darken(c, 0.15)}" ${S}/>
      <path d="M8,44 C30,40 60,38 80,40 C92,41 96,48 92,52 C88,56 70,58 50,58 C30,58 14,56 8,52 Z" fill="${c}" ${S}/>
      <path d="M44,48 L30,22 L40,22 L60,46 Z" fill="${lighten(c, 0.2)}" ${S}/>
      <path d="M82,42 C88,42 90,46 90,48 L80,48 Z" fill="#bae6fd" ${S}/>
      <circle cx="48" cy="48" r="2.5" fill="#bae6fd"/><circle cx="58" cy="48" r="2.5" fill="#bae6fd"/><circle cx="68" cy="48" r="2.5" fill="#bae6fd"/>`,
  rocket: (c = '#ef4444', o = {}) => `${o.noFlame ? '' : `<path d="M42,78 C40,88 46,94 50,98 C54,94 60,88 58,78 Z" fill="#f97316" ${S}/>`}
      <path d="M36,62 L22,78 L36,76 Z M64,62 L78,78 L64,76 Z" fill="${c}" ${S}/>
      <path d="M50,6 C64,20 66,50 62,78 L38,78 C34,50 36,20 50,6 Z" fill="#f1f5f9" ${S}/>
      <path d="M50,6 C56,12 60,18 62,24 L38,24 C40,18 44,12 50,6 Z" fill="${c}" ${S}/>
      <circle cx="50" cy="44" r="8" fill="#7dd3fc" ${S}/>`,
  boat: (c = '#ef4444') => `<path d="M48,14 L48,62" ${SN}/><path d="M50,16 L80,58 L50,58 Z" fill="${c}" ${S}/><path d="M46,24 L24,58 L46,58 Z" fill="${lighten(c, 0.4)}" ${S}/>
      <path d="M10,64 L90,64 L78,82 L22,82 Z" fill="#92400e" ${S}/>`,
  house: (c = '#ef4444') => `<rect x="20" y="46" width="60" height="42" fill="#fde68a" ${S}/>
      <path d="M12,48 L50,14 L88,48 Z" fill="${c}" ${S}/>
      <rect x="42" y="62" width="16" height="26" fill="#92400e" ${S}/>
      <rect x="26" y="54" width="12" height="12" fill="#bae6fd" ${S}/><rect x="62" y="54" width="12" height="12" fill="#bae6fd" ${S}/>`,
  tree: (c = '#22c55e') => `<path d="M44,90 L46,58 L54,58 L56,90 Z" fill="#92400e" ${S}/>
      <path d="M50,10 C66,10 76,22 74,34 C86,38 86,58 72,62 C68,72 56,72 50,66 C44,72 30,72 28,62 C14,58 14,38 26,34 C24,22 34,10 50,10 Z" fill="${c}" ${S}/>
      <circle cx="38" cy="34" r="4" fill="#ef4444"/><circle cx="62" cy="42" r="4" fill="#ef4444"/><circle cx="46" cy="54" r="4" fill="#ef4444"/>`,
  pine: (c = '#15803d') => `<rect x="45" y="76" width="10" height="14" fill="#92400e" ${S}/><path d="M50,8 L72,40 L62,40 L80,62 L66,62 L84,78 L16,78 L34,62 L20,62 L38,40 L28,40 Z" fill="${c}" ${S}/>`,
  flower: (c = '#ec4899', o = {}) => {
    if (o.stale) return `<path d="M44,92 C44,60 52,34 66,34 C76,34 80,44 78,54" ${SN} stroke="#84cc16" stroke-width="4"/>
      <path d="M46,74 C36,72 30,78 30,84 C38,84 44,80 46,74 Z" fill="#a3a3a3" ${S}/>
      <ellipse cx="70" cy="68" rx="6" ry="11" fill="#a16207" ${S} transform="rotate(20 70 68)"/><ellipse cx="86" cy="68" rx="6" ry="11" fill="#a16207" ${S} transform="rotate(-20 86 68)"/><ellipse cx="78" cy="72" rx="6" ry="12" fill="#92400e" ${S}/>
      <circle cx="78" cy="58" r="7" fill="#78350f" ${S}/><circle cx="62" cy="88" r="2.5" fill="#a16207"/><circle cx="88" cy="90" r="2" fill="#a16207"/>`;
    if (o.bud) return `<path d="M50,92 L50,46" ${SN} stroke="#16a34a" stroke-width="4"/><path d="M50,72 C38,64 30,68 28,76 C38,78 46,76 50,72 Z" fill="#22c55e" ${S}/>
      <path d="M50,16 C62,24 64,40 50,50 C36,40 38,24 50,16 Z" fill="${c}" ${S}/><path d="M40,40 C44,50 56,50 60,40 L60,46 C56,54 44,54 40,46 Z" fill="#22c55e" ${S}/>`;
    let p = '';
    for (let i = 0; i < 6; i++) { const a = i * 60; p += `<ellipse cx="50" cy="20" rx="9" ry="13" fill="${c}" ${S} transform="rotate(${a} 50 34)"/>`; }
    return `<path d="M50,92 L50,46" ${SN} stroke="#16a34a" stroke-width="4"/><path d="M50,74 C38,64 30,68 28,76 C38,78 46,76 50,74 Z" fill="#22c55e" ${S}/><path d="M50,68 C62,58 70,62 72,70 C62,72 54,70 50,68 Z" fill="#22c55e" ${S}/>${p}<circle cx="50" cy="34" r="9" fill="#facc15" ${S}/>`;
  },
  balloon: (c = '#ef4444') => `<path d="M50,72 C46,80 54,84 50,94" ${SN} stroke-width="1.8"/><path d="M46,72 L54,72 L50,66 Z" fill="${c}" ${S}/>
      <ellipse cx="50" cy="38" rx="24" ry="30" fill="${c}" ${S}/><ellipse cx="40" cy="26" rx="5" ry="9" fill="#fff" opacity=".5"/>`,
  kite: (c = '#ef4444') => `<path d="M50,10 L74,38 L50,76 L26,38 Z" fill="${c}" ${S}/><path d="M50,10 L50,76 M26,38 L74,38" ${SN} stroke-width="1.8"/>
      <path d="M50,76 C44,82 56,86 50,92" ${SN} stroke-width="1.8"/><path d="M46,82 L54,86 L54,80 Z M44,90 L52,94 L52,88 Z" fill="#facc15" ${S} stroke-width="1.5"/>`,
  sun: () => {
    let r = '';
    for (let i = 0; i < 10; i++) { const a = i * 36 * Math.PI / 180; r += `<line x1="${50 + 28 * Math.cos(a)}" y1="${50 + 28 * Math.sin(a)}" x2="${50 + 42 * Math.cos(a)}" y2="${50 + 42 * Math.sin(a)}" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>`; }
    return `${r}<circle cx="50" cy="50" r="22" fill="#facc15" ${S}/>`;
  },
  moon: () => `<path d="M62,12 C38,14 22,34 24,56 C26,78 46,92 68,88 C50,82 40,66 42,48 C44,32 52,20 62,12 Z" fill="#fde68a" ${S}/>`,
  cloud: (c = '#ffffff') => `<path d="M26,70 C12,70 10,50 24,48 C24,32 44,28 50,40 C56,26 80,30 78,46 C92,46 94,70 78,70 Z" fill="${c}" ${S}/>`,
  umbrella: (c = '#8b5cf6', o = {}) => o.closed
    ? `<path d="M50,8 L50,14" ${SN}/><path d="M50,14 C56,30 58,56 54,70 L46,70 C42,56 44,30 50,14 Z" fill="${c}" ${S}/><path d="M50,18 L50,70" ${SN} stroke-width="1.5"/><path d="M50,70 L50,86 C50,94 40,94 40,86" ${SN} stroke-width="3.5"/><rect x="45" y="44" width="10" height="5" rx="1" fill="${darken(c, 0.25)}"/>`
    : `<path d="M50,42 L50,82 C50,92 38,92 38,82" ${SN} stroke-width="3.5"/>
      <path d="M8,46 C10,22 30,12 50,12 C70,12 90,22 92,46 C86,40 78,40 71,46 C64,40 56,40 50,46 C44,40 36,40 29,46 C22,40 14,40 8,46 Z" fill="${c}" ${S}/>
      <path d="M50,12 C40,22 30,34 29,46 M50,12 C60,22 70,34 71,46 M50,12 L50,46" ${SN} stroke-width="1.6"/>`,
  cup: (c = '#3b82f6') => `<path d="M68,40 C84,40 84,66 66,64" fill="none" stroke="${OL}" stroke-width="9"/><path d="M68,40 C84,40 84,66 66,64" fill="none" stroke="${c}" stroke-width="4"/>
      <path d="M22,30 L72,30 L66,82 C66,86 62,88 58,88 L36,88 C32,88 28,86 28,82 Z" fill="${c}" ${S}/><ellipse cx="47" cy="30" rx="25" ry="5" fill="${lighten(c, 0.4)}" ${S}/>`,
  book: (c = '#3b82f6', o = {}) => {
    if (o.open) return `<path d="M50,30 C40,22 22,22 8,26 L8,80 C22,76 40,76 50,84 Z" fill="#fff" ${S}/><path d="M50,30 C60,22 78,22 92,26 L92,80 C78,76 60,76 50,84 Z" fill="#fff" ${S}/>
      <path d="M16,38 L42,38 M16,48 L42,48 M16,58 L42,58 M16,68 L36,68 M58,38 L84,38 M58,48 L84,48 M58,58 L84,58 M58,68 L78,68" ${SN} stroke-width="1.5" stroke="#94a3b8"/>
      <path d="M6,26 L6,84 C22,80 40,80 50,88 C60,80 78,80 94,84 L94,26" fill="none" stroke="${c}" stroke-width="4"/>`;
    const th = o.th || 14;
    return `<rect x="22" y="${50 - 34}" width="58" height="68" rx="3" fill="${c}" ${S}/><rect x="22" y="16" width="${Math.max(6, th * 0.5)}" height="68" fill="${darken(c, 0.25)}" ${S}/>
      <rect x="40" y="30" width="30" height="12" rx="2" fill="#fff" opacity=".8"/>`;
  },
  pencil: (c = '#f59e0b', o = {}) => {
    // yatay kalem: uzunluk L (0-1), kalınlık th, sivri/küt
    const L = (o.len ?? 1) * 78; const th = o.th || 14;
    const x0 = 50 - L / 2; const x1 = 50 + L / 2; const y0 = 50 - th / 2; const y1 = 50 + th / 2;
    const tip = o.blunt
      ? `<path d="M${x1 - 10},${y0} L${x1 - 2},${y0 + th * 0.2} L${x1 - 2},${y1 - th * 0.2} L${x1 - 10},${y1} Z" fill="#fde68a" ${S}/><rect x="${x1 - 3}" y="${y0 + th * 0.25}" width="4" height="${th * 0.5}" rx="1" fill="${OL}"/>`
      : `<path d="M${x1 - 10},${y0} L${x1 + 12},50 L${x1 - 10},${y1} Z" fill="#fde68a" ${S}/><path d="M${x1 + 4},${50 - th * 0.18} L${x1 + 12},50 L${x1 + 4},${50 + th * 0.18} Z" fill="${OL}"/>`;
    return `<rect x="${x0}" y="${y0}" width="${L - 10}" height="${th}" fill="${c}" ${S}/><path d="M${x0 + 6},50 L${x1 - 12},50" stroke="${darken(c, 0.2)}" stroke-width="1.5"/>${tip}
      <rect x="${x0 - 8}" y="${y0}" width="10" height="${th}" rx="2" fill="#f9a8d4" ${S}/><rect x="${x0}" y="${y0}" width="5" height="${th}" fill="#cbd5e1" ${S}/>`;
  },
  crayon: (c = '#ef4444', o = {}) => {
    const L = (o.len ?? 1) * 70; const th = o.th || 16; const x0 = 50 - L / 2 - 6; const x1 = 50 + L / 2 - 6;
    const tip = o.blunt ? `<rect x="${x1}" y="${50 - th * 0.35}" width="8" height="${th * 0.7}" rx="2" fill="${c}" ${S}/>` : `<path d="M${x1},${50 - th * 0.35} L${x1 + 16},50 L${x1},${50 + th * 0.35} Z" fill="${c}" ${S}/>`;
    return `<rect x="${x0}" y="${50 - th / 2}" width="${L}" height="${th}" rx="3" fill="${c}" ${S}/><rect x="${x0 + L * 0.25}" y="${50 - th / 2}" width="${L * 0.45}" height="${th}" fill="#fff" opacity=".55"/>${tip}`;
  },
  carrot: (c = '#f97316', o = {}) => `<path d="M40,26 C30,14 32,8 38,10 C42,14 44,20 46,24 M50,24 C50,10 56,6 60,10 C58,16 54,22 52,26 M56,28 C64,16 72,18 70,24 C66,28 60,30 56,30" fill="${o.stale ? '#a3a3a3' : '#22c55e'}" ${S}/>
      ${o.blunt ? `<path d="M34,28 C44,22 60,24 66,32 L56,74 C54,80 46,80 44,74 Z" fill="${o.stale ? '#c2855a' : c}" ${S}/><ellipse cx="50" cy="76" rx="6" ry="3" fill="#fed7aa" ${S}/>` : `<path d="M34,28 C44,22 60,24 66,32 L52,92 C51,95 49,95 48,92 Z" fill="${o.stale ? '#c2855a' : c}" ${S}/>`}
      <path d="M40,42 L48,42 M52,56 L60,56 M44,68 L52,68" ${SN} stroke-width="1.8"/>`,
  key: (c = '#facc15') => `<circle cx="26" cy="50" r="16" fill="${c}" ${S}/><circle cx="26" cy="50" r="6" fill="#fff" ${S}/>
      <path d="M42,46 L88,46 L88,54 L80,54 L80,64 L72,64 L72,54 L66,54 L66,62 L58,62 L58,54 L42,54 Z" fill="${c}" ${S}/>`,
  leaf: (c = '#22c55e') => `<path d="M20,80 C20,40 40,16 84,16 C84,60 60,80 20,80 Z" fill="${c}" ${S}/><path d="M20,80 C40,60 56,42 76,24 M40,62 L38,46 M52,50 L50,36 M46,56 L60,56 M58,44 L70,44" ${SN} stroke-width="1.8"/>`,
  feather: (c = '#60a5fa') => `<path d="M22,84 C30,50 52,22 82,12 C80,40 62,70 30,80 Z" fill="${c}" ${S}/><path d="M16,92 C30,64 52,38 80,14" ${SN}/>
      <path d="M38,64 L30,58 M48,52 L40,44 M58,40 L52,32 M44,62 L56,64 M54,50 L66,52 M62,38 L74,38" ${SN} stroke-width="1.5"/>`,
  mushroom: (c = '#ef4444') => `<path d="M40,52 L38,86 C38,90 62,90 62,86 L60,52 Z" fill="#fef3c7" ${S}/>
      <path d="M10,56 C10,28 30,14 50,14 C70,14 90,28 90,56 Z" fill="${c}" ${S}/>
      <circle cx="32" cy="38" r="6" fill="#fff"/><circle cx="56" cy="28" r="5" fill="#fff"/><circle cx="70" cy="44" r="6" fill="#fff"/><circle cx="46" cy="48" r="4" fill="#fff"/>`,
  cake: (c = '#f9a8d4') => `<rect x="47" y="10" width="6" height="16" fill="#60a5fa" ${S}/><path d="M50,2 C46,6 47,10 50,10 C53,10 54,6 50,2 Z" fill="#f97316"/>
      <rect x="22" y="26" width="56" height="22" rx="3" fill="${c}" ${S}/><rect x="14" y="48" width="72" height="30" rx="3" fill="#fde68a" ${S}/>
      <path d="M22,32 C28,40 34,32 40,40 C46,32 52,40 58,32 C64,40 70,32 78,38" ${SN} stroke="#fff" stroke-width="3"/>
      <path d="M14,58 C22,66 30,58 38,66 C46,58 54,66 62,58 C70,66 78,58 86,64" fill="none" stroke="${c}" stroke-width="4"/>
      <rect x="8" y="78" width="84" height="8" rx="3" fill="#e2e8f0" ${S}/>`,
  icecream: (c = '#f9a8d4') => `<path d="M30,50 L50,94 L70,50 Z" fill="#fbbf24" ${S}/><path d="M36,58 L60,74 M42,52 L66,64 M64,58 L44,80 M56,52 L38,66" ${SN} stroke-width="1.5"/>
      <circle cx="50" cy="38" r="20" fill="${c}" ${S}/><path d="M28,50 C32,44 40,52 44,46 C48,52 56,44 60,50 C64,44 70,50 72,48" fill="${c}" ${S}/>
      <circle cx="50" cy="16" r="5" fill="#ef4444" ${S}/>`,
  lollipop: (c = '#ec4899') => `<rect x="47" y="56" width="6" height="38" rx="2" fill="#f8fafc" ${S}/><circle cx="50" cy="36" r="26" fill="${c}" ${S}/>
      <path d="M50,36 m0,-5 a5,5 0 1,1 -5,5 a10,10 0 1,1 10,10 a15,15 0 1,1 -15,-15 a20,20 0 1,1 20,20" fill="none" stroke="#fff" stroke-width="3.5"/>`,
  candy: (c = '#ef4444') => `<path d="M30,50 L10,34 L10,66 Z M70,50 L90,34 L90,66 Z" fill="${lighten(c, 0.25)}" ${S}/><ellipse cx="50" cy="50" rx="22" ry="16" fill="${c}" ${S}/><path d="M40,38 L48,62 M52,36 L60,60" stroke="#fff" stroke-width="3"/>`,
  donut: (c = '#f9a8d4') => `<circle cx="50" cy="52" r="36" fill="#d97706" ${S}/><path d="M16,50 C18,26 36,16 50,16 C70,16 84,30 84,48 C80,56 74,50 70,58 C64,66 58,58 52,64 C44,68 40,58 32,62 C24,66 18,58 16,50 Z" fill="${c}" ${S}/>
      <circle cx="50" cy="50" r="11" fill="#fff" ${S}/><path d="M32,32 l4,3 M60,26 l4,-2 M70,40 l3,4 M38,48 l-3,4 M58,62 l4,2 M28,44 l2,-4" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/><path d="M46,26 l3,3 M68,52 l-4,2" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>`,
  cookie: () => `<circle cx="50" cy="50" r="36" fill="#d4a373" ${S}/><circle cx="36" cy="38" r="4" fill="#5b3a1e"/><circle cx="60" cy="34" r="4" fill="#5b3a1e"/><circle cx="62" cy="60" r="4" fill="#5b3a1e"/><circle cx="40" cy="62" r="4" fill="#5b3a1e"/><circle cx="50" cy="50" r="3" fill="#5b3a1e"/>`,
  chocolate: () => `<rect x="20" y="16" width="60" height="70" rx="4" fill="#7c3f17" ${S}/><path d="M40,16 V86 M60,16 V86 M20,40 H80 M20,62 H80" ${SN} stroke="#4a2209" stroke-width="2"/><path d="M20,60 L80,52 L80,86 L20,86 Z" fill="#ef4444" ${S}/><rect x="34" y="66" width="32" height="10" rx="2" fill="#fff" opacity=".8"/>`,
  honey: () => `<rect x="24" y="30" width="52" height="58" rx="10" fill="#f59e0b" ${S}/><rect x="28" y="18" width="44" height="14" rx="3" fill="#a16207" ${S}/><path d="M24,42 C32,52 38,40 44,50 C50,58 56,44 62,52 C68,58 72,46 76,48" fill="none" stroke="#fde68a" stroke-width="4"/><rect x="36" y="58" width="28" height="16" rx="3" fill="#fff7ed" ${S} stroke-width="1.6"/>`,
  lemon: (c = '#facc15') => `<path d="M10,52 C14,44 18,42 22,40 C34,22 66,22 78,40 C82,42 86,44 90,52 C86,58 82,60 78,62 C66,80 34,80 22,62 C18,60 14,58 10,52 Z" fill="${c}" ${S}/><ellipse cx="38" cy="42" rx="8" ry="4" fill="#fff" opacity=".5"/><path d="M56,30 C62,18 72,16 78,18 C74,26 66,30 56,30 Z" fill="#22c55e" ${S}/>`,
  plum: () => `<circle cx="50" cy="56" r="30" fill="#84cc16" ${S}/><path d="M50,28 C46,40 46,70 50,86" ${SN} stroke-width="1.6" stroke="#4d7c0f"/><path d="M50,28 L54,14" ${SN}/><path d="M54,18 C62,10 72,12 74,16 C66,22 60,22 54,18 Z" fill="#16a34a" ${S}/><ellipse cx="38" cy="46" rx="5" ry="8" fill="#fff" opacity=".45"/>`,
  pickleJar: () => `<rect x="26" y="14" width="48" height="12" rx="3" fill="#ef4444" ${S}/><path d="M24,26 L76,26 L80,40 L80,82 C80,88 76,90 70,90 L30,90 C24,90 20,88 20,82 L20,40 Z" fill="#dcfce7" ${S}/>
      <rect x="28" y="38" width="12" height="44" rx="6" fill="#4d7c0f" ${S}/><rect x="44" y="34" width="12" height="48" rx="6" fill="#65a30d" ${S}/><rect x="60" y="40" width="12" height="42" rx="6" fill="#4d7c0f" ${S}/>
      <circle cx="34" cy="50" r="1.5" fill="#d9f99d"/><circle cx="50" cy="56" r="1.5" fill="#d9f99d"/><circle cx="66" cy="62" r="1.5" fill="#d9f99d"/>`,
  chili: (c = '#ef4444') => `<path d="M30,26 C40,22 48,24 52,30 C64,48 74,70 90,86 C66,86 40,70 30,50 C26,42 26,32 30,26 Z" fill="${c}" ${S}/><path d="M30,26 C26,18 30,12 38,10 M30,26 C36,30 46,30 52,30" fill="#16a34a" ${S}/><path d="M38,38 C44,52 54,64 66,72" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>`,
  hotSauce: () => `<rect x="42" y="8" width="16" height="12" rx="2" fill="#16a34a" ${S}/><path d="M44,20 L56,20 L56,30 C70,36 72,44 72,54 L72,86 C72,90 68,92 64,92 L36,92 C32,92 28,90 28,86 L28,54 C28,44 30,36 44,30 Z" fill="#dc2626" ${S}/>
      <rect x="34" y="52" width="32" height="24" rx="3" fill="#fff" ${S} stroke-width="1.6"/><path d="M44,70 C40,62 44,58 50,56 C48,62 56,62 54,70 Z" fill="#f97316"/>`,
  salt: () => `<path d="M34,26 C34,14 66,14 66,26 Z" fill="#cbd5e1" ${S}/><circle cx="44" cy="20" r="1.6" fill="${OL}"/><circle cx="50" cy="18" r="1.6" fill="${OL}"/><circle cx="56" cy="20" r="1.6" fill="${OL}"/>
      <path d="M32,26 L68,26 L74,86 C74,90 70,92 66,92 L34,92 C30,92 26,90 26,86 Z" fill="#f8fafc" ${S}/><rect x="36" y="48" width="28" height="22" rx="3" fill="#3b82f6" ${S} stroke-width="1.6"/>
      <circle cx="80" cy="30" r="1.8" fill="#94a3b8"/><circle cx="84" cy="40" r="1.5" fill="#94a3b8"/><circle cx="78" cy="46" r="1.5" fill="#94a3b8"/>`,
  pretzel: () => `<path d="M26,74 C6,56 16,22 40,32 C52,38 54,56 62,70 M74,74 C94,56 84,22 60,32 C48,38 46,56 38,70 M26,74 C34,80 66,80 74,74" fill="none" stroke="${OL}" stroke-width="15" stroke-linecap="round"/>
      <path d="M26,74 C6,56 16,22 40,32 C52,38 54,56 62,70 M74,74 C94,56 84,22 60,32 C48,38 46,56 38,70 M26,74 C34,80 66,80 74,74" fill="none" stroke="#b45309" stroke-width="10" stroke-linecap="round"/>
      <circle cx="24" cy="44" r="1.8" fill="#fff"/><circle cx="40" cy="34" r="1.8" fill="#fff"/><circle cx="76" cy="44" r="1.8" fill="#fff"/><circle cx="62" cy="34" r="1.8" fill="#fff"/><circle cx="50" cy="78" r="1.8" fill="#fff"/><circle cx="34" cy="68" r="1.8" fill="#fff"/>`,
  chips: () => `<path d="M20,14 L80,14 L76,24 C82,44 82,64 76,84 L80,92 L20,92 L24,84 C18,64 18,44 24,24 Z" fill="#f59e0b" ${S}/><path d="M20,14 l6,6 l6,-6 l6,6 l6,-6 l6,6 l6,-6 l6,6 l6,-6 l6,6 l6,-6" ${SN} stroke-width="1.5"/>
      <ellipse cx="50" cy="52" rx="18" ry="14" fill="#fde047" ${S}/><circle cx="44" cy="50" r="1.5" fill="#d97706"/><circle cx="54" cy="56" r="1.5" fill="#d97706"/><circle cx="52" cy="46" r="1.5" fill="#d97706"/>`,
  cheese: (c = '#facc15', o = {}) => `<path d="M10,70 L90,70 L90,44 L10,62 Z" fill="${darken(c, 0.08)}" ${S}/><path d="M10,62 L90,44 L72,26 Z" fill="${c}" ${S}/>
      <circle cx="30" cy="66" r="3" fill="${darken(c, 0.2)}"/><ellipse cx="60" cy="58" rx="5" ry="4" fill="${darken(c, 0.2)}"/><circle cx="80" cy="62" r="3" fill="${darken(c, 0.2)}"/><ellipse cx="66" cy="38" rx="4" ry="2.5" fill="${darken(c, 0.2)}"/>
      ${o.stale ? `<circle cx="44" cy="62" r="6" fill="#4d7c0f" opacity=".85"/><circle cx="74" cy="52" r="5" fill="#4d7c0f" opacity=".85"/><circle cx="58" cy="40" r="4" fill="#4d7c0f" opacity=".85"/><circle cx="22" cy="66" r="3" fill="#4d7c0f" opacity=".85"/>` : ''}`,
  bread: (c = '#d97706', o = {}) => {
    const col = o.stale ? '#a8a29e' : c;
    return `<path d="M10,62 C10,36 30,28 50,28 C70,28 90,36 90,62 C90,74 84,78 76,78 L24,78 C16,78 10,74 10,62 Z" fill="${col}" ${S}/><path d="M30,40 L40,56 M48,36 L58,54 M66,40 L74,56" ${SN} stroke="${o.stale ? '#57534e' : '#fde68a'}" stroke-width="3"/>
    ${o.stale ? `<circle cx="28" cy="62" r="6" fill="#4d7c0f" opacity=".8"/><circle cx="62" cy="66" r="5" fill="#4d7c0f" opacity=".8"/><circle cx="76" cy="52" r="4" fill="#4d7c0f" opacity=".8"/><path d="M44,62 L50,70 L46,76" ${SN} stroke-width="1.8"/>` : ''}`;
  },
  banana: (c = '#facc15', o = {}) => `<path d="M16,30 C14,60 40,84 78,74 C86,72 90,66 86,62 C60,70 34,58 26,28 C24,22 18,22 16,30 Z" fill="${o.stale ? '#a16207' : c}" ${S}/>
      <path d="M16,30 L14,20 L22,22 Z" fill="#65a30d" ${S}/>${o.stale ? `<circle cx="30" cy="54" r="4" fill="#422006"/><circle cx="48" cy="66" r="5" fill="#422006"/><circle cx="66" cy="70" r="3.5" fill="#422006"/><circle cx="24" cy="40" r="3" fill="#422006"/>` : `<path d="M28,40 C34,56 48,66 66,68" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>`}`,
  strawberry: (c = '#ef4444', o = {}) => {
    const col = o.stale ? '#9f1239' : c; let seeds = '';
    [[38, 40], [50, 36], [62, 40], [34, 54], [46, 50], [58, 52], [68, 54], [42, 64], [54, 66], [48, 78]].forEach(([x, y]) => { seeds += `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.6" fill="#fde047"/>`; });
    return `<path d="M50,90 C30,80 16,56 20,38 C24,26 40,26 50,30 C60,26 76,26 80,38 C84,56 70,80 50,90 Z" fill="${col}" ${S}/>${seeds}
      <path d="M30,30 L40,20 L46,28 L50,16 L54,28 L60,20 L70,30 C60,36 40,36 30,30 Z" fill="${o.stale ? '#a3a3a3' : '#22c55e'}" ${S}/>
      ${o.stale ? `<circle cx="36" cy="60" r="7" fill="#e7e5e4" opacity=".9"/><circle cx="62" cy="70" r="5" fill="#e7e5e4" opacity=".9"/>` : ''}`;
  },
  pineapple: () => `<path d="M50,30 L40,6 L48,16 L50,4 L52,16 L60,6 Z M50,30 L30,14 L44,26 M50,30 L70,14 L56,26" fill="#16a34a" ${S}/>
      <ellipse cx="50" cy="62" rx="26" ry="32" fill="#f59e0b" ${S}/>
      <path d="M30,42 L70,82 M26,58 L56,92 M38,32 L74,68 M70,42 L30,82 M74,58 L44,92 M62,32 L26,68" ${SN} stroke="#92400e" stroke-width="1.8"/>`,
  orange: (c = '#f97316') => `<circle cx="50" cy="54" r="34" fill="${c}" ${S}/><path d="M50,20 L52,12" ${SN}/><path d="M52,14 C60,6 72,8 74,12 C66,18 58,18 52,14 Z" fill="#22c55e" ${S}/>
      <circle cx="38" cy="44" r="1.5" fill="${darken(c, 0.2)}"/><circle cx="60" cy="40" r="1.5" fill="${darken(c, 0.2)}"/><circle cx="64" cy="64" r="1.5" fill="${darken(c, 0.2)}"/><circle cx="42" cy="68" r="1.5" fill="${darken(c, 0.2)}"/><ellipse cx="36" cy="40" rx="5" ry="8" fill="#fff" opacity=".35"/>`,
  watermelon: () => `<path d="M8,40 C8,70 30,88 50,88 C70,88 92,70 92,40 Z" fill="#16a34a" ${S}/><path d="M14,40 C14,66 32,82 50,82 C68,82 86,66 86,40 Z" fill="#f1f5f9"/><path d="M18,40 C18,62 34,78 50,78 C66,78 82,62 82,40 Z" fill="#ef4444"/>
      <path d="M8,40 L92,40" ${SN}/><ellipse cx="34" cy="52" rx="2" ry="3.5" fill="${OL}"/><ellipse cx="50" cy="60" rx="2" ry="3.5" fill="${OL}"/><ellipse cx="66" cy="52" rx="2" ry="3.5" fill="${OL}"/><ellipse cx="42" cy="68" rx="2" ry="3.5" fill="${OL}"/><ellipse cx="58" cy="68" rx="2" ry="3.5" fill="${OL}"/>`,
  egg: () => `<path d="M50,12 C70,12 82,44 82,62 C82,80 68,90 50,90 C32,90 18,80 18,62 C18,44 30,12 50,12 Z" fill="#fef3c7" ${S}/><ellipse cx="38" cy="40" rx="5" ry="9" fill="#fff"/>`,
  fire: () => `<path d="M18,84 L82,74 M18,74 L82,84" stroke="#78350f" stroke-width="9" stroke-linecap="round"/>
      <path d="M50,8 C56,24 74,32 72,56 C72,72 62,80 50,80 C38,80 28,72 28,56 C28,44 36,40 38,30 C44,38 44,44 46,46 C48,34 46,20 50,8 Z" fill="#f97316" ${S}/>
      <path d="M50,40 C54,50 62,54 60,66 C60,74 56,78 50,78 C44,78 40,74 40,66 C40,58 46,54 50,40 Z" fill="#facc15"/>`,
  snowman: () => `<circle cx="50" cy="70" r="22" fill="#fff" ${S}/><circle cx="50" cy="36" r="16" fill="#fff" ${S}/>
      <rect x="38" y="10" width="24" height="14" fill="${OL}"/><rect x="32" y="22" width="36" height="4" fill="${OL}"/>
      <circle cx="44" cy="33" r="2" fill="${OL}"/><circle cx="56" cy="33" r="2" fill="${OL}"/><path d="M50,38 L64,41 L50,42 Z" fill="#f97316"/>
      <path d="M36,50 C44,54 56,54 64,50 L66,56 C56,60 44,60 34,56 Z" fill="#ef4444" ${S} stroke-width="1.8"/><circle cx="50" cy="64" r="2.2" fill="${OL}"/><circle cx="50" cy="74" r="2.2" fill="${OL}"/>
      <path d="M28,64 L14,54 M72,64 L86,54" ${SN} stroke="#78350f" stroke-width="3"/>`,
  snowflake: () => {
    let s = '';
    for (let i = 0; i < 6; i++) { const a = i * 60; s += `<g transform="rotate(${a} 50 50)"><line x1="50" y1="50" x2="50" y2="12" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/><path d="M50,24 L40,16 M50,24 L60,16 M50,36 L42,30 M50,36 L58,30" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/></g>`; }
    return `${s}<circle cx="50" cy="50" r="6" fill="#e0f2fe" stroke="#38bdf8" stroke-width="3"/>`;
  },
  icecube: () => `<path d="M24,36 L54,24 L80,36 L80,70 L50,84 L24,70 Z" fill="#bae6fd" ${S}/><path d="M24,36 L50,48 L80,36 M50,48 L50,84" ${SN}/><path d="M30,44 L30,60 M58,58 L72,52" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M36,34 L54,28" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  hotTea: (c = '#ef4444') => `<path d="M34,32 C28,24 40,20 34,10 M50,32 C44,24 56,20 50,10 M66,32 C60,24 72,20 66,10" ${SN} stroke="#94a3b8" stroke-width="3"/>
      <path d="M70,46 C86,46 86,70 68,68" fill="none" stroke="${OL}" stroke-width="8"/><path d="M70,46 C86,46 86,70 68,68" fill="none" stroke="${c}" stroke-width="3.5"/>
      <path d="M20,40 L76,40 L70,78 C68,84 62,86 56,86 L40,86 C34,86 28,84 26,78 Z" fill="${c}" ${S}/><ellipse cx="48" cy="40" rx="28" ry="5" fill="#92400e" ${S}/>
      <ellipse cx="48" cy="88" rx="34" ry="5" fill="#e2e8f0" ${S}/>`,
  soup: () => `<path d="M34,30 C28,22 40,18 34,8 M50,30 C44,22 56,18 50,8 M66,30 C60,22 72,18 66,8" ${SN} stroke="#94a3b8" stroke-width="3"/>
      <path d="M10,46 L90,46 C90,70 72,86 50,86 C28,86 10,70 10,46 Z" fill="#3b82f6" ${S}/><ellipse cx="50" cy="46" rx="40" ry="8" fill="#f97316" ${S}/><circle cx="40" cy="45" r="3" fill="#22c55e"/><circle cx="58" cy="46" r="3" fill="#fde047"/>`,
  rock: (c = '#94a3b8') => `<path d="M10,78 C8,60 18,40 34,32 C46,22 66,24 76,36 C88,48 92,66 88,78 Z" fill="${c}" ${S}/><path d="M36,46 L44,56 L40,66 M64,40 L60,52 L70,60" ${SN} stroke-width="2"/><ellipse cx="34" cy="42" rx="6" ry="3" fill="#fff" opacity=".35"/>`,
  brick: () => `<path d="M12,40 L30,28 L90,28 L72,40 Z" fill="#f87171" ${S}/><path d="M72,40 L90,28 L90,62 L72,74 Z" fill="#991b1b" ${S}/><rect x="12" y="40" width="60" height="34" fill="#dc2626" ${S}/>
      <circle cx="28" cy="34" r="3" fill="#7f1d1d"/><circle cx="46" cy="34" r="3" fill="#7f1d1d"/><circle cx="64" cy="34" r="3" fill="#7f1d1d"/>`,
  hammer: () => `<rect x="44" y="34" width="12" height="58" rx="3" fill="#b45309" ${S}/><path d="M18,18 L74,18 C82,18 86,24 86,30 L86,38 L18,38 C14,38 12,34 12,30 L12,26 C12,22 14,18 18,18 Z" fill="#64748b" ${S}/>`,
  dumbbell: () => `<rect x="20" y="46" width="60" height="8" fill="#64748b" ${S}/><rect x="10" y="26" width="16" height="48" rx="4" fill="#334155" ${S}/><rect x="74" y="26" width="16" height="48" rx="4" fill="#334155" ${S}/><rect x="4" y="34" width="8" height="32" rx="3" fill="#475569" ${S}/><rect x="88" y="34" width="8" height="32" rx="3" fill="#475569" ${S}/>`,
  pillow: (c = '#a5b4fc') => `<path d="M12,22 C30,30 70,30 88,22 C80,40 80,60 88,78 C70,70 30,70 12,78 C20,60 20,40 12,22 Z" fill="${c}" ${S}/><path d="M40,46 C46,52 54,52 60,46" ${SN} stroke-width="1.6" opacity=".6"/>`,
  sponge: () => `<rect x="14" y="30" width="72" height="42" rx="10" fill="#fde047" ${S}/><rect x="14" y="30" width="72" height="12" rx="6" fill="#22c55e" ${S}/><circle cx="30" cy="56" r="4" fill="#eab308"/><circle cx="50" cy="52" r="3" fill="#eab308"/><circle cx="68" cy="60" r="4.5" fill="#eab308"/><circle cx="42" cy="64" r="2.5" fill="#eab308"/>`,
  cotton: () => `<path d="M24,70 C10,68 12,48 26,48 C24,34 42,30 48,40 C54,28 74,30 74,44 C88,44 92,66 76,70 C72,80 56,80 50,74 C44,82 26,80 24,70 Z" fill="#fff" ${S}/><path d="M36,58 C40,54 46,56 48,60 M58,52 C62,48 68,50 68,56" ${SN} stroke-width="1.5" stroke="#cbd5e1"/>`,
  yarn: (c = '#ec4899') => `<path d="M76,70 C86,76 90,84 80,92 C72,96 64,90 70,84" ${SN} stroke="${c}" stroke-width="3.5"/><circle cx="48" cy="50" r="32" fill="${c}" ${S}/>
      <path d="M22,34 C40,40 56,56 62,80 M30,24 C50,34 66,52 74,72 M18,52 C32,54 44,66 46,82 M50,18 C62,24 74,36 80,48" ${SN} stroke="${darken(c, 0.3)}" stroke-width="1.8"/>`,
  soap: (c = '#f9a8d4') => `<rect x="16" y="40" width="64" height="38" rx="16" fill="${c}" ${S}/><ellipse cx="40" cy="50" rx="14" ry="4" fill="#fff" opacity=".6"/>
      <circle cx="74" cy="28" r="9" fill="#e0f2fe" ${S} stroke-width="1.8"/><circle cx="58" cy="22" r="6" fill="#e0f2fe" ${S} stroke-width="1.8"/><circle cx="86" cy="44" r="5" fill="#e0f2fe" ${S} stroke-width="1.8"/>`,
  bananaPeel: () => `<path d="M50,58 C40,46 20,48 12,62 C24,58 34,60 42,70 Z M50,58 C60,46 80,48 88,62 C76,58 66,60 58,70 Z M50,58 C46,44 48,30 56,24 C58,36 58,48 56,62 Z" fill="#facc15" ${S}/>
      <path d="M40,64 L60,64 L56,84 C54,90 46,90 44,84 Z" fill="#fde68a" ${S}/><ellipse cx="50" cy="92" rx="32" ry="3" fill="#cbd5e1"/>`,
  slide: (c = '#ef4444') => `<path d="M20,90 L20,24 M34,90 L34,24 M20,38 L34,38 M20,52 L34,52 M20,66 L34,66 M20,80 L34,80" ${SN} stroke-width="3"/>
      <path d="M34,24 C54,24 60,40 70,64 C74,76 80,82 92,84 L92,90 C76,90 68,82 64,70 C56,46 50,32 34,32 Z" fill="${c}" ${S}/><rect x="16" y="20" width="22" height="6" rx="2" fill="#3b82f6" ${S}/>`,
  log: () => `<path d="M24,30 L80,30 C90,30 90,74 80,74 L24,74" fill="#a16207" ${S}/><path d="M34,38 L60,40 M30,50 L70,52 M36,62 L74,64 M44,34 l6,8 M62,58 l8,8" ${SN} stroke="#713f12" stroke-width="2"/>
      <ellipse cx="24" cy="52" rx="12" ry="22" fill="#fde68a" ${S}/><ellipse cx="24" cy="52" rx="7" ry="13" ${SN} stroke="#a16207" stroke-width="1.8"/><ellipse cx="24" cy="52" rx="2.5" ry="5" ${SN} stroke="#a16207" stroke-width="1.8"/>`,
  cactus: () => `<path d="M42,90 L42,24 C42,12 58,12 58,24 L58,90 Z M42,60 L28,60 C22,60 20,56 20,50 L20,38 C20,32 28,32 28,38 L28,50 L42,50 M58,52 L70,52 L70,34 C70,28 78,28 78,34 L78,56 C78,60 76,62 70,62 L58,62" fill="#22c55e" ${S}/>
      <rect x="32" y="86" width="36" height="8" rx="2" fill="#c2410c" ${S}/><path d="M38,30 l-6,-2 M62,30 l6,-2 M38,44 l-6,-2 M62,44 l6,-2 M38,72 l-6,-2 M62,72 l6,-2 M20,42 l-6,0 M78,42 l6,0" ${SN} stroke-width="1.6"/>`,
  shirt: (c = '#3b82f6') => `<path d="M34,14 C40,22 60,22 66,14 L90,28 L80,46 L70,40 L70,88 L30,88 L30,40 L20,46 L10,28 Z" fill="${c}" ${S}/><path d="M34,14 C40,26 60,26 66,14" ${SN}/>`,
  sock: (c = '#ef4444') => `<path d="M34,10 L64,10 L64,58 C64,70 74,72 80,76 C88,82 84,94 74,92 L46,86 C34,84 32,74 34,64 Z" fill="${c}" ${S}/><rect x="34" y="10" width="30" height="12" fill="#fff" ${S}/><path d="M34,40 L64,40 M34,48 L64,48" stroke="#fff" stroke-width="4"/>`,
  shoe: (c = '#3b82f6') => `<path d="M10,72 L12,40 C12,34 22,34 26,40 C34,50 48,52 60,54 C80,56 92,62 92,72 L92,78 L10,78 Z" fill="${c}" ${S}/><rect x="8" y="74" width="86" height="8" rx="3" fill="#f8fafc" ${S}/><path d="M28,48 L36,42 M36,52 L44,46 M44,54 L52,48" ${SN} stroke="#fff" stroke-width="2.5"/>`,
  chair: (c = '#b45309') => `<rect x="24" y="12" width="8" height="78" rx="2" fill="${c}" ${S}/><rect x="24" y="52" width="54" height="9" rx="2" fill="${lighten(c, 0.2)}" ${S}/><rect x="70" y="58" width="8" height="32" rx="2" fill="${c}" ${S}/><rect x="24" y="16" width="34" height="8" rx="2" fill="${c}" ${S}/><rect x="24" y="32" width="34" height="8" rx="2" fill="${c}" ${S}/>`,
  giftBox: (c = '#ef4444', o = {}) => o.open
    ? `<rect x="18" y="44" width="64" height="44" fill="${c}" ${S}/><rect x="45" y="44" width="10" height="44" fill="#facc15" ${S}/><path d="M18,44 L82,44 L76,38 L24,38 Z" fill="#334155" ${S}/>
       <g transform="rotate(-28 18 34)"><rect x="12" y="22" width="76" height="14" fill="${darken(c, 0.1)}" ${S}/><rect x="45" y="22" width="10" height="14" fill="#facc15" ${S}/></g>`
    : `<rect x="18" y="44" width="64" height="44" fill="${c}" ${S}/><rect x="12" y="32" width="76" height="14" fill="${darken(c, 0.1)}" ${S}/><rect x="45" y="32" width="10" height="56" fill="#facc15" ${S}/>
       <path d="M50,32 C40,18 28,22 34,30 Z M50,32 C60,18 72,22 66,30 Z" fill="#facc15" ${S}/>`,
  door: (c = '#b45309', o = {}) => o.open
    ? `<rect x="24" y="10" width="52" height="82" fill="#1e293b" ${S}/><path d="M76,92 L94,82 L94,6 L76,10 Z" fill="${c}" ${S}/><circle cx="90" cy="48" r="2.5" fill="#facc15"/><path d="M28,92 L72,92 L64,70 L36,70 Z" fill="#fde68a" opacity=".55"/>`
    : `<rect x="24" y="10" width="52" height="82" fill="${c}" ${S}/><rect x="32" y="18" width="36" height="28" rx="2" fill="none" stroke="${darken(c, 0.3)}" stroke-width="2"/><rect x="32" y="54" width="36" height="30" rx="2" fill="none" stroke="${darken(c, 0.3)}" stroke-width="2"/><circle cx="66" cy="52" r="3" fill="#facc15" ${S} stroke-width="1.5"/>`,
  window: (c = '#3b82f6', o = {}) => o.open
    ? `<rect x="22" y="18" width="56" height="64" fill="#bae6fd" ${S}/><path d="M50,30 C60,22 74,26 72,34 C78,36 76,44 68,42 Z" fill="#fff"/><path d="M22,18 L6,10 L6,90 L22,82 Z M78,18 L94,10 L94,90 L78,82 Z" fill="${lighten(c, 0.6)}" ${S}/><rect x="16" y="82" width="68" height="8" fill="${c}" ${S}/>`
    : `<rect x="22" y="18" width="56" height="64" fill="#bae6fd" ${S}/><path d="M50,18 L50,82 M22,50 L78,50" ${SN} stroke-width="4" stroke="${c}"/><rect x="22" y="18" width="56" height="64" ${SN}/><rect x="16" y="82" width="68" height="8" fill="${c}" ${S}/><path d="M28,26 L36,34 M56,26 L64,34" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  jar: (c = '#ef4444', o = {}) => `${o.open ? `<g transform="rotate(-24 76 18)"><rect x="56" y="8" width="40" height="12" rx="3" fill="${c}" ${S}/></g>` : `<rect x="28" y="16" width="44" height="12" rx="3" fill="${c}" ${S}/>`}
      <path d="M30,28 L70,28 L76,40 L76,84 C76,90 72,92 66,92 L34,92 C28,92 24,90 24,84 L24,40 Z" fill="#e0f2fe" ${S}/><path d="M24,52 L76,52 L76,84 C76,90 72,92 66,92 L34,92 C28,92 24,90 24,84 Z" fill="#f59e0b" ${S}/><path d="M32,44 L32,80" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
  eye: (c = '#3b82f6', o = {}) => o.closed
    ? `<path d="M10,50 C30,72 70,72 90,50" ${SN} stroke-width="4"/><path d="M24,62 L18,72 M38,68 L34,80 M50,70 L50,82 M62,68 L66,80 M76,62 L82,72" ${SN} stroke-width="3"/><path d="M22,34 C40,24 60,24 78,34" ${SN} stroke-width="3"/>`
    : `<path d="M10,52 C30,24 70,24 90,52 C70,80 30,80 10,52 Z" fill="#fff" ${S} stroke-width="3.5"/><circle cx="50" cy="52" r="16" fill="${c}" ${S}/><circle cx="50" cy="52" r="7" fill="${OL}"/><circle cx="55" cy="47" r="3.5" fill="#fff"/><path d="M22,26 C40,14 60,14 78,26" ${SN} stroke-width="3"/>`,
  bell: (c = '#facc15') => `<path d="M50,10 L50,18" ${SN} stroke-width="4"/><path d="M50,18 C30,18 26,36 26,54 C26,64 20,70 14,74 L86,74 C80,70 74,64 74,54 C74,36 70,18 50,18 Z" fill="${c}" ${S}/><circle cx="50" cy="80" r="7" fill="${darken(c, 0.25)}" ${S}/><ellipse cx="38" cy="40" rx="4" ry="10" fill="#fff" opacity=".5"/>`,
  drum: (c = '#ef4444') => `<path d="M14,40 L14,74 C14,84 86,84 86,74 L86,40" fill="${c}" ${S}/><path d="M14,46 L30,78 L46,46 L62,80 L78,46 L86,60" ${SN} stroke="#facc15" stroke-width="3"/><ellipse cx="50" cy="40" rx="36" ry="10" fill="#f8fafc" ${S}/>
      <path d="M30,30 L10,8 M70,30 L90,8" ${SN} stroke="#a16207" stroke-width="4"/><circle cx="10" cy="8" r="4" fill="#fef3c7" ${S}/><circle cx="90" cy="8" r="4" fill="#fef3c7" ${S}/>`,
  clock: (c = '#ef4444') => `<path d="M24,84 L30,74 M76,84 L70,74" ${SN} stroke-width="4"/><circle cx="26" cy="24" r="10" fill="${c}" ${S}/><circle cx="74" cy="24" r="10" fill="${c}" ${S}/>
      <circle cx="50" cy="54" r="32" fill="${c}" ${S}/><circle cx="50" cy="54" r="25" fill="#fff" ${S}/><path d="M50,54 L50,38 M50,54 L62,60" ${SN} stroke-width="3"/><circle cx="50" cy="54" r="2.5" fill="${OL}"/>`,
  phone: (c = '#334155') => `<rect x="28" y="8" width="44" height="84" rx="8" fill="${c}" ${S}/><rect x="33" y="17" width="34" height="60" rx="2" fill="#7dd3fc"/><circle cx="50" cy="84" r="3.5" fill="#94a3b8"/>`,
  radio: (c = '#f97316') => `<path d="M30,30 L70,10" ${SN} stroke-width="3"/><rect x="10" y="30" width="80" height="56" rx="8" fill="${c}" ${S}/><circle cx="34" cy="58" r="16" fill="#334155" ${S}/><circle cx="34" cy="58" r="6" fill="#64748b"/><rect x="58" y="42" width="24" height="10" rx="2" fill="#fde68a" ${S}/><circle cx="64" cy="68" r="4" fill="#fff" ${S}/><circle cx="78" cy="68" r="4" fill="#fff" ${S}/>`,
  trumpet: (c = '#facc15') => `<path d="M10,46 L60,46 L60,54 L10,54 Z" fill="${c}" ${S}/><path d="M60,46 L90,26 L90,74 L60,54 Z" fill="${c}" ${S}/><ellipse cx="90" cy="50" rx="5" ry="24" fill="${darken(c, 0.2)}" ${S}/><rect x="28" y="36" width="5" height="10" fill="${c}" ${S}/><rect x="38" y="36" width="5" height="10" fill="${c}" ${S}/><rect x="48" y="36" width="5" height="10" fill="${c}" ${S}/><rect x="4" y="44" width="8" height="12" rx="2" fill="${darken(c, 0.2)}" ${S}/>`,
  lamp: (c = '#f59e0b', o = {}) => `${o.on ? `<circle cx="50" cy="36" r="34" fill="#fef08a" opacity=".7"/>` : ''}<path d="M30,14 L70,14 L82,46 L18,46 Z" fill="${o.on ? '#fde047' : darken(c, 0.2)}" ${S}/><rect x="46" y="46" width="8" height="34" fill="#64748b" ${S}/><path d="M28,92 C28,82 72,82 72,92 Z" fill="#475569" ${S}/>`,
  candle: (c = '#ef4444', o = {}) => {
    const h = (o.h ?? 0.7) * 70; const w = o.w || 18; const top = 88 - h;
    return `${o.lit === false ? '' : `<path d="M50,${top - 20} C56,${top - 10} 56,${top - 4} 50,${top - 2} C44,${top - 4} 44,${top - 10} 50,${top - 20} Z" fill="#f97316" ${S} stroke-width="1.6"/>`}<path d="M50,${top - 2} L50,${top + 4}" ${SN} stroke-width="2"/>
      <rect x="${50 - w / 2}" y="${top}" width="${w}" height="${h}" rx="2" fill="${c}" ${S}/><path d="M${50 - w / 2 + 3},${top + 4} L${50 - w / 2 + 3},${top + h - 6}" stroke="#fff" stroke-width="2" opacity=".5"/><ellipse cx="50" cy="90" rx="${w / 2 + 12}" ry="4" fill="#e2e8f0" ${S}/>`;
  },
  coin: (c = '#facc15') => `<circle cx="50" cy="50" r="34" fill="${c}" ${S}/><circle cx="50" cy="50" r="25" fill="none" stroke="${darken(c, 0.25)}" stroke-width="2.5"/><path d="M50,36 L50,64 M42,42 L58,42" stroke="${darken(c, 0.25)}" stroke-width="4" stroke-linecap="round"/>`,
  diamond: (c = '#38bdf8') => `<path d="M24,22 L76,22 L92,40 L50,90 L8,40 Z" fill="${c}" ${S}/><path d="M8,40 L92,40 M24,22 L36,40 L50,90 L64,40 L76,22 M36,40 L50,22 L64,40" ${SN} stroke-width="1.8"/>`,
  ruler: (c = '#facc15', o = {}) => {
    const L = (o.len ?? 1) * 84; const x0 = 50 - L / 2; let t = '';
    for (let x = x0 + 6; x < x0 + L - 2; x += 6) t += `<line x1="${x}" y1="38" x2="${x}" y2="${(Math.round((x - x0) / 6) % 2) ? 44 : 48}" stroke="${OL}" stroke-width="1.5"/>`;
    return `<rect x="${x0}" y="38" width="${L}" height="22" rx="2" fill="${c}" ${S}/>${t}`;
  },
  stick: (c = '#a16207') => `<path d="M10,58 L90,42" stroke="${OL}" stroke-width="11" stroke-linecap="round"/><path d="M10,58 L90,42" stroke="${c}" stroke-width="6.5" stroke-linecap="round"/>`,
  rope: (c = '#ef4444', o = {}) => {
    const d = o.wavy ? 'M8,50 C20,24 32,24 40,50 C48,76 60,76 68,50 C76,24 88,24 92,40' : 'M8,50 L92,50';
    const th = o.th || 8;
    return `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${th + 4.5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${th}" stroke-linecap="round"/>`;
  },
  snake: (c = '#22c55e') => `<path d="M10,70 C20,40 36,40 42,62 C48,84 66,84 72,56 C76,40 84,34 88,36" fill="none" stroke="${OL}" stroke-width="15" stroke-linecap="round"/><path d="M10,70 C20,40 36,40 42,62 C48,84 66,84 72,56 C76,40 84,34 88,36" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="88" cy="34" rx="9" ry="7" fill="${c}" ${S}/>${eye(90, 31, 2.2)}<path d="M96,36 L100,38 M96,36 L100,34" ${SN} stroke="#ef4444" stroke-width="1.5"/>`,
  rainbow: () => `<path d="M10,80 A40,40 0 0 1 90,80" fill="none" stroke="#ef4444" stroke-width="8"/><path d="M18,80 A32,32 0 0 1 82,80" fill="none" stroke="#f59e0b" stroke-width="8"/><path d="M26,80 A24,24 0 0 1 74,80" fill="none" stroke="#22c55e" stroke-width="8"/><path d="M34,80 A16,16 0 0 1 66,80" fill="none" stroke="#3b82f6" stroke-width="8"/>`,
  hook: (c = '#64748b') => `<path d="M50,8 L50,58 C50,82 18,82 18,62" fill="none" stroke="${OL}" stroke-width="11" stroke-linecap="round"/><path d="M50,8 L50,58 C50,82 18,82 18,62" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="10" r="6" fill="${c}" ${S}/>`,
  road: (c = '#475569', o = {}) => o.curved
    ? `<path d="M20,92 C20,60 80,60 76,36 C74,20 50,14 44,8" fill="none" stroke="${OL}" stroke-width="22" stroke-linecap="round"/><path d="M20,92 C20,60 80,60 76,36 C74,20 50,14 44,8" fill="none" stroke="${c}" stroke-width="17" stroke-linecap="round"/><path d="M20,92 C20,60 80,60 76,36 C74,20 50,14 44,8" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="6 6"/>`
    : `<path d="M50,92 L50,8" fill="none" stroke="${OL}" stroke-width="22" stroke-linecap="round"/><path d="M50,92 L50,8" fill="none" stroke="${c}" stroke-width="17" stroke-linecap="round"/><path d="M50,92 L50,8" stroke="#fff" stroke-width="2.5" stroke-dasharray="6 6"/>`,
  nail: (c = '#94a3b8', o = {}) => `<rect x="22" y="14" width="56" height="10" rx="3" fill="${c}" ${S}/>${o.blunt ? `<rect x="42" y="24" width="16" height="62" rx="4" fill="${c}" ${S}/>` : `<path d="M42,24 L58,24 L58,72 L50,94 L42,72 Z" fill="${c}" ${S}/>`}`,
  coneHat: (c = '#8b5cf6', o = {}) => o.blunt
    ? `<path d="M22,86 L36,22 C38,14 62,14 64,22 L78,86 Z" fill="${c}" ${S}/><path d="M28,58 L72,58" stroke="#facc15" stroke-width="5"/><ellipse cx="50" cy="86" rx="30" ry="5" fill="${darken(c, 0.2)}" ${S}/>`
    : `<path d="M22,86 L50,6 L78,86 Z" fill="${c}" ${S}/><path d="M30,62 L70,62" stroke="#facc15" stroke-width="5"/><ellipse cx="50" cy="86" rx="30" ry="5" fill="${darken(c, 0.2)}" ${S}/>`,
  // --- figür / kişi ---
  kid: (c = '#3b82f6', o = {}) => `<circle cx="50" cy="24" r="14" fill="${o.skin || '#fcd9b6'}" ${S}/><path d="M36,20 C38,8 62,8 64,20 C58,14 42,14 36,20 Z" fill="${o.hair || '#78350f'}" ${S}/>
      <circle cx="45" cy="24" r="1.8" fill="${OL}"/><circle cx="55" cy="24" r="1.8" fill="${OL}"/><path d="M45,30 q5,4 10,0" ${SN} stroke-width="1.8"/>
      <path d="M36,40 L64,40 L68,68 L32,68 Z" fill="${c}" ${S}/><path d="M36,42 L24,60 M64,42 L76,60" ${SN} stroke-width="4"/><path d="M42,68 L40,90 M58,68 L60,90" ${SN} stroke-width="5"/>`,
  // --- zemin ---
  ground: (w = 100, y = 88, c = '#86efac') => `<rect x="2" y="${y}" width="${w - 4}" height="10" fill="${c}"/><line x1="2" y1="${y}" x2="${w - 2}" y2="${y}" stroke="#16a34a" stroke-width="2.5"/>`
};

// ============================================================================
// --- YÜZ İFADELERİ (DUYGULAR, YAŞLI-GENÇ, AÇ-TOK) ---
// ============================================================================
export const SKINS = ['#fde047', '#fcd9b6', '#f1c27d', '#e0ac69', '#c68642', '#fbbf24'];
export const HAIRS = ['#78350f', '#1e293b', '#f59e0b', '#b91c1c', '#451a03', null];

export const face = (emotion = 'happy', { skin = '#fde047', hair = null, bow = false, age = 'kid', cap = null } = {}) => {
  const old = age === 'old';
  const hairCol = old ? '#e5e7eb' : hair;
  let h = `<circle cx="50" cy="52" r="36" fill="${emotion === 'angry' && skin === '#fde047' ? '#fb923c' : skin}" ${S} stroke-width="3"/>`;
  if (hairCol) {
    h += old
      ? `<path d="M16,52 C10,40 16,30 24,30 C22,22 30,18 34,22 M84,52 C90,40 84,30 76,30 C78,22 70,18 66,22" fill="${hairCol}" ${S}/><path d="M18,48 C16,36 24,30 28,34 C24,40 22,46 22,54 Z M82,48 C84,36 76,30 72,34 C76,40 78,46 78,54 Z" fill="${hairCol}" ${S}/>`
      : `<path d="M15,48 C14,22 34,12 50,12 C66,12 86,22 85,48 C76,36 66,30 52,30 C40,30 26,36 15,48 Z" fill="${hairCol}" ${S}/>`;
  }
  if (bow && !old) h += `<path d="M66,18 L80,10 L80,26 Z M66,18 L54,8 L54,26 Z" fill="#ec4899" ${S}/><circle cx="66" cy="18" r="3.5" fill="#be185d" ${S}/>`;
  if (cap && !old) h += `<path d="M18,40 C18,18 82,18 82,40 Z" fill="${cap}" ${S}/><path d="M78,38 L96,42 L80,44 Z" fill="${cap}" ${S}/>`;
  const E = {
    happy: `${eye(37, 48, 3.6)}${eye(63, 48, 3.6)}<path d="M30,62 C38,78 62,78 70,62 Z" fill="#fff" ${S}/><circle cx="26" cy="62" r="5" fill="#fda4af" opacity=".7"/><circle cx="74" cy="62" r="5" fill="#fda4af" opacity=".7"/>`,
    sad: `${eye(37, 50, 3.4)}${eye(63, 50, 3.4)}<path d="M28,40 L44,36 M72,40 L56,36" ${SN}/><path d="M34,74 C42,64 58,64 66,74" ${SN} stroke-width="3"/><path d="M30,56 C26,64 28,68 32,68 C36,68 36,62 30,56 Z" fill="#60a5fa" ${S} stroke-width="1.5"/>`,
    angry: `${eye(37, 50, 3.4)}${eye(63, 50, 3.4)}<path d="M26,36 L44,44 M74,36 L56,44" ${SN} stroke-width="4"/><path d="M34,72 C42,64 58,64 66,72 Z" fill="#fff" ${S}/><path d="M38,68 L62,68" ${SN} stroke-width="1.5"/>`,
    scared: `<circle cx="37" cy="48" r="8" fill="#fff" ${S}/><circle cx="63" cy="48" r="8" fill="#fff" ${S}/><circle cx="37" cy="49" r="2.5" fill="${OL}"/><circle cx="63" cy="49" r="2.5" fill="${OL}"/>
      <path d="M28,34 C32,30 40,30 44,34 M56,34 C60,30 68,30 72,34" ${SN}/><path d="M36,72 C38,62 62,62 64,72 C62,78 38,78 36,72 Z" fill="#fff" ${S}/><path d="M38,70 L42,66 L46,70 L50,66 L54,70 L58,66 L62,70" ${SN} stroke-width="1.5"/>
      <path d="M82,30 C78,38 80,42 84,42 C88,42 88,36 82,30 Z" fill="#7dd3fc" ${S} stroke-width="1.5"/>`,
    surprised: `<circle cx="37" cy="48" r="6.5" fill="#fff" ${S}/><circle cx="63" cy="48" r="6.5" fill="#fff" ${S}/><circle cx="37" cy="48" r="3" fill="${OL}"/><circle cx="63" cy="48" r="3" fill="${OL}"/>
      <path d="M26,32 C30,24 40,24 44,30 M56,30 C60,24 70,24 74,32" ${SN}/><ellipse cx="50" cy="70" rx="7" ry="9" fill="#7f1d1d" ${S}/>`,
    neutral: `${eye(37, 48, 3.4)}${eye(63, 48, 3.4)}<path d="M38,68 L62,68" ${SN} stroke-width="3"/>`,
    content: `<path d="M30,48 C34,42 40,42 44,48 M56,48 C60,42 66,42 70,48" ${SN} stroke-width="3"/><path d="M32,62 C40,74 60,74 68,62" ${SN} stroke-width="3"/><circle cx="26" cy="60" r="5" fill="#fda4af" opacity=".7"/><circle cx="74" cy="60" r="5" fill="#fda4af" opacity=".7"/>`,
    hungry: `${eye(37, 50, 3.4)}${eye(63, 50, 3.4)}<path d="M30,40 L44,38 M70,40 L56,38" ${SN}/><ellipse cx="50" cy="70" rx="9" ry="7" fill="#7f1d1d" ${S}/><path d="M58,74 C60,80 62,82 60,86" ${SN} stroke="#60a5fa" stroke-width="2.5"/>`
  };
  h += E[emotion] || E.happy;
  if (old) h += `<path d="M24,40 L32,38 M76,40 L68,38 M30,58 C32,62 34,62 36,60 M64,60 C66,62 68,62 70,58" ${SN} stroke-width="1.6"/>
    <circle cx="37" cy="48" r="9" fill="none" stroke="${OL}" stroke-width="2.5"/><circle cx="63" cy="48" r="9" fill="none" stroke="${OL}" stroke-width="2.5"/><path d="M46,48 L54,48" ${SN} stroke-width="2.5"/>`;
  return h;
};

// ============================================================================
// --- DURUM KATMANLARI (ıslak, kirli, eski, parlak, sesli, hareketli...) ---
// ============================================================================
export const FX = {
  wet: () => `<path d="M14,20 C10,28 12,32 15,32 C18,32 19,28 14,20 Z M84,14 C80,22 82,26 85,26 C88,26 89,22 84,14 Z M88,44 C84,52 86,56 89,56 C92,56 93,52 88,44 Z M10,52 C6,60 8,64 11,64 C14,64 15,60 10,52 Z" fill="#38bdf8" ${S} stroke-width="1.5"/>
    <path d="M30,84 C34,78 40,82 44,80 M56,82 C60,78 66,82 70,80" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="50" cy="93" rx="36" ry="4" fill="#7dd3fc"/>`,
  dirty: () => `<path d="M30,40 C36,34 44,40 40,46 C46,50 38,58 32,52 C26,56 22,46 30,40 Z" fill="#78350f" opacity=".85"/><path d="M62,58 C68,54 74,60 70,64 C74,70 64,74 62,68 C56,70 56,60 62,58 Z" fill="#78350f" opacity=".85"/><circle cx="56" cy="34" r="4" fill="#78350f" opacity=".85"/><circle cx="42" cy="70" r="3" fill="#78350f" opacity=".85"/>
    <path d="M80,16 C84,10 86,22 90,16 M12,18 C16,12 18,24 22,18" ${SN} stroke="#65a30d" stroke-width="2"/><circle cx="86" cy="30" r="2.5" fill="${OL}"/><path d="M84,28 L82,25 M88,28 L90,25" ${SN} stroke-width="1"/>`,
  clean: () => `<path d="M84,10 L86,18 L94,20 L86,22 L84,30 L82,22 L74,20 L82,18 Z M14,64 L15.5,70 L22,71.5 L15.5,73 L14,79 L12.5,73 L6,71.5 L12.5,70 Z" fill="#38bdf8"/><path d="M20,12 L21,16 L25,17 L21,18 L20,22 L19,18 L15,17 L19,16 Z" fill="#7dd3fc"/>`,
  shine: () => `<path d="M80,8 L83,18 L93,21 L83,24 L80,34 L77,24 L67,21 L77,18 Z" fill="#fde047" ${S} stroke-width="1.2"/><path d="M16,10 L18,16 L24,18 L18,20 L16,26 L14,20 L8,18 L14,16 Z" fill="#fde047" ${S} stroke-width="1.2"/><path d="M88,72 L89.5,77 L94,78.5 L89.5,80 L88,85 L86.5,80 L82,78.5 L86.5,77 Z" fill="#fde047"/>`,
  old: () => `<path d="M30,30 L36,40 L32,46 L38,56" ${SN} stroke-width="2"/><path d="M66,50 L60,60 L66,66" ${SN} stroke-width="2"/>
    <rect x="54" y="66" width="14" height="12" fill="#a8a29e" ${S} stroke-width="1.6" transform="rotate(10 61 72)"/><path d="M56,68 l4,4 M60,68 l4,4" ${SN} stroke-width="1"/><path d="M20,84 C24,80 26,88 30,84" ${SN} stroke-width="1.5" stroke="#78716c"/>`,
  sound: () => `<path d="M8,40 C2,48 2,56 8,64 M14,44 C10,48 10,56 14,60 M92,40 C98,48 98,56 92,64 M86,44 C90,48 90,56 86,60" ${SN} stroke="#ef4444" stroke-width="3"/>
    <path d="M84,10 L84,24 C84,28 76,28 78,24 C80,20 84,22 84,22 M84,10 L92,8" ${SN} stroke="#8b5cf6" stroke-width="2.5"/><path d="M14,10 L14,22 C14,26 6,26 8,22 C10,18 14,20 14,20" ${SN} stroke="#8b5cf6" stroke-width="2.5"/>`,
  quiet: () => `<path d="M76,12 L88,12 L76,24 L88,24 M84,30 L92,30 L84,38 L92,38" ${SN} stroke="#94a3b8" stroke-width="2"/>`,
  motion: () => `<path d="M2,36 L18,36 M0,50 L14,50 M2,64 L18,64" ${SN} stroke="#64748b" stroke-width="3.5"/><circle cx="8" cy="80" r="4" fill="#d6d3d1"/><circle cx="16" cy="86" r="3" fill="#d6d3d1"/>`
};
