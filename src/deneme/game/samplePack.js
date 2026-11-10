// ============================================================================
// --- GRUP: ÖRNEK DÜNYA PAKETİ + KARAKTER ŞABLONU ---
// ============================================================================
// "Örnek dünya ekle" butonu bu eşyaları yönetici eşyası olarak ekler.
// Resimler SVG olarak burada çizildi; siz aynısını PNG yükleyerek yaparsınız.
// Karakter parçaları 200x260'lık ŞABLON tuvaline çizildi: hepsi her karaktere oturur.

import { AVATAR_BOXES } from './catalog';

const INK = '#2b2233';
const svgUrl = (inner, w = 200, h = 260) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`)}`;

// --- karakter parçaları (şablon: 200x260) ---
const pirateTop = svgUrl(`
<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
<rect x="44" y="116" width="22" height="34" rx="10" fill="#f8fafc" transform="rotate(8 55 118)"/>
<rect x="134" y="116" width="22" height="34" rx="10" fill="#f8fafc" transform="rotate(-8 145 118)"/>
<path d="M62 132 Q62 112 82 112 L118 112 Q138 112 138 132 L138 190 L62 190 Z" fill="#f8fafc"/>
</g>
<g fill="#ef4444"><rect x="63" y="124" width="74" height="7"/><rect x="63" y="142" width="74" height="7"/><rect x="63" y="160" width="74" height="7"/><rect x="63" y="178" width="74" height="7"/></g>
<path d="M62 132 Q62 112 82 112 L92 112 L92 190 L62 190 Z M108 112 L118 112 Q138 112 138 132 L138 190 L108 190 Z" fill="#7c2d12" stroke="${INK}" stroke-width="3"/>
<rect x="62" y="176" width="76" height="10" fill="#1f2937" stroke="${INK}" stroke-width="2"/><rect x="94" y="174" width="12" height="14" rx="2" fill="#facc15" stroke="${INK}" stroke-width="2"/>`);

const pirateBottom = svgUrl(`
<path d="M66 184 L134 184 L130 232 L106 232 L100 204 L94 232 L70 232 Z" fill="#78350f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<rect x="76" y="206" width="12" height="12" fill="#a16207" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 2"/>
<path d="M70 228 L94 228 M106 228 L130 228" stroke="#fef3c7" stroke-width="4"/>`);

const pirateBoots = svgUrl(`
<g fill="#1f2937" stroke="${INK}" stroke-width="3" stroke-linejoin="round">
<path d="M72 214 L97 214 L98 248 L66 248 Q64 238 72 234 Z"/><path d="M103 214 L128 214 L134 234 Q136 240 134 248 L102 248 Z"/></g>
<path d="M72 220 L97 220 M103 220 L128 220" stroke="#facc15" stroke-width="3"/>`);

const pinkHair = svgUrl(`
<g fill="#f472b6" stroke="${INK}" stroke-width="3" stroke-linejoin="round">
<circle cx="44" cy="74" r="16"/><circle cx="156" cy="74" r="16"/>
<path d="M56 66 Q54 16 100 16 Q146 16 144 66 Q132 38 108 40 Q100 52 76 46 Q62 52 56 66 Z"/></g>
<circle cx="56" cy="62" r="6" fill="#facc15" stroke="${INK}" stroke-width="2"/><circle cx="144" cy="62" r="6" fill="#facc15" stroke="${INK}" stroke-width="2"/>`);

const vikingHat = svgUrl(`
<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
<path d="M54 30 Q30 22 32 2 Q46 16 62 18 Z" fill="#fef3c7"/><path d="M146 30 Q170 22 168 2 Q154 16 138 18 Z" fill="#fef3c7"/>
<path d="M56 50 Q56 10 100 10 Q144 10 144 50 Z" fill="#94a3b8"/><rect x="52" y="42" width="96" height="12" rx="6" fill="#a16207"/>
<path d="M100 10 L100 50" stroke-width="4"/></g>`, 200, 260);

