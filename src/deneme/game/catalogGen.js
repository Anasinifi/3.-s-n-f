// ============================================================================
// --- GRUP: BOL SEÇENEKLİ KATALOG (her kategoride ~50 eşya) ---
// ============================================================================
// Burada üretilen eşyalar da "hazır eşya"dır: yönetici panelinden fiyatı değiştirilebilir,
// gizlenebilir. Kimlikler sabittir (eşya listesi değişse bile çocuğun aldığı eşya kaybolmaz).

const I = (id, cat, name, price, render = {}, extra = {}) => ({ id, cat, name, price, render, builtin: true, ...extra });

const C = {
  kirmizi: ['#ef4444', 'Kırmızı'], turuncu: ['#f97316', 'Turuncu'], sari: ['#facc15', 'Sarı'], yesil: ['#22c55e', 'Yeşil'],
  turkuaz: ['#14b8a6', 'Turkuaz'], mavi: ['#3b82f6', 'Mavi'], lacivert: ['#1e3a8a', 'Lacivert'], mor: ['#8b5cf6', 'Mor'],
  pembe: ['#ec4899', 'Pembe'], acikpembe: ['#f9a8d4', 'Açık Pembe'], fistik: ['#a3e635', 'Fıstık Yeşili'], gok: ['#38bdf8', 'Gök Mavisi'],
  siyah: ['#111827', 'Siyah'], beyaz: ['#f8fafc', 'Beyaz'], gri: ['#9ca3af', 'Gri'], kahve: ['#92400e', 'Kahverengi'],
  krem: ['#fde68a', 'Krem'], lila: ['#c084fc', 'Lila'], bordo: ['#9f1239', 'Bordo'], haki: ['#65a30d', 'Haki'],
  altin: ['#eab308', 'Altın'], gumus: ['#cbd5e1', 'Gümüş'], mint: ['#6ee7b7', 'Nane'], seftali: ['#fdba74', 'Şeftali'],
};
const pick = (...keys) => keys.map(k => C[k]);

const items = [];
const add = (...a) => items.push(I(...a));

// ---------------- ÜSTLER ----------------
pick('turuncu', 'turkuaz', 'lacivert', 'mor', 'pembe', 'siyah', 'beyaz', 'gri', 'fistik', 'gok').forEach(([c, n], i) => add(`top_t${i}`, 'top', `${n} Tişört`, 3, { kind: 'tshirt', color: c }));
[['dots', '#ec4899', '#fff', 'Puantiyeli Tişört'], ['stars', '#1e3a8a', '#facc15', 'Yıldızlı Tişört'], ['hearts', '#f8fafc', '#ef4444', 'Kalpli Tişört'], ['stripesV', '#22c55e', '#fff', 'Dik Çizgili Tişört'], ['lightning', '#111827', '#facc15', 'Şimşekli Tişört'], ['smile', '#3b82f6', '#facc15', 'Gülen Yüz Tişört'], ['dots', '#facc15', '#ef4444', 'Sarı Puantiyeli'], ['stars', '#ec4899', '#fff', 'Pembe Yıldızlı']]
  .forEach(([pt, c, c2, n], i) => add(`top_p${i}`, 'top', n, 5, { kind: 'tshirt', color: c, color2: c2, pattern: pt }));
pick('kirmizi', 'mavi', 'yesil', 'beyaz').forEach(([c, n], i) => add(`top_polo${i}`, 'top', `${n} Polo`, 5, { kind: 'polo', color: c, color2: '#fff' }));
[[7, '#ef4444'], [10, '#2563eb'], [23, '#facc15'], [99, '#16a34a']].forEach(([num, c], i) => add(`top_jer${i}`, 'top', `${num} Numara Forma`, 7, { kind: 'jersey', color: c, color2: '#fff', num }));
pick('beyaz', 'sari', 'acikpembe', 'mint').forEach(([c, n], i) => add(`top_tank${i}`, 'top', `${n} Atlet`, 3, { kind: 'tank', color: c }));
[['#2563eb', '#fde68a'], ['#ec4899', '#fff'], ['#16a34a', '#fef3c7']].forEach(([c, c2], i) => add(`top_ov${i}`, 'top', ['Kot Tulum', 'Pembe Tulum', 'Yeşil Tulum'][i], 8, { kind: 'overall', color: c, color2: c2 }));
pick('kahve', 'siyah', 'kirmizi').forEach(([c, n], i) => add(`top_vest${i}`, 'top', `${n} Yelek`, 6, { kind: 'vest', color: c }));
pick('sari', 'kirmizi', 'mavi').forEach(([c, n], i) => add(`top_rain${i}`, 'top', `${n} Yağmurluk`, 8, { kind: 'raincoat', color: c }));
[['#93c5fd', '#fff'], ['#f9a8d4', '#fff'], ['#a7f3d0', '#fef08a']].forEach(([c, c2], i) => add(`top_pj${i}`, 'top', ['Mavi Pijama', 'Pembe Pijama', 'Yeşil Pijama'][i], 6, { kind: 'pajama', color: c, color2: c2 }));
[['#dc2626', '#facc15'], ['#1e3a8a', '#f9a8d4']].forEach(([c, c2], i) => add(`top_kim${i}`, 'top', ['Kırmızı Kimono', 'Mavi Kimono'][i], 12, { kind: 'kimono', color: c, color2: c2 }));
[['chef', 'Aşçı Kıyafeti'], ['doctor', 'Doktor Önlüğü'], ['police', 'Polis Kıyafeti', '#1d4ed8'], ['firefighter', 'İtfaiyeci Kıyafeti', '#b45309'], ['pilot', 'Pilot Kıyafeti'], ['sailor', 'Denizci Kıyafeti', '#1e3a8a']]
  .forEach(([k, n, c], i) => add(`top_job${i}`, 'top', n, 15, { kind: k, color: c || '#f8fafc' }));
pick('mavi', 'kirmizi', 'siyah').forEach(([c, n], i) => add(`top_hd${i}`, 'top', `${n} Kapüşonlu`, 8, { kind: 'hoodie', color: c }));
pick('sari', 'yesil', 'kirmizi').forEach(([c, n], i) => add(`top_dr${i}`, 'top', `${n} Elbise`, 8, { kind: 'dress', color: c }));
[['#fde047', 'Altın Prenses'], ['#7dd3fc', 'Buz Prenses']].forEach(([c, n], i) => add(`top_gw${i}`, 'top', `${n} Kıyafeti`, 25, { kind: 'gown', color: c }));

// ---------------- ALTLAR ----------------
pick('yesil', 'sari', 'pembe', 'siyah', 'gri', 'turuncu', 'haki', 'lacivert', 'mor', 'turkuaz', 'beyaz', 'kahve', 'gok').forEach(([c, n], i) => add(`bot_sh${i}`, 'bottom', `${n} Şort`, 3, { kind: 'shorts', color: c }));
[['#93c5fd', 'Açık Kot'], ['#111827', 'Siyah Kot'], ['#6b7280', 'Gri Kot']].forEach(([c, n], i) => add(`bot_j${i}`, 'bottom', `${n} Pantolon`, 5, { kind: 'jeans', color: c }));
pick('mavi', 'sari', 'mor', 'kirmizi', 'acikpembe', 'siyah').forEach(([c, n], i) => add(`bot_sk${i}`, 'bottom', `${n} Etek`, 5, { kind: 'skirt', color: c }));
pick('mavi', 'kirmizi', 'siyah', 'mor').forEach(([c, n], i) => add(`bot_tr${i}`, 'bottom', `${n} Eşofman`, 6, { kind: 'track', color: c }));
pick('haki', 'kahve', 'gri', 'siyah').forEach(([c, n], i) => add(`bot_cg${i}`, 'bottom', `${n} Kargo Pantolon`, 6, { kind: 'cargo', color: c }));
[['#111827', null, 'Siyah Tayt'], ['#ec4899', '#fff', 'Puantiyeli Pembe Tayt'], ['#8b5cf6', '#fde047', 'Yıldızlı Mor Tayt'], ['#38bdf8', null, 'Mavi Tayt'], ['#22c55e', '#fff', 'Yeşil Benekli Tayt'], ['#f9a8d4', null, 'Açık Pembe Tayt']]
  .forEach(([c, c2, n], i) => add(`bot_lg${i}`, 'bottom', n, 4, { kind: 'leggings', color: c, color2: c2 }));
