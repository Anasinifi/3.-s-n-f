// ============================================================================
// --- FEN BİLİMLERİ (3. SINIF) — 1000 HAZIR SORU ---
// ============================================================================
// Üniteler: Gezegenimizi Tanıyalım • Beş Duyumuz • Kuvveti Tanıyalım • Maddeyi Tanıyalım
//           • Çevremizdeki Işık ve Sesler • Canlılar Dünyası • Elektrikli Araçlar
import { pic, oTxt, oAud, oImg, Q, cyc, capped, makeRng, pick, shuffle, makeSubjectBank, grp, topic, kind, factGen, classGen, pairGen } from './common';

const g = grp('fen');

// 1. GEZEGENİMİZİ TANIYALIM
const DUNYA = [
  { q: 'Dünya\'nın şekli neye benzer?', a: 'küreye (topa)', w: ['küpe', 'tabağa', 'üçgene'], e: '🌍' },
  { q: 'Dünya\'nın yüzeyinin büyük kısmı neyle kaplıdır?', a: 'su', w: ['kara', 'buz', 'kum'], e: '🌊' },
  { q: 'Dünya\'nın en dıştaki katmanına ne denir?', a: 'yer kabuğu (taş küre)', w: ['çekirdek', 'ateş küre', 'manto'], e: '🪨' },
  { q: 'Dünya\'nın en iç katmanı hangisidir?', a: 'çekirdek (ağır küre)', w: ['yer kabuğu', 'hava küre', 'su küre'], e: '🌍' },
  { q: 'Dünya\'yı çevreleyen hava katmanına ne denir?', a: 'hava küre (atmosfer)', w: ['su küre', 'taş küre', 'çekirdek'], e: '☁️' },
  { q: 'Dünya\'nın uzaydan çekilen fotoğrafları bize neyi gösterir?', a: 'Dünya\'nın küre şeklinde olduğunu', w: ['Dünya\'nın düz olduğunu', 'Dünya\'nın kare olduğunu', 'Dünya\'nın çok küçük olduğunu'], e: '🛰️' },
  { q: 'Yer kabuğunu oluşturan katı maddelere ne denir?', a: 'taş, kaya ve toprak', w: ['su ve buhar', 'hava ve bulut', 'ateş ve lav'], e: '⛰️' },
  { q: 'Hangisi su küreye (su kaynaklarına) örnektir?', a: 'okyanus', w: ['dağ', 'ova', 'çöl'], e: '🌊' },
  { q: 'Dünya üzerinde yüksek ve engebeli yer şekline ne denir?', a: 'dağ', w: ['ova', 'göl', 'vadi'], e: '⛰️' },
  { q: 'Dağlar arasındaki derin, uzun çukurlara ne denir?', a: 'vadi', w: ['tepe', 'ova', 'yayla'], e: '🏞️' },
  { q: 'Geniş ve düz alanlara ne denir?', a: 'ova', w: ['dağ', 'tepe', 'vadi'], e: '🌾' },
  { q: 'Dört tarafı karalarla çevrili su birikintisine ne denir?', a: 'göl', w: ['deniz', 'okyanus', 'nehir'], e: '💧' },
  { q: 'Dünya\'nın etrafında döndüğü yıldız hangisidir?', a: 'Güneş', w: ['Ay', 'Mars', 'Kutup Yıldızı'], e: '☀️' },
  { q: 'Dünya\'nın uydusu hangisidir?', a: 'Ay', w: ['Güneş', 'Mars', 'Jüpiter'], e: '🌕' },
  { q: 'Gemi uzaklaşırken önce gövdesi sonra direği gözden kaybolur. Bu neyin kanıtıdır?', a: 'Dünya\'nın yuvarlak olduğunun', w: ['denizin çok derin olduğunun', 'geminin battığının', 'havanın kararmasının'], e: '⛵' }
];
const YERSEKLI = [
  { name: 'kara (yer şekli)', label: 'kara parçası / yer şekli', ask: 'Hangisi taş küreye (karaya) ait bir yer şeklidir?', items: [['dağ', '⛰️'], ['tepe', '🏔️'], ['ova', '🌾'], ['vadi', '🏞️'], ['çöl', '🏜️'], ['ada', '🏝️'], ['yanardağ', '🌋']] },
  { name: 'su (su küre)', label: 'su kaynağı (su küre)', ask: 'Hangisi su küreye aittir?', items: [['deniz', '🌊'], ['göl', '💧'], ['nehir', '🏞️'], ['okyanus', '🌊'], ['şelale', '💦'], ['buzul', '🧊']] }
];

