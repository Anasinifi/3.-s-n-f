// ============================================================================
// --- İNGİLİZCE (3. SINIF) — 1000 HAZIR SORU ---
// ============================================================================
// 17 konu. Her konuda kelime ve cümle soruları; tüm soru biçimleri karışık:
//   resim → yazılı şık • dinle → resimli şık • dinle → yazılı şık • resim → sesli şık
//   yazılı kelime → resim • İngilizce → Türkçe • Türkçe → sesli İngilizce şık
//   doğru yazılış • eksik harf • cümle: oku / dinle / dinle + sesli şık
// İngilizce sözcükler telefonun İNGİLİZCE sesiyle okunur (<en>..</en>), yönergeler Türkçe.
import { card } from '../art';
import { en, pic, picText, countPic, placePic, swatch, textPic, oImg, oTxt, oAud, Q, cyc, others, misspell, makeRng, pick, shuffle, pickN, randInt, makeSubjectBank, grp, topic, kind } from './common';

// [ingilizce, türkçe, emoji]
const V = {
  greet: [['hello', 'merhaba', '👋'], ['goodbye', 'hoşça kal', '🙋'], ['good morning', 'günaydın', '🌅'], ['good night', 'iyi geceler', '🌙'], ['thank you', 'teşekkür ederim', '🙏'], ['sorry', 'özür dilerim', '😔'], ['please', 'lütfen', '🤲'], ['friend', 'arkadaş', '🧑‍🤝‍🧑'], ['teacher', 'öğretmen', '🧑‍🏫'], ['student', 'öğrenci', '🧒']],
  numbers: [['one', 'bir', 1], ['two', 'iki', 2], ['three', 'üç', 3], ['four', 'dört', 4], ['five', 'beş', 5], ['six', 'altı', 6], ['seven', 'yedi', 7], ['eight', 'sekiz', 8], ['nine', 'dokuz', 9], ['ten', 'on', 10], ['eleven', 'on bir', 11], ['twelve', 'on iki', 12], ['thirteen', 'on üç', 13], ['fourteen', 'on dört', 14], ['fifteen', 'on beş', 15], ['sixteen', 'on altı', 16], ['seventeen', 'on yedi', 17], ['eighteen', 'on sekiz', 18], ['nineteen', 'on dokuz', 19], ['twenty', 'yirmi', 20]],
  colors: [['red', 'kırmızı', '#ef4444'], ['blue', 'mavi', '#3b82f6'], ['yellow', 'sarı', '#facc15'], ['green', 'yeşil', '#22c55e'], ['orange', 'turuncu', '#f97316'], ['purple', 'mor', '#a855f7'], ['pink', 'pembe', '#f472b6'], ['brown', 'kahverengi', '#92400e'], ['black', 'siyah', '#111827'], ['white', 'beyaz', '#ffffff'], ['grey', 'gri', '#9ca3af']],
  family: [['mother', 'anne', '👩'], ['father', 'baba', '👨'], ['sister', 'kız kardeş', '👧'], ['brother', 'erkek kardeş', '👦'], ['grandmother', 'büyükanne', '👵'], ['grandfather', 'büyükbaba', '👴'], ['baby', 'bebek', '👶'], ['family', 'aile', '👨‍👩‍👧‍👦'], ['aunt', 'teyze / hala', '👱‍♀️'], ['uncle', 'amca / dayı', '🧔']],
  feelings: [['happy', 'mutlu', '😀'], ['sad', 'üzgün', '😢'], ['angry', 'kızgın', '😠'], ['scared', 'korkmuş', '😨'], ['tired', 'yorgun', '😩'], ['sleepy', 'uykulu', '😴'], ['surprised', 'şaşırmış', '😮'], ['sick', 'hasta', '🤒'], ['hungry', 'aç', '🤤'], ['bored', 'sıkılmış', '🥱']],
  toys: [['ball', 'top', '⚽'], ['doll', 'oyuncak bebek', '🪆'], ['teddy bear', 'oyuncak ayı', '🧸'], ['kite', 'uçurtma', '🪁'], ['robot', 'robot', '🤖'], ['puzzle', 'yapboz', '🧩'], ['yo-yo', 'yoyo', '🪀'], ['balloon', 'balon', '🎈'], ['train', 'tren', '🚂'], ['drum', 'davul', '🥁'], ['game', 'oyun', '🎲'], ['skateboard', 'kaykay', '🛹']],
  house: [['bed', 'yatak', '🛏️'], ['sofa', 'kanepe', '🛋️'], ['chair', 'sandalye', '🪑'], ['door', 'kapı', '🚪'], ['window', 'pencere', '🪟'], ['lamp', 'lamba', '💡'], ['television', 'televizyon', '📺'], ['bathtub', 'küvet', '🛁'], ['toilet', 'tuvalet', '🚽'], ['mirror', 'ayna', '🪞'], ['house', 'ev', '🏠'], ['garden', 'bahçe', '🌳']],
  city: [['hospital', 'hastane', '🏥'], ['school', 'okul', '🏫'], ['park', 'park', '🏞️'], ['bank', 'banka', '🏦'], ['cinema', 'sinema', '🎬'], ['library', 'kütüphane', '📚'], ['bakery', 'fırın', '🥖'], ['post office', 'postane', '🏤'], ['market', 'market', '🛒'], ['restaurant', 'restoran', '🍽️'], ['museum', 'müze', '🏛️'], ['mosque', 'cami', '🕌'], ['zoo', 'hayvanat bahçesi', '🦁'], ['hotel', 'otel', '🏨']],
  transport: [['bus', 'otobüs', '🚌'], ['car', 'araba', '🚗'], ['bike', 'bisiklet', '🚲'], ['train', 'tren', '🚆'], ['plane', 'uçak', '✈️'], ['ship', 'gemi', '🚢'], ['taxi', 'taksi', '🚕'], ['helicopter', 'helikopter', '🚁'], ['motorbike', 'motosiklet', '🏍️'], ['boat', 'tekne', '⛵'], ['truck', 'kamyon', '🚚'], ['subway', 'metro', '🚇'], ['tram', 'tramvay', '🚋'], ['rocket', 'roket', '🚀']],
  weather: [['sunny', 'güneşli', '☀️'], ['rainy', 'yağmurlu', '🌧️'], ['snowy', 'karlı', '🌨️'], ['cloudy', 'bulutlu', '☁️'], ['windy', 'rüzgârlı', '🌬️'], ['stormy', 'fırtınalı', '⛈️'], ['hot', 'sıcak', '🥵'], ['cold', 'soğuk', '🥶'], ['foggy', 'sisli', '🌫️'], ['rainbow', 'gökkuşağı', '🌈']],
  animals: [['cat', 'kedi', '🐱'], ['dog', 'köpek', '🐶'], ['bird', 'kuş', '🐦'], ['fish', 'balık', '🐟'], ['rabbit', 'tavşan', '🐰'], ['cow', 'inek', '🐮'], ['horse', 'at', '🐴'], ['sheep', 'koyun', '🐑'], ['lion', 'aslan', '🦁'], ['elephant', 'fil', '🐘'], ['monkey', 'maymun', '🐵'], ['frog', 'kurbağa', '🐸'], ['bee', 'arı', '🐝'], ['duck', 'ördek', '🦆'], ['chicken', 'tavuk', '🐔'], ['tiger', 'kaplan', '🐯'], ['bear', 'ayı', '🐻'], ['snake', 'yılan', '🐍'], ['turtle', 'kaplumbağa', '🐢'], ['giraffe', 'zürafa', '🦒']],
  food: [['apple', 'elma', '🍎'], ['banana', 'muz', '🍌'], ['orange', 'portakal', '🍊'], ['grapes', 'üzüm', '🍇'], ['strawberry', 'çilek', '🍓'], ['watermelon', 'karpuz', '🍉'], ['lemon', 'limon', '🍋'], ['cherry', 'kiraz', '🍒'], ['pear', 'armut', '🍐'], ['bread', 'ekmek', '🍞'], ['cheese', 'peynir', '🧀'], ['milk', 'süt', '🥛'], ['egg', 'yumurta', '🥚'], ['cake', 'pasta', '🍰'], ['water', 'su', '💧'], ['carrot', 'havuç', '🥕'], ['tomato', 'domates', '🍅'], ['honey', 'bal', '🍯']],
  body: [['eye', 'göz', '👁️'], ['ear', 'kulak', '👂'], ['nose', 'burun', '👃'], ['mouth', 'ağız', '👄'], ['hand', 'el', '✋'], ['foot', 'ayak', '🦶'], ['leg', 'bacak', '🦵'], ['arm', 'kol', '💪'], ['teeth', 'dişler', '🦷'], ['tongue', 'dil', '👅'], ['hair', 'saç', '💇'], ['head', 'baş', '🙂']],
  clothes: [['shirt', 'gömlek', '👕'], ['dress', 'elbise', '👗'], ['hat', 'şapka', '👒'], ['cap', 'kasket', '🧢'], ['shoes', 'ayakkabı', '👟'], ['socks', 'çorap', '🧦'], ['coat', 'mont', '🧥'], ['scarf', 'atkı', '🧣'], ['gloves', 'eldiven', '🧤'], ['trousers', 'pantolon', '👖'], ['boots', 'çizme', '👢'], ['glasses', 'gözlük', '👓'], ['shorts', 'şort', '🩳']],
  school: [['pencil', 'kurşun kalem', '✏️'], ['book', 'kitap', '📕'], ['bag', 'çanta', '🎒'], ['ruler', 'cetvel', '📏'], ['scissors', 'makas', '✂️'], ['notebook', 'defter', '📓'], ['crayon', 'pastel boya', '🖍️'], ['pen', 'tükenmez kalem', '🖊️'], ['computer', 'bilgisayar', '💻'], ['clock', 'saat', '🕒'], ['paint', 'boya', '🎨'], ['globe', 'küre', '🌍']],
  actions: [['run', 'koşmak', '🏃'], ['swim', 'yüzmek', '🏊'], ['dance', 'dans etmek', '💃'], ['sing', 'şarkı söylemek', '🎤'], ['read', 'okumak', '📖'], ['write', 'yazmak', '✍️'], ['ride a bike', 'bisiklete binmek', '🚴'], ['climb', 'tırmanmak', '🧗'], ['fly', 'uçmak', '🦅'], ['cook', 'yemek pişirmek', '🍳'], ['draw', 'resim çizmek', '🎨'], ['play football', 'futbol oynamak', '⚽'], ['sleep', 'uyumak', '😴'], ['jump', 'zıplamak', '🤸']],
  places: [['in', 'içinde', 'in'], ['on', 'üstünde', 'on'], ['under', 'altında', 'under'], ['next to', 'yanında', 'next to'], ['behind', 'arkasında', 'behind'], ['in front of', 'önünde', 'in front of']]
};