pick('acikpembe', 'lila', 'gok', 'beyaz').forEach(([c, n], i) => add(`bot_tu${i}`, 'bottom', `${n} Tütü`, 7, { kind: 'tutu', color: c }));
pick('mavi', 'beyaz', 'kirmizi', 'haki').forEach(([c, n], i) => add(`bot_cp${i}`, 'bottom', `${n} Kapri`, 4, { kind: 'capri', color: c }));

// ---------------- AYAKKABILAR ----------------
pick('yesil', 'sari', 'siyah', 'beyaz', 'pembe', 'mor', 'turuncu', 'turkuaz', 'gri', 'lacivert', 'fistik', 'gok', 'bordo').forEach(([c, n], i) => add(`sh_sn${i}`, 'shoes', `${n} Spor Ayakkabı`, 4, { kind: 'sneakers', color: c }));
pick('siyah', 'kirmizi', 'pembe', 'beyaz').forEach(([c, n], i) => add(`sh_bt${i}`, 'shoes', `${n} Bot`, 6, { kind: 'boots', color: c }));
pick('altin', 'gumus', 'mor').forEach(([c, n], i) => add(`sh_gl${i}`, 'shoes', `${n} Simli Ayakkabı`, 10, { kind: 'glitter', color: c }));
pick('kahve', 'mavi', 'pembe', 'yesil', 'sari').forEach(([c, n], i) => add(`sh_sd${i}`, 'shoes', `${n} Sandalet`, 3, { kind: 'sandals', color: c }));
pick('kirmizi', 'siyah', 'beyaz', 'mavi', 'yesil', 'mor').forEach(([c, n], i) => add(`sh_ht${i}`, 'shoes', `${n} Bilekli Spor Ayakkabı`, 6, { kind: 'hightop', color: c }));
pick('acikpembe', 'kirmizi', 'siyah', 'lila').forEach(([c, n], i) => add(`sh_bl${i}`, 'shoes', `${n} Babet`, 5, { kind: 'ballet', color: c }));
pick('turuncu', 'yesil', 'mavi').forEach(([c, n], i) => add(`sh_cl${i}`, 'shoes', `${n} Takunya`, 4, { kind: 'clogs', color: c }));
pick('pembe', 'mavi', 'yesil', 'mor').forEach(([c, n], i) => add(`sh_sk${i}`, 'shoes', `${n} Paten`, 12, { kind: 'skates', color: c }));
pick('mavi', 'pembe').forEach(([c, n], i) => add(`sh_sl${i}`, 'shoes', `${n} Terlik`, 2, { kind: 'slippers', color: c }));

// ---------------- ŞAPKALAR ----------------
pick('yesil', 'sari', 'siyah', 'beyaz', 'pembe', 'mor', 'turuncu', 'turkuaz').forEach(([c, n], i) => add(`hat_cp${i}`, 'hat', `${n} Kep`, 4, { kind: 'cap', color: c }));
pick('kirmizi', 'mavi', 'pembe', 'sari', 'mor', 'gri').forEach(([c, n], i) => add(`hat_bn${i}`, 'hat', `${n} Bere`, 4, { kind: 'beanie', color: c }));
pick('kirmizi', 'mavi', 'yesil').forEach(([c, n], i) => add(`hat_pt${i}`, 'hat', `${n} Parti Şapkası`, 5, { kind: 'party', color: c }));
pick('siyah', 'beyaz').forEach(([c, n], i) => add(`hat_cb${i}`, 'hat', `${n} Kovboy Şapkası`, 8, { kind: 'cowboy', color: c }));
pick('mor', 'kirmizi').forEach(([c, n], i) => add(`hat_wz${i}`, 'hat', `${n} Büyücü Şapkası`, 12, { kind: 'wizard', color: c }));
pick('gumus', 'acikpembe').forEach(([c, n], i) => add(`hat_cr${i}`, 'hat', `${n} Taç`, 25, { kind: 'crown', color: c }));
pick('kirmizi', 'mavi', 'yesil').forEach(([c, n], i) => add(`hat_hm${i}`, 'hat', `${n} Bisiklet Kaskı`, 6, { kind: 'helmet', color: c }));
add('hat_chef', 'hat', 'Aşçı Şapkası', 8, { kind: 'chefhat' });
add('hat_police', 'hat', 'Polis Şapkası', 10, { kind: 'policehat', color: '#1e3a8a' });
add('hat_fire', 'hat', 'İtfaiyeci Kaskı', 10, { kind: 'firehat', color: '#dc2626' });
pick('altin', 'gumus').forEach(([c, n], i) => add(`hat_ti${i}`, 'hat', `${n} Tiara`, 15, { kind: 'tiara', color: c }));
pick('kirmizi', 'pembe', 'mavi', 'sari', 'mor', 'siyah').forEach(([c, n], i) => add(`hat_bw${i}`, 'hat', `${n} Fiyonk`, 3, { kind: 'bow', color: c }, { hideHair: 'none' }));
pick('beyaz', 'acikpembe').forEach(([c, n], i) => add(`hat_be${i}`, 'hat', `${n} Tavşan Kulağı`, 6, { kind: 'bunnyEars', color: c }, { hideHair: 'none' }));
pick('siyah', 'turuncu').forEach(([c, n], i) => add(`hat_ce${i}`, 'hat', `${n} Kedi Kulağı`, 6, { kind: 'catEars', color: c }, { hideHair: 'none' }));
[['#ec4899', '#facc15'], ['#3b82f6', null], ['#22c55e', '#f472b6'], ['#111827', '#ef4444']].forEach(([c, c2], i) => add(`hat_hb${i}`, 'hat', ['Pembe Taç Bandı', 'Mavi Saç Bandı', 'Çiçekli Saç Bandı', 'Siyah Saç Bandı'][i], 3, { kind: 'headband', color: c, color2: c2 }, { hideHair: 'none' }));
pick('kirmizi', 'siyah', 'lacivert').forEach(([c, n], i) => add(`hat_br${i}`, 'hat', `${n} Bere (Ressam)`, 6, { kind: 'beret', color: c }));
[['#fde68a', '#f472b6'], ['#f8fafc', '#3b82f6']].forEach(([c, c2], i) => add(`hat_su${i}`, 'hat', ['Hasır Güneş Şapkası', 'Beyaz Güneş Şapkası'][i], 7, { kind: 'sunhat', color: c, color2: c2 }));
[['#3b82f6', '#facc15'], ['#ef4444', '#22c55e']].forEach(([c, c2], i) => add(`hat_pr${i}`, 'hat', ['Pervaneli Şapka', 'Renkli Pervaneli Şapka'][i], 9, { kind: 'propeller', color: c, color2: c2 }));
add('hat_santa', 'hat', 'Noel Baba Şapkası', 8, { kind: 'santa' });
add('hat_grad', 'hat', 'Mezuniyet Kepi', 12, { kind: 'grad', color: '#111827' });

