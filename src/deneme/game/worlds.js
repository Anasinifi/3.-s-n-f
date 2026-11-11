// ============================================================================
// --- GRUP: 1000 DÜNYA (otomatik açılan haritalar) ---
// ============================================================================
// * 128 farklı MEKÂN var (çayır, çiftlik, piramit, peri bacaları, mercan resifi, ay yüzeyi...).
// * Her mekânın KONSEPTLERİ var: gündüz, gece, kış, bahar, gün batımı, sonbahar, festival,
//   büyülü, yağmurlu, sisli. Konsept renkleri, havayı, gökyüzünü ve serpiştirilen süsleri değiştirir.
// * Sıralama: önce bütün mekânlar birer kez (ilk 128 dünyanın HEPSİ farklı yer), sonra aynı
//   mekânlar başka konseptle gelir. Böylece çocuk her yeni haritada başka bir yere girdiğini hisseder.
// * Toplam 1000 dünya. (1000'den sonra baştan "2" ekiyle devam eder.)
// * Hazır 7 harita (Sihirli Orman, Okyanus...) ve yöneticinin haritaları her zaman önce gelir.

// --- ARAZİ AİLELERİ (zemin, desen, ada tipi, yol, geçiş hareketi) ---
const FAM = {
  meadow: { bg: ['#a7e06a', '#5fb53a'], pattern: 'tuft', base: 'clearing', baseFill: '#c9ef95', baseStroke: '#7cb84a', path: 'dirt', crossing: 'walk', art: 'forest', scenery: 'hills' },
  forest: { bg: ['#7cc35a', '#3f8a2a'], pattern: 'tuft', base: 'clearing', baseFill: '#a8d97a', baseStroke: '#6fae45', path: 'dirt', crossing: 'chop', density: 0.66, art: 'forest', scenery: 'trees' },
  desert: { bg: ['#fde9a8', '#efbf62'], pattern: 'dune', base: 'clearing', baseFill: '#f9dc94', baseStroke: '#d9a748', path: 'sand', crossing: 'walk', particle: 'sand', art: 'desert' },
  snow: { bg: ['#f4f9ff', '#cfe6fb'], pattern: 'dots', patternColor: '#93c5fd', base: 'clearing', baseFill: '#ffffff', baseStroke: '#93c5fd', path: 'ice', crossing: 'slide', particle: 'snow', art: 'ice', scenery: 'mountains', sceneryColor: '#cbd5e1' },
  ocean: { bg: ['#4fc3f7', '#0288d1'], pattern: 'wave', base: 'island', path: 'foam', crossing: 'swim', water: true, density: 0.2, art: 'ocean' },
  beach: { bg: ['#67e8f9', '#0891b2'], pattern: 'wave', base: 'island', sand: '#fde7a3', path: 'foam', crossing: 'swim', water: true, density: 0.2, art: 'ocean', scenery: 'palms' },
  candy: { bg: ['#ffe4ef', '#f9b4d4'], pattern: 'dots', patternColor: '#f472b6', base: 'clearing', baseFill: '#fff0f6', baseStroke: '#f472b6', path: 'choco', stones: 'candy', crossing: 'hop', art: 'candy' },
  jungle: { bg: ['#9ccc65', '#4e7a26'], pattern: 'tuft', base: 'clearing', baseFill: '#b5d77a', baseStroke: '#7c9a3e', path: 'mud', stones: 'rock', crossing: 'hop', density: 0.6, art: 'dino', scenery: 'trees' },
  savanna: { bg: ['#e2e58f', '#a8a63e'], pattern: 'tuft', base: 'clearing', baseFill: '#eef0a8', baseStroke: '#a3a33a', path: 'sand', crossing: 'walk', art: 'desert', scenery: 'hills', sceneryColor: '#b5b04a' },
  space: { bg: ['#1e1b4b', '#020617'], pattern: 'sparkles', base: 'planet', path: 'orbit', crossing: 'fly', particle: 'star', density: 0.3, glowSpots: '#a855f7', art: 'space', space: true },
  moon: { bg: ['#64748b', '#1e293b'], pattern: 'craters', base: 'clearing', baseFill: '#cbd5e1', baseStroke: '#64748b', path: 'orbit', stones: 'crater', crossing: 'hop', particle: 'star', art: 'space', space: true },
  lava: { bg: ['#57281c', '#1c0a0a'], pattern: 'cracks', base: 'rock', baseFill: '#78716c', baseStroke: '#292524', path: 'lava', stones: 'rock', crossing: 'hop', particle: 'ember', art: 'dino', scenery: 'volcano' },
  sky: { bg: ['#c7ecff', '#7cc7f5'], base: 'cloud', baseFill: '#ffffff', path: 'cloudpath', stones: 'cloud', crossing: 'fly', density: 0.22, art: 'forest', scenery: 'clouds' },
  underwater: { bg: ['#0e7490', '#082f49'], pattern: 'dots', patternColor: '#e0f2fe', base: 'reef', sand: '#fcd34d', path: 'bubbles', crossing: 'swim', water: true, particle: 'bubble', density: 0.36, art: 'ocean', scenery: 'reefwall' },
  cave: { bg: ['#4a3f6b', '#16112a'], pattern: 'cobble', patternColor: '#000000', base: 'rock', baseFill: '#7c6f9e', baseStroke: '#3b3355', path: 'mine', crossing: 'walk', particle: 'sparkle', glowSpots: '#22d3ee', art: 'dino', scenery: 'crystals' },
  city: { bg: ['#d1d9e3', '#94a3b8'], pattern: 'tiles', base: 'plaza', baseFill: '#e2e8f0', baseStroke: '#64748b', path: 'road', crossing: 'walk', art: 'desert', scenery: 'skyline' },
  toy: { bg: ['#fff7d6', '#fde68a'], pattern: 'checker', patternColor: '#f472b6', base: 'plaza', baseFill: '#ffffff', baseStroke: '#f472b6', path: 'track', stones: 'blocks', crossing: 'hop', art: 'candy' },
  swamp: { bg: ['#8a9a5b', '#4b5320'], pattern: 'tuft', base: 'clearing', baseFill: '#a3b06b', baseStroke: '#5c6b2e', path: 'boardwalk', stones: 'lily', crossing: 'hop', particle: 'firefly', ponds: true, art: 'dino' },
  farm: { bg: ['#a3d977', '#6aa84f'], pattern: 'rows', patternColor: '#3f6212', base: 'clearing', baseFill: '#e3cf96', baseStroke: '#a1824a', path: 'dirt', crossing: 'walk', art: 'forest', scenery: 'hills' },
  canyon: { bg: ['#f6b27a', '#b45f2a'], pattern: 'strata', patternColor: '#7c2d12', base: 'clearing', baseFill: '#f8c99a', baseStroke: '#c2410c', path: 'sand', crossing: 'walk', particle: 'sand', scenery: 'mesa', art: 'desert' },
  autumn: { bg: ['#f6c26b', '#d9822b'], pattern: 'tuft', base: 'clearing', baseFill: '#fcd38a', baseStroke: '#c2410c', path: 'dirt', crossing: 'walk', particle: 'leaf', art: 'forest', scenery: 'hills', sceneryColor: '#c2410c' },
  white: { bg: ['#f8fafc', '#cbd5e1'], pattern: 'dots', patternColor: '#94a3b8', base: 'clearing', baseFill: '#ffffff', baseStroke: '#94a3b8', path: 'cobble', crossing: 'walk', art: 'ice' },
};