const g = grp('eng');
const imgOf = (topicId, w) => (topicId === 'colors' ? swatch(w[2]) : topicId === 'numbers' ? textPic(String(w[2]), { size: 52, w: 100, color: '#4f46e5', bg: '#ffffff' }) : pic(w[2]));
const keyW = (w) => w[0];

// ---------------------------------------------------------------------------
// KELİME KALIPLARI (her konu için aynı 9 biçim)
// ---------------------------------------------------------------------------
const W = {
  // resim → yazılı İngilizce şık
  picToWord: (tid) => (key, seed, pos) => {
    const rng = makeRng(key, seed); const L = V[tid]; const w = cyc(L, pos ?? seed);
    return Q({ text: 'What is this? (Bu nedir?)', speak: `${en('What is this?')} || Resme bak ve doğru kelimeyi seç.`, main: imgOf(tid, w), correct: oTxt(w[0]), wrongs: others(L, w, rng, 3).map(x => oTxt(x[0])) });
  },
  // dinle → resimli şık
  listenToPic: (tid) => (key, seed, pos) => {
    const rng = makeRng(key, seed); const L = V[tid]; const w = cyc(L, pos ?? seed);
    return Q({ sig: 'lp' + w[0] + seed % 3, text: 'Dinle ve doğru resmi seç. 🔊', speak: `Dinle. || ${en(w[0])} || ${en(w[0])}`, correct: oImg(w[0], imgOf(tid, w)), wrongs: others(L, w, rng, 3).map(x => oImg(x[0], imgOf(tid, x))) });
  },
  // dinle → yazılı İngilizce şık (benzer yazılış çeldiricili)
  listenToWord: (tid) => (key, seed, pos) => {
    const rng = makeRng(key, seed); const L = V[tid]; const w = cyc(L, pos ?? seed);
    const wr = [...shuffle(misspell(w[0].replace(/ /g, '~'), rng).map(s => s.replace(/~/g, ' ')), rng).slice(0, 1), ...others(L, w, rng, 3).map(x => x[0])];
    return Q({ text: 'Dinle. Duyduğun kelime hangisi? 🔊', speak: `Dinle. || ${en(w[0])} || ${en(w[0])}`, correct: oTxt(w[0]), wrongs: wr.map(oTxt) });
  },
  // resim → sesli şık (şıklar dinlenir)
  picToAudio: (tid) => (key, seed, pos) => {
    const rng = makeRng(key, seed); const L = V[tid]; const w = cyc(L, pos ?? seed);
    return Q({ text: 'Resmin İngilizcesi hangisi? Şıkları dinle.', speak: 'Resmin İngilizcesi hangisi? Şıkları dinle ve seç.', main: imgOf(tid, w), correct: oAud(w[0], en(w[0])), wrongs: others(L, w, rng, 3).map(x => oAud(x[0], en(x[0]))), audioOpts: true });
  },
  // yazılı İngilizce → resim
  wordToPic: (tid) => (key, seed, pos) => {
    const rng = makeRng(key, seed); const L = V[tid]; const w = cyc(L, pos ?? seed);
    return Q({ sig: 'wp' + w[0] + seed % 3, text: `"${w[0]}" hangisi?`, speak: `${en(w[0])} hangisi?`, main: textPic(w[0], { size: 34 }), correct: oImg(w[0], imgOf(tid, w)), wrongs: others(L, w, rng, 3).map(x => oImg(x[0], imgOf(tid, x))) });
  },
  // İngilizce → Türkçe
  enToTr: (tid) => (key, seed, pos) => {
    const rng = makeRng(key, seed); const L = V[tid]; const w = cyc(L, pos ?? seed);
    return Q({ text: `"${w[0]}" kelimesinin Türkçesi hangisi?`, speak: `${en(w[0])} kelimesinin Türkçesi hangisi?`, correct: oTxt(w[1]), wrongs: others(L, w, rng, 3).map(x => oTxt(x[1])) });
  },
  // Türkçe → sesli İngilizce şık
  trToAudio: (tid) => (key, seed, pos) => {
    const rng = makeRng(key, seed); const L = V[tid]; const w = cyc(L, pos ?? seed);
    return Q({ text: `"${w[1]}" İngilizce nasıl söylenir? Şıkları dinle.`, speak: `${w[1]}, İngilizce nasıl söylenir? Şıkları dinle.`, correct: oAud(w[0], en(w[0])), wrongs: others(L, w, rng, 3).map(x => oAud(x[0], en(x[0]))), audioOpts: true });
  },
  // doğru yazılış (zor)
  spelling: (tid) => (key, seed, pos) => {
    const rng = makeRng(key, seed); const L = V[tid]; const w = cyc(L, pos ?? seed);
    const ms = misspell(w[0].replace(/ /g, '~'), rng).map(s => s.replace(/~/g, ' '));
    if (ms.length < 3) return null;
    return Q({ text: 'Resimdeki kelimenin doğru yazılışı hangisi?', speak: 'Resimdeki kelimenin doğru yazılışı hangisi?', main: imgOf(tid, w), correct: oTxt(w[0]), wrongs: shuffle(ms, rng).map(oTxt) });
  },
  // eksik harf (zor)
  missing: (tid) => (key, seed, pos) => {
    const rng = makeRng(key, seed); const L = V[tid].filter(x => x[0].replace(/[^a-z]/g, '').length >= 4); const w = cyc(L, pos ?? seed);
    const idxs = w[0].split('').map((c, j) => (/[a-z]/.test(c) ? j : -1)).filter(j => j > 0);
    const j = pick(idxs, rng); const ch = w[0][j];
    const shown = w[0].slice(0, j) + '_' + w[0].slice(j + 1);
    const letters = shuffle('abcdeghiklmnoprstuwy'.split('').filter(c => c !== ch), rng).slice(0, 3);
    return Q({ sig: shown, text: 'Boşluğa hangi harf gelmeli?', speak: tid === 'numbers' ? `Boşluğa hangi harf gelmeli? || ${en(w[0])}` : 'Resme bak. Boşluğa hangi harf gelmeli?', main: picText(tid === 'colors' ? { hex: w[2] } : tid === 'numbers' ? null : w[2], shown), correct: oTxt(ch), wrongs: letters.map(oTxt), tag: '' });
  }
};

