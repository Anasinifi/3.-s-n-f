// ============================================================================
// --- METİNDEN RESİM (emoji tabanlı) ---
// ============================================================================
// Kısa bir Türkçe ifadeden ("Kırmızı yün bir şapka", "Üç tane beyaz yumurta",
// "Köprünün altında") çocuğun telefonundaki renkli emojilerle bir resim kartı üretir.
//  • renk kelimesi varsa nesne o renge boyanır (SVG filtresi)
//  • "iki/üç/beş tane" -> nesne o kadar çizilir • "5 rakamı" -> rakam
//  • "... resmi" -> çerçeve • "... gölgesi" -> siyah siluet • yavru/minik -> küçük
// Ayrıca sahne resmi: bir metindeki karakter ve yerlerden 2-3 emoji.
// Emoji, cihazın kendi emoji yazı tipiyle çizilir (Android: Noto, iPhone: Apple).
import { card } from './art';

export const EMOJI_FONT = 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif';

// ---------------------------------------------------------------------------
// SÖZLÜK: "kök|kök2 = emoji : tür"  (tür: a hayvan, p kişi, o nesne, f yiyecek, l yer, n doğa, v taşıt, w zayıf/niteleyici)
// Çok kelimeli kökler önce denenir. Kök kelimenin başıyla eşleşir (şapka -> şapkasını).
// ---------------------------------------------------------------------------
const DICT_SRC = `
kutup ayı=🐻‍❄️:a
fok balığ|fok=🦭:a
deniz yıldız=⭐:a
deniz anası=🪼:a
deniz atı|denizatı=🐴:a
deniz kabuğ|kabuklar|kabuğu|kabuk=🐚:n
deniz feneri|fener=🗼:l
deniz=🌊:l
japon balığ=🐠:a
balina=🐋:a
yunus=🐬:a
köpek balığ=🦈:a
ahtapot=🐙:a
yengeç=🦀:a
balık=🐟:a
penguen=🐧:a
martı=🕊️:a
posta güvercin|güvercin=🕊️:a
serçe=🐦:a
kartal=🦅:a
baykuş=🦉:a
papağan=🦜:a
karga=🐦‍⬛:a
ağaçkakan=🐦:a
leylek=🦩:a
kuğu=🦢:a
tavus=🦚:a
devekuş=🐦:a
horoz=🐓:a
tavuk=🐔:a
civciv=🐤:a
ördek=🦆:a
kuş evi=🏠:o
kuş yuvası|yuva=🪺:n
kuş=🐦:a
kedi=🐱:a
köpek=🐶:a
tavşan=🐰:a
sincap=🐿️:a
kirpi=🦔:a
fare=🐭:a
ayıcık|oyuncak ayı|peluş=🧸:o
boz ayı|ayı=🐻:a
kurt=🐺:a
tilki=🦊:a
aslan=🦁:a
kaplan=🐯:a
fil=🐘:a
zürafa=🦒:a
zebra=🦓:a
maymun=🐒:a
kanguru=🦘:a
deve=🐫:a
timsah=🐊:a
kaplumbağa=🐢:a
kertenkele=🦎:a
yılan=🐍:a
kurbağa=🐸:a
dinozor=🦕:a
inek=🐄:a
kuzu|koyun=🐑:a
keçi=🐐:a
at|atı=🐴:a
eşek=🫏:a
domuz=🐷:a
geyik|ceylan=🦌:a
bukalemun=🦎:a
yarasa=🦇:a
uğur böceğ=🐞:a
arı|bal arı=🐝:a
kelebek=🦋:a
tırtıl|kurtçuk=🐛:a
karınca=🐜:a
örümcek=🕷️:a
salyangoz=🐌:a
çekirge|cırcır=🦗:a
sinek|sivrisinek|kara sinek=🪰:a
yusufçuk=🦋:a
solucan=🪱:a
uzaylı=👽:p
astronot=🧑‍🚀:p
itfaiyeci=🧑‍🚒:p
polis=👮:p
doktor=🧑‍⚕️:p
hemşire=🧑‍⚕️:p
öğretmen=🧑‍🏫:p
aşçı|fırıncı=🧑‍🍳:p
çiftçi|bahçıvan=🧑‍🌾:p
pilot=🧑‍✈️:p
postacı=📮:p
şoför=🧑‍✈️:p
kral=🤴:p
kraliçe|prenses=👸:p
şövalye=🛡️:p
dalgıç=🤿:o
dede|büyükbaba|amca=👴:p
nine|babaanne|anneanne|büyükanne|teyze|hala|yaşlı kadın=👵:p
anne=👩:p
baba=👨:p
bebek=👶:p
abla|kız=👧:p
abi|oğlan=👦:p
çocuk|kardeş|arkadaş=🧒:p
bere=🧢:o
silindir şapka=🎩:o
hasır şapka=👒:o
aşçı şapka=👨‍🍳:o
şapka=👒:o
kask=⛑️:o
taç=👑:o
gözlük=👓:o
güneş gözlüğ=🕶️:o
atkı|fular=🧣:o
eldiven=🧤:o
çorap=🧦:o
kazak|tişört|bluz=👕:o
gömlek=👔:o
mont|kaban|yağmurluk=🧥:o
elbise=👗:o
pantolon=👖:o
pijama=👕:o
önlük=🥼:o
papyon|kravat=🎀:o
kolye|madalyon|zincir=📿:o
yüzük=💍:o
çizme|bot|botu=👢:o
terlik=🩴:o
ayakkabı|paten=👟:o
buz paten=⛸️:o
tekerlekli paten=🛼:o
sırt çanta|okul çanta|beslenme çanta|çanta=🎒:o
cüzdan=👛:o
bavul=🧳:o
şemsiye=☂️:o
anahtar=🔑:o
saat|kol saati|duvar saati=⏰:o
kum saati=⏳:o
telefon=📱:o
televizyon=📺:o
tablet|bilgisayar=💻:o
fotoğraf makine=📷:o
kamera=📷:o
dürbün=🔭:o
teleskop=🔭:o
büyüteç=🔍:o
pusula=🧭:o
harita=🗺️:o
gazete|dergi=📰:o
kitap|kütüphane=📚:o
defter=📒:o
kalemlik|kalem kutusu=✏️:o
kurşun kalem|kalem=✏️:o
keçeli=🖊️:o
pastel boya|boya kalem|boya=🖍️:o
sulu boya|fırça=🖌️:o
palet=🎨:o
silgi=🧽:o
makas=✂️:o
cetvel=📏:o
yapıştırıcı|tutkal=🧴:o
bant|yara band|bandaj|sargı=🩹:o
çıkartma=⭐:o
zarf|mektup|davetiye=💌:o
posta kutusu=📮:o
pul=📮:o
paket|hediye=🎁:o
kutu|sandık=📦:o
korsan sandığ|hazine=🪙:o
para|kumbara=🪙:o
kağıt para=💵:o
bilet=🎫:o
barkod=🔖:o
bayrak=🚩:o
balon=🎈:o
uçurtma=🪁:o
top=⚽:o
yoyo=🪀:o
oyuncak tren|tren=🚂:v
vagon=🚃:v
ray=🛤️:l
oyuncak araba|yarış araba|araba=🚗:v
polis araba=🚓:v
itfaiye=🚒:v
ambulans=🚑:v
otobüs|servis=🚌:v
kamyon|kamyonet=🚚:v
traktör=🚜:v
kepçe=🚜:v
bisiklet=🚲:v
kaykay=🛹:v
scooter=🛴:v
uçak|yolcu uçağ=✈️:v
helikopter=🚁:v
roket|uzay mekiğ=🚀:v
uzay gemisi=🛸:v
gemi|vapur|korsan gemi=🚢:v
denizaltı=🤿:v
tekne|kayık|sandal=🛶:v
yelkenli=⛵:v
gemi dümen=☸️:o
market araba|pazar araba=🛒:o
el araba=🛒:o
tekerlek=🛞:o
lastik=🛞:o
gezegen|satürn=🪐:n
dünya=🌍:n
ay=🌙:n
yıldız=⭐:n
güneş=☀️:n
bulut=☁️:n
fırtına=⛈️:n
yağmur=🌧️:n
kar tane=❄️:n
kar=❄️:n
kardan adam=⛄:o
şimşek|yıldırım=⚡:n
gökkuşağ=🌈:n
rüzgar=🌬️:n
ateş|şömine=🔥:n
damla=💧:n
su birikinti=💦:n
su=💧:n
buz küp|buz=🧊:n
dağ=⛰️:l
mağara=🕳️:l
orman=🌲:l
ağaç kovuğ|kovuk=🌳:l
çam kozala|kozala=🌰:n
palamut|meşe palamut=🌰:n
ağaç dal|dal=🌿:n
ağaç fidan|fidan=🌱:n
ağaç|meşe=🌳:n
çam=🌲:n
yaprak=🍃:n
yonca=☘️:n
çiçek|menekşe=🌸:n
gül=🌹:n
papatya=🌼:n
lale=🌷:n
ayçiçeğ=🌻:n
nilüfer=🪷:n
kaktüs=🌵:n
mantar=🍄:n
çimen|çim|ot=🌿:n
saman=🌾:n
buğday|başak=🌾:n
tohum=🌱:n
toprak=🟫:n
kum=🏖️:n
taş|çakıl|kaya|kayalık=🪨:n
tüy=🪶:n
kemik=🦴:o
yumurta=🥚:f
elma=🍎:f
armut=🍐:f
muz=🍌:f
portakal|mandalina=🍊:f
limon=🍋:f
çilek=🍓:f
kiraz=🍒:f
üzüm=🍇:f
karpuz=🍉:f
kavun=🍈:f
erik=🫐:f
ananas=🍍:f
şeftali=🍑:f
hindistan ceviz=🥥:f
ceviz|fındık=🌰:f
havuç=🥕:f
domates=🍅:f
salatalık=🥒:f
biber=🫑:f
patlıcan=🍆:f
patates=🥔:f
soğan=🧅:f
marul|lahana|ıspanak=🥬:f
turp=🫜:f
mısır=🌽:f
zeytin=🫒:f
nane=🌿:f
bal peteğ|petek=🍯:f
bal=🍯:f
reçel=🍯:f
ekmek|poğaça=🍞:f
sandviç=🥪:f
peynir=🧀:f
süt=🥛:f
ayran|yoğurt=🥛:f
meyve suyu=🧃:f
limonata=🍋:f
çay=🍵:f
çorba=🍲:f
makarna=🍝:f
pizza=🍕:f
hamburger=🍔:f
köfte=🍖:f
kek|pasta=🎂:f
kurabiye|bisküvi=🍪:f
çikolata=🍫:f
şeker|şekerleme|kesme şeker=🍬:f
lolipop=🍭:f
dondurma=🍦:f
patlamış mısır=🍿:f
un=🌾:f
kırıntı=🍞:f
tabak|tepsi=🍽️:o
kase|leğen=🥣:o
bardak|fincan=🥤:o
cam bardak|su bardağ=🥛:o
kupa=☕:o
sürahi|şişe|kavanoz=🫙:o
çaydanlık|demlik=🫖:o
tencere=🍲:o
tava=🍳:o
kaşık|kepçe=🥄:o
spatula=🍳:o
çatal=🍴:o
bıçak=🔪:o
çırpıcı|blender|sıkacak=🥣:o
fırın=🔥:o
sepet|file=🧺:o
poşet|torba|çuval=🛍️:o
çöp|çöp kutusu|çöp tenekesi|çöp kova=🗑️:o
geri dönüşüm=♻️:o
kova=🪣:o
kürek=⛏️:o
tırmık=🔱:o
çapa=⛏️:o
süpürge=🧹:o
elektrik süpürge=🧹:o
hortum=🚿:o
sulama kabı=🚿:o
çekiç=🔨:o
tornavida|anahtar takımı|ingiliz anahtar=🔧:o
testere=🪚:o
çivi=📌:o
pompa=🎈:o
ip|halat|misina|yumak|ip makara=🧶:o
düğme=🔘:o
fermuar=🤐:o
kurdele|fiyonk|toka=🎀:o
boncuk=📿:o
düğüm=🪢:o
kumaş|örtü|çarşaf|battaniye|halı|paspas|havlu=🧣:o
yastık=🛏️:o
yatak|uyku tulum=🛏️:o
hamak=🛏️:o
sandalye|bank=🪑:o
masa=🪑:o
dolap|raf=🗄️:o
ayna=🪞:o
kapı=🚪:o
pencere=🪟:o
merdiven=🪜:o
lamba|ampul|gece lamba|avize=💡:o
mum=🕯️:o
el feneri=🔦:o
priz|elektrik|anahtar düğme=🔌:o
zil=🔔:o
musluk=🚰:o
sabun=🧼:o
şampuan|deterjan=🧴:o
diş fırça=🪥:o
diş macun=🪥:o
tarak=🪮:o
saç kurutma=💨:o
peçete|kağıt|mendil=🧻:o
sünger=🧽:o
şırınga=💉:o
termometre|ateş ölçer=🌡️:o
stetoskop=🩺:o
şurup|ilaç=💊:o
pamuk=☁️:o
cımbız=🪡:o
dikiş|iğne|örgü şiş=🪡:o
dikiş makine=🪡:o
piyano=🎹:o
gitar|mızrap|pena=🎸:o
keman=🎻:o
davul|baget|tef=🥁:o
flüt=🎶:o
ksilofon=🎵:o
nota=🎶:o
çadır=⛺:o
kamp=🏕️:l
ev|kulübe=🏠:l
okul=🏫:l
hastane=🏥:l
market|dükkan=🏪:l
park=🏞️:l
bahçe=🏡:l
tarla=🌾:l
köprü=🌉:l
yol|asfalt|patika=🛣️:l
yaya geçid=🚸:l
trafik ışık|ışık=🚦:o
dur işaret=🛑:o
ok işaret|ok=➡️:o
durak=🚏:l
göl|nehir|dere=🏞️:l
şelale=🏞️:l
plaj|kumsal=🏖️:l
havuz|şişme havuz=🏊:l
akvaryum=🐠:o
kum havuz=🏖️:l
kale=🏰:l
şato=🏰:l
çöl=🏜️:l
kaydırak=🛝:o
salıncak=🎠:o
tahterevalli=🎠:o
trambolin=🤸:o
atlıkarınca|dönme dolap|lunapark=🎡:o
sinema=🎬:l
müze=🏛️:l
spor salon=🏟️:l
kulaklık=🎧:o
oksijen tüp=🤿:o
can yeleğ=🦺:o
can simid|kolluk=🛟:o
çamur iz|ayak iz|iz=👣:w
çamur=🟤:n
oda=🛋️:l
koltuk|minder=🛋️:o
cep=👖:w
gaga=🐦:w
kapsül=💊:o
okyanus=🌊:l
tünel=🚇:l
şövale=🖼️:o
tablo=📋:o
maske=🥽:o
ibre=🧭:o
üçgen=🔺:o
kare=🟥:w
daire=🔵:w
tahta parça|tahta|kütük=🪵:o
eller|elleri|ellerini|elleriyle=🙌:w
yay=🏹:o
yelpaze=🪭:o
boru=🪈:o
levha=🪧:o
saksı=🪴:o
dizlik=🦵:o
diz=🦵:w
duvar=🧱:l
tepe=⛰️:l
kuyruk=🦊:w
motor=🏍️:v
çubuk|maşa=🥢:o
halka|çember=⭕:o
süzgeç=🥣:o
kese=👝:o
oturak=🎠:o
direk=🪧:o
burun=👃:w
komşu=🏘️:l
bina|şehir=🏙️:l
pedal=🚲:o
sibop|jant=🛞:o
karton=📦:o
tasma=🦮:o
boynuz=🦌:w
yerde|yere=⬇️:w
çatı=🏠:l
gölge=🌳:w
ahır|kümes=🛖:l
çayır=🌿:l
kömür=⚫:o
yosun=🌿:n
vazo=🏺:o
koza=🫘:n
dalga=🌊:n
kartop=❄️:o
saklambaç=🙈:o
şarkı=🎤:o
şiir=📜:o
garaj=🅿️:l
nehr=🏞️:l
kumluk=🏖️:l
çekmece=🗄️:o
merhaba=👋:o
hamur=🫓:o
ağız=👄:w
komik yüz=🤪:w
yüzüne=🙂:w
sazlık=🌾:l
ülke=🌍:l
krem=🧴:o
tiyatro|oyuncu=🎭:l
delik=🕳️:l
küvet|banyo=🛁:l
sürü=🐑:a
yazı tahtası=🧑‍🏫:o
ağ|ağına=🕸️:o
böcek=🐞:a
aydede|dolunay=🌕:n
kış=❄️:n
yiyecek=🍎:f
saç=💇:w
kafa=🙂:w
karın|karnı=🫃:w
kalp atış|kalbinin=❤️:w
kanat=🪽:w
dans=💃:o
ayraç=🔖:o
bez çanta=👜:o
pazar çanta=👜:o
el çanta=👜:o
kuyu=🕳️:l
kayıkçı=🚣:p
balıkçı tekne=🛥️:v
yolcu gemi=🛳️:v
yangın=🔥:n
kalem kutu=✏️:o
not=📝:o
bot|çizme=👢:o
paten=🛼:o
kalp=❤️:w
yara=🩹:w
gülen yüz=😊:w
`;