// --- MEKÂNLAR --- [aile, ad, emoji, süsler, ada simgeleri, ek ayarlar]
// süsler: [ad, ağırlık] · ada simgeleri: 5 tane (sırayla adalara)
const P = (k, name, emoji, decor, lm, extra = {}) => ({ k, name, emoji, decor, lm, ...extra });
const PLACES = [
  P('meadow', 'Çiçekli Çayır', '🌼', [['flowers', 3], ['daisy', 2], ['tulips', 2], ['butterfly', 1], ['bush', 1], ['bee', 1]], ['windmill', 'well', 'beehive', 'swing', 'cottage']),
  P('underwater', 'Mercan Resifi', '🪸', [['coral', 3], ['seaweed', 2], ['fish', 2], ['starfish', 1], ['shell', 1]], ['coral', 'shell', 'chest', 'starfish', 'fish']),
  P('desert', 'Piramitler', '🔺', [['cactus', 1], ['rock', 2], ['palm', 1], ['bones', 1]], ['pyramid', 'obelisk', 'camel', 'column', 'temple'], { scenery: 'pyramids' }),
  P('snow', 'Kuzey Kutbu', '🐧', [['penguin', 3], ['snowrock', 2], ['icecrystal', 1], ['snowpine', 1]], ['igloo', 'penguin', 'polarbear', 'icicles', 'sled'], { scenery: 'icebergs' }),
  P('candy', 'Çikolata Fabrikası', '🍫', [['chocolate', 3], ['cookie', 2], ['candycane', 1]], ['chocolate', 'cake', 'cookie', 'cupcake', 'candycane'], { bg: ['#fde7c8', '#c08457'], baseFill: '#fff7ed', baseStroke: '#92400e' }),
  P('space', 'Halka Gezegeni', '🪐', [['asteroid', 3], ['crystal', 1]], ['rocket', 'satellite', 'ufo', 'moonflag', 'crystal'], { scenery: 'planet' }),
  P('forest', 'Mantar Köyü', '🍄', [['mushroom', 4], ['fern', 2], ['flowers', 1], ['oak', 2]], ['mushroomhouse', 'glowshroom', 'mushroom', 'snail', 'mushroomhouse']),
  P('canyon', 'Peri Bacaları', '🎈', [['fairychimney', 3], ['hotballoon', 2], ['rock', 1]], ['fairychimney', 'hotballoon', 'fairychimney', 'domehouse', 'teapot'], { scenery: 'chimneys', crossing: 'walk' }),
  P('ocean', 'Korsan Adaları', '🏴‍☠️', [['rock', 2], ['fish', 1], ['pirateship', 1]], ['pirateship', 'chest', 'palm', 'anchor', 'hut']),
  P('farm', 'Çiftlik Köyü', '🐄', [['haystack', 2], ['sheep', 2], ['cow', 2], ['veggies', 2], ['bush', 1]], ['barn', 'haystack', 'well', 'scarecrow', 'cottage']),
  P('cave', 'Kristal Mağarası', '💎', [['crystal', 3], ['stalagmite', 2]], ['crystal', 'lantern', 'minecart', 'chest', 'crystal']),
  P('sky', 'Bulutlar Ülkesi', '☁️', [['cloud', 2], ['rainbow', 1], ['bird', 1]], ['rainbow', 'castle', 'balloons', 'kite', 'hotballoon'], { landmarkColor: '#ffffff' }),
  P('jungle', 'Kayıp Tapınak', '🗿', [['fern', 3], ['palm', 2], ['parrot', 1]], ['temple', 'ruins', 'column', 'chest', 'torch']),
  P('toy', 'Oyuncak Şehri', '🧸', [['blocks', 2], ['teddy', 1], ['balloons', 1]], ['teddy', 'blocks', 'trainengine', 'drum', 'balloons']),
  P('moon', 'Ay Yüzeyi', '🌙', [['rock', 2], ['asteroid', 1]], ['moonflag', 'rover', 'rocket', 'satellite', 'ufo']),
  P('lava', 'Lav Vadisi', '🔥', [['lavarock', 3], ['bones', 1]], ['lavarock', 'torch', 'dinoegg', 'goldpile', 'dragon']),
  P('beach', 'Kumsal Tatili', '🏖️', [['shell', 1], ['starfish', 1], ['rock', 1]], ['umbrella', 'sandcastle', 'beachball', 'crab', 'shell']),
  P('meadow', 'Kiraz Çiçekleri', '🌸', [['cherry', 4], ['lantern', 1], ['flowers', 1]], ['pagoda', 'cherry', 'lantern', 'teacup', 'bench'], { bg: ['#d9f99d', '#86b84a'], particle: 'petal' }),
  P('savanna', 'Safari Savanası', '🦒', [['acacia', 3], ['rock', 1], ['bush', 1]], ['giraffe', 'elephant', 'acacia', 'tent', 'baobab']),
  P('swamp', 'Kurbağa Bataklığı', '🐸', [['reeds', 3], ['lilypad', 2], ['frog', 2], ['log', 1]], ['frog', 'reeds', 'deadtree', 'lantern', 'log']),
  P('city', 'Lunapark', '🎡', [['balloons', 2], ['lamppost', 1], ['bunting', 1]], ['ferris', 'circustent', 'balloons', 'icecream', 'notes']),
  P('autumn', 'Sonbahar Ormanı', '🍂', [['maple', 4], ['leafpile', 2], ['mushroom', 1]], ['cottage', 'maple', 'leafpile', 'owl', 'stump']),
  P('white', 'Pamukkale Terasları', '🏞️', [['travertine', 2], ['rock', 1]], ['travertine', 'column', 'ruins', 'umbrella', 'bench'], { bg: ['#f8fafc', '#bae6fd'] }),
  P('forest', 'Bambu Ormanı', '🎋', [['bamboo', 5], ['rock', 1]], ['pagoda', 'panda', 'bamboo', 'lantern', 'teapot'], { crossing: 'walk' }),
  P('underwater', 'Batık Gemi', '🚢', [['seaweed', 2], ['fish', 2], ['coral', 1]], ['shipwreck', 'chest', 'anchor', 'coral', 'fish']),
  P('candy', 'Dondurma Tepeleri', '🍦', [['icecream', 4], ['cupcake', 1]], ['icecream', 'cupcake', 'shop', 'lollipop', 'icecream']),
  P('space', 'Uzaylı Bahçesi', '👽', [['alienplant', 3], ['crystal', 1]], ['ufo', 'alienplant', 'crystal', 'domehouse', 'rover'], { bg: ['#312e81', '#14532d'], glowSpots: '#22c55e' }),
  P('meadow', 'Kraliyet Sarayı', '👑', [['hedge', 3], ['roses', 2], ['statue', 1]], ['castle', 'fountain', 'statue', 'roses', 'column'], { scenery: 'castle' }),
  P('ocean', 'Deniz Feneri Koyu', '🗼', [['rock', 2], ['whaletail', 1]], ['lighthouse', 'boat', 'anchor', 'hut', 'lighthouse']),
  P('snow', 'Buz Sarayı', '❄️', [['icecrystal', 3], ['snowpine', 2]], ['castle', 'icecrystal', 'icicles', 'lantern', 'snowman'], { landmarkColor: '#bae6fd' }),
  P('farm', 'Ayçiçeği Tarlası', '🌻', [['sunflower', 5], ['haystack', 1]], ['scarecrow', 'haystack', 'barn', 'sunflower', 'windmill']),
  P('cave', 'Cüce Madeni', '⛏️', [['stalagmite', 2], ['minecart', 1], ['goldpile', 1]], ['minecart', 'goldpile', 'lantern', 'torch', 'chest']),
  P('desert', 'Vaha', '🌴', [['palm', 3], ['pond', 1], ['cactus', 1]], ['pond', 'palm', 'camel', 'tent', 'well']),
  P('toy', 'Kitap Diyarı', '📚', [['books', 3], ['pencil', 1]], ['books', 'pencil', 'clocktower', 'lamppost', 'blocks'], { bg: ['#fef9c3', '#fcd34d'], patternColor: '#a16207' }),
  P('jungle', 'Yağmur Ormanı', '🌿', [['fern', 3], ['palm', 2], ['parrot', 1], ['monkey', 1]], ['parrot', 'ruins', 'monkey', 'treehouse', 'torch'], { particle: 'rain' }),
  P('sky', 'Gökyüzü Kalesi', '🏰', [['cloud', 2], ['bird', 1]], ['castle', 'flag', 'rainbow', 'hotballoon', 'lantern']),
  P('beach', 'Kaplumbağa Sahili', '🐢', [['shell', 1], ['starfish', 1]], ['turtle', 'shell', 'umbrella', 'starfish', 'palm']),
  P('meadow', 'Peri Bahçesi', '🧚', [['glowshroom', 2], ['flowers', 3], ['butterfly', 2], ['mushroom', 1]], ['mushroomhouse', 'glowshroom', 'crystal', 'giantflower', 'fountain'], { bg: ['#f5d0fe', '#86b84a'], particle: 'sparkle' }),
  P('canyon', 'Kızıl Kanyon', '🪨', [['rock', 3], ['cactus', 2]], ['rock', 'cactus', 'signpost', 'bones', 'tent']),
  P('city', 'Tren İstasyonu', '🚂', [['lamppost', 1], ['bench', 1], ['bush', 1]], ['trainengine', 'signpost', 'clocktower', 'shop', 'lamppost']),
  P('underwater', 'Denizanası Lagünü', '🪼', [['jellyfish', 3], ['seaweed', 2]], ['jellyfish', 'coral', 'shell', 'fish', 'crystal'], { bg: ['#1e40af', '#0c1445'] }),
  P('moon', 'Kızıl Gezegen', '🔴', [['rock', 2], ['crystal', 1]], ['rover', 'rocket', 'moonflag', 'crystal', 'satellite'], { bg: ['#f87171', '#7f1d1d'], baseFill: '#fca5a5', baseStroke: '#b91c1c' }),
  P('forest', 'Baykuş Ormanı', '🦉', [['pine', 3], ['oak', 2], ['owl', 1]], ['owl', 'treehouse', 'lantern', 'stump', 'mushroom'], { bg: ['#4d7c3a', '#1f3d1a'] }),
  P('candy', 'Pasta Kasabası', '🎂', [['cupcake', 3], ['cake', 1], ['donut', 2]], ['cake', 'cupcake', 'donut', 'shop', 'lollipop']),
  P('snow', 'Kayak Merkezi', '🎿', [['snowpine', 4], ['snowman', 1]], ['cottage', 'sled', 'snowman', 'signpost', 'flag']),
  P('ocean', 'Tropik Adalar', '🏝️', [['rock', 1], ['fish', 1]], ['hut', 'palm', 'umbrella', 'beachball', 'crab']),
  P('savanna', 'Baobab Ovası', '🌳', [['baobab', 3], ['bush', 1]], ['baobab', 'elephant', 'giraffe', 'hut', 'campfire']),
  P('farm', 'Elma Bahçesi', '🍎', [['appletree', 4], ['bush', 1]], ['appletree', 'picnic', 'well', 'barn', 'haystack']),
  P('lava', 'Ejderha Dağı', '🐉', [['lavarock', 2], ['bones', 1], ['goldpile', 1]], ['dragon', 'chest', 'goldpile', 'torch', 'castle']),
  P('meadow', 'Gökkuşağı Vadisi', '🌈', [['flowers', 3], ['cloud', 1], ['butterfly', 1]], ['rainbow', 'giantflower', 'balloons', 'kite', 'fountain'], { sky: 'rainbow' }),
  P('cave', 'Parlayan Mantarlar', '🍄', [['glowshroom', 4], ['stalagmite', 1]], ['glowshroom', 'mushroomhouse', 'crystal', 'lantern', 'snail'], { landmarkColor: '#22d3ee' }),
  P('toy', 'Satranç Bahçesi', '♟️', [['hedge', 1], ['bush', 1]], ['chessking', 'chessknight', 'chessking', 'chessknight', 'bench'], { bg: ['#f1f5f9', '#cbd5e1'], patternColor: '#1f2937' }),
  P('desert', 'Kum Tepeleri', '🏜️', [['cactus', 2], ['rock', 2], ['bones', 1]], ['cactus', 'camel', 'tent', 'bones', 'signpost']),
  P('swamp', 'Sisli Bataklık', '🌫️', [['deadtree', 2], ['reeds', 2], ['glowshroom', 1]], ['deadtree', 'lantern', 'glowshroom', 'owl', 'stump'], { fog: true }),
  P('space', 'Uzay İstasyonu', '🛰️', [['asteroid', 2], ['satellite', 1]], ['satellite', 'rocket', 'domehouse', 'robot', 'satellite'], { landmarkColor: '#e2e8f0' }),
  P('meadow', 'Piknik Parkı', '🧺', [['oak', 2], ['bench', 1], ['flowers', 2], ['kite', 1]], ['picnic', 'bench', 'swing', 'fountain', 'kite']),
  P('ocean', 'Deniz Kulesi', '🗼', [['rock', 2], ['boat', 1]], ['maidentower', 'boat', 'lighthouse', 'anchor', 'maidentower']),
  P('forest', 'Ağaç Ev Köyü', '🏡', [['oak', 3], ['pine', 2]], ['treehouse', 'signpost', 'swing', 'birdhouse', 'treehouse']),
  P('desert', 'Fosil Kazısı', '🦴', [['bones', 3], ['rock', 2]], ['bones', 'dinoegg', 'tent', 'signpost', 'chest']),
  P('toy', 'Müzik Kasabası', '🎵', [['notes', 2], ['bush', 1]], ['drum', 'notes', 'shop', 'lamppost', 'notes'], { bg: ['#ede9fe', '#c4b5fd'], patternColor: '#7c3aed' }),
  P('snow', 'Kardan Adam Köyü', '☃️', [['snowman', 3], ['snowpine', 2]], ['snowman', 'igloo', 'sled', 'gift', 'lantern']),
  P('beach', 'Kum Kalesi Plajı', '🏰', [['shell', 2], ['starfish', 1]], ['sandcastle', 'shell', 'starfish', 'umbrella', 'sandcastle']),
  P('farm', 'Üzüm Bağı', '🍇', [['grapevine', 4], ['bush', 1]], ['grapevine', 'cottage', 'well', 'barn', 'signpost']),
  P('jungle', 'Maymun Ağaçları', '🐒', [['palm', 3], ['fern', 2], ['monkey', 1]], ['monkey', 'treehouse', 'parrot', 'hut', 'palm']),
  P('city', 'Kasaba Meydanı', '🏘️', [['lamppost', 1], ['bench', 1], ['bush', 2]], ['fountain', 'shop', 'clocktower', 'cottage', 'lamppost']),
  P('underwater', 'Deniz Altı Şehri', '🫧', [['seaweed', 2], ['coral', 2], ['fish', 1]], ['domehouse', 'submarine', 'coral', 'chest', 'domehouse'], { landmarkColor: '#67e8f9' }),
  P('meadow', 'Tavşan Tepesi', '🐰', [['rabbit', 2], ['flowers', 2], ['bush', 2]], ['rabbit', 'veggies', 'cottage', 'well', 'signpost']),
  P('sky', 'Rüzgar Adaları', '🌬️', [['cloud', 2], ['kite', 1], ['bird', 1]], ['windmill', 'kite', 'flag', 'hotballoon', 'balloons']),
  P('candy', 'Kurabiye Köyü', '🍪', [['cookie', 3], ['gumdrop', 2]], ['cookie', 'cottage', 'gumdrop', 'cake', 'candycane'], { bg: ['#fff1d6', '#e8b46a'], baseFill: '#fff7ed', baseStroke: '#b45309', landmarkColor: '#d6a35c' }),
  P('moon', 'Peynir Gezegeni', '🧀', [['cheese', 2], ['rock', 1]], ['cheese', 'rocket', 'moonflag', 'cheese', 'ufo'], { bg: ['#fde68a', '#ca8a04'], baseFill: '#fef3c7', baseStroke: '#a16207' }),
  P('forest', 'Masal Ormanı', '📖', [['mushroom', 2], ['oak', 2], ['flowers', 2]], ['mushroomhouse', 'cottage', 'well', 'books', 'gnome']),
  P('white', 'Antik Kent', '🏛️', [['column', 2], ['ruins', 2], ['rock', 1]], ['column', 'ruins', 'temple', 'statue', 'obelisk'], { bg: ['#fef3c7', '#d6c39a'], baseFill: '#fffbeb', baseStroke: '#a8a29e' }),
  P('swamp', 'Nilüfer Gölü', '🪷', [['lilypad', 4], ['reeds', 2], ['frog', 1]], ['frog', 'duck', 'reeds', 'boat', 'willow'], { bg: ['#5eead4', '#0f766e'], ponds: false }),
  P('lava', 'Ateş Adaları', '🌋', [['lavarock', 2], ['torch', 1]], ['torch', 'lavarock', 'chest', 'hut', 'dinoegg']),
  P('cave', 'Hazine Mağarası', '💰', [['goldpile', 2], ['stalagmite', 2]], ['chest', 'goldpile', 'torch', 'crystal', 'minecart']),
  P('meadow', 'Kelebek Vadisi', '🦋', [['butterfly', 3], ['flowers', 3], ['giantflower', 1]], ['giantflower', 'fountain', 'swing', 'birdhouse', 'giantflower']),
  P('ocean', 'Balina Körfezi', '🐋', [['whaletail', 2], ['rock', 1]], ['boat', 'lighthouse', 'hut', 'anchor', 'flag']),
  P('farm', 'Mısır Tarlası', '🌽', [['corn', 4]], ['corn', 'scarecrow', 'barn', 'haystack', 'well']),
  P('space', 'Kristal Gezegen', '🔮', [['crystal', 4]], ['crystal', 'ufo', 'rocket', 'goldpile', 'crystal'], { landmarkColor: '#f0abfc', glowSpots: '#f0abfc' }),
  P('snow', 'Kuzey Işıkları', '🌌', [['snowpine', 3], ['icecrystal', 1]], ['igloo', 'tent', 'campfire', 'polarbear', 'lantern'], { sky: 'aurora', bg: ['#c7d2fe', '#94a3b8'] }),
  P('meadow', 'Arı Bahçesi', '🐝', [['bee', 2], ['flowerbush', 3], ['flowers', 3]], ['beehive', 'giantflower', 'beehive', 'bench', 'well']),
  P('desert', 'Kaktüs Vadisi', '🌵', [['cactus', 5]], ['cactus', 'rock', 'signpost', 'campfire', 'hut']),
  P('city', 'Robot Şehri', '🤖', [['gear', 2], ['lamppost', 1]], ['robot', 'gear', 'skyscraper', 'robot', 'gear'], { bg: ['#bfdbfe', '#64748b'] }),
  P('jungle', 'Dinozor Yuvası', '🥚', [['fern', 3], ['bones', 1], ['rock', 1]], ['dinoegg', 'fern', 'bones', 'dinoegg', 'mossrock'], { scenery: 'volcano' }),
  P('beach', 'Yunus Körfezi', '🐬', [['dolphin', 1], ['rock', 1]], ['boat', 'hut', 'umbrella', 'lighthouse', 'beachball']),
  P('forest', 'Kamp Gölü', '⛺', [['pine', 4], ['rock', 1], ['log', 1]], ['tent', 'campfire', 'boat', 'tent', 'signpost'], { ponds: true, landmarkColor: '#22c55e' }),
  P('toy', 'Sanat Atölyesi', '🎨', [['pencil', 2], ['blocks', 1]], ['pencil', 'books', 'rainbow', 'balloons', 'shop']),
  P('meadow', 'Rüzgar Değirmenleri', '🌀', [['tulips', 3], ['windmill', 1], ['bush', 1]], ['windmill', 'cottage', 'windmill', 'bench', 'tulips']),
  P('autumn', 'Balkabağı Tarlası', '🎃', [['pumpkin', 4], ['haystack', 1]], ['pumpkin', 'scarecrow', 'barn', 'haystack', 'lantern'], { pattern: 'rows', patternColor: '#9a3412' }),
  P('sky', 'Uçan Adalar', '🏝️', [['cloud', 2], ['bird', 2]], ['treehouse', 'cottage', 'windmill', 'well', 'bench'], { base: 'island', shallow: '#e0f2fe', baseFill: '#5cbf4a' }),
  P('underwater', 'Mavi Mağara', '💙', [['crystal', 2], ['seaweed', 2]], ['crystal', 'chest', 'jellyfish', 'anchor', 'coral'], { bg: ['#0369a1', '#0c1a3a'], decorColor: '#7dd3fc', landmarkColor: '#7dd3fc' }),
  P('canyon', 'Balon Festivali', '🎈', [['hotballoon', 3], ['rock', 1]], ['hotballoon', 'tent', 'hotballoon', 'flag', 'picnic'], { scenery: 'balloons' }),
  P('city', 'Saat Kulesi Kasabası', '🕰️', [['lamppost', 1], ['bush', 2]], ['clocktower', 'shop', 'fountain', 'lamppost', 'bench']),
  P('snow', 'Yılbaşı Köyü', '🎄', [['xmastree', 3], ['gift', 2], ['snowpine', 1]], ['xmastree', 'cottage', 'gift', 'snowman', 'lantern']),
  P('farm', 'Çay Bahçesi', '🍵', [['bush', 4], ['bench', 1]], ['teapot', 'teacup', 'cottage', 'signpost', 'bench'], { bg: ['#86efac', '#15803d'], decorColor: '#15803d', scenery: 'hills', sceneryColor: '#166534' }),
  P('moon', 'Kuyruklu Yıldız Yolu', '☄️', [['asteroid', 3]], ['rocket', 'satellite', 'ufo', 'asteroid', 'moonflag'], { bg: ['#1e293b', '#020617'], particle: 'meteor' }),
  P('meadow', 'Koyun Otlağı', '🐑', [['sheep', 4], ['flowers', 1]], ['sheep', 'barn', 'well', 'signpost', 'haystack']),
  P('cave', 'Yeraltı Gölü', '🌊', [['stalagmite', 2], ['crystal', 1]], ['boat', 'crystal', 'lantern', 'stalagmite', 'chest'], { ponds: true, path: 'water', crossing: 'swim' }),
  P('jungle', 'Dikilitaş Ormanı', '🗿', [['fern', 3], ['palm', 1]], ['obelisk', 'torch', 'ruins', 'temple', 'campfire']),
  P('ocean', 'Liman Kasabası', '⚓', [['boat', 1], ['rock', 1]], ['boat', 'anchor', 'lighthouse', 'shop', 'cottage']),
  P('candy', 'Şekerleme Dükkanı', '🍭', [['lollipop', 3], ['gumdrop', 2]], ['shop', 'lollipop', 'gumdrop', 'candycane', 'donut']),
  P('white', 'Tuz Gölü', '🦩', [['flamingo', 3], ['rock', 1]], ['flamingo', 'umbrella', 'signpost', 'tent', 'flamingo'], { bg: ['#fdf2f8', '#e2e8f0'] }),
  P('forest', 'Dev Ağaçlar', '🌳', [['oak', 4], ['pine', 2]], ['treehouse', 'oak', 'stump', 'birdhouse', 'log']),
  P('meadow', 'Tahta At Kalesi', '🐴', [['flag', 1], ['bush', 2], ['rock', 1]], ['woodenhorse', 'castle', 'column', 'flag', 'tent'], { scenery: 'castle' }),
  P('city', 'Bilim Laboratuvarı', '🔬', [['gear', 2], ['robot', 1]], ['robot', 'rocket', 'gear', 'satellite', 'domehouse']),
  P('farm', 'Çilek Tarlası', '🍓', [['strawberry', 4]], ['strawberry', 'barn', 'picnic', 'scarecrow', 'well']),
  P('snow', 'Penguen Koyu', '🐧', [['penguin', 2], ['snowrock', 2]], ['penguin', 'igloo', 'polarbear', 'boat', 'flag'], { base: 'floe', water: true, bg: ['#7dd3fc', '#0369a1'], pattern: 'wave', crossing: 'swim', density: 0.18 }),
  P('meadow', 'Cüceler Bahçesi', '🧙', [['gnome', 2], ['mushroom', 2], ['flowers', 2]], ['gnome', 'mushroomhouse', 'well', 'veggies', 'lantern']),
  P('desert', 'Kovboy Kasabası', '🤠', [['cactus', 2], ['rock', 1]], ['shop', 'signpost', 'well', 'barn', 'haystack']),
  P('sky', 'Pamuk Şeker Bulutları', '🍬', [['cloud', 2], ['lollipop', 1]], ['lollipop', 'cupcake', 'balloons', 'candycane', 'rainbow'], { bg: ['#fce7f3', '#f9a8d4'], baseFill: '#fdf2f8' }),
  P('swamp', 'Ateş Böceği Gölü', '✨', [['reeds', 2], ['lilypad', 2], ['oak', 1]], ['lantern', 'tent', 'campfire', 'glowshroom', 'owl'], { bg: ['#4d6b3a', '#1f2d17'] }),
  P('toy', 'Blok Kasabası', '🧱', [['blocks', 3]], ['blocks', 'trainengine', 'teddy', 'blocks', 'balloons'], { bg: ['#dbeafe', '#93c5fd'], patternColor: '#2563eb', baseStroke: '#2563eb' }),
  P('farm', 'Buğday Tarlası', '🌾', [['wheat', 4]], ['windmill', 'haystack', 'wheat', 'barn', 'scarecrow'], { bg: ['#fde68a', '#ca8a04'], patternColor: '#a16207' }),
  P('ocean', 'Volkan Adası', '🌋', [['rock', 2]], ['hut', 'torch', 'palm', 'dinoegg', 'chest'], { scenery: 'volcano' }),
  P('meadow', 'Dağ Köyü', '⛰️', [['pine', 3], ['rock', 2]], ['cottage', 'well', 'signpost', 'flag', 'cottage'], { scenery: 'mountains', bg: ['#bbf7d0', '#4d8a3a'] }),
  P('city', 'Gece Şehri', '🌃', [['lamppost', 2]], ['skyscraper', 'lamppost', 'shop', 'skyscraper', 'ferris'], { bg: ['#334155', '#0f172a'], baseFill: '#cbd5e1', patternColor: '#ffffff', stars: true }),
  P('space', 'Robot Gezegeni', '🦾', [['gear', 2], ['asteroid', 1]], ['robot', 'gear', 'rocket', 'robot', 'satellite'], { bg: ['#334155', '#0f172a'], glowSpots: '#22d3ee' }),
  P('candy', 'Meyve Pazarı', '🍉', [['watermelon', 2], ['strawberry', 2]], ['watermelon', 'strawberry', 'orangetree', 'shop', 'appletree'], { bg: ['#dcfce7', '#86efac'], baseFill: '#fefce8', baseStroke: '#16a34a' }),
  P('meadow', 'Lale Bahçesi', '🌷', [['tulips', 5], ['bush', 1]], ['windmill', 'fountain', 'bench', 'tulips', 'cottage']),
  P('farm', 'Lavanta Tarlası', '💜', [['lavender', 4], ['bee', 1]], ['cottage', 'bench', 'beehive', 'signpost', 'windmill'], { bg: ['#ddd6fe', '#7c3aed'], patternColor: '#4c1d95' }),
  P('forest', 'Şelale Vadisi', '💧', [['fern', 3], ['rock', 2], ['pine', 1]], ['cottage', 'birdhouse', 'bench', 'mossrock', 'well'], { scenery: 'waterfall' }),
  P('meadow', 'Nehir Kıyısı', '🏞️', [['reeds', 2], ['willow', 2], ['duck', 1]], ['boat', 'duck', 'willow', 'cottage', 'windmill'], { path: 'water', crossing: 'swim' }),
  P('meadow', 'Yayla Şenliği', '🎪', [['sheep', 3], ['flowers', 2]], ['yurt', 'sheep', 'well', 'tent', 'signpost']),
  P('city', 'Sirk Meydanı', '🎪', [['bunting', 2], ['balloons', 2]], ['circustent', 'drum', 'balloons', 'notes', 'flag']),
  P('sky', 'Kuş Yuvaları', '🐦', [['cloud', 2], ['bird', 3]], ['birdhouse', 'oak', 'birdhouse', 'kite', 'flag'], { base: 'island', shallow: '#e0f2fe', baseFill: '#5cbf4a' }),
  P('jungle', 'Papağan Adası', '🦜', [['palm', 3], ['parrot', 2]], ['parrot', 'hut', 'palm', 'chest', 'parrot']),
  P('savanna', 'Fil Vadisi', '🐘', [['acacia', 2], ['baobab', 1], ['rock', 1]], ['elephant', 'baobab', 'tent', 'elephant', 'campfire']),
  P('white', 'Zeytin Ağaçlı Köy', '🫒', [['oak', 2], ['rock', 1], ['bush', 2]], ['cottage', 'well', 'domehouse', 'bench', 'teapot'], { bg: ['#ecfccb', '#a3b18a'], decorColor: '#65a30d' }),
  P('lava', 'Obsidyen Tepeleri', '🖤', [['lavarock', 3], ['crystal', 1]], ['lavarock', 'crystal', 'torch', 'goldpile', 'chest'], { decorColor: '#f97316' }),
];

