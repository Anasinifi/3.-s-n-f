// ============================================================================
// --- HAYAT BİLGİSİ (3. SINIF) — 1000 HAZIR SORU ---
// ============================================================================
// Temalar: Ben ve Okulum • Sağlığım ve Güvenliğim • Ailem ve Toplum • Yaşadığım Yer ve Ülkem
//          • Doğa ve Çevre • Bilim, Teknoloji ve Sanat
import { pic, oTxt, oAud, oImg, Q, cyc, capped, makeRng, pick, shuffle, makeSubjectBank, grp, topic, kind, factGen, classGen, pairGen } from './common';

const g = grp('hb');

// ---------------------------------------------------------------------------
// 1. BEN VE OKULUM
// ---------------------------------------------------------------------------
const OKUL = [
  { q: 'Okulda öğrencilerin sağlığıyla ilgilenen, revirde çalışan kişi kimdir?', a: 'okul hemşiresi', w: ['müdür', 'kantinci', 'şoför'] },
  { q: 'Okulun yönetiminden sorumlu kişi kimdir?', a: 'okul müdürü', w: ['öğrenci', 'hizmetli', 'veli'] },
  { q: 'Okulumuzun temizliğine yardım eden çalışanlara ne denir?', a: 'yardımcı personel (hizmetli)', w: ['rehber öğretmen', 'müdür yardımcısı', 'veli'] },
  { q: 'Bir sorunumuz olduğunda konuşabileceğimiz, bize rehberlik eden öğretmen kimdir?', a: 'rehber öğretmen', w: ['beden eğitimi öğretmeni', 'müzik öğretmeni', 'nöbetçi öğrenci'] },
  { q: 'Sınıf başkanı nasıl belirlenir?', a: 'öğrencilerin oylarıyla (seçimle)', w: ['en uzun boylu öğrenci olur', 'müdür kendi seçer', 'kura ile her gün değişir'] },
  { q: 'Okulda kitap okuyup ödünç alabildiğimiz yer neresidir?', a: 'kütüphane', w: ['kantin', 'spor salonu', 'revir'] },
  { q: 'Teneffüste koridorda nasıl davranmalıyız?', a: 'koşmadan, sırayla yürümeliyiz', w: ['hızlıca koşmalıyız', 'yüksek sesle bağırmalıyız', 'arkadaşlarımızı itmeliyiz'] },
  { q: 'Sınıfta konuşmak istediğimizde ne yapmalıyız?', a: 'parmak kaldırıp söz istemeliyiz', w: ['hemen bağırmalıyız', 'sıraya vurmalıyız', 'arkadaşımızın sözünü kesmeliyiz'] },
  { q: 'Okul eşyalarımızı nasıl kullanmalıyız?', a: 'özenli ve tutumlu', w: ['hırpalayarak', 'her gün yenisini alarak', 'arkadaşlarımıza fırlatarak'] },
  { q: 'Arkadaşımızın eşyasını kullanmak istediğimizde ne yapmalıyız?', a: 'izin istemeliyiz', w: ['habersiz almalıyız', 'saklamalıyız', 'kırmalıyız'] },
  { q: 'Okul servisinde nasıl davranmalıyız?', a: 'emniyet kemerini takıp yerimizde oturmalıyız', w: ['ayakta dolaşmalıyız', 'camdan sarkmalıyız', 'şoförle sürekli konuşmalıyız'] },
  { q: 'Okulumuzda yangın tatbikatı neden yapılır?', a: 'tehlike anında ne yapacağımızı öğrenmek için', w: ['ders yapmamak için', 'eğlenmek için', 'okulu boyamak için'] },
  { q: 'Okula gelirken hangisi sorumluluklarımızdan biridir?', a: 'okula zamanında gelmek', w: ['ödevleri unutmak', 'derse geç kalmak', 'çantayı evde bırakmak'] },
  { q: 'Bir arkadaşımız sınıfa yeni geldiyse ne yapmalıyız?', a: 'onu güler yüzle karşılayıp tanışmalıyız', w: ['onunla konuşmamalıyız', 'ona gülmeliyiz', 'onu oyuna almamalıyız'] },
  { q: 'Hangisi ilgi ve yeteneklerimizi geliştirmemize yardımcı olur?', a: 'kulüp ve etkinliklere katılmak', w: ['hiç denememek', 'sadece televizyon izlemek', 'her şeyden vazgeçmek'] },
  { q: 'Kendimizi tanıtırken hangisini söylemeyiz?', a: 'evimizin kapı şifresini', w: ['adımızı', 'sevdiğimiz oyunları', 'hobilerimizi'] }
];
const DUYGU = [['Arkadaşım doğum günüme geldi.', 'mutluluk', '😀'], ['Oyuncağım kırıldı.', 'üzüntü', '😢'], ['Karanlıkta garip bir ses duydum.', 'korku', '😨'], ['Sırada biri önüme geçti.', 'öfke', '😠'], ['Sınavda yüksek not aldım.', 'sevinç / gurur', '🥳'], ['Hiç beklemediğim bir hediye aldım.', 'şaşkınlık', '😮'], ['Yarın ilk kez sahneye çıkacağım.', 'heyecan', '🤩'], ['Köpeğim kayboldu.', 'üzüntü', '😢']];

