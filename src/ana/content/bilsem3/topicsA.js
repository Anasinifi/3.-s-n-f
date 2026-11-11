// ============================================================================
// --- BİLSEM: PERSPEKTİF · PARÇA-BÜTÜN · YANSIMA · BENZEŞİM ---
// ============================================================================
import { makeRng, shuffle, pick, randInt, COLS, INK, n2, box, shape, text, qmark, arrowLine, eyeArrow, build, capped, SHAPES, ASYM } from './core';

// ---------------------------------------------------------------------------
// PERSPEKTİF 1: üst üste diskler (halkalar) -> yukarıdan görünüş
// ---------------------------------------------------------------------------
const towerSide = (discs) => {
  const W = 140, H = 140; const base = 118; const dh = 14; let s = '';
  s += `<ellipse cx="70" cy="${base + 4}" rx="62" ry="9" fill="#e2e8f0"/>`;
  discs.forEach((d, i) => {
    const y = base - i * dh; const rx = d.r * 1.1, ry = rx * 0.28;
    s += `<path d="M${n2(70 - rx)},${n2(y)} L${n2(70 - rx)},${n2(y - dh)} A${n2(rx)},${n2(ry)} 0 0 1 ${n2(70 + rx)},${n2(y - dh)} L${n2(70 + rx)},${n2(y)} A${n2(rx)},${n2(ry)} 0 0 1 ${n2(70 - rx)},${n2(y)} Z" fill="${d.c}" stroke="${INK}" stroke-width="1.5"/>`;
    s += `<ellipse cx="70" cy="${n2(y - dh)}" rx="${n2(rx)}" ry="${n2(ry)}" fill="${d.c}" stroke="${INK}" stroke-width="1.5" style="filter:brightness(1.15)"/>`;
  });
  const top = base - discs.length * dh - 14;
  s += eyeArrow(70, Math.max(8, top), 'down');
  return box(s, W, H);
};
const topView = (order) => { // order: çizim sırası (alttan üste)
  let s = ''; order.forEach(d => { s += `<circle cx="50" cy="50" r="${n2(d.r * 0.8)}" fill="${d.c}" stroke="${INK}" stroke-width="1.8"/>`; });
  return box(s);
};
const visibleSig = (order) => { // gerçekten görünen halkalar (dıştan içe)
  const vis = []; let maxAbove = 0;
  for (let i = order.length - 1; i >= 0; i--) { if (order[i].r > maxAbove) { vis.push(order[i]); maxAbove = order[i].r; } }
  return vis.reverse().map(d => d.c + d.r).join('|');
};
export const perDisc = (n) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const cols = shuffle(COLS, rng).slice(0, n);
  const radii = shuffle([18, 26, 34, 42, 50, 58].slice(0, n + 1), rng).slice(0, n);
  const discs = cols.map((c, i) => ({ c, r: radii[i] }));
  const opt = (order) => ({ k: visibleSig(order), img: topView(order) });
  const correct = opt(discs);
  const wrongs = [opt([...discs].reverse()), opt([...discs].sort((a, b) => b.r - a.r))];
  for (let t = 0; t < 6; t++) { const i = randInt(rng, 0, n - 1), j = randInt(rng, 0, n - 1); if (i === j) continue; const sw = discs.map(d => ({ ...d })); [sw[i].c, sw[j].c] = [sw[j].c, sw[i].c]; wrongs.push(opt(sw)); }
  return build({ sig: 'PD' + discs.map(d => d.c + d.r).join(), text: 'Cisme ok yönünden (yukarıdan) bakılınca nasıl görünür?', main: towerSide(discs), correct, wrongs: shuffle(wrongs, rng) });
}, 999);