// 2. BEŞ DUYUMUZ
const DUYU = [['göz', 'görme', '👁️'], ['kulak', 'işitme', '👂'], ['burun', 'koklama', '👃'], ['dil', 'tatma', '👅'], ['deri', 'dokunma', '✋']];
const DUYU_DURUM = [['gökkuşağının renkleri', 'görme', '🌈'], ['kuşların cıvıltısı', 'işitme', '🐦'], ['çiçeğin kokusu', 'koklama', '🌸'], ['limonun ekşiliği', 'tatma', '🍋'], ['buzun soğukluğu', 'dokunma', '🧊'], ['zilin sesi', 'işitme', '🔔'], ['ekmeğin kokusu', 'koklama', '🍞'], ['balın tatlılığı', 'tatma', '🍯'], ['kedinin yumuşak tüyleri', 'dokunma', '🐱'], ['trafik ışığının rengi', 'görme', '🚦'], ['parfümün kokusu', 'koklama', '🌺'], ['davul sesi', 'işitme', '🥁'], ['çikolatanın tadı', 'tatma', '🍫'], ['sıcak çay bardağı', 'dokunma', '🍵'], ['yıldızların parlaması', 'görme', '⭐'], ['şimşek sesi (gök gürültüsü)', 'işitme', '⛈️'], ['kaktüsün dikenleri', 'dokunma', '🌵'], ['tuzlu cips', 'tatma', '🍟'], ['yanık kokusu', 'koklama', '🔥'], ['kitaptaki resimler', 'görme', '📖']];
const DUYU_BILGI = [
  { q: 'Gözlerimizi korumak için ne yapmalıyız?', a: 'güneşe çıplak gözle bakmamalıyız', w: ['güneşe uzun süre bakmalıyız', 'gözümüzü kirli elle ovmalıyız', 'karanlıkta kitap okumalıyız'], e: '😎' },
  { q: 'Kulaklarımızı korumak için ne yapmalıyız?', a: 'çok yüksek sesten uzak durmalıyız', w: ['kulağımıza sivri cisim sokmalıyız', 'kulaklığı en yüksek seste dinlemeliyiz', 'kulağımızı hiç temizlememeliyiz'], e: '🎧' },
  { q: 'Görme engelli bireyler okumak için hangi yazıyı kullanır?', a: 'kabartma (Braille) yazı', w: ['renkli yazı', 'el yazısı', 'büyük harfli yazı'], e: '🦯' },
  { q: 'İşitme engelli bireyler nasıl iletişim kurar?', a: 'işaret dili ile', w: ['kabartma yazı ile', 'sadece bağırarak', 'hiç iletişim kurmazlar'], e: '🤟' },
  { q: 'Dilimiz hangi tatları ayırt edebilir?', a: 'tatlı, tuzlu, ekşi, acı', w: ['sadece tatlı', 'sıcak ve soğuk', 'sert ve yumuşak'], e: '👅' },
  { q: 'Nezle olduğumuzda yemeklerin tadını neden az alırız?', a: 'koku alma duyumuz zayıfladığı için', w: ['gözümüz kapandığı için', 'kulağımız tıkandığı için', 'elimiz üşüdüğü için'], e: '🤧' },
  { q: 'Hangi duyu organımız en büyüğüdür?', a: 'deri', w: ['göz', 'kulak', 'burun'], e: '✋' },
  { q: 'Bir cismin sıcak ya da soğuk olduğunu hangi duyu organımızla anlarız?', a: 'deri', w: ['kulak', 'göz', 'dil'], e: '🌡️' }
];