// ---------------------------------------------------------------------------
// 2. SAĞLIĞIM VE GÜVENLİĞİM
// ---------------------------------------------------------------------------
const BESIN = [
  { name: 'sağlıklı besin', ask: 'Hangisi sağlıklı bir besindir?', label: 'sağlıklı besin', items: [['elma', '🍎'], ['süt', '🥛'], ['yumurta', '🥚'], ['havuç', '🥕'], ['peynir', '🧀'], ['balık', '🐟'], ['brokoli', '🥦'], ['muz', '🍌'], ['ceviz', '🌰'], ['yoğurt', '🥣'], ['domates', '🍅'], ['kuru fasulye', '🫘']] },
  { name: 'az tüketilmesi gereken besin', ask: 'Hangisini AZ tüketmeliyiz?', label: 'az tüketilmeli', items: [['cips', '🍟'], ['gazlı içecek', '🥤'], ['şeker', '🍬'], ['lolipop', '🍭'], ['hamburger', '🍔'], ['çikolata', '🍫'], ['pasta', '🍰'], ['donut', '🍩']] }
];
const SAGLIK = [
  { q: 'Dişlerimizi günde en az kaç kez fırçalamalıyız?', a: '2 kez', w: ['hiç', 'haftada 1 kez', 'ayda 1 kez'], e: '🪥' },
  { q: 'Yemekten önce ve sonra ne yapmalıyız?', a: 'ellerimizi yıkamalıyız', w: ['hemen uyumalıyız', 'koşmalıyız', 'ödev yapmalıyız'], e: '🧼' },
  { q: 'Gece kaç saat uyumak sağlığımız için iyidir? (3. sınıf öğrencisi)', a: '9-11 saat', w: ['2-3 saat', '4-5 saat', '15-16 saat'], e: '😴' },
  { q: 'Hangisi sağlıklı yaşam için gereklidir?', a: 'düzenli spor yapmak', w: ['geç saatlere kadar oturmak', 'su içmemek', 'kahvaltı yapmamak'], e: '🏃' },
  { q: 'Günün en önemli öğünü hangisidir?', a: 'kahvaltı', w: ['gece atıştırması', 'ara öğün', 'akşam tatlısı'], e: '🍳' },
  { q: 'Hasta olan bir kişi ne yapmalıdır?', a: 'doktora gitmeli ve dinlenmelidir', w: ['okula gidip koşmalı', 'ilaçları kendi seçmeli', 'hiç su içmemeli'], e: '🤒' },
  { q: 'Hapşırırken ya da öksürürken ne yapmalıyız?', a: 'ağzımızı dirseğimizle ya da mendille kapatmalıyız', w: ['arkadaşımıza doğru hapşırmalıyız', 'elimizi yıkamamalıyız', 'bağırmalıyız'], e: '🤧' },
  { q: 'Günde ne kadar su içmeliyiz?', a: 'bol su (yaklaşık 6-8 bardak)', w: ['hiç içmemeliyiz', 'yalnızca gazlı içecek', 'yarım bardak'], e: '💧' },
  { q: 'Ekran (tablet, telefon) kullanırken neye dikkat etmeliyiz?', a: 'süreyi sınırlı tutmaya ve ekrana yakın bakmamaya', w: ['bütün gün kullanmaya', 'karanlıkta yakından bakmaya', 'yemek yerken izlemeye'], e: '📱' },
  { q: 'Başkasının diş fırçasını ya da tarağını kullanmak doğru mudur?', a: 'Hayır, kişisel eşyalar paylaşılmaz.', w: ['Evet, her zaman kullanılır.', 'Sadece hafta sonu kullanılır.', 'Sadece okulda kullanılır.'], e: '🪮' }
];
const ACIL = [['112', 'Acil Çağrı Merkezi (ambulans, itfaiye, polis, jandarma)', '🚑'], ['177', 'Orman Yangını İhbar', '🌲'], ['155', 'Polis İmdat (112 içinde)', '🚓'], ['110', 'İtfaiye (112 içinde)', '🚒'], ['156', 'Jandarma (112 içinde)', '🚔'], ['182', 'Hastane Randevu (MHRS)', '🏥']];
const GUVENLIK = [
  { q: 'Karşıdan karşıya nereden geçmeliyiz?', a: 'yaya geçidinden', w: ['araçların arasından', 'virajdan', 'köprünün altından koşarak'], e: '🚸' },
  { q: 'Trafik ışığında yayalar için kırmızı ışık ne anlama gelir?', a: 'dur', w: ['geç', 'koş', 'hazırlan'], e: '🔴' },
  { q: 'Trafik ışığında yayalar için yeşil ışık ne anlama gelir?', a: 'sağa sola bakarak geç', w: ['dur', 'geri dön', 'otur'], e: '🟢' },
  { q: 'Araçta çocuklar nerede oturmalıdır?', a: 'arka koltukta, emniyet kemeri takılı', w: ['ön koltukta kemersiz', 'şoförün kucağında', 'bagajda'], e: '🚗' },
  { q: 'Bisiklet sürerken neyi takmalıyız?', a: 'kask', w: ['kulaklık', 'güneş gözlüğü', 'şapka'], e: '🚴' },
  { q: 'Tanımadığımız biri bizi arabasına çağırırsa ne yapmalıyız?', a: 'gitmemeli ve hemen güvendiğimiz bir büyüğe söylemeliyiz', w: ['arabaya binmeliyiz', 'adresimizi söylemeliyiz', 'onunla oyun oynamalıyız'], e: '🚫' },
  { q: 'Deprem sırasında ne yapmalıyız?', a: 'çök - kapan - tutun', w: ['merdivenlerden koşmalıyız', 'pencereden atlamalıyız', 'asansöre binmeliyiz'], e: '🏚️' },
  { q: 'Elektrik prizine neden çatal, makas sokmamalıyız?', a: 'elektrik çarpabilir', w: ['priz kirlenir', 'çatal paslanır', 'ses çıkar'], e: '🔌' },
  { q: 'Evde gaz kokusu alınca ne yapmalıyız?', a: 'pencereleri açmalı, ışıkları açmadan büyüklere haber vermeliyiz', w: ['ışığı açmalıyız', 'kibrit yakmalıyız', 'kapıları kapatıp beklemeliyiz'], e: '💨' },
  { q: 'İnternette tanımadığımız biri bilgilerimizi isterse ne yapmalıyız?', a: 'bilgi vermemeli ve ailemize söylemeliyiz', w: ['adresimizi yazmalıyız', 'fotoğrafımızı göndermeliyiz', 'şifremizi söylemeliyiz'], e: '💻' },
  { q: 'Okul çantamızın ağırlığı nasıl olmalıdır?', a: 'hafif, sadece o günün kitaplarıyla', w: ['bütün kitaplar içinde', 'çok ağır', 'oyuncaklarla dolu'], e: '🎒' },
  { q: 'Havuzda ya da denizde nasıl yüzmeliyiz?', a: 'bir büyüğün gözetiminde, güvenli alanda', w: ['tek başımıza derin yerde', 'yemekten hemen sonra', 'yasak bölgede'], e: '🏊' }
];
const TRAFIK = [['🚸', 'okul geçidi'], ['🚦', 'trafik ışığı'], ['⛔', 'girilmez'], ['🛑', 'dur'], ['🚳', 'bisiklet giremez'], ['🚷', 'yaya giremez'], ['⚠️', 'dikkat']];