const vocabKinds = (tid, n) => [
  kind(`eng_${tid}_kelime`, 'Kelime', [
    g(`${tid}_pw`, 'Resim → yazılı şık', W.picToWord(tid), n),
    g(`${tid}_lp`, 'Sesli soru → resimli şık', W.listenToPic(tid), n),
    g(`${tid}_lw`, 'Sesli soru → yazılı şık', W.listenToWord(tid), n),
    g(`${tid}_pa`, 'Resim → sesli şık', W.picToAudio(tid), n),
    g(`${tid}_wp`, 'Yazılı kelime → resimli şık', W.wordToPic(tid), n)
  ]),
  kind(`eng_${tid}_anlam`, 'Anlam ve Yazım', [
    g(`${tid}_et`, 'İngilizce → Türkçe', W.enToTr(tid), n),
    g(`${tid}_ta`, 'Türkçe → sesli İngilizce şık', W.trToAudio(tid), n),
    g(`${tid}_sp`, 'Doğru yazılış', W.spelling(tid), n),
    g(`${tid}_ms`, 'Eksik harf', W.missing(tid), n)
  ])
];

// ---------------------------------------------------------------------------
// CÜMLE KALIPLARI: { q (İngilizce soru/durum), tr (Türkçe yönerge), a (doğru), w (yanlışlar), e (resim emoji, isteğe bağlı) }
// ---------------------------------------------------------------------------
const S = {
  greet: [
    { q: 'Hello! How are you?', a: "I'm fine, thank you.", w: ['My name is Ali.', 'Goodbye!', 'I am eight.', 'Good night!'] },
    { q: "What's your name?", a: 'My name is Elif.', w: ["I'm fine.", 'Thank you.', 'See you!', "I'm nine."] },
    { q: 'Nice to meet you!', a: 'Nice to meet you, too.', w: ['Good night.', "I'm sorry.", 'My name is Can.', 'Yes, please.'] },
    { q: 'Thank you!', a: "You're welcome.", w: ['Hello!', "I'm fine.", 'Good morning!', 'How are you?'] },
    { q: 'Goodbye!', a: 'Bye! See you!', w: ['Hello!', 'Nice to meet you.', 'Thank you.', 'Good morning.'] },
    { q: 'How old are you?', a: "I'm nine years old.", w: ["I'm fine.", 'My name is Ece.', "I'm from Türkiye.", 'Thank you.'] },
    { q: 'Where are you from?', a: "I'm from Türkiye.", w: ["I'm nine.", "I'm happy.", 'My name is Ada.', 'Goodbye!'] },
    { q: 'Sabah öğretmenini selamlıyorsun. Ne dersin?', tr: true, a: 'Good morning, teacher!', w: ['Good night, teacher!', 'Goodbye, teacher!', 'Sorry, teacher!', 'Thank you, teacher!'], e: '🌅' },
    { q: 'Yatmadan önce annene ne dersin?', tr: true, a: 'Good night, Mom!', w: ['Good morning, Mom!', 'Hello, Mom!', 'Nice to meet you, Mom!', 'Thank you, Mom!'], e: '🌙' },
    { q: 'Arkadaşına çarptın. Ne dersin?', tr: true, a: "I'm sorry!", w: ['Thank you!', 'Hello!', 'Good night!', 'Nice to meet you!'], e: '😔' },
    { q: 'Arkadaşın sana bir kalem verdi. Ne dersin?', tr: true, a: 'Thank you!', w: ['Sorry!', 'Goodbye!', 'Good night!', 'How are you?'], e: '✏️' },
    { q: 'Okuldan çıkarken arkadaşına ne dersin?', tr: true, a: 'Bye! See you tomorrow!', w: ['Good morning!', 'Nice to meet you!', 'How old are you?', 'Thank you!'], e: '🏫' }
  ],
  numbers: [
    { q: 'two + three = ?', a: 'five', w: ['four', 'six', 'three', 'seven'] }, { q: 'six + four = ?', a: 'ten', w: ['nine', 'eleven', 'eight', 'twelve'] },
    { q: 'ten - three = ?', a: 'seven', w: ['six', 'eight', 'thirteen', 'five'] }, { q: 'eight + seven = ?', a: 'fifteen', w: ['fourteen', 'sixteen', 'thirteen', 'fifty'] },
    { q: 'twenty - eight = ?', a: 'twelve', w: ['eleven', 'thirteen', 'twenty-eight', 'ten'] }, { q: 'nine + nine = ?', a: 'eighteen', w: ['nineteen', 'seventeen', 'eighty', 'sixteen'] },
    { q: 'fifteen - five = ?', a: 'ten', w: ['twenty', 'nine', 'eleven', 'five'] }, { q: 'eleven + six = ?', a: 'seventeen', w: ['sixteen', 'eighteen', 'seventy', 'fifteen'] },
    { q: 'twelve + seven = ?', a: 'nineteen', w: ['eighteen', 'twenty', 'ninety', 'seventeen'] }, { q: 'fourteen - six = ?', a: 'eight', w: ['seven', 'nine', 'six', 'twenty'] },
    { q: 'How old are you? (9 yaşındasın)', a: "I'm nine years old.", w: ["I'm five years old.", "I'm nineteen years old.", "I'm ninety years old.", "I'm eight years old."] },
    { q: 'What comes after twelve?', a: 'thirteen', w: ['eleven', 'fourteen', 'thirty', 'twenty'] },
    { q: 'What comes before sixteen?', a: 'fifteen', w: ['seventeen', 'fourteen', 'sixty', 'fifty'] },
    { q: 'two, four, six, eight, ...?', a: 'ten', w: ['nine', 'twelve', 'seven', 'eleven'] },
    { q: 'five, ten, fifteen, ...?', a: 'twenty', w: ['sixteen', 'twelve', 'twenty-five', 'eighteen'] }
  ],
  colors: [
    { q: 'What color is the banana?', a: "It's yellow.", w: ["It's blue.", "It's purple.", "It's black.", "It's pink."], e: '🍌' },
    { q: 'What color is the frog?', a: "It's green.", w: ["It's red.", "It's white.", "It's orange.", "It's purple."], e: '🐸' },
    { q: 'What color is the strawberry?', a: "It's red.", w: ["It's blue.", "It's green.", "It's grey.", "It's yellow."], e: '🍓' },
    { q: 'What color is the carrot?', a: "It's orange.", w: ["It's pink.", "It's blue.", "It's black.", "It's white."], e: '🥕' },
    { q: 'What color is the snow?', a: "It's white.", w: ["It's black.", "It's brown.", "It's red.", "It's green."], e: '⛄' },
    { q: 'What color is the bear?', a: "It's brown.", w: ["It's pink.", "It's blue.", "It's purple.", "It's yellow."], e: '🐻' },
    { q: 'What color are the grapes?', a: 'They are purple.', w: ['They are orange.', 'They are white.', 'They are yellow.', 'They are blue.'], e: '🍇' },
    { q: 'What color is the sky?', a: "It's blue.", w: ["It's brown.", "It's black.", "It's orange.", "It's pink."], e: '🌤️' },
    { q: 'red + yellow = ?', a: 'orange', w: ['green', 'purple', 'brown', 'blue'] },
    { q: 'blue + yellow = ?', a: 'green', w: ['orange', 'purple', 'pink', 'grey'] },
    { q: 'red + blue = ?', a: 'purple', w: ['green', 'orange', 'yellow', 'brown'] },
    { q: 'red + white = ?', a: 'pink', w: ['grey', 'purple', 'orange', 'green'] },
    { q: 'black + white = ?', a: 'grey', w: ['pink', 'brown', 'blue', 'yellow'] },
    { q: 'What is your favourite color?', a: 'My favourite color is blue.', w: ['I am blue.', 'It is a color.', 'Yes, I do.', 'I am nine.'] }
  ],
  family: [
    { q: 'Who is she? (👵)', a: 'She is my grandmother.', w: ['He is my grandfather.', 'She is my sister.', 'He is my brother.', 'She is my baby.'], e: '👵' },
    { q: 'Who is he? (👨)', a: 'He is my father.', w: ['She is my mother.', 'He is my brother.', 'She is my aunt.', 'He is my baby.'], e: '👨' },
    { q: "My mother's mother is my ...", a: 'grandmother', w: ['sister', 'aunt', 'grandfather', 'mother'] },
    { q: "My father's father is my ...", a: 'grandfather', w: ['uncle', 'brother', 'father', 'grandmother'] },
    { q: "My father's brother is my ...", a: 'uncle', w: ['brother', 'grandfather', 'aunt', 'cousin'] },
    { q: "My mother's sister is my ...", a: 'aunt', w: ['sister', 'mother', 'uncle', 'grandmother'] },
    { q: 'Ali is a boy. Ayşe is his sister. Ali is Ayşe\'s ...', a: 'brother', w: ['sister', 'father', 'uncle', 'mother'] },
    { q: 'This is my family. I have one brother and one sister. How many children are there?', a: 'three', w: ['two', 'one', 'four', 'five'] },
    { q: 'Who is he? (👦)', a: 'He is my brother.', w: ['She is my sister.', 'He is my father.', 'She is my mother.', 'He is my grandfather.'], e: '👦' },
    { q: 'Who is she? (👶)', a: 'She is my baby sister.', w: ['She is my grandmother.', 'He is my uncle.', 'She is my mother.', 'He is my father.'], e: '👶' },
    { q: "Is she your mother? (👧)", a: "No, she isn't. She is my sister.", w: ["Yes, she is.", "No, he isn't.", "Yes, he is my father.", "She is my grandmother."], e: '👧' }
  ],
  feelings: [
    { q: 'How are you? (😀)', a: "I'm happy.", w: ["I'm sad.", "I'm angry.", "I'm sleepy.", "I'm scared."], e: '😀' },
    { q: 'How are you? (😢)', a: "I'm sad.", w: ["I'm happy.", "I'm hungry.", "I'm surprised.", "I'm bored."], e: '😢' },
    { q: 'How are you? (😠)', a: "I'm angry.", w: ["I'm happy.", "I'm tired.", "I'm sick.", "I'm scared."], e: '😠' },
    { q: 'How are you? (😴)', a: "I'm sleepy.", w: ["I'm angry.", "I'm happy.", "I'm hungry.", "I'm surprised."], e: '😴' },
    { q: 'How do you feel? (🤒)', a: 'I feel sick.', w: ['I feel happy.', 'I feel hungry.', 'I feel angry.', 'I feel surprised.'], e: '🤒' },
    { q: 'I want to eat a sandwich. I am ...', a: 'hungry', w: ['sleepy', 'angry', 'scared', 'happy'], e: '🥪' },
    { q: 'I see a big snake! I am ...', a: 'scared', w: ['happy', 'hungry', 'sleepy', 'bored'], e: '🐍' },
    { q: 'It is my birthday! I am ...', a: 'happy', w: ['sad', 'sick', 'angry', 'scared'], e: '🎂' },
    { q: 'I lost my teddy bear. I am ...', a: 'sad', w: ['happy', 'hungry', 'surprised', 'sleepy'], e: '🧸' },
    { q: 'I ran a lot. I am ...', a: 'tired', w: ['hungry', 'scared', 'happy', 'surprised'], e: '🏃' },
    { q: 'Wow! A big present! I am ...', a: 'surprised', w: ['sleepy', 'sad', 'sick', 'bored'], e: '🎁' },
    { q: 'It is late at night. I am ...', a: 'sleepy', w: ['hungry', 'angry', 'surprised', 'happy'], e: '🌙' }
  ],
  toys: [
    { q: 'What is your favourite toy?', a: 'My favourite toy is my teddy bear.', w: ['I am a teddy bear.', 'Yes, I can.', 'It is blue sky.', 'I have got a sister.'] },
    { q: 'Do you like kites?', a: 'Yes, I do.', w: ['Yes, I am.', 'Yes, it is.', 'No, she isn\'t.', 'I am nine.'] },
    { q: "Let's play football!", a: "OK! Let's go!", w: ['Good night!', "I'm sorry.", 'Nice to meet you.', 'Thank you, teacher.'] },
    { q: 'Have you got a robot?', a: 'Yes, I have.', w: ['Yes, I do.', 'Yes, it is.', 'I am a robot.', 'Yes, I can.'] },
    { q: 'You can fly it on a windy day. What is it?', a: 'a kite', w: ['a doll', 'a puzzle', 'a drum', 'a teddy bear'], e: '🌬️' },
    { q: 'You can hit it and make music. What is it?', a: 'a drum', w: ['a ball', 'a kite', 'a yo-yo', 'a puzzle'], e: '🎵' },
    { q: 'It has many pieces. You put them together. What is it?', a: 'a puzzle', w: ['a ball', 'a robot', 'a kite', 'a doll'], e: '🧩' },
    { q: 'It is round. You kick it. What is it?', a: 'a ball', w: ['a kite', 'a drum', 'a puzzle', 'a teddy bear'], e: '🦶' },
    { q: 'How many balls? (⚽⚽⚽)', a: 'There are three balls.', w: ['There is one ball.', 'There are two balls.', 'There are four balls.', 'There are five balls.'], e: '⚽' },
    { q: 'Where is the teddy bear? (📦)', a: "It's in the box.", w: ["It's on the box.", "It's under the box.", "It's next to the box.", "It's behind the box."], e: '🧸' }
  ],
  house: [
    { q: 'Where do you sleep?', a: 'in the bedroom', w: ['in the kitchen', 'in the bathroom', 'in the garden', 'in the garage'], e: '🛏️' },
    { q: 'Where do you cook?', a: 'in the kitchen', w: ['in the bedroom', 'in the bathroom', 'in the living room', 'in the garden'], e: '🍳' },
    { q: 'Where do you take a bath?', a: 'in the bathroom', w: ['in the kitchen', 'in the bedroom', 'in the garden', 'in the living room'], e: '🛁' },
    { q: 'Where do you watch TV?', a: 'in the living room', w: ['in the bathroom', 'in the garden', 'in the kitchen', 'in the garage'], e: '📺' },
    { q: 'Where is the car? (🚗)', a: 'in the garage', w: ['in the bedroom', 'in the kitchen', 'in the bathroom', 'in the living room'], e: '🚗' },
    { q: 'Where are the flowers? (🌷)', a: 'in the garden', w: ['in the bathroom', 'in the bedroom', 'in the kitchen', 'in the garage'], e: '🌷' },
    { q: 'Where is mom? She is cooking.', a: 'She is in the kitchen.', w: ['She is in the bathroom.', 'She is in the garage.', 'She is in the garden.', 'He is in the kitchen.'], e: '👩‍🍳' },
    { q: 'Where is grandpa? He is sleeping.', a: 'He is in the bedroom.', w: ['He is in the kitchen.', 'She is in the bedroom.', 'He is in the garden.', 'He is in the bathroom.'], e: '👴' },
    { q: 'How many rooms are there? (bedroom, kitchen, bathroom, living room)', a: 'There are four rooms.', w: ['There are three rooms.', 'There is one room.', 'There are five rooms.', 'There are two rooms.'] },
    { q: 'There is a ... in the bathroom.', a: 'bathtub', w: ['sofa', 'bed', 'garden', 'car'], e: '🛁' }
  ],
  city: [
    { q: 'I am sick. Where do I go?', a: 'to the hospital', w: ['to the cinema', 'to the bakery', 'to the zoo', 'to the park'], e: '🤒' },
    { q: 'I want to buy bread. Where do I go?', a: 'to the bakery', w: ['to the hospital', 'to the library', 'to the museum', 'to the bank'], e: '🍞' },
    { q: 'I want to watch a film. Where do I go?', a: 'to the cinema', w: ['to the bakery', 'to the hospital', 'to the school', 'to the market'], e: '🍿' },
    { q: 'I want to read books. Where do I go?', a: 'to the library', w: ['to the zoo', 'to the bank', 'to the bakery', 'to the park'], e: '📖' },
    { q: 'I want to see lions and monkeys. Where do I go?', a: 'to the zoo', w: ['to the library', 'to the hospital', 'to the post office', 'to the bank'], e: '🐒' },
    { q: 'I want to send a letter. Where do I go?', a: 'to the post office', w: ['to the cinema', 'to the zoo', 'to the bakery', 'to the park'], e: '✉️' },
    { q: 'I need money. Where do I go?', a: 'to the bank', w: ['to the park', 'to the library', 'to the zoo', 'to the cinema'], e: '💰' },
    { q: 'I want to play on the swings. Where do I go?', a: 'to the park', w: ['to the bank', 'to the hospital', 'to the post office', 'to the museum'], e: '🛝' },
    { q: 'I am hungry. I want to eat dinner. Where do I go?', a: 'to the restaurant', w: ['to the library', 'to the bank', 'to the hospital', 'to the post office'], e: '🍝' },
    { q: 'Where is the bank? (🏦 🏥)', a: "It's next to the hospital.", w: ["It's in the hospital.", "It's under the hospital.", "It's on the hospital.", "It's a hospital."], e: '🏦' },
    { q: 'Excuse me, where is the park?', a: 'Go straight and turn left.', w: ["I'm fine, thank you.", 'My name is Ali.', "It's sunny.", 'Yes, I can.'] }
  ],
  transport: [
    { q: 'How do you go to school? (🚌)', a: 'I go to school by bus.', w: ['I go to school by plane.', 'I go to school by ship.', 'I go to school on foot.', 'I go to school by helicopter.'], e: '🚌' },
    { q: 'How do you go to school? (🚶)', a: 'I go to school on foot.', w: ['I go to school by bus.', 'I go to school by car.', 'I go to school by train.', 'I go to school by bike.'], e: '🚶' },
    { q: 'It flies in the sky. It has got wings.', a: 'a plane', w: ['a bus', 'a ship', 'a bike', 'a train'], e: '☁️' },
    { q: 'It goes on the sea. It is very big.', a: 'a ship', w: ['a plane', 'a bike', 'a taxi', 'a truck'], e: '🌊' },
    { q: 'It has got two wheels. You ride it.', a: 'a bike', w: ['a bus', 'a ship', 'a plane', 'a train'], e: '🛞' },
    { q: 'It is yellow. You pay the driver. It takes you home.', a: 'a taxi', w: ['a ship', 'a bike', 'a helicopter', 'a boat'], e: '🟨' },
    { q: 'It goes under the city. Many people use it.', a: 'a subway', w: ['a plane', 'a boat', 'a bike', 'a helicopter'], e: '🚉' },
    { q: 'It goes to the Moon.', a: 'a rocket', w: ['a bus', 'a taxi', 'a bike', 'a car'], e: '🌕' },
    { q: 'Which one goes on water?', a: 'boat', w: ['bus', 'taxi', 'bike', 'train'] },
    { q: 'Which one goes in the air?', a: 'helicopter', w: ['truck', 'ship', 'bike', 'subway'] },
    { q: 'Which one goes on rails?', a: 'train', w: ['plane', 'ship', 'taxi', 'bike'] }
  ],
  weather: [
    { q: "How's the weather? (☀️)", a: "It's sunny.", w: ["It's rainy.", "It's snowy.", "It's cloudy.", "It's foggy."], e: '☀️' },
    { q: "How's the weather? (🌧️)", a: "It's rainy.", w: ["It's sunny.", "It's hot.", "It's windy.", "It's snowy."], e: '🌧️' },
    { q: "How's the weather? (🌨️)", a: "It's snowy.", w: ["It's sunny.", "It's hot.", "It's rainy.", "It's windy."], e: '🌨️' },
    { q: "How's the weather? (🌬️)", a: "It's windy.", w: ["It's snowy.", "It's sunny.", "It's hot.", "It's foggy."], e: '🌬️' },
    { q: "It's rainy. Take your ...", a: 'umbrella', w: ['sunglasses', 'swimsuit', 'kite', 'ice cream'], e: '☔' },
    { q: "It's snowy. Let's make a ...", a: 'snowman', w: ['sandcastle', 'kite', 'cake', 'boat'], e: '⛄' },
    { q: "It's windy. Let's fly a ...", a: 'kite', w: ['snowman', 'umbrella', 'boat', 'ball'], e: '🪁' },
    { q: "It's hot and sunny. Let's go to the ...", a: 'beach', w: ['snowman', 'hospital', 'library', 'bank'], e: '🏖️' },
    { q: "It's cold. Wear your ...", a: 'coat', w: ['shorts', 'sunglasses', 'swimsuit', 'T-shirt'], e: '🧥' },
    { q: 'After the rain, we see a ...', a: 'rainbow', w: ['snowman', 'moon', 'kite', 'star'], e: '🌈' },
    { q: 'In winter it is ...', a: 'cold and snowy', w: ['hot and sunny', 'very hot', 'hot and dry', 'sunny and hot'], e: '❄️' },
    { q: 'In summer it is ...', a: 'hot and sunny', w: ['cold and snowy', 'snowy', 'very cold', 'foggy and cold'], e: '🌞' }
  ],
  animals: [
    { q: 'It says "moo". It gives us milk.', a: 'cow', w: ['cat', 'lion', 'frog', 'bee'], e: '🥛' },
    { q: 'It makes honey.', a: 'bee', w: ['cow', 'dog', 'fish', 'snake'], e: '🍯' },
    { q: 'It has got a very long neck.', a: 'giraffe', w: ['frog', 'rabbit', 'fish', 'duck'], e: '🌿' },
    { q: 'It has got a long nose (trunk). It is very big.', a: 'elephant', w: ['cat', 'bee', 'rabbit', 'bird'], e: '🌳' },
    { q: 'It can swim but it can\'t walk.', a: 'fish', w: ['dog', 'horse', 'bird', 'cat'], e: '🌊' },
    { q: 'It can fly. It has got two wings.', a: 'bird', w: ['fish', 'snake', 'cow', 'horse'], e: '☁️' },
    { q: 'It is very slow. It has got a shell.', a: 'turtle', w: ['horse', 'rabbit', 'bird', 'monkey'], e: '🐌' },
    { q: 'It says "woof woof".', a: 'dog', w: ['cat', 'cow', 'duck', 'sheep'], e: '🔊' },
    { q: 'It says "meow".', a: 'cat', w: ['dog', 'cow', 'frog', 'horse'], e: '🔊' },
    { q: 'It loves carrots. It can jump.', a: 'rabbit', w: ['lion', 'fish', 'snake', 'cow'], e: '🥕' },
    { q: 'It loves bananas. It can climb trees.', a: 'monkey', w: ['fish', 'cow', 'turtle', 'sheep'], e: '🍌' },
    { q: 'It has no legs.', a: 'snake', w: ['horse', 'chicken', 'frog', 'monkey'], e: '❓' },
    { q: 'Can a fish fly?', a: "No, it can't.", w: ['Yes, it can.', 'Yes, it is.', "No, it isn't.", 'Yes, I can.'] },
    { q: 'Can a bird fly?', a: 'Yes, it can.', w: ["No, it can't.", 'Yes, it is.', "No, I can't.", 'Yes, I do.'] },
    { q: 'How many legs has a chicken got?', a: 'two', w: ['four', 'six', 'eight', 'one'], e: '🐔' },
    { q: 'How many legs has a cat got?', a: 'four', w: ['two', 'six', 'three', 'eight'], e: '🐱' }
  ],
  food: [
    { q: 'Do you like apples?', a: 'Yes, I do.', w: ['Yes, I am.', 'Yes, it is.', 'Yes, I can.', 'I am an apple.'] },
    { q: 'Would you like some milk?', a: 'Yes, please.', w: ['Yes, I can.', 'Yes, it is.', "I'm fine.", 'Good night.'] },
    { q: 'I am thirsty. I want some ...', a: 'water', w: ['bread', 'cheese', 'cake', 'egg'], e: '🥵' },
    { q: 'It is yellow and long. Monkeys love it.', a: 'banana', w: ['apple', 'grapes', 'cherry', 'watermelon'], e: '🐵' },
    { q: 'It is big and green outside, red inside.', a: 'watermelon', w: ['lemon', 'banana', 'cherry', 'orange'], e: '❓' },
    { q: 'It is yellow and sour.', a: 'lemon', w: ['banana', 'cheese', 'cake', 'apple'], e: '😖' },
    { q: 'Bees make it. It is sweet.', a: 'honey', w: ['milk', 'bread', 'cheese', 'egg'], e: '🐝' },
    { q: 'Chickens give us ...', a: 'eggs', w: ['milk', 'honey', 'bread', 'apples'], e: '🐔' },
    { q: 'Cows give us ...', a: 'milk', w: ['eggs', 'honey', 'bread', 'grapes'], e: '🐄' },
    { q: 'Rabbits love ...', a: 'carrots', w: ['cakes', 'cheese', 'honey', 'milk'], e: '🐰' },
    { q: 'Which one is a fruit?', a: 'cherry', w: ['bread', 'cheese', 'milk', 'egg'] },
    { q: 'Which one is a drink?', a: 'juice', w: ['bread', 'egg', 'cake', 'cheese'] },
    { q: 'What do you have for breakfast?', a: 'I have eggs, cheese and bread.', w: ['I have a bus.', 'I go to school.', 'I am hungry.', 'It is sunny.'] }
  ],
  body: [
    { q: 'I see with my ...', a: 'eyes', w: ['ears', 'nose', 'feet', 'hands'], e: '👀' },
    { q: 'I hear with my ...', a: 'ears', w: ['eyes', 'mouth', 'legs', 'hair'], e: '🎵' },
    { q: 'I smell with my ...', a: 'nose', w: ['ears', 'hands', 'feet', 'teeth'], e: '🌸' },
    { q: 'I eat with my ...', a: 'mouth', w: ['nose', 'ears', 'eyes', 'feet'], e: '🍕' },
    { q: 'I walk with my ...', a: 'legs and feet', w: ['eyes and ears', 'hands and arms', 'nose and mouth', 'hair and head'], e: '🚶' },
    { q: 'I write with my ...', a: 'hand', w: ['foot', 'ear', 'nose', 'hair'], e: '✍️' },
    { q: 'I brush my ... every morning.', a: 'teeth', w: ['eyes', 'ears', 'legs', 'nose'], e: '🪥' },
    { q: 'How many fingers have you got on one hand?', a: 'five', w: ['four', 'ten', 'six', 'two'], e: '🖐️' },
    { q: 'How many eyes have you got?', a: 'two', w: ['one', 'three', 'four', 'ten'], e: '👀' },
    { q: 'Touch your nose!', a: '👃', w: ['👂', '👁️', '🦶', '✋'], pic: true },
    { q: 'Show me your hands!', a: '✋', w: ['🦶', '👂', '👃', '🦵'], pic: true },
    { q: 'Clap your hands!', a: '👏', w: ['🦶', '👀', '🦷', '👅'], pic: true }
  ],
  clothes: [
    { q: "It's cold. Put on your ...", a: 'coat', w: ['shorts', 'T-shirt', 'sunglasses', 'dress'], e: '🥶' },
    { q: 'You wear them on your feet.', a: 'shoes', w: ['gloves', 'hat', 'scarf', 'glasses'], e: '🦶' },
    { q: 'You wear them on your hands.', a: 'gloves', w: ['socks', 'boots', 'cap', 'shorts'], e: '✋' },
    { q: 'You wear it on your head.', a: 'hat', w: ['socks', 'gloves', 'shoes', 'trousers'], e: '🙂' },
    { q: 'You wear it around your neck in winter.', a: 'scarf', w: ['shorts', 'cap', 'shoes', 'dress'], e: '❄️' },
    { q: 'You wear them to see better.', a: 'glasses', w: ['gloves', 'boots', 'socks', 'shorts'], e: '👀' },
    { q: "It's rainy. Wear your ...", a: 'boots', w: ['shorts', 'sunglasses', 'cap', 'dress'], e: '🌧️' },
    { q: 'What is she wearing? (👗)', a: 'She is wearing a dress.', w: ['She is wearing a coat.', 'He is wearing a dress.', 'She is wearing trousers.', 'She is wearing boots.'], e: '👗' },
    { q: 'What is he wearing? (🧢)', a: 'He is wearing a cap.', w: ['He is wearing a scarf.', 'She is wearing a cap.', 'He is wearing gloves.', 'He is wearing a dress.'], e: '🧢' },
    { q: 'Whose socks are these? (Ali)', a: "They are Ali's socks.", w: ["It is Ali's socks.", "They are Ali.", 'Ali is socks.', 'She is Ali.'], e: '🧦' }
  ],
  school: [
    { q: 'I cut paper with ...', a: 'scissors', w: ['a ruler', 'a book', 'a bag', 'a clock'], e: '📄' },
    { q: 'I draw a line with ...', a: 'a ruler', w: ['scissors', 'a bag', 'a globe', 'a clock'], e: '📐' },
    { q: 'I carry my books in my ...', a: 'bag', w: ['pencil', 'ruler', 'clock', 'crayon'], e: '📚' },
    { q: 'What time is it? It shows the time.', a: 'clock', w: ['book', 'bag', 'pen', 'globe'], e: '⏰' },
    { q: 'It shows the countries of the world.', a: 'globe', w: ['ruler', 'pencil', 'scissors', 'notebook'], e: '🗺️' },
    { q: 'What is this? (✏️)', a: "It's a pencil.", w: ["It's a book.", "It's a bag.", "They are pencils.", "It's a ruler."], e: '✏️' },
    { q: 'What are these? (📕📕)', a: 'They are books.', w: ["It's a book.", 'They are bags.', "It's books.", 'They are pens.'], e: '📕' },
    { q: 'Can I borrow your pen, please?', a: 'Sure, here you are.', w: ["I'm fine, thank you.", 'Good night.', "It's sunny.", 'My name is Ali.'] },
    { q: 'Open your books, please.', a: '📖', w: ['📕', '✂️', '🎒', '📏'], pic: true },
    { q: 'Sit down, please.', a: '🪑', w: ['🚪', '🏃', '🛏️', '🎤'], pic: true },
    { q: 'How many pencils? (✏️✏️✏️✏️)', a: 'four pencils', w: ['three pencils', 'five pencils', 'two pencils', 'one pencil'], e: '✏️' }
  ],
  actions: [
    { q: 'Can you swim? (🏊 ✅)', a: 'Yes, I can.', w: ["No, I can't.", 'Yes, I do.', 'Yes, I am.', 'Yes, it is.'], e: '🏊' },
    { q: 'Can a fish run?', a: "No, it can't.", w: ['Yes, it can.', 'Yes, it does.', "No, it isn't.", 'Yes, I can.'], e: '🐟' },
    { q: 'Birds can ...', a: 'fly', w: ['swim and read', 'write', 'cook', 'ride a bike'], e: '🐦' },
    { q: 'Fish can ...', a: 'swim', w: ['fly', 'run', 'climb', 'sing'], e: '🐟' },
    { q: 'Monkeys can ...', a: 'climb', w: ['fly', 'swim', 'read', 'write'], e: '🐵' },
    { q: 'What can you do with a book?', a: 'I can read it.', w: ['I can swim it.', 'I can eat it.', 'I can fly it.', 'I can ride it.'], e: '📕' },
    { q: 'What can you do with a bike?', a: 'I can ride it.', w: ['I can read it.', 'I can eat it.', 'I can sing it.', 'I can drink it.'], e: '🚲' },
    { q: 'What is she doing? (💃)', a: 'She is dancing.', w: ['She is swimming.', 'She is sleeping.', 'He is dancing.', 'She is cooking.'], e: '💃' },
    { q: 'What is he doing? (🏃)', a: 'He is running.', w: ['He is reading.', 'He is sleeping.', 'She is running.', 'He is swimming.'], e: '🏃' },
    { q: 'What is he doing? (😴)', a: 'He is sleeping.', w: ['He is singing.', 'He is jumping.', 'He is running.', 'He is cooking.'], e: '😴' },
    { q: "Let's dance!", a: 'Great idea!', w: ['Good night.', 'I am nine.', "It's rainy.", 'He is my brother.'] }
  ],
  places: [
    { q: 'Where is the cat?', a: "It's on the box.", w: ["It's in the box.", "It's under the box.", "It's next to the box."], place: ['🐱', '📦', 'on'] },
    { q: 'Where is the ball?', a: "It's under the table.", w: ["It's on the table.", "It's in the table.", "It's behind the table."], place: ['⚽', '🪑', 'under'] },
    { q: 'Where is the fish?', a: "It's in the bowl.", w: ["It's on the bowl.", "It's under the bowl.", "It's next to the bowl."], place: ['🐟', '🥣', 'in'] },
    { q: 'Where is the dog?', a: "It's next to the house.", w: ["It's in the house.", "It's on the house.", "It's under the house."], place: ['🐶', '🏠', 'next to'] },
    { q: 'Where is the bird?', a: "It's on the tree.", w: ["It's under the tree.", "It's in the bag.", "It's behind the house."], place: ['🐦', '🌳', 'on'] },
    { q: 'Where is the teddy bear?', a: "It's on the bed.", w: ["It's under the bed.", "It's in the bag.", "It's next to the door."], place: ['🧸', '🛏️', 'on'] },
    { q: 'Where is the shoe?', a: "It's under the chair.", w: ["It's on the chair.", "It's in the chair.", "It's next to the box."], place: ['👟', '🪑', 'under'] },
    { q: 'Where is the apple?', a: "It's in the basket.", w: ["It's under the basket.", "It's next to the basket.", "It's on the table."], place: ['🍎', '🧺', 'in'] },
    { q: 'Where is the car?', a: "It's next to the tree.", w: ["It's on the tree.", "It's under the tree.", "It's in the tree."], place: ['🚗', '🌳', 'next to'] },
    { q: 'Where is the cat?', a: "It's behind the box.", w: ["It's in front of the box.", "It's on the box.", "It's in the box."], place: ['🐱', '📦', 'behind'] },
    { q: 'Where is the dog?', a: "It's in front of the house.", w: ["It's behind the house.", "It's on the house.", "It's in the house."], place: ['🐶', '🏠', 'in front of'] },
    { q: 'Where is the pencil?', a: "It's in the bag.", w: ["It's on the bag.", "It's under the bag.", "It's behind the bag."], place: ['✏️', '🎒', 'in'] }
  ]
};
// (S.places resimli; ayrıca kelime biçimleri için resim -> "on/in/under" sahneleri)
const PLACE_SCENES = [['🐱', '📦'], ['⚽', '🪑'], ['🐶', '🏠'], ['🧸', '🛏️'], ['🍎', '🧺'], ['🐦', '🌳'], ['✏️', '🎒'], ['👟', '🪑']];