// 3. KUVVETİ TANIYALIM
const KUVVET = [
  { name: 'itme', label: 'itme', ask: 'Hangisinde İTME kuvveti uygulanır?', items: [['kapıyı kapatmak (iterek)', '🚪'], ['topa tekme atmak', '⚽'], ['bebek arabasını sürmek', '👶'], ['salıncakta arkadaşını sallamak', '🛝'], ['düğmeye basmak', '🔘'], ['alışveriş arabasını sürmek', '🛒'], ['bisiklet pedalına basmak', '🚲']] },
  { name: 'çekme', label: 'çekme', ask: 'Hangisinde ÇEKME kuvveti uygulanır?', items: [['çekmeceyi açmak', '🗄️'], ['halat çekmek', '🪢'], ['kovayı kuyudan çekmek', '🪣'], ['çantanın fermuarını açmak', '🎒'], ['kapıyı açmak (çekerek)', '🚪'], ['uçurtmanın ipini çekmek', '🪁'], ['sifonu çekmek', '🚽']] }
];
const HAREKET = [
  { name: 'dönme', label: 'dönme hareketi', ask: 'Hangisi DÖNME hareketi yapar?', items: [['dönme dolap', '🎡'], ['vantilatör pervanesi', '🌀'], ['saat akrebi', '🕒'], ['topaç', '🪀'], ['çamaşır makinesi kazanı', '🧺'], ['rüzgâr gülü', '🌬️']] },
  { name: 'sallanma', label: 'sallanma hareketi', ask: 'Hangisi SALLANMA hareketi yapar?', items: [['salıncak', '🛝'], ['rüzgârdaki ağaç dalı', '🌳'], ['beşik', '🛏️'], ['sarkaç', '🕰️'], ['tahterevalli', '⚖️']] },
  { name: 'ileri-geri', label: 'ileri-geri hareket', ask: 'Hangisi İLERİ-GERİ (gidip gelme) hareketi yapar?', items: [['testere', '🪚'], ['dikiş makinesinin iğnesi', '🪡'], ['diş fırçası (fırçalarken)', '🪥'], ['ütü (ütülerken)', '👕'], ['silgi (silerken)', '✏️']] },
  { name: 'düz (doğrusal)', label: 'düz (doğrusal) hareket', ask: 'Hangisi DÜZ (doğrusal) bir yolda hareket eder?', items: [['asansör', '🛗'], ['raylarda giden tren', '🚆'], ['düz yolda koşan atlet', '🏃'], ['yürüyen merdiven', '🛒'], ['bowling topu', '🎳']] }
];
const KUVVET_BILGI = [
  { q: 'Hareket eden bir topu durdurmak için ne yapmalıyız?', a: 'kuvvet uygulamalıyız', w: ['hiçbir şey yapmamalıyız', 'topu boyamalıyız', 'sadece bakmalıyız'], e: '⚽' },
  { q: 'Kuvvet cisimlerde hangi değişikliği yapabilir?', a: 'hareket ettirebilir, durdurabilir, yönünü değiştirebilir', w: ['rengini değiştirir', 'kokusunu değiştirir', 'tadını değiştirir'], e: '💪' },
  { q: 'Hamuru sıkınca şekli değişir. Bu neyin etkisidir?', a: 'kuvvetin', w: ['ışığın', 'sesin', 'rengin'], e: '🫓' },
  { q: 'Mıknatıs hangi cismi çeker?', a: 'demir çivi', w: ['tahta kalem', 'plastik cetvel', 'kâğıt'], e: '🧲' },
  { q: 'Mıknatısın çekme etkisinin en fazla olduğu yerlere ne denir?', a: 'kutuplar', w: ['orta kısım', 'kenarlar', 'yüzey'], e: '🧲' },
  { q: 'Hangisi mıknatısla çekilmez?', a: 'cam bardak', w: ['ataş', 'toplu iğne', 'demir vida'], e: '🥛' },
  { q: 'Bir cismin hızlanması, yavaşlaması ya da yön değiştirmesi için ne gerekir?', a: 'kuvvet', w: ['ses', 'ışık', 'renk'], e: '🏎️' },
  { q: 'Futbolcunun gelen topa kafa vurup yönünü değiştirmesi kuvvetin hangi etkisidir?', a: 'yön değiştirme', w: ['şekil değiştirme', 'renk değiştirme', 'erime'], e: '⚽' },
  { q: 'Tahterevallide ağır olan çocuk hangi tarafta olur?', a: 'aşağıda kalan tarafta', w: ['yukarıda kalan tarafta', 'ortada', 'havada'], e: '⚖️' },
  { q: 'Hangisi mıknatısın günlük hayatta kullanıldığı yerlerdendir?', a: 'buzdolabı kapısı', w: ['ekmek', 'su bardağı', 'tahta sandalye'], e: '🧊' }
];