// ---------------------------------------------------------------------------
// PERSPEKTİF 2: renkli küp kuleleri -> önden / sağdan / üstten görünüş
// ---------------------------------------------------------------------------
// grid[d][i] = [renkler (alttan üste)] ; d: 0 = ön sıra
const S = 22; // küp kenarı (ön görünüş)
const cubeAt = (ox, oy, i, d, z, c) => {
  const x = ox + i * S + d * S * 0.5, y = oy - z * S - d * S * 0.5;
  const dk = 'rgba(0,0,0,0.22)', lt = 'rgba(255,255,255,0.35)';
  return `<rect x="${n2(x)}" y="${n2(y - S)}" width="${S}" height="${S}" fill="${c}" stroke="${INK}" stroke-width="1.2"/>`
    + `<polygon points="${n2(x)},${n2(y - S)} ${n2(x + S * 0.5)},${n2(y - S * 1.5)} ${n2(x + S * 1.5)},${n2(y - S * 1.5)} ${n2(x + S)},${n2(y - S)}" fill="${c}" stroke="${INK}" stroke-width="1.2"/><polygon points="${n2(x)},${n2(y - S)} ${n2(x + S * 0.5)},${n2(y - S * 1.5)} ${n2(x + S * 1.5)},${n2(y - S * 1.5)} ${n2(x + S)},${n2(y - S)}" fill="${lt}"/>`
    + `<polygon points="${n2(x + S)},${n2(y)} ${n2(x + S)},${n2(y - S)} ${n2(x + S * 1.5)},${n2(y - S * 1.5)} ${n2(x + S * 1.5)},${n2(y - S * 0.5)}" fill="${c}" stroke="${INK}" stroke-width="1.2"/><polygon points="${n2(x + S)},${n2(y)} ${n2(x + S)},${n2(y - S)} ${n2(x + S * 1.5)},${n2(y - S * 1.5)} ${n2(x + S * 1.5)},${n2(y - S * 0.5)}" fill="${dk}"/>`;
};
export const drawCubes = (grid) => {
  const D = grid.length, W = grid[0].length; const H = Math.max(...grid.flat().map(c => c.length));
  const w = W * S + D * S * 0.5 + 40, h = H * S + D * S * 0.5 + 44;
  const ox = 18, oy = h - 14; let s = '';
  for (let d = D - 1; d >= 0; d--) for (let z = 0; z < H; z++) for (let i = 0; i < W; i++) { const col = grid[d][i]; if (col[z]) s += cubeAt(ox, oy, i, d, z, col[z]); }
  return box(s, w, h);
};
const viewGrid = (cells, cols, rows) => { // cells[row][col] = renk|null (row 0 = üst)
  const c = 22; const w = cols * c + 20, h = rows * c + 20; let s = '';
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { const col = cells[r][k]; if (col) s += `<rect x="${10 + k * c}" y="${10 + r * c}" width="${c}" height="${c}" fill="${col}" stroke="${INK}" stroke-width="1.4"/>`; }
  return box(s, Math.max(w, 60), Math.max(h, 60));
};
const views = (grid) => {
  const D = grid.length, W = grid[0].length; const H = Math.max(...grid.flat().map(c => c.length));
  const front = Array.from({ length: H }, (_, r) => Array.from({ length: W }, (_, i) => { const z = H - 1 - r; for (let d = 0; d < D; d++) if (grid[d][i][z]) return grid[d][i][z]; return null; }));
  const back = Array.from({ length: H }, (_, r) => Array.from({ length: W }, (_, k) => { const i = W - 1 - k; const z = H - 1 - r; for (let d = D - 1; d >= 0; d--) if (grid[d][i][z]) return grid[d][i][z]; return null; }));
  const right = Array.from({ length: H }, (_, r) => Array.from({ length: D }, (_, d) => { const z = H - 1 - r; for (let i = W - 1; i >= 0; i--) if (grid[d][i][z]) return grid[d][i][z]; return null; }));
  const left = Array.from({ length: H }, (_, r) => Array.from({ length: D }, (_, k) => { const d = D - 1 - k; const z = H - 1 - r; for (let i = 0; i < W; i++) if (grid[d][i][z]) return grid[d][i][z]; return null; }));
  const top = Array.from({ length: D }, (_, r) => Array.from({ length: W }, (_, i) => { const d = D - 1 - r; const col = grid[d][i]; return col.length ? col[col.length - 1] : null; }));
  return { front: [front, W, H], back: [back, W, H], right: [right, D, H], left: [left, D, H], top: [top, W, D] };
};
const gsig = (cells) => cells.map(r => r.map(c => (c ? c.slice(1, 4) : '-')).join('')).join('/');
export const perCubes = (dir, W, D, maxH) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const pal = shuffle(COLS, rng).slice(0, 4);
  const grid = Array.from({ length: D }, () => Array.from({ length: W }, () => Array.from({ length: randInt(rng, 1, maxH) }, () => pick(pal, rng))));
  const V = views(grid);
  const mk = ([cells, c, r]) => ({ k: gsig(cells), img: viewGrid(cells, c, r) });
  const correct = mk(V[dir]);
  const others = Object.keys(V).filter(k => k !== dir && V[k][1] === V[dir][1] && V[k][2] === V[dir][2]).map(k => mk(V[k]));
  // bir küpü değiştir (yakın çeldirici)
  const alt = () => { const [cells, c, r] = V[dir]; const cp = cells.map(row => [...row]); const filled = []; cp.forEach((row, ri) => row.forEach((x, ci) => x && filled.push([ri, ci]))); const [ri, ci] = pick(filled, rng); cp[ri][ci] = pick(pal.filter(p => p !== cp[ri][ci]), rng); return mk([cp, c, r]); };
  const mirror = () => { const [cells, c, r] = V[dir]; return mk([cells.map(row => [...row].reverse()), c, r]); };
  const wrongs = [...shuffle(others, rng), mirror(), alt(), alt(), alt()];
  const T = { front: 'Küplere ÖNDEN bakılınca nasıl görünür?', right: 'Küplere SAĞDAN bakılınca nasıl görünür?', top: 'Küplere ÜSTTEN bakılınca nasıl görünür?' };
  return build({ sig: 'PC' + dir + JSON.stringify(grid), text: T[dir], main: drawCubes(grid), correct, wrongs: [...wrongs.slice(0, 2), ...shuffle(wrongs.slice(2), rng)] });
}, 999);