// ---------------- AKSESUARLAR ----------------
pick('kirmizi', 'mavi', 'pembe', 'altin').forEach(([c, n], i) => add(`acc_gl${i}`, 'accessory', `${n} Gözlük`, 4, { kind: 'glasses', color: c }));
pick('kirmizi', 'mor', 'turuncu').forEach(([c, n], i) => add(`acc_sg${i}`, 'accessory', `${n} Güneş Gözlüğü`, 6, { kind: 'sunglasses', color: c }));
pick('mavi', 'siyah', 'pembe', 'yesil', 'sari').forEach(([c, n], i) => add(`acc_bt${i}`, 'accessory', `${n} Papyon`, 4, { kind: 'bowtie', color: c }));
pick('kirmizi', 'sari', 'mor', 'yesil', 'pembe').forEach(([c, n], i) => add(`acc_sc${i}`, 'accessory', `${n} Atkı`, 5, { kind: 'scarf', color: c }));
pick('mavi', 'yesil', 'mor', 'siyah').forEach(([c, n], i) => add(`acc_hp${i}`, 'accessory', `${n} Kulaklık`, 10, { kind: 'headphones', color: c }));
[['#facc15', '#ec4899'], ['#cbd5e1', '#38bdf8'], ['#facc15', '#22c55e'], ['#f8fafc', '#f8fafc']].forEach(([c, c2], i) => add(`acc_nk${i}`, 'accessory', ['Altın Kolye', 'Gümüş Kolye', 'Zümrüt Kolye', 'İnci Kolye'][i], 8, { kind: 'necklace', color: c, color2: c2 }));
pick('kirmizi', 'mavi', 'pembe', 'yesil', 'sari', 'mor').forEach(([c, n], i) => add(`acc_bp${i}`, 'accessory', `${n} Sırt Çantası`, 6, { kind: 'backpack', color: c }));
pick('siyah', 'pembe', 'gok').forEach(([c, n], i) => add(`acc_wt${i}`, 'accessory', `${n} Kol Saati`, 7, { kind: 'watch', color: c }));
pick('kirmizi', 'lacivert', 'yesil', 'siyah').forEach(([c, n], i) => add(`acc_ti${i}`, 'accessory', `${n} Kravat`, 5, { kind: 'tie', color: c }));
pick('kirmizi', 'siyah', 'mor', 'yesil').forEach(([c, n], i) => add(`acc_mk${i}`, 'accessory', `${n} Kahraman Maskesi`, 8, { kind: 'mask', color: c }));
add('acc_freckles', 'accessory', 'Çiller', 2, { kind: 'freckles' });
pick('pembe', 'kirmizi', 'sari', 'beyaz').forEach(([c, n], i) => add(`acc_fl${i}`, 'accessory', `${n} Kulak Çiçeği`, 3, { kind: 'flowerEar', color: c }));
add('acc_medal_s', 'accessory', 'Gümüş Madalya', 6, { kind: 'medal' });

// ---------------- SAÇLAR ----------------
[['bob', 'Küt Saç'], ['pigtails', 'İki Yandan Toplu'], ['sidepart', 'Yana Taralı'], ['buzz', 'Kısacık Saç'], ['wavy', 'Dalgalı Saç'], ['topknot', 'Tepe Topuzu'], ['bangs', 'Kahküllü'], ['longCurly', 'Uzun Kıvırcık'], ['puffs', 'Ponpon Saç'], ['quiff', 'Havalı Kabarık'], ['twinBuns', 'Çift Topuz'], ['shag', 'Katlı Saç']]
  .forEach(([k, n], i) => add(`hair_${k}`, 'hair', n, 4 + (i % 4), { kind: k }));
const CLIPS = [['#f472b6', 'Pembe Tokalı'], ['#facc15', 'Sarı Tokalı'], ['#38bdf8', 'Mavi Tokalı']];
[['long', 'Uzun Saç'], ['bob', 'Küt Saç'], ['wavy', 'Dalgalı Saç'], ['pigtails', 'İki Yandan Toplu'], ['braids', 'Örgülü Saç'], ['ponytail', 'At Kuyruğu'], ['longCurly', 'Uzun Kıvırcık'], ['curly', 'Kıvırcık'], ['bangs', 'Kahküllü']]
  .forEach(([k, n]) => CLIPS.forEach(([c, cn], j) => add(`hair_${k}_c${j}`, 'hair', `${cn} ${n}`, 6, { kind: k, clip: c })));

// ---------------- SAÇ RENKLERİ ----------------
[['#1c1917', 'Kömür'], ['#3f2a1d', 'Koyu Kahve'], ['#7c4a2d', 'Kestane'], ['#a16207', 'Bal'], ['#c2853d', 'Karamel'], ['#d4a24c', 'Kumral'], ['#f1d27a', 'Açık Sarı'], ['#fff1b8', 'Platin'], ['#b45309', 'Bakır'], ['#c2410c', 'Turuncu Kızıl'], ['#7f1d1d', 'Koyu Kızıl'], ['#9ca3af', 'Gri'], ['#f5f5f4', 'Kar Beyazı'],
  ['#f9a8d4', 'Pastel Pembe'], ['#fbcfe8', 'Pamuk Şeker'], ['#db2777', 'Fuşya'], ['#be123c', 'Kiraz'], ['#c4b5fd', 'Lavanta'], ['#7c3aed', 'Koyu Mor'], ['#4c1d95', 'Patlıcan'], ['#93c5fd', 'Bebek Mavisi'], ['#1d4ed8', 'Kobalt'], ['#0e7490', 'Petrol'],
  ['#5eead4', 'Deniz Yeşili'], ['#86efac', 'Nane'], ['#15803d', 'Orman Yeşili'], ['#bef264', 'Limon'], ['#fde047', 'Güneş Sarısı'], ['#fdba74', 'Şeftali'], ['#f43f5e', 'Gül'], ['#0f172a', 'Gece Mavisi'], ['#a78bfa', 'Menekşe'], ['#22d3ee', 'Camgöbeği'],
  ['#e879f9', 'Neon Pembe'], ['#facc15', 'Altın'], ['#cbd5e1', 'Gümüş Gri'], ['#78350f', 'Çikolata'], ['#fcd34d', 'Mısır'], ['#d946ef', 'Orkide'], ['#65a30d', 'Zeytin']]
  .forEach(([c, n], i) => add(`hc_g${i}`, 'hairColor', n, i < 13 ? 1 : 3, { color: c }));

// ---------------- KARAKTER TİPLERİ ----------------
[['dog', 'Köpekçik', 20], ['panda', 'Panda', 25], ['fox', 'Tilki', 25], ['frog', 'Kurbağa', 20], ['monkey', 'Maymun', 20], ['unicorn', 'Tek Boynuzlu At', 40], ['lion', 'Aslan', 30], ['koala', 'Koala', 25], ['tiger', 'Kaplan', 30], ['mouse', 'Fare', 15], ['penguin', 'Penguen', 25], ['dino', 'Dinozor', 35]]
  .forEach(([k, n, p]) => add(`base_${k}`, 'base', n, p, { kind: k }));