// 4. MADDEYİ TANIYALIM
const HAL = [
  { name: 'katı', label: 'katı', ask: 'Hangisi KATI bir maddedir?', items: [['taş', '🪨'], ['tahta', '🪵'], ['buz', '🧊'], ['kalem', '✏️'], ['anahtar', '🔑'], ['kitap', '📕'], ['elma', '🍎'], ['tuz', '🧂'], ['kaşık', '🥄']] },
  { name: 'sıvı', label: 'sıvı', ask: 'Hangisi SIVI bir maddedir?', items: [['su', '💧'], ['süt', '🥛'], ['meyve suyu', '🧃'], ['zeytinyağı', '🫒'], ['bal', '🍯'], ['sirke', '🍶'], ['şampuan', '🧴'], ['çay', '🍵']] },
  { name: 'gaz', label: 'gaz', ask: 'Hangisi GAZ hâlinde bir maddedir?', items: [['balonun içindeki hava', '🎈'], ['su buharı', '♨️'], ['egzoz dumanı', '🚗'], ['oksijen', '🫁'], ['bacadan çıkan duman', '🏭'], ['lastikteki hava', '🛞']] }
];
const OZELLIK = [
  { name: 'esnek', label: 'esnek', ask: 'Hangisi ESNEK bir maddedir (çekince uzar, bırakınca eski hâline döner)?', items: [['lastik', '🪢'], ['yay', '🌀'], ['balon', '🎈'], ['paket lastiği', '⭕'], ['sakız', '🫧']] },
  { name: 'kırılgan', label: 'kırılgan', ask: 'Hangisi KIRILGAN bir maddedir?', items: [['cam bardak', '🥛'], ['porselen tabak', '🍽️'], ['yumurta kabuğu', '🥚'], ['ayna', '🪞'], ['ampul', '💡']] },
  { name: 'pürüzlü', label: 'pürüzlü', ask: 'Hangisinin yüzeyi PÜRÜZLÜDÜR?', items: [['zımpara kâğıdı', '🟫'], ['ağaç kabuğu', '🌳'], ['kaya', '🪨'], ['ananas kabuğu', '🍍'], ['törpü', '💅']] },
  { name: 'yumuşak', label: 'yumuşak', ask: 'Hangisi YUMUŞAK bir maddedir?', items: [['pamuk', '☁️'], ['yastık', '🛏️'], ['sünger', '🧽'], ['oyun hamuru', '🟣'], ['yün', '🧶']] },
  { name: 'sert', label: 'sert', ask: 'Hangisi SERT bir maddedir?', items: [['demir', '🔩'], ['taş', '🪨'], ['tahta masa', '🪑'], ['çekiç', '🔨'], ['ceviz kabuğu', '🌰']] }
];
const MADDE_BILGI = [
  { q: 'Hangi maddeler bulundukları kabın şeklini alır?', a: 'sıvılar ve gazlar', w: ['sadece katılar', 'taşlar', 'tahta'], e: '🫗' },
  { q: 'Katı maddelerin şekli nasıldır?', a: 'belirlidir (kaba göre değişmez)', w: ['kabın şeklini alır', 'her yere yayılır', 'görünmez'], e: '🧊' },
  { q: 'Gazlar bulundukları ortama nasıl yayılır?', a: 'her yere yayılır', w: ['tek yerde kalır', 'yere çöker', 'sadece aşağı akar'], e: '💨' },
  { q: 'Buz ısınınca neye dönüşür?', a: 'suya (erir)', w: ['taşa', 'havaya hemen', 'tuza'], e: '🧊' },
  { q: 'Su donunca neye dönüşür?', a: 'buza', w: ['buhara', 'toza', 'yağa'], e: '❄️' },
  { q: 'Kaynayan sudan çıkan buhar hangi hâldedir?', a: 'gaz', w: ['katı', 'sıvı', 'hiçbiri'], e: '♨️' },
  { q: 'Cisimlerin yapıldığı malzemeye ne denir?', a: 'madde', w: ['kuvvet', 'ses', 'ışık'], e: '🧱' },
  { q: 'Hangisi suda batar?', a: 'taş', w: ['tahta', 'mantar tıpa', 'pinpon topu'], e: '🪨' },
  { q: 'Hangisi suda yüzer?', a: 'tahta kaşık', w: ['demir anahtar', 'taş', 'cam bilye'], e: '🥄' },
  { q: 'Tuz suya karışınca ne olur?', a: 'çözünür, gözle görünmez olur', w: ['batar ve kalır', 'yüzer', 'buz olur'], e: '🧂' },
  { q: 'Maddeleri tanımak için hangi özelliklerine bakarız?', a: 'renk, koku, tat, sertlik gibi', w: ['sadece fiyatına', 'adına', 'hangi dükkândan alındığına'], e: '🔍' },
  { q: 'Tanımadığımız bir maddeyi tatmak doğru mudur?', a: 'Hayır, zehirli olabilir.', w: ['Evet, her zaman tadılır.', 'Sadece okulda tadılır.', 'Evet, koklamadan tadılır.'], e: '⚠️' }
];

// 5. IŞIK VE SES
const ISIK = [
  { name: 'doğal ışık kaynağı', label: 'doğal ışık kaynağı', ask: 'Hangisi DOĞAL bir ışık kaynağıdır?', items: [['Güneş', '☀️'], ['ateş böceği', '🪲'], ['yıldırım (şimşek)', '⚡'], ['yıldızlar', '⭐'], ['yanardağ lavı', '🌋']] },
  { name: 'yapay ışık kaynağı', label: 'yapay ışık kaynağı', ask: 'Hangisi YAPAY bir ışık kaynağıdır?', items: [['ampul', '💡'], ['el feneri', '🔦'], ['mum', '🕯️'], ['sokak lambası', '🏮'], ['televizyon ekranı', '📺'], ['trafik lambası', '🚦'], ['araba farı', '🚗']] }
];
const SES = [
  { name: 'doğal ses kaynağı', label: 'doğal ses kaynağı', ask: 'Hangisi DOĞAL bir ses kaynağıdır?', items: [['kuş', '🐦'], ['gök gürültüsü', '⛈️'], ['şelale', '💦'], ['rüzgâr', '🌬️'], ['köpek', '🐶'], ['deniz dalgası', '🌊'], ['arı', '🐝']] },
  { name: 'yapay ses kaynağı', label: 'yapay ses kaynağı', ask: 'Hangisi YAPAY bir ses kaynağıdır?', items: [['davul', '🥁'], ['zil', '🔔'], ['radyo', '📻'], ['korna', '📯'], ['telefon', '📱'], ['gitar', '🎸'], ['düdük', '😗'], ['çalar saat', '⏰']] }
];
const ISIK_SES_BILGI = [
  { q: 'Işık olmayan karanlık bir odada cisimleri görebilir miyiz?', a: 'Hayır, görmek için ışık gerekir.', w: ['Evet, her şeyi görürüz.', 'Sadece renkleri görürüz.', 'Sadece büyük cisimleri görürüz.'], e: '🌑' },
  { q: 'Ay bir ışık kaynağı mıdır?', a: 'Hayır, Güneş\'ten aldığı ışığı yansıtır.', w: ['Evet, kendi ışığını üretir.', 'Evet, yapay ışık kaynağıdır.', 'Sadece gündüz ışık üretir.'], e: '🌕' },
  { q: 'Gürültü kirliliği insanlarda neye yol açabilir?', a: 'baş ağrısı ve işitme kaybına', w: ['boyun uzamasına', 'saçların uzamasına', 'daha iyi uykuya'], e: '🔊' },
  { q: 'Ses kaynağından uzaklaştıkça sesi nasıl duyarız?', a: 'daha az (daha hafif)', w: ['daha yüksek', 'hiç değişmez', 'daha renkli'], e: '📢' },
  { q: 'Çok parlak ışığa bakmak neden zararlıdır?', a: 'gözlerimize zarar verir', w: ['saçımızı uzatır', 'kulağımızı tıkar', 'dişlerimizi çürütür'], e: '😎' },
  { q: 'Gürültü kirliliğini azaltmak için ne yapabiliriz?', a: 'gereksiz korna çalmamak, televizyonu kısık açmak', w: ['müziği sonuna kadar açmak', 'sürekli bağırmak', 'kapıları çarpmak'], e: '🤫' },
  { q: 'Sokak lambalarının gökyüzünü aydınlatıp yıldızları görmemizi engellemesine ne denir?', a: 'ışık kirliliği', w: ['ses kirliliği', 'su kirliliği', 'toprak kirliliği'], e: '🌃' },
  { q: 'Hangi durumda sesin şiddeti artar?', a: 'davula daha güçlü vurunca', w: ['davula hafifçe dokununca', 'davuldan uzaklaşınca', 'davulu kapatınca'], e: '🥁' }
];