// --- KONSEPTLER ---
const VARIANTS = [
  { id: 'base', label: '' },
  { id: 'gece', label: 'Gece Işıkları', tint: ['#0b1033', 0.5], stars: true, sky: 'moon', particle: 'firefly', decor: [['lantern', 2]] },
  { id: 'kis', label: 'Kış Masalı', tint: ['#ffffff', 0.3], snowCover: true, particle: 'snow', decor: [['snowman', 1], ['snowpine', 2]] },
  { id: 'bahar', label: 'Bahar Şenliği', tint: ['#86efac', 0.08], particle: 'petal', decor: [['tulips', 2], ['cherry', 1], ['butterfly', 1], ['flowers', 2]] },
  { id: 'gunbatimi', label: 'Gün Batımı', tint: ['#f97316', 0.2], sky: 'sun' },
  { id: 'sonbahar', label: 'Sonbahar', tint: ['#c2410c', 0.16], particle: 'leaf', decor: [['maple', 2], ['leafpile', 2], ['pumpkin', 1]] },
  { id: 'festival', label: 'Festival', particle: 'confetti', decor: [['balloons', 2], ['bunting', 2], ['kite', 1]] },
  { id: 'buyulu', label: 'Büyülü Diyar', tint: ['#7c3aed', 0.2], particle: 'sparkle', decor: [['crystal', 2], ['glowshroom', 2]] },
  { id: 'yagmur', label: 'Yağmurlu Gün', tint: ['#334155', 0.25], particle: 'rain', sky: 'rainbow', decor: [['puddle', 2], ['umbrella', 1]] },
  { id: 'sis', label: 'Sisli Sabah', tint: ['#e2e8f0', 0.22], fog: true },
];