// ---------------- EVLER ----------------
// [id, ad, fiyat, render, odalar]
const R1 = ['oda'], R2 = ['salon', 'yatak'], R3 = ['salon', 'yatak', 'mutfak'], R4 = ['salon', 'yatak', 'mutfak', 'oyun'], R5 = ['salon', 'yatak', 'mutfak', 'oyun', 'hazine'];
const H = [
  ['h_wood1', 'Ahşap Kulübe', 15, { style: 'house', mat: 'log', roof: 'gable', w: 150, floors: 1, wall: '#b07a45', roofC: '#4d7c0f', shutters: '#7c2d12' }, R1],
  ['h_tent', 'Kamp Çadırı', 10, { style: 'tent', wall: '#f97316', roofC: '#fde047' }, R1],
  ['h_tent2', 'Kızılderili Çadırı', 14, { style: 'tent', wall: '#fef3c7', roofC: '#b91c1c' }, R1],
  ['h_cot_blue', 'Mavi Şirin Ev', 30, { style: 'house', mat: 'siding', roof: 'gable', w: 170, floors: 1, wall: '#93c5fd', roofC: '#1e3a8a', shutters: '#fff', flowers: true }, R2],
  ['h_cot_pink', 'Pembe Şirin Ev', 30, { style: 'house', mat: 'siding', roof: 'gable', w: 170, floors: 1, wall: '#fbcfe8', roofC: '#be185d', shutters: '#fff', flowers: true }, R2],
  ['h_cot_green', 'Yeşil Şirin Ev', 30, { style: 'house', mat: 'siding', roof: 'hip', w: 170, floors: 1, wall: '#bbf7d0', roofC: '#166534', shutters: '#fde68a', flowers: true }, R2],
  ['h_brick1', 'Kırmızı Tuğla Ev', 35, { style: 'house', mat: 'brick', roof: 'gable', w: 180, floors: 1, wall: '#c2410c', roofC: '#374151', porch: true }, R2],
  ['h_brick2', 'Sarı Tuğla Ev', 35, { style: 'house', mat: 'brick', roof: 'hip', w: 180, floors: 1, wall: '#eab308', roofC: '#7c2d12' }, R2],
  ['h_stone1', 'Taş Ev', 40, { style: 'house', mat: 'stone', roof: 'gable', w: 180, floors: 1, wall: '#a8a29e', roofC: '#7c2d12', archWin: true }, R2],
  ['h_thatch', 'Saman Çatılı Ev', 25, { style: 'house', mat: 'plaster', roof: 'thatch', w: 170, floors: 1, wall: '#fef3c7', roofC: '#d4a24c', shutters: '#16a34a', chimney: false }, R2],
  ['h_bung', 'Sahil Bungalovu', 45, { style: 'house', mat: 'wood', roof: 'hip', w: 200, floors: 1, wall: '#5eead4', roofC: '#f8fafc', porch: true }, R3],
  ['h_farm', 'Çiftlik Evi', 50, { style: 'house', mat: 'wood', roof: 'gable', w: 200, floors: 2, wall: '#fef3c7', roofC: '#9f1239', porch: true }, R3],
  ['h_barn', 'Kırmızı Ahır Ev', 45, { style: 'barn', wall: '#b91c1c', roofC: '#f8fafc' }, R3],
  ['h_two_y', 'Sarı İki Katlı', 60, { style: 'house', mat: 'siding', roof: 'gable', w: 190, floors: 2, wall: '#fde68a', roofC: '#b91c1c', shutters: '#1e3a8a', balcony: true }, R3],
  ['h_two_g', 'Yeşil İki Katlı', 60, { style: 'house', mat: 'siding', roof: 'hip', w: 190, floors: 2, wall: '#86efac', roofC: '#14532d', flowers: true }, R3],
  ['h_two_p', 'Lila İki Katlı', 60, { style: 'house', mat: 'plaster', roof: 'gable', w: 190, floors: 2, wall: '#ddd6fe', roofC: '#6d28d9', shutters: '#fff', flowers: true, balcony: true }, R3],
  ['h_two_b', 'Tuğla İki Katlı', 65, { style: 'house', mat: 'brick', roof: 'gable', w: 200, floors: 2, wall: '#b45309', roofC: '#1f2937', garage: true }, R3],
  ['h_two_s', 'Taş İki Katlı', 70, { style: 'house', mat: 'stone', roof: 'hip', w: 200, floors: 2, wall: '#d6d3d1', roofC: '#1e3a8a', archWin: true }, R3],
  ['h_modern1', 'Modern Beyaz Ev', 80, { style: 'house', mat: 'plaster', roof: 'flat', w: 220, floors: 2, wall: '#f8fafc', roofC: '#374151', chimney: false, solar: true }, R4],
  ['h_modern2', 'Modern Ahşap Ev', 85, { style: 'house', mat: 'wood', roof: 'flat', w: 220, floors: 2, wall: '#d6a46c', roofC: '#111827', chimney: false, garage: true }, R4],
  ['h_modern3', 'Cam Ev', 90, { style: 'house', mat: 'plaster', roof: 'flat', w: 210, floors: 2, wall: '#bae6fd', roofC: '#0f172a', chimney: false, balcony: true }, R4],
  ['h_eco', 'Güneş Enerjili Ev', 75, { style: 'house', mat: 'wood', roof: 'gable', w: 190, floors: 2, wall: '#a7f3d0', roofC: '#334155', solar: true, flowers: true }, R3],
  ['h_town', 'Şehir Evi', 70, { style: 'house', mat: 'brick', roof: 'mansard', w: 170, floors: 3, wall: '#9f1239', roofC: '#1f2937' }, R4],
  ['h_town2', 'Mavi Şehir Evi', 70, { style: 'house', mat: 'plaster', roof: 'mansard', w: 170, floors: 3, wall: '#7dd3fc', roofC: '#334155', shutters: '#fff' }, R4],
  ['h_mansion', 'Konak', 120, { style: 'house', mat: 'stone', roof: 'mansard', w: 240, floors: 3, wall: '#fef3c7', roofC: '#1e3a8a', balcony: true, archWin: true, porch: true }, R5],
  ['h_mansion2', 'Pembe Konak', 120, { style: 'house', mat: 'plaster', roof: 'hip', w: 240, floors: 3, wall: '#fbcfe8', roofC: '#831843', balcony: true, archWin: true, flowers: true }, R5],
  ['h_villa2', 'Havuzlu Beyaz Villa', 110, { style: 'house', mat: 'plaster', roof: 'flat', w: 230, floors: 2, wall: '#f8fafc', roofC: '#0ea5e9', garage: true, chimney: false, balcony: true }, R4],
  ['h_villa3', 'Akdeniz Villası', 105, { style: 'house', mat: 'plaster', roof: 'hip', w: 230, floors: 2, wall: '#fed7aa', roofC: '#c2410c', archWin: true, flowers: true, balcony: true }, R4],
  ['h_round', 'Kubbeli Ev', 55, { style: 'house', mat: 'plaster', roof: 'round', w: 180, floors: 1, wall: '#fde68a', roofC: '#0ea5e9', chimney: false, archWin: true }, R2],
  ['h_light', 'Deniz Feneri Evi', 90, { style: 'lighthouse', wall: '#ef4444', roofC: '#1f2937' }, R3],
  ['h_light2', 'Mavi Deniz Feneri', 90, { style: 'lighthouse', wall: '#2563eb', roofC: '#111827' }, R3],
  ['h_igloo', 'İglo', 35, { style: 'igloo' }, R1],
  ['h_tree', 'Ağaç Ev', 65, { style: 'treehouse', wall: '#c08457', roofC: '#b91c1c' }, R2],
  ['h_tree2', 'Mavi Çatılı Ağaç Ev', 65, { style: 'treehouse', wall: '#d6a46c', roofC: '#1d4ed8' }, R2],
  ['h_mill', 'Yel Değirmeni', 80, { style: 'windmill', wall: '#fef3c7', roofC: '#7c2d12' }, R3],
  ['h_mill2', 'Taş Değirmen', 85, { style: 'windmill', wall: '#a8a29e', roofC: '#1e3a8a' }, R3],
  ['h_dome', 'Cam Kubbe Ev', 95, { style: 'dome', roofC: '#64748b' }, R3],
  ['h_mush', 'Mantar Ev', 50, { style: 'mushroom', roofC: '#ef4444' }, R2],
  ['h_mush2', 'Mavi Mantar Ev', 50, { style: 'mushroom', roofC: '#3b82f6' }, R2],
  ['h_castle2', 'Pembe Şato', 170, { style: 'castle', wall: '#fbcfe8', roofC: '#9d174d' }, R5],
  ['h_castle3', 'Buz Şatosu', 180, { style: 'castle', wall: '#e0f2fe', roofC: '#38bdf8' }, R5],
  ['h_castle4', 'Altın Saray', 220, { style: 'castle', wall: '#fde68a', roofC: '#b45309' }, R5],
  ['h_cabin2', 'Dağ Evi', 45, { style: 'house', mat: 'log', roof: 'gable', w: 190, floors: 2, wall: '#92400e', roofC: '#1f2937', balcony: true }, R3],
  ['h_beach', 'Turkuaz Sahil Evi', 55, { style: 'house', mat: 'wood', roof: 'gable', w: 180, floors: 1, wall: '#99f6e4', roofC: '#f97316', porch: true, shutters: '#fff' }, R2],
  ['h_candy', 'Şeker Ev', 75, { style: 'house', mat: 'plaster', roof: 'round', w: 180, floors: 1, wall: '#fbcfe8', roofC: '#a16207', archWin: true, flowers: true, chimney: false }, R3],
  ['h_space', 'Uzay Üssü', 140, { style: 'dome', roofC: '#a855f7' }, R4],
];
H.forEach(([id, n, p, r, rooms]) => add(id, 'house', n, p, r, { rooms }));