// ---------------------------------------------------------------------------
// PARÇA - BÜTÜN: tekrarlayan desenden eksik parça
// ---------------------------------------------------------------------------
const TILE = 24;
const tileSvg = (type, st, x, y, P) => {
  const t = TILE; const [bg, c1, c2] = P; const r = st.r % 4; const cx = x + t / 2, cy = y + t / 2;
  const rotg = (inner) => `<g transform="rotate(${r * 90} ${n2(cx)} ${n2(cy)})">${inner}</g>`;
  const fillc = st.c ? c2 : c1;
  switch (type) {
    case 'tri': return rotg(`<rect x="${x}" y="${y}" width="${t}" height="${t}" fill="${bg}"/><polygon points="${x},${y} ${x + t},${y} ${x},${y + t}" fill="${fillc}"/>`);
    case 'arc': return `<rect x="${x}" y="${y}" width="${t}" height="${t}" fill="${bg}"/>` + rotg(`<path d="M${x + t / 2},${y} A${t / 2},${t / 2} 0 0 1 ${x},${y + t / 2} M${x + t},${y + t / 2} A${t / 2},${t / 2} 0 0 0 ${x + t / 2},${y + t}" fill="none" stroke="${fillc}" stroke-width="4"/>`);
    case 'qc': return rotg(`<rect x="${x}" y="${y}" width="${t}" height="${t}" fill="${bg}"/><path d="M${x},${y} L${x + t},${y} A${t},${t} 0 0 1 ${x},${y + t} Z" fill="${fillc}"/>`);
    case 'stripe': return rotg(`<rect x="${x}" y="${y}" width="${t}" height="${t}" fill="${bg}"/><rect x="${x}" y="${y + 3}" width="${t}" height="5" fill="${fillc}"/><rect x="${x}" y="${y + 15}" width="${t}" height="5" fill="${fillc}"/>`);
    case 'half': return rotg(`<rect x="${x}" y="${y}" width="${t}" height="${t}" fill="${bg}"/><rect x="${x}" y="${y}" width="${t / 2}" height="${t}" fill="${fillc}"/>`);
    case 'dot': return `<rect x="${x}" y="${y}" width="${t}" height="${t}" fill="${bg}"/>` + rotg(`<circle cx="${x + t * 0.3}" cy="${y + t * 0.3}" r="${t * 0.22}" fill="${fillc}"/>`);
    case 'chev': return rotg(`<rect x="${x}" y="${y}" width="${t}" height="${t}" fill="${bg}"/><polyline points="${x},${y + t * 0.7} ${x + t / 2},${y + t * 0.25} ${x + t},${y + t * 0.7}" fill="none" stroke="${fillc}" stroke-width="5"/>`);
    default: return '';
  }
};
const TYPES = ['tri', 'arc', 'qc', 'stripe', 'half', 'dot', 'chev'];
const PALS = [['#fefce8', '#1e293b', '#dc2626'], ['#ecfeff', '#0e7490', '#f59e0b'], ['#fdf2f8', '#9d174d', '#16a34a'], ['#f8fafc', '#111827', '#2563eb'], ['#f0fdf4', '#166534', '#7c3aed'], ['#fff7ed', '#c2410c', '#1e3a8a'], ['#1e293b', '#facc15', '#f472b6'], ['#0f172a', '#38bdf8', '#f8fafc']];
export const partWhole = (pw, ph, mixTypes) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const types = mixTypes ? shuffle(TYPES, rng).slice(0, 2) : [pick(TYPES, rng)];
  const P = pick(PALS, rng);
  const motif = Array.from({ length: ph }, () => Array.from({ length: pw }, () => ({ type: pick(types, rng), r: randInt(rng, 0, 3), c: randInt(rng, 0, 1) })));
  const GW = 8, GH = 5;
  const at = (x, y) => motif[y % ph][x % pw];
  const hx = randInt(rng, 1, GW - 3), hy = randInt(rng, 1, GH - 3);
  let s = '';
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const m = at(x, y); s += tileSvg(m.type, m, 6 + x * TILE, 6 + y * TILE, P); }
  s += `<rect x="${6 + hx * TILE}" y="${6 + hy * TILE}" width="${TILE * 2}" height="${TILE * 2}" fill="#fff" stroke="${INK}" stroke-width="2"/>` + qmark(6 + hx * TILE + TILE, 6 + hy * TILE + TILE, 26);
  const main = box(s, GW * TILE + 12, GH * TILE + 12);
  const blockAt = (bx, by, tweak) => {
    const cells = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([dx, dy]) => ({ ...at(bx + dx, by + dy) }));
    if (tweak) tweak(cells);
    const k = cells.map(c => c.type + (c.type === 'arc' ? c.r % 2 : c.r) + c.c).join(',');
    let inner = ''; cells.forEach((c, j) => { inner += tileSvg(c.type, c, 4 + (j % 2) * TILE, 4 + Math.floor(j / 2) * TILE, P); });
    return { k, img: box(inner, TILE * 2 + 8, TILE * 2 + 8) };
  };
  const correct = blockAt(hx, hy);
  const wrongs = [];
  [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]].forEach(([dx, dy]) => wrongs.push(blockAt(hx + dx, hy + dy)));
  wrongs.push(blockAt(hx, hy, (cs) => { const j = randInt(rng, 0, 3); cs[j].r = (cs[j].r + 1) % 4; }));
  wrongs.push(blockAt(hx, hy, (cs) => { const j = randInt(rng, 0, 3); cs[j].c = 1 - cs[j].c; }));
  wrongs.push(blockAt(hx, hy, (cs) => { [cs[0], cs[1]] = [cs[1], cs[0]]; }));
  return build({ sig: 'PW' + JSON.stringify(motif) + P[0] + hx + hy, text: 'Desende soru işaretli yere hangi parça gelmelidir?', main, correct, wrongs: shuffle(wrongs, rng) });
}, 999);

