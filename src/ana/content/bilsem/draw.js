// ============================================================================
// --- BİLSEM SORULARI: ORTAK ÇİZİM PARÇALARI ---
// ============================================================================
// Basit geometrik şekiller, izometrik küp, ızgara (tablo) ve çocuk dostu nesne listeleri.

import { ART, card, put, OL, S, SN, lighten, darken } from '../art';
import { txt } from '../helpers';

// Okul öncesi için kolay ayırt edilen renkler
export const COLORS = [
  { id: 'kirmizi', hex: '#ef4444' },
  { id: 'mavi', hex: '#3b82f6' },
  { id: 'sari', hex: '#facc15' },
  { id: 'yesil', hex: '#22c55e' },
  { id: 'mor', hex: '#a855f7' },
  { id: 'turuncu', hex: '#f97316' }
];
export const HEX = COLORS.map(c => c.hex);

export const SHAPE_IDS = ['daire', 'kare', 'ucgen', 'yildiz', 'kalp', 'esken'];

const starPts = (cx, cy, R, r, n = 5, rot = -90) => {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const rad = i % 2 === 0 ? R : r; const a = (rot + (i * 180) / n) * Math.PI / 180; pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`); }
  return pts.join(' ');
};

// 100x100 kutuda, merkez (50,50) şekil
export const shapeInner = (id, color, sw = 3) => {
  const st = `stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"`;
  switch (id) {
    case 'daire': return `<circle cx="50" cy="50" r="34" fill="${color}" ${st}/>`;
    case 'kare': return `<rect x="17" y="17" width="66" height="66" rx="4" fill="${color}" ${st}/>`;
    case 'ucgen': return `<polygon points="50,12 88,84 12,84" fill="${color}" ${st}/>`;
    case 'yildiz': return `<polygon points="${starPts(50, 53, 40, 17)}" fill="${color}" ${st}/>`;
    case 'kalp': return `<path d="M50,86 C18,64 10,44 18,30 C26,15 46,17 50,32 C54,17 74,15 82,30 C90,44 82,64 50,86 Z" fill="${color}" ${st}/>`;
    case 'esken': return `<polygon points="50,10 88,50 50,90 12,50" fill="${color}" ${st}/>`;
    case 'ok': return `<path d="M14,40 L58,40 L58,22 L88,50 L58,78 L58,60 L14,60 Z" fill="${color}" ${st}/>`;
    case 'damla': return `<path d="M50,10 C66,36 80,52 80,64 C80,82 66,92 50,92 C34,92 20,82 20,64 C20,52 34,36 50,10 Z" fill="${color}" ${st}/>`;
    case 'yarimay': return `<path d="M62,12 C34,16 22,40 26,60 C30,80 50,92 70,88 C46,80 38,58 44,40 C48,28 54,18 62,12 Z" fill="${color}" ${st}/>`;
    default: return `<circle cx="50" cy="50" r="34" fill="${color}" ${st}/>`;
  }
};
// Bir şekli (cx,cy) merkezine boyut s ile yerleştir
export const shapeAt = (id, color, cx, cy, s = 1, rot = 0, flip = false) => put(shapeInner(id, color), cx, cy, s, rot, flip);

// Boş kutu (soru işaretli)
export const qBox = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="3" stroke-dasharray="7 5"/>${txt(x + w / 2, y + h / 2 + 1, '?', Math.min(w, h) * 0.55, '#d97706')}`;
export const cellBox = (x, y, w, h, fill = '#fff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="#cbd5e1" stroke-width="2.5"/>`;

// Tablo (matris) çiz: cells[r][c] = içerik çizimi (100x100) ya da null (soru)
export const matrixSvg = (cells, cell = 86, gap = 8) => {
  const R = cells.length, C = cells[0].length;
  const W = C * cell + (C - 1) * gap + 24, H = R * cell + (R - 1) * gap + 24;
  let s = `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="14" fill="#f1f5f9" stroke="#6366f1" stroke-width="3"/>`;
  cells.forEach((row, r) => row.forEach((inner, c) => {
    const x = 12 + c * (cell + gap), y = 12 + r * (cell + gap);
    if (inner === null) s += qBox(x, y, cell, cell);
    else s += cellBox(x, y, cell, cell) + put(inner, x + cell / 2, y + cell / 2, cell / 100 * 0.86);
  }));
  return card(s, { w: W, h: H, bg: '#ffffff' });
};