// ---------------- ARAÇLAR (araba, uçan, tekne) ----------------
// render.vtype: 'car' | 'air' | 'sea'  -> çocuk her türden bir tane kullanabilir (araba + uçak + tekne)
const V = [
  ['sedan', 'Sedan', 50, pick('kirmizi', 'mavi', 'gri', 'beyaz')],
  ['hatch', 'Minik Şehir Arabası', 40, pick('sari', 'yesil', 'pembe', 'turkuaz')],
  ['suv', 'Arazi Aracı', 75, pick('siyah', 'haki', 'beyaz')],
  ['sport', 'Spor Araba', 110, pick('sari', 'mavi', 'turuncu', 'siyah')],
  ['pickup', 'Kamyonet', 70, pick('kirmizi', 'mavi', 'kahve')],
  ['van', 'Minibüs', 65, pick('beyaz', 'turkuaz')],
  ['limo', 'Limuzin', 150, pick('siyah', 'beyaz')],
  ['classic', 'Klasik Araba', 90, pick('gok', 'kirmizi', 'krem')],
  ['caravan', 'Karavan', 130, pick('beyaz', 'krem')],
];
V.forEach(([k, n, p, cols]) => cols.forEach(([c, cn], i) => add(`veh_${k}${i}`, 'car', `${cn} ${n}`, p, { vtype: 'car', kind: k, color: c, ...(k === 'caravan' ? { extra: 'camper', color2: i ? '#16a34a' : '#f97316' } : {}) })));
add('veh_bus', 'car', 'Şehir Otobüsü', 120, { vtype: 'car', kind: 'bus', color: '#3b82f6' });
add('veh_school', 'car', 'Okul Otobüsü', 120, { vtype: 'car', kind: 'bus', color: '#facc15', extra: 'school' });
add('veh_taxi', 'car', 'Taksi', 70, { vtype: 'car', kind: 'sedan', color: '#facc15', extra: 'taxi' });
add('veh_police', 'car', 'Polis Arabası', 90, { vtype: 'car', kind: 'sedan', color: '#1e3a8a', extra: 'police' });
add('veh_amb', 'car', 'Ambulans', 90, { vtype: 'car', kind: 'van', color: '#f8fafc', extra: 'ambulance' });
add('veh_fire', 'car', 'İtfaiye Aracı', 140, { vtype: 'car', kind: 'firetruck', color: '#dc2626', extra: 'ladder' });
add('veh_truck', 'car', 'Kargo Kamyonu', 100, { vtype: 'car', kind: 'truck', color: '#f8fafc' });
add('veh_ice', 'car', 'Dondurma Arabası', 95, { vtype: 'car', kind: 'truck', color: '#fbcfe8', extra: 'icecream' });
pick('yesil', 'kirmizi').forEach(([c, cn], i) => add(`veh_trac${i}`, 'car', `${cn} Traktör`, 60, { vtype: 'car', kind: 'tractor', color: c }));
pick('kirmizi', 'siyah', 'mavi').forEach(([c, cn], i) => add(`veh_moto${i}`, 'car', `${cn} Motosiklet`, 55, { vtype: 'car', kind: 'motorbike', color: c }));
pick('turuncu', 'yesil').forEach(([c, cn], i) => add(`veh_kart${i}`, 'car', `${cn} Go-Kart`, 35, { vtype: 'car', kind: 'kart', color: c }));
// uçan araçlar
[['plane', 'Pervaneli Uçak', 160, '#f8fafc', '#ef4444'], ['plane', 'Sarı Uçak', 160, '#facc15', '#1e3a8a'], ['jet', 'Jet Uçağı', 260, '#f8fafc', '#2563eb'],
  ['helicopter', 'Kırmızı Helikopter', 200, '#ef4444'], ['helicopter', 'Mavi Helikopter', 200, '#3b82f6'], ['helicopter', 'Sarı Kurtarma Helikopteri', 220, '#facc15'],
  ['balloon', 'Sıcak Hava Balonu', 120, '#ef4444', '#facc15'], ['balloon', 'Gökkuşağı Balon', 130, '#8b5cf6', '#22c55e'], ['balloon', 'Pembe Balon', 120, '#ec4899', '#fff'],
  ['blimp', 'Zeplin', 180, '#9ca3af', '#ef4444'], ['seaplane', 'Deniz Uçağı', 190, '#14b8a6', '#f8fafc']]
  .forEach(([k, n, p, c, c2], i) => add(`air_${i}`, 'car', n, p, { vtype: 'air', kind: k, color: c, color2: c2 }));
// tekneler
[['sailboat', 'Yelkenli', 90, '#1e3a8a', '#facc15'], ['sailboat', 'Kırmızı Yelkenli', 90, '#dc2626', '#f8fafc'], ['speedboat', 'Sürat Teknesi', 120, '#ef4444', '#fff'], ['speedboat', 'Mavi Sürat Teknesi', 120, '#2563eb', '#facc15'],
  ['yacht', 'Yat', 220, '#1e3a8a', '#ef4444'], ['rowboat', 'Kayık', 30, '#a16207'], ['submarine', 'Denizaltı', 170, '#facc15', '#f97316']]
  .forEach(([k, n, p, c, c2], i) => add(`sea_${i}`, 'car', n, p, { vtype: 'sea', kind: k, color: c, color2: c2 }));