// ---------------------------------------------------------------------------
// YANSIMA
// ---------------------------------------------------------------------------
const compo = (rng, n) => Array.from({ length: n }, () => ({ t: pick([...ASYM, ...ASYM, 'triangle', 'circle', 'square'], rng), x: randInt(rng, 20, 80), y: randInt(rng, 20, 80), r: randInt(rng, 9, 15), c: pick(COLS, rng), rot: pick([0, 90, 180, 270], rng) }));
const drawCompo = (items, tf = '') => `<g transform="${tf}">${items.map(it => shape(it.t, it.x, it.y, it.r, it.c, { rot: it.rot })).join('')}</g>`;
const TF = { id: '', h: 'translate(100 0) scale(-1 1)', v: 'translate(0 100) scale(1 -1)', r: 'translate(100 100) scale(-1 -1)' };
export const mirrorCompo = (axis, n) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  let items = compo(rng, n); if (!items.some(i => ASYM.includes(i.t))) items[0].t = 'flag';
  const opt = (k) => ({ k, img: box(drawCompo(items, TF[k])) });
  const want = axis === 'h' ? 'h' : 'v';
  const line = axis === 'h' ? `<line x1="104" y1="6" x2="104" y2="94" stroke="#0ea5e9" stroke-width="4"/>` : `<line x1="6" y1="104" x2="94" y2="104" stroke="#0ea5e9" stroke-width="4"/>`;
  const main = box(`${drawCompo(items)}${line}`, axis === 'h' ? 112 : 100, axis === 'h' ? 100 : 112);
  return build({ sig: 'MC' + axis + JSON.stringify(items), text: axis === 'h' ? 'Şeklin aynadaki (mavi çizgi) görüntüsü hangisidir?' : 'Şeklin sudaki görüntüsü hangisidir?', main, correct: opt(want), wrongs: shuffle(['id', 'h', 'v', 'r'].filter(k => k !== want).map(opt), rng) });
}, 999);
// Sıra halinde nesneler / kelime: aynada sıra da TERS döner, her biri de çevrilir
const WORDS = ['BALIK', 'KALEM', 'SINIF', 'KİTAP', 'ÇİÇEK', 'GÜNEŞ', 'BULUT', 'ELMA', 'OKUL', 'ARABA', 'KEDİ', 'ŞEKER', 'RENK', 'BEYAZ', 'ZEKİ', 'NEŞE', 'FİL', 'PERİ', 'GEMİ', 'SÜT', 'KUZU', 'ROBOT', 'KAPLAN', 'ZEBRA', 'DENİZ', 'YILDIZ'];
const rowOf = (items, { rev = false, flip = false }) => {
  const n = items.length; const cw = 28; const W = n * cw + 16; let s = '';
  const seq = rev ? [...items].reverse() : items;
  seq.forEach((it, k) => {
    const cx = 8 + k * cw + cw / 2;
    const tf = flip ? ` transform="translate(${n2(2 * cx)} 0) scale(-1 1)"` : '';
    s += `<rect x="${n2(cx - 12)}" y="10" width="24" height="30" rx="4" fill="${it.bg}" stroke="${INK}" stroke-width="1.5"/>`;
    s += it.ch ? `<g${tf}>${text(cx, 26, it.ch, 22, it.fg)}</g>` : `<g${tf}>${shape(it.t, cx, 25, 10, it.fg, { rot: it.rot })}</g>`;
  });
  return box(s, W, 50);
};
export const mirrorRow = (kind) => capped((key, seed, pos) => {
  const rng = makeRng(key, seed);
  let items;
  if (kind === 'word') { const w = WORDS[(pos ?? seed) % WORDS.length]; items = [...w].map(ch => ({ ch, fg: pick(COLS, rng), bg: '#fffbeb' })); }
  else if (kind === 'digit') { const d = shuffle('123456789'.split(''), rng).slice(0, randInt(rng, 4, 5)); items = d.map(ch => ({ ch, fg: pick(COLS, rng), bg: '#f0f9ff' })); }
  else { items = Array.from({ length: randInt(rng, 4, 5) }, () => ({ t: pick(ASYM, rng), rot: pick([0, 90, 180, 270], rng), fg: pick(COLS, rng), bg: '#f8fafc' })); }
  const sym = (it) => it.ch && 'AHIİMOTUVWXY018'.includes(it.ch);
  if (kind !== 'shape' && items.every(sym)) return null;
  const opt = (rev, flip) => ({ k: `${rev}${flip}`, img: rowOf(items, { rev, flip }) });
  const W = items.length * 28 + 16;
  const main = box(`${(() => { let s = ''; items.forEach((it, k) => { const cx = 8 + k * 28 + 14; s += `<rect x="${n2(cx - 12)}" y="10" width="24" height="30" rx="4" fill="${it.bg}" stroke="${INK}" stroke-width="1.5"/>` + (it.ch ? text(cx, 26, it.ch, 22, it.fg) : shape(it.t, cx, 25, 10, it.fg, { rot: it.rot })); }); return s; })()}<line x1="${W + 2}" y1="4" x2="${W + 2}" y2="46" stroke="#0ea5e9" stroke-width="4"/>`, W + 8, 50);
  return build({ sig: 'MR' + kind + JSON.stringify(items), text: kind === 'word' ? 'Kelimenin aynadaki görüntüsü hangisidir?' : 'Sıranın aynadaki görüntüsü hangisidir?', main, correct: opt(true, true), wrongs: shuffle([opt(true, false), opt(false, true), opt(false, false)], rng) });
}, 999);

