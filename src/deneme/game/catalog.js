// ============================================================================
// --- GRUP: OYUN KATALOĞU (HAZIR EŞYALAR, KATEGORİLER, HARİTA TEMALARI) ---
// ============================================================================
// Buradaki her şey "hazır" (yerleşik) içeriktir. Yönetici panelinden:
//   * hazır eşyaların fiyatı değiştirilebilir / gizlenebilir,
//   * resimli yeni eşya, karakter, ev, araba ve harita eklenebilir.
// Yönetici eklemeleri settings/game_config belgesinde tutulur, kod değişmez.

import { GENERATED_ITEMS } from './catalogGen';

// --- KATEGORİLER ---
// group: hangi ekranda görüneceği (character | house | car)
// slot: odadaki / bahçedeki / arabadaki yer (furniture, garden, carDecor için)
export const CATEGORIES = [
  { id: 'base', group: 'character', label: 'Karakter', icon: '🧒' },
  { id: 'hair', group: 'character', label: 'Saç', icon: '💇' },
  { id: 'hairColor', group: 'character', label: 'Saç Rengi', icon: '🎨' },
  { id: 'top', group: 'character', label: 'Üst', icon: '👕' },
  { id: 'bottom', group: 'character', label: 'Alt', icon: '👖' },
  { id: 'shoes', group: 'character', label: 'Ayakkabı', icon: '👟' },
  { id: 'hat', group: 'character', label: 'Şapka', icon: '🎩' },
  { id: 'accessory', group: 'character', label: 'Aksesuar', icon: '🕶️' },

  { id: 'house', group: 'house', label: 'Evler', icon: '🏠' },
  { id: 'location', group: 'house', label: 'Mekan', icon: '📍' },
  { id: 'wallPaint', group: 'house', label: 'Duvar Boyası', icon: '🖌️' },
  { id: 'roofPaint', group: 'house', label: 'Çatı Boyası', icon: '🔺' },
  { id: 'garden', group: 'house', label: 'Bahçe', icon: '🌳' },
  { id: 'fence', group: 'house', label: 'Çit', icon: '🚧' },
  { id: 'pet', group: 'house', label: 'Bahçe Dostu', icon: '🐶' },
  { id: 'wallpaper', group: 'house', label: 'Oda Duvarı', icon: '🧱' },
  { id: 'floor', group: 'house', label: 'Zemin', icon: '🟫' },
  { id: 'furniture', group: 'house', label: 'Eşyalar', icon: '🛋️' },

  { id: 'car', group: 'car', label: 'Araçlar', icon: '🚗' },
  { id: 'carPaint', group: 'car', label: 'Araba Boyası', icon: '🎨' },
  { id: 'carMod', group: 'car', label: 'Modifiye', icon: '🛞' },
  { id: 'carDecor', group: 'car', label: 'Araba İçi Eşya', icon: '🦆' },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// --- ODA İÇİ YERLER (SLOT) - koordinatlar 400x250 oda çizimine göre ---
export const ROOM_SLOTS = {
  window:   { label: 'Pencere / Perde', x: 292, y: 26, w: 84, h: 84 },
  wall_art: { label: 'Duvar Süsü', x: 160, y: 30, w: 70, h: 58 },
  big:      { label: 'Yatak / Kanepe', x: 14, y: 112, w: 140, h: 92 },
  table:    { label: 'Masa', x: 176, y: 140, w: 92, h: 62 },
  lamp:     { label: 'Lamba', x: 272, y: 100, w: 34, h: 100 },
  rug:      { label: 'Halı', x: 130, y: 205, w: 160, h: 36 },
  plant:    { label: 'Bitki', x: 336, y: 146, w: 50, h: 58 },
  toy:      { label: 'Oyuncak', x: 296, y: 200, w: 40, h: 40 },
  pet:      { label: 'Evcil Hayvan', x: 70, y: 202, w: 44, h: 40 },
};

// --- BAHÇE YERLERİ - koordinatlar 400x300 ev çizimine göre ---
export const GARDEN_SLOTS = {
  garden_left:  { label: 'Sol Bahçe', x: 4, y: 176, w: 78, h: 86, cat: 'garden' },
  garden_right: { label: 'Sağ Bahçe', x: 318, y: 176, w: 78, h: 86, cat: 'garden' },
  pet:          { label: 'Bahçe Dostu', x: 280, y: 236, w: 42, h: 40, cat: 'pet' },
  fence:        { label: 'Çit', x: 0, y: 248, w: 400, h: 30, cat: 'fence' },
};

// --- ARABA İÇİ YERLERİ - koordinatlar 400x250 araba içi çizimine göre ---
export const CAR_SLOTS = {
  dash:   { label: 'Torpido Süsü', x: 250, y: 118, w: 44, h: 44 },
  mirror: { label: 'Ayna Süsü', x: 182, y: 40, w: 36, h: 52 },
  back:   { label: 'Arka Koltuk', x: 40, y: 150, w: 54, h: 54 },
  seat:   { label: 'Koltuk Kılıfı', x: 0, y: 0, w: 0, h: 0, color: true },
};

// --- ÖZEL (RESİMLİ) KIYAFET KUTULARI - avatar 200x260 çizimine göre ---
export const AVATAR_BOXES = {
  base:      { x: 0, y: 0, w: 200, h: 260 },
  hair:      { x: 48, y: 10, w: 104, h: 90 },
  top:       { x: 44, y: 106, w: 112, h: 88 },
  bottom:    { x: 66, y: 178, w: 68, h: 58 },
  shoes:     { x: 66, y: 226, w: 68, h: 26 },
  hat:       { x: 44, y: -6, w: 112, h: 66 },
  accessory: { x: 56, y: 50, w: 88, h: 50 },
};

// --- KÜÇÜK RESİMLERDE KARAKTERİN HANGİ BÖLGESİ GÖSTERİLSİN (viewBox) ---
// Saç seçerken tüm karakter yerine kafa büyük görünür.
export const THUMB_VIEWS = {
  base: '-10 -40 220 300',
  hair: '34 -34 132 132',
  hairColor: '34 -34 132 132',
  hat: '26 -48 148 140',
  accessory: '36 14 128 128',
  top: '26 92 148 128',
  bottom: '40 168 120 92',
  shoes: '48 210 104 52',
};

// --- RENK PALETLERİ ---
export const SKIN_TONES = ['#ffe0c7', '#f6c9a0', '#e8b27d', '#c98e5a', '#9a6438', '#6b4226'];

const NATURAL_HAIR = [['#2b1b10', 'Siyah'], ['#5b3a1e', 'Kahve'], ['#a0522d', 'Kızıl'], ['#e0b44c', 'Sarı']];
const FUN_HAIR = [['#8b5cf6', 'Mor'], ['#3b82f6', 'Mavi'], ['#ec4899', 'Pembe'], ['#10b981', 'Yeşil'], ['#f97316', 'Turuncu'], ['#e5e7eb', 'Gümüş']];

// --- HAZIR EŞYALAR ---
// render: Avatar / ev / araba çizimlerinin anlayacağı ayarlar
const I = (id, cat, name, price, render = {}, extra = {}) => ({ id, cat, name, price, render, builtin: true, ...extra });

export const BUILTIN_ITEMS = [
  // KARAKTER TİPLERİ (ten rengi her zaman ücretsiz seçilir)
  I('base_kid', 'base', 'Çocuk', 0, { kind: 'kid' }),
  I('base_bear', 'base', 'Ayıcık', 20, { kind: 'bear' }),
  I('base_cat', 'base', 'Kedicik', 20, { kind: 'cat' }),
  I('base_bunny', 'base', 'Tavşan', 25, { kind: 'bunny' }),
  I('base_robot', 'base', 'Robot', 35, { kind: 'robot' }),

  // SAÇLAR
  I('hair_messy', 'hair', 'Dağınık Saç', 0, { kind: 'messy' }),
  I('hair_short', 'hair', 'Kısa Saç', 0, { kind: 'short' }),
  I('hair_long', 'hair', 'Uzun Saç', 0, { kind: 'long' }),
  I('hair_spiky', 'hair', 'Dikenli Saç', 4, { kind: 'spiky' }),
  I('hair_ponytail', 'hair', 'At Kuyruğu', 4, { kind: 'ponytail' }),
  I('hair_curly', 'hair', 'Kıvırcık', 5, { kind: 'curly' }),
  I('hair_bun', 'hair', 'Topuz', 5, { kind: 'bun' }),
  I('hair_braids', 'hair', 'Örgülü Saç', 6, { kind: 'braids' }),
  I('hair_afro', 'hair', 'Afro', 6, { kind: 'afro' }),
  I('hair_mohawk', 'hair', 'Mohikan', 8, { kind: 'mohawk' }),
  I('hair_none', 'hair', 'Saçsız', 0, { kind: 'none' }),

  ...NATURAL_HAIR.map(([c, n], i) => I(`hc_n${i}`, 'hairColor', n, 0, { color: c })),
  ...FUN_HAIR.map(([c, n], i) => I(`hc_f${i}`, 'hairColor', n, 3, { color: c })),

  // ÜSTLER
  I('top_ragged', 'top', 'Yamalı Tişört', 0, { kind: 'ragged', color: '#9c8a6e' }),
  I('top_tee_red', 'top', 'Kırmızı Tişört', 3, { kind: 'tshirt', color: '#ef4444' }),
  I('top_tee_blue', 'top', 'Mavi Tişört', 3, { kind: 'tshirt', color: '#3b82f6' }),
  I('top_tee_green', 'top', 'Yeşil Tişört', 3, { kind: 'tshirt', color: '#22c55e' }),
  I('top_tee_yellow', 'top', 'Sarı Tişört', 3, { kind: 'tshirt', color: '#facc15' }),
  I('top_stripe', 'top', 'Çizgili Tişört', 5, { kind: 'stripe', color: '#f97316', color2: '#fff7ed' }),
  I('top_hoodie_purple', 'top', 'Mor Kapüşonlu', 8, { kind: 'hoodie', color: '#8b5cf6' }),
  I('top_hoodie_orange', 'top', 'Turuncu Kapüşonlu', 8, { kind: 'hoodie', color: '#fb923c' }),
  I('top_sweater', 'top', 'Kalpli Kazak', 10, { kind: 'sweater', color: '#f472b6' }),
  I('top_dress_pink', 'top', 'Pembe Elbise', 8, { kind: 'dress', color: '#f9a8d4' }),
  I('top_dress_blue', 'top', 'Mavi Elbise', 8, { kind: 'dress', color: '#7dd3fc' }),
  I('top_jacket', 'top', 'Havalı Ceket', 15, { kind: 'jacket', color: '#1f2937' }),
  I('top_hero', 'top', 'Süper Kahraman', 20, { kind: 'hero', color: '#2563eb', color2: '#ef4444' }),
  I('top_gown', 'top', 'Prenses Kıyafeti', 25, { kind: 'gown', color: '#c084fc' }),
  I('top_astro', 'top', 'Astronot Kıyafeti', 30, { kind: 'astro', color: '#f8fafc' }),

  // ALTLAR
  I('bottom_old', 'bottom', 'Eski Şort', 0, { kind: 'oldShorts', color: '#6b5b45' }),
  I('bottom_shorts_blue', 'bottom', 'Mavi Şort', 3, { kind: 'shorts', color: '#2563eb' }),
  I('bottom_shorts_red', 'bottom', 'Kırmızı Şort', 3, { kind: 'shorts', color: '#dc2626' }),
  I('bottom_jeans', 'bottom', 'Kot Pantolon', 5, { kind: 'jeans', color: '#1d4ed8' }),
  I('bottom_skirt', 'bottom', 'Etek', 5, { kind: 'skirt', color: '#db2777' }),
  I('bottom_track', 'bottom', 'Eşofman', 6, { kind: 'track', color: '#16a34a' }),

  // AYAKKABILAR
  I('shoes_old', 'shoes', 'Eski Terlik', 0, { kind: 'slippers', color: '#8d6e63' }),
  I('shoes_sneaker_red', 'shoes', 'Kırmızı Spor Ayakkabı', 4, { kind: 'sneakers', color: '#ef4444' }),
  I('shoes_sneaker_blue', 'shoes', 'Mavi Spor Ayakkabı', 4, { kind: 'sneakers', color: '#3b82f6' }),
  I('shoes_rain', 'shoes', 'Yağmur Botu', 5, { kind: 'boots', color: '#facc15' }),
  I('shoes_boots', 'shoes', 'Kahve Bot', 6, { kind: 'boots', color: '#78350f' }),
  I('shoes_glitter', 'shoes', 'Simli Ayakkabı', 10, { kind: 'glitter', color: '#f472b6' }),

  // ŞAPKALAR
  I('hat_cap_red', 'hat', 'Kırmızı Kep', 4, { kind: 'cap', color: '#ef4444' }),
  I('hat_cap_blue', 'hat', 'Mavi Kep', 4, { kind: 'cap', color: '#2563eb' }),
  I('hat_beanie', 'hat', 'Bere', 4, { kind: 'beanie', color: '#14b8a6' }),
  I('hat_party', 'hat', 'Parti Şapkası', 5, { kind: 'party', color: '#a855f7' }),
  I('hat_flower', 'hat', 'Çiçek Taç', 5, { kind: 'flower' }),
  I('hat_cowboy', 'hat', 'Kovboy Şapkası', 8, { kind: 'cowboy', color: '#92400e' }),
  I('hat_pirate', 'hat', 'Korsan Şapkası', 10, { kind: 'pirate', color: '#111827' }),
  I('hat_wizard', 'hat', 'Büyücü Şapkası', 12, { kind: 'wizard', color: '#4338ca' }),
  I('hat_crown', 'hat', 'Altın Taç', 25, { kind: 'crown', color: '#facc15' }),

  // AKSESUARLAR
  I('acc_glasses', 'accessory', 'Gözlük', 4, { kind: 'glasses' }),
  I('acc_sunglasses', 'accessory', 'Güneş Gözlüğü', 6, { kind: 'sunglasses' }),
  I('acc_bowtie', 'accessory', 'Papyon', 4, { kind: 'bowtie', color: '#dc2626' }),
  I('acc_scarf', 'accessory', 'Atkı', 5, { kind: 'scarf', color: '#0ea5e9' }),
  I('acc_medal', 'accessory', 'Altın Madalya', 8, { kind: 'medal' }),
  I('acc_headphones', 'accessory', 'Kulaklık', 10, { kind: 'headphones', color: '#ec4899' }),

  // EVLER (rooms: içindeki odalar)
  I('house_shack', 'house', 'Eski Kulübe', 0, { kind: 'shack' }, { rooms: ['oda'] }),
  I('house_cottage', 'house', 'Şirin Ev', 30, { kind: 'cottage' }, { rooms: ['salon', 'yatak'] }),
  I('house_twostory', 'house', 'İki Katlı Ev', 60, { kind: 'twostory' }, { rooms: ['salon', 'yatak', 'mutfak'] }),
  I('house_villa', 'house', 'Havuzlu Villa', 100, { kind: 'villa' }, { rooms: ['salon', 'yatak', 'mutfak', 'oyun'] }),
  I('house_castle', 'house', 'Şato', 160, { kind: 'castle' }, { rooms: ['salon', 'yatak', 'mutfak', 'oyun', 'hazine'] }),

  // EV BOYALARI
  ...[['#fde68a', 'Krem'], ['#fca5a5', 'Pembe'], ['#93c5fd', 'Gök Mavisi'], ['#86efac', 'Nane Yeşili'], ['#c4b5fd', 'Lila'], ['#fdba74', 'Şeftali'], ['#f8fafc', 'Beyaz']]
    .map(([c, n], i) => I(`wall_${i}`, 'wallPaint', `${n} Duvar`, 3, { color: c })),
  ...[['#b91c1c', 'Kırmızı'], ['#1e3a8a', 'Lacivert'], ['#065f46', 'Yeşil'], ['#7c2d12', 'Kiremit'], ['#6d28d9', 'Mor'], ['#374151', 'Antrasit']]
    .map(([c, n], i) => I(`roof_${i}`, 'roofPaint', `${n} Çatı`, 3, { color: c })),

  // BAHÇE
  I('garden_tree', 'garden', 'Ağaç', 4, { art: 'oak' }),
  I('garden_pine', 'garden', 'Çam Ağacı', 4, { art: 'pine' }),
  I('garden_sunflower', 'garden', 'Ayçiçeği', 3, { emoji: '🌻' }),
  I('garden_tulip', 'garden', 'Laleler', 3, { art: 'flowers' }),
  I('garden_mushroom', 'garden', 'Mantar', 3, { art: 'mushroom' }),
  I('garden_lantern', 'garden', 'Fener', 5, { emoji: '🏮' }),
  I('garden_fountain', 'garden', 'Çeşme', 12, { emoji: '⛲' }),
  I('garden_slide', 'garden', 'Kaydırak', 15, { emoji: '🛝' }),
  I('garden_snowman', 'garden', 'Kardan Adam', 8, { art: 'snowman' }),

  I('fence_wood', 'fence', 'Tahta Çit', 5, { kind: 'wood', color: '#a16207' }),
  I('fence_white', 'fence', 'Beyaz Çit', 6, { kind: 'picket', color: '#f8fafc' }),
  I('fence_hedge', 'fence', 'Çiçekli Çit', 8, { kind: 'hedge', color: '#16a34a' }),

  I('pet_dog', 'pet', 'Köpek', 10, { emoji: '🐶' }),
  I('pet_cat', 'pet', 'Kedi', 10, { emoji: '🐱' }),
  I('pet_bunny', 'pet', 'Tavşan', 8, { emoji: '🐰' }),
  I('pet_turtle', 'pet', 'Kaplumbağa', 8, { emoji: '🐢' }),
  I('pet_parrot', 'pet', 'Papağan', 12, { emoji: '🦜' }),
  I('pet_horse', 'pet', 'Midilli', 20, { emoji: '🐴' }),

  // ODA DUVARI VE ZEMİN
  I('wp_old', 'wallpaper', 'Eski Duvar', 0, { color: '#a1887f', pattern: 'cracks' }),
  I('wp_yellow', 'wallpaper', 'Sarı Duvar', 2, { color: '#fef08a' }),
  I('wp_blue', 'wallpaper', 'Mavi Duvar', 2, { color: '#bfdbfe' }),
  I('wp_pink', 'wallpaper', 'Pembe Duvar', 2, { color: '#fbcfe8' }),
  I('wp_green', 'wallpaper', 'Yeşil Duvar', 2, { color: '#bbf7d0' }),
  I('wp_dots', 'wallpaper', 'Puantiyeli Duvar', 4, { color: '#e9d5ff', pattern: 'dots' }),
  I('wp_stars', 'wallpaper', 'Yıldızlı Duvar', 5, { color: '#1e3a8a', pattern: 'stars' }),
  I('fl_old', 'floor', 'Eski Tahta', 0, { color: '#6d4c41', pattern: 'old' }),
  I('fl_wood', 'floor', 'Parke', 3, { color: '#c08457', pattern: 'planks' }),
  I('fl_tile', 'floor', 'Damalı Zemin', 4, { color: '#e2e8f0', pattern: 'checker' }),
  I('fl_carpet', 'floor', 'Halıfleks', 3, { color: '#93c5fd' }),

  // ODA EŞYALARI (slot: odadaki yer)
  I('f_mattress', 'furniture', 'Eski Şilte', 0, { draw: 'mattress' }, { slot: 'big' }),
  I('f_bed_blue', 'furniture', 'Mavi Yatak', 10, { draw: 'bed', color: '#3b82f6' }, { slot: 'big' }),
  I('f_bed_pink', 'furniture', 'Pembe Yatak', 10, { draw: 'bed', color: '#ec4899' }, { slot: 'big' }),
  I('f_sofa_red', 'furniture', 'Kırmızı Kanepe', 12, { draw: 'sofa', color: '#dc2626' }, { slot: 'big' }),
  I('f_sofa_green', 'furniture', 'Yeşil Kanepe', 12, { draw: 'sofa', color: '#16a34a' }, { slot: 'big' }),
  I('f_box', 'furniture', 'Karton Kutu', 0, { draw: 'box' }, { slot: 'table' }),
  I('f_table_wood', 'furniture', 'Ahşap Masa', 6, { draw: 'table', color: '#a16207' }, { slot: 'table' }),
  I('f_table_white', 'furniture', 'Beyaz Masa', 6, { draw: 'table', color: '#e2e8f0' }, { slot: 'table' }),
  I('f_tv', 'furniture', 'Televizyon', 14, { draw: 'tv' }, { slot: 'table' }),
  I('f_candle', 'furniture', 'Mum', 0, { emoji: '🕯️' }, { slot: 'lamp' }),
  I('f_lamp_yellow', 'furniture', 'Sarı Lamba', 5, { draw: 'lamp', color: '#facc15' }, { slot: 'lamp' }),
  I('f_lamp_blue', 'furniture', 'Mavi Lamba', 5, { draw: 'lamp', color: '#38bdf8' }, { slot: 'lamp' }),
  I('f_curtain_red', 'furniture', 'Kırmızı Perde', 4, { draw: 'curtain', color: '#ef4444' }, { slot: 'window' }),
  I('f_curtain_purple', 'furniture', 'Mor Perde', 4, { draw: 'curtain', color: '#a855f7' }, { slot: 'window' }),
  I('f_art_mountain', 'furniture', 'Dağ Tablosu', 3, { draw: 'frame', emoji: '🏞️' }, { slot: 'wall_art' }),
  I('f_art_unicorn', 'furniture', 'Unicorn Posteri', 4, { draw: 'frame', emoji: '🦄' }, { slot: 'wall_art' }),
  I('f_art_rocket', 'furniture', 'Roket Posteri', 4, { draw: 'frame', emoji: '🚀' }, { slot: 'wall_art' }),
  I('f_clock', 'furniture', 'Duvar Saati', 5, { emoji: '🕰️' }, { slot: 'wall_art' }),
  I('f_rug_round', 'furniture', 'Yuvarlak Halı', 4, { draw: 'rug', color: '#f59e0b' }, { slot: 'rug' }),
  I('f_rug_rainbow', 'furniture', 'Gökkuşağı Halı', 8, { draw: 'rainbowRug' }, { slot: 'rug' }),
  I('f_plant', 'furniture', 'Saksı Çiçeği', 3, { emoji: '🪴' }, { slot: 'plant' }),
  I('f_cactus', 'furniture', 'Kaktüs', 3, { art: 'cactus' }, { slot: 'plant' }),
  I('f_teddy', 'furniture', 'Oyuncak Ayı', 4, { emoji: '🧸' }, { slot: 'toy' }),
  I('f_ball', 'furniture', 'Top', 3, { emoji: '⚽' }, { slot: 'toy' }),
  I('f_robot', 'furniture', 'Oyuncak Robot', 8, { emoji: '🤖' }, { slot: 'toy' }),
  I('f_game', 'furniture', 'Oyun Konsolu', 10, { emoji: '🎮' }, { slot: 'toy' }),
  I('f_guitar', 'furniture', 'Gitar', 10, { emoji: '🎸' }, { slot: 'toy' }),
  I('f_pet_cat', 'furniture', 'Kedi', 10, { emoji: '🐈' }, { slot: 'pet' }),
  I('f_pet_dog', 'furniture', 'Köpek', 10, { emoji: '🐕' }, { slot: 'pet' }),
  I('f_pet_fish', 'furniture', 'Balık', 6, { emoji: '🐠' }, { slot: 'pet' }),
  I('f_pet_hamster', 'furniture', 'Hamster', 8, { emoji: '🐹' }, { slot: 'pet' }),
  // yeni çizimli mobilyalar (serbest yerleşim)
  I('f_wardrobe', 'furniture', 'Gardırop', 12, { draw: 'wardrobe', color: '#b45309' }, { slot: 'big', size: { w: 74, h: 120 } }),
  I('f_bookshelf', 'furniture', 'Kitaplık', 10, { draw: 'bookshelf', color: '#92400e' }, { slot: 'big', size: { w: 70, h: 110 } }),
  I('f_desk', 'furniture', 'Çalışma Masası', 9, { draw: 'desk', color: '#d97706' }, { slot: 'table', size: { w: 96, h: 70 } }),
  I('f_chair', 'furniture', 'Sandalye', 4, { draw: 'chair', color: '#0ea5e9' }, { slot: 'table', size: { w: 40, h: 62 } }),
  I('f_armchair', 'furniture', 'Koltuk', 9, { draw: 'armchair', color: '#7c3aed' }, { slot: 'big', size: { w: 70, h: 64 } }),
  I('f_fridge', 'furniture', 'Buzdolabı', 14, { draw: 'fridge', color: '#e2e8f0' }, { slot: 'big', size: { w: 54, h: 120 } }),
  I('f_stove', 'furniture', 'Ocak', 12, { draw: 'stove', color: '#f1f5f9' }, { slot: 'table', size: { w: 66, h: 74 } }),
  I('f_toybox', 'furniture', 'Oyuncak Sandığı', 6, { draw: 'toybox', color: '#ef4444' }, { slot: 'toy', size: { w: 60, h: 46 } }),
  I('f_aquarium', 'furniture', 'Akvaryum', 12, { draw: 'aquarium' }, { slot: 'table', size: { w: 80, h: 64 } }),
  I('f_bunk', 'furniture', 'Ranza', 18, { draw: 'bunk', color: '#16a34a' }, { slot: 'big', size: { w: 120, h: 130 } }),

  // ARABALAR
  I('car_old', 'car', 'Eski Araba', 25, { kind: 'old', color: '#a8a29e' }),
  I('car_city', 'car', 'Şehir Arabası', 45, { kind: 'city', color: '#38bdf8' }),
  I('car_jeep', 'car', 'Cip', 70, { kind: 'jeep', color: '#65a30d' }),
  I('car_sport', 'car', 'Spor Araba', 110, { kind: 'sport', color: '#dc2626' }),
  I('car_caravan', 'car', 'Karavan', 130, { kind: 'caravan', color: '#f8fafc' }),

  ...[['#ef4444', 'Kırmızı'], ['#3b82f6', 'Mavi'], ['#facc15', 'Sarı'], ['#22c55e', 'Yeşil'], ['#a855f7', 'Mor'], ['#f472b6', 'Pembe'], ['#111827', 'Siyah']]
    .map(([c, n], i) => I(`cp_${i}`, 'carPaint', `${n} Boya`, 4, { color: c })),

  I('cd_duck', 'carDecor', 'Ördekçik', 3, { emoji: '🦆' }, { slot: 'dash' }),
  I('cd_cactus', 'carDecor', 'Mini Kaktüs', 3, { emoji: '🌵' }, { slot: 'dash' }),
  I('cd_dino', 'carDecor', 'Dinozor', 4, { emoji: '🦖' }, { slot: 'dash' }),
  I('cd_clover', 'carDecor', 'Yonca', 2, { emoji: '🍀' }, { slot: 'mirror' }),
  I('cd_balloon', 'carDecor', 'Balon', 3, { emoji: '🎈' }, { slot: 'mirror' }),
  I('cd_butterfly', 'carDecor', 'Kelebek', 3, { emoji: '🦋' }, { slot: 'mirror' }),
  I('cd_teddy', 'carDecor', 'Ayıcık', 4, { emoji: '🧸' }, { slot: 'back' }),
  I('cd_panda', 'carDecor', 'Panda', 4, { emoji: '🐼' }, { slot: 'back' }),
  I('cd_gift', 'carDecor', 'Hediye Kutusu', 3, { emoji: '🎁' }, { slot: 'back' }),
  ...[['#ef4444', 'Kırmızı'], ['#0ea5e9', 'Mavi'], ['#a3e635', 'Yeşil'], ['#f9a8d4', 'Pembe']]
    .map(([c, n], i) => I(`cs_${i}`, 'carDecor', `${n} Koltuk Kılıfı`, 4, { color: c }, { slot: 'seat' })),
];

BUILTIN_ITEMS.push(...GENERATED_ITEMS);

// Araba modifiye yerleri
export const CAR_MOD_SLOTS = {
  rims: { label: 'Jant', icon: '🛞' },
  spoiler: { label: 'Spoiler', icon: '🏁' },
  sticker: { label: 'Çıkartma', icon: '⭐' },
  neon: { label: 'Neon Işık', icon: '💡' },
  roof: { label: 'Tavan', icon: '🏄' },
  exhaust: { label: 'Egzoz', icon: '💨' },
  tint: { label: 'Cam Filmi', icon: '🕶️' },
  lights: { label: 'Far', icon: '🔦' },
};

// Bahçe: serbest yerleşim (ev dış görünüşü 400x300). Her eşya { uid, id, x, y, s, flip }
export const YARD_DEFAULT_SIZE = { w: 70, h: 80 };

// --- ODA TÜRLERİ ---
export const ROOM_TYPES = {
  oda: { name: 'Odam', emoji: '🛏️' },
  salon: { name: 'Salon', emoji: '🛋️' },
  yatak: { name: 'Yatak Odası', emoji: '🛏️' },
  mutfak: { name: 'Mutfak', emoji: '🍳' },
  oyun: { name: 'Oyun Odası', emoji: '🧸' },
  hazine: { name: 'Hazine Odası', emoji: '💎' },
};

// --- YENİ OYUNCUNUN BAŞLANGIÇ DURUMU (eski püskü!) ---
export const STARTER_GAME = {
  base: 'base_kid',
  skin: SKIN_TONES[1],
  hairColor: 'hc_n1',
  equip: { hair: 'hair_messy', top: 'top_ragged', bottom: 'bottom_old', shoes: 'shoes_old', hat: null, accessory: null },
  owned: [],
  house: 'house_shack',
  wallPaint: null,
  roofPaint: null,
  garden: { garden_left: null, garden_right: null, pet: null, fence: null },
  yard: { items: [] },
  location: 'loc_meadow',
  air: null,
  sea: null,
  carMods: {},
  rooms: {
    oda: {
      wallpaper: 'wp_old', floor: 'fl_old',
      items: [
        { uid: 'st1', id: 'f_mattress', x: 84, y: 214, s: 1 },
        { uid: 'st2', id: 'f_box', x: 222, y: 210, s: 1 },
        { uid: 'st3', id: 'f_candle', x: 300, y: 206, s: 1 },
      ],
    },
  },
  car: null,
  carPaint: null,
  carDecor: {},
  spent: 0,
};

// ============================================================================
// --- HARİTA TEMALARI (HAZIR) ---
// ============================================================================
// particle: arka planda uçuşan efekt
// decor: haritaya serpiştirilen süsler
// toppers: adaların üstündeki süsler (sırayla)
export const BUILTIN_MAPS = [
  {
    id: 'map_forest', art: 'forest', crossing: 'chop', name: 'Sihirli Orman', emoji: '🌳',
    sky: ['#d9f99d', '#4ade80', '#166534'], path: '#fef9c3',
    islandTop: '#65a30d', islandSide: '#78350f', islandGrass: '#a3e635',
    particle: 'firefly', decor: ['🌲', '🍄', '🦊', '🦉', '🌳', '🐿️', '🦔', '🌼', '🐞'],
    toppers: ['🌳', '🍄', '🌲', '🏕️', '🌻', '🪵'],
  },
  {
    id: 'map_ocean', art: 'ocean', crossing: 'swim', name: 'Okyanus Adaları', emoji: '🏝️',
    sky: ['#67e8f9', '#0284c7', '#082f49'], path: '#e0f2fe',
    islandTop: '#fcd34d', islandSide: '#c2410c', islandGrass: '#fb7185',
    particle: 'bubble', decor: ['🐠', '🐙', '🐢', '🦀', '🐳', '🪸', '🐡', '🦑', '🐚', '🐬'],
    toppers: ['🐚', '🪸', '🦀', '⚓', '🐙', '💎'],
  },
  {
    id: 'map_candy', art: 'candy', crossing: 'hop', name: 'Şeker Diyarı', emoji: '🍭',
    sky: ['#fce7f3', '#f9a8d4', '#a21caf'], path: '#ffffff',
    islandTop: '#f472b6', islandSide: '#7e22ce', islandGrass: '#fbcfe8',
    particle: 'sparkle', decor: ['🍭', '🍬', '🧁', '🍩', '🍪', '🍫', '🎂', '🍦'],
    toppers: ['🧁', '🍭', '🍩', '🎂', '🍦', '🍬'],
  },
  {
    id: 'map_desert', art: 'desert', crossing: 'walk', name: 'Piramitler Çölü', emoji: '🐪',
    sky: ['#fef3c7', '#fbbf24', '#b45309'], path: '#fffbeb',
    islandTop: '#f59e0b', islandSide: '#92400e', islandGrass: '#fde68a',
    particle: 'sand', decor: ['🌵', '🐪', '🦂', '🌴', '☀️', '🦎', '🏺'],
    toppers: ['🌵', '🌴', '🏺', '🐪', '⛺', '🗿'],
  },
  {
    id: 'map_ice', art: 'ice', crossing: 'slide', name: 'Buz Ülkesi', emoji: '⛄',
    sky: ['#f0f9ff', '#bae6fd', '#3b82f6'], path: '#ffffff',
    islandTop: '#e0f2fe', islandSide: '#60a5fa', islandGrass: '#ffffff',
    particle: 'snow', decor: ['⛄', '🐧', '🐻‍❄️', '❄️', '🦭', '🏔️', '🎿'],
    toppers: ['⛄', '🐧', '🏔️', '🎄', '🦭', '❄️'],
  },
  {
    id: 'map_dino', art: 'dino', crossing: 'hop', name: 'Dinozor Adası', emoji: '🦕',
    sky: ['#fed7aa', '#f97316', '#7c2d12'], path: '#ffedd5',
    islandTop: '#84cc16', islandSide: '#57534e', islandGrass: '#bef264',
    particle: 'ember', decor: ['🦕', '🦖', '🌋', '🥚', '🌿', '🦴', '🪨'],
    toppers: ['🦕', '🥚', '🌋', '🦖', '🦴', '🌿'],
  },
  {
    id: 'map_space', art: 'space', crossing: 'fly', name: 'Uzay Macerası', emoji: '🚀',
    sky: ['#4c1d95', '#1e1b4b', '#020617'], path: '#c4b5fd',
    islandTop: '#a78bfa', islandSide: '#312e81', islandGrass: '#ddd6fe',
    particle: 'star', decor: ['🪐', '🚀', '👽', '🌙', '☄️', '🛸', '⭐', '🌍'],
    toppers: ['🪐', '🛸', '🌙', '🚀', '👽', '☄️'],
  },
];

export const BUILTIN_MAP_IDS = BUILTIN_MAPS.map(m => m.id);

// Haritanın çizim stili (gerçekçi çizgi film arazisi)
export const MAP_ARTS = [
  { id: 'ocean', label: '🌊 Okyanus ve adalar' },
  { id: 'forest', label: '🌲 Orman' },
  { id: 'desert', label: '🏜️ Çöl' },
  { id: 'ice', label: '❄️ Buz ülkesi' },
  { id: 'candy', label: '🍭 Şeker diyarı' },
  { id: 'dino', label: '🌋 Dinozor vadisi' },
  { id: 'space', label: '🪐 Uzay' },
];

// Bir adadan diğerine geçerken karakterin yaptığı hareket
export const CROSSINGS = [
  { id: 'swim', label: '🏊 yüzerek geçer' },
  { id: 'chop', label: '🪓 ağacı kesip geçer' },
  { id: 'walk', label: '🚶 yürür' },
  { id: 'hop', label: '🦘 taşların üstünden zıplar' },
  { id: 'slide', label: '⛸️ buzda kayar' },
  { id: 'fly', label: '🚀 jetpack ile uçar' },
];
export const PARTICLES = ['firefly', 'bubble', 'sparkle', 'sand', 'snow', 'ember', 'star', 'none'];

export const DIFFICULTIES = [
  { id: 'easy', label: 'Kolay', color: '#22c55e' },
  { id: 'medium', label: 'Orta', color: '#f59e0b' },
  { id: 'hard', label: 'Zor', color: '#ef4444' },
];
export const DIFFICULTY_BY_ID = Object.fromEntries(DIFFICULTIES.map(d => [d.id, d]));


// ============================================================================
// --- ODA EŞYALARI: SERBEST YERLEŞİM YARDIMCILARI ---
// ============================================================================
// Odadaki her eşya: { uid, id, x, y, s, flip }  (x,y = eşyanın ALT ORTA noktası, oda 400x250)
const SLOT_ORDER = ['rug', 'window', 'wall_art', 'big', 'table', 'lamp', 'plant', 'pet', 'toy'];

// Eşyanın odadaki temel boyutu
export const itemBaseSize = (item) => {
  if (item?.size?.w && item?.size?.h) return { w: Number(item.size.w), h: Number(item.size.h) };
  const sb = item?.slot && ROOM_SLOTS[item.slot];
  if (sb) return { w: sb.w, h: sb.h };
  return { w: 64, h: 64 };
};

// Eşyanın ilk konacağı yer (slotu varsa oraya, yoksa odanın ortasına)
export const defaultPlacement = (item) => {
  const sb = item?.slot && ROOM_SLOTS[item.slot];
  if (sb) return { x: sb.x + sb.w / 2, y: sb.y + sb.h };
  return { x: 200, y: 222 };
};

export const isFlatItem = (item) => !!item?.flat || item?.slot === 'rug' || item?.render?.draw === 'rug' || item?.render?.draw === 'rainbowRug';

// Eski kayıt (yer tabanlı: big/table/...) -> yeni kayıt (items dizisi)
export const migrateRoom = (room) => {
  const r = room || {};
  if (Array.isArray(r.items)) return { wallpaper: r.wallpaper || null, floor: r.floor || null, items: r.items.filter(x => x && x.id) };
  const items = [];
  SLOT_ORDER.forEach((k, i) => {
    if (!r[k]) return;
    const sb = ROOM_SLOTS[k];
    items.push({ uid: `m${i}`, id: r[k], x: sb.x + sb.w / 2, y: sb.y + sb.h, s: 1 });
  });
  return { wallpaper: r.wallpaper || null, floor: r.floor || null, items };
};