// Yatay sıra (örüntü / dizi): items = çizim listesi, null = soru kutusu
export const rowSvg = (items, cell = 70, gap = 8, bg = '#f8fafc') => {
  const n = items.length; const W = n * cell + (n - 1) * gap + 20, H = cell + 20;
  let s = '';
  items.forEach((inner, j) => {
    const x = 10 + j * (cell + gap), y = 10;
    if (inner === null) s += qBox(x, y, cell, cell);
    else s += cellBox(x, y, cell, cell) + put(inner, x + cell / 2, y + cell / 2, cell / 100 * 0.84);
  });
  return card(s, { w: W, h: H, bg });
};

// Şık olarak bir dizi (ör. kod, sıra): küçük kutular yan yana
export const seqOption = (items, cell = 56, gap = 4) => {
  const n = items.length; const W = n * cell + (n - 1) * gap + 12, H = cell + 12;
  let s = '';
  items.forEach((inner, j) => { const x = 6 + j * (cell + gap); s += `<rect x="${x}" y="6" width="${cell}" height="${cell}" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="2"/>` + put(inner, x + cell / 2, 6 + cell / 2, cell / 100 * 0.84); });
  return card(s, { w: W, h: H });
};

// --- İZOMETRİK KÜP ---
// (gx, gy, gz) -> ekranda bir küp; gx sağa-aşağı, gy sola-aşağı, gz yukarı
export const isoCube = (ox, oy, gx, gy, gz, color, u = 20) => {
  const x = ox + (gx - gy) * u * 0.866, y = oy + (gx + gy) * u * 0.5 - gz * u;
  const top = `${x},${y - u} ${x + u * 0.866},${y - u * 0.5} ${x},${y} ${x - u * 0.866},${y - u * 0.5}`;
  const left = `${x - u * 0.866},${y - u * 0.5} ${x},${y} ${x},${y + u} ${x - u * 0.866},${y + u * 0.5}`;
  const right = `${x},${y} ${x + u * 0.866},${y - u * 0.5} ${x + u * 0.866},${y + u * 0.5} ${x},${y + u}`;
  return `<polygon points="${top}" fill="${lighten(color, 0.35)}" stroke="${OL}" stroke-width="1.8" stroke-linejoin="round"/><polygon points="${left}" fill="${color}" stroke="${OL}" stroke-width="1.8" stroke-linejoin="round"/><polygon points="${right}" fill="${darken(color, 0.22)}" stroke="${OL}" stroke-width="1.8" stroke-linejoin="round"/>`;
};
// cubes: [{x,y,z,color}] -> doğru çizim sırasıyla (arkadan öne, aşağıdan yukarı)
export const isoScene = (cubes, ox, oy, u = 20) => [...cubes]
  .sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.z - b.z || a.x - b.x)
  .map(c => isoCube(ox, oy, c.x, c.y, c.z, c.color, u)).join('');

// --- Okul öncesi çocuk dostu nesneler (ART kütüphanesinden) ---
export const OBJ = ['apple', 'ball', 'star', 'heart', 'fish', 'balloon', 'car', 'flower', 'duck', 'cat', 'butterfly', 'mushroom', 'cup', 'chick', 'strawberry', 'leaf', 'umbrella', 'teddy', 'kite', 'orange', 'bird', 'giftBox', 'frog', 'rabbit', 'icecream', 'lollipop', 'house', 'tree', 'sun', 'moon', 'dog', 'turtle', 'snail', 'boat', 'bus', 'truck', 'airplane', 'rocket', 'carrot', 'banana', 'cake', 'clock', 'key', 'bell', 'drum', 'book', 'pencil', 'shoe', 'sock', 'shirt'];
// Rengi değiştirilebilen nesneler
export const COLORABLE = ['ball', 'star', 'heart', 'fish', 'balloon', 'umbrella', 'cup', 'book', 'car', 'flower', 'butterfly', 'shirt', 'sock', 'shoe', 'kite', 'boat', 'giftBox', 'truck', 'bus', 'house', 'drum', 'clock'];
// Sağa bakan (yansıması farklı görünen) nesneler
export const FACING = ['fish', 'duck', 'car', 'bird', 'snail', 'turtle', 'truck', 'bus', 'airplane', 'elephant', 'sheep', 'boat'];
export const obj = (k, c) => ART[k](COLORABLE.includes(k) ? c : undefined, {});
export const objKey = (k, c) => (COLORABLE.includes(k) ? `${k}:${c}` : k);
export { ART, card, put, OL, S, SN, lighten, darken, txt };