// ---------------- ARABA MODİFİYE (sadece arabalar) ----------------
// slot: rims | spoiler | sticker | neon | roof | exhaust | tint | lights
[['classic', '#d1d5db', 'Klasik Gümüş Jant'], ['sport', '#d1d5db', 'Spor Jant'], ['sport', '#111827', 'Siyah Spor Jant'], ['sport', '#ef4444', 'Kırmızı Spor Jant'], ['star', '#facc15', 'Yıldız Jant'], ['gold', '#eab308', 'Altın Jant'], ['mesh', '#d1d5db', 'Örgü Jant'], ['mesh', '#111827', 'Siyah Örgü Jant'], ['neon', '#22d3ee', 'Neon Mavi Jant'], ['neon', '#f472b6', 'Neon Pembe Jant']]
  .forEach(([st, c, n], i) => add(`mod_rim${i}`, 'carMod', n, 6, { mod: 'rims', style: st, color: c }, { slot: 'rims' }));
pick('siyah', 'kirmizi', 'beyaz', 'sari', 'mavi', 'yesil').forEach(([c, n], i) => add(`mod_sp${i}`, 'carMod', `${n} Spoiler`, 8, { mod: 'spoiler', color: c }, { slot: 'spoiler' }));
[['flames', '#f97316', 'Alev Çıkartması'], ['flames', '#38bdf8', 'Mavi Alev Çıkartması'], ['stripes', '#f8fafc', 'Beyaz Yarış Şeridi'], ['stripes', '#111827', 'Siyah Yarış Şeridi'], ['stripes', '#ef4444', 'Kırmızı Yarış Şeridi'], ['stars', '#facc15', 'Yıldız Çıkartması'], ['lightning', '#facc15', 'Şimşek Çıkartması'], ['number', '#ef4444', 'Yarış Numarası'], ['hearts', '#ec4899', 'Kalp Çıkartması'], ['checker', '#111827', 'Damalı Bayrak'], ['paw', '#f8fafc', 'Pati Çıkartması']]
  .forEach(([k, c, n], i) => add(`mod_st${i}`, 'carMod', n, 5, { mod: 'sticker', kind: k, color: c }, { slot: 'sticker' }));
[['#22d3ee', 'Mavi'], ['#ec4899', 'Pembe'], ['#22c55e', 'Yeşil'], ['#a855f7', 'Mor'], ['#facc15', 'Sarı'], ['#ef4444', 'Kırmızı'], ['#f8fafc', 'Beyaz'], ['#f97316', 'Turuncu']]
  .forEach(([c, n], i) => add(`mod_ne${i}`, 'carMod', `${n} Neon Işık`, 9, { mod: 'neon', color: c }, { slot: 'neon' }));
[['rack', '#a16207', 'Bagaj Rafı'], ['rack', '#475569', 'Gri Bavullu Raf'], ['surf', '#38bdf8', 'Sörf Tahtası'], ['surf', '#f97316', 'Turuncu Sörf Tahtası'], ['surf', '#ec4899', 'Pembe Sörf Tahtası'], ['box', '#111827', 'Tavan Kutusu'], ['box', '#f8fafc', 'Beyaz Tavan Kutusu'], ['lightbar', '#fde047', 'Sarı Tavan Lambası'], ['lightbar', '#38bdf8', 'Mavi Tavan Lambası']]
  .forEach(([k, c, n], i) => add(`mod_rf${i}`, 'carMod', n, 7, { mod: 'roof', kind: k, color: c }, { slot: 'roof' }));
add('mod_ex0', 'carMod', 'Çift Egzoz', 6, { mod: 'exhaust', kind: 'twin' }, { slot: 'exhaust' });
add('mod_ex1', 'carMod', 'Alevli Egzoz', 12, { mod: 'exhaust', kind: 'flame' }, { slot: 'exhaust' });
[['#1f2937', 'Koyu Cam Filmi'], ['#1e3a8a', 'Mavi Cam Filmi'], ['#581c87', 'Mor Cam Filmi']].forEach(([c, n], i) => add(`mod_tn${i}`, 'carMod', n, 5, { mod: 'tint', color: c }, { slot: 'tint' }));
[['#93c5fd', 'Buz Mavisi Far'], ['#fde047', 'Sarı Sis Farı'], ['#f472b6', 'Pembe Far']].forEach(([c, n], i) => add(`mod_lt${i}`, 'carMod', n, 5, { mod: 'lights', color: c }, { slot: 'lights' }));

// ---------------- ARABA İÇİ EŞYALAR ----------------
[['🐻', 'Ayıcık', 'dash'], ['🐸', 'Kurbağa', 'dash'], ['🦄', 'Unicorn', 'dash'], ['🐱', 'Kedicik', 'dash'], ['⚽', 'Futbol Topu', 'dash'], ['🌻', 'Ayçiçeği', 'dash'], ['🧸', 'Peluş', 'dash'],
  ['⭐', 'Yıldız Süsü', 'mirror'], ['🍓', 'Çilek', 'mirror'], ['🌈', 'Gökkuşağı', 'mirror'], ['🎀', 'Fiyonk', 'mirror'], ['🧿', 'Nazar Boncuğu', 'mirror'], ['🌙', 'Ay Süsü', 'mirror'],
  ['🎒', 'Okul Çantası', 'back'], ['🐶', 'Köpek Peluşu', 'back'], ['🎸', 'Gitar', 'back'], ['🏀', 'Basketbol Topu', 'back'], ['🎨', 'Boya Kutusu', 'back'], ['📚', 'Kitaplar', 'back'], ['🧃', 'Meyve Suyu', 'back'], ['🦖', 'Dinozor Peluşu', 'back']]
  .forEach(([e, n, slot], i) => add(`cd_g${i}`, 'carDecor', n, 3, { emoji: e }, { slot }));
[['#facc15', 'Sarı'], ['#8b5cf6', 'Mor'], ['#111827', 'Siyah Deri'], ['#f8fafc', 'Beyaz Deri']].forEach(([c, n], i) => add(`cs_g${i}`, 'carDecor', `${n} Koltuk Kılıfı`, 4, { color: c }, { slot: 'seat' }));

// ---------------- BOYALAR ----------------
const PAINTS = [['#fecaca', 'Gül Kurusu'], ['#fed7aa', 'Kayısı'], ['#fef08a', 'Limon'], ['#d9f99d', 'Fıstık'], ['#a7f3d0', 'Nane'], ['#99f6e4', 'Turkuaz'], ['#a5f3fc', 'Buz'], ['#bae6fd', 'Bebek Mavisi'], ['#c7d2fe', 'Lavanta'], ['#e9d5ff', 'Leylak'], ['#fbcfe8', 'Pembe Şeker'], ['#e7e5e4', 'Taş'],
  ['#d6d3d1', 'Gri Taş'], ['#78716c', 'Antrasit'], ['#ef4444', 'Kırmızı'], ['#f97316', 'Turuncu'], ['#eab308', 'Hardal'], ['#16a34a', 'Orman'], ['#0d9488', 'Petrol'], ['#2563eb', 'Kraliyet Mavisi'], ['#7c3aed', 'Mor'], ['#db2777', 'Fuşya'],
  ['#92400e', 'Kahve'], ['#fef3c7', 'Vanilya'], ['#ffedd5', 'Kum'], ['#ecfccb', 'Çimen'], ['#e0f2fe', 'Gökyüzü'], ['#fae8ff', 'Orkide'], ['#1f2937', 'Gece'], ['#f1f5f9', 'Kar'], ['#b45309', 'Tarçın'], ['#be123c', 'Kiraz'], ['#4d7c0f', 'Zeytin'],
  ['#0369a1', 'Okyanus'], ['#a21caf', 'Patlıcan'], ['#facc15', 'Güneş'], ['#fb923c', 'Mandalina'], ['#84cc16', 'Lime'], ['#22d3ee', 'Camgöbeği'], ['#f472b6', 'Şeker Pembe'], ['#cbd5e1', 'Gümüş'], ['#a8a29e', 'Bej Taş'], ['#fda4af', 'Mercan']];
