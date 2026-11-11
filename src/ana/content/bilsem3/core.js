// ============================================================================
// --- BİLSEM (yeni): ORTAK ÇİZİM VE ŞABLON ARAÇLARI ---
// ============================================================================
// Bütün BİLSEM soruları SVG olarak üretilir (görsel yüklemeye gerek yoktur).
// Benzeşim sorularındaki gerçek nesne resimleri isteğe bağlı olarak kod + tarifle yüklenebilir.
import { card } from '../art';
import { makeRng, shuffle, pick, randInt } from '../helpers';

export { makeRng, shuffle, pick, randInt };

export const INK = '#1e293b';
export const COLS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#ec4899', '#14b8a6'];
export const COL_TR = { '#ef4444': 'kırmızı', '#3b82f6': 'mavi', '#22c55e': 'yeşil', '#eab308': 'sarı', '#a855f7': 'mor', '#f97316': 'turuncu', '#ec4899': 'pembe', '#14b8a6': 'turkuaz' };
export const n2 = (v) => +(+v).toFixed(2);

// kart (çerçeveli SVG -> data URL)
export const box = (inner, w = 100, h = 100, bg = '#ffffff') => card(inner, { w, h, bg });

export const regPts = (n, cx, cy, r, rot = 0) => Array.from({ length: n }, (_, k) => {
  const a = (rot - 90 + (360 / n) * k) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
export const starPts = (cx, cy, r, ri, n = 5, rot = 0) => Array.from({ length: n * 2 }, (_, k) => {
  const a = (rot - 90 + (180 / n) * k) * Math.PI / 180; const rr = k % 2 ? ri : r;
  return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
});
export const pts = (P) => P.map(([x, y]) => `${n2(x)},${n2(y)}`).join(' ');
const rotPts = (P, cx, cy, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return P.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };

// Şekiller. Asimetrik olanlar (ok, bayrak, L, F) yansıma / dönme sorularında kullanılır.
export const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'pentagon', 'hexagon', 'star', 'cross'];
export const ASYM = ['arrow', 'flag', 'ell', 'eff', 'boot', 'rtri'];
const shapePts = (type, cx, cy, r) => {
  switch (type) {
    case 'square': return [[cx - r * 0.85, cy - r * 0.85], [cx + r * 0.85, cy - r * 0.85], [cx + r * 0.85, cy + r * 0.85], [cx - r * 0.85, cy + r * 0.85]];
    case 'triangle': return regPts(3, cx, cy + r * 0.15, r * 1.05);
    case 'diamond': return regPts(4, cx, cy, r);
    case 'pentagon': return regPts(5, cx, cy, r);
    case 'hexagon': return regPts(6, cx, cy, r, 30);
    case 'star': return starPts(cx, cy, r, r * 0.45);
    case 'cross': { const a = r * 0.33; return [[cx - a, cy - r], [cx + a, cy - r], [cx + a, cy - a], [cx + r, cy - a], [cx + r, cy + a], [cx + a, cy + a], [cx + a, cy + r], [cx - a, cy + r], [cx - a, cy + a], [cx - r, cy + a], [cx - r, cy - a], [cx - a, cy - a]]; }
    case 'arrow': return [[cx - r, cy - r * 0.3], [cx + r * 0.1, cy - r * 0.3], [cx + r * 0.1, cy - r * 0.75], [cx + r, cy], [cx + r * 0.1, cy + r * 0.75], [cx + r * 0.1, cy + r * 0.3], [cx - r, cy + r * 0.3]];
    case 'flag': return [[cx - r * 0.7, cy + r], [cx - r * 0.7, cy - r], [cx + r, cy - r * 0.55], [cx - r * 0.35, cy - r * 0.1], [cx - r * 0.35, cy + r]];
    case 'ell': return [[cx - r * 0.7, cy - r], [cx - r * 0.15, cy - r], [cx - r * 0.15, cy + r * 0.45], [cx + r * 0.8, cy + r * 0.45], [cx + r * 0.8, cy + r], [cx - r * 0.7, cy + r]];
    case 'eff': return [[cx - r * 0.7, cy - r], [cx + r * 0.8, cy - r], [cx + r * 0.8, cy - r * 0.5], [cx - r * 0.2, cy - r * 0.5], [cx - r * 0.2, cy - r * 0.1], [cx + r * 0.5, cy - r * 0.1], [cx + r * 0.5, cy + r * 0.35], [cx - r * 0.2, cy + r * 0.35], [cx - r * 0.2, cy + r], [cx - r * 0.7, cy + r]];
    case 'boot': return [[cx - r * 0.6, cy - r], [cx, cy - r], [cx, cy + r * 0.2], [cx + r * 0.9, cy + r * 0.4], [cx + r * 0.9, cy + r], [cx - r * 0.6, cy + r]];
    case 'rtri': return [[cx - r, cy + r * 0.85], [cx - r, cy - r * 0.85], [cx + r, cy + r * 0.85]];
    default: return null;
  }
};
// Tek şekil çiz (dön: derece, ayna: yatay çevir)
export const shape = (type, cx, cy, r, fill, { rot = 0, mirror = false, stroke = INK, sw = 2.2, opacity } = {}) => {
  const op = opacity !== undefined ? ` fill-opacity="${opacity}"` : '';
  if (type === 'circle') return `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r * 0.92)}" fill="${fill}"${op} stroke="${stroke}" stroke-width="${sw}"/>`;
  if (type === 'ring') return `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r * 0.75)}" fill="none" stroke="${fill}" stroke-width="${n2(r * 0.32)}"/>`;
  let P = shapePts(type, cx, cy, r);
  if (!P) return '';
  if (mirror) P = P.map(([x, y]) => [2 * cx - x, y]);
  if (rot) P = rotPts(P, cx, cy, rot);
  return `<polygon points="${pts(P)}" fill="${fill}"${op} stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
};
export const text = (x, y, t, size = 30, fill = INK, extra = '') => `<text x="${n2(x)}" y="${n2(y)}" font-size="${size}" font-weight="900" text-anchor="middle" dominant-baseline="central" font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif" fill="${fill}"${extra}>${t}</text>`;
export const qmark = (x, y, s = 30) => `<rect x="${n2(x - s / 2)}" y="${n2(y - s / 2)}" width="${s}" height="${s}" rx="5" fill="#fff" stroke="${INK}" stroke-width="2"/>${text(x, y + 1, '?', s * 0.75, '#dc2626')}`;
export const arrowLine = (x1, y1, x2, y2, col = '#ef4444', w = 3) => {
  const a = Math.atan2(y2 - y1, x2 - x1); const hl = w * 3;
  const bx = x2 - hl * Math.cos(a), by = y2 - hl * Math.sin(a);
  return `<line x1="${n2(x1)}" y1="${n2(y1)}" x2="${n2(bx)}" y2="${n2(by)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${n2(x2)},${n2(y2)} ${n2(bx + hl * 0.55 * Math.sin(a))},${n2(by - hl * 0.55 * Math.cos(a))} ${n2(bx - hl * 0.55 * Math.sin(a))},${n2(by + hl * 0.55 * Math.cos(a))}" fill="${col}"/>`;
};
// göz + ok (bakış yönü)
export const eyeArrow = (x, y, dir) => {
  const d = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[dir];
  const ex = x - d[0] * 20, ey = y - d[1] * 20;
  return `<g><ellipse cx="${n2(ex)}" cy="${n2(ey)}" rx="9" ry="6" fill="#fff" stroke="${INK}" stroke-width="1.8"/><circle cx="${n2(ex)}" cy="${n2(ey)}" r="3" fill="${INK}"/></g>${arrowLine(ex + d[0] * 9, ey + d[1] * 8, x, y, '#2563eb', 3)}`;
};

// --- Şablon kurucu -----------------------------------------------------------
// opt: { k: imza (tekrarsızlık), img: data URL, name?: görsel adı (tarif), text? }
// Doğru + 3 yanlış farklı imzalı olmalı; değilse null (banka başka tohumla yeniden dener).
export const build = ({ sig, text: tx, speak, main, correct, wrongs, n = 4, memory, mainImgName }) => {
  const seen = new Set([correct.k]); const ws = [];
  for (const w of wrongs) { if (!w || seen.has(w.k)) continue; seen.add(w.k); ws.push(w); if (ws.length >= n - 1) break; }
  if (ws.length < n - 1) return null;
  const toOpt = (o) => ({ image: o.img || '', text: o.text || '', ...(o.name ? { imgName: o.name } : {}) });
  return {
    sig, mainImage: main || '', options: [toOpt(correct), ...ws.map(toOpt)], correctIndex: 0,
    ...(tx ? { text: tx } : {}), ...(speak ? { speak } : {}), ...(memory ? { memory } : {}), ...(mainImgName ? { mainImgName } : {}),
    hideOptionText: !(correct.text && !correct.img)
  };
};
export const capped = (gen, cap) => { gen.cap = cap; return gen; };