// FİİLLER: isim yoksa (ör. "Mışıl mışıl uyudu.") ya da şıklar aynı isme düşerse ayırt etmek için
const VERB_SRC = `
uyu|uyku|esne=😴
tara=🪮
yıka|köpürt|temizle=🧼
saklan|gizlen=🙈
kaç|koş|uzaklaş=🏃
fırlat|at=🤾
yüz|yüzdü|yüzme|dal=🏊
dans=💃
şarkı|söyle=🎤
alkış=👏
ağla|üzül=😢
kız|kızgın=😠
sevin|güldü|gülümse|neşe=😄
zıpla|sıçra=🤸
tırman=🧗
dolaş=🔄
geri dön|döndü=🔙
çırp=🪽
öt=🎵
otur=🪑
yat|uzan=🛌
ye|yedi|kemir|yala|ısır=😋
iç|içti=🥤
oku=📖
yaz=✍️
çiz=✏️
boya=🖌️
kes=✂️
topla|taşı=🧺
bekle=⏳
uç|uçtu|uçur=🕊️
göç=🧭
dinle|duy=👂
izle|bak|gör=👀
sür=🚗
bin=🚲
oyna=🧸
yardım|yardımlaş=🤝
it|çek=💪
kapat=🙈
aç|açtı=👐
dur|durup=🛑
hızlan|hızla=💨
`;
const VERBS = VERB_SRC.trim().split('\n').map(l => { const [st, e] = l.split('='); return { stems: st.split('|'), emoji: e }; });
const findVerb = (text) => {
  const toks = tokens(text);
  for (let i = toks.length - 1; i >= 0; i--) {
    for (const v of VERBS) if (v.stems.some(st => toks[i].startsWith(st) && toks[i].length - st.length <= 7)) return v.emoji;
  }
  return null;
};
export const verbEmoji = (text) => findVerb(text);

