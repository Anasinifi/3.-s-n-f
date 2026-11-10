// ============================================================================
// --- PROBLEM ÇÖZME: öğretmenin 200 sorusu (100 "üçü de var", 100 "iki var bir yok") ---
// ============================================================================
// Cümleler olduğu gibi kullanılır. Şıklar aynı nesnenin çizimleri:
//  • üçü de var  : doğru şıkta 3 özellik var; her yanlış şıkta bir özellik eksik
//  • iki var bir yok: doğru şıkta 2 özellik var, 3.sü yok; yanlışlarda ya 3.sü de var ya da istenen bir özellik eksik
// "~" ile başlayan özellik her şıkta aynı kalır (çizimle ayırt edilemeyecek kadar ince olanlar).
import { card } from '../art';
import { makeRng, shuffle } from '../helpers';
import { C, DRAW } from './pdraw';
import { DRAW2 } from './pdraw2';

const ALL = { ...DRAW, ...DRAW2 };
export const USER_PROBLEMS = [
  { t: "Kırmızı renkli olan, önünde cebi olan, arkasında kapüşonu olan montu bul.", o: 'mont', p: {}, y: ["kirmizi", "cep", "kapuson"] },
  { t: "Kısa kollu olan, yakası olan, üstünde yıldızı olan tişörtü bul.", o: 'ust', p: {renk:C.yel}, y: ["kisakol", "yaka", "yildiz"] },
  { t: "Uzun kollu olan, düğmeleri olan, göğsünde cebi olan gömleği bul.", o: 'ust', p: {renk:C.blue}, y: ["uzunkol", "dugme", "cep"] },
  { t: "Pembe renkli olan, fırfırları olan, çiçek deseni olan elbiseyi bul.", o: 'elbise', p: {}, y: ["pembe", "firfir", "cicek"] },
  { t: "Mavi renkli olan, cepleri olan, dizinde yaması olan pantolonu bul.", o: 'pantolon', p: {}, y: ["mavi", "cep", "yama"] },
  { t: "Bağcıkları olan, kalın tabanı olan, yan tarafında yıldızı olan ayakkabıyı bul.", o: 'ayakkabi', p: {}, y: ["bagcik", "kalintaban", "yildiz"] },
  { t: "Ucunda püskülleri olan, kalın örgüsü olan, kırmızı çizgileri olan atkıyı bul.", o: 'atki', p: {}, y: ["puskul", "kalin", "cizgi"] },
  { t: "Tepesinde ponponu olan, kulaklık kısımları olan, bağlama ipleri olan bereyi bul.", o: 'bere', p: {}, y: ["ponpon", "kulaklik", "ip"] },
  { t: "Topuğu olan, önünde fiyonku olan, parlak sarı renkli olan ayakkabıyı bul.", o: 'ayakkabi2', p: {}, y: ["topuk", "fiyonk", "sari"] },
  { t: "Beş parmağı olan, uzun bilekliği olan, üstünde düğmesi olan eldiveni bul.", o: 'eldiven', p: {}, y: ["besparmak", "bileklik", "dugme"] },
  { t: "Dört bacağı olan, uzun kuyruğu olan, sivri kulakları olan kediyi bul.", o: 'dort', p: {tur:'kedi'}, y: ["dortbacak", "uzunkuyruk", "sivrikulak"] },
  { t: "İki kanadı olan, sivri gagası olan, kısa kuyruğu olan kuşu bul.", o: 'kus', p: {}, y: ["ikikanat", "gaga", "kisakuyruk"] },
  { t: "Büyük kulakları olan, uzun hortumu olan, dört kalın bacağı olan fili bul.", o: 'dort', p: {tur:'fil'}, y: ["buyukkulak", "hortum", "dortbacak"] },
  { t: "Uzun boynu olan, sarı üstüne kahverengi benekleri olan, dört bacağı olan zürafayı bul.", o: 'dort', p: {tur:'zurafa'}, y: ["uzunboyun", "benek", "dortbacak"] },
  { t: "Yüzgeçleri olan, gülen yüzü olan, renkli pulları olan balığı bul.", o: 'balik', p: {}, y: ["yuzgec", "gulen", "pul"] },
  { t: "İki uzun kulağı olan, pofuduk kuyruğu olan, elinde havucu olan tavşanı bul.", o: 'tavsan', p: {}, y: ["uzunkulak", "ponpon", "havuc"] },
  { t: "Boynunda yelesi olan, uzun kuyruğu olan, dört bacağı olan aslanı bul.", o: 'dort', p: {tur:'aslan'}, y: ["yele", "uzunkuyruk", "dortbacak"] },
  { t: "Renkli kanatları olan, iki anteni olan, üstünde siyah benekleri olan kelebeği bul.", o: 'kelebek', p: {}, y: ["renkli", "anten", "benek"] },
  { t: "Sırtında sert kabuğu olan, dört kısa bacağı olan, küçük kafası olan kaplumbağayı bul.", o: 'kaplumbaga', p: {}, y: ["kabuk", "dortbacak", "kucukkafa"] },
  { t: "Siyah beyaz çizgileri olan, dört bacağı olan, uzun kuyruğu olan zebrayı bul.", o: 'dort', p: {tur:'zebra'}, y: ["cizgi", "dortbacak", "uzunkuyruk"] },
  { t: "Dört tekerleği olan, cam pencereleri olan, iki kapısı olan arabayı bul.", o: 'araba', p: {}, y: ["dortteker", "pencere", "ikikapi"] },
  { t: "İki tekerleği olan, direksiyonu olan, önünde sepeti olan bisikleti bul.", o: 'bisiklet', p: {}, y: ["ikiteker", "gidon", "sepet"] },
  { t: "İki kanadı olan, önünde pervanesi olan, tekerlekleri olan uçağı bul.", o: 'ucak', p: {}, y: ["ikikanat", "pervane", "teker"] },
  { t: "Tüten bacası olan, üç vagonu olan, tekerlekleri olan treni bul.", o: 'tren', p: {}, y: ["baca", "ucvagon", "teker"] },
  { t: "Üçgen yelkeni olan, ahşap gövdesi olan, ucunda küçük bayrağı olan kayığı bul.", o: 'kayik', p: {}, y: ["ucgenyelken", "ahsap", "bayrak"] },
  { t: "Tepesinde pervanesi olan, arka kuyruğu olan, yuvarlak pencereleri olan helikopteri bul.", o: 'helikopter', p: {}, y: ["pervane", "kuyruk", "yuvarlak"] },
  { t: "İki katlı olan, dört tekerleği olan, açık kapıları olan otobüsü bul.", o: 'otobus', p: {}, y: ["ikikat", "dortteker", "acikkapi"] },
  { t: "Arkasında büyük kasası olan, kalın tekerlekleri olan, yuvarlak ön farları olan kamyonu bul.", o: 'kamyon', p: {}, y: ["kasa", "kalinteker", "yuvarlakfar"] },
  { t: "Tepesinde siren lambası olan, yan tarafında kırmızı artısı olan, arka kapıları olan ambulansı bul.", o: 'ambulans', p: {}, y: ["siren", "arti", "arkakapi"] },
  { t: "Arkasında ateşi olan, ucu sivri olan, yuvarlak camı olan roketi bul.", o: 'roket', p: {}, y: ["ates", "sivri", "pencere"] },
  { t: "Tam yuvarlak olan, kırmızı kabuklu olan, kahverengi sapı olan elmayı bul.", o: 'elma', p: {}, y: ["yuvarlak", "kirmizi", "sap"] },
  { t: "Uzun şekli olan, sarı kabuklu olan, tepesinde sapı olan muzu bul.", o: 'muz', p: {}, y: ["uzun", "sari", "sap"] },
  { t: "Turuncu renkli olan, uzun sivri şekli olan, yeşil yaprakları olan havucu bul.", o: 'havuc', p: {}, y: ["turuncu", "sivri", "yaprak"] },
  { t: "İçi kırmızı olan, siyah çekirdekleri olan, yeşil çizgili kabuğu olan karpuzu bul.", o: 'karpuz', p: {}, y: ["kirmiziic", "cekirdek", "cizgi"] },
  { t: "Yuvarlak şekli olan, dışı pürüzlü olan, turuncu renkli olan portakalı bul.", o: 'portakal', p: {}, y: ["yuvarlak", "puruzlu", "turuncu"] },
  { t: "Kırmızı renkli olan, üstünde yeşil yaprağı olan, siyah noktaları olan çileği bul.", o: 'cilek', p: {}, y: ["kirmizi", "yaprak", "nokta"] },
  { t: "Salkımı olan, yuvarlak mor taneleri olan, dalında yeşil yaprağı olan üzümü bul.", o: 'uzum', p: {}, y: ["salkim", "mor", "yaprak"] },
  { t: "Kırmızı şapkası olan, kalın sapı olan, üstünde beyaz benekleri olan mantarı bul.", o: 'mantar', p: {}, y: ["kirmizi", "kalinsap", "benek"] },
  { t: "Uzun şekli olan, yeşil renkli olan, üstünde minik pütürleri olan salatalığı bul.", o: 'salatalik', p: {}, y: ["uzun", "yesil", "putur"] },
  { t: "İki yuvarlak meyvesi olan, birleşik yeşil sapı olan, tek yaprağı olan kirazı bul.", o: 'kiraz', p: {}, y: ["ikikiraz", "sap", "yaprak"] },
  { t: "Tam yuvarlak olan, kırmızı renkli olan, üstünde sarı yıldızı olan topu bul.", o: 'top', p: {}, y: ["yuvarlak", "kirmizi", "yildiz"] },
  { t: "İki siyah gözü olan, boynunda kurdelesi olan, yuvarlak kulakları olan oyuncak ayıyı bul.", o: 'ayi', p: {}, y: ["goz", "kurdele", "yuvarlakkulak"] },
  { t: "Kare şeklinde olan, ahşap rengi olan, üstünde A harfi olan bloğu bul.", o: 'blok', p: {}, y: ["kare", "ahsap", "harfA"] },
  { t: "Dört tekerleği olan, önünde çekme ipi olan, gülen yüzü olan oyuncak arabayı bul.", o: 'oyuncakaraba', p: {}, y: ["dortteker", "ip", "gulen"] },
  { t: "Üçgen çatısı olan, açılan kapısı olan, iki kare penceresi olan oyuncak evi bul.", o: 'ev', p: {}, y: ["cati", "kapi", "ikipencere"] },
  { t: "Elmas şeklinde olan, uzun ipi olan, kuyruğunda renkli fiyonkları olan uçurtmayı bul.", o: 'ucurtma', p: {}, y: ["elmas", "ip", "fiyonk"] },
  { t: "Kumaş yelkeni olan, ahşap güvertesi olan, küçük çapası olan oyuncak gemiyi bul.", o: 'gemi', p: {}, y: ["kumas", "ahsap", "capa"] },
  { t: "İki kolu olan, kafasında anteni olan, göğsünde renkli düğmeleri olan oyuncak robotu bul.", o: 'robot', p: {}, y: ["ikikol", "anten", "dugme"] },
  { t: "Yuvarlak şekli olan, ortasında deliği olan, uzun ipi olan yoyoyu bul.", o: 'yoyo', p: {}, y: ["yuvarlak", "delik", "ip"] },
  { t: "Ortasında çubuğu olan, üst üste dizili renkli halkaları olan, tepesinde topu olan oyuncak kuleyi bul.", o: 'kule', p: {}, y: ["cubuk", "renkli", "top"] },
  { t: "Dört ahşap bacağı olan, sırt dayanma yeri olan, yumuşak minderi olan sandalyeyi bul.", o: 'sandalye', p: {}, y: ["dortbacak", "sirt", "minder"] },
  { t: "Yan tarafında kulpu olan, içi boş olan, üstünde çiçek deseni olan kupayı bul.", o: 'kupa', p: {}, y: ["kulp", "bos", "cicek"] },
  { t: "Dikdörtgen ekranı olan, yanında kumandası olan, iki ayaklı olan televizyonu bul.", o: 'tv', p: {}, y: ["ekran", "kumanda", "ikiayak"] },
  { t: "Üç çekmecesi olan, yuvarlak kulpları olan, dört kısa bacağı olan dolabı bul.", o: 'dolap', p: {}, y: ["uccekmece", "yuvarlakkulp", "kisabacak"] },
  { t: "Kumaş şapkası olan, ince gövdesi olan, zincirli açma düğmesi olan masa lambasını bul.", o: 'lamba', p: {}, y: ["kumas", "ince", "zincir"] },
  { t: "İki yumuşak yastığı olan, kalın battaniyesi olan, dört bacağı olan yatağı bul.", o: 'yatak', p: {}, y: ["ikiyastik", "battaniye", "dortbacak"] },
  { t: "İki büyük kapısı olan, uzun metal kulpları olan, üstünde resimli magnetleri olan buzdolabını bul.", o: 'buzdolabi', p: {}, y: ["ikikapi", "kulp", "magnet"] },
  { t: "Kare şeklinde olan, kenarlarında saçakları olan, üstünde zikzak deseni olan halıyı bul.", o: 'hali', p: {}, y: ["kare", "sacak", "desen"] },
  { t: "Yuvarlak camı olan, renkli ahşap çerçevesi olan, asma ipi olan aynayı bul.", o: 'ayna', p: {}, y: ["yuvarlak", "renkli", "ip"] },
  { t: "Camdan kutusu olan, içinde suyu olan, içinde turuncu balığı olan akvaryumu bul.", o: 'akvaryum', p: {}, y: ["cam", "su", "balik"] },
  { t: "Gülen yüzü olan, sarı renkli olan, etrafında uzun ışınları olan güneşi bul.", o: 'gunes', p: {}, y: ["gulen", "sari", "isin"] },
  { t: "Pofuduk görünüşlü olan, beyaz renkli olan, altından mavi damlalar düşen bulutu bul.", o: 'bulut', p: {}, y: ["pofuduk", "beyaz", "damla"] },
  { t: "Beş sivri köşesi olan, içi sarı boyalı olan, parlayan çizgileri olan yıldızı bul.", o: 'yildiz', p: {}, y: ["bes", "sari", "parilti"] },
  { t: "Yarım ay şeklinde olan, beyaz renkli olan, üstünde yuvarlak delikleri olan ayı bul.", o: 'ay', p: {}, y: ["hilal", "beyaz", "delik"] },
  { t: "Yarım daire şeklinde olan, yedi farklı rengi olan, iki ucunda beyaz bulut olan gökkuşağını bul.", o: 'gokkusagi', p: {}, y: ["yarim", "yedirenk", "bulut"] },
  { t: "Altı köşesi olan, buzdan yapılan, dantel gibi ince çizgileri olan kar tanesini bul.", o: 'kartanesi', p: {}, y: ["alti", "buz", "dantel"] },
  { t: "Damla şeklinde olan, içi mavi renkli olan, üstünde gülen yüzü olan yağmur damlasını bul.", o: 'damla', p: {}, y: ["damla", "mavi", "gulen"] },
  { t: "Uzun kahverengi gövdesi olan, kalın yeşil yaprakları olan, dalında kırmızı elması olan ağacı bul.", o: 'agac', p: {}, y: ["govde", "yaprak", "elma"] },
  { t: "Ortası sarı olan, uzun beyaz yaprakları olan, ince yeşil sapı olan papatyayı bul.", o: 'papatya', p: {}, y: ["sariorta", "beyazyaprak", "sap"] },
  { t: "Yeşil renkli olan, üç tane kalp şeklinde yaprağı olan, ince yeşil sapı olan yonca yaprağını bul.", o: 'yonca', p: {}, y: ["yesil", "ucyaprak", "sap"] },
  { t: "Arkasında kırmızı silgisi olan, ahşap gövdesi olan, ucu siyah renkli olan kurşun kalemi bul.", o: 'kalem', p: {}, y: ["silgi", "ahsap", "siyahuc"] },
  { t: "İki kapağı olan, içi beyaz sayfalı olan, üstünde yıldız resmi olan defteri bul.", o: 'defter', p: {}, y: ["ikikapak", "beyazsayfa", "yildiz"] },
  { t: "İki yuvarlak tutma yeri olan, ortasında vidası olan, metal ağızları olan makası bul.", o: 'makas', p: {}, y: ["yuvarlaksap", "vida", "metal"] },
  { t: "Açma fermuarı olan, iki kol askısı olan, önünde küçük cebi olan okul çantasını bul.", o: 'canta', p: {}, y: ["fermuar", "ikiaski", "oncep"] },
  { t: "Şişesi olan, kapağında fırçası olan, üstünde marka etiketi olan sıvı yapıştırıcıyı bul.", o: 'yapistirici', p: {}, y: ["sise", "firca", "etiket"] },
  { t: "Uzun ince şekli olan, üstünde siyah sayıları olan, plastikten yapılan cetveli bul.", o: 'cetvel', p: {}, y: ["uzun", "sayi", "plastik"] },
  { t: "Kırmızı renkli olan, dikdörtgen şeklinde olan, yumuşak plastikten yapılan silgiyi bul.", o: 'silgi', p: {}, y: ["kirmizi", "dikdortgen", "~yumusak"] },
  { t: "Fermuarlı kapağı olan, kutu şeklinde olan, içinde renkli kalemleri olan kalemliği bul.", o: 'kalemlik', p: {}, y: ["fermuar", "kutu", "kalem"] },
  { t: "İnce ahşap sapı olan, ucunda yumuşak tüyleri olan, sapında metal kısmı olan fırçayı bul.", o: 'firca', p: {}, y: ["ahsap", "tuy", "metal"] },
  { t: "İçinde yuvarlak boyaları olan, dikdörtgen kutusu olan, ortasında fırça yeri olan sulu boyayı bul.", o: 'suluboya', p: {}, y: ["yuvarlakboya", "dkutu", "fircayeri"] },
  { t: "Dört kenarı aynı uzunlukta olan, içi mavi renkli olan, kenar çizgileri siyah olan kareyi bul.", o: 'sekil', p: {sk:'kare',renk:C.blue}, y: ["kare", "~mavi", "siyahkenar"] },
  { t: "Tamamen yuvarlak olan, içi kırmızı renkli olan, etrafında kalın çizgisi olan daireyi bul.", o: 'sekil', p: {sk:'daire',renk:C.red}, y: ["yuvarlak", "~kirmizi", "kalinkenar"] },
  { t: "Üç tane köşesi olan, çatıya benzeyen, içi yeşil renkli olan üçgeni bul.", o: 'sekil', p: {sk:'ucgen',renk:C.green}, y: ["ucgen", "cati", "~yesil"] },
  { t: "İki uzun kenarı olan, iki kısa kenarı olan, içi sarı renkli olan dikdörtgeni bul.", o: 'sekil', p: {sk:'dikdortgen',renk:C.yel}, y: ["dik", "~dik2", "sari"] },
  { t: "Altı sivri olan, üstü yuvarlak olan, içi pembe renkli olan kalbi bul.", o: 'sekil', p: {sk:'kalp',renk:C.pink}, y: ["kalp", "~kalp2", "pembe"] },
  { t: "Beş köşesi olan, içi sarı boyalı olan, etrafında siyah çerçevesi olan yıldızı bul.", o: 'sekil', p: {sk:'yildiz',renk:C.yel}, y: ["bes", "sari", "siyahkenar"] },
  { t: "Yumurtaya benzeyen, yukarıdan basık olan, turuncu renkli olan oval şeklini bul.", o: 'sekil', p: {sk:'oval',renk:C.ora}, y: ["yumurta", "basik", "turuncu"] },
  { t: "Gökyüzündeki aya benzeyen, muz gibi kıvrık olan, lacivert renkli olan hilali bul.", o: 'sekil', p: {sk:'hilal',renk:C.navy}, y: ["hilal", "kivrik", "lacivert"] },
  { t: "Dört tane köşesi olan, içi mor renkli olan, üstünde gülen yüz çizili olan kareyi bul.", o: 'sekil', p: {sk:'kare',renk:C.pur}, y: ["dortkose", "mor", "gulen"] },
  { t: "Tamamen yuvarlak olan, tekerleğe benzeyen, içi boyanmamış beyaz olan daireyi bul.", o: 'sekil', p: {sk:'daire',renk:'#fff'}, y: ["yuvarlak", "teker", "~beyaz"] },
  { t: "İki katlı olan, üstünde pembe kreması olan, tepesinde bir tane mumu olan pastayı bul.", o: 'pasta', p: {}, y: ["ikikat", "pembe", "mum"] },
  { t: "Üçgen şeklinde olan, üstünde erimiş peyniri olan, yuvarlak sucukları olan pizzayı bul.", o: 'pizza', p: {}, y: ["ucgen", "peynir", "sucuk"] },
  { t: "Üçgen külahı olan, üstünde iki top dondurması olan, en tepesinde çileği olan dondurmayı bul.", o: 'dondurma', p: {}, y: ["kulah", "ikitop", "cilek"] },
  { t: "Ortası delik olan, üstünde pembe sosu olan, küçük renkli şekerleri olan donutu bul.", o: 'donut', p: {}, y: ["delik", "pembe", "seker"] },
  { t: "Yuvarlak iki ekmeği olan, ortasında köftesi olan, üstünde susamları olan hamburgeri bul.", o: 'hamburger', p: {}, y: ["ekmek", "kofte", "susam"] },
  { t: "İnce uzun çubuklar şeklinde olan, kırmızı kutunun içinde olan, sarı renkli olan patates kızartmasını bul.", o: 'patates', p: {}, y: ["cubuk", "kutu", "sari"] },
  { t: "Dikdörtgen şeklinde olan, üstünde küçük kareleri olan, kahverengi renkli olan çikolatayı bul.", o: 'cikolata', p: {}, y: ["dikdortgen", "kare", "kahve"] },
  { t: "Derin bir kasesi olan, içinde sıcak suyu olan, içinde uzun çubukları olan çorbayı bul.", o: 'corba', p: {}, y: ["kase", "sicak", "cubuk"] },
  { t: "Saplı bardağı olan, içinde beyaz sütü olan, üstünde baloncuklu köpükleri olan içeceği bul.", o: 'sut', p: {}, y: ["kulp", "sut", "kopuk"] },
  { t: "Uzun çubuğu olan, yuvarlak şeker kısmı olan, kırmızı beyaz çizgileri olan lolipopu bul.", o: 'lolipop', p: {}, y: ["cubuk", "yuvarlak", "cizgi"] },
  { t: "Kanatları olan, gagası olan ama kuyruğu olmayan kuşu bul.", o: 'kus', p: {}, y: ["kanat", "gaga"], n: "kuyruk" },
  { t: "Bıyıkları olan, sivri kulakları olan ama tasması olmayan kediyi bul.", o: 'dort', p: {tur:'kedi'}, y: ["biyik", "sivrikulak"], n: "tasma" },
  { t: "Benekleri olan, dört bacağı olan ama boynuzu olmayan ineği bul.", o: 'dort', p: {tur:'inek'}, y: ["benek", "dortbacak"], n: "boynuz" },
  { t: "Uzun hortumu olan, büyük kulakları olan ama kuyruğu olmayan fili bul.", o: 'dort', p: {tur:'fil'}, y: ["hortum", "buyukkulak"], n: "kuyruk" },
  { t: "Kabuğu olan, dört bacağı olan ama kafası dışarıda olmayan kaplumbağayı bul.", o: 'kaplumbaga', p: {}, y: ["kabuk", "dortbacak"], n: "kafa" },
  { t: "Uzun boynu olan, benekleri olan ama kulakları olmayan zürafayı bul.", o: 'dort', p: {tur:'zurafa'}, y: ["uzunboyun", "benek"], n: "kulak" },
  { t: "Yelesi olan, dört bacağı olan ama dişleri görünmeyen aslanı bul.", o: 'dort', p: {tur:'aslan'}, y: ["yele", "dortbacak"], n: "dis" },
  { t: "Yüzgeçleri olan, gülen yüzü olan ama pulları olmayan balığı bul.", o: 'balik', p: {}, y: ["yuzgec", "gulen"], n: "pul" },
  { t: "Uzun kulakları olan, pofuduk kuyruğu olan ama elinde havuç olmayan tavşanı bul.", o: 'tavsan', p: {}, y: ["uzunkulak", "ponpon"], n: "havuc" },
  { t: "İki kanadı olan, antenleri olan ama benekleri olmayan kelebeği bul.", o: 'kelebek', p: {}, y: ["kanat", "anten"], n: "benek" },
  { t: "Cebi olan, kısa kollu olan ama düğmesi olmayan tişörtü bul.", o: 'ust', p: {renk:C.green}, y: ["cep", "kisakol"], n: "dugme" },
  { t: "Fermuarı olan, kapüşonu olan ama cepleri olmayan montu bul.", o: 'mont', p: {}, y: ["fermuar", "kapuson"], n: "cep" },
  { t: "Bağcıkları olan, kalın tabanlı olan ama yıldız deseni olmayan ayakkabıyı bul.", o: 'ayakkabi', p: {}, y: ["bagcik", "kalintaban"], n: "yildiz" },
  { t: "İki paçası olan, dizinde yama olan ama kemeri olmayan pantolonu bul.", o: 'pantolon', p: {}, y: ["paca", "yama"], n: "kemer" },
  { t: "Ponponu olan, kıvrık kenarı olan ama üzerinde çizgileri olmayan bereyi bul.", o: 'bere', p: {}, y: ["ponpon", "kivrik"], n: "cizgi" },
  { t: "Uzun kollu olan, yakası olan ama önü açık olmayan gömleği bul.", o: 'ust', p: {renk:C.sky}, y: ["uzunkol", "yaka"], n: "acik" },
  { t: "Çiçek deseni olan, askılı olan ama fırfırı olmayan elbiseyi bul.", o: 'elbise', p: {pembe:true}, y: ["cicek", "askili"], n: "firfir" },
  { t: "Kalın örgülü olan, ucunda püskülü olan ama üzerinde çizgisi olmayan atkıyı bul.", o: 'atki', p: {}, y: ["kalin", "puskul"], n: "cizgi" },
  { t: "Topuğu olan, önünde fiyonku olan ama bağcığı olmayan terliği bul.", o: 'ayakkabi2', p: {sari:true}, y: ["topuk", "fiyonk"], n: "bagcik" },
  { t: "Beş parmaklı olan, bilekliği olan ama üstünde düğmesi olmayan eldiveni bul.", o: 'eldiven', p: {}, y: ["besparmak", "bileklik"], n: "dugme" },
  { t: "Yuvarlak olan, sapı olan ama yaprağı olmayan elmayı bul.", o: 'elma', p: {}, y: ["yuvarlak", "sap"], n: "yaprak" },
  { t: "Uzun olan, sarı kabuklu olan ama üzerinde kahverengi lekesi olmayan muzu bul.", o: 'muz', p: {}, y: ["uzun", "sari"], n: "leke" },
  { t: "Yeşil yaprakları olan, turuncu renkli olan ama üstünde çizgi olmayan havucu bul.", o: 'havuc', p: {}, y: ["yaprak", "turuncu"], n: "cizgi" },
  { t: "Salkımı olan, yuvarlak taneleri olan ama sapında yaprak olmayan üzümü bul.", o: 'uzum', p: {}, y: ["salkim", "yuvarlaktane"], n: "yaprak" },
  { t: "Dilimlenmiş olan, içinde siyah çekirdekleri olan ama yeşil kabuğu görünmeyen karpuzu bul.", o: 'karpuz', p: {}, y: ["dilim", "cekirdek"], n: "kabuk" },
  { t: "Şapkası olan, kalın sapı olan ama üstünde beyaz benekleri olmayan mantarı bul.", o: 'mantar', p: {}, y: ["sapka", "kalinsap"], n: "benek" },
  { t: "Tepesinde yeşil yaprakları olan, üzerinde siyah noktaları olan ama dilimlenmemiş çileği bul.", o: 'cilek', p: {}, y: ["yaprak", "nokta"], n: "dilim" },
  { t: "Yuvarlak olan, dışı pürüzlü olan ama dalı olmayan portakalı bul.", o: 'portakal', p: {}, y: ["yuvarlak", "puruzlu"], n: "dal" },
  { t: "İki kirazı olan, birleştiği sapı olan ama yeşil yaprağı olmayan kirazı bul.", o: 'kiraz', p: {}, y: ["ikikiraz", "sap"], n: "yaprak" },
  { t: "Uzun olan, yeşil renkli olan ama üstünde tırtıkları olmayan salatalığı bul.", o: 'salatalik', p: {}, y: ["uzun", "yesil"], n: "putur" },
  { t: "Dört tekerleği olan, pencereleri olan ama kapısı olmayan arabayı bul.", o: 'araba', p: {}, y: ["dortteker", "pencere"], n: "kapi" },
  { t: "İki tekerleği olan, direksiyonu olan ama sepeti olmayan bisikleti bul.", o: 'bisiklet', p: {}, y: ["ikiteker", "gidon"], n: "sepet" },
  { t: "Kasası olan, büyük tekerlekleri olan ama arkasında yük olmayan kamyonu bul.", o: 'kamyon', p: {}, y: ["kasa", "buyukteker"], n: "yuk" },
  { t: "İki kanadı olan, pencereleri olan ama pervanesi olmayan uçağı bul.", o: 'ucak', p: {}, y: ["kanat", "pencere"], n: "pervane" },
  { t: "Üçgen yelkeni olan, ahşap gövdesi olan ama direksiyonu olmayan kayığı bul.", o: 'kayik', p: {}, y: ["ucgenyelken", "ahsap"], n: "dumen" },
  { t: "Bacası olan, üç vagonu olan ama tekerlekleri görünmeyen treni bul.", o: 'tren', p: {}, y: ["baca", "ucvagon"], n: "teker" },
  { t: "Pervanesi olan, ayakları olan ama pencereleri olmayan helikopteri bul.", o: 'helikopter', p: {}, y: ["pervane", "ayak"], n: "pencere" },
  { t: "İki katlı olan, dört tekerleği olan ama kapısı açık olmayan otobüsü bul.", o: 'otobus', p: {}, y: ["ikikat", "dortteker"], n: "acikkapi" },
  { t: "Siren lambası olan, kırmızı artısı olan ama farları yanmayan ambulansı bul.", o: 'ambulans', p: {}, y: ["siren", "arti"], n: "faryanik" },
  { t: "Altında ateşi olan, ucu sivri olan ama pencereleri olmayan roketi bul.", o: 'roket', p: {}, y: ["ates", "sivri"], n: "pencere" },
  { t: "Yuvarlak olan, üstünde yıldız olan ama çizgileri olmayan topu bul.", o: 'top', p: {}, y: ["yuvarlak", "yildiz"], n: "cizgi" },
  { t: "İki gözü olan, kurdelesi olan ama şapkası olmayan oyuncak ayıyı bul.", o: 'ayi', p: {}, y: ["goz", "kurdele"], n: "sapka" },
  { t: "Dört tekerleği olan, çekme ipi olan ama üstünde şoförü olmayan oyuncak arabayı bul.", o: 'oyuncakaraba', p: {}, y: ["dortteker", "ip"], n: "sofor" },
  { t: "Kare şeklinde olan, üstünde A harfi olan ama farklı renkleri olmayan tahta bloğu bul.", o: 'blok', p: {}, y: ["kare", "harfA"], n: "renkli" },
  { t: "Çatısı olan, bir penceresi olan ama kapısı olmayan oyuncak evi bul.", o: 'ev', p: {}, y: ["cati", "birpencere"], n: "kapi" },
  { t: "Uzun kuyruğu olan, ipi olan ama üstünde fiyonk olmayan uçurtmayı bul.", o: 'ucurtma', p: {}, y: ["uzunkuyruk", "ip"], n: "fiyonk" },
  { t: "İki kolu olan, kafasında anteni olan ama ayakları olmayan oyuncak robotu bul.", o: 'robot', p: {}, y: ["ikikol", "anten"], n: "ayak" },
  { t: "Yelkeni olan, küçük bayrağı olan ama çapası olmayan oyuncak gemiyi bul.", o: 'gemi', p: {}, y: ["yelken", "bayrak"], n: "capa" },
  { t: "Üst üste dizilmiş olan, renkli halkaları olan ama en üstünde top olmayan kuleyi bul.", o: 'kule', p: {}, y: ["dizili", "renkli"], n: "top" },
  { t: "Yuvarlak olan, ortasında deliği olan ama sarmal deseni olmayan yoyoyu bul.", o: 'yoyo', p: {}, y: ["yuvarlak", "delik"], n: "sarmal" },
  { t: "Dört bacağı olan, sırt dayanma yeri olan ama minderleri olmayan sandalyeyi bul.", o: 'sandalye', p: {}, y: ["dortbacak", "sirt"], n: "minder" },
  { t: "Çekmeceleri olan, yuvarlak kulpları olan ama üstünde ayna olmayan dolabı bul.", o: 'dolap', p: {}, y: ["cekmece", "yuvarlakkulp"], n: "ayna" },
  { t: "Ekranı olan, iki anteni olan ama tuşları olmayan televizyonu bul.", o: 'tv', p: {}, y: ["ekran", "anten"], n: "tus" },
  { t: "Kulpu olan, üstünde çiçek deseni olan ama içinde çay olmayan kupayı bul.", o: 'kupa', p: {}, y: ["kulp", "cicek"], n: "cay" },
  { t: "Şapkası olan, ince gövdesi olan ama açma düğmesi olmayan gece lambasını bul.", o: 'lamba', p: {}, y: ["sapka", "ince"], n: "dugme" },
  { t: "İki yastığı olan, dört bacağı olan ama üstünde battaniye olmayan yatağı bul.", o: 'yatak', p: {}, y: ["ikiyastik", "dortbacak"], n: "battaniye" },
  { t: "Kare şeklinde olan, kenarları püsküllü olan ama üstünde deseni olmayan halıyı bul.", o: 'hali', p: {}, y: ["kare", "sacak"], n: "desen" },
  { t: "İki kapısı olan, büyük bir kulpu olan ama üstünde resim olmayan buzdolabını bul.", o: 'buzdolabi', p: {}, y: ["ikikapi", "kulp"], n: "magnet" },
  { t: "Yuvarlak camı olan, ahşap çerçevesi olan ama asma ipi olmayan aynayı bul.", o: 'ayna', p: {}, y: ["yuvarlak", "ahsap"], n: "ip" },
  { t: "İçinde su olan, içinde balık yüzen ama dibinde taş olmayan akvaryumu bul.", o: 'akvaryum', p: {}, y: ["su", "balik"], n: "tas" },
  { t: "Gülen yüzü olan, etrafında ışınları olan ama gözlüğü olmayan güneşi bul.", o: 'gunes', p: {}, y: ["gulen", "isin"], n: "gozluk" },
  { t: "Pofuduk olan, mavi renkli olan ama altından yağmur yağmayan bulutu bul.", o: 'bulut', p: {}, y: ["pofuduk", "mavi"], n: "damla" },
  { t: "Beş köşesi olan, içi sarı boyalı olan ama arkasında kuyruğu olmayan yıldızı bul.", o: 'yildiz', p: {}, y: ["bes", "sari"], n: "kuyruk" },
  { t: "Yarım ay şeklinde olan, üstünde delikleri olan ama yanında yıldız olmayan ayı bul.", o: 'ay', p: {}, y: ["hilal", "delik"], n: "yildiz" },
  { t: "Renkleri olan, yarım daire şeklinde olan ama ucunda bulut olmayan gökkuşağını bul.", o: 'gokkusagi', p: {}, y: ["renk", "yarim"], n: "bulut" },
  { t: "Altı köşesi olan, beyaz renkli olan ama etrafında çizgileri olmayan kar tanesini bul.", o: 'kartanesi', p: {}, y: ["alti", "beyaz"], n: "parilti" },
  { t: "Damla şeklinde olan, mavi renkli olan ama gülen yüzü olmayan yağmur damlasını bul.", o: 'damla', p: {}, y: ["damla", "mavi"], n: "gulen" },
  { t: "Zikzak çizen, sarı renkli olan ama etrafında bulut olmayan şimşeği bul.", o: 'simsek', p: {}, y: ["zikzak", "sari"], n: "bulut" },
  { t: "Yuvarlak olan, etrafında büyük bir halkası olan ama üstünde benekleri olmayan gezegeni bul.", o: 'gezegen', p: {}, y: ["yuvarlak", "halka"], n: "benek" },
  { t: "Arkasında ateşi olan, yuvarlak kafası olan ama etrafında yıldız olmayan kuyruklu yıldızı bul.", o: 'kuyrukluyildiz', p: {}, y: ["ates", "yuvarlak"], n: "yildiz" },
  { t: "Dört kenarı aynı olan, içi kırmızı olan ama etrafında kalın çizgisi olmayan kareyi bul.", o: 'sekil', p: {sk:'kare',renk:C.red}, y: ["kare", "~kirmizi"], n: "kalinkenar" },
  { t: "Yuvarlak olan, içi mavi olan ama ortasında nokta olmayan daireyi bul.", o: 'sekil', p: {sk:'daire',renk:C.blue}, y: ["yuvarlak", "~mavi"], n: "nokta" },
  { t: "Üç köşesi olan, içi sarı olan ama gülen yüzü olmayan üçgeni bul.", o: 'sekil', p: {sk:'ucgen',renk:C.yel}, y: ["ucgen", "~sari"], n: "gulen" },
  { t: "İki uzun kenarı olan, iki kısa kenarı olan ama içi boş olmayan dikdörtgeni bul.", o: 'sekil', p: {sk:'dikdortgen',renk:C.ora}, y: ["dik", "~dik2"], n: "bos" },
  { t: "Kalp şeklinde olan, içi pembe olan ama ortasında ok olmayan kalbi bul.", o: 'sekil', p: {sk:'kalp',renk:C.pink}, y: ["kalp", "~pembe"], n: "ok" },
  { t: "Beş köşesi olan, kenarları kırmızı olan ama içi boyalı olmayan yıldızı bul.", o: 'sekil', p: {sk:'yildiz',renk:C.yel}, y: ["bes", "kirmizikenar"], n: "boyali" },
  { t: "Yumurta şeklinde olan, yeşil renkli olan ama üstünde benekleri olmayan ovali bul.", o: 'sekil', p: {sk:'oval',renk:C.green}, y: ["yumurta", "~yesil"], n: "benek" },
  { t: "Gökyüzündeki aya benzeyen, sarı renkli olan ama gözleri olmayan hilali bul.", o: 'sekil', p: {sk:'hilal',renk:C.yel}, y: ["hilal", "~sari"], n: "goz" },
  { t: "Çatıya benzeyen, üç köşesi olan ama bacası olmayan üçgeni bul.", o: 'sekil', p: {sk:'ucgen',renk:C.green}, y: ["cati", "ucgen"], n: "baca" },
  { t: "Tekerleğe benzeyen, yuvarlak olan ama içinde çizgileri olmayan daireyi bul.", o: 'sekil', p: {sk:'daire',renk:'#fff'}, y: ["teker", "yuvarlak"], n: "cizgi" },
  { t: "Yeşil yaprakları olan, kırmızı yaprakları olan ama dikenleri olmayan gülü bul.", o: 'gul', p: {}, y: ["yesilyaprak", "kirmizi"], n: "diken" },
  { t: "Uzun kahverengi gövdesi olan, yeşil yaprakları olan ama üstünde meyvesi olmayan ağacı bul.", o: 'agac', p: {}, y: ["govde", "yaprak"], n: "elma" },
  { t: "Ortası sarı olan, beyaz yaprakları olan ama üstünde uğur böceği olmayan papatyayı bul.", o: 'papatya', p: {}, y: ["sariorta", "beyazyaprak"], n: "ugur" },
  { t: "Üç yaprağı olan, yeşil renkli olan ama sapı olmayan yonca yaprağını bul.", o: 'yonca', p: {}, y: ["ucyaprak", "yesil"], n: "sap" },
  { t: "Uzun sapı olan, turuncu renkli olan ama yaprakları açmamış lale çiçeğini bul.", o: 'lale', p: {}, y: ["uzunsap", "turuncu"], n: "acik" },
  { t: "İçi kırmızı olan, yeşil kabuğu olan ama siyah çekirdekleri olmayan karpuz dilimini bul.", o: 'karpuz', p: {}, y: ["kirmiziic", "kabuk"], n: "cekirdek" },
  { t: "Dört yaprağı olan, ortasında çizgisi olan ama kenarları tırtıklı olmayan yeşil yaprağı bul.", o: 'yaprak', p: {}, y: ["dort", "cizgi"], n: "tirtik" },
  { t: "Sapı olan, turuncu renkli olan ama üstünde yüz çizili olmayan balkabağını bul.", o: 'balkabagi', p: {}, y: ["sap", "turuncu"], n: "yuz" },
  { t: "Etrafı dikenli olan, yeşil gövdeli olan ama üstünde çiçeği olmayan kaktüsü bul.", o: 'kaktus', p: {}, y: ["diken", "yesil"], n: "cicek" },
  { t: "Toprak kabı olan, içinde yeşil bitkisi olan ama üstünde çiçek açmamış saksıyı bul.", o: 'saksi', p: {}, y: ["toprak", "bitki"], n: "cicek" },
  { t: "Ucu sivri olan, arkasında silgisi olan ama çizgili deseni olmayan kurşun kalemi bul.", o: 'kalem', p: {}, y: ["sivri", "silgi"], n: "cizgi" },
  { t: "İki kapağı olan, ortasında sayfaları olan ama üstünde yazı olmayan defteri bul.", o: 'defter', p: {}, y: ["ikikapak", "sayfa"], n: "yazi" },
  { t: "İki sapı olan, keskin uçları olan ama plastik kabı olmayan makası bul.", o: 'makas', p: {}, y: ["yuvarlaksap", "vida"], n: "kilif" },
  { t: "Fermuarı olan, iki kol askısı olan ama yan cebi olmayan okul çantasını bul.", o: 'canta', p: {}, y: ["fermuar", "ikiaski"], n: "yancep" },
  { t: "Şişesi olan, kapağında fırçası olan ama üstünde etiketi olmayan yapıştırıcıyı bul.", o: 'yapistirici', p: {}, y: ["sise", "firca"], n: "etiket" },
  { t: "Üstünde numaralar olan, düz ve uzun olan ama ortası delik olmayan cetveli bul.", o: 'cetvel', p: {}, y: ["sayi", "uzun"], n: "delik" },
  { t: "Kırmızı renkli olan, dikdörtgen şeklinde olan ama üstünde kağıt tozu olmayan silgiyi bul.", o: 'silgi', p: {}, y: ["kirmizi", "dikdortgen"], n: "toz" },
  { t: "Kapağı olan, kutu şeklinde olan ama içinde boya kalemleri olmayan kalemliği bul.", o: 'kalemlik', p: {}, y: ["kapak", "kutu"], n: "kalem" },
  { t: "Ahşap sapı olan, ucunda tüyleri olan ama boyaya batırılmamış fırçayı bul.", o: 'firca', p: {}, y: ["ahsap", "tuy"], n: "boya" },
  { t: "Altı farklı rengi olan, yuvarlak kutuda olan ama ortasında fırçası olmayan sulu boyayı bul.", o: 'suluboya', p: {}, y: ["altirenk", "ykutu"], n: "firca" }
];
export const USER_PROBLEM_GROUPS = [
  { key: 'lpu3_kiyafet', type: '3', label: 'Kıyafetler', from: 0 },
  { key: 'lpu3_hayvan', type: '3', label: 'Hayvanlar', from: 10 },
  { key: 'lpu3_tasit', type: '3', label: 'Taşıtlar', from: 20 },
  { key: 'lpu3_meyve', type: '3', label: 'Meyve ve Sebzeler', from: 30 },
  { key: 'lpu3_oyuncak', type: '3', label: 'Oyuncaklar', from: 40 },
  { key: 'lpu3_ev', type: '3', label: 'Ev Eşyaları', from: 50 },
  { key: 'lpu3_gok', type: '3', label: 'Gökyüzü ve Doğa', from: 60 },
  { key: 'lpu3_okul', type: '3', label: 'Okul Eşyaları', from: 70 },
  { key: 'lpu3_sekil', type: '3', label: 'Temel Şekiller', from: 80 },
  { key: 'lpu3_yiyecek', type: '3', label: 'Yiyecekler', from: 90 },
  { key: 'lpu21_hayvan', type: '21', label: 'Hayvanlar', from: 100 },
  { key: 'lpu21_kiyafet', type: '21', label: 'Kıyafetler', from: 110 },
  { key: 'lpu21_meyve', type: '21', label: 'Meyve ve Sebzeler', from: 120 },
  { key: 'lpu21_tasit', type: '21', label: 'Taşıtlar', from: 130 },
  { key: 'lpu21_oyuncak', type: '21', label: 'Oyuncaklar', from: 140 },
  { key: 'lpu21_ev', type: '21', label: 'Ev Eşyaları', from: 150 },
  { key: 'lpu21_gok', type: '21', label: 'Gökyüzü ve Hava', from: 160 },
  { key: 'lpu21_sekil', type: '21', label: 'Temel Şekiller', from: 170 },
  { key: 'lpu21_bahce', type: '21', label: 'Bahçe ve Doğa', from: 180 },
  { key: 'lpu21_okul', type: '21', label: 'Okul Eşyaları', from: 190 }
];