// Uzay, deniz altı, mağara, gökyüzü ve lav dünyalarında konseptler kendine göre değişir
const SPACE_V = {
  gece: { label: 'Derin Uzay', sky: null, stars: false, particle: 'star', decor: [['asteroid', 2]] },
  kis: { label: 'Buzlu Yörünge', snowCover: false, particle: 'sparkle', tint: ['#bae6fd', 0.15], decor: [['icecrystal', 2]] },
  bahar: { label: 'Yeşil Nebula', tint: ['#22c55e', 0.16], particle: 'sparkle', decor: [['alienplant', 2]] },
  gunbatimi: { label: 'Kızıl Nebula', sky: null, tint: ['#f43f5e', 0.18] },
  sonbahar: { label: 'Altın Toz', tint: ['#f59e0b', 0.16], particle: 'sparkle', decor: [['goldpile', 1]] },
  festival: { label: 'Işık Şöleni', decor: [['ufo', 1], ['satellite', 1]] },
  buyulu: { label: 'Büyülü Galaksi' },
  yagmur: { label: 'Meteor Yağmuru', tint: null, particle: 'meteor', sky: null, decor: [['asteroid', 2]] },
  sis: { label: 'Mor Sis', tint: ['#a855f7', 0.16] },
};
const FAMILY_V = {
  space: SPACE_V,
  moon: SPACE_V,
  underwater: {
    gece: { label: 'Gece Dalışı', stars: false, sky: null, particle: 'bubble', decor: [['jellyfish', 2]] },
    kis: { label: 'Buzlu Deniz', snowCover: false, particle: 'bubble', tint: ['#e0f2fe', 0.15], decor: [['icecrystal', 2]] },
    bahar: { label: 'Rengarenk Resif', particle: 'bubble', decor: [['coral', 2], ['fish', 2]] },
    gunbatimi: { label: 'Altın Işık', sky: null },
    sonbahar: { label: 'Turuncu Resif', particle: 'bubble', decor: [['coral', 2], ['starfish', 2]] },
    festival: { label: 'Balık Şenliği', particle: 'bubble', decor: [['fish', 3]] },
    buyulu: { label: 'Büyülü Derinlik', particle: 'bubble' },
    yagmur: { label: 'Kabarcık Fırtınası', tint: null, sky: null, particle: 'bubble', decor: [['seaweed', 2]] },
    sis: { label: 'Bulanık Su' },
  },
  cave: {
    gece: { label: 'Karanlık Derinlik', stars: false, sky: null, particle: 'sparkle', decor: [['torch', 2]] },
    kis: { label: 'Buz Kristalleri', snowCover: false, particle: 'sparkle', decor: [['icecrystal', 2], ['icicles', 1]] },
    bahar: { label: 'Yosunlu Tünel', particle: 'sparkle', decor: [['fern', 2], ['glowshroom', 2]] },
    gunbatimi: { label: 'Lav Işığı', sky: null, tint: ['#f97316', 0.18], decor: [['lavarock', 1]] },
    sonbahar: { label: 'Altın Damar', particle: 'sparkle', decor: [['goldpile', 2]] },
    festival: { label: 'Fener Alayı', particle: 'sparkle', decor: [['lantern', 3]] },
    yagmur: { label: 'Damlayan Mağara', sky: null, particle: 'rain', decor: [['puddle', 2]] },
    sis: { label: 'Buhar Tüneli' },
  },
  sky: {
    gece: { label: 'Yıldızlı Gece' },
    kis: { label: 'Kar Bulutları', snowCover: false },
    yagmur: { label: 'Yağmur Bulutları' },
    sis: { label: 'Pus' },
  },
  lava: {
    gece: { label: 'Kızıl Gece', particle: 'ember' },
    kis: { label: 'Kül Karı', snowCover: false, tint: ['#94a3b8', 0.18] },
    bahar: { label: 'Yeşeren Lav', particle: 'ember', decor: [['fern', 2]] },
    sonbahar: { label: 'Altın Lav', particle: 'ember', decor: [['goldpile', 1]] },
    yagmur: { label: 'Kül Yağmuru', sky: null, tint: ['#57534e', 0.2] },
  },
};