// tam karakter (gövde + kafa, KIYAFETSİZ): şablon üstünde, kıyafetler otomatik oturur
const foxBase = svgUrl(`
<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
<path d="M150 200 Q190 170 182 120 Q200 170 170 214 Z" fill="#f97316"/><path d="M178 132 Q186 120 182 112 Q190 128 184 140 Z" fill="#fff"/>
<rect x="76" y="182" width="22" height="58" rx="9" fill="#fb923c"/><rect x="102" y="182" width="22" height="58" rx="9" fill="#fb923c"/>
<rect x="44" y="116" width="22" height="64" rx="10" fill="#fb923c" transform="rotate(8 55 118)"/><rect x="134" y="116" width="22" height="64" rx="10" fill="#fb923c" transform="rotate(-8 145 118)"/>
<rect x="62" y="112" width="76" height="80" rx="18" fill="#fb923c"/><ellipse cx="100" cy="152" rx="24" ry="30" fill="#fff7ed" stroke-width="0"/>
<path d="M60 44 L54 0 L90 28 Z M140 44 L146 0 L110 28 Z" fill="#f97316"/>
<circle cx="100" cy="66" r="43" fill="#f97316"/>
</g>
<path d="M64 72 Q100 112 136 72 Q120 96 100 98 Q80 96 64 72 Z" fill="#fff7ed"/>
<ellipse cx="84" cy="64" rx="6" ry="7" fill="#1f2937"/><ellipse cx="116" cy="64" rx="6" ry="7" fill="#1f2937"/>
<circle cx="86" cy="61" r="2" fill="#fff"/><circle cx="118" cy="61" r="2" fill="#fff"/>
<ellipse cx="100" cy="82" rx="6" ry="4.5" fill="#1f2937"/><path d="M92 90 Q100 96 108 90" stroke="#7c2d12" stroke-width="3" fill="none" stroke-linecap="round"/>`);

// --- ev / araba / eşyalar ---
const treeHouse = svgUrl(`
<rect x="126" y="110" width="28" height="112" fill="#8d5a2b" stroke="${INK}" stroke-width="4"/>
<g stroke="${INK}" stroke-width="4"><circle cx="90" cy="60" r="44" fill="#3f9b3a"/><circle cx="190" cy="60" r="44" fill="#3f9b3a"/><circle cx="140" cy="36" r="46" fill="#4caf50"/></g>
<rect x="76" y="76" width="128" height="62" rx="4" fill="#c08457" stroke="${INK}" stroke-width="4"/>
<path d="M66 80 L140 30 L214 80 Z" fill="#b91c1c" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<rect x="96" y="92" width="28" height="24" fill="#fde68a" stroke="${INK}" stroke-width="3"/><rect x="152" y="96" width="24" height="42" fill="#7a4a24" stroke="${INK}" stroke-width="3"/>
<path d="M70 138 L210 138" stroke="${INK}" stroke-width="5"/>
<g stroke="${INK}" stroke-width="3"><path d="M100 138 L100 222 M118 138 L118 222" /><path d="M100 160 L118 160 M100 180 L118 180 M100 200 L118 200"/></g>`, 280, 222);

const pirateShip = svgUrl(`
<path d="M14 70 L206 70 L184 112 L36 112 Z" fill="#7c2d12" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M20 84 L200 84" stroke="#facc15" stroke-width="4"/>
<circle cx="70" cy="96" r="6" fill="#1f2937"/><circle cx="110" cy="96" r="6" fill="#1f2937"/><circle cx="150" cy="96" r="6" fill="#1f2937"/>
<path d="M110 70 L110 4" stroke="${INK}" stroke-width="5"/>
<path d="M110 10 Q160 30 112 60 Z" fill="#f8fafc" stroke="${INK}" stroke-width="3"/>
<path d="M110 4 L134 10 L110 16 Z" fill="#111827"/>`, 220, 120);

const chest = svgUrl(`
<rect x="6" y="40" width="88" height="54" rx="6" fill="#92400e" stroke="${INK}" stroke-width="4"/>
<path d="M6 40 Q6 8 50 8 Q94 8 94 40 Z" fill="#b45309" stroke="${INK}" stroke-width="4"/>
<rect x="20" y="8" width="10" height="86" fill="#facc15" stroke="${INK}" stroke-width="2"/><rect x="70" y="8" width="10" height="86" fill="#facc15" stroke="${INK}" stroke-width="2"/>
<rect x="42" y="44" width="16" height="16" rx="3" fill="#fde047" stroke="${INK}" stroke-width="3"/>`, 100, 100);