const strip = (k) => k.replace(/^~/, '');
// --- Şık adı (toplu görsel yükleme ve şık listesi için): cümledeki özellikler var / yok ---
// "Kırmızı renkli olan, önünde cebi olan, arkasında kapüşonu olan montu bul." -> özellik ifadeleri + nesne
const NEG = [[/olmayan$/, 'olan'], [/görünmeyen$/, 'görünen'], [/yanmayan$/, 'yanan'], [/açmamış$/, 'açmış'], [/dilimlenmemiş$/, 'dilimlenmiş'], [/batırılmamış$/, 'batırılmış'], [/olmamış$/, 'olmuş']];
const flip = (ph) => { for (const [re, to] of NEG) if (re.test(ph)) return ph.replace(re, to); return ph.replace(/olan$/, 'olmayan'); };
const NOUN_END = /(olan|olmayan|görünmeyen|yanmayan|açmamış|dilimlenmemiş|batırılmamış|olmamış)\s+(.+)$/;
const parseSentence = (t) => {
  const body = t.replace(/\s*bul\.?\s*$/, '');
  const parts = body.split(/,\s*|\s+ama\s+/);
  const last = parts.pop(); const m = NOUN_END.exec(last);
  const phrases = [...parts, m ? last.slice(0, last.length - m[2].length).trim() : last];
  return { phrases: phrases.map(x => x.charAt(0).toLocaleLowerCase('tr-TR') + x.slice(1)), noun: m ? m[2] : '' };
};
// on: açık özellik anahtarları (sıra cümledekiyle aynı: y..., n)
const NOM = {'montu': 'mont', 'tişörtü': 'tişört', 'gömleği': 'gömlek', 'elbiseyi': 'elbise', 'pantolonu': 'pantolon', 'ayakkabıyı': 'ayakkabı', 'atkıyı': 'atkı', 'bereyi': 'bere', 'eldiveni': 'eldiven', 'kediyi': 'kedi', 'kuşu': 'kuş', 'fili': 'fil', 'zürafayı': 'zürafa', 'balığı': 'balık', 'tavşanı': 'tavşan', 'aslanı': 'aslan', 'kelebeği': 'kelebek', 'kaplumbağayı': 'kaplumbağa', 'zebrayı': 'zebra', 'arabayı': 'araba', 'bisikleti': 'bisiklet', 'uçağı': 'uçak', 'treni': 'tren', 'kayığı': 'kayık', 'helikopteri': 'helikopter', 'otobüsü': 'otobüs', 'kamyonu': 'kamyon', 'ambulansı': 'ambulans', 'roketi': 'roket', 'elmayı': 'elma', 'muzu': 'muz', 'havucu': 'havuç', 'karpuzu': 'karpuz', 'portakalı': 'portakal', 'çileği': 'çilek', 'üzümü': 'üzüm', 'mantarı': 'mantar', 'salatalığı': 'salatalık', 'kirazı': 'kiraz', 'topu': 'top', 'ayıyı': 'ayı', 'bloğu': 'blok', 'evi': 'ev', 'uçurtmayı': 'uçurtma', 'gemiyi': 'gemi', 'robotu': 'robot', 'yoyoyu': 'yoyo', 'kuleyi': 'kule', 'sandalyeyi': 'sandalye', 'kupayı': 'kupa', 'televizyonu': 'televizyon', 'dolabı': 'dolap', 'lambasını': 'lambası', 'yatağı': 'yatak', 'buzdolabını': 'buzdolabı', 'halıyı': 'halı', 'aynayı': 'ayna', 'akvaryumu': 'akvaryum', 'güneşi': 'güneş', 'bulutu': 'bulut', 'yıldızı': 'yıldız', 'ayı': 'ay', 'gökkuşağını': 'gökkuşağı', 'tanesini': 'tanesi', 'damlasını': 'damlası', 'ağacı': 'ağaç', 'papatyayı': 'papatya', 'yaprağını': 'yaprağı', 'kalemi': 'kalem', 'defteri': 'defter', 'makası': 'makas', 'çantasını': 'çantası', 'yapıştırıcıyı': 'yapıştırıcı', 'cetveli': 'cetvel', 'silgiyi': 'silgi', 'kalemliği': 'kalemlik', 'fırçayı': 'fırça', 'boyayı': 'boya', 'kareyi': 'kare', 'daireyi': 'daire', 'üçgeni': 'üçgen', 'dikdörtgeni': 'dikdörtgen', 'kalbi': 'kalp', 'şeklini': 'şekli', 'hilali': 'hilal', 'pastayı': 'pasta', 'pizzayı': 'pizza', 'dondurmayı': 'dondurma', 'donutu': 'donut', 'hamburgeri': 'hamburger', 'kızartmasını': 'kızartması', 'çikolatayı': 'çikolata', 'çorbayı': 'çorba', 'içeceği': 'içecek', 'lolipopu': 'lolipop', 'ineği': 'inek', 'terliği': 'terlik', 'şimşeği': 'şimşek', 'gezegeni': 'gezegen', 'ovali': 'oval', 'gülü': 'gül', 'çiçeğini': 'çiçeği', 'dilimini': 'dilimi', 'yaprağı': 'yaprak', 'balkabağını': 'balkabağı', 'kaktüsü': 'kaktüs', 'saksıyı': 'saksı'};
const nom = (np) => { const w = np.split(' '); const l = w.pop(); return [...w, NOM[l] || l].join(' '); };
const nameOf = (it, on) => {
  const { phrases, noun } = parseSentence(it.t);
  const keys = [...it.y, ...(it.n ? [it.n] : [])];
  const hasPh = keys.map((k, i) => (it.n && i === keys.length - 1 ? flip(phrases[i] || '') : (phrases[i] || '')));
  const desc = keys.map((k, i) => (on.includes(k) ? hasPh[i] : flip(hasPh[i]))).join(', ');
  return `${desc} ${nom(noun)}`.replace(/^./, c => c.toLocaleUpperCase('tr-TR')).trim();
};
const draw = (it, on, off) => {
  const f = { ...it.p };
  on.forEach(k => { f[strip(k)] = true; });
  off.forEach(k => { f[strip(k)] = false; });
  return { image: card(ALL[it.o](f)), imgName: nameOf(it, on) };
};

// Bir soru için şıklar: [doğru, yanlış1, yanlış2] (sırası karışık)
export const genUserProblem = (from) => (key, i) => {
  const it = USER_PROBLEMS[from + i]; if (!it) return null;
  const rng = makeRng(key, i);
  const yes = it.y; const tog = yes.filter(k => !k.startsWith('~'));
  let correct; let wrongs;
  if (!it.n) {
    correct = draw(it, yes, []);
    const miss = shuffle(tog, rng).slice(0, 2);
    wrongs = miss.map(m => draw(it, yes.filter(k => k !== m), [m]));
  } else {
    correct = draw(it, yes, [it.n]);
    const m = shuffle(tog, rng)[0];
    wrongs = [draw(it, [...yes, it.n], []), draw(it, yes.filter(k => k !== m), [m, it.n])];
  }
  const opts = [correct, ...wrongs]; const order = shuffle([0, 1, 2], rng);
  const text = it.t;
  return { options: order.map(k => opts[k]), correctIndex: order.indexOf(0), text, speak: text };
};