// ---------------------------------------------------------------------------
// 3. AİLEM VE TOPLUM
// ---------------------------------------------------------------------------
const AKRABA = [['annemin annesi', 'anneanne'], ['babamın annesi', 'babaanne'], ['annemin babası / babamın babası', 'dede'], ['annemin kız kardeşi', 'teyze'], ['annemin erkek kardeşi', 'dayı'], ['babamın kız kardeşi', 'hala'], ['babamın erkek kardeşi', 'amca'], ['teyzemin / amcamın çocuğu', 'kuzen'], ['ablamın ya da ağabeyimin çocuğu', 'yeğen'], ['dayımın eşi', 'yenge']];
const MESLEK = [['hasta tedavi eder', 'doktor', '🧑‍⚕️'], ['ekmek yapar', 'fırıncı', '🧑‍🍳'], ['yangın söndürür', 'itfaiyeci', '🧑‍🚒'], ['tarlada ürün yetiştirir', 'çiftçi', '🧑‍🌾'], ['uçak kullanır', 'pilot', '🧑‍✈️'], ['evleri ve binaları tasarlar', 'mimar', '🏗️'], ['dişleri tedavi eder', 'diş hekimi', '🦷'], ['hayvanları tedavi eder', 'veteriner', '🐾'], ['mektupları dağıtır', 'postacı', '📮'], ['güvenliğimizi sağlar', 'polis', '👮'], ['öğrencilere ders anlatır', 'öğretmen', '🧑‍🏫'], ['saçları keser', 'kuaför (berber)', '💇'], ['balık tutar', 'balıkçı', '🎣'], ['elektrik tesisatını onarır', 'elektrikçi', '💡'], ['resim yapar', 'ressam', '🎨'], ['yemek pişirir', 'aşçı', '🍳'], ['kitap yazar', 'yazar', '✍️'], ['uzaya gider', 'astronot', '🧑‍🚀']];
const ARAC = [['stetoskop', 'doktor', '🩺'], ['hortum', 'itfaiyeci', '🧯'], ['makas ve tarak', 'kuaför (berber)', '✂️'], ['olta', 'balıkçı', '🎣'], ['traktör', 'çiftçi', '🚜'], ['fırça ve tuval', 'ressam', '🎨'], ['tebeşir ve kitap', 'öğretmen', '📚'], ['tencere ve kepçe', 'aşçı', '🍲'], ['mektup çantası', 'postacı', '✉️'], ['pense ve kablo', 'elektrikçi', '🔌']];
const TOPLUM = [
  { q: 'Evde ailemize nasıl yardım edebiliriz?', a: 'odamızı toplayıp sofrayı kurmaya yardım ederek', w: ['oyuncaklarımızı dağıtarak', 'hiçbir şey yapmayarak', 'sürekli televizyon izleyerek'] },
  { q: 'Aile içinde kararlar nasıl alınmalıdır?', a: 'aile bireylerinin fikirleri dinlenerek', w: ['sadece en küçüğün istediği olur', 'kimseye sorulmadan', 'bağırarak'] },
  { q: 'Komşularımıza karşı nasıl davranmalıyız?', a: 'saygılı ve yardımsever', w: ['gürültü yaparak', 'selam vermeyerek', 'kapılarını çalıp kaçarak'] },
  { q: 'Yaşlı bir komşumuza nasıl yardım edebiliriz?', a: 'alışveriş poşetlerini taşıyarak', w: ['ona bağırarak', 'kapısına çöp bırakarak', 'onu görmezden gelerek'] },
  { q: 'Gece geç saatlerde evde neye dikkat etmeliyiz?', a: 'komşuları rahatsız edecek gürültü yapmamaya', w: ['yüksek sesle müzik dinlemeye', 'top oynamaya', 'mobilyaları sürüklemeye'] },
  { q: 'Hangisi bir ihtiyaçtır (istek değil)?', a: 'beslenmek', w: ['yeni bir oyun konsolu', 'beşinci oyuncak araba', 'pahalı bir ayakkabı'] },
  { q: 'Hangisi bir istektir?', a: 'en yeni tablet', w: ['su içmek', 'barınmak', 'giyinmek'] },
  { q: 'Harçlığımızı nasıl kullanmalıyız?', a: 'ihtiyaçlarımızı düşünüp bir kısmını biriktirerek', w: ['hepsini hemen şekere harcayarak', 'kaybederek', 'hiç saymadan'] },
  { q: 'Su ve elektriği nasıl kullanmalıyız?', a: 'tutumlu (israf etmeden)', w: ['musluğu açık bırakarak', 'boş odada ışığı yakarak', 'gereğinden çok'] },
  { q: 'Bayramlarda büyüklerimizi ziyaret etmek neyi gösterir?', a: 'sevgi ve saygıyı', w: ['tembelliği', 'kızgınlığı', 'korkuyu'] },
  { q: 'Ortak kullanım alanlarından (park, otobüs) nasıl yararlanmalıyız?', a: 'temiz tutup özenle kullanarak', w: ['oturakları çizerek', 'çöp atarak', 'çiçekleri koparak'] },
  { q: 'Ailemizin büyüklerinden öğrendiğimiz eski oyunlara, el sanatlarına ne denir?', a: 'kültürel miras', w: ['teknoloji', 'trafik kuralı', 'meslek'] }
];