const sentMain = (it) => (it.place ? placePic(it.place[0], it.place[1], it.place[2]) : it.e ? pic(it.e) : '');
const sentText = (it) => it.q.replace(/\s*\([^)]*[\u{1F300}-\u{1FAFF}☀-➿][^)]*\)/u, '').trim();
// Cümle 1: oku ve seç (yazılı soru + yazılı şık)
const sRead = (tid) => (key, seed, pos) => {
  const rng = makeRng(key, seed); const it = cyc(S[tid], pos ?? seed); const ws = shuffle(it.w, rng);
  if (it.pic) return Q({ text: `${it.q} (Hangisi?)`, speak: `${en(it.q)} || Hangisi?`, correct: oImg(it.a, pic(it.a)), wrongs: ws.map(x => oImg(x, pic(x))) });
  return Q({ sig: 'r' + it.q + seed % 2, text: it.tr ? it.q : sentText(it), speak: it.tr ? it.q : `${en(sentText(it))}`, main: sentMain(it), correct: oTxt(it.a), wrongs: ws.map(oTxt) });
};
// Cümle 2: dinle ve seç (sesli soru + yazılı şık; soru yazısı gizli)
const sListen = (tid) => (key, seed, pos) => {
  const rng = makeRng(key, seed); const it = cyc(S[tid], pos ?? seed); const ws = shuffle(it.w, rng);
  const say = it.tr ? it.q : `Dinle. || ${en(sentText(it))} || ${en(sentText(it))}`;
  if (it.pic) return Q({ sig: 'l' + it.q, text: 'Dinle ve yapılanı gösteren resmi seç. 🔊', speak: `Dinle. || ${en(it.q)} || ${en(it.q)}`, correct: oImg(it.a, pic(it.a)), wrongs: ws.map(x => oImg(x, pic(x))) });
  return Q({ sig: 'l' + it.q + seed % 2, text: it.tr ? it.q : 'Dinle ve doğru cevabı seç. 🔊', speak: say, main: sentMain(it), correct: oTxt(it.a), wrongs: ws.map(oTxt) });
};
// Cümle 3: dinle + sesli şık (soru ve şıklar telefonla okunur)
const sAudio = (tid) => (key, seed, pos) => {
  const rng = makeRng(key, seed); const it = cyc(S[tid].filter(x => !x.pic), pos ?? seed); const ws = shuffle(it.w, rng);
  const say = it.tr ? `${it.q} || Şıkları dinle.` : `Dinle. || ${en(sentText(it))} || Şıkları dinle ve doğru cevabı seç.`;
  return Q({ sig: 'a' + it.q + seed % 2, text: it.tr ? `${it.q} (şıkları dinle)` : 'Soruyu ve şıkları dinle. 🔊', speak: say, main: sentMain(it), correct: oAud(it.a, en(it.a)), wrongs: ws.map(x => oAud(x, en(x))), audioOpts: true });
};
// Konum (in / on / under ...) — resim → sesli kelime ve kelime → resim
const placeWord = (key, seed, pos) => {
  const rng = makeRng(key, seed); const rels = V.places.map(x => x[0]); const rel = cyc(rels, pos ?? seed); const [a, b] = pick(PLACE_SCENES, rng);
  const ws = others(rels, rel, rng, 3);
  return Q({ sig: rel + a + b, text: 'Resme bak. Hangisi doğru? (in / on / under ...)', speak: 'Resme bak. Hangisi doğru? Şıkları dinle.', main: placePic(a, b, rel), correct: oAud(rel, en(rel)), wrongs: ws.map(x => oAud(x, en(x))), audioOpts: true });
};
const placePicQ = (key, seed, pos) => {
  const rng = makeRng(key, seed); const rels = V.places.map(x => x[0]); const rel = cyc(rels, pos ?? seed); const [a, b] = pick(PLACE_SCENES, rng);
  const ws = others(rels, rel, rng, 3);
  return Q({ sig: 'p' + rel + a + b, text: `"${rel}" hangisi?`, speak: `Dinle. || ${en(rel)} || Hangisi?`, correct: oImg(rel, placePic(a, b, rel)), wrongs: ws.map(x => oImg(x + a + b, placePic(a, b, x))) });
};
const placeTr = (key, seed, pos) => {
  const rng = makeRng(key, seed); const L = V.places; const w = cyc(L, pos ?? seed);
  return Q({ text: `"${w[0]}" ne demek?`, speak: `${en(w[0])} ne demek?`, correct: oTxt(w[1]), wrongs: others(L, w, rng, 3).map(x => oTxt(x[1])) });
};
// Sayılar: resimdeki nesneleri say → İngilizce sayı (sesli / yazılı)
const COUNT_EMOJI = ['🍎', '⭐', '🐟', '🎈', '🌸', '🚗', '⚽', '🐤', '🍓', '✏️'];
const countWord = (audio) => (key, seed, pos) => {
  const rng = makeRng(key, seed); const L = V.numbers; const w = cyc(L, pos ?? seed); const e = pick(COUNT_EMOJI, rng);
  const near = shuffle(L.filter(x => x !== w && Math.abs(x[2] - w[2]) <= 3), rng).slice(0, 3);
  return Q({ sig: 'c' + w[0] + e + audio, text: audio ? 'How many? Say ve şıkları dinle.' : 'How many? (Kaç tane?)', speak: audio ? `${en('How many?')} || Say ve şıkları dinle.` : `${en('How many?')} || Kaç tane? Say.`, main: countPic(e, w[2]), correct: audio ? oAud(w[0], en(w[0])) : oTxt(w[0]), wrongs: near.map(x => (audio ? oAud(x[0], en(x[0])) : oTxt(x[0]))), audioOpts: audio });
};
// Renkler: renk + nesne ("a red car") resim seçme
const COLOR_OBJ = [['ball', '⚽'], ['car', '🚗'], ['balloon', '🎈'], ['hat', '👒'], ['heart', '❤️'], ['star', '⭐'], ['flower', '🌸'], ['fish', '🐟']];
const colorObj = (key, seed, pos) => {
  const rng = makeRng(key, seed); const C = V.colors.filter(c => !['white', 'grey', 'black'].includes(c[0])); const c = cyc(C, pos ?? seed); const [nm] = pick(COLOR_OBJ, rng);
  const drawCol = (col) => card(`<circle cx="50" cy="52" r="34" fill="${col[2]}" stroke="#1e293b" stroke-width="3"/><text x="50" y="54" font-size="15" font-weight="800" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="${col[0] === 'yellow' ? '#1e293b' : '#fff'}">${nm}</text>`);
  const ws = others(C, c, rng, 3);
  return Q({ sig: 'co' + c[0] + nm, text: `Dinle: hangi ${nm}? 🔊`, speak: `Dinle. || ${en(`a ${c[0]} ${nm}`)} || ${en(`a ${c[0]} ${nm}`)}`, correct: oImg(c[0] + nm, drawCol(c)), wrongs: ws.map(x => oImg(x[0] + nm, drawCol(x))) });
};
// ---------------------------------------------------------------------------
// KONULAR
// ---------------------------------------------------------------------------
const sentKind = (tid) => kind(`eng_${tid}_cumle`, 'Cümle ve Diyalog', [
  g(`${tid}_sr`, 'Oku ve seç (yazılı)', sRead(tid), 14),
  g(`${tid}_sl`, 'Dinle ve seç (sesli soru)', sListen(tid), 14),
  g(`${tid}_sa`, 'Dinle + sesli şık', sAudio(tid), 10)
]);
const T = (tid, label, color, n = 6, extra = []) => topic(`eng_${tid}`, label, color, [...vocabKinds(tid, n), sentKind(tid), ...extra]);