// 6. CANLILAR DÜNYASI
const CANLI = [
  { name: 'canlı', label: 'canlı varlık', ask: 'Hangisi CANLI bir varlıktır?', notAsk: 'Hangisi canlı DEĞİLDİR?', items: [['kedi', '🐱'], ['ağaç', '🌳'], ['çiçek', '🌻'], ['balık', '🐟'], ['karınca', '🐜'], ['mantar', '🍄'], ['insan', '🧒'], ['kuş', '🐦'], ['kaktüs', '🌵']] },
  { name: 'cansız', label: 'cansız varlık', ask: 'Hangisi CANSIZ bir varlıktır?', notAsk: 'Hangisi cansız DEĞİLDİR?', items: [['taş', '🪨'], ['su', '💧'], ['araba', '🚗'], ['masa', '🪑'], ['bulut', '☁️'], ['top', '⚽'], ['oyuncak robot', '🤖'], ['kum', '🏖️'], ['hava', '💨']] }
];
const BESLENME = [
  { name: 'otla beslenen', label: 'otçul (bitkiyle beslenir)', ask: 'Hangisi OTLA (bitkiyle) beslenir?', items: [['inek', '🐄'], ['koyun', '🐑'], ['tavşan', '🐰'], ['zürafa', '🦒'], ['at', '🐴'], ['keçi', '🐐']] },
  { name: 'etle beslenen', label: 'etçil (etle beslenir)', ask: 'Hangisi ETLE beslenir?', items: [['aslan', '🦁'], ['kaplan', '🐯'], ['kurt', '🐺'], ['kartal', '🦅'], ['köpek balığı', '🦈'], ['timsah', '🐊']] },
  { name: 'hem otla hem etle beslenen', label: 'hepçil (hem ot hem et)', ask: 'Hangisi hem bitkiyle hem etle beslenir?', items: [['ayı', '🐻'], ['insan', '🧒'], ['tavuk', '🐔'], ['domuz', '🐗'], ['karga', '🐦‍⬛']] }
];
const BARINAK = [['arı', 'kovan', '🐝'], ['kuş', 'yuva', '🐦'], ['ayı', 'mağara (in)', '🐻'], ['tavuk', 'kümes', '🐔'], ['inek', 'ahır', '🐄'], ['köpek', 'kulübe', '🐶'], ['karınca', 'toprak altındaki yuva', '🐜'], ['at', 'ahır (tavla)', '🐴'], ['tilki', 'in', '🦊'], ['balık', 'su (deniz, göl)', '🐟'], ['örümcek', 'ağ', '🕷️'], ['kunduz', 'su kenarındaki baraj-yuva', '🦫']];
const BITKI = [
  { q: 'Bitkinin topraktan su ve besin alan kısmı hangisidir?', a: 'kök', w: ['yaprak', 'çiçek', 'meyve'], e: '🌱' },
  { q: 'Bitkiyi dik tutan ve suyu yapraklara taşıyan kısım hangisidir?', a: 'gövde', w: ['kök', 'tohum', 'çiçek'], e: '🌿' },
  { q: 'Bitkilerin besin ürettiği kısım hangisidir?', a: 'yaprak', w: ['kök', 'tohum', 'gövde'], e: '🍃' },
  { q: 'Yeni bitkilerin oluştuğu kısım hangisidir?', a: 'tohum', w: ['yaprak', 'gövde', 'diken'], e: '🌰' },
  { q: 'Bitkilerin yaşamak için neye ihtiyacı vardır?', a: 'su, hava, ışık ve toprak', w: ['sadece karanlık', 'sadece buz', 'şekerli su'], e: '🪴' },
  { q: 'Karanlık bir dolapta kalan bitkiye ne olur?', a: 'sararır ve solar', w: ['daha hızlı büyür', 'meyve verir', 'renk değiştirip mavi olur'], e: '🥀' },
  { q: 'Hangisi canlıların ortak özelliğidir?', a: 'beslenme, büyüme ve üreme', w: ['konuşmak', 'yürümek', 'uçmak'], e: '🌱' },
  { q: 'İnsanların oluşturduğu çevreye ne denir?', a: 'yapay çevre', w: ['doğal çevre', 'orman', 'deniz'], e: '🏙️' },
  { q: 'Hangisi doğal çevreye örnektir?', a: 'orman', w: ['otopark', 'alışveriş merkezi', 'stadyum'], e: '🌲' },
  { q: 'Soyu tükenmekte olan bir hayvanı korumak için ne yapmalıyız?', a: 'yaşam alanlarını korumalıyız', w: ['avlamalıyız', 'yuvalarını bozmalıyız', 'ormanları kesmeliyiz'], e: '🐼' },
  { q: 'Ülkemizde koruma altındaki ve soyu tehlikedeki deniz kaplumbağasının adı nedir?', a: 'Caretta caretta', w: ['Van kedisi', 'Ankara keçisi', 'Kangal'], e: '🐢' },
  { q: 'Mikroskopsuz göremediğimiz küçük canlılara ne denir?', a: 'mikroskobik canlılar', w: ['dev canlılar', 'cansız varlıklar', 'yapay varlıklar'], e: '🔬' }
];