// ---------------------------------------------------------------------------
// 4. YAŞADIĞIM YER VE ÜLKEM
// ---------------------------------------------------------------------------
const BAYRAM = [['23 Nisan', 'Ulusal Egemenlik ve Çocuk Bayramı'], ['29 Ekim', 'Cumhuriyet Bayramı'], ['19 Mayıs', 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı'], ['30 Ağustos', 'Zafer Bayramı'], ['10 Kasım', 'Atatürk\'ü anma günü'], ['18 Mart', 'Çanakkale Zaferi ve Şehitleri Anma Günü'], ['24 Kasım', 'Öğretmenler Günü'], ['15 Temmuz', 'Demokrasi ve Millî Birlik Günü']];
const ULKE = [
  { q: 'Türkiye\'nin başkenti neresidir?', a: 'Ankara', w: ['İstanbul', 'İzmir', 'Bursa'], e: '🇹🇷' },
  { q: 'Türkiye Cumhuriyeti\'nin kurucusu kimdir?', a: 'Mustafa Kemal Atatürk', w: ['Fatih Sultan Mehmet', 'Mehmet Akif Ersoy', 'Kanuni Sultan Süleyman'] },
  { q: 'İstiklal Marşı\'mızın şairi kimdir?', a: 'Mehmet Akif Ersoy', w: ['Mustafa Kemal Atatürk', 'Yunus Emre', 'Nasreddin Hoca'] },
  { q: 'Cumhuriyet hangi yıl ilan edilmiştir?', a: '1923', w: ['1920', '1938', '1453'] },
  { q: 'Türkiye Büyük Millet Meclisi hangi tarihte açılmıştır?', a: '23 Nisan 1920', w: ['29 Ekim 1923', '19 Mayıs 1919', '30 Ağustos 1922'] },
  { q: 'Bayrağımızda hangi renkler vardır?', a: 'kırmızı ve beyaz', w: ['mavi ve beyaz', 'yeşil ve kırmızı', 'sarı ve kırmızı'], e: '🇹🇷' },
  { q: 'Bayrağımızın üzerinde neler vardır?', a: 'ay ve yıldız', w: ['güneş ve bulut', 'iki yıldız', 'ağaç ve kuş'], e: '🇹🇷' },
  { q: 'İstiklal Marşı okunurken nasıl durmalıyız?', a: 'saygıyla, hazır olda', w: ['oturarak', 'konuşarak', 'oynayarak'] },
  { q: 'Atatürk nerede doğmuştur?', a: 'Selanik', w: ['Ankara', 'Samsun', 'İzmir'] },
  { q: 'Atatürk\'ün çocuklara armağan ettiği bayram hangisidir?', a: '23 Nisan', w: ['29 Ekim', '30 Ağustos', '19 Mayıs'] },
  { q: 'Türkiye kaç tarafı denizlerle çevrili bir ülkedir?', a: 'üç', w: ['iki', 'dört', 'bir'] },
  { q: 'Hangisi Türkiye\'yi çevreleyen denizlerden biri değildir?', a: 'Kızıldeniz', w: ['Karadeniz', 'Akdeniz', 'Ege Denizi'] },
  { q: 'Türkiye\'nin en kalabalık şehri hangisidir?', a: 'İstanbul', w: ['Ankara', 'Van', 'Rize'] },
  { q: 'Muhtar hangi yerin yöneticisidir?', a: 'mahalle ya da köy', w: ['ülke', 'il', 'okul'] },
  { q: 'Bir ili kim yönetir?', a: 'vali', w: ['muhtar', 'öğretmen', 'kaptan'] },
  { q: 'Belediye hangi hizmeti verir?', a: 'çöplerin toplanması, park ve yol yapımı', w: ['ders anlatmak', 'hasta muayenesi', 'uçak uçurmak'] }
];
const YON = [
  { q: 'Güneş hangi yönden doğar?', a: 'doğu', w: ['batı', 'kuzey', 'güney'], e: '🌅' },
  { q: 'Güneş hangi yönde batar?', a: 'batı', w: ['doğu', 'kuzey', 'güney'], e: '🌇' },
  { q: 'Sabah güneşe doğru dönersek sağ kolumuz hangi yönü gösterir?', a: 'güney', w: ['kuzey', 'batı', 'doğu'], e: '🧍' },
  { q: 'Sabah güneşe doğru dönersek sol kolumuz hangi yönü gösterir?', a: 'kuzey', w: ['güney', 'batı', 'doğu'], e: '🧍' },
  { q: 'Yönümüzü bulmaya yarayan araç hangisidir?', a: 'pusula', w: ['termometre', 'cetvel', 'terazi'], e: '🧭' },
  { q: 'Gece yön bulmamıza yardım eden yıldız hangisidir?', a: 'Kutup Yıldızı', w: ['Güneş', 'Ay', 'Mars'], e: '⭐' },
  { q: 'Ağaç gövdelerindeki yosunlar genellikle hangi yönde bulunur? (Türkiye)', a: 'kuzey', w: ['güney', 'doğu', 'batı'], e: '🌳' },
  { q: 'Ana yönler kaç tanedir?', a: 'dört', w: ['iki', 'üç', 'altı'], e: '🧭' },
  { q: 'Okulumuzun yerini gösteren, yukarıdan çizilmiş basit plana ne denir?', a: 'kroki', w: ['resim', 'fotoğraf', 'takvim'], e: '🗺️' }
];

