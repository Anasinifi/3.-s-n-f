// ============================================================================
// --- İÇERİK ÜRETİCİLERİ İÇİN ORTAK YARDIMCILAR ---
// ============================================================================
// Kavram soruları, BİLSEM soruları ve sudoku bankası bu dosyayı kullanır.
// Her şey "tohumlu" (seeded) üretilir: aynı anahtar + aynı sıra numarası -> hep aynı soru.

import { createSeededRng } from '../activities/shared';
import { card, put, OL, ART } from './art';

export const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
export const makeRng = (key, i) => { const r = createSeededRng((hashStr(key) + i * 7919 + 13) >>> 0); r(); r(); return r; };
export const pick = (arr, rng) => arr[Math.floor(rng() * arr.length) % arr.length];
export const shuffle = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pickN = (arr, n, rng, exclude = []) => shuffle(arr.filter(x => !exclude.includes(x)), rng).slice(0, n);
export const randInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
export const uid = (rng) => 'k' + Math.floor(rng() * 1e8).toString(36);

// Doğru şıkkın yeri dengeli dağılsın: her N soruluk blokta 0..N-1 konumları birer kez kullanılır
export const slotFor = (key, i, n = 3) => {
  const base = Array.from({ length: n }, (_, k) => k);
  const perm = shuffle(base, makeRng(key + '#slot' + n, Math.floor(i / n)));
  return perm[i % n];
};

// correct + yanlışlar -> { options, correctIndex, mainImage }
export const arrangeN = (key, i, correct, wrongs, mainImage = '', n = wrongs.length + 1) => {
  const slot = slotFor(key, i, n);
  const opts = [...wrongs.slice(0, n - 1)];
  opts.splice(slot, 0, correct);
  return { options: opts, correctIndex: slot, mainImage };
};
export const arrange = (key, i, correct, wrongs, mainImage = '') => arrangeN(key, i, correct, wrongs, mainImage, 3);

// --- SVG küçük yardımcılar ---
export const draw = (k, c, o) => ART[k](c, o || {});
export const txt = (x, y, t, size = 40, col = OL, weight = 900) => `<text x="${x}" y="${y}" font-size="${size}" font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif" font-weight="${weight}" text-anchor="middle" dominant-baseline="central" fill="${col}">${t}</text>`;
export const arrow = (x1, y1, x2, y2, col = '#ef4444', w = 5) => {
  const a = Math.atan2(y2 - y1, x2 - x1); const hl = w * 2.6;
  const bx = x2 - hl * Math.cos(a), by = y2 - hl * Math.sin(a);
  const p1 = `${(bx + hl * 0.6 * Math.sin(a)).toFixed(1)},${(by - hl * 0.6 * Math.cos(a)).toFixed(1)}`;
  const p2 = `${(bx - hl * 0.6 * Math.sin(a)).toFixed(1)},${(by + hl * 0.6 * Math.cos(a)).toFixed(1)}`;
  return `<line x1="${x1}" y1="${y1}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${x2},${y2} ${p1} ${p2}" fill="${col}" stroke="${col}" stroke-width="1.5" stroke-linejoin="round"/>`;
};

// N adet çizimi kutuya düzgünce dizer (beşli satırlar -> sayma kolaylığı)
export const groupLayout = (n, inner, box = { x: 7, y: 7, w: 86, h: 86 }, maxS = 0.5) => {
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

export const numCard = (n, col = '#4f46e5', bg) => card(txt(50, 52, n, String(n).length > 1 ? 46 : 54, col), bg ? { bg } : undefined);

// ---------------------------------------------------------------------------
// Tekrarsız şablon listesi üretir.
// gen(key, i, attempt) -> { sig?, options, correctIndex, mainImage, text?, tag?, memory? }
// Aynı "sig" (imza) ikinci kez gelirse farklı tohumla yeniden dener.
// ---------------------------------------------------------------------------
export const buildUniqueList = (key, count, gen, maxTries = 30) => {
  const seen = new Set(); const out = [];
  for (let i = 0; i < count; i++) {
    let t = null;
    for (let a = 0; a < maxTries; a++) {
      const cand = gen(key, i + a * 100003, i);
      if (!cand) continue;
      if (!cand.sig || !seen.has(cand.sig)) { t = cand; break; }
      t = cand; // son çare: tekrar da olsa kullan
    }
    if (t?.sig) seen.add(t.sig);
    // doğru şık konumunu i'ye göre dengele (yeniden denemelerde bozulmasın)
    if (t && t.correctIndex !== undefined && !t.keepSlot) {
      const n = t.options.length;
      const want = slotFor(key, i, n);
      if (want !== t.correctIndex) {
        const opts = [...t.options]; const c = opts.splice(t.correctIndex, 1)[0]; opts.splice(want, 0, c);
        t = { ...t, options: opts, correctIndex: want };
      }
    }
    out.push(t);
  }
  return out;
};