const hammock = svgUrl(`
<rect x="4" y="4" width="10" height="92" fill="#8d5a2b" stroke="${INK}" stroke-width="3"/><rect x="146" y="4" width="10" height="92" fill="#8d5a2b" stroke="${INK}" stroke-width="3"/>
<path d="M14 24 Q80 96 146 24" stroke="${INK}" stroke-width="4" fill="none"/>
<path d="M14 24 Q80 80 146 24 Q80 100 14 24 Z" fill="#22c55e" stroke="${INK}" stroke-width="3"/>
<path d="M30 40 Q80 76 130 40" stroke="#facc15" stroke-width="4" fill="none"/>`, 160, 100);

const globe = svgUrl(`
<path d="M30 92 L70 92 L62 84 L38 84 Z" fill="#a16207" stroke="${INK}" stroke-width="3"/><path d="M50 84 L50 74" stroke="${INK}" stroke-width="4"/>
<path d="M50 6 A38 38 0 0 1 50 82" stroke="#a16207" stroke-width="5" fill="none"/>
<circle cx="46" cy="42" r="32" fill="#38bdf8" stroke="${INK}" stroke-width="3"/>
<path d="M30 26 Q40 20 46 30 Q40 40 30 36 Z M48 48 Q60 44 64 54 Q56 66 48 60 Z" fill="#22c55e" stroke="${INK}" stroke-width="2"/>`, 100, 100);

const parrot = svgUrl(`
<path d="M44 88 L44 98 M56 88 L56 98" stroke="#f59e0b" stroke-width="4"/>
<path d="M30 60 Q24 20 52 16 Q76 16 74 44 Q72 80 50 90 Q34 88 30 60 Z" fill="#ef4444" stroke="${INK}" stroke-width="3"/>
<path d="M36 56 Q30 80 50 90 Q44 70 52 56 Z" fill="#3b82f6" stroke="${INK}" stroke-width="2"/>
<path d="M72 30 Q88 34 80 46 Q74 40 70 40 Z" fill="#facc15" stroke="${INK}" stroke-width="3"/>
<circle cx="60" cy="28" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="61" cy="28" r="2" fill="${INK}"/>`, 100, 100);

const seaWall = svgUrl(`<rect width="200" height="120" fill="#bae6fd"/><g fill="none" stroke="#0ea5e9" stroke-width="5" stroke-linecap="round">
<path d="M0 30 q12 -10 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0"/><path d="M-10 70 q12 -10 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0"/><path d="M0 110 q12 -10 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0"/></g>`, 200, 120);

const deckFloor = svgUrl(`<rect width="200" height="60" fill="#c08457"/><g stroke="#7c4a24" stroke-width="3">${[0, 1, 2, 3, 4].map(i => `<path d="M0 ${i * 12 + 6} L200 ${i * 12 + 6}"/>`).join('')}${[30, 90, 150, 60, 120, 180].map((x, i) => `<path d="M${x} ${Math.floor(i / 3) * 24 + 6} L${x} ${Math.floor(i / 3) * 24 + 18}"/>`).join('')}</g>`, 200, 60);

export const SAMPLE_ITEMS = [
  { id: 'sample_base_fox', cat: 'base', name: 'Tilki (örnek karakter)', price: 15, image: foxBase, fit: 'template', showHair: false, render: {} },
  { id: 'sample_hair_pink', cat: 'hair', name: 'Pembe Kuyruklar', price: 5, image: pinkHair, fit: 'template', render: {} },
  { id: 'sample_top_pirate', cat: 'top', name: 'Korsan Yeleği', price: 8, image: pirateTop, fit: 'template', render: {} },
  { id: 'sample_bottom_pirate', cat: 'bottom', name: 'Korsan Pantolonu', price: 6, image: pirateBottom, fit: 'template', render: {} },
  { id: 'sample_shoes_boots', cat: 'shoes', name: 'Korsan Çizmesi', price: 6, image: pirateBoots, fit: 'template', render: {} },
  { id: 'sample_hat_viking', cat: 'hat', name: 'Viking Miğferi', price: 10, image: vikingHat, fit: 'template', hideHair: 'short', render: {} },
  { id: 'sample_house_tree', cat: 'house', name: 'Ağaç Ev', price: 40, image: treeHouse, roomNames: 'Ağaç Odası, Gözetleme Kulesi', render: {} },
  { id: 'sample_car_ship', cat: 'car', name: 'Korsan Gemisi', price: 60, image: pirateShip, render: {} },
  { id: 'sample_f_chest', cat: 'furniture', name: 'Hazine Sandığı', price: 8, image: chest, slot: 'toy', size: { w: 64, h: 64 }, render: {} },
  { id: 'sample_f_hammock', cat: 'furniture', name: 'Hamak', price: 10, image: hammock, slot: 'big', size: { w: 140, h: 88 }, render: {} },
  { id: 'sample_f_globe', cat: 'furniture', name: 'Dünya Küresi', price: 5, image: globe, slot: 'table', size: { w: 56, h: 56 }, render: {} },
  { id: 'sample_pet_parrot', cat: 'pet', name: 'Korsan Papağanı', price: 9, image: parrot, render: {} },
  { id: 'sample_wp_sea', cat: 'wallpaper', name: 'Dalgalı Duvar', price: 3, image: seaWall, render: { color: '#bae6fd' } },
  { id: 'sample_fl_deck', cat: 'floor', name: 'Gemi Güvertesi', price: 3, image: deckFloor, render: { color: '#c08457' } },
].map(it => ({ ...it, builtin: false, adjust: { x: 0, y: 0, s: 1 }, sample: true }));