PAINTS.forEach(([c, n], i) => add(`wall_g${i}`, 'wallPaint', `${n} Duvar`, 3, { color: c }));
PAINTS.slice(14, 44).forEach(([c, n], i) => add(`roof_g${i}`, 'roofPaint', `${n} Çatı`, 3, { color: c }));
[['#0ea5e9', 'Metalik Mavi'], ['#dc2626', 'Yarış Kırmızısı'], ['#16a34a', 'Zümrüt'], ['#eab308', 'Altın'], ['#cbd5e1', 'Gümüş'], ['#f8fafc', 'İnci Beyazı'], ['#7c3aed', 'Galaksi Moru'], ['#ec4899', 'Şeker Pembe'], ['#f97316', 'Turuncu'], ['#14b8a6', 'Turkuaz'], ['#1e3a8a', 'Gece Mavisi'], ['#65a30d', 'Askeri Yeşil'],
  ['#78350f', 'Bronz'], ['#be123c', 'Bordo'], ['#a3e635', 'Neon Yeşil'], ['#22d3ee', 'Neon Mavi'], ['#fde68a', 'Krem'], ['#6b7280', 'Mat Gri'], ['#fb7185', 'Mercan'], ['#4c1d95', 'Patlıcan'], ['#0f766e', 'Petrol'], ['#fcd34d', 'Muz Sarısı'], ['#93c5fd', 'Bebek Mavisi']]
  .forEach(([c, n], i) => add(`cp_g${i}`, 'carPaint', `${n} Boya`, 4, { color: c }));

// ---------------- ODA DUVARI VE ZEMİN ----------------
PAINTS.slice(0, 24).forEach(([c, n], i) => add(`wp_g${i}`, 'wallpaper', `${n} Duvar`, 2, { color: c }));
[['dots', '#fbcfe8', 'Puantiyeli Pembe'], ['dots', '#bae6fd', 'Puantiyeli Mavi'], ['stars', '#1e3a8a', 'Gece Yıldızlı'], ['stars', '#7c3aed', 'Mor Yıldızlı'], ['stripes', '#fef3c7', 'Çizgili Krem'], ['stripes', '#d9f99d', 'Çizgili Yeşil'], ['stripes', '#e0f2fe', 'Çizgili Mavi'],
  ['hearts', '#fce7f3', 'Kalpli'], ['hearts', '#fef9c3', 'Sarı Kalpli'], ['checks', '#fee2e2', 'Kareli Kırmızı'], ['checks', '#dcfce7', 'Kareli Yeşil'], ['waves', '#cffafe', 'Dalgalı'], ['waves', '#ede9fe', 'Lila Dalgalı'], ['clouds', '#bae6fd', 'Bulutlu'], ['clouds', '#fbcfe8', 'Pembe Bulutlu'], ['flowers', '#ecfccb', 'Çiçekli'], ['flowers', '#fef3c7', 'Papatyalı'], ['dino', '#bbf7d0', 'Dinozorlu']]
  .forEach(([pt, c, n], i) => add(`wp_p${i}`, 'wallpaper', `${n} Duvar Kağıdı`, 4, { color: c, pattern: pt }));
[['planks', '#c08457', 'Meşe Parke'], ['planks', '#8b5a2b', 'Ceviz Parke'], ['planks', '#e7c9a0', 'Akçaağaç Parke'], ['planks', '#57534e', 'Gri Parke'], ['planks', '#f5f5f4', 'Beyaz Parke'], ['planks', '#9a3412', 'Kızıl Parke'],
  ['checker', '#fef3c7', 'Krem Dama'], ['checker', '#fecaca', 'Kırmızı Dama'], ['checker', '#bfdbfe', 'Mavi Dama'], ['checker', '#bbf7d0', 'Yeşil Dama'], ['checker', '#f5d0fe', 'Mor Dama'],
  ['tiles', '#e2e8f0', 'Gri Fayans'], ['tiles', '#fef9c3', 'Sarı Fayans'], ['tiles', '#ccfbf1', 'Turkuaz Fayans'], ['tiles', '#fce7f3', 'Pembe Fayans'], ['tiles', '#f8fafc', 'Mermer'], ['tiles', '#d6d3d1', 'Taş Zemin'], ['tiles', '#1f2937', 'Siyah Mermer'],
  ['carpet', '#93c5fd', 'Mavi Halıfleks'], ['carpet', '#f9a8d4', 'Pembe Halıfleks'], ['carpet', '#86efac', 'Yeşil Halıfleks'], ['carpet', '#c4b5fd', 'Mor Halıfleks'], ['carpet', '#fde68a', 'Sarı Halıfleks'], ['carpet', '#a8a29e', 'Gri Halıfleks'], ['carpet', '#ef4444', 'Kırmızı Halıfleks'],
  ['grass', '#4ade80', 'Çim Halı'], ['sand', '#fde68a', 'Kum Zemin'], ['water', '#7dd3fc', 'Su Zemin (cam)'], ['planks', '#b45309', 'Tarçın Parke'], ['tiles', '#a7f3d0', 'Nane Fayans'], ['checker', '#fde68a', 'Sarı Dama'], ['carpet', '#fdba74', 'Turuncu Halıfleks'],
  ['planks', '#d97706', 'Bal Parke'], ['tiles', '#bae6fd', 'Buz Fayans'], ['carpet', '#14b8a6', 'Turkuaz Halıfleks'], ['checker', '#e5e7eb', 'Gri Dama'], ['planks', '#78350f', 'Koyu Parke'], ['tiles', '#fed7aa', 'Şeftali Fayans'],
  ['carpet', '#f8fafc', 'Beyaz Halıfleks'], ['carpet', '#1e3a8a', 'Lacivert Halıfleks'], ['tiles', '#ddd6fe', 'Lila Fayans'], ['planks', '#fcd34d', 'Sarı Parke'], ['checker', '#fbcfe8', 'Pembe Dama'], ['grass', '#16a34a', 'Koyu Çim']]
  .forEach(([pt, c, n], i) => add(`fl_g${i}`, 'floor', n, 3, { color: c, pattern: pt }));