// ---------------------------------------------------------------------------
// BENZEŞİM
// ---------------------------------------------------------------------------
// [A, B, C, D, [3 çeldirici]] : A ile B arasındaki ilişki, C ile ? arasında da olmalı
// her öğe: [emoji, tarif]
export const ANALOGIES = [
  [['🔥', 'Yanan ateş'], ['🍳', 'Ocakta tava'], ['🧊', 'Buz küpleri'], ['🧃', 'Soğuk içecek kutusu'], [['💨', 'Rüzgâr'], ['🌋', 'Yanardağ'], ['☀️', 'Güneş']]],
  [['🚒', 'İtfaiye aracı'], ['👨‍🚒', 'İtfaiyeci'], ['🚑', 'Ambulans'], ['👩‍⚕️', 'Doktor'], [['👮', 'Polis'], ['👩‍🏫', 'Öğretmen'], ['👨‍🍳', 'Aşçı']]],
  [['🐝', 'Arı'], ['🍯', 'Bal kavanozu'], ['🐄', 'İnek'], ['🥛', 'Bir bardak süt'], [['🧀', 'Peynir dilimi'], ['🌾', 'Buğday başağı'], ['🥚', 'Yumurta']]],
  [['✋', 'El'], ['🧤', 'Eldiven'], ['🦶', 'Ayak'], ['🧦', 'Çorap'], [['👒', 'Şapka'], ['🧣', 'Atkı'], ['💍', 'Yüzük']]],
  [['🐟', 'Balık'], ['🌊', 'Deniz dalgası'], ['🐦', 'Kuş'], ['☁️', 'Bulutlu gökyüzü'], [['🌳', 'Ağaç'], ['🪺', 'Kuş yuvası'], ['🌾', 'Tarla']]],
  [['🌧️', 'Yağmur bulutu'], ['☂️', 'Şemsiye'], ['☀️', 'Parlayan güneş'], ['🕶️', 'Güneş gözlüğü'], [['🧥', 'Palto'], ['🧤', 'Eldiven'], ['🌂', 'Kapalı şemsiye']]],
  [['🌱', 'Fidan'], ['🌳', 'Büyük ağaç'], ['🐣', 'Yumurtadan çıkan civciv'], ['🐔', 'Tavuk'], [['🦆', 'Ördek'], ['🥚', 'Yumurta'], ['🐤', 'Civciv']]],
  [['👟', 'Spor ayakkabı'], ['🦶', 'Ayak'], ['🎩', 'Silindir şapka'], ['🙂', 'Gülen yüz (baş)'], [['✋', 'El'], ['👁️', 'Göz'], ['👂', 'Kulak']]],
  [['🚗', 'Araba'], ['🛣️', 'Otoyol'], ['🚢', 'Gemi'], ['🌊', 'Deniz'], [['⚓', 'Çapa'], ['🏝️', 'Ada'], ['🚤', 'Sürat teknesi']]],
  [['✏️', 'Kurşun kalem'], ['📄', 'Kâğıt'], ['🖌️', 'Boya fırçası'], ['🖼️', 'Resim tuvali'], [['🎨', 'Boya paleti'], ['✂️', 'Makas'], ['📏', 'Cetvel']]],
  [['🐶', 'Köpek'], ['🦴', 'Kemik'], ['🐰', 'Tavşan'], ['🥕', 'Havuç'], [['🍖', 'Et'], ['🧀', 'Peynir'], ['🐟', 'Balık']]],
  [['🐵', 'Maymun'], ['🍌', 'Muz'], ['🐭', 'Fare'], ['🧀', 'Peynir'], [['🥕', 'Havuç'], ['🦴', 'Kemik'], ['🍯', 'Bal']]],
  [['🕷️', 'Örümcek'], ['🕸️', 'Örümcek ağı'], ['🐦', 'Kuş'], ['🪺', 'Kuş yuvası'], [['🌳', 'Ağaç'], ['🥚', 'Yumurta'], ['🪶', 'Tüy']]],
  [['📚', 'Kitaplar'], ['🏫', 'Okul'], ['💊', 'İlaç'], ['🏥', 'Hastane'], [['🏪', 'Market'], ['🏦', 'Banka'], ['🏠', 'Ev']]],
  [['❄️', 'Kar tanesi'], ['⛄', 'Kardan adam'], ['🏖️', 'Kum (plaj)'], ['🏰', 'Kumdan kale'], [['☀️', 'Güneş'], ['🐚', 'Deniz kabuğu'], ['🌴', 'Palmiye']]],
  [['🔑', 'Anahtar'], ['🔒', 'Kilit'], ['⚽', 'Futbol topu'], ['🥅', 'Kale ağı'], [['👟', 'Krampon'], ['🏆', 'Kupa'], ['🏀', 'Basketbol topu']]],
  [['🐄', 'İnek'], ['🐮', 'Buzağı (yavru inek)'], ['🐔', 'Tavuk'], ['🐤', 'Civciv'], [['🥚', 'Yumurta'], ['🦆', 'Ördek'], ['🌽', 'Mısır']]],
  [['🌙', 'Ay'], ['🌃', 'Gece'], ['☀️', 'Güneş'], ['🏙️', 'Gündüz şehir'], [['⭐', 'Yıldız'], ['🌈', 'Gökkuşağı'], ['☁️', 'Bulut']]],
  [['🧑‍🌾', 'Çiftçi'], ['🚜', 'Traktör'], ['👨‍✈️', 'Pilot'], ['✈️', 'Uçak'], [['🚂', 'Tren'], ['🚲', 'Bisiklet'], ['🚁', 'Helikopter']]],
  [['🎻', 'Keman'], ['🎵', 'Müzik notası'], ['📖', 'Açık kitap'], ['🔤', 'Harfler'], [['✏️', 'Kalem'], ['🎨', 'Boya'], ['🔢', 'Sayılar']]],
  [['🍎', 'Elma'], ['🌳', 'Elma ağacı'], ['🍇', 'Üzüm salkımı'], ['🍃', 'Asma yaprağı (asma)'], [['🍷', 'Üzüm suyu'], ['🍒', 'Kiraz'], ['🍓', 'Çilek']]],
  [['🧄', 'Sarımsak'], ['⬜', 'Beyaz kare'], ['🍉', 'Karpuz (dışı yeşil)'], ['🟩', 'Yeşil kare'], [['🟥', 'Kırmızı kare'], ['🟦', 'Mavi kare'], ['🟪', 'Mor kare']]],
  [['🍋', 'Limon'], ['🟨', 'Sarı kare'], ['🍆', 'Patlıcan'], ['🟪', 'Mor kare'], [['🟩', 'Yeşil kare'], ['🟫', 'Kahverengi kare'], ['🟧', 'Turuncu kare']]],
  [['🦘', 'Kanguru (zıplar)'], ['🐸', 'Kurbağa (zıplar)'], ['🐟', 'Balık (yüzer)'], ['🐬', 'Yunus (yüzer)'], [['🦅', 'Kartal'], ['🐌', 'Salyangoz'], ['🐢', 'Kaplumbağa']]],
  [['🦅', 'Kartal (uçar)'], ['🦋', 'Kelebek (uçar)'], ['🐍', 'Yılan (sürünür)'], ['🐛', 'Tırtıl (sürünür)'], [['🐎', 'At'], ['🐦', 'Kuş'], ['🦘', 'Kanguru']]],
  [['🌡️', 'Termometre'], ['🤒', 'Ateşi olan çocuk'], ['⚖️', 'Terazi'], ['🍎', 'Tartılan elma'], [['📏', 'Cetvel'], ['⏰', 'Saat'], ['🧭', 'Pusula']]],
  [['⏰', 'Çalar saat'], ['🕐', 'Zaman (saat)'], ['📏', 'Cetvel'], ['📐', 'Uzunluk (ölçme)'], [['✂️', 'Makas'], ['🖊️', 'Kalem'], ['📎', 'Ataç']]],
  [['🐧', 'Penguen'], ['🧊', 'Buzul'], ['🐪', 'Deve'], ['🏜️', 'Çöl'], [['🌴', 'Palmiye'], ['🌊', 'Deniz'], ['🌲', 'Orman']]],
  [['🐊', 'Timsah'], ['🏞️', 'Bataklık / göl'], ['🐻‍❄️', 'Kutup ayısı'], ['🏔️', 'Karlı dağ'], [['🏜️', 'Çöl'], ['🌋', 'Yanardağ'], ['🏝️', 'Ada']]],
  [['🔬', 'Mikroskop'], ['🦠', 'Mikrop'], ['🔭', 'Teleskop'], ['🪐', 'Gezegen'], [['🌳', 'Ağaç'], ['🐜', 'Karınca'], ['📘', 'Kitap']]],
  [['📞', 'Telefon'], ['👂', 'Kulak'], ['📺', 'Televizyon'], ['👁️', 'Göz'], [['👃', 'Burun'], ['✋', 'El'], ['👄', 'Ağız']]],
  [['🌹', 'Gül'], ['👃', 'Burun (koklamak)'], ['🎶', 'Müzik'], ['👂', 'Kulak (dinlemek)'], [['👁️', 'Göz'], ['👅', 'Dil'], ['✋', 'El']]],
  [['🍦', 'Dondurma'], ['👅', 'Dil (tatmak)'], ['🌈', 'Gökkuşağı'], ['👁️', 'Göz (görmek)'], [['👂', 'Kulak'], ['👃', 'Burun'], ['✋', 'El']]],
  [['🪥', 'Diş fırçası'], ['🦷', 'Diş'], ['🪮', 'Tarak'], ['💇', 'Saç'], [['👁️', 'Göz'], ['🧴', 'Şampuan'], ['🧼', 'Sabun']]],
  [['🥚', 'Yumurta'], ['🍳', 'Tavada yumurta'], ['🌽', 'Mısır'], ['🍿', 'Patlamış mısır'], [['🥕', 'Havuç'], ['🌾', 'Buğday'], ['🥔', 'Patates']]],
  [['🌾', 'Buğday'], ['🍞', 'Ekmek'], ['🍇', 'Üzüm'], ['🧃', 'Meyve suyu'], [['🍓', 'Çilek'], ['🍰', 'Pasta'], ['🌳', 'Ağaç']]],
  [['🐑', 'Koyun'], ['🧶', 'Yün yumağı'], ['🐛', 'İpek böceği'], ['🧵', 'İpek iplik'], [['🦋', 'Kelebek'], ['🍃', 'Yaprak'], ['🐜', 'Karınca']]],
  [['🎂', 'Doğum günü pastası'], ['🕯️', 'Mum'], ['🎄', 'Yılbaşı ağacı'], ['⭐', 'Süs yıldızı'], [['🎁', 'Hediye'], ['🎅', 'Noel baba'], ['❄️', 'Kar tanesi']]],
  [['🚦', 'Trafik ışığı'], ['🚗', 'Araba'], ['🧭', 'Pusula'], ['⛵', 'Yelkenli'], [['🗺️', 'Harita'], ['🌊', 'Dalga'], ['⚓', 'Çapa']]],
  [['🥚', 'Yumurta'], ['🐍', 'Yılan'], ['🌰', 'Kestane (tohum)'], ['🌳', 'Kestane ağacı'], [['🍂', 'Kuru yaprak'], ['🐿️', 'Sincap'], ['🍄', 'Mantar']]],
  [['🐛', 'Tırtıl'], ['🦋', 'Kelebek'], ['🥚', 'Yumurta'], ['🐣', 'Civciv'], [['🐔', 'Tavuk'], ['🍳', 'Sahanda yumurta'], ['🧺', 'Sepet']]],
  [['🧱', 'Tuğla'], ['🏠', 'Ev'], ['🪵', 'Odun'], ['🪑', 'Tahta sandalye'], [['🪓', 'Balta'], ['🔥', 'Ateş'], ['🌳', 'Ağaç']]]
];
const EMO = 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif';
const em = (ch, x, y, s) => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" dominant-baseline="central" font-family="${EMO}">${ch}</text>`;
const emoCard = ([ch]) => box(em(ch, 50, 54, 62));
const anaMain = (A, B, C) => {
  const cell = (x, y, inner) => `<rect x="${x}" y="${y}" width="60" height="60" rx="8" fill="#fff" stroke="${INK}" stroke-width="2"/>${inner}`;
  let s = '';
  s += cell(10, 10, em(A[0], 40, 42, 40)) + arrowLine(78, 40, 112, 40, INK, 3) + cell(120, 10, em(B[0], 150, 42, 40));
  s += cell(10, 82, em(C[0], 40, 114, 40)) + arrowLine(78, 112, 112, 112, INK, 3) + cell(120, 82, text(150, 113, '?', 34, '#dc2626'));
  return box(s, 190, 152);
};
export const anaConcept = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const p = pos ?? seed;
  const q = ANALOGIES[Math.floor(p / 2) % ANALOGIES.length]; const flip = p % 2 === 1;
  const [A, B, C, D, ws] = flip ? [q[2], q[3], q[0], q[1], [q[4][0], q[4][1], q[4][2]]] : q;
  // ters sorulduğunda çeldiriciler: A'nın dünyasından (C ile ilgili ama ilişkisi yanlış) + B'ye benzemeyen
  const wrongs = flip ? [q[4][0], ...shuffle(ANALOGIES.filter(x => x !== q).flatMap(x => [x[1], x[3]]), rng).slice(0, 4)] : ws;
  const opt = (it) => ({ k: it[0], img: emoCard(it), name: it[1] });
  return build({ sig: 'AC' + A[0] + C[0], text: 'Birinci kutulardaki ilişkiye göre soru işaretli yere hangisi gelmelidir?', speak: 'İlk iki resim arasındaki ilişkiyi bul. Aynı ilişkiye göre soru işaretinin yerine hangisi gelir?', main: anaMain(A, B, C), correct: opt(D), wrongs: shuffle(wrongs.map(opt), rng) });
}, ANALOGIES.length * 2);