export const ENGLISH_TOPICS = [
  T('greet', '1. Greetings (Selamlaşma)', 'indigo', 4),
  T('numbers', '2. Numbers 1-20 (Sayılar)', 'sky', 6, [kind('eng_numbers_say', 'Say ve Söyle', [g('numbers_cw', 'Say → yazılı şık', countWord(false), 12), g('numbers_ca', 'Say → sesli şık', countWord(true), 12)])]),
  T('colors', '3. Colors (Renkler)', 'rose', 5, [kind('eng_colors_nesne', 'Renkli Nesne', [g('colors_co', 'Dinle → renkli nesne', colorObj, 12)])]),
  T('family', '4. My Family (Ailem)', 'amber', 5),
  T('feelings', '5. Feelings (Duygular)', 'pink', 5),
  T('toys', '6. Toys and Games (Oyuncaklar)', 'violet', 5),
  T('house', '7. My House (Evim)', 'orange', 5),
  T('city', '8. In My City (Şehrim)', 'teal', 5),
  T('transport', '9. Transportation (Taşıtlar)', 'cyan', 5),
  T('weather', '10. Weather (Hava Durumu)', 'blue', 5),
  T('animals', '11. Animals and Nature (Hayvanlar)', 'emerald', 6),
  T('food', '12. Food and Fruits (Yiyecekler)', 'lime', 6),
  T('body', '13. My Body (Vücudumuz)', 'fuchsia', 5),
  T('clothes', '14. Clothes (Giysiler)', 'purple', 5),
  T('school', '15. School Things (Okul Eşyaları)', 'yellow', 5),
  T('actions', '16. Actions — can / can\'t (Eylemler)', 'red', 5),
  topic('eng_places', '17. Where is it? — in / on / under (Konum)', 'slate', [
    kind('eng_places_kelime', 'Kelime', [g('places_pw', 'Resim → sesli şık', placeWord, 16), g('places_pp', 'Dinle → resimli şık', placePicQ, 16), g('places_tr', 'İngilizce → Türkçe', placeTr, 8)]),
    sentKind('places')
  ])
];

export const ENGLISH_BANK = makeSubjectBank({
  id: 'eng',
  title: 'ingilizce (3. sınıf)',
  intro: '17 konu, toplam 1000 hazır soru. Soru biçimleri karışık: resimli / yazılı / sesli sorular ve resimli / yazılı / sesli şıklar. İngilizce kelimeler telefonun İngilizce sesiyle, yönergeler Türkçe sesle okunur (ses yüklemezseniz). Şık yazılarının gizli/görünür olması sorunun biçimine göre otomatik ayarlanır.',
  rootFolder: 'İngilizce (3. Sınıf)',
  topics: ENGLISH_TOPICS,
  total: 1000
});