// 7. ELEKTRİKLİ ARAÇLAR
const ELEKTRIK = [
  { name: 'pille çalışan', label: 'pille çalışır', ask: 'Hangisi PİLLE çalışır?', items: [['el feneri', '🔦'], ['kumanda', '🎮'], ['duvar saati', '🕰️'], ['oyuncak araba', '🚗'], ['hesap makinesi', '🧮'], ['dijital termometre', '🌡️']] },
  { name: 'şehir elektriğiyle çalışan', label: 'şehir elektriğiyle (prizle) çalışır', ask: 'Hangisi ŞEHİR ELEKTRİĞİYLE (prize takılarak) çalışır?', items: [['buzdolabı', '🧊'], ['çamaşır makinesi', '🧺'], ['televizyon', '📺'], ['ütü', '👕'], ['saç kurutma makinesi', '💨'], ['fırın', '🍞'], ['elektrikli süpürge', '🧹']] }
];
const ELEKTRIK_BILGI = [
  { q: 'Islak elle prize ya da elektrikli araca dokunursak ne olur?', a: 'elektrik çarpabilir', w: ['hiçbir şey olmaz', 'cihaz daha iyi çalışır', 'elimiz kurur'], e: '⚡' },
  { q: 'Bitmiş pilleri ne yapmalıyız?', a: 'atık pil kutusuna atmalıyız', w: ['çöpe atmalıyız', 'toprağa gömmeliyiz', 'denize atmalıyız'], e: '🔋' },
  { q: 'Prizlere neden priz koruyucu takılır?', a: 'küçük çocukları elektrik çarpmasından korumak için', w: ['süs olsun diye', 'elektrik artsın diye', 'priz parlasın diye'], e: '🔌' },
  { q: 'Elektrikli aracın kablosunu prizden nasıl çıkarmalıyız?', a: 'fişten tutarak', w: ['kablodan çekerek', 'ayakla iterek', 'ıslak elle'], e: '🔌' },
  { q: 'Elektrik enerjisini tasarruflu kullanmak için ne yapmalıyız?', a: 'boş odaların ışığını kapatmalıyız', w: ['bütün lambaları açık bırakmalıyız', 'televizyonu açık unutmalıyız', 'buzdolabı kapısını açık tutmalıyız'], e: '💡' },
  { q: 'Hangisi elektrik enerjisini ışığa çeviren bir araçtır?', a: 'lamba', w: ['ütü', 'vantilatör', 'buzdolabı'], e: '💡' },
  { q: 'Hangisi elektrik enerjisini ısıya çeviren bir araçtır?', a: 'ütü', w: ['lamba', 'radyo', 'kumanda'], e: '👕' },
  { q: 'Hangisi elektrik enerjisini sese çeviren bir araçtır?', a: 'radyo', w: ['ütü', 'buzdolabı', 'el feneri'], e: '📻' },
  { q: 'Fırtınada kopmuş bir elektrik kablosu görürsek ne yapmalıyız?', a: 'yaklaşmamalı ve büyüklere haber vermeliyiz', w: ['dokunmalıyız', 'üzerinden atlamalıyız', 'çubukla oynamalıyız'], e: '⚠️' },
  { q: 'Elektrik enerjisi hangi kaynaklardan üretilebilir?', a: 'güneş, rüzgâr, su (baraj)', w: ['sadece kum', 'sadece taş', 'sadece tahta'], e: '☀️' }
];

