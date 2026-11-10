// ============================================================================
// --- SESLİ SORULAR: BİLMECELER (200) ---
// ============================================================================
// Her nesne için 5 ipucu cümlesi var; her bilmece bunlardan 3 tanesini kullanır
// (4 farklı bilmece / nesne). Şıklar resim: cevap + aynı gruptan iki nesne.
import { ART, card, put } from '../art';
import { ART2 } from '../art2';
import { makeRng, pickN, arrange } from '../helpers';

const R = (art, clues, name) => ({ art, clues, name }); // name: şık görseli dosya adı (toplu görsel yükleme)
export const RIDDLES = {
  hayvan: [
    R(() => ART.cat(), ['Yumuşacık tüylerim var.', 'Miyav miyav diye seslenirim.', 'Süt içmeyi çok severim.', 'Fareleri kovalarım.', 'Bıyıklarım ve sivri kulaklarım var.'], 'Kedi'),
    R(() => ART.dog(), ['Evi bekler, sahibimi severim.', 'Hav hav diye havlarım.', 'Kemik kemirmeyi çok severim.', 'Mutlu olunca kuyruğumu sallarım.', 'Koklama gücüm çok iyidir.'], 'Köpek'),
    R(() => ART.fish('#38bdf8'), ['Suda yaşarım.', 'Yüzgeçlerimle yüzerim.', 'Pullarım parlar.', 'Ayaklarım yoktur.', 'Akvaryumda da yaşayabilirim.'], 'Balık'),
    R(() => ART.bird(), ['Kanatlarım var.', 'Gökyüzünde uçarım.', 'Ağaçlara yuva yaparım.', 'Cik cik diye öterim.', 'Gagamla yem toplarım.'], 'Kuş'),
    R(() => ART.duck(), ['Göllerde yüzerim.', 'Vak vak diye seslenirim.', 'Ayaklarım perdelidir.', 'Sarı ya da beyaz tüylerim olur.', 'Yassı bir gagam var.'], 'Ördek'),
    R(() => ART.rabbit(), ['Uzun kulaklarım var.', 'Zıp zıp zıplarım.', 'Havuç yemeyi çok severim.', 'Kısacık, pamuk gibi bir kuyruğum var.', 'Yerin altında yuvalarda yaşarım.'], 'Tavşan'),
    R(() => ART.turtle(), ['Sırtımda sert bir kabuk taşırım.', 'Çok yavaş yürürüm.', 'Korkunca başımı kabuğuma saklarım.', 'Hem karada hem suda yaşayabilirim.', 'Çok uzun yıllar yaşarım.'], 'Kaplumbağa'),
    R(() => ART.snail(), ['Evimi sırtımda taşırım.', 'Yağmurdan sonra ortaya çıkarım.', 'Arkamda ıslak bir iz bırakırım.', 'Başımda iki boynuz gibi göz var.', 'Bahçede yaprakları yerim.'], 'Salyangoz'),
    R(() => ART.butterfly('#8b5cf6'), ['Rengârenk kanatlarım var.', 'Çiçekten çiçeğe konarım.', 'Önce tırtıldım, sonra değiştim.', 'Kozadan çıktım.', 'Uçarken kanatlarımı yavaşça çırparım.'], 'Kelebek'),
    R(() => ART.elephant(), ['Kocaman bir gövdem var.', 'Uzun bir hortumum var.', 'Hortumumla su içerim.', 'Kulaklarım yelpaze gibi büyüktür.', 'Karada yaşayan en iri hayvanlardanım.'], 'Fil'),
    R(() => ART.sheep(), ['Bembeyaz, kıvırcık yünüm var.', 'Mee diye seslenirim.', 'Çayırda ot yerim.', 'Yünümden kazak örülür.', 'Çoban beni otlatır.'], 'Koyun'),
    R(() => ART2.cow(), ['Çiftlikte yaşarım.', 'Möö diye seslenirim.', 'Bana bakanlara süt veririm.', 'Ot yemeyi çok severim.', 'Siyah beyaz benekli olabilirim.'], 'İnek'),
    R(() => ART2.bee(), ['Vız vız diye uçarım.', 'Çiçeklerden çiçeğe konarım.', 'Bal yaparım.', 'Sarı siyah çizgilerim var.', 'Kovanda yaşarım.'], 'Arı'),
    R(() => ART.frog(), ['Vıraak diye seslenirim.', 'Gölün kenarında yaşarım.', 'Çok uzağa zıplarım.', 'Uzun dilimle sinek yakalarım.', 'Yeşil renkliyim.'], 'Kurbağa')
  ],
  yiyecek: [
    R(() => ART.apple(), ['Ağaçta yetişirim.', 'Kırmızı, yeşil ya da sarı olurum.', 'Isırınca kıtır kıtır ses çıkarırım.', 'İçimde çekirdeklerim var.', 'Bir meyveyim, yuvarlağım.'], 'Elma'),
    R(() => ART.banana(), ['Sarı bir kabuğum var.', 'Kabuğumu soyup yersin.', 'Uzun ve hafif eğriyim.', 'Maymunlar beni çok sever.', 'Salkım salkım yetişirim.'], 'Muz'),
    R(() => ART.strawberry(), ['Kıpkırmızı bir meyveyim.', 'Üzerimde minik çekirdekler var.', 'Başımda yeşil yapraklar var.', 'Pastaların üstünü süslerim.', 'Yazın yetişirim.'], 'Çilek'),
    R(() => ART.lemon(), ['Sarı bir meyveyim.', 'Tadım çok ekşidir.', 'Suyumu salataya sıkarlar.', 'Beni yiyince yüzünü buruşturursun.', 'Kışın hasta olunca bana ihtiyaç duyarsın.'], 'Limon'),
    R(() => ART.orange(), ['Turuncu bir meyveyim.', 'Kabuğumu soyunca dilim dilim olurum.', 'Suyum çok lezzetlidir.', 'Rengimin adı benim adımdan gelir.', 'Kışın bolca yenirim.'], 'Portakal'),
    R(() => ART.watermelon(), ['Dışım yeşil, içim kırmızıdır.', 'İçimde siyah çekirdekler var.', 'Çok büyük ve ağırım.', 'Yazın serinletirim.', 'Suyum boldur.'], 'Karpuz'),
    R(() => ART.carrot(), ['Toprağın altında büyürüm.', 'Turuncu bir sebzeyim.', 'Tavşanların en sevdiği yiyecekim.', 'Gözlere iyi gelirim.', 'Uzun ve sivriyim, yeşil saçlarım var.'], 'Havuç'),
    R(() => ART.bread(), ['Fırında pişerim.', 'Undan yapılırım.', 'Kahvaltıda sofradan eksik olmam.', 'Fırıncı beni sabah erkenden yapar.', 'Dilim dilim kesilirim.'], 'Ekmek'),
    R(() => ART.cheese(), ['Sütten yapılırım.', 'Kahvaltıda yenirim.', 'Sarı ya da beyaz olurum.', 'Fareler beni çok sever.', 'Bazen üzerimde delikler olur.'], 'Peynir'),
    R(() => ART.egg(), ['Tavuk beni yumurtlar.', 'Kabuğum incedir, kolay kırılırım.', 'İçimde sarı ve beyaz var.', 'Haşlanır ya da kızartılırım.', 'Bazen içimden civciv çıkar.'], 'Yumurta'),
    R(() => ART.icecream('#f9a8d4'), ['Çok soğuğum.', 'Külahta ya da kapta yenirim.', 'Güneşte hemen eririm.', 'Çilekli, çikolatalı olurum.', 'Yazın en sevilen tatlıyım.'], 'Dondurma'),
    R(() => ART.honey(), ['Arılar beni yapar.', 'Çok tatlıyım.', 'Sarı ve yapış yapışım.', 'Kavanozda saklanırım.', 'Ayılar beni çok sever.'], 'Bal'),
    R(() => ART2.grapes(), ['Salkım salkım yetişirim.', 'Bağlarda büyürüm.', 'Mor ya da yeşil olurum.', 'Küçük, yuvarlak tanelerim var.', 'Kurutulunca kuru üzüm olurum.'], 'Üzüm'),
    R(() => ART.mushroom(), ['Ormanda, nemli yerlerde biterim.', 'Şemsiye gibi bir şapkam var.', 'Benekli olabilirim.', 'Bazılarımız yenmez, dikkat et!', 'Yağmurdan sonra çoğalırım.'], 'Mantar')
  ],
  esya: [
    R(() => ART.umbrella('#3b82f6'), ['Yağmurda açılırım.', 'Seni ıslanmaktan korurum.', 'Sapımdan tutulurum.', 'Güneşli günde kapalı dururum.', 'Açılınca kubbe gibi olurum.'], 'Şemsiye'),
    R(() => ART.clock('#ef4444'), ['Tik tak diye çalışırım.', 'Zamanı gösteririm.', 'İki kolum var: biri kısa, biri uzun.', 'Duvarda asılı dururum.', 'Üzerimde sayılar yazar.'], 'Saat'),
    R(() => ART.key(), ['Küçük ve metalim.', 'Kapıları açarım.', 'Kilide girerim.', 'Kaybolursam eve giremezsin.', 'Anahtarlıkta dururum.'], 'Anahtar'),
    R(() => ART.book('#22c55e'), ['Sayfalarım var.', 'İçimde hikâyeler ve resimler var.', 'Beni okuyunca yeni şeyler öğrenirsin.', 'Kütüphanede raflarda dururum.', 'Kapağım açılıp kapanır.'], 'Kitap'),
    R(() => ART.pencil(), ['Sivri bir ucum var.', 'Benimle yazı yazarsın.', 'Ucum körelince açılırım.', 'Silgimle yanlışları silersin.', 'Kalem kutusunda dururum.'], 'Kalem'),
    R(() => ART2.scissors(), ['İki keskin ağzım var.', 'Kâğıdı keserim.', 'Parmaklarını deliklerime sokarsın.', 'Kullanırken dikkatli olmalısın.', 'Kuaför de beni kullanır.'], 'Makas'),
    R(() => ART2.toothbrush(), ['Her sabah ve akşam beni kullanırsın.', 'Dişlerini temizlerim.', 'Üzerime macun sürersin.', 'Fırçam yumuşacıktır.', 'Banyoda bardakta dururum.'], 'Diş fırçası'),
    R(() => ART.chair(), ['Dört ayağım var.', 'Üzerime oturursun.', 'Sırtını bana dayarsın.', 'Masanın yanında dururum.', 'Ahşaptan ya da plastikten yapılırım.'], 'Sandalye'),
    R(() => ART.ball('#ef4444'), ['Yuvarlağım.', 'Atınca zıplarım.', 'Ayakla ya da elle oynanırım.', 'Futbol maçlarında kullanılırım.', 'İçimde hava var.'], 'Top'),
    R(() => ART.candle('#ef4444'), ['Yandıkça eririm.', 'Ucumda küçük bir alev var.', 'Doğum günü pastasında olurum.', 'Elektrik gidince karanlığı aydınlatırım.', 'Üflersen sönerim.'], 'Mum'),
    R(() => ART.lamp(), ['Karanlıkta yanarım.', 'Düğmeye basınca ışık veririm.', 'Odayı aydınlatırım.', 'Masanın üstünde ya da tavanda dururum.', 'Ampulüm var.'], 'Lamba'),
    R(() => ART.shoe('#ef4444'), ['İkiz kardeşimle birlikte olurum.', 'Ayaklarına giyersin.', 'Bağcıklarım olabilir.', 'Dışarı çıkarken beni giyersin.', 'Ayaklarını korurum.'], 'Ayakkabı'),
    R(() => ART.phone(), ['Beni kulağına götürürsün.', 'Uzaktakilerle konuşmanı sağlarım.', 'Çalınca zil sesim duyulur.', 'Tuşlarım ya da ekranım var.', 'Annenle babanı aramana yardım ederim.'], 'Telefon'),
    R(() => ART2.comb(), ['Sıra sıra dişlerim var ama ısırmam.', 'Saçlarını düzeltirim.', 'Banyo aynasının yanında dururum.', 'Saçını yıkadıktan sonra beni kullanırsın.', 'Kuaförler beni çok kullanır.'], 'Tarak')
  ],
  doga: [
    R(() => ART.sun(), ['Gökyüzünde parlarım.', 'Dünyayı ısıtırım.', 'Sabah doğar, akşam batarım.', 'Gündüz görünürüm.', 'Bana çıplak gözle bakmamalısın.'], 'Güneş'),
    R(() => ART.moon(), ['Gece gökyüzünde parlarım.', 'Bazen yuvarlak, bazen hilal olurum.', 'Dünya’nın etrafında dönerim.', 'Astronotlar üzerime ayak bastı.', 'Yıldızlarla birlikte görünürüm.'], 'Ay'),
    R(() => ART.star('#facc15'), ['Gece gökyüzünde göz kırparım.', 'Çok uzaktayım, o yüzden küçük görünürüm.', 'Sayamayacağın kadar çok kardeşim var.', 'Beş köşeli çizilirim.', 'Gündüz görünmem.'], 'Yıldız'),
    R(() => ART.cloud(), ['Gökyüzünde süzülürüm.', 'Pamuk gibi beyaz olurum.', 'Kararınca yağmur yağdırırım.', 'Rüzgâr beni sürükler.', 'Su damlacıklarından oluşurum.'], 'Bulut'),
    R(() => ART.rainbow(), ['Yağmurdan sonra çıkarım.', 'Yedi rengim var.', 'Gökyüzünde kocaman bir yay gibiyim.', 'Güneş ve yağmur birlikte olunca görünürüm.', 'Kırmızı, sarı, yeşil, mavi renklerim var.'], 'Gökkuşağı'),
    R(() => ART.tree(), ['Gövdem ve dallarım var.', 'Yapraklarım yeşildir.', 'Kuşlar dallarıma yuva yapar.', 'Toprağa köklerimle tutunurum.', 'Bazen meyve veririm.'], 'Ağaç'),
    R(() => ART.flower('#ec4899'), ['Rengârenk yapraklarım var.', 'Güzel kokarım.', 'Arılar ve kelebekler bana konar.', 'Bahçelerde ve saksılarda büyürüm.', 'Beni suladıkça açarım.'], 'Çiçek'),
    R(() => ART.snowman(), ['Kardan yapılırım.', 'Burnum havuçtur.', 'Kışın bahçede dururum.', 'Güneş çıkınca eririm.', 'Üç kar topundan oluşurum.'], 'Kardan adam'),
    R(() => ART.fire(), ['Sıcak ve parlağım.', 'Odunları yakarım.', 'Çok tehlikeliyim, bana dokunma.', 'Kamp yapanları ısıtırım.', 'İtfaiyeciler beni söndürür.'], 'Ateş'),
    R(() => ART.airplane('#3b82f6'), ['Gökyüzünde uçarım ama kuş değilim.', 'Kanatlarım var.', 'İnsanları uzak şehirlere götürürüm.', 'Havalimanından kalkarım.', 'Pilot beni kullanır.'], 'Uçak'),
    R(() => ART.car('#ef4444'), ['Dört tekerleğim var.', 'Yollarda giderim.', 'Benzinle ya da elektrikle çalışırım.', 'Direksiyonumla yönümü değiştirirsin.', 'Kornam düt düt öter.'], 'Araba'),
    R(() => ART.boat('#3b82f6'), ['Suyun üstünde yüzerim.', 'Denizde ve gölde giderim.', 'Yelkenim ya da motorum olur.', 'Kaptan beni kullanır.', 'Limanda beklerim.'], 'Gemi'),
    R(() => ART.train(), ['Raylarda giderim.', 'Uzun vagonlarım var.', 'Çuf çuf diye ses çıkarırım.', 'İstasyonlarda dururum.', 'Pek çok yolcuyu birden taşırım.'], 'Tren'),
    R(() => ART.rocket('#ef4444'), ['Uzaya giderim.', 'Ateş püskürterek havalanırım.', 'Astronotları taşırım.', 'Gökyüzüne dimdik yükselirim.', 'Ucum sivridir.'], 'Roket')
  ]
};
const VARIANTS = [[0, 1, 2], [1, 2, 3], [2, 3, 4], [0, 3, 4]];
export const genRiddle = (cat) => (key, i) => {
  const rng = makeRng(key, i);
  const list = RIDDLES[cat];
  const objIdx = i % list.length; const v = VARIANTS[Math.floor(i / list.length) % VARIANTS.length];
  const r = list[objIdx];
  const text = `${v.map(k => r.clues[k]).join(' ')} Ben neyim?`;
  const others = pickN(list.filter((_, k) => k !== objIdx), 2, rng);
  const ac = (x) => ({ image: card(put(x.art(), 50, 50, 0.84)), imgName: x.name });
  return { ...arrange(key, i, ac(r), others.map(ac)), text, speak: text.replace(/ Ben neyim\?$/, ' || Ben neyim?') };
};