// Geometrik benzeşim: dış şekil + iç şekil + renkler; A -> B dönüşümü C'ye uygulanır
const fig = (f) => box(`${shape(f.o, 50, 50, 40, f.oc, { rot: f.or || 0 })}${f.i ? shape(f.i, 50 + (f.dx || 0), 52, f.big ? 22 : 15, f.ic, { rot: f.ir || 0 }) : ''}${f.dot ? `<circle cx="${f.dot === 1 ? 26 : 74}" cy="22" r="6" fill="${INK}"/>` : ''}`);
const SYM180 = ['square', 'hexagon', 'diamond', 'cross', 'circle'];
const rr = (t, r) => (SYM180.includes(t) ? 0 : (r || 0) % 360);
const fsig = (f) => [f.o, f.oc, rr(f.o, f.or), f.i || '-', f.i ? f.ic : '-', f.i ? rr(f.i, f.ir) : 0, f.i && f.big ? 1 : 0, f.dot || 0].join('.');
const TRANS = {
  swapCol: (f) => ({ ...f, oc: f.ic, ic: f.oc }),
  swapShape: (f) => ({ ...f, o: f.i, i: f.o }),
  turn: (f) => ({ ...f, or: ((f.or || 0) + 180) % 360, ir: ((f.ir || 0) + 180) % 360 }),
  grow: (f) => ({ ...f, big: !f.big }),
  dot: (f) => ({ ...f, dot: f.dot === 1 ? 2 : 1 }),
  drop: (f) => ({ ...f, i: null })
};
const TNAMES = Object.keys(TRANS);
export const anaShape = (steps) => capped((key, seed) => {
  const rng = makeRng(key, seed);
  const mk = () => { const sh = shuffle(['triangle', 'square', 'pentagon', 'hexagon', 'star', 'diamond', 'arrow', 'flag'], rng); const cs = shuffle(COLS, rng); return { o: sh[0], oc: cs[0], i: sh[1], ic: cs[1], or: 0, ir: 0, dot: randInt(rng, 0, 2) }; };
  const A = mk(); let C = mk();
  const tr = shuffle(TNAMES, rng).slice(0, steps);
  const apply = (f, list) => list.reduce((x, t) => TRANS[t](x), f);
  const B = apply(A, tr); const D = apply(C, tr);
  if (fsig(A) === fsig(B)) return null;
  const opt = (f) => ({ k: fsig(f), img: fig(f) });
  const others = TNAMES.filter(t => !tr.includes(t));
  const wrongs = [opt(C), ...tr.map(t => opt(apply(C, tr.filter(x => x !== t)))), ...others.map(t => opt(apply(C, [...tr.slice(1), t]))), ...others.map(t => opt(apply(D, [t])))];
  const main = (() => { const cell = (x, y, f) => `<g transform="translate(${x} ${y}) scale(0.6)">${shape(f.o, 50, 50, 40, f.oc, { rot: f.or || 0 })}${f.i ? shape(f.i, 50, 52, f.big ? 22 : 15, f.ic, { rot: f.ir || 0 }) : ''}${f.dot ? `<circle cx="${f.dot === 1 ? 26 : 74}" cy="22" r="6" fill="${INK}"/>` : ''}</g>`;
    return box(`${cell(10, 10, A)}${arrowLine(76, 40, 108, 40, INK, 3)}${cell(116, 10, B)}${cell(10, 82, C)}${arrowLine(76, 112, 108, 112, INK, 3)}${qmark(146, 112, 40)}`, 186, 152); })();
  return build({ sig: 'AS' + fsig(A) + fsig(C) + tr.join(), text: 'Birinci satırdaki değişim ikinci satırda da olursa soru işaretli yere hangisi gelir?', main, correct: opt(D), wrongs: shuffle(wrongs, rng) });
}, 999);
