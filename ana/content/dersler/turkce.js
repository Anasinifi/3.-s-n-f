// ============================================================================
// --- TÜRKÇE (3. SINIF) — 1000 HAZIR SORU ---
// ============================================================================
// Konular: eş anlamlı, zıt anlamlı, eş sesli kelimeler, alfabetik sıralama, hece, yazım kuralları
// (büyük harf, doğru yazım), noktalama, isim / sıfat (varlık - özellik), ekler (yeni kelime),
// deyim ve atasözü, sebep - sonuç, okuduğunu / dinlediğini anlama.
import { pic, textPic, oTxt, oAud, Q, cyc, capped, makeRng, pick, shuffle, pickN, randInt, misspell, makeSubjectBank, grp, topic, kind, factGen, pairGen } from './common';

const g = grp('trk');

// --- eş / zıt anlamlı ---
const ES = [['siyah', 'kara'], ['beyaz', 'ak'], ['kırmızı', 'al'], ['okul', 'mektep'], ['öğretmen', 'muallim'], ['öğrenci', 'talebe'], ['cevap', 'yanıt'], ['soru', 'sual'], ['hediye', 'armağan'], ['misafir', 'konuk'], ['doktor', 'hekim'], ['ihtiyar', 'yaşlı'], ['sınav', 'imtihan'], ['kelime', 'sözcük'], ['cümle', 'tümce'], ['yıl', 'sene'], ['hızlı', 'süratli'], ['güzel', 'hoş'], ['kalp', 'yürek'], ['zengin', 'varlıklı'], ['fakir', 'yoksul'], ['istek', 'arzu'], ['şehir', 'kent'], ['ülke', 'yurt'], ['ad', 'isim'], ['baba', 'peder'], ['anne', 'ana'], ['ev', 'konut'], ['rüzgâr', 'yel'], ['hikâye', 'öykü'], ['kitaplık', 'kütüphane'], ['dost', 'arkadaş'], ['akıllı', 'zeki'], ['yardım', 'destek'], ['mutlu', 'sevinçli'], ['neden', 'sebep'], ['savaş', 'harp'], ['sonuç', 'netice'], ['kuvvet', 'güç'], ['nehir', 'ırmak']];
const ZIT = [['büyük', 'küçük', '🐘'], ['uzun', 'kısa'], ['sıcak', 'soğuk', '🔥'], ['açık', 'kapalı', '🚪'], ['ağır', 'hafif', '🏋️'], ['hızlı', 'yavaş', '🐇'], ['iyi', 'kötü'], ['güzel', 'çirkin'], ['yaşlı', 'genç'], ['zengin', 'fakir'], ['temiz', 'kirli', '🧼'], ['dolu', 'boş'], ['ıslak', 'kuru', '💧'], ['yeni', 'eski'], ['gece', 'gündüz', '🌙'], ['sabah', 'akşam'], ['aşağı', 'yukarı'], ['ön', 'arka'], ['ileri', 'geri'], ['kalın', 'ince'], ['geniş', 'dar'], ['derin', 'sığ'], ['tatlı', 'acı', '🍬'], ['sert', 'yumuşak'], ['erken', 'geç', '⏰'], ['gelmek', 'gitmek'], ['almak', 'vermek'], ['gülmek', 'ağlamak', '😀'], ['açmak', 'kapamak'], ['başlamak', 'bitirmek'], ['doğru', 'yanlış', '✅'], ['kolay', 'zor'], ['çalışkan', 'tembel'], ['cesur', 'korkak', '🦁'], ['aydınlık', 'karanlık', '💡'], ['savaş', 'barış', '🕊️'], ['dost', 'düşman'], ['var', 'yok'], ['az', 'çok'], ['ucuz', 'pahalı']];
// --- eş sesli ---
const ESSESLI = [
  { q: '"Yüzü güneşten kızarmıştı." cümlesinde "yüz" hangi anlamda kullanılmıştır?', a: 'insanın ön tarafı, surat', w: ['sayı (100)', 'suda yüzmek', 'kumaşın üstü'] },
  { q: '"Denizde yüz metre yüzdük." cümlesinde "yüz" hangi anlamda kullanılmıştır?', a: 'sayı (100)', w: ['insanın ön tarafı, surat', 'suda ilerlemek', 'yastığın kılıfı'] },
  { q: '"Bahçedeki gül çok güzel kokuyor." cümlesinde "gül" ne anlama gelir?', a: 'bir çiçek', w: ['gülmek eylemi', 'bir renk', 'bir meyve'] },
  { q: '"Fıkrayı duyunca gül bakalım!" cümlesinde "gül" ne anlama gelir?', a: 'gülmek eylemi', w: ['bir çiçek', 'bir renk', 'bir kuş'] },
  { q: '"Kahvaltıda bir bardak çay içtim." cümlesinde "çay" ne anlama gelir?', a: 'bir içecek', w: ['küçük akarsu', 'bir bitki tohumu', 'bir oyun'] },
  { q: '"Köyün yanından küçük bir çay akıyordu." cümlesinde "çay" ne anlama gelir?', a: 'küçük akarsu', w: ['bir içecek', 'bir ağaç', 'bir hayvan'] },
  { q: '"Bu yaz tatile denize gideceğiz." cümlesinde "yaz" ne anlama gelir?', a: 'bir mevsim', w: ['yazı yazmak', 'bir renk', 'bir gün adı'] },
  { q: '"Adını deftere güzelce yaz." cümlesinde "yaz" ne anlama gelir?', a: 'yazı yazmak', w: ['bir mevsim', 'bir meyve', 'bir şehir'] },
  { q: '"Pikniğe kıra gittik." cümlesinde "kır" ne anlama gelir?', a: 'şehir dışı, açık alan', w: ['bir şeyi kırmak', 'beyaz saç', 'bir renk'] },
  { q: '"Dedemin saçları kır olmuş." cümlesinde "kır" ne anlama gelir?', a: 'beyaz ve siyah karışık (saç)', w: ['şehir dışı, açık alan', 'bir şeyi parçalamak', 'bir oyun'] },
  { q: '"Sabaha karşı dolu yağdı." cümlesinde "dolu" ne anlama gelir?', a: 'buz taneleri hâlinde yağış', w: ['boş olmayan', 'kalabalık', 'bir silah'] },
  { q: '"Bardak su ile dolu." cümlesinde "dolu" ne anlama gelir?', a: 'boş olmayan', w: ['buz taneli yağış', 'bir mevsim', 'bir yiyecek'] },
  { q: '"Annem sobaya kömür attı, ocak ısındı." cümlesinde "ocak" ne anlama gelir?', a: 'ateş yakılan yer', w: ['yılın ilk ayı', 'bir hayvan yuvası', 'bir yemek'] },
  { q: '"Ocak ayında kar yağdı." cümlesinde "ocak" ne anlama gelir?', a: 'yılın ilk ayı', w: ['ateş yakılan yer', 'maden çıkarılan yer', 'mutfak tezgâhı'] },
  { q: '"Kapının kolu kırılmış." cümlesinde "kol" ne anlama gelir?', a: 'tutup açmaya yarayan parça', w: ['vücudumuzun bir parçası', 'bir takım, grup', 'bir yol'] },
  { q: '"Ocağa dokununca elim yandı." cümlesinde "yan" ne anlama gelir?', a: 'yanmak (ateşten zarar görmek)', w: ['bir şeyin kenarı', 'taraf', 'yatmak'] },
  { q: '"Okulun yanında bir park var." cümlesinde "yan" ne anlama gelir?', a: 'bir şeyin kenarı, bitişiği', w: ['ateşte yanmak', 'kızmak', 'uyumak'] },
  { q: '"At arabası yavaşça ilerledi." cümlesinde "at" ne anlama gelir?', a: 'bir hayvan', w: ['bir şeyi fırlatmak', 'isim', 'bir oyun'] },
  { q: '"Topu bana at!" cümlesinde "at" ne anlama gelir?', a: 'fırlatmak', w: ['bir hayvan', 'bir taşıt', 'bir renk'] },
  { q: '"Bu yıl dokuz yaşına bastım." cümlesinde "yaş" ne anlama gelir?', a: 'insanın yaşadığı yıl sayısı', w: ['ıslak', 'gözyaşı', 'taze'] },
  { q: '"Yağmurda çamaşırlar yaş oldu." cümlesinde "yaş" ne anlama gelir?', a: 'ıslak', w: ['insanın yaşı', 'yaşlı', 'taze meyve'] },
  { q: 'Eş sesli (sesteş) kelimeler nasıl kelimelerdir?', a: 'yazılışı ve okunuşu aynı, anlamı farklı', w: ['anlamı aynı, yazılışı farklı', 'anlamları birbirinin zıttı', 'yazılışı da okunuşu da farklı'] }
];
// --- alfabe ---
const ALF = 'abcçdefgğhıijklmnoöprsştuüvyz';
const cmpTr = (a, b) => { for (let i = 0; i < Math.min(a.length, b.length); i++) { const x = ALF.indexOf(a[i]), y = ALF.indexOf(b[i]); if (x !== y) return x - y; } return a.length - b.length; };
const WORDS = ['araba', 'arı', 'armut', 'balık', 'balon', 'bardak', 'cetvel', 'ceviz', 'çanta', 'çiçek', 'çorap', 'davul', 'defter', 'dere', 'elma', 'ekmek', 'erik', 'fare', 'fil', 'fırın', 'gemi', 'gözlük', 'güneş', 'halı', 'havuç', 'horoz', 'ırmak', 'ışık', 'ılık', 'inek', 'incir', 'kalem', 'kapı', 'kedi', 'kitap', 'lale', 'limon', 'masa', 'mektup', 'müze', 'nar', 'nane', 'okul', 'orman', 'ördek', 'ödev', 'pasta', 'peynir', 'portakal', 'resim', 'roket', 'saat', 'silgi', 'şapka', 'şeker', 'şemsiye', 'tavuk', 'top', 'uçak', 'uçurtma', 'üzüm', 'ütü', 'vapur', 'yaprak', 'yıldız', 'zebra', 'zil', 'sandalye', 'salata', 'sabun', 'kiraz', 'kilit', 'kazak'];
const alphaFirst = (key, seed) => {
  const rng = makeRng(key, seed); let ws; for (let t = 0; t < 20; t++) { ws = pickN(WORDS, 4, rng); if (rng() < 0.6) { const L = ws[0][0]; const same = WORDS.filter(w => w[0] === L && !ws.includes(w)); if (same.length) ws[1] = pick(same, rng); } if (new Set(ws).size === 4) break; }
  const last = rng() < 0.4; const sorted = [...ws].sort(cmpTr); const ans = last ? sorted[3] : sorted[0];
  const q = `Alfabetik sıralamada ${last ? 'en sonda' : 'en başta'} hangi kelime yer alır?`;
  return Q({ sig: 'af' + ws.sort().join() + last, text: q, speak: q, correct: oTxt(ans), wrongs: ws.filter(w => w !== ans).map(oTxt) });
};
const alphaOrder = (key, seed) => {
  const rng = makeRng(key, seed); const ws = pickN(WORDS, 4, rng); const s = [...ws].sort(cmpTr);
  const wr = [[s[1], s[0], s[2], s[3]], [s[0], s[2], s[1], s[3]], [s[3], s[2], s[1], s[0]], [s[0], s[1], s[3], s[2]]];
  return Q({ sig: 'ao' + s.join(), text: 'Hangisi alfabetik sıraya göre doğru dizilmiştir?', correct: oTxt(s.join(' - ')), wrongs: wr.map(w => oTxt(w.join(' - '))) });
};
const alphaLetter = (key, seed) => {
  const rng = makeRng(key, seed); const up = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'; const i = randInt(rng, 1, up.length - 2); const after = rng() < 0.5;
  const ans = up[after ? i + 1 : i - 1]; const q = `Alfabede "${up[i]}" harfinden hemen ${after ? 'sonra' : 'önce'} hangi harf gelir?`;
  const ws = [up[after ? i - 1 : i + 1], up[Math.min(up.length - 1, i + 2)], up[Math.max(0, i - 2)], up[(i + 5) % up.length]].filter(x => x !== ans);
  return Q({ sig: 'al' + i + after, text: q, speak: q, main: textPic(up[i], { size: 56, w: 120 }), correct: oTxt(ans), wrongs: ws.map(oTxt) });
};
// --- hece ---
const VOW = 'aeıioöuüâîû';
export const heceler = (w) => {
  const s = w.toLocaleLowerCase('tr-TR'); const idx = []; for (let i = 0; i < s.length; i++) if (VOW.includes(s[i])) idx.push(i);
  const out = []; let start = 0;
  for (let k = 0; k < idx.length - 1; k++) { const v1 = idx[k], v2 = idx[k + 1]; const cons = v2 - v1 - 1; const cut = cons === 0 ? v1 + 1 : v2 - 1; out.push(s.slice(start, cut)); start = cut; }
  out.push(s.slice(start)); return out;
};
const HECE_W = ['kelebek', 'çikolata', 'öğretmen', 'karınca', 'kaplumbağa', 'bisiklet', 'televizyon', 'pencere', 'bilgisayar', 'ayakkabı', 'kütüphane', 'portakal', 'sandalye', 'uçurtma', 'çilek', 'anneanne', 'domates', 'hastane', 'yumurta', 'tavşan', 'zürafa', 'kardeş', 'arkadaş', 'karpuz', 'salıncak', 'oyuncak', 'ilkbahar', 'sonbahar', 'buzdolabı', 'gökkuşağı', 'yıldız', 'kırmızı', 'turuncu', 'deniz', 'ağaç', 'kitap', 'mutfak', 'sınıf', 'toprak', 'şemsiye', 'elbise', 'pantolon', 'havuç', 'patlıcan', 'maydanoz', 'orman', 'tren', 'spor', 'kral'];
const heceCount = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const w = cyc(HECE_W, pos ?? seed); const n = heceler(w).length;
  return Q({ sig: 'hc' + w, text: `"${w}" kelimesi kaç hecelidir?`, speak: `${w}. Bu kelime kaç hecelidir?`, main: textPic(w, { size: 34 }), correct: oTxt(String(n)), wrongs: [n + 1, n + 2, n > 1 ? n - 1 : n + 3].map(x => oTxt(String(x))) });
}, HECE_W.length);
const heceSplit = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const w = cyc(HECE_W.filter(x => heceler(x).length >= 2), pos ?? seed); const h = heceler(w);
  const wrongs = new Set(); const join = (a) => a.join('-');
  for (let t = 0; t < 20 && wrongs.size < 3; t++) { const k = randInt(rng, 0, h.length - 2); const a = [...h]; if (a[k].length > 1 && rng() < 0.5) { a[k + 1] = a[k].slice(-1) + a[k + 1]; a[k] = a[k].slice(0, -1); } else if (a[k + 1].length > 1) { a[k] = a[k] + a[k + 1][0]; a[k + 1] = a[k + 1].slice(1); } if (a.every(x => x) && join(a) !== join(h)) wrongs.add(join(a)); }
  if (wrongs.size < 3) wrongs.add(w.split('').join('-'));
  return Q({ sig: 'hs' + w, text: `"${w}" kelimesi hangi seçenekte hecelerine doğru ayrılmıştır?`, speak: `${w} kelimesi hangi seçenekte hecelerine doğru ayrılmıştır?`, correct: oTxt(join(h)), wrongs: [...wrongs].map(oTxt) });
}, 46);
// --- yazım ---
const DOGRU = [['herkes', ['herkez', 'herkess', 'erkes']], ['yalnız', ['yanlız', 'yalınız', 'yalnis']], ['yanlış', ['yalnış', 'yanlis', 'yanılış']], ['şoför', ['şöför', 'şofor', 'şöfor']], ['kirpik', ['kirbik', 'kiprik', 'kirpikk']], ['tren', ['tiren', 'teren', 'trenn']], ['spor', ['sipor', 'ispor', 'sporr']], ['kibrit', ['kirbit', 'kibirit', 'kibrid']], ['eşofman', ['eşortman', 'eşofmen', 'eşoğman']], ['mikrop', ['mikirop', 'mikrob', 'mükrop']], ['makarna', ['markana', 'makarana', 'makerna']], ['ilkbahar', ['ilkbaar', 'ilkbahr', 'ilkbaharr']], ['öğretmen', ['öretmen', 'öğretmenn', 'ögretmen']], ['meyve', ['meyva', 'meyye', 'mayve']], ['traktör', ['tıraktör', 'traktor', 'taraktör']], ['kahvaltı', ['kavaltı', 'kahfaltı', 'kahvaltu']], ['süpürge', ['sipürge', 'süprüge', 'süpürgü']], ['pantolon', ['pantalon', 'pantolan', 'pantılon']], ['kütüphane', ['kütüpane', 'kütübhane', 'kitüphane']], ['orkestra', ['orkesra', 'okestra', 'orkestira']], ['birkaç', ['bir kaç', 'birkac', 'birkaçç']], ['hiçbir', ['hiç bir', 'hicbir', 'hiçbirr']], ['laboratuvar', ['laboratuar', 'labaratuvar', 'laburatuvar']], ['sürpriz', ['süpriz', 'sürüpriz', 'surpriz']], ['acaba', ['acapa', 'acaaba', 'aceba']], ['tabii', ['tabi', 'tabiî', 'tebii']], ['kirpi', ['kipri', 'kırpi', 'kirbi']], ['yarın', ['yarim', 'yerın', 'yaarın']], ['gözlük', ['gözlik', 'göslük', 'gözlükk']], ['palyaço', ['paylaço', 'palyaçu', 'palyoço']], ['tiyatro', ['tiyatru', 'tiatro', 'tiyaro']], ['kamyon', ['kemyon', 'kamyun', 'kanyon']], ['dolap', ['dolab', 'dulap', 'dolapp']], ['penguen', ['pengüen', 'pinguen', 'pengen']], ['ambulans', ['anbulans', 'ambülans', 'ambulanss']], ['bisiklet', ['bisklet', 'bisiklat', 'bsiklet']], ['helikopter', ['helikobter', 'helekopter', 'helikoptar']], ['yoğurt', ['yourt', 'yoğort', 'yoğurtt']], ['şemsiye', ['şemşiye', 'şemsie', 'şemsiyye']], ['patates', ['patetes', 'potates', 'patatess']]];
const spellQ = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const [w, ws] = cyc(DOGRU, pos ?? seed);
  return Q({ sig: 'sp' + w, text: 'Hangi kelimenin yazımı doğrudur?', speak: 'Hangi kelimenin yazımı doğrudur?', correct: oTxt(w), wrongs: shuffle(ws, rng).map(oTxt) });
}, DOGRU.length);
const BUYUK = [
  ['Ali, Ankara\'ya gitti.', ['ali, Ankara\'ya gitti.', 'Ali, ankara\'ya gitti.', 'ali, ankara\'ya gitti.']],
  ['Kedimin adı Pamuk.', ['kedimin adı Pamuk.', 'Kedimin adı pamuk.', 'kedimin adı pamuk.']],
  ['Yazın Antalya\'ya gideceğiz.', ['yazın Antalya\'ya gideceğiz.', 'Yazın antalya\'ya gideceğiz.', 'Yazın Antalya\'Ya gideceğiz.']],
  ['Zeynep Öğretmen bize masal okudu.', ['zeynep öğretmen bize masal okudu.', 'Zeynep öğretmen Bize masal okudu.', 'zeynep Öğretmen bize masal okudu.']],
  ['Türkiye\'nin başkenti Ankara\'dır.', ['türkiye\'nin başkenti Ankara\'dır.', 'Türkiye\'nin başkenti ankara\'dır.', 'Türkiye\'nin Başkenti ankara\'dır.']],
  ['Dedem Kızılırmak\'ta balık tuttu.', ['dedem Kızılırmak\'ta balık tuttu.', 'Dedem kızılırmak\'ta balık tuttu.', 'Dedem Kızılırmak\'ta Balık tuttu.']],
  ['Annem Pazartesi günü Bursa\'ya gitti.', ['annem pazartesi günü bursa\'ya gitti.', 'Annem pazartesi günü bursa\'ya gitti.', 'annem Pazartesi günü Bursa\'ya gitti.']],
  ['Ağrı Dağı çok yüksektir.', ['ağrı dağı çok yüksektir.', 'Ağrı dağı çok yüksektir.', 'ağrı Dağı çok yüksektir.']],
  ['Can, Ece ve Mert parka gitti.', ['Can, ece ve mert parka gitti.', 'can, Ece ve Mert parka gitti.', 'Can, Ece ve mert Parka gitti.']],
  ['29 Ekim Cumhuriyet Bayramı\'nı kutladık.', ['29 ekim cumhuriyet bayramı\'nı kutladık.', '29 Ekim cumhuriyet Bayramı\'nı kutladık.', '29 ekim Cumhuriyet bayramı\'nı kutladık.']]
];
const C_NAMES = ['Ali', 'Elif', 'Can', 'Zeynep', 'Ece', 'Mert', 'Defne', 'Emir', 'Ada', 'Kerem', 'Yusuf', 'Asel'];
const C_CITY = ['Ankara', 'İzmir', 'Bursa', 'Antalya', 'Trabzon', 'Konya', 'Erzurum', 'Van', 'Muğla', 'Samsun'];
const C_TPL = [
  (n, c) => [`${n} yazın ${c}'ya gitti.`, [n, c]], (n, c) => [`Teyzem ${c}'da oturuyor.`, [c]], (n, c) => [`${n} ile ${c} Kalesi'ni gezdik.`, [n, c, 'Kalesi']],
  (n, c) => [`Kedimin adı ${n === 'Ali' ? 'Pamuk' : 'Boncuk'}.`, [n === 'Ali' ? 'Pamuk' : 'Boncuk']], (n, c) => [`${n} Öğretmen bize ${c} hakkında bilgi verdi.`, [n, 'Öğretmen', c]],
  (n, c) => [`Biz Türkiye'de yaşıyoruz.`, ["Türkiye'de"]], (n, c) => [`${n}, Pazartesi günü okula gelmedi.`, [n]]
];
const lowerFirst = (w) => w.charAt(0).toLocaleLowerCase('tr-TR') + w.slice(1);
const upperFirst = (w) => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1);
const capsGen = (key, seed) => {
  const rng = makeRng(key, seed); const n = pick(C_NAMES, rng), c = pick(C_CITY, rng);
  const [sent, props] = pick(C_TPL, rng)(n, c);
  const words = sent.split(' ');
  const variants = new Set();
  const tryV = (fn) => { const v = fn([...words]).join(' '); if (v !== sent) variants.add(v); };
  tryV(w => { w[0] = lowerFirst(w[0]); return w; });
  props.forEach(p => tryV(w => w.map(x => (x.replace(/[,.]/g, '') === p || x.startsWith(p) ? lowerFirst(x) : x))));
  tryV(w => { const k = w.findIndex((x, j) => j > 0 && !props.some(p => x.startsWith(p)) && /^[a-zçğıöşü]/.test(x)); if (k > 0) w[k] = upperFirst(w[k]); return w; });
  tryV(w => w.map((x, j) => (j === 0 ? x : lowerFirst(x))));
  if (variants.size < 3) return null;
  return Q({ sig: 'bh' + sent, text: 'Hangi cümlede büyük harfler doğru kullanılmıştır?', speak: 'Hangi cümlede büyük harfler doğru kullanılmıştır?', correct: oTxt(sent), wrongs: shuffle([...variants], rng).map(oTxt) });
};
const capsQ = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const [a, ws] = cyc(BUYUK, pos ?? seed);
  return Q({ sig: 'bh' + a, text: 'Hangi cümlede büyük harfler doğru kullanılmıştır?', speak: 'Hangi cümlede büyük harfler doğru kullanılmıştır?', correct: oTxt(a), wrongs: shuffle(ws, rng).map(oTxt) });
}, BUYUK.length);
const NOKTA = [
  ['Bugün okula erken geldin mi', '?'], ['Hangi rengi seversin', '?'], ['Eyvah, süt taştı', '!'], ['Ne güzel bir gün', '!'], ['Kardeşim parkta oynuyor', '.'], ['Kitabımı okudum', '.'], ['Ödevini yaptın mı', '?'], ['Yaşasın, tatil başladı', '!'], ['Akşam yemeğinde çorba içtik', '.'], ['Kaç yaşındasın', '?'], ['İmdat, yangın var', '!'], ['Kedim bahçede uyuyor', '.'], ['Neden ağlıyorsun', '?'], ['Aferin, çok güzel boyamışsın', '!'], ['Sabah kahvaltı yaptık', '.'], ['Nereye gidiyorsun', '?'], ['Dikkat et, düşeceksin', '!'], ['Okulumuzun bahçesi çok geniş', '.'], ['Bu kitabı kim yazdı', '?'], ['Aaa, ne kadar büyük bir balık', '!'], ['Babam her sabah gazete okur', '.'], ['Teneffüs ne zaman bitecek', '?'], ['Hadi, çabuk ol', '!'], ['Kuşlar ağaçta ötüyor', '.'], ['Annen evde mi', '?'], ['Of, çok sıkıldım', '!'], ['Yarın müzeye gideceğiz', '.'], ['Sınıfınızda kaç öğrenci var', '?'], ['Oley, kar yağıyor', '!'], ['Ablam üniversitede okuyor', '.'], ['En sevdiğin hayvan hangisi', '?'], ['Eyvah, kalemimi unuttum', '!'], ['Dedem bahçeye domates ekti', '.'], ['Bu akşam ne yiyeceğiz', '?'], ['Ah, parmağımı kestim', '!'], ['Kardeşim çok güzel resim çizer', '.']
];
const NAME = { '?': 'soru işareti (?)', '!': 'ünlem işareti (!)', '.': 'nokta (.)' };
const punctQ = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const [s, p] = cyc(NOKTA, pos ?? seed); const audio = Math.floor((pos ?? seed) / NOKTA.length) % 2 === 1;
  const opts = [NAME[p], ...Object.values(NAME).filter(x => x !== NAME[p]), 'virgül (,)'];
  if (audio) return Q({ sig: 'na' + s, text: `"${s} ..." cümlesinin sonuna hangi işaret konur? (şıkları dinle)`, speak: `${s}. Bu cümlenin sonuna hangi noktalama işareti konur? Şıkları dinle.`, correct: oAud(opts[0]), wrongs: opts.slice(1).map(x => oAud(x)), audioOpts: true });
  return Q({ sig: 'nt' + s, text: `"${s} ..." cümlesinin sonuna hangi işaret konmalıdır?`, speak: `${s}. Bu cümlenin sonuna hangi noktalama işareti konmalıdır?`, correct: oTxt(opts[0]), wrongs: opts.slice(1).map(oTxt) });
}, NOKTA.length * 2);
const virgulQ = factGen([
  { q: 'Hangi cümlede virgül doğru kullanılmıştır?', a: 'Elma, armut ve muz aldık.', w: ['Elma armut, ve muz aldık.', 'Elma armut ve, muz aldık.', 'Elma, armut, ve, muz aldık.'] },
  { q: 'Hangi cümlede kesme işareti doğru kullanılmıştır?', a: 'Ayşe\'nin kalemi kırıldı.', w: ['Ayşenin\' kalemi kırıldı.', 'Ayşe\'nin kalem\'i kırıldı.', 'Ayşe nin kalemi kırıldı.'] },
  { q: 'Hangi cümlede kesme işareti doğru kullanılmıştır?', a: 'İzmir\'de deniz çok güzel.', w: ['İzmirde\' deniz çok güzel.', 'İzmir\'de deniz\'i çok güzel.', 'İzmir de\' deniz çok güzel.'] },
  { q: 'Konuşma çizgisi (–) nerede kullanılır?', a: 'Karşılıklı konuşmalarda, konuşmanın başında', w: ['Cümlenin sonunda', 'Soru sorarken', 'Sayıları yazarken'] },
  { q: 'İki nokta (:) hangi cümlede doğru kullanılmıştır?', a: 'Çantamda şunlar var: kalem, silgi, defter.', w: ['Çantamda: şunlar var kalem, silgi.', 'Çantamda şunlar: var kalem silgi.', 'Çan:tamda şunlar var.'] },
  { q: 'Hangi cümlenin sonuna soru işareti konmaz?', a: 'Bugün hava çok güzel', w: ['Hava nasıl', 'Kaç kardeşsin', 'Neden geç kaldın'] },
  { q: 'Hangi cümlenin sonuna ünlem işareti konur?', a: 'Eyvah, otobüsü kaçırdık', w: ['Otobüs saat sekizde gelir', 'Otobüs ne zaman gelir', 'Otobüse binerek okula gittik'] },
  { q: 'Saatleri yazarken hangi işaret kullanılır? (08...30)', a: 'nokta (08.30)', w: ['virgül (08,30)', 'soru işareti (08?30)', 'ünlem işareti (08!30)'] }
]);
// --- isim / sıfat, ekler ---
const ISIM_SIFAT = [['kalem', 'isim'], ['masa', 'isim'], ['Ankara', 'isim'], ['kedi', 'isim'], ['Elif', 'isim'], ['ağaç', 'isim'], ['okul', 'isim'], ['deniz', 'isim'], ['kırmızı', 'sıfat'], ['büyük', 'sıfat'], ['tatlı', 'sıfat'], ['uzun', 'sıfat'], ['çalışkan', 'sıfat'], ['yumuşak', 'sıfat'], ['eski', 'sıfat'], ['sıcak', 'sıfat'], ['koşmak', 'eylem (fiil)'], ['okumak', 'eylem (fiil)'], ['yazmak', 'eylem (fiil)'], ['uyumak', 'eylem (fiil)'], ['gülmek', 'eylem (fiil)'], ['oynamak', 'eylem (fiil)'], ['bulut', 'isim'], ['tavşan', 'isim'], ['pencere', 'isim'], ['İstanbul', 'isim'], ['bahçe', 'isim'], ['ekmek', 'isim'], ['hızlı', 'sıfat'], ['mutlu', 'sıfat'], ['yeşil', 'sıfat'], ['kirli', 'sıfat'], ['ağır', 'sıfat'], ['ekşi', 'sıfat'], ['koşmak', 'eylem (fiil)'], ['içmek', 'eylem (fiil)'], ['dinlemek', 'eylem (fiil)'], ['yüzmek', 'eylem (fiil)'], ['çizmek', 'eylem (fiil)'], ['gitmek', 'eylem (fiil)']].filter((x, i, a) => a.findIndex(y => y[0] === x[0]) === i);
const SIFAT_CUMLE = [
  ['Mavi balon gökyüzüne uçtu.', 'mavi'], ['Küçük kedi süt içti.', 'küçük'], ['Annem sıcak çorba yaptı.', 'sıcak'], ['Çalışkan öğrenci ödevini bitirdi.', 'çalışkan'], ['Yaşlı adam bankta oturuyordu.', 'yaşlı'], ['Uzun ağacın dalları kırıldı.', 'uzun'], ['Tatlı elmalar sepette duruyor.', 'tatlı'], ['Yeni ayakkabılarımı giydim.', 'yeni'], ['Kocaman bir pasta aldık.', 'kocaman'], ['Sarı civciv annesinin peşinden gitti.', 'sarı']
];
const S_ADJ = ['kırmızı', 'küçük', 'büyük', 'sıcak', 'soğuk', 'çalışkan', 'yaşlı', 'uzun', 'tatlı', 'yeni', 'kocaman', 'sarı', 'yumuşak', 'eski', 'neşeli', 'temiz', 'ekşi', 'mavi'];
const S_NOUN = [['kedi', 'süt içti'], ['çocuk', 'parkta koştu'], ['elma', 'sepette duruyor'], ['balon', 'gökyüzüne uçtu'], ['kitap', 'masada duruyor'], ['köpek', 'bahçede havladı'], ['araba', 'yolda ilerledi'], ['kazak', 'dolapta asılı'], ['öğrenci', 'ödevini bitirdi'], ['ağaç', 'rüzgârda sallandı'], ['çorba', 'masaya kondu'], ['kuş', 'dalda öttü']];
const sifatQ = (key, seed) => {
  const rng = makeRng(key, seed); const a = pick(S_ADJ, rng); const [n, v] = pick(S_NOUN, rng);
  const s = `${upperFirst(a)} ${n} ${v}.`; const words = [n, ...v.split(' ')];
  return Q({ sig: 'sf' + s, text: `"${s}" cümlesinde varlığın özelliğini (nasıl olduğunu) bildiren kelime hangisidir?`, speak: `${s} || Bu cümlede varlığın özelliğini bildiren kelime hangisidir?`, correct: oTxt(a), wrongs: shuffle(words, rng).slice(0, 3).map(oTxt) });
};
const turQ = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const [w, t] = cyc(ISIM_SIFAT, pos ?? seed);
  const all = ['isim', 'sıfat', 'eylem (fiil)'];
  return Q({ sig: 'tr' + w, text: `"${w}" kelimesi hangi türdendir? (isim: varlık adı, sıfat: özellik, eylem: iş - hareket)`, speak: `${w}. Bu kelime varlık adı mı, özellik mi, yoksa iş ve hareket mi bildirir?`, correct: oTxt(t), wrongs: [...all.filter(x => x !== t), 'bağlaç'].map(oTxt) });
}, ISIM_SIFAT.length);
const OZEL = [['Atatürk', 'özel isim'], ['Antalya', 'özel isim'], ['Fırat', 'özel isim'], ['Karabaş (köpeğin adı)', 'özel isim'], ['Türkiye', 'özel isim'], ['Van Gölü', 'özel isim'], ['şehir', 'cins isim'], ['köpek', 'cins isim'], ['nehir', 'cins isim'], ['ülke', 'cins isim'], ['göl', 'cins isim'], ['çocuk', 'cins isim']];
const ozelQ = capped((key, seed, pos) => { const rng = makeRng(key, seed); const [w, t] = cyc(OZEL, pos ?? seed); return Q({ sig: 'oz' + w, text: `"${w}" özel isim mi, cins isim mi?`, speak: `${w}. Özel isim mi, cins isim mi?`, correct: oTxt(t), wrongs: [t === 'özel isim' ? 'cins isim' : 'özel isim', 'sıfat', 'eylem'].map(oTxt) }); }, OZEL.length);
const EK = [['göz', 'gözlük', '👓'], ['kitap', 'kitaplık', '📚'], ['tuz', 'tuzluk', '🧂'], ['süt', 'sütçü', '🥛'], ['balık', 'balıkçı', '🎣'], ['simit', 'simitçi', '🥯'], ['diş', 'dişçi', '🦷'], ['kalem', 'kalemlik', '✏️'], ['göz', 'gözcü', '👀'], ['boya', 'boyacı', '🎨'], ['ayakkabı', 'ayakkabıcı', '👞'], ['saat', 'saatçi', '⌚'], ['çiçek', 'çiçekçi', '💐'], ['oyun', 'oyuncak', '🧸'], ['kulak', 'kulaklık', '🎧']];
const ekQ = pairGen(EK.map(([a, b, e]) => [b, a, e]), (w) => `"${w}" kelimesi hangi kelimeye ek getirilerek türetilmiştir?`, { dir: 'lr' });
const ekMeaning = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const [kok, tur, e] = cyc(EK, pos ?? seed); const ws = shuffle(EK.filter(x => x[1] !== tur).map(x => x[1]), rng).slice(0, 3);
  const meaning = tur.endsWith('çi') || tur.endsWith('cı') || tur.endsWith('cu') || tur.endsWith('çı') ? `${kok} satan ya da ${kok} ile uğraşan kişi` : tur === 'oyuncak' ? 'çocukların oynadığı eşya' : `${kok} için kullanılan eşya`;
  return Q({ sig: 'em' + tur, text: `"${meaning}" anlamına gelen kelime hangisidir?`, speak: `${meaning}. Bu anlama gelen kelime hangisidir?`, main: pic(e), correct: oTxt(tur), wrongs: ws.map(oTxt) });
}, EK.length);
// --- deyim / atasözü ---
const DEYIM = [
  { q: '"Kulak vermek" ne demektir?', a: 'dikkatle dinlemek', w: ['kulağını göstermek', 'kulak ağrımak', 'sessiz olmak'] },
  { q: '"Göz atmak" ne demektir?', a: 'kısaca bakmak', w: ['gözünü kapatmak', 'ağlamak', 'uyumak'] },
  { q: '"Eli açık" ne demektir?', a: 'cömert', w: ['eli yaralı', 'tembel', 'hızlı'] },
  { q: '"Ağzı kulaklarına varmak" ne demektir?', a: 'çok sevinmek', w: ['çok üzülmek', 'çok yemek yemek', 'bağırmak'] },
  { q: '"Kafa yormak" ne demektir?', a: 'bir konu üzerinde çok düşünmek', w: ['başı ağrımak', 'uyumak', 'saçını taramak'] },
  { q: '"Pireyi deve yapmak" ne demektir?', a: 'küçük bir şeyi çok büyütmek', w: ['hayvan beslemek', 'çok çalışmak', 'hızlı koşmak'] },
  { q: '"Etekleri zil çalmak" ne demektir?', a: 'çok sevinmek', w: ['dans etmek', 'korkmak', 'zil çalmak'] },
  { q: '"Burnu havada" ne demektir?', a: 'kibirli, kendini beğenmiş', w: ['nezle olmuş', 'yukarı bakan', 'mutlu'] },
  { q: '"Damlaya damlaya göl olur." atasözü ne anlatır?', a: 'Küçük birikimler zamanla büyür.', w: ['Yağmur çok yağar.', 'Göller damlalardan küçüktür.', 'Su tasarrufu yapılmaz.'] },
  { q: '"Bugünün işini yarına bırakma." atasözü ne anlatır?', a: 'İşlerimizi zamanında yapmalıyız.', w: ['Yarın tatildir.', 'Çok uyumalıyız.', 'İş yapmamalıyız.'] },
  { q: '"Ağaç yaşken eğilir." atasözü ne anlatır?', a: 'Eğitim küçük yaşta daha kolay verilir.', w: ['Ağaçları kesmeliyiz.', 'Yaş ağaçlar kurur.', 'Ağaçlar eğri büyür.'] },
  { q: '"Sakla samanı, gelir zamanı." atasözü ne anlatır?', a: 'Gereksiz görünen şeyler bir gün işe yarayabilir.', w: ['Saman hayvanlara verilir.', 'Her şeyi atmalıyız.', 'Zaman çabuk geçer.'] },
  { q: '"Bir elin nesi var, iki elin sesi var." atasözü ne anlatır?', a: 'Yardımlaşınca işler kolaylaşır.', w: ['Alkış yapmalıyız.', 'Tek elle çalışılır.', 'Ses çıkarmamalıyız.'] },
  { q: '"Komşu komşunun külüne muhtaçtır." atasözü ne anlatır?', a: 'İnsanlar birbirine her zaman ihtiyaç duyar.', w: ['Kül çok değerlidir.', 'Komşular ateş yakar.', 'Komşu ile konuşulmaz.'] },
  { q: '"Gülme komşuna, gelir başına." atasözü ne anlatır?', a: 'Başkasının sıkıntısıyla alay etmemeliyiz.', w: ['Komşumuzla gülmeliyiz.', 'Komşular bize gelir.', 'Gülmek sağlıklıdır.'] },
  { q: '"Kaş yapayım derken göz çıkarmak" ne demektir?', a: 'düzelteyim derken daha çok bozmak', w: ['resim çizmek', 'gözü ağrımak', 'güzel süslenmek'] }
];
// --- sebep sonuç ---
const SEBEP = [
  { q: '"Yağmur yağdığı için maç ertelendi." cümlesinde maçın ertelenmesinin sebebi nedir?', a: 'yağmur yağması', w: ['maçın oynanması', 'oyuncuların gelmesi', 'hakemin geç kalması'] },
  { q: '"Çok çalıştığı için sınavdan yüksek not aldı." cümlesinde yüksek notun sebebi nedir?', a: 'çok çalışması', w: ['sınavın kolay olması', 'şans', 'öğretmenin yardımı'] },
  { q: '"Kahvaltı yapmadığından halsiz kaldı." cümlesinde halsizliğin sebebi nedir?', a: 'kahvaltı yapmaması', w: ['çok uyuması', 'koşması', 'su içmesi'] },
  { q: '"Kar yağdığı için okullar tatil edildi." cümlesinde sonuç hangisidir?', a: 'okulların tatil edilmesi', w: ['kar yağması', 'hava soğuması', 'çocukların sevinmesi'] },
  { q: '"Dişlerini fırçalamadığı için dişi çürüdü." cümlesinde sebep hangisidir?', a: 'dişlerini fırçalamaması', w: ['dişinin çürümesi', 'diş hekimine gitmesi', 'şeker yemesi'] },
  { q: 'Hangi cümlede sebep - sonuç ilişkisi vardır?', a: 'Hasta olduğu için okula gelemedi.', w: ['Okula her gün gelir.', 'Kırmızı bir kazak aldım.', 'Bahçede çiçekler var.'] },
  { q: 'Hangi cümlede amaç - sonuç (bir şeyi yapma amacı) vardır?', a: 'Sınavı kazanmak için çok çalıştı.', w: ['Yağmur yağdığı için ıslandı.', 'Kitap okudum.', 'Ders zili çaldı.'] },
  { q: '"Geç kaldığı için otobüsü kaçırdı." Bu cümlede ne oldu?', a: 'Otobüsü kaçırdı çünkü geç kaldı.', w: ['Otobüse erken bindi.', 'Otobüs gelmedi.', 'Otobüsü bekledi.'] }
];
// --- okuduğunu / dinlediğini anlama ---
const METIN = [
  { t: 'Elif hafta sonu dedesinin köyüne gitti. Köyde tavukları besledi, inekleri gördü. Akşam dedesi ona masal anlattı. Elif köyde çok mutlu oldu.', qs: [['Elif hafta sonu nereye gitti?', 'dedesinin köyüne', ['denize', 'okula', 'hastaneye']], ['Akşam dedesi ne yaptı?', 'masal anlattı', ['yemek pişirdi', 'televizyon izledi', 'bahçeyi suladı']], ['Elif köyde nasıl hissetti?', 'mutlu', ['üzgün', 'korkmuş', 'kızgın']]] },
  { t: 'Can ile Mert okul bahçesinde top oynuyordu. Top, yaşlı bir teyzenin bahçesine düştü. Çocuklar kapıyı çalıp izin istediler. Teyze onlara topu verdi ve kurabiye ikram etti.', qs: [['Çocuklar ne oynuyordu?', 'top', ['saklambaç', 'satranç', 'ip atlama']], ['Top nereye düştü?', 'yaşlı bir teyzenin bahçesine', ['denize', 'okulun çatısına', 'yola']], ['Bu metinden çıkarılacak ders hangisidir?', 'Başkasının alanına izin alarak girmeliyiz.', ['Top oynamak yasaktır.', 'Kurabiye çok sağlıklıdır.', 'Bahçeler küçüktür.']]] },
  { t: 'Arılar çiçeklerden nektar toplar. Bu nektarı kovanlarına götürüp bala dönüştürürler. Arılar çok çalışkan hayvanlardır. Bir kovanda binlerce arı yaşar.', qs: [['Arılar çiçeklerden ne toplar?', 'nektar', ['yaprak', 'toprak', 'su']], ['Arıların yaşadığı yere ne denir?', 'kovan', ['yuva', 'ahır', 'kümes']], ['Metne göre arılar nasıl hayvanlardır?', 'çalışkan', ['tembel', 'korkak', 'yavaş']]] },
  { t: 'Zeynep\'in doğum günüydü. Annesi çikolatalı bir pasta yaptı. Arkadaşları ona hediyeler getirdi. En çok, kardeşinin çizdiği resmi sevdi.', qs: [['Annesi nasıl bir pasta yaptı?', 'çikolatalı', ['çilekli', 'muzlu', 'limonlu']], ['Zeynep en çok hangi hediyeyi sevdi?', 'kardeşinin çizdiği resmi', ['bebeği', 'kitabı', 'bisikleti']], ['Metnin konusu nedir?', 'Zeynep\'in doğum günü', ['bir okul gezisi', 'bir hayvan', 'kış mevsimi']]] },
  { t: 'Kış gelince kar yağdı. Çocuklar sokağa çıkıp kardan adam yaptılar. Kardan adamın burnuna havuç, gözlerine düğme taktılar. Sonra kartopu oynadılar.', qs: [['Hangi mevsim anlatılıyor?', 'kış', ['yaz', 'ilkbahar', 'sonbahar']], ['Kardan adamın burnu neden yapıldı?', 'havuç', ['düğme', 'taş', 'dal']], ['Çocuklar en son ne yaptı?', 'kartopu oynadılar', ['eve girdiler', 'kızak kaydılar', 'uyudular']]] },
  { t: 'Kaplumbağa ile tavşan yarışa girdi. Tavşan çok hızlıydı ama yolda uyuyakaldı. Kaplumbağa yavaş ama hiç durmadan yürüdü ve yarışı kazandı.', qs: [['Yarışı kim kazandı?', 'kaplumbağa', ['tavşan', 'tilki', 'kimse']], ['Tavşan neden kaybetti?', 'yolda uyuduğu için', ['yavaş olduğu için', 'yolu bilmediği için', 'hasta olduğu için']], ['Bu hikâyenin ana fikri nedir?', 'Sabırla ve durmadan çalışan başarır.', ['Hızlı olan hep kazanır.', 'Uyumak sağlıklıdır.', 'Yarışmak kötüdür.']]] },
  { t: 'Ali sabah erken kalktı. Elini yüzünü yıkadı, dişlerini fırçaladı. Kahvaltısını yaptıktan sonra çantasını alıp okula gitti. Okulda arkadaşlarıyla resim yaptı.', qs: [['Ali kahvaltıdan sonra ne yaptı?', 'okula gitti', ['uyudu', 'parka gitti', 'televizyon izledi']], ['Ali okulda ne yaptı?', 'resim yaptı', ['futbol oynadı', 'yemek pişirdi', 'şarkı söyledi']], ['Ali\'nin yaptığı ilk iş nedir?', 'erken kalkmak', ['okula gitmek', 'resim yapmak', 'kahvaltı yapmak']]] },
  { t: 'Sonbaharda ağaçların yaprakları sararır ve dökülür. Hava serinler, yağmurlar başlar. Kuşların bazıları sıcak ülkelere göç eder. Okullar da bu mevsimde açılır.', qs: [['Metinde hangi mevsim anlatılıyor?', 'sonbahar', ['ilkbahar', 'yaz', 'kış']], ['Bazı kuşlar ne yapar?', 'sıcak ülkelere göç eder', ['kış uykusuna yatar', 'yuva yapar', 'yumurta bırakır']], ['Bu mevsimde ne açılır?', 'okullar', ['plajlar', 'çiçekler', 'havuzlar']]] },
  { t: 'Ece parkta yere atılmış çöpleri gördü. Hemen bir poşet buldu ve çöpleri topladı. Arkadaşları da ona yardım etti. Park tertemiz oldu.', qs: [['Ece parkta ne gördü?', 'yere atılmış çöpleri', ['bir kedi', 'yeni oyuncaklar', 'çiçekleri']], ['Ece\'ye kimler yardım etti?', 'arkadaşları', ['annesi', 'öğretmeni', 'kimse']], ['Ece nasıl bir çocuktur?', 'çevresini koruyan, duyarlı', ['tembel', 'korkak', 'dağınık']]] },
  { t: 'Mert\'in küçük bir köpeği vardı. Adı Karabaş\'tı. Her sabah onu yürüyüşe çıkarır, mamasını ve suyunu verirdi. Karabaş da Mert\'i çok severdi.', qs: [['Köpeğin adı nedir?', 'Karabaş', ['Pamuk', 'Boncuk', 'Tarçın']], ['Mert her sabah ne yapardı?', 'köpeğini yürüyüşe çıkarırdı', ['köpeğini yıkardı', 'okula geç kalırdı', 'top oynardı']], ['Metne göre Mert nasıl biridir?', 'hayvanları seven, sorumluluk sahibi', ['hayvanlardan korkan', 'tembel', 'sinirli']]] },
  { t: 'Defne ilk kez tiyatroya gitti. Oyunda bir prenses ile konuşan bir kurbağa vardı. Oyun bitince herkes ayağa kalkıp alkışladı. Defne eve dönünce oyunu annesine anlattı.', qs: [['Defne nereye gitti?', 'tiyatroya', ['sinemaya', 'müzeye', 'hayvanat bahçesine']], ['Oyunda hangi hayvan vardı?', 'kurbağa', ['kedi', 'aslan', 'kuş']], ['Oyun bitince seyirciler ne yaptı?', 'alkışladı', ['uyudu', 'ağladı', 'dışarı koştu']]] },
  { t: 'Emir bisiklet sürmeyi öğrenmek istiyordu. İlk gün birkaç kez düştü ama vazgeçmedi. Babası ona kask taktı ve yardım etti. Bir hafta sonra Emir bisikleti tek başına sürebiliyordu.', qs: [['Emir ne öğrenmek istiyordu?', 'bisiklet sürmeyi', ['yüzmeyi', 'kitap okumayı', 'resim yapmayı']], ['Babası Emir\'e ne taktı?', 'kask', ['şapka', 'gözlük', 'eldiven']], ['Bu metnin ana fikri nedir?', 'Vazgeçmeden denersek başarırız.', ['Bisiklet tehlikelidir.', 'Düşmek eğlencelidir.', 'Babalar bisiklet sürer.']]] },
  { t: 'Ormanda yaşayan sincap, kış gelmeden önce fındık ve ceviz topladı. Onları ağacın kovuğunda sakladı. Kış gelince karnı acıkan sincap sakladığı yiyecekleri yedi.', qs: [['Sincap ne topladı?', 'fındık ve ceviz', ['elma ve armut', 'yaprak', 'çiçek']], ['Sincap yiyecekleri nereye sakladı?', 'ağacın kovuğuna', ['toprağın altına', 'nehre', 'mağaraya']], ['Sincap neden yiyecek topladı?', 'kışın yemek için', ['oyun oynamak için', 'satmak için', 'arkadaşına vermek için']]] },
  { t: 'Kerem ile kardeşi Asel balkonda domates ve biber yetiştirdi. Her gün bitkileri suladılar. Birkaç hafta sonra kırmızı domatesler olgunlaştı. Annesi bu domateslerle salata yaptı.', qs: [['Çocuklar balkonda ne yetiştirdi?', 'domates ve biber', ['elma', 'çiçek', 'patates']], ['Çocuklar her gün ne yaptı?', 'bitkileri suladılar', ['bitkileri kopardılar', 'bitkileri boyadılar', 'bitkileri sattılar']], ['Annesi domateslerle ne yaptı?', 'salata', ['çorba', 'pasta', 'reçel']]] },
  { t: 'Okulda kitap haftası vardı. Her öğrenci evden bir kitap getirdi. Kitaplar sınıfın köşesindeki rafa dizildi. Öğrenciler kitapları birbirleriyle değiştirip okudular.', qs: [['Okulda hangi hafta vardı?', 'kitap haftası', ['spor haftası', 'trafik haftası', 'orman haftası']], ['Kitaplar nereye dizildi?', 'sınıfın köşesindeki rafa', ['bahçeye', 'öğretmen masasına', 'kantine']], ['Öğrenciler kitaplarla ne yaptı?', 'değiştirip okudular', ['sattılar', 'boyadılar', 'sakladılar']]] },
  { t: 'Yaz tatilinde Ada ailesiyle birlikte denize gitti. Kumdan büyük bir kale yaptı. Deniz kenarında renkli deniz kabukları topladı. Akşam güneşin batışını izlediler.', qs: [['Ada tatilde nereye gitti?', 'denize', ['dağa', 'köye', 'müzeye']], ['Ada kumdan ne yaptı?', 'kale', ['ev', 'kardan adam', 'köprü']], ['Akşam ne izlediler?', 'güneşin batışını', ['film', 'futbol maçı', 'yıldızları']]] }
];
const METIN_Q = METIN.flatMap(m => m.qs.map(([q, a, w]) => ({ t: m.t, q, a, w })));
const readText = (mode) => capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const it = cyc(METIN_Q, pos ?? seed); const ws = shuffle(it.w, rng);
  if (mode === 'read') return Q({ sig: 'mr' + it.q, text: `${it.t}\n\n${it.q}`, speak: `${it.t} || ${it.q}`, correct: oTxt(it.a), wrongs: ws.map(oTxt) });
  if (mode === 'listen') return Q({ sig: 'ml' + it.q, text: `Metni dinle. 🔊\n\n${it.q}`, speak: `Dinle. || ${it.t} || ${it.q}`, correct: oTxt(it.a), wrongs: ws.map(oTxt) });
  return Q({ sig: 'ma' + it.q, text: `Metni dinle, sonra şıkları dinle. 🔊\n\n${it.q}`, speak: `Dinle. || ${it.t} || ${it.q} || Şıkları dinle.`, correct: oAud(it.a), wrongs: ws.map(x => oAud(x)), audioOpts: true });
}, METIN_Q.length);