// ---------------------------------------------------------------------------
const organQ = pairGen(DUYU, (o) => `${o[0].toUpperCase() + o.slice(1)} hangi duyu organımızdır?`, { cap: 5 });
const organQ2 = pairGen(DUYU.map(([a, b, e]) => [b, a, e]), (d) => `${d[0].toUpperCase() + d.slice(1)} duyusu hangi organımızla gerçekleşir?`, { mode: 'audio', cap: 5 });
const duyuDurum = pairGen(DUYU_DURUM.map(([a, b, e]) => [a, b, e]), (s) => `"${s}" hangi duyumuzla algılanır?`);
const duyuDurumAud = pairGen(DUYU_DURUM.map(([a, b, e]) => [a, b, e]), (s) => `"${s}" hangi duyumuzla algılanır?`, { mode: 'audio' });
const duyuOrganPic = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const d = cyc(DUYU_DURUM, pos ?? seed); const org = DUYU.find(x => x[1] === d[1]);
  const ws = shuffle(DUYU.filter(x => x !== org), rng).slice(0, 3);
  return Q({ sig: 'dp' + d[0], text: `"${d[0]}" hangi organımızla algılanır?`, speak: `${d[0]}. Bunu hangi organımızla algılarız?`, main: pic(d[2]), correct: oImg(org[0], pic(org[2])), wrongs: ws.map(x => oImg(x[0], pic(x[2]))) });
}, DUYU_DURUM.length);
const barinakQ = pairGen(BARINAK, (h) => `${h[0].toUpperCase() + h.slice(1)} nerede yaşar / barınır?`);
const barinakAud = pairGen(BARINAK, (h) => `${h[0].toUpperCase() + h.slice(1)} nerede yaşar / barınır?`, { mode: 'audio' });