// ---------------- ODA EŞYALARI (ek) ----------------
[['bed', '#22c55e', 'Yeşil Yatak'], ['bed', '#8b5cf6', 'Mor Yatak'], ['bed', '#facc15', 'Sarı Yatak'], ['bed', '#ef4444', 'Kırmızı Yatak'], ['sofa', '#3b82f6', 'Mavi Kanepe'], ['sofa', '#ec4899', 'Pembe Kanepe'], ['sofa', '#a16207', 'Deri Kanepe'],
  ['wardrobe', '#f8fafc', 'Beyaz Gardırop'], ['wardrobe', '#ec4899', 'Pembe Gardırop'], ['bookshelf', '#f8fafc', 'Beyaz Kitaplık'], ['desk', '#f8fafc', 'Beyaz Çalışma Masası'],
  ['chair', '#ef4444', 'Kırmızı Sandalye'], ['chair', '#22c55e', 'Yeşil Sandalye'], ['chair', '#facc15', 'Sarı Sandalye'], ['armchair', '#0ea5e9', 'Mavi Koltuk'], ['armchair', '#ec4899', 'Pembe Koltuk'],
  ['lamp', '#f472b6', 'Pembe Lamba'], ['lamp', '#22c55e', 'Yeşil Lamba'], ['rug', '#3b82f6', 'Mavi Halı'], ['rug', '#ec4899', 'Pembe Halı'], ['rug', '#22c55e', 'Yeşil Halı'], ['table', '#111827', 'Siyah Masa'], ['toybox', '#3b82f6', 'Mavi Oyuncak Sandığı']]
  .forEach(([d, c, n], i) => add(`f_g${i}`, 'furniture', n, 6 + (i % 5), { draw: d, color: c }, { slot: ['bed', 'sofa', 'wardrobe', 'bookshelf', 'armchair'].includes(d) ? 'big' : d === 'lamp' ? 'lamp' : d === 'rug' ? 'rug' : d === 'toybox' ? 'toy' : 'table', ...(d === 'wardrobe' ? { size: { w: 74, h: 120 } } : d === 'bookshelf' ? { size: { w: 70, h: 110 } } : d === 'desk' ? { size: { w: 96, h: 70 } } : d === 'chair' ? { size: { w: 40, h: 62 } } : d === 'armchair' ? { size: { w: 70, h: 64 } } : d === 'toybox' ? { size: { w: 60, h: 46 } } : {}) }));
[['🎹', 'Piyano'], ['🪀', 'Yoyo'], ['🛹', 'Kaykay'], ['🪁', 'Uçurtma'], ['🧩', 'Yapboz'], ['🎲', 'Zar'], ['🚂', 'Oyuncak Tren'], ['🪆', 'Matruşka'], ['🦕', 'Dinozor Oyuncak'], ['🏆', 'Kupa']]
  .forEach(([e, n], i) => add(`f_e${i}`, 'furniture', n, 4 + (i % 4), { emoji: e }, { slot: 'toy' }));

// ---------------- BAHÇE ----------------
// render.art: MapArt içindeki çizim adı, render.color: renk
[['oak', 'Meşe Ağacı', 0], ['oak2', 'Koyu Meşe', 0], ['birch', 'Huş Ağacı', 0], ['cherry', 'Kiraz Çiçeği Ağacı', 0], ['apple', 'Elma Ağacı', 0], ['orange', 'Portakal Ağacı', 0], ['palm', 'Palmiye', 0], ['willow', 'Söğüt', 0],
  ['bush', 'Çalı', '#4caf50'], ['bush', 'Çiçekli Çalı', '#16a34a', true], ['bush', 'Pembe Çalı', '#f9a8d4', true], ['hedge', 'Budanmış Çit', '#15803d'], ['cone', 'Konik Süs Bitkisi', '#166534'], ['ball', 'Top Süs Bitkisi', '#22c55e'],
  ['tulips', 'Kırmızı Laleler', '#ef4444'], ['tulips', 'Sarı Laleler', '#facc15'], ['tulips', 'Pembe Laleler', '#ec4899'], ['tulips', 'Mor Laleler', '#8b5cf6'], ['roses', 'Güller', '#e11d48'], ['sunflower', 'Ayçiçekleri', '#facc15'], ['daisy', 'Papatyalar', '#fff'], ['lavender', 'Lavanta', '#a78bfa'],
  ['pot', 'Saksı (kırmızı çiçek)', '#ef4444'], ['pot', 'Saksı (sarı çiçek)', '#facc15'], ['pot', 'Saksı (mor çiçek)', '#a855f7'],
  ['fountain', 'Fıskiye', 0], ['pond', 'Süs Havuzu', 0], ['pool', 'Şişme Havuz', '#38bdf8'], ['bench', 'Ahşap Bank', '#a16207'], ['bench', 'Beyaz Bank', '#f8fafc'], ['swing', 'Salıncak', '#ef4444'], ['slide2', 'Kaydırak', '#facc15'], ['sandbox', 'Kum Havuzu', 0], ['trampoline', 'Trambolin', '#3b82f6'],
  ['lamppost', 'Bahçe Lambası', 0], ['mailbox', 'Posta Kutusu', '#ef4444'], ['birdhouse', 'Kuş Evi', '#38bdf8'], ['gnome', 'Bahçe Cücesi', '#ef4444'], ['gnome', 'Mavi Şapkalı Cüce', '#3b82f6'], ['scarecrow', 'Korkuluk', 0],
  ['snowman', 'Kardan Adam', 0], ['picnic', 'Piknik Masası', '#a16207'], ['bbq', 'Mangal', 0], ['umbrella', 'Şemsiye', '#ef4444'], ['umbrella', 'Mavi Şemsiye', '#3b82f6'], ['doghouse', 'Köpek Kulübesi', '#b91c1c'], ['well', 'Kuyu', 0],
  ['pumpkin', 'Balkabakları', '#f97316'], ['veggies', 'Sebze Bahçesi', 0], ['beehive', 'Arı Kovanı', '#facc15'], ['flag', 'Bayrak Direği', '#ef4444'], ['rock', 'Kaya', 0], ['statue', 'Heykel', 0]]
  .forEach(([art, n, c, fl], i) => add(`gd_${i}`, 'garden', n, 3 + (i % 6) * 2, { art, color: c || undefined, flowers: !!fl }));

// ---------------- BAHÇE DOSTLARI ----------------
[['🐥', 'Civciv'], ['🦆', 'Ördek'], ['🐑', 'Kuzu'], ['🐐', 'Keçi'], ['🐄', 'İnek'], ['🦔', 'Kirpi'], ['🐿️', 'Sincap'], ['🦚', 'Tavus Kuşu'], ['🐓', 'Horoz'], ['🦙', 'Lama'], ['🐈‍⬛', 'Kara Kedi'], ['🐕‍🦺', 'Yardımcı Köpek']]
  .forEach(([e, n], i) => add(`pet_g${i}`, 'pet', n, 8 + (i % 4) * 3, { emoji: e }));

// ---------------- MEKANLAR (ev nerede?) ----------------
export const LOCATIONS = [
  ['loc_meadow', 'Yeşil Çayır', 0, { scene: 'meadow' }],
  ['loc_island', 'Issız Ada', 60, { scene: 'island', water: true }],
  ['loc_beach', 'Sahil Kenarı', 40, { scene: 'beach', water: true }],
  ['loc_forest', 'Orman İçi', 30, { scene: 'forest' }],
  ['loc_mountain', 'Dağ Başı', 45, { scene: 'mountain' }],
  ['loc_snow', 'Karlı Köy', 40, { scene: 'snow' }],
  ['loc_desert', 'Çöl Vahası', 40, { scene: 'desert' }],
  ['loc_lake', 'Göl Kenarı', 45, { scene: 'lake', water: true }],
  ['loc_city', 'Şehir', 50, { scene: 'city' }],
  ['loc_farm', 'Çiftlik', 30, { scene: 'farm' }],
  ['loc_candy', 'Şeker Diyarı', 60, { scene: 'candy' }],
  ['loc_moon', 'Ay Yüzeyi', 120, { scene: 'moon' }],
  ['loc_jungle', 'Tropik Orman', 50, { scene: 'jungle' }],
  ['loc_river', 'Nehir Kenarı', 40, { scene: 'river', water: true }],
  ['loc_cliff', 'Deniz Uçurumu', 70, { scene: 'cliff', water: true }],
  ['loc_night', 'Yıldızlı Gece', 35, { scene: 'night' }],
];
LOCATIONS.forEach(([id, n, p, r]) => add(id, 'location', n, p, r));

export const GENERATED_ITEMS = items;