// ---------------------------------------------------------------------------
// 5. DOĞA VE ÇEVRE
// ---------------------------------------------------------------------------
const DOGAL = [
  { name: 'doğal unsur', ask: 'Hangisi doğal bir unsurdur (insan yapmamıştır)?', label: 'doğal unsur', items: [['dağ', '⛰️'], ['nehir', '🏞️'], ['ağaç', '🌳'], ['deniz', '🌊'], ['göl', '💧'], ['orman', '🌲'], ['şelale', '🌊'], ['mağara', '🪨'], ['volkan', '🌋'], ['çiçek', '🌸']] },
  { name: 'yapay (beşerî) unsur', ask: 'Hangisi insanlar tarafından yapılmış (yapay) bir unsurdur?', label: 'yapay unsur', items: [['köprü', '🌉'], ['bina', '🏢'], ['yol', '🛣️'], ['baraj', '🏗️'], ['okul', '🏫'], ['hastane', '🏥'], ['fabrika', '🏭'], ['cami', '🕌'], ['stadyum', '🏟️'], ['tren yolu', '🛤️']] }
];
const GERI = [
  { name: 'kâğıt', label: 'mavi kutu (kâğıt)', ask: 'Hangisi kâğıt geri dönüşüm kutusuna atılır?', items: [['gazete', '📰'], ['karton kutu', '📦'], ['defter', '📓'], ['dergi', '📖'], ['zarf', '✉️']] },
  { name: 'plastik', label: 'sarı kutu (plastik)', ask: 'Hangisi plastik geri dönüşüm kutusuna atılır?', items: [['pet şişe', '🧴'], ['plastik bardak', '🥤'], ['oyuncak (plastik)', '🪀'], ['şampuan kutusu', '🧴']] },
  { name: 'cam', label: 'yeşil kutu (cam)', ask: 'Hangisi cam geri dönüşüm kutusuna atılır?', items: [['cam şişe', '🍾'], ['reçel kavanozu', '🫙'], ['cam bardak', '🥛']] },
  { name: 'metal', label: 'gri kutu (metal)', ask: 'Hangisi metal geri dönüşüm kutusuna atılır?', items: [['konserve kutusu', '🥫'], ['içecek kutusu', '🥫'], ['metal kapak', '🔩']] },
  { name: 'pil', label: 'pil toplama kutusu', ask: 'Hangisi atık pil kutusuna atılmalıdır?', items: [['pil', '🔋'], ['şarj edilebilir pil', '🪫']] }
];
const MEVSIM = [
  { name: 'ilkbahar', label: 'ilkbahar', items: [['ağaçlar çiçek açar', '🌸'], ['göçmen kuşlar geri döner', '🐦'], ['kelebekler uçuşur', '🦋'], ['21 Mart ile başlar', '🌷']] },
  { name: 'yaz', label: 'yaz', items: [['denize gireriz', '🏖️'], ['hava çok sıcaktır', '☀️'], ['okullar tatildir', '🎒'], ['karpuz yeriz', '🍉']] },
  { name: 'sonbahar', label: 'sonbahar', items: [['yapraklar sararıp dökülür', '🍂'], ['okullar açılır', '🏫'], ['kuşlar göç eder', '🦢'], ['bağbozumu yapılır', '🍇']] },
  { name: 'kış', label: 'kış', items: [['kar yağar', '❄️'], ['kardan adam yaparız', '⛄'], ['bazı hayvanlar kış uykusuna yatar', '🐻'], ['kalın giyiniriz', '🧥']] }
];
const CEVRE = [
  { q: 'Doğada çöpleri nereye atmalıyız?', a: 'çöp kutusuna', w: ['yere', 'denize', 'ormana'], e: '🗑️' },
  { q: 'Ağaç dikmek çevreye nasıl katkı sağlar?', a: 'havayı temizler, toprağı korur', w: ['havayı kirletir', 'suyu azaltır', 'hayvanları kaçırır'], e: '🌳' },
  { q: 'Pikniğe gittiğimizde ateşi nasıl bırakmalıyız?', a: 'tamamen söndürüp üzerine su dökerek', w: ['yanar halde', 'üzerine kâğıt atarak', 'rüzgâra bırakarak'], e: '🔥' },
  { q: 'Sokak hayvanlarına nasıl davranmalıyız?', a: 'sevgiyle, onlara su ve mama bırakarak', w: ['taş atarak', 'kovalayarak', 'korkutarak'], e: '🐕' },
  { q: 'Su tasarrufu için hangisini yapmalıyız?', a: 'dişlerimizi fırçalarken musluğu kapatmalıyız', w: ['musluğu açık bırakmalıyız', 'uzun duş almalıyız', 'arabayı hortumla her gün yıkamalıyız'], e: '🚰' },
  { q: 'Hangisi hava kirliliğini azaltır?', a: 'toplu taşıma ya da bisiklet kullanmak', w: ['her yere arabayla gitmek', 'çöp yakmak', 'ağaç kesmek'], e: '🚲' },
  { q: 'Geri dönüşüm neden önemlidir?', a: 'doğal kaynakları korur, çöp azalır', w: ['çöpleri artırır', 'eğlencelidir sadece', 'ağaçları keser'], e: '♻️' },
  { q: 'Hangisi doğal afettir?', a: 'deprem', w: ['trafik sıkışıklığı', 'elektrik kesintisi', 'doğum günü'], e: '🌋' }
];