export const SAMPLE_MAP = { id: 'sample_map_pirate', name: 'Korsan Koyu (örnek)', emoji: '🏴‍☠️', theme: 'map_ocean', art: 'ocean', crossing: 'swim', bgImage: '', islandImage: '', decor: '', particle: 'none', order: 150 };

// ----------------------------------------------------------------------------
// KARAKTER ŞABLONU (indirip üstüne çizmek için)
// ----------------------------------------------------------------------------
const BOX_COLORS = { hair: '#a855f7', hat: '#ef4444', accessory: '#0ea5e9', top: '#22c55e', bottom: '#f59e0b', shoes: '#64748b' };
const BOX_NAMES = { hair: 'SAÇ', hat: 'ŞAPKA', accessory: 'AKSESUAR', top: 'ÜST', bottom: 'ALT', shoes: 'AYAKKABI' };

export const templateGuideSvg = ({ withBoxes = true } = {}) => {
  const body = `
<g fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5">
<rect x="76" y="182" width="22" height="58" rx="9"/><rect x="102" y="182" width="22" height="58" rx="9"/>
<rect x="44" y="116" width="22" height="64" rx="10" transform="rotate(8 55 118)"/><rect x="134" y="116" width="22" height="64" rx="10" transform="rotate(-8 145 118)"/>
<rect x="62" y="112" width="76" height="80" rx="18"/><rect x="90" y="98" width="20" height="20"/><circle cx="100" cy="66" r="43"/></g>
<g fill="#cbd5e1"><ellipse cx="84" cy="68" rx="6" ry="7"/><ellipse cx="116" cy="68" rx="6" ry="7"/></g>`;
  const grid = Array.from({ length: 13 }).map((_, i) => `<path d="M0 ${i * 20} L200 ${i * 20}" stroke="#f1f5f9" stroke-width="0.6"/>`).join('')
    + Array.from({ length: 11 }).map((_, i) => `<path d="M${i * 20} 0 L${i * 20} 260" stroke="#f1f5f9" stroke-width="0.6"/>`).join('');
  const boxes = withBoxes ? Object.entries(BOX_COLORS).map(([k, c]) => {
    const b = AVATAR_BOXES[k];
    return `<rect x="${b.x}" y="${Math.max(0, b.y)}" width="${b.w}" height="${b.h + Math.min(0, b.y)}" fill="none" stroke="${c}" stroke-width="1" stroke-dasharray="3 2"/><text x="${b.x + 2}" y="${Math.max(0, b.y) + 7}" font-size="6" font-family="Arial" font-weight="bold" fill="${c}">${BOX_NAMES[k]}</text>`;
  }).join('') : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260" width="800" height="1040"><rect width="200" height="260" fill="#ffffff"/>${grid}${body}${boxes}
<text x="4" y="256" font-size="5.5" font-family="Arial" fill="#64748b">Çocuk Akademi karakter şablonu 200x260 · çizimi bu tuvale yapın, arka planı şeffaf PNG kaydedin</text></svg>`;
};

const download = (href, name) => { const a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };

export const downloadTemplate = async (format = 'png') => {
  const svg = templateGuideSvg();
  if (format === 'svg') { download(URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), 'karakter-sablonu.svg'); return; }
  const img = new Image();
  img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
  const c = document.createElement('canvas'); c.width = 800; c.height = 1040;
  c.getContext('2d').drawImage(img, 0, 0, 800, 1040);
  download(c.toDataURL('image/png'), 'karakter-sablonu.png');
};