export const FEN_TOPICS = [
  topic('fen_gezegen', '1. Gezegenimizi Tanıyalım', 'blue', [
    kind('fen_gezegen_k', 'Dünya', [g('dunya_y', 'Yazılı soru', factGen(DUNYA, 'read'), 15), g('dunya_d', 'Dinle ve seç', factGen(DUNYA, 'listen'), 15), g('dunya_s', 'Sesli şık', factGen(DUNYA, 'audio'), 15)]),
    kind('fen_yersekli_k', 'Kara ve su', [g('yer_sec', 'Kara / su seç (resimli)', classGen(YERSEKLI, 'pick'), 20), g('yer_hangi', 'Kara mı, su mu?', classGen(YERSEKLI, 'which', { whichAsk: (x) => `"${x}" taş küreye mi, su küreye mi aittir?`, extra: ['hava küre', 'çekirdek'] }), 13)])
  ]),
  topic('fen_duyu', '2. Beş Duyumuz', 'pink', [
    kind('fen_duyu_k', 'Duyu organları', [g('organ', 'Organ → duyu', organQ, 5), g('organ_s', 'Duyu → organ (sesli şık)', organQ2, 5), g('duyu_durum', 'Durum → duyu', duyuDurum, 20), g('duyu_durum_s', 'Durum → duyu (sesli şık)', duyuDurumAud, 20), g('duyu_resim', 'Durum → organ (resimli şık)', duyuOrganPic, 20)]),
    kind('fen_duyu_b', 'Duyu organlarının sağlığı', [g('duyu_y', 'Yazılı soru', factGen(DUYU_BILGI, 'read'), 8), g('duyu_d', 'Dinle ve seç', factGen(DUYU_BILGI, 'listen'), 8)])
  ]),
  topic('fen_kuvvet', '3. Kuvveti Tanıyalım', 'orange', [
    kind('fen_itcek_k', 'İtme - çekme', [g('itcek_sec', 'İtme / çekme seç', classGen(KUVVET, 'pick'), 22), g('itcek_hangi', 'İtme mi, çekme mi?', classGen(KUVVET, 'which', { whichAsk: (x) => `"${x}" hangi kuvvete örnektir?`, extra: ['ses', 'ışık'] }), 14)]),
    kind('fen_hareket_k', 'Hareket çeşitleri', [g('hareket_sec', 'Hareket türü seç', classGen(HAREKET, 'pick'), 30), g('hareket_hangi', 'Hangi hareket?', classGen(HAREKET, 'which', { whichAsk: (x) => `"${x}" hangi hareketi yapar?` }), 21), g('hareket_ses', 'Hangi hareket? (sesli şık)', classGen(HAREKET, 'whichAud', { whichAsk: (x) => `"${x}" hangi hareketi yapar?` }), 21)]),
    kind('fen_kuvvet_b', 'Kuvvet ve mıknatıs', [g('kuvvet_y', 'Yazılı soru', factGen(KUVVET_BILGI, 'read'), 10), g('kuvvet_s', 'Sesli şık', factGen(KUVVET_BILGI, 'audio'), 10)])
  ]),
  topic('fen_madde', '4. Maddeyi Tanıyalım', 'emerald', [
    kind('fen_hal_k', 'Katı, sıvı, gaz', [g('hal_sec', 'Katı / sıvı / gaz seç (resimli)', classGen(HAL, 'pick'), 30), g('hal_dinle', 'Dinle → resimli şık', classGen(HAL, 'pickAud'), 20), g('hal_hangi', 'Hangi hâlde?', classGen(HAL, 'which', { whichAsk: (x) => `"${x}" hangi hâldedir?`, extra: ['ışık'] }), 23), g('hal_degil', 'Hangisi değildir?', classGen(HAL, 'not'), 20), g('hal_ses', 'Hangi hâlde? (sesli şık)', classGen(HAL, 'whichAud', { whichAsk: (x) => `"${x}" hangi hâldedir?`, extra: ['ışık'] }), 20)]),
    kind('fen_ozellik_k', 'Maddenin özellikleri', [g('ozellik_sec', 'Özellik seç (resimli)', classGen(OZELLIK, 'pick'), 30), g('ozellik_hangi', 'Hangi özellikte?', classGen(OZELLIK, 'which', { whichAsk: (x) => `"${x}" hangi özelliğe sahiptir?` }), 25)]),
    kind('fen_madde_b', 'Madde bilgisi', [g('madde_y', 'Yazılı soru', factGen(MADDE_BILGI, 'read'), 12), g('madde_d', 'Dinle ve seç', factGen(MADDE_BILGI, 'listen'), 12), g('madde_s', 'Sesli şık', factGen(MADDE_BILGI, 'audio'), 12)])
  ]),
  topic('fen_isik', '5. Çevremizdeki Işık ve Sesler', 'amber', [
    kind('fen_isik_k', 'Işık kaynakları', [g('isik_sec', 'Doğal / yapay ışık kaynağı', classGen(ISIK, 'pick'), 24), g('isik_hangi', 'Doğal mı, yapay mı?', classGen(ISIK, 'which', { whichAsk: (x) => `"${x}" nasıl bir ışık kaynağıdır?`, extra: ['ses kaynağı', 'ışık kaynağı değildir'] }), 12)]),
    kind('fen_ses_k', 'Ses kaynakları', [g('ses_sec', 'Doğal / yapay ses kaynağı', classGen(SES, 'pick'), 24), g('ses_dinle', 'Dinle → resimli şık', classGen(SES, 'pickAud'), 16), g('ses_hangi', 'Doğal mı, yapay mı?', classGen(SES, 'which', { whichAsk: (x) => `"${x}" nasıl bir ses kaynağıdır?`, extra: ['ışık kaynağı', 'ses kaynağı değildir'] }), 15)]),
    kind('fen_isikses_b', 'Işık ve ses kirliliği', [g('isikses_y', 'Yazılı soru', factGen(ISIK_SES_BILGI, 'read'), 8), g('isikses_s', 'Sesli şık', factGen(ISIK_SES_BILGI, 'audio'), 8)])
  ]),
  topic('fen_canli', '6. Canlılar Dünyası', 'lime', [
    kind('fen_canli_k', 'Canlı - cansız', [g('canli_sec', 'Canlı / cansız seç (resimli)', classGen(CANLI, 'pick'), 30), g('canli_degil', 'Hangisi değildir?', classGen(CANLI, 'not'), 24), g('canli_hangi', 'Canlı mı, cansız mı?', classGen(CANLI, 'which', { whichAsk: (x) => `"${x}" canlı mı, cansız mı?`, extra: ['bitki değil', 'yapay'] }), 18)]),
    kind('fen_hayvan_k', 'Hayvanlar', [g('beslenme_sec', 'Beslenme şekli (resimli)', classGen(BESLENME, 'pick'), 26), g('beslenme_hangi', 'Nasıl beslenir?', classGen(BESLENME, 'which', { whichAsk: (x) => `"${x}" nasıl beslenir?`, extra: ['hiç beslenmez', 'sadece su içer'] }), 17), g('barinak', 'Barınak', barinakQ, 12), g('barinak_s', 'Barınak (sesli şık)', barinakAud, 12)]),
    kind('fen_bitki_k', 'Bitkiler ve çevre', [g('bitki_y', 'Yazılı soru', factGen(BITKI, 'read'), 12), g('bitki_d', 'Dinle ve seç', factGen(BITKI, 'listen'), 12), g('bitki_s', 'Sesli şık', factGen(BITKI, 'audio'), 12)])
  ]),
  topic('fen_elektrik', '7. Elektrikli Araçlar', 'violet', [
    kind('fen_elektrik_k', 'Pil - şehir elektriği', [g('elek_sec', 'Pille / prizle çalışan (resimli)', classGen(ELEKTRIK, 'pick'), 24), g('elek_hangi', 'Neyle çalışır?', classGen(ELEKTRIK, 'which', { whichAsk: (x) => `"${x}" neyle çalışır?`, extra: ['elektrikle çalışmaz', 'güneşle (pilsiz) çalışır'] }), 13)]),
    kind('fen_elektrik_b', 'Güvenli elektrik', [g('elek_y', 'Yazılı soru', factGen(ELEKTRIK_BILGI, 'read'), 10), g('elek_d', 'Dinle ve seç', factGen(ELEKTRIK_BILGI, 'listen'), 10), g('elek_s', 'Sesli şık', factGen(ELEKTRIK_BILGI, 'audio'), 10)])
  ])
];

export const FEN_BANK = makeSubjectBank({
  id: 'fen',
  title: 'fen bilimleri (3. sınıf)',
  intro: '7 ünite, toplam 1000 hazır soru. Resimli, yazılı ve sesli sorular karışıktır; dinleme sorularında soru, sesli şık sorularında şıklar telefonla okunur.',
  rootFolder: 'Fen Bilimleri (3. Sınıf)',
  topics: FEN_TOPICS,
  total: 1000
});