// ---------------------------------------------------------------------------
// 6. BİLİM, TEKNOLOJİ VE SANAT
// ---------------------------------------------------------------------------
const ICAT = [['ampul', 'Thomas Edison', '💡'], ['telefon', 'Alexander Graham Bell', '☎️'], ['uçak (ilk motorlu uçuş)', 'Wright Kardeşler', '✈️'], ['yer çekimi yasası', 'Isaac Newton', '🍎'], ['ilk uçuş denemesi (İstanbul\'da kanatlarla)', 'Hezarfen Ahmet Çelebi', '🪶'], ['su saati ve otomatik makineler', 'El-Cezeri', '⚙️'], ['mimar, Selimiye Camii', 'Mimar Sinan', '🕌']];
const TEKNO = [
  { q: 'Teknoloji ürünlerini kullanırken neye dikkat etmeliyiz?', a: 'güvenli ve kısa süreli kullanmaya', w: ['saatlerce kullanmaya', 'ıslak elle şarj etmeye', 'şifremizi paylaşmaya'], e: '📱' },
  { q: 'Hangisi geçmişten günümüze iletişim araçlarındaki değişime örnektir?', a: 'mektuptan cep telefonuna', w: ['bisikletten uçağa', 'kalemden silgiye', 'masadan sandalyeye'], e: '✉️' },
  { q: 'Eski ve yeni ulaşım araçlarından hangisi eskiden kullanılırdı?', a: 'at arabası', w: ['metro', 'hızlı tren', 'elektrikli araba'], e: '🐎' },
  { q: 'Bir sanat eserini (resim, heykel) incelediğimiz yer neresidir?', a: 'müze / sanat galerisi', w: ['hastane', 'otopark', 'market'], e: '🖼️' },
  { q: 'Hangisi geleneksel bir el sanatımızdır?', a: 'ebru', w: ['robotik kodlama', 'video oyunu', 'fotokopi'], e: '🎨' },
  { q: 'Hangisi geleneksel bir çocuk oyunumuzdur?', a: 'yakan top', w: ['tablet oyunu', 'bilgisayar yarışı', 'sanal gerçeklik'], e: '⚽' },
  { q: 'Hacivat ile Karagöz hangi sanatın karakterleridir?', a: 'gölge oyunu', w: ['opera', 'bale', 'sinema'], e: '🎭' },
  { q: 'Hangisi bir buluşun hayatımızı kolaylaştırmasına örnektir?', a: 'çamaşır makinesinin elde yıkamayı kolaylaştırması', w: ['bozuk bir oyuncak', 'kırık bir bardak', 'kaybolan bir anahtar'], e: '🧺' }
];