// renkler (boyama)
const COLORS = [
  ['kıpkırmızı', '#dc2626'], ['kırmızı', '#ef4444'], ['kızıl', '#dc2626'], ['lacivert', '#1e3a8a'], ['mavi', '#3b82f6'],
  ['yeşil', '#22c55e'], ['sarı', '#facc15'], ['turuncu', '#f97316'], ['mor', '#8b5cf6'], ['pembe', '#ec4899'],
  ['siyah', '#334155'], ['simsiyah', '#1e293b'], ['bembeyaz', '#ffffff'], ['beyaz', '#f8fafc'], ['kahverengi', '#92400e'],
  ['gri', '#94a3b8'], ['gümüş', '#cbd5e1'], ['altın', '#eab308']
];
const MULTI_COLOR = /rengarenk|çizgili|benekli|desenli|kareli|alacalı/;
// renk sözcüğü + izin verilen ek ("altına" = altına (yer) renk sayılmaz)
const COLOR_SUFFIX = /^(ı|i|u|ü|sı|si|su|sü|lı|li|lu|lü|ya|ye|ımsı|imsi|umsu|ümsü|msı|msi|ler|lar)?$/;
const colorHit = (t, w) => t.startsWith(w) && COLOR_SUFFIX.test(t.slice(w.length));
// tek renk değil, "renkli" tek başına -> çok renkli
const isMulti = (key, nCols) => MULTI_COLOR.test(key) || (/renkli/.test(key) && nCols === 0);
const NO_TINT = new Set(['p', 'w']);
// NEZAKET SÖZLERİ -> simge
const PHRASES = [
  [/teşekkür|sağ ol/, '🙏'], [/geçmiş olsun/, '🤒'], [/afiyet/, '🍽️'], [/iyi geceler/, '🌙'], [/özür|affedersin|pardon/, '🙇'],
  [/hoş ?geldin/, '🤗'], [/güle güle|hoşça kal|görüşürüz/, '👋'], [/tebrik|kutlarım/, '🎉'], [/günaydın/, '🌅'], [/iyi akşamlar/, '🌆'],
  [/çok yaşa/, '🤧'], [/sen de gör/, '😊'], [/kolay gelsin/, '💪'], [/rica ederim/, '🙂'], [/eline sağlık|ellerine sağlık/, '👏'],
  [/iyi yolculuklar/, '🧳'], [/merhaba|selam/, '🙋'], [/iyi ki doğdun/, '🎂'], [/lütfen/, '🥺']
];
const NUMS = { bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6 };