export const PLACE_COUNT = PLACES.length;
export const VARIANT_COUNT = VARIANTS.length;
export const GENERATED_WORLD_COUNT = 1000;

// --- konsepte göre renk kaydırma (zemin ve ada rengi) ---
const toRgb = (h) => { let c = String(h || '#888888').replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); const n = parseInt(c, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixC = (a, b, t) => { const A = toRgb(a), B = toRgb(b); return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
const SHIFT = {
  gece: ['#1e1b4b', 0.42, 0.12], kis: ['#f1f5f9', 0.55, 0.55], bahar: ['#bbf7d0', 0.22, 0.15], gunbatimi: ['#fb923c', 0.24, 0.12],
  sonbahar: ['#d97706', 0.34, 0.3], buyulu: ['#c084fc', 0.26, 0.15], yagmur: ['#64748b', 0.28, 0.1], sis: ['#e2e8f0', 0.3, 0.12],
};
const DARK_FAMS = ['space', 'moon', 'underwater', 'cave', 'lava'];

const hash = (s) => Array.from(String(s)).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const cache = new Map();

// i: 0..999 -> dünya (aynı i her zaman aynı dünyayı verir)
export const getGeneratedWorld = (i) => {
  const idx = ((Number(i) || 0) % GENERATED_WORLD_COUNT + GENERATED_WORLD_COUNT) % GENERATED_WORLD_COUNT;
  if (cache.has(idx)) return cache.get(idx);
  const place = PLACES[idx % PLACE_COUNT];
  const vi = Math.floor(idx / PLACE_COUNT) % VARIANT_COUNT;
  const fam = FAM[place.k] || FAM.meadow;
  const baseV = VARIANTS[vi];
  const famV = (FAMILY_V[place.k] || {})[baseV.id] || {};
  const variant = { ...baseV, ...famV };
  if (place.sky && !variant.sky && vi === 0) variant.sky = place.sky;
  if (place.stars && vi === 0) variant.stars = true;
  if (place.fog) variant.fog = true;
  const { k, name, emoji, decor, lm, ...extra } = place;
  const wt = {
    ...fam,
    ...extra,
    family: k,
    decor,
    landmarks: lm,
    variant,
  };
  // konsept renkleri: zemin ve adalar konsepte göre değişir (kışta beyazlaşır, sonbaharda turunculaşır...)
  const sh = SHIFT[variant.id];
  if (sh && !(DARK_FAMS.includes(k) && ['kis', 'bahar', 'sonbahar'].includes(variant.id)) && !(k === 'snow' && variant.id === 'kis')) {
    const amt = DARK_FAMS.includes(k) ? sh[1] * 0.5 : sh[1];
    wt.bg = (wt.bg || ['#86c95a', '#4f9a2f']).map(c => mixC(c, sh[0], amt));
    if (wt.baseFill) wt.baseFill = mixC(wt.baseFill, sh[0], sh[2]);
    if (wt.baseStroke) wt.baseStroke = mixC(wt.baseStroke, sh[0], sh[2] * 0.8);
    if (variant.tint) variant.tint = [variant.tint[0], variant.tint[1] * 0.6];
  }
  // konsept: kış mekânında kar zaten var; tekrar beyaz örtü koyma
  if (k === 'snow' && variant.id === 'kis') { variant.snowCover = false; variant.tint = ['#bae6fd', 0.15]; variant.label = 'Tipi'; }
  if (k === 'autumn' && variant.id === 'sonbahar') { variant.label = 'Altın Yapraklar'; variant.tint = ['#facc15', 0.12]; }
  const particle = variant.particle || place.particle || fam.particle || 'none';
  const world = {
    id: `gw_${idx}`,
    worldIndex: idx,
    name: variant.label ? `${name} · ${variant.label}` : name,
    placeName: name,
    conceptName: variant.label || 'gündüz',
    emoji,
    art: fam.art,
    crossing: extra.crossing || fam.crossing,
    particle,
    wt: { ...wt, seedSalt: hash(`${name}_${variant.id}`) },
  };
  cache.set(idx, world);
  return world;
};

// Yönetici paneli için: mekân listesi
export const listPlaces = () => PLACES.map((p, i) => ({ index: i, name: p.name, emoji: p.emoji, family: p.k }));