// ---------------------------------------------------------------------------
const esQ = (dir, mode) => pairGen(ES, (w) => `"${w}" kelimesinin eş anlamlısı hangisidir?`, { dir, mode });
const zitQ = (dir, mode) => pairGen(ZIT, (w) => `"${w}" kelimesinin zıt anlamlısı hangisidir?`, { dir, mode });

export const TURKISH_TOPICS = [
  topic('trk_es', '1. Eş Anlamlı Kelimeler', 'indigo', [kind('trk_es_k', 'Eş anlam', [g('es_yazili', 'Yazılı soru', esQ('lr', 'read'), 24), g('es_ters', 'Yazılı soru (ters)', esQ('rl', 'read'), 20), g('es_sesli', 'Sesli şık', esQ('lr', 'audio'), 14), g('es_dinle', 'Dinle ve seç', esQ('rl', 'listen'), 12)])]),
  topic('trk_zit', '2. Zıt Anlamlı Kelimeler', 'rose', [kind('trk_zit_k', 'Zıt anlam', [g('zit_yazili', 'Yazılı soru', zitQ('lr', 'read'), 24), g('zit_ters', 'Yazılı soru (ters)', zitQ('rl', 'read'), 20), g('zit_sesli', 'Sesli şık', zitQ('lr', 'audio'), 14), g('zit_dinle', 'Dinle ve seç', zitQ('rl', 'listen'), 12)])]),
  topic('trk_essesli', '3. Eş Sesli (Sesteş) Kelimeler', 'amber', [kind('trk_essesli_k', 'Eş sesli', [g('essesli_y', 'Yazılı soru', factGen(ESSESLI, 'read'), 22), g('essesli_d', 'Dinle ve seç', factGen(ESSESLI, 'listen'), 16)])]),
  topic('trk_alfabe', '4. Alfabe ve Sıralama', 'sky', [kind('trk_alfabe_k', 'Alfabetik sıra', [g('alf_ilk', 'En baştaki / en sondaki kelime', alphaFirst, 22), g('alf_sira', 'Doğru sıralama', alphaOrder, 20), g('alf_harf', 'Önceki / sonraki harf', alphaLetter, 14)])]),
  topic('trk_hece', '5. Hece Bilgisi', 'emerald', [kind('trk_hece_k', 'Hece', [g('hece_sayi', 'Kaç heceli?', heceCount, 26), g('hece_ayir', 'Hecelere ayırma', heceSplit, 28)])]),
  topic('trk_yazim', '6. Yazım Kuralları', 'violet', [kind('trk_yazim_k', 'Yazım', [g('yazim_dogru', 'Doğru yazılan kelime', spellQ, 30), g('yazim_buyuk', 'Büyük harflerin kullanımı', capsQ, 10), g('yazim_buyuk2', 'Büyük harf (özel isimler)', capsGen, 24)])]),
  topic('trk_nokta', '7. Noktalama İşaretleri', 'orange', [kind('trk_nokta_k', 'Noktalama', [g('nokta_son', 'Cümle sonu işareti', punctQ, 34), g('nokta_diger', 'Virgül, kesme, iki nokta', virgulQ, 16)])]),
  topic('trk_tur', '8. İsim, Sıfat, Eylem', 'teal', [kind('trk_tur_k', 'Sözcük türleri', [g('tur_sozcuk', 'Kelimenin türü', turQ, 24), g('tur_sifat', 'Cümledeki sıfat (özellik)', sifatQ, 20), g('tur_ozel', 'Özel isim - cins isim', ozelQ, 14)])]),
  topic('trk_ek', '9. Ekler ve Yeni Kelimeler', 'lime', [kind('trk_ek_k', 'Ekler', [g('ek_kok', 'Kelimenin kökü', ekQ, 18), g('ek_anlam', 'Ek alan kelimenin anlamı', ekMeaning, 18)])]),
  topic('trk_deyim', '10. Deyimler ve Atasözleri', 'fuchsia', [kind('trk_deyim_k', 'Deyim / atasözü', [g('deyim_y', 'Yazılı soru', factGen(DEYIM, 'read'), 22), g('deyim_s', 'Sesli şık', factGen(DEYIM, 'audio'), 16)])]),
  topic('trk_sebep', '11. Sebep - Sonuç', 'cyan', [kind('trk_sebep_k', 'Sebep - sonuç', [g('sebep_y', 'Yazılı soru', factGen(SEBEP, 'read'), 16), g('sebep_d', 'Dinle ve seç', factGen(SEBEP, 'listen'), 12)])]),
  topic('trk_anlama', '12. Okuduğunu / Dinlediğini Anlama', 'purple', [kind('trk_anlama_k', 'Metin', [g('anlama_oku', 'Oku ve cevapla', readText('read'), 34), g('anlama_dinle', 'Dinle ve cevapla', readText('listen'), 30), g('anlama_sesli', 'Dinle + sesli şık', readText('audio'), 24)])])
];

export const TURKISH_BANK = makeSubjectBank({
  id: 'trk',
  title: 'türkçe (3. sınıf)',
  intro: '12 konu, toplam 1000 hazır soru. Dinleme soruları ve metinler telefonla sesli okunur; bazı sorularda şıklar da sesli okunur.',
  rootFolder: 'Türkçe (3. Sınıf)',
  topics: TURKISH_TOPICS,
  total: 1000
});