const lower = (s) => String(s || '').toLocaleLowerCase('tr-TR');
const tokens = (s) => lower(s).replace(/[’'`]/g, ' ').replace(/[^a-zçğıöşüâîû0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);

// sözlüğü derle (ünsüz yumuşaması varyantlarıyla)
const soften = (w) => { const m = { k: 'ğ', p: 'b', t: 'd', ç: 'c' }; const l = w[w.length - 1]; return w.length >= 3 && m[l] ? w.slice(0, -1) + m[l] : null; };
const DICT = [];
DICT_SRC.trim().split('\n').forEach(line => {
  const m = /^(.+?)=(.+?):([a-z])$/.exec(line.trim()); if (!m) return;
  const [, stems, emoji, cat] = m;
  stems.split('|').forEach(st => {
    const words = st.trim().split(/\s+/);
    DICT.push({ words, emoji, cat });
    const sv = soften(words[words.length - 1]);
    if (sv) DICT.push({ words: [...words.slice(0, -1), sv], emoji, cat });
  });
});
DICT.sort((a, b) => b.words.length - a.words.length || b.words.join(' ').length - a.words.join(' ').length);

const SHORT_SUFFIX = /^(lar|ler)?(ı|i|u|ü|a|e|ya|ye|yı|yi|yu|yü|nı|ni|nu|nü|na|ne|sı|si|su|sü|sın|sin|sun|sün|sına|sine|suna|süne|sını|sini|sunu|sünü|ın|in|un|ün|nın|nin|nun|nün|da|de|ta|te|dan|den|tan|ten|la|le|yla|yle|ndan|nden|nda|nde)?$/;
const wordMatch = (tok, stem) => {
  if (!tok.startsWith(stem)) return false;
  const rest = tok.slice(stem.length);
  if (stem.length >= 5) return rest.length <= 8;
  if (stem.length >= 4) return rest.length <= 6;
  return SHORT_SUFFIX.test(rest);
};

// isim sanılmaması gereken sözcükler (ay -> aynı, kurt -> kurdular)
const STOP_TOKENS = new Set(['aynı', 'ayrı', 'ayrıca', 'kurdu', 'kurdular', 'kurduk', 'kurdum', 'sağ', 'yüzden', 'yüzünden', 'karşı', 'karşıya']);
// metindeki sözlük eşleşmeleri (konumlarıyla, çakışmasız)
export const findNouns = (text) => {
  const toks = tokens(text); const used = toks.map(t => STOP_TOKENS.has(t)); const out = [];
  for (const e of DICT) {
    for (let i = 0; i + e.words.length <= toks.length; i++) {
      if (used.slice(i, i + e.words.length).some(Boolean)) continue;
      if (e.words.every((w, k) => wordMatch(toks[i + k], w))) {
        out.push({ pos: i, emoji: e.emoji, cat: e.cat, word: toks.slice(i, i + e.words.length).join(' ') });
        for (let k = 0; k < e.words.length; k++) used[i + k] = true;
      }
    }
  }
  return out.sort((a, b) => a.pos - b.pos);
};

// --- çizim yardımcıları ---
let fid = 0;
const tintFilter = (id, hex) => `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0" result="g"/><feComponentTransfer in="g" result="g2"><feFuncR type="linear" slope="1.25" intercept="0.05"/><feFuncG type="linear" slope="1.25" intercept="0.05"/><feFuncB type="linear" slope="1.25" intercept="0.05"/></feComponentTransfer><feFlood flood-color="${hex}" result="c"/><feBlend in="c" in2="g2" mode="multiply" result="m"/><feComposite in="m" in2="SourceAlpha" operator="in"/></filter>`;
export const emojiText = (ch, x, y, size, filterId) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" font-family="${EMOJI_FONT}"${filterId ? ` filter="url(#${filterId})"` : ''}>${ch}</text>`;

// Tek resim kartı: [{ emoji, tint?, scale? }] (en fazla 6) + seçenekler
export const emojiCard = (items, { frame = false, digit = null } = {}) => {
  let defs = ''; let body = '';
  if (digit !== null) {
    body = `<text x="50" y="54" font-size="62" font-weight="900" text-anchor="middle" dominant-baseline="central" font-family="Arial Rounded MT Bold, Arial, sans-serif" fill="#4f46e5">${digit}</text>`;
    return card(body);
  }
  const n = items.length;
  const pos = n === 1 ? [[50, 54, 62]] : n === 2 ? [[30, 54, 42], [70, 54, 42]] : n === 3 ? [[28, 36, 34], [72, 36, 34], [50, 72, 34]]
    : n === 4 ? [[30, 32, 32], [70, 32, 32], [30, 72, 32], [70, 72, 32]] : n === 5 ? [[22, 32, 28], [50, 32, 28], [78, 32, 28], [36, 72, 28], [64, 72, 28]]
      : [[22, 32, 26], [50, 32, 26], [78, 32, 26], [22, 72, 26], [50, 72, 26], [78, 72, 26]];
  items.slice(0, 6).forEach((it, k) => {
    const [x, y, s] = pos[k]; let f = '';
    if (it.tint) { f = `t${++fid}`; defs += tintFilter(f, it.tint); }
    body += emojiText(it.emoji, x, y, Math.round(s * (it.scale || 1)), f);
  });
  if (frame) body = `<rect x="14" y="14" width="72" height="72" rx="4" fill="#fffbeb" stroke="#a16207" stroke-width="5"/>${body}`;
  return card(`${defs ? `<defs>${defs}</defs>` : ''}${body}`);
};

// ---------------------------------------------------------------------------
// İFADEDEN RESİM: "Kırmızı yün bir şapka" -> kırmızı şapka
// ---------------------------------------------------------------------------
const OVERRIDES = new Map(); // tam ifade -> [{emoji, tint?}] (elle eklenenler)
export const addPictureOverrides = (obj) => Object.entries(obj).forEach(([k, v]) => OVERRIDES.set(lower(k).replace(/\s+/g, ' ').trim(), v));

export const pictureItems = (text) => {
  const key = lower(text).replace(/\s+/g, ' ').trim();
  if (OVERRIDES.has(key)) return { items: OVERRIDES.get(key) };
  const toks = tokens(text);
  // nezaket sözleri: kısa ifadelerde metinde ilk geçen kalıp
  if (toks.length <= 9) {
    let best = null;
    PHRASES.forEach(([re, e]) => { const m = re.exec(key); if (m && (!best || m.index < best.i)) best = { i: m.index, e }; });
    if (best) return { items: [{ emoji: best.e }] };
  }
  const dig = /^(\d+)\s+rakam/.exec(key); if (dig) return { digit: dig[1] };
  const nouns = findNouns(text);
  if (!nouns.length) {
    // sadece renk -> renk lekesi • sadece sayı -> rakam • fiil -> eylem resmi
    const c1 = COLORS.find(([w]) => toks.some(t => colorHit(t, w)));
    if (c1 && toks.length <= 2) return { swatch: c1[1] };
    const nw = toks.find(t => NUMS[t]); if (nw && toks.length <= 2) return { digit: String(NUMS[nw]) };
    const v = findVerb(text); if (v) return { items: [{ emoji: v }] };
    return null;
  }
  const strong = nouns.filter(n => n.cat !== 'w');
  const pool = strong.length ? strong : nouns;
  // baş isim: sondaki; "ve / ile / ," ile bağlanmış iki isim varsa ikisi
  let heads = [pool[pool.length - 1]];
  if (pool.length >= 2 && /\s(ve|ile)\s|,/.test(key)) heads = [pool[pool.length - 2], pool[pool.length - 1]];
  // renk (tek renk ve çok renkli değilse)
  // renkler metindeki sırasıyla
  const colHits = []; toks.forEach(t => { const c = COLORS.find(([w]) => colorHit(t, w)); if (c && !colHits.includes(c[1])) colHits.push(c[1]); });
  const colsU = colHits;
  const multi = isMulti(key, colsU.length);
  const tint = colsU.length === 1 && !multi ? colsU[0] : null;
  // "pembe ve mor yapraklar" -> iki ayrı boyalı resim
  if (colsU.length === 2 && !multi && /\s(ve|ile)\s|,/.test(key) && pool.length === 1) {
    const h = pool[0];
    if (!NO_TINT.has(h.cat)) return { items: colsU.map(c => ({ emoji: h.emoji, tint: c, scale: 1 })), frame: false };
  }
  const shadow = toks.some(t => t.startsWith('gölge'));
  const small = toks.some(t => /^(yavru|minik|küçük|ufak)/.test(t));
  const frame = toks.some(t => /^(resm|resim|tablo|fotoğraf)/.test(t)) && heads[0].cat !== 'o';
  let count = 1;
  const ti = toks.findIndex(t => t === 'tane'); if (ti > 0 && NUMS[toks[ti - 1]]) count = NUMS[toks[ti - 1]];
  else { const nw = toks.find(t => NUMS[t] && NUMS[t] > 1); if (nw && heads.length === 1) count = NUMS[nw]; }
  const items = [];
  heads.forEach(h => {
    const t = shadow ? '#1e293b' : (NO_TINT.has(h.cat) ? null : tint);
    for (let k = 0; k < (heads.length > 1 ? 1 : count); k++) items.push({ emoji: h.emoji, tint: t, scale: small ? 0.75 : 1 });
  });
  return { items, frame };
};

// renk lekesi (boya damlası)
const swatchCard = (hex) => card(`<path d="M50,14 C70,40 80,52 80,64 C80,82 66,92 50,92 C34,92 20,82 20,64 C20,52 30,40 50,14 Z" fill="${hex}" stroke="#1e293b" stroke-width="2.5"/><ellipse cx="40" cy="62" rx="6" ry="10" fill="#fff" opacity=".45"/>`);
export const renderPicture = (r) => {
  if (!r) return '';
  if (r.swatch) return swatchCard(r.swatch);
  if (r.digit) return emojiCard([], { digit: r.digit });
  return emojiCard(r.items, { frame: r.frame });
};
// resmin kimliği (aynı görünen şıkları yakalamak için)
export const pictureSig = (r) => (!r ? '' : r.swatch ? 's' + r.swatch : r.digit ? 'd' + r.digit : (r.frame ? 'F' : '') + r.items.map(i => i.emoji + (i.tint || '') + (i.scale || 1)).join(','));
// Şık resimleri: hepsi birbirinden farklı olmalı. Aynı düşenlerde fiil resmi eklenir; yine aynıysa [] (resimsiz).
export const optionPictures = (texts) => {
  let rs = texts.map(pictureItems);
  if (rs.some(r => !r)) return [];
  const sig = () => rs.map(pictureSig);
  let s = sig();
  if (new Set(s).size < s.length) {
    rs = rs.map((r, k) => {
      if (s.filter(x => x === s[k]).length < 2 || r.swatch || r.digit) return r;
      const v = findVerb(texts[k]);
      return v && !r.items.some(i => i.emoji === v) ? { ...r, items: [{ emoji: v }, ...r.items.slice(0, 1)] } : r;
    });
    s = sig();
    if (new Set(s).size < s.length) return [];
  }
  return rs.map(renderPicture);
};

export const picture = (text) => {
  const r = pictureItems(text);
  if (!r) return '';
  if (r.swatch) return swatchCard(r.swatch);
  if (r.digit) return emojiCard([], { digit: r.digit });
  return emojiCard(r.items, { frame: r.frame });
};

// ---------------------------------------------------------------------------
// SAHNE: metindeki karakterler (kişi/hayvan) önce, sonra yer/doğa/nesne -> 2-3 emoji
// isimler (büyük harfli, sözlükte olmayan) -> çocuk
// ---------------------------------------------------------------------------
const CAT_RANK = { a: 0, p: 0, l: 1, n: 2, v: 2, o: 3, f: 3, w: 9 };
export const sceneItems = (text, { max = 3, skip = [] } = {}) => {
  const nouns = findNouns(text).filter(n => n.cat !== 'w' && !skip.includes(n.emoji));
  const seen = new Set(); const picks = [];
  const hasPerson = /\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}\b/.test(String(text).replace(/(^|[.!?]\s+)[A-ZÇĞİÖŞÜ][a-zçğıöşü]+/g, '$1')) && !nouns.some(n => n.cat === 'a' || n.cat === 'p');
  if (hasPerson) { picks.push({ emoji: '🧒' }); seen.add('🧒'); }
  [...nouns].sort((a, b) => (CAT_RANK[a.cat] - CAT_RANK[b.cat]) || a.pos - b.pos).forEach(n => {
    if (picks.length >= max || seen.has(n.emoji)) return;
    seen.add(n.emoji); picks.push({ emoji: n.emoji });
  });
  return picks;
};
export const scene = (text, opts) => { const it = sceneItems(text, opts); return it.length ? emojiCard(it) : ''; };

// ---------------------------------------------------------------------------
// ÖZEL İFADELER (hikâye / neden-sonuç / mekân şıklarında aynı resme düşenleri ayırmak için)
// ---------------------------------------------------------------------------
const e1 = (...es) => es.map(x => (typeof x === 'string' ? { emoji: x } : x));
addPictureOverrides({
  // hikâyeler (3 soruluk)
  'Altın sarısı uzay gemisi': [{ emoji: '🛸', tint: '#eab308' }],
  'Kırmızı renkli elektrik süpürgesi': e1('🔌', { emoji: '🧹', tint: '#ef4444' }),
  'Pırıl pırıl ve düzenli bir oda': e1('✨', '🛋️'), 'Daha çok dağılmış bir oda': e1('🧦', '🧸', '📚'), 'Eşyaların kırıldığı bir oda': e1('💥', '🏺'),
  'Salon halısının üstünde': e1('🛋️'), 'Kapı önündeki paspasın üzerinde': e1('🚪'),
  'Kelebek düğümü': e1('🎀'), 'Denizci düğümü': e1('⚓', '🪢'), 'Çift düğüm': e1('🪢', '🪢'),
  'Ahşap dikiş kutusu': e1('🧵', '📦'), 'Takı kutusu': e1('💍', '📦'), 'Oyuncak kutusu': e1('🧸', '📦'),
  'Yuvarlak bir tef': e1('🪘'), 'Metal saplı çırpıcı': e1('🥣'), 'Plastik spatula': e1('🍳'),
  'Sayı tablosu': e1('🔢'), 'Büyükten küçüğe harfler olan göz harf tablosu': e1('👁️', '🔤'), 'Renkli şekiller tablosu': e1('🔺', '🔷'),
  'Büyük un çuvalı': e1('🌾', '🛍️'), 'Şeker kavanozu': e1('🍬', '🫙'), 'Süt şişesi': e1('🍼'), 'Cam süt şişesi': e1('🍼'), 'Su şişesi': e1('💧', '🫙'),
  'Karton meyve suyu kutusu': e1('🧃'),
  'Pompalı sıvı sabun': e1('🧼'), 'Sıvı sabun': e1('🧼'), 'Kolonya': e1('🍋', '🧴'), 'Şampuan': e1('🧴'),
  'Müşteri hizmetleri': e1('💁'),
  'Yıldız şeklinde boncuk': e1('⭐'), 'Kalp şeklinde büyük pembe boncuk': e1('🩷'), 'Kare şeklinde boncuk': e1('🟦'),
  'Avize': e1('✨', '💡'), 'Tavan avizesi': e1('✨', '💡'), 'Başucu gece lambası': e1('🌙', '💡'), 'Pilli masa lambası': e1('🔋', '💡'),
  'Sarı renkli gece lambası': e1('🌙', { emoji: '💡', tint: '#facc15' }), 'Tavan lambası': e1('💡'),
  'Demir bahçe çapası': e1('⛏️'), 'Tırmık': e1('🔱'),
  'Oyuncak dolabında': e1('🧸', '🗄️'), 'Mutfak dolabında': e1('🍽️', '🗄️'),
  'Kırmızı kurdeleli mavi paket': [{ emoji: '🎁', tint: '#3b82f6' }], 'Sarı kurdeleli beyaz paket': [{ emoji: '🎁', tint: '#f8fafc' }],
  'Tırnak makası': e1('💅'), 'Sargı bezi': e1('🤕'),
  'Takılıp düşerek dizini yaralayabilirdi': e1('🤕'), 'Çok hızlı koşabilirdi': e1('🏃', '💨'),
  'Elektrikli blender': e1('🔌', '🥤'), 'Şeffaf cam meyve sıkacağı': e1('🍊'),
  // 2 soruluk görselli hikâyeler
  'Kalp şeklinde kurabiye kalıbı': e1('❤️', '🍪'), 'Yıldız şeklinde kurabiye kalıbı': e1('⭐', '🍪'), 'Çiçek şeklinde kurabiye kalıbı': e1('🌸', '🍪'),
  'Kalın bir sözlük': e1('📕'), 'Toprağın altındaki karınca yuvasına': e1('🐜', '🕳️'), 'Ağaçtaki sarı arı kovanına': e1('🐝', '🍯'), 'Kuş yuvasına': e1('🐦', '🪺'),
  'Küçük yeşil bir çalılığa': e1('🌿'), 'El arabası': e1('🛞', '🧺'), 'Ahşap bir okul sırası': e1('🪑', '📚'),
  'Şezlong': e1('🏖️'), 'Küçük bir balerin figürü': e1('🩰'), 'Alüminyum folyo': e1('🥡'), 'Altın renkli bir madalya': e1('🥇'),
  // mekân
  'Marul': e1('🥗'), 'Çilek reçeli': e1('🍓', '🫙'), 'Minderin üstünde': e1('🟪'),
  'Giyindi': e1('👕'), 'Dişlerini fırçaladı': e1('🪥'), 'Tahterevalliden': e1('⚖️'),
  'Portakal suyu': e1('🍊', '🥤'), 'Sivrisinek': e1('🦟'), 'Yoğurt': e1('🥣'),
  'Cebinde': e1('👖'), 'Suluboyayla': e1('🎨'), 'Kuru boyayla': e1('✏️'), 'Atlıkarıncaya': e1('🎠'),
  'Palamutu': e1('🍂', '🌰'), 'Fındığı': e1('🥜'), 'Kolluklarla': e1('🦺'), 'Ağzını çalkaladı': e1('👄', '💧'),
  // neden-sonuç
  'Soğuk bir süt içti.': e1('🧊', '🥛'), 'Tuzlu bir ayran içti.': e1('🧂', '🥛'),
  'Küplerden bir kule yaptı.': e1('🏰'), 'Kuruyup yok oldular.': e1('🥀'), 'Yağan kardı.': e1('❄️'),
  'Kalın bir çadır kurdular.': e1('⛺'), 'Ağaçtan kulübe yaptılar.': e1('🛖'),
  'Susamış çiçekleri suladı.': e1('💧', '🌸'), 'Çiçekleri koparıp attı.': e1('🥀'), 'Çiçeklerin üstünü örttü.': e1('⛱️', '🌸'),
  'Giysilerini dolaba astı.': e1('👕', '🗄️'), 'Kitaplarını rafa dizdi.': e1('📚'),
  'Rengi kahverengiye dönüştü.': e1('🟤'), 'Daha da hızlı gitmeye başladı.': e1('💨', '🚗'), 'Geri geri gitmeye başladı.': e1('🔙', '🚗')
});