const IHTIYAC = [
  { name: 'ihtiyaç', label: 'ihtiyaç', ask: 'Hangisi bir İHTİYAÇTIR (yaşamak için gerekli)?', items: [['su', '💧'], ['ekmek', '🍞'], ['ev (barınma)', '🏠'], ['mont (kışın)', '🧥'], ['ilaç (hastayken)', '💊'], ['uyku', '😴'], ['okul (eğitim)', '🏫'], ['sebze ve meyve', '🥗']] },
  { name: 'istek', label: 'istek', ask: 'Hangisi bir İSTEKTİR (olmasa da yaşarız)?', items: [['oyun konsolu', '🎮'], ['ikinci bisiklet', '🚲'], ['pahalı oyuncak', '🧸'], ['dondurma', '🍦'], ['yeni tablet', '📱'], ['şeker', '🍬'], ['pahalı ayakkabı', '👟'], ['balon', '🎈']] }
];
const DAVRANIS = [
  { name: 'doğru davranış', label: 'doğru davranış', ask: 'Hangisi DOĞRU bir davranıştır?', notAsk: 'Hangisi doğru bir davranış DEĞİLDİR?', items: [['Otobüste yaşlılara yer vermek'], ['Sırada beklemek'], ['Selamlaşmak'], ['Yere çöp atmamak'], ['Arkadaşını dinlemek'], ['Teşekkür etmek'], ['Eşyalarını paylaşmak'], ['Hatalıysa özür dilemek'], ['Kütüphanede sessiz olmak'], ['Musluğu kapatmak'], ['Ödevini zamanında yapmak'], ['Hayvanlara su vermek']] },
  { name: 'yanlış davranış', label: 'yanlış davranış', ask: 'Hangisi YANLIŞ bir davranıştır?', notAsk: 'Hangisi yanlış bir davranış DEĞİLDİR?', items: [['Sıraya kaynak yapmak'], ['Arkadaşıyla alay etmek'], ['Parktaki çiçekleri koparmak'], ['Duvarlara yazı yazmak'], ['Söz kesmek'], ['Yüksek sesle bağırmak'], ['İzin almadan eşya almak'], ['Ödevi arkadaşından kopyalamak'], ['Kırmızı ışıkta geçmek'], ['Hayvanlara taş atmak'], ['Ekmeği çöpe atmak'], ['Yalan söylemek']] }
];
const ILETISIM = [
  { name: 'ulaşım aracı', label: 'ulaşım aracı', ask: 'Hangisi bir ULAŞIM aracıdır?', items: [['otobüs', '🚌'], ['tren', '🚆'], ['uçak', '✈️'], ['gemi', '🚢'], ['bisiklet', '🚲'], ['metro', '🚇'], ['at arabası', '🐎'], ['teleferik', '🚡']] },
  { name: 'iletişim aracı', label: 'iletişim aracı', ask: 'Hangisi bir İLETİŞİM aracıdır?', items: [['telefon', '☎️'], ['mektup', '✉️'], ['bilgisayar', '💻'], ['radyo', '📻'], ['televizyon', '📺'], ['gazete', '📰'], ['cep telefonu', '📱'], ['telsiz', '📟']] }
];
// ---------------------------------------------------------------------------
const acilQ = pairGen(ACIL.map(([n, d, e]) => [d, n, e]), (d) => `${d} için hangi numara aranır?`);
const acilQ2 = pairGen(ACIL.map(([n, d, e]) => [n, d, e]), (n) => `${n} numarası nedir?`);
const bayramQ = pairGen(BAYRAM, (d) => `${d} hangi bayram ya da gündür?`);
const bayramQ2 = pairGen(BAYRAM, (b) => `${b} hangi tarihte kutlanır?`, { dir: 'rl' });
const akrabaQ = pairGen(AKRABA, (d) => `${d[0].toUpperCase() + d.slice(1)} bizim neyimiz olur?`);
const akrabaAud = pairGen(AKRABA, (d) => `${d[0].toUpperCase() + d.slice(1)} bizim neyimiz olur?`, { mode: 'audio' });
const meslekQ = pairGen(MESLEK, (d) => `Hangi meslekten kişi ${d}?`);
const meslekAud = pairGen(MESLEK, (d) => `Hangi meslekten kişi ${d}?`, { mode: 'audio' });
const meslekPic = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const m = cyc(MESLEK, pos ?? seed); const ws = shuffle(MESLEK.filter(x => x !== m), rng).slice(0, 3);
  return Q({ sig: 'mp' + m[1], text: `"${m[1]}" hangisidir? 🔊`, speak: `Dinle. || ${m[1]}. || Hangi resim?`, correct: oImg(m[1], pic(m[2])), wrongs: ws.map(x => oImg(x[1], pic(x[2]))) });
}, MESLEK.length);
const aracQ = pairGen(ARAC, (a) => `${a[0].toUpperCase() + a.slice(1)} hangi meslekte kullanılır?`);
const duyguQ = pairGen(DUYGU, (d) => `"${d}" Bu durumda hangi duyguyu hissederiz?`, { cap: DUYGU.length });
const trafikQ = capped((key, seed, pos) => {
  const rng = makeRng(key, seed); const t = cyc(TRAFIK, pos ?? seed); const ws = shuffle(TRAFIK.filter(x => x !== t), rng).slice(0, 3);
  return Q({ sig: 'tr' + t[1], text: 'Resimdeki trafik işareti ne anlama gelir?', speak: 'Resimdeki trafik işareti ne anlama gelir?', main: pic(t[0]), correct: oTxt(t[1]), wrongs: ws.map(x => oTxt(x[1])) });
}, TRAFIK.length);
const icatQ = pairGen(ICAT, (i) => `${i[0].toUpperCase() + i.slice(1)} kiminle ilgilidir?`);

export const HAYAT_TOPICS = [
  topic('hb_okul', '1. Ben ve Okulum', 'indigo', [
    kind('hb_okul_k', 'Okul hayatı', [g('okul_y', 'Yazılı soru', factGen(OKUL, 'read'), 16), g('okul_d', 'Dinle ve seç', factGen(OKUL, 'listen'), 16), g('okul_s', 'Sesli şık', factGen(OKUL, 'audio'), 16)]),
    kind('hb_duygu_k', 'Duygularım', [g('duygu', 'Durum → duygu', duyguQ, 8)]),
    kind('hb_davranis_k', 'Doğru - yanlış davranış', [g('davranis_sec', 'Doğru / yanlış davranış', classGen(DAVRANIS, 'pick'), 30), g('davranis_degil', 'Hangisi değildir?', classGen(DAVRANIS, 'not'), 20)])
  ]),
  topic('hb_saglik', '2. Sağlığım ve Güvenliğim', 'emerald', [
    kind('hb_besin_k', 'Sağlıklı beslenme', [g('besin_sec', 'Sağlıklı besin seç (resimli)', classGen(BESIN, 'pick'), 24), g('besin_dinle', 'Dinle → resimli şık', classGen(BESIN, 'pickAud'), 16), g('besin_hangi', 'Besin hangi grupta?', classGen(BESIN, 'which', { whichAsk: (x) => `"${x}" nasıl bir besindir?`, extra: ['zehirli', 'yenmez', 'ilaç'] }), 14), g('besin_degil', 'Hangisi sağlıklı değildir?', classGen(BESIN, 'not'), 14)]),
    kind('hb_saglik_k', 'Sağlıklı yaşam', [g('saglik_y', 'Yazılı soru', factGen(SAGLIK, 'read'), 10), g('saglik_s', 'Sesli şık', factGen(SAGLIK, 'audio'), 10), g('saglik_d', 'Dinle ve seç', factGen(SAGLIK, 'listen'), 10)]),
    kind('hb_guven_k', 'Güvenlik ve trafik', [g('guven_y', 'Yazılı soru', factGen(GUVENLIK, 'read'), 12), g('guven_d', 'Dinle ve seç', factGen(GUVENLIK, 'listen'), 12), g('guven_s', 'Sesli şık', factGen(GUVENLIK, 'audio'), 12), g('trafik', 'Trafik işaretleri', trafikQ, 7), g('acil', 'Acil numaralar', acilQ, 6), g('acil2', 'Numara ne işe yarar?', acilQ2, 6)])
  ]),
  topic('hb_aile', '3. Ailem ve Toplum', 'amber', [
    kind('hb_akraba_k', 'Akrabalık', [g('akraba', 'Akrabalık adları', akrabaQ, 10), g('akraba_s', 'Akrabalık (sesli şık)', akrabaAud, 10)]),
    kind('hb_meslek_k', 'Meslekler', [g('meslek', 'Meslek → iş', meslekQ, 18), g('meslek_s', 'Meslek (sesli şık)', meslekAud, 18), g('meslek_r', 'Dinle → meslek resmi', meslekPic, 18), g('meslek_arac', 'Araç → meslek', aracQ, 10)]),
    kind('hb_ihtiyac_k', 'İhtiyaç ve istek', [g('ihtiyac_sec', 'İhtiyaç mı, istek mi? (resimli)', classGen(IHTIYAC, 'pick'), 20), g('ihtiyac_hangi', 'Hangisi ihtiyaç / istek?', classGen(IHTIYAC, 'which', { whichAsk: (x) => `"${x}" ihtiyaç mı, istek mi?`, extra: ['oyun', 'kural'] }), 14)]),
    kind('hb_toplum_k', 'Aile ve toplum kuralları', [g('toplum_y', 'Yazılı soru', factGen(TOPLUM, 'read'), 12), g('toplum_d', 'Dinle ve seç', factGen(TOPLUM, 'listen'), 12), g('toplum_s', 'Sesli şık', factGen(TOPLUM, 'audio'), 12)])
  ]),
  topic('hb_ulke', '4. Yaşadığım Yer ve Ülkem', 'rose', [
    kind('hb_ulke_k', 'Ülkemiz', [g('ulke_y', 'Yazılı soru', factGen(ULKE, 'read'), 16), g('ulke_d', 'Dinle ve seç', factGen(ULKE, 'listen'), 16), g('ulke_s', 'Sesli şık', factGen(ULKE, 'audio'), 16)]),
    kind('hb_bayram_k', 'Millî bayramlar ve günler', [g('bayram', 'Tarih → bayram', bayramQ, 8), g('bayram2', 'Bayram → tarih', bayramQ2, 8)]),
    kind('hb_yon_k', 'Yön bulma', [g('yon_y', 'Yazılı soru', factGen(YON, 'read'), 9), g('yon_s', 'Sesli şık', factGen(YON, 'audio'), 9), g('yon_d', 'Dinle ve seç', factGen(YON, 'listen'), 9)])
  ]),
  topic('hb_doga', '5. Doğa ve Çevre', 'teal', [
    kind('hb_dogal_k', 'Doğal - yapay', [g('dogal_sec', 'Doğal / yapay unsur seç', classGen(DOGAL, 'pick'), 24), g('dogal_dinle', 'Dinle → resimli şık', classGen(DOGAL, 'pickAud'), 16), g('dogal_hangi', 'Unsur hangi grupta?', classGen(DOGAL, 'which', { whichAsk: (x) => `"${x}" doğal mı, yapay mı?`, extra: ['canlı', 'hayvan'] }), 14), g('dogal_degil', 'Hangisi değildir?', classGen(DOGAL, 'not'), 14)]),
    kind('hb_geri_k', 'Geri dönüşüm', [g('geri_sec', 'Hangi atık hangi kutuya?', classGen(GERI, 'pick'), 18), g('geri_hangi', 'Atık hangi kutuya atılır?', classGen(GERI, 'which', { whichAsk: (x) => `"${x}" hangi geri dönüşüm kutusuna atılır?` }), 14)]),
    kind('hb_mevsim_k', 'Mevsimler', [g('mevsim_hangi', 'Olay hangi mevsimde?', classGen(MEVSIM, 'which', { whichAsk: (x) => `"${x}" hangi mevsimde olur?` }), 16), g('mevsim_ses', 'Mevsim (sesli şık)', classGen(MEVSIM, 'whichAud', { whichAsk: (x) => `"${x}" hangi mevsimde olur?` }), 14)]),
    kind('hb_cevre_k', 'Çevreyi koruma', [g('cevre_y', 'Yazılı soru', factGen(CEVRE, 'read'), 8), g('cevre_s', 'Sesli şık', factGen(CEVRE, 'audio'), 8), g('cevre_d', 'Dinle ve seç', factGen(CEVRE, 'listen'), 8)])
  ]),
  topic('hb_bilim', '6. Bilim, Teknoloji ve Sanat', 'violet', [
    kind('hb_arac_k', 'Ulaşım ve iletişim araçları', [g('ileti_sec', 'Ulaşım / iletişim aracı seç', classGen(ILETISIM, 'pick'), 20), g('ileti_dinle', 'Dinle → resimli şık', classGen(ILETISIM, 'pickAud'), 14), g('ileti_hangi', 'Araç hangi grupta?', classGen(ILETISIM, 'which', { extra: ['ev eşyası', 'okul eşyası'] }), 12), g('ileti_degil', 'Hangisi değildir?', classGen(ILETISIM, 'not'), 12)]),
    kind('hb_bilim_k', 'Bilim ve teknoloji', [g('icat', 'Buluşlar ve bilim insanları', icatQ, 7), g('tekno_y', 'Yazılı soru', factGen(TEKNO, 'read'), 8), g('tekno_d', 'Dinle ve seç', factGen(TEKNO, 'listen'), 8), g('tekno_s', 'Sesli şık', factGen(TEKNO, 'audio'), 8)])
  ])
];

export const HAYAT_BANK = makeSubjectBank({
  id: 'hb',
  title: 'hayat bilgisi (3. sınıf)',
  intro: '6 tema, toplam 1000 hazır soru. Resimli, yazılı ve sesli sorular karışıktır; dinleme sorularında soru, sesli şık sorularında şıklar telefonla okunur.',
  rootFolder: 'Hayat Bilgisi (3. Sınıf)',
  topics: HAYAT_TOPICS,
  total: 1000
});
