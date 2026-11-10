// ============================================================================
// --- SESLİ SORULAR: DİNLEDİĞİNİ ANLAMA (hikâye + 2 / 3 soru) ---
// ============================================================================
// 12 eğitici hikâye kurgusu (paylaşma, dürüstlük, temizlik, geri dönüşüm, trafik ...).
// Her hikâye karakter adı, hayvan, renk, yiyecek, yer ve hava durumu değişerek üretilir
// (100-110 kelime, giriş cümlesiyle birlikte). Her hikâyenin 2 ya da 3 sorusu vardır ve sorular hikâyedeki
// olay sırasını izler. Şıklar görsel ya da sesli (telefon okur / öğretmen sesi yüklenir).
import { ART, card, put, face, OL, S, SN } from '../art';
import { ART2, person } from '../art2';
import { makeRng, pick, shuffle, pickN, groupLayout, txt } from '../helpers';

const cap = (s) => s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1);

// --- Türkçe ek yardımcıları (özel isimlere kesme işaretiyle) ---
const lastVowel = (w) => { const m = w.toLocaleLowerCase('tr-TR').match(/[aıoueiöü](?=[^aıoueiöü]*$)/); return m ? m[0] : 'e'; };
const endsVowel = (w) => /[aıoueiöü]$/i.test(w.toLocaleLowerCase('tr-TR'));
const h4 = (w) => ({ a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u', ö: 'ü', ü: 'ü' })[lastVowel(w)];
const h2 = (w) => (['a', 'ı', 'o', 'u'].includes(lastVowel(w)) ? 'a' : 'e');
const GEN = (w) => `${w}'${endsVowel(w) ? 'n' : ''}${h4(w)}n`;   // Ada'nın, Mert'in
const ACC = (w) => `${w}'${endsVowel(w) ? 'y' : ''}${h4(w)}`;    // Ada'yı, Pamuk'u
const DAT = (w) => `${w}'${endsVowel(w) ? 'y' : ''}${h2(w)}`;    // Ada'ya, Mert'e
const DE = (w) => (h2(w) === 'a' ? 'da' : 'de');                    // kedi de, kuzu da
const NUM = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş'];
// 40 isim: aynı hikâye kurgusunda her hikâyenin kahramanı farklıdır (bütün bankada).
// Böylece her hikâyenin ilk cümlesi de farklı olur ve ses dosyası adıyla (ilk 250 karakter) karışmadan eşleşir.
const NAMES = ['Ada', 'Can', 'Ela', 'Mert', 'Defne', 'Ali', 'Zeynep', 'Efe', 'Elif', 'Kerem', 'Nil', 'Emir', 'Ayşe', 'Deniz', 'Yusuf', 'Mira', 'Arda', 'Duru', 'Eymen', 'Lina',
  'Ömer', 'Asel', 'Kuzey', 'Azra', 'Alp', 'Ecrin', 'Poyraz', 'Eylül', 'Aras', 'Masal', 'Doruk', 'Öykü', 'Selim', 'Nehir', 'Tuna', 'İpek', 'Bora', 'Ceren', 'Umut', 'Su'];

// --- Cevap havuzları: { id, label, art } ---
const A = (id, label, art, more = {}) => ({ id, label, art, ...more });
const ANIMALS = [
  A('kedi', 'Kedi', () => ART.cat(), { acc: 'kediyi', dat: 'kediye', pets: ['Pamuk', 'Minnoş', 'Tekir'] }),
  A('kopek', 'Köpek', () => ART.dog(), { acc: 'köpeği', dat: 'köpeğe', pets: ['Karabaş', 'Fındık', 'Boncuk'] }),
  A('tavsan', 'Tavşan', () => ART.rabbit(), { acc: 'tavşanı', dat: 'tavşana', pets: ['Zıpzıp', 'Kartopu', 'Havuç'] }),
  A('kus', 'Kuş', () => ART.bird(), { acc: 'kuşu', dat: 'kuşa', pets: ['Cikcik', 'Maviş', 'Limon'] }),
  A('ordek', 'Ördek', () => ART.duck(), { acc: 'ördeği', dat: 'ördeğe', pets: ['Vakvak', 'Paytak', 'Sarıkız'] }),
  A('kaplumbaga', 'Kaplumbağa', () => ART.turtle(), { acc: 'kaplumbağayı', dat: 'kaplumbağaya', pets: ['Tosbik', 'Kabuk', 'Ağırcan'] }),
  A('kuzu', 'Kuzu', () => ART.sheep(), { acc: 'kuzuyu', dat: 'kuzuya', pets: ['Bulut', 'Pamuk', 'Kıvırcık'] }),
  A('kurbaga', 'Kurbağa', () => ART.frog(), { acc: 'kurbağayı', dat: 'kurbağaya', pets: ['Vırak', 'Zıpır', 'Yeşilim'] })
];
const COLORS = [
  A('kirmizi', 'Kırmızı', null, { hex: '#ef4444', adj: 'kırmızı' }), A('mavi', 'Mavi', null, { hex: '#3b82f6', adj: 'mavi' }),
  A('sari', 'Sarı', null, { hex: '#facc15', adj: 'sarı' }), A('yesil', 'Yeşil', null, { hex: '#22c55e', adj: 'yeşil' }),
  A('mor', 'Mor', null, { hex: '#a855f7', adj: 'mor' }), A('turuncu', 'Turuncu', null, { hex: '#f97316', adj: 'turuncu' })
];
const FOODS = [
  A('elma', 'Elma', () => ART.apple(), { acc: 'elmayı', pl: 'elma' }), A('cilek', 'Çilek', () => ART.strawberry(), { acc: 'çileği', pl: 'çilek' }),
  A('muz', 'Muz', () => ART.banana(), { acc: 'muzu', pl: 'muz' }), A('portakal', 'Portakal', () => ART.orange(), { acc: 'portakalı', pl: 'portakal' }),
  A('armut', 'Armut', () => ART2.pear(), { acc: 'armudu', pl: 'armut' }), A('kurabiye', 'Kurabiye', () => ART.cookie(), { acc: 'kurabiyeyi', pl: 'kurabiye' }),
  A('karpuz', 'Karpuz', () => ART.watermelon(), { acc: 'karpuzu', pl: 'dilim karpuz' }), A('uzum', 'Üzüm', () => ART2.grapes(), { acc: 'üzümü', pl: 'salkım üzüm' })
];
const sceneBox = (inner, bg) => `<rect x="4" y="4" width="92" height="92" rx="10" fill="${bg}"/>${inner}`;
const grass = `<rect x="4" y="80" width="92" height="16" fill="#86efac"/>`;
const PLACES = [
  A('park', 'Park', () => sceneBox(`${grass}${put(ART.tree(), 26, 52, 0.55)}<path d="M54,80 L60,46 L64,46 L58,80 Z M76,80 L80,46 L84,46 L82,80 Z" fill="#ef4444" ${S} stroke-width="1.6"/><path d="M60,46 L82,46 M58,58 L80,58 M56,70 L78,70" ${SN} stroke-width="2.5"/>`, '#e0f2fe'), { dat: 'parka', loc: 'parkta' }),
  A('orman', 'Orman', () => sceneBox(`${grass}${put(ART.pine(), 24, 52, 0.55)}${put(ART.pine(), 52, 46, 0.65)}${put(ART.pine(), 78, 54, 0.5)}`, '#dcfce7'), { dat: 'ormana', loc: 'ormanda' }),
  A('deniz', 'Deniz kenarı', () => sceneBox(`<rect x="4" y="54" width="92" height="42" fill="#38bdf8"/><path d="M4,82 C30,74 60,90 96,80 L96,96 L4,96 Z" fill="#fde68a"/>${put(ART.boat('#ef4444'), 60, 46, 0.4)}${put(ART.sun(), 22, 22, 0.3)}`, '#e0f2fe'), { dat: 'deniz kenarına', loc: 'deniz kenarında' }),
  A('bahce', 'Bahçe', () => sceneBox(`${grass}${put(ART.flower('#ec4899'), 24, 62, 0.4)}${put(ART.flower('#facc15'), 48, 64, 0.38)}${put(ART.flower('#8b5cf6'), 72, 62, 0.4)}<path d="M8,72 L92,72 M8,62 L92,62" stroke="#a16207" stroke-width="3"/>`, '#fef9c3'), { dat: 'bahçeye', loc: 'bahçede' }),
  A('ciftlik', 'Çiftlik', () => sceneBox(`${grass}<rect x="14" y="40" width="40" height="40" fill="#dc2626" ${S}/><path d="M10,42 L34,22 L58,42 Z" fill="#991b1b" ${S}/><rect x="26" y="56" width="16" height="24" fill="#fff" ${S} stroke-width="1.8"/>${put(ART.sheep(), 74, 68, 0.36)}`, '#e0f2fe'), { dat: 'çiftliğe', loc: 'çiftlikte' }),
  A('okul', 'Okul', () => sceneBox(`${grass}${put(ART2.school(), 50, 50, 0.8)}`, '#e0f2fe'), { dat: 'okula', loc: 'okulda' })
];
const WEATHER = [
  A('gunesli', 'Güneşli', () => sceneBox(`${put(ART.sun(), 50, 44, 0.75)}`, '#e0f2fe'), { adj: 'güneşli' }),
  A('yagmurlu', 'Yağmurlu', () => sceneBox(`${put(ART.cloud('#94a3b8'), 50, 34, 0.7)}<path d="M32,58 L28,68 M48,60 L44,70 M64,58 L60,68 M40,74 L36,84 M58,76 L54,86" stroke="#3b82f6" stroke-width="3.5" stroke-linecap="round"/>`, '#e2e8f0'), { adj: 'yağmurlu' }),
  A('karli', 'Karlı', () => sceneBox(`${put(ART.snowman(), 50, 52, 0.7)}<circle cx="20" cy="20" r="3" fill="#fff" ${S} stroke-width="1"/><circle cx="80" cy="26" r="3" fill="#fff" ${S} stroke-width="1"/><circle cx="72" cy="12" r="2.5" fill="#fff" ${S} stroke-width="1"/>`, '#bae6fd'), { adj: 'karlı' }),
  A('ruzgarli', 'Rüzgârlı', () => sceneBox(`${put(ART.kite('#ef4444'), 64, 36, 0.5)}<path d="M10,30 C24,24 34,36 48,30 M10,50 C24,44 34,56 48,50 M14,70 C28,64 38,76 52,70" ${SN} stroke="#64748b" stroke-width="3"/>`, '#e0f2fe'), { adj: 'rüzgârlı' })
];
const EMOS = [
  A('mutlu', 'Mutlu', () => face('happy', { skin: '#fcd9b6', hair: '#78350f' })), A('uzgun', 'Üzgün', () => face('sad', { skin: '#fcd9b6', hair: '#78350f' })),
  A('korkmus', 'Korkmuş', () => face('scared', { skin: '#fcd9b6', hair: '#78350f' })), A('sasirmis', 'Şaşırmış', () => face('surprised', { skin: '#fcd9b6', hair: '#78350f' }))
];
const TOYS = [
  A('balon', 'Balon', (c) => ART.balloon(c), { acc: 'balonu', gen: 'balonun' }), A('top', 'Top', (c) => ART.ball(c), { acc: 'topu', gen: 'topun' }),
  A('ucurtma', 'Uçurtma', (c) => ART.kite(c), { acc: 'uçurtmayı', gen: 'uçurtmanın' }), A('semsiye', 'Şemsiye', (c) => ART.umbrella(c), { acc: 'şemsiyeyi', gen: 'şemsiyenin' })
];
const PEOPLE = [
  A('dede', 'Dede', () => person({ shirt: '#64748b', hair: '#e5e7eb', glasses: true })), A('anne', 'Anne', () => person({ shirt: '#ec4899', hair: '#451a03' })),
  A('baba', 'Baba', () => person({ shirt: '#2563eb', hair: '#1e293b' })), A('ogretmen', 'Öğretmen', () => person({ shirt: '#8b5cf6', glasses: true, item: ART.book('#ef4444') }))
];
const countArt = (food, n) => () => groupLayout(n, food.art(), { x: 8, y: 8, w: 84, h: 84 }, 0.42);

// Bir soru: { q: 'soru metni', ans: cevap, pool: [çeldirici adayları], kind?: 'color'|'count', hex? }
// Görsel şıkta resim, sesli şıkta yazı + telefonla okuma kullanılır.
// --------------------------------------------------------------------------
// HİKÂYE KURGULARI (her biri ~95 kelime)
// --------------------------------------------------------------------------
const SK = [
  // 1) Paylaşmak güzeldir
  (v) => ({
    title: 'Paylaşmak güzeldir',
    text: `Bir sabah ${v.name} ailesiyle ${v.place.dat} pikniğe gitti. Hava ${v.weather.adj} ve çok güzeldi. ${v.name} sepetine ${NUM[v.n]} tane ${v.food.pl} koydu. En sevdiği ${v.toyColor.adj} ${v.toy.acc} ${DE(v.toy.acc)} yanına aldı. Babası örtüyü serdi, annesi de bardaklara limonata koydu. Herkes ağaçların gölgesinde oturdu. Piknik yerinde ${v.friend} adında bir çocukla tanıştı. ${v.friend} çok üzgündü, çünkü yiyeceklerini evde unutmuştu. ${v.name} sepetinden bir ${v.food.pl} çıkarıp ona uzattı. “Al, birlikte yiyelim” dedi. İki arkadaş yemeklerini paylaştı, sonra ${v.toy.label.toLocaleLowerCase('tr-TR')} ile oynadılar. Uzaktan bir ${v.animal.label.toLocaleLowerCase('tr-TR')} onları izliyordu. Akşam eve dönerken ikisi de çok mutluydu. Yeniden buluşmak için sözleştiler. Annesi “Paylaşmak sevgiyi büyütür” dedi ve onu öptü.`,
    qs: [
      { q: `${v.name} pikniğe nereye gitti?`, ans: v.place, pool: PLACES },
      { q: 'Piknik günü hava nasıldı?', ans: v.weather, pool: WEATHER },
      { q: `${v.name} sepetine kaç tane ${v.food.pl} koydu?`, ans: { id: 'n' + v.n, label: cap(NUM[v.n]), art: countArt(v.food, v.n) }, pool: [1, 2, 3, 4, 5].map(n => ({ id: 'n' + n, label: cap(NUM[n]), art: countArt(v.food, n) })) },
      { q: `${v.name} arkadaşıyla hangi yiyeceği paylaştı?`, ans: v.food, pool: FOODS },
      { q: `${GEN(v.name)} oyuncağı ne renkti?`, ans: v.toyColor, pool: COLORS, kind: 'color', toy: v.toy },
      { q: 'Hikâyenin sonunda iki arkadaş nasıl hissetti?', ans: EMOS[0], pool: EMOS },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Paylaşmak sevgiyi büyütür.' }, pool: [{ id: 'l2', label: 'Oyuncaklar saklanmalıdır.' }, { id: 'l3', label: 'Piknikte hiç oyun oynanmaz.' }, { id: 'l4', label: 'Yiyecekleri kimseye vermemeliyiz.' }], textOnly: true }
    ]
  }),
  // 2) Kayıp dost
  (v) => ({
    title: 'Kaybolan dost',
    text: `${GEN(v.name)} ${v.pet} adında sevimli bir ${v.animal.label.toLocaleLowerCase('tr-TR')} dostu vardı. Bir gün ${v.name} okuldan döndüğünde ${ACC(v.pet)} hiçbir yerde göremedi. Yatağın altına, dolabın içine, bahçeye baktı. Hiçbir yerde yoktu. Çok üzüldü ve gözleri doldu. Annesiyle birlikte onu aramak için ${v.place.dat} çıktılar. Hava ${v.weather.adj} idi. ${v.name}, ${GEN(v.pet)} sevdiği ${v.food.acc} eline aldı ve seslendi: “${v.pet}, neredesin?” Biraz sonra bir ağacın arkasından küçük bir ses geldi. ${v.pet} orada ${v.toyColor.adj} bir ${v.toy.label.toLocaleLowerCase('tr-TR')} ile oynuyordu! ${v.name} ona sıkıca sarıldı ve birlikte eve döndüler. Annesi kapının açık kaldığını fark etti. “Kapıyı açık bırakırsak dostlarımız kaybolabilir” dedi. O günden sonra ${v.name} kapıyı hep kapattı.`,
    qs: [
      { q: `${GEN(v.name)} kaybolan dostu hangi hayvandı?`, ans: v.animal, pool: ANIMALS },
      { q: `${v.pet} kaybolunca ${v.name} nasıl hissetti?`, ans: EMOS[1], pool: EMOS },
      { q: 'Dostlarını ararken hava nasıldı?', ans: v.weather, pool: WEATHER },
      { q: `${v.name} ${ACC(v.pet)} çağırırken eline hangi yiyeceği aldı?`, ans: v.food, pool: FOODS },
      { q: `${v.pet} hangi renk oyuncakla oynuyordu?`, ans: v.toyColor, pool: COLORS, kind: 'color', toy: v.toy },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Kapıyı açık bırakmamalıyız.' }, pool: [{ id: 'l2', label: 'Hayvanlar evde hiç oynamaz.' }, { id: 'l3', label: 'Ağaçlar çok uzundur.' }, { id: 'l4', label: 'Okuldan erken dönmeliyiz.' }], textOnly: true }
    ]
  }),
  // 3) Yağmurda yardımlaşma
  (v) => ({
    title: 'Şemsiyeni paylaş',
    text: `O gün hava çok bulutluydu. Annesi ${DAT(v.name)} ${v.toyColor.adj} şemsiyesini verdi. Öğleden sonra gökyüzü karardı. Okul çıkışında yağmur başladı. Damlalar pıt pıt yere düşüyordu. ${v.name} hemen ${v.toyColor.adj} şemsiyesini açtı. Arkadaşı ${GEN(v.friend)} şemsiyesi yoktu ve sırılsıklam olmuştu. ${v.name} yanına koştu. “Gel, şemsiyemin altına gir” dedi. İki arkadaş tek şemsiyenin altında yan yana, şarkı söyleyerek yürüdü. Yol hiç bitmesin istediler. Yolda bir su birikintisinde yüzen bir ${v.animal.label.toLocaleLowerCase('tr-TR')} gördüler ve güldüler. Ertesi gün ${v.friend}, teşekkür etmek için ${DAT(v.name)} bir ${v.food.label.toLocaleLowerCase('tr-TR')} getirdi. İki arkadaş bahçede birlikte oynadılar ve çok mutlu oldular. Yardım etmek onları daha iyi arkadaş yapmıştı.`,
    qs: [
      { q: 'Okul çıkışında hava nasıldı?', ans: WEATHER[1], pool: WEATHER },
      { q: `${GEN(v.name)} şemsiyesi ne renkti?`, ans: v.toyColor, pool: COLORS, kind: 'color', toy: TOYS[3] },
      { q: 'İki arkadaş su birikintisinde hangi hayvanı gördü?', ans: v.animal, pool: ANIMALS },
      { q: `${v.friend} teşekkür etmek için ne getirdi?`, ans: v.food, pool: FOODS },
      { q: 'Hikâyenin sonunda arkadaşlar nasıl hissetti?', ans: EMOS[0], pool: EMOS },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Arkadaşımıza yardım etmeliyiz.' }, pool: [{ id: 'l2', label: 'Yağmurda dışarı çıkılmaz.' }, { id: 'l3', label: 'Şemsiyemizi kimseye vermemeliyiz.' }, { id: 'l4', label: 'Su birikintisine atlamalıyız.' }], textOnly: true }
    ]
  }),
  // 4) Sağlıklı beslenme
  (v) => ({
    title: 'Enerji dolu bir gün',
    text: `${v.name} sabah çok yorgun uyandı ve kahvaltı yapmadan oynamak istedi. Annesi “Önce kahvaltını yap, yoksa çabucak yorulursun” dedi. Masada peynir, ekmek, yumurta ve ${v.food.pl} vardı. ${v.name} her şeyden biraz tattı. En çok ${v.food.acc} beğendi. Bir bardak da süt içti. Kahvaltıdan sonra kendini enerji dolu hissetti. Hava ${v.weather.adj} idi. Sonra ${v.toyColor.adj} ${v.toy.acc} alıp ${v.place.dat} gitti. Orada arkadaşı ${v.friend} şekerleme yiyordu ve karnı ağrıyordu. ${v.name} ona “Meyve yersek güçlü oluruz” dedi. İki arkadaş birlikte koşup zıpladılar, saklambaç oynadılar. Bir ${v.animal.label.toLocaleLowerCase('tr-TR')} ${DE(v.animal.label)} onlarla koşuyordu. Akşam ${v.name} hiç yorgun değildi. “Sağlıklı beslenmek bizi güçlü yapar” diye düşündü.`,
    qs: [
      { q: `Kahvaltıda ${GEN(v.name)} en çok beğendiği yiyecek hangisiydi?`, ans: v.food, pool: FOODS },
      { q: `${v.name} oyun oynamaya nereye gitti?`, ans: v.place, pool: PLACES },
      { q: `${v.name} oynamak için hangi renk oyuncağını aldı?`, ans: v.toyColor, pool: COLORS, kind: 'color', toy: v.toy },
      { q: 'Çocuklarla birlikte hangi hayvan koşuyordu?', ans: v.animal, pool: ANIMALS },
      { q: 'O gün hava nasıldı?', ans: v.weather, pool: WEATHER },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Kahvaltı yapmak ve meyve yemek bizi güçlü yapar.' }, pool: [{ id: 'l2', label: 'Çok şeker yemeliyiz.' }, { id: 'l3', label: 'Kahvaltı yapmadan oynamalıyız.' }, { id: 'l4', label: 'Hiç dışarı çıkmamalıyız.' }], textOnly: true }
    ]
  }),
  // 5) Temizlik
  (v) => ({
    title: 'Mikroplara dur de',
    text: `${v.name} ${v.place.loc} ${v.pet} adındaki ${v.animal.label.toLocaleLowerCase('tr-TR')} ile oynuyordu. Toprağı kazdılar, çamurdan kuleler ve küçük yollar yaptılar. Çok eğlendiler ve bol bol güldüler. Bir süre sonra ${GEN(v.name)} karnı acıktı. Eve koşup masadaki ${v.food.acc} almak için elini uzattı. Annesi “Dur bakalım, ellerine bir bak” dedi. ${GEN(v.name)} elleri çamur içindeydi. Annesi kirli ellerde mikroplar olduğunu, böyle yemek yersek hasta olabileceğimizi anlattı. ${v.name} lavaboya koştu. Ellerini sabunla güzelce köpürttü, parmak aralarını ovaladı ve suyla duruladı. Sonra ${v.toyColor.adj} havlusuyla kuruladı. Ardından masaya oturdu ve afiyetle yemeğini yedi. Annesi ona gülümseyerek baktı. O günden sonra ${v.name} her yemekten önce ellerini sabunla yıkadı.`,
    qs: [
      { q: `${v.name} hangi hayvanla oynuyordu?`, ans: v.animal, pool: ANIMALS },
      { q: `${v.name} oyun oynadıktan sonra ne yemek istedi?`, ans: v.food, pool: FOODS },
      { q: `${GEN(v.name)} havlusu ne renkti?`, ans: v.toyColor, pool: COLORS, kind: 'color' },
      { q: `${v.name} nerede oynuyordu?`, ans: v.place, pool: PLACES },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Yemekten önce ellerimizi sabunla yıkamalıyız.' }, pool: [{ id: 'l2', label: 'Çamurla oynamak yasaktır.' }, { id: 'l3', label: 'Ellerimizi sadece akşam yıkarız.' }, { id: 'l4', label: 'Havlu kullanmamalıyız.' }], textOnly: true }
    ]
  }),
  // 6) Geri dönüşüm
  (v) => ({
    title: 'Doğayı koruyalım',
    text: `Cumartesi sabahı ${v.name} ve arkadaşı ${v.friend} ${v.place.dat} gittiler. Hava ${v.weather.adj} idi. Yerde plastik şişeler, kâğıtlar ve kutular gördüler. Bir ${v.animal.label.toLocaleLowerCase('tr-TR')} plastik bir poşete sıkışmıştı! ${v.name} poşeti dikkatlice çıkarıp hayvanı kurtardı. İki arkadaş çöpleri toplamaya karar verdi. Ellerine eldiven taktılar ve büyük torbalar aldılar. Önce çimlerin üstünü, sonra bankların altını temizlediler. Kâğıtları mavi kutuya, plastik şişeleri sarı kutuya, camları yeşil kutuya attılar. Bunlara geri dönüşüm kutusu denir. Çalışırken acıkınca yanlarındaki ${v.food.acc} yediler, kabuklarını da çöpe attılar. Akşam olunca her yer tertemizdi ve herkes çok mutluydu. ${v.name} “Dünya hepimizin evi, onu temiz tutmalıyız” dedi.`,
    qs: [
      { q: 'Plastik poşete hangi hayvan sıkışmıştı?', ans: v.animal, pool: ANIMALS },
      { q: 'Kâğıtlar hangi renk kutuya atıldı?', ans: COLORS[1], pool: COLORS.filter(c => ['mavi', 'sari', 'yesil', 'kirmizi'].includes(c.id)), kind: 'color', bin: true },
      { q: 'Çocuklar çalışırken hangi yiyeceği yediler?', ans: v.food, pool: FOODS },
      { q: 'Akşam olduğunda herkes nasıl hissetti?', ans: EMOS[0], pool: EMOS },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Çöpleri yere atmamalı, geri dönüşüm kutusuna atmalıyız.' }, pool: [{ id: 'l2', label: 'Parka hiç gitmemeliyiz.' }, { id: 'l3', label: 'Bütün çöpler aynı kutuya atılır.' }, { id: 'l4', label: 'Hayvanlara yardım etmemeliyiz.' }], textOnly: true }
    ]
  }),
  // 7) Dürüstlük
  (v) => ({
    title: 'Doğruyu söylemek',
    text: `Yağmurlu bir gündü ve ${v.name} dışarı çıkamıyordu. Bu yüzden ${v.toyColor.adj} topunu alıp salonda oynamaya başladı. Annesi evde top oynamamasını söylemişti. ${v.name} topu duvara attı, top zıpladı ve pencerenin önündeki saksıya çarptı. Saksı yere düşüp kırıldı! Toprak her yere dağıldı, çiçek de yere devrildi. ${v.name} çok korktu. O sırada ${v.pet} adındaki ${v.animal.label.toLocaleLowerCase('tr-TR')} odaya girdi. ${v.name} “Saksıyı ${v.pet} kırdı derim” diye düşündü ama bunun doğru olmadığını anladı. Annesi gelince “Saksıyı ben kırdım, özür dilerim” dedi. Annesi ona sarıldı: “Doğruyu söylediğin için seninle gurur duyuyorum.” Akşam babası ona bir ${v.food.label.toLocaleLowerCase('tr-TR')} getirdi. ${v.name} o gece içi rahat bir şekilde uyudu.`,
    qs: [
      { q: `${GEN(v.name)} topu ne renkti?`, ans: v.toyColor, pool: COLORS, kind: 'color', toy: TOYS[1] },
      { q: 'Top neye çarptı?', ans: { id: 'saksi', label: 'Saksıya', art: () => ART2.flowerPot() }, pool: [{ id: 'lamba', label: 'Lambaya', art: () => ART.lamp() }, { id: 'saat', label: 'Saate', art: () => ART.clock('#3b82f6') }, { id: 'kapi', label: 'Kapıya', art: () => ART.door() }] },
      { q: `Saksı kırılınca ${v.name} nasıl hissetti?`, ans: EMOS[2], pool: EMOS },
      { q: 'Odaya hangi hayvan girdi?', ans: v.animal, pool: ANIMALS },
      { q: 'Babası eve gelince ne getirdi?', ans: v.food, pool: FOODS },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Hata yapınca doğruyu söylemeliyiz.' }, pool: [{ id: 'l2', label: 'Suçu başkasına atmalıyız.' }, { id: 'l3', label: 'Saksılar hiç kırılmaz.' }, { id: 'l4', label: 'Evde top oynamak çok güzeldir.' }], textOnly: true }
    ]
  }),
  // 8) Kışın hayvanlara yardım
  (v) => ({
    title: 'Kar yağınca',
    text: `Kış gelmişti ve her yer bembeyaz karla kaplanmıştı. ${v.name} montunu, ${v.toyColor.adj} beresini ve eldivenlerini giydi. Babasıyla ${v.place.dat} çıktılar ve kocaman bir kardan adam yaptılar. Sonra ${v.name} bir ağacın dalında titreyen küçük bir kuş gördü. Kuş çok üşümüş ve acıkmıştı. Babası kuşların ekmek kırıntısı sevdiğini söyledi. Bir kutudan kuş evi yapıp içine ekmek kırıntısı koydular ve dala astılar. Küçük kuş önce çekindi, sonra gelip yemlerini yedi. Ardından arkadaşları da geldi. ${v.name} çok mutlu oldu. Annesi ona sıcak süt ve ${v.food.label.toLocaleLowerCase('tr-TR')} getirdi. Yakında bir ${v.animal.label.toLocaleLowerCase('tr-TR')} ${DE(v.animal.label)} karda zıplıyordu. ${v.name} o kış her sabah kuşlara yem koydu.`,
    qs: [
      { q: 'Hikâyede hava nasıldı?', ans: WEATHER[2], pool: WEATHER },
      { q: `${GEN(v.name)} beresi ne renkti?`, ans: v.toyColor, pool: COLORS, kind: 'color' },
      { q: 'Ağacın dalında hangi hayvan titriyordu?', ans: ANIMALS[3], pool: ANIMALS },
      { q: 'Kuşa ne verdiler?', ans: { id: 'ekmek', label: 'Ekmek kırıntısı', art: () => ART.bread() }, pool: [{ id: 'dondurma', label: 'Dondurma', art: () => ART.icecream('#f9a8d4') }, { id: 'cikolata', label: 'Çikolata', art: () => ART.chocolate() }, { id: 'cips', label: 'Cips', art: () => ART.chips() }] },
      { q: `Kuşlar gelince ${v.name} nasıl hissetti?`, ans: EMOS[0], pool: EMOS },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Kışın hayvanlara yardım etmeliyiz.' }, pool: [{ id: 'l2', label: 'Kar yağınca evden hiç çıkmamalıyız.' }, { id: 'l3', label: 'Kuşlar dondurma yer.' }, { id: 'l4', label: 'Kardan adam yapmak yasaktır.' }], textOnly: true }
    ]
  }),
  // 9) Trafik güvenliği
  (v) => ({
    title: 'Yeşil ışıkta geçeriz',
    text: `${v.name} her sabah okula dedesiyle yürüyerek gidiyordu. Bu sabah elinde ${v.toyColor.adj} çantası vardı. Hava ${v.weather.adj} idi. Yolda dedesi ona eski zamanlardan komik hikâyeler anlattı. Kavşağa geldiklerinde ${v.name} karşıya koşmak istedi ama dedesi onu durdurdu. “Önce ışığa bakalım. Kırmızı ışıkta durur, yeşil ışıkta geçeriz” dedi. Işık kırmızıydı, ikisi de sabırla beklediler. Bu sırada yolun karşısında bir ${v.animal.label.toLocaleLowerCase('tr-TR')} gördüler. Işık yeşile dönünce önce sağa, sonra sola baktılar. Yaya geçidinden el ele, dikkatlice karşıya geçtiler. Okulun kapısında dedesine sarılıp vedalaştı. Teneffüste ${v.name} beslenme çantasından ${v.food.acc} çıkarıp yedi. Akşam dedesi “Aferin, kurallara uyan çocuk güvende olur” dedi.`,
    qs: [
      { q: `${v.name} okula kiminle gidiyordu?`, ans: PEOPLE[0], pool: PEOPLE },
      { q: 'Yayalar hangi renk ışıkta karşıya geçer?', ans: COLORS[3], pool: COLORS.filter(c => ['kirmizi', 'sari', 'yesil', 'mavi'].includes(c.id)), kind: 'color', light: true },
      { q: 'Yolun karşısında hangi hayvanı gördü?', ans: v.animal, pool: ANIMALS },
      { q: `${v.name} teneffüste ne yedi?`, ans: v.food, pool: FOODS },
      { q: 'O gün hava nasıldı?', ans: v.weather, pool: WEATHER },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Karşıya yeşil ışıkta, yaya geçidinden geçmeliyiz.' }, pool: [{ id: 'l2', label: 'Kırmızı ışıkta koşarak geçmeliyiz.' }, { id: 'l3', label: 'Yola bakmadan geçebiliriz.' }, { id: 'l4', label: 'Okula hiç yürüyerek gidilmez.' }], textOnly: true }
    ]
  }),
  // 10) Tohum ve sabır
  (v) => ({
    title: 'Sabırlı bahçıvan',
    text: `Bir gün öğretmen sınıfa küçük tohumlar getirdi. Her çocuğa bir saksı ve bir tohum verdi. ${GEN(v.name)} saksısı ${v.toyColor.adj} renkteydi. Öğretmen “Her gün sulayın ve sabırlı olun” dedi. ${v.name} tohumunu toprağa gömdü ve saksıyı pencerenin önüne koydu. Ertesi sabah uyanır uyanmaz koşarak saksısına baktı ama toprakta hiçbir şey yoktu. Çok şaşırdı. Annesi “Bitkiler yavaş büyür” dedi. ${v.name} her sabah saksısını suladı. ${v.pet} adındaki ${v.animal.label.toLocaleLowerCase('tr-TR')} ${DE(v.animal.label)} onu merakla izliyordu. Birkaç gün sonra minicik bir filiz çıktı. Filiz her gün biraz daha uzadı. Sonunda güzel bir çiçek açtı. Öğretmeni “Sabırla emek verdin, işte sonucu” dedi.`,
    qs: [
      { q: 'Öğretmen sınıfa ne getirdi?', ans: { id: 'tohum', label: 'Tohum', art: () => `<path d="M6,82 C20,70 80,70 94,82 L94,94 L6,94 Z" fill="#92400e" ${S}/><ellipse cx="50" cy="60" rx="10" ry="6" fill="#78350f" ${S}/>` }, pool: [{ id: 'top', label: 'Top', art: () => ART.ball('#ef4444') }, { id: 'kitap', label: 'Kitap', art: () => ART.book('#3b82f6') }, { id: 'balon', label: 'Balon', art: () => ART.balloon('#22c55e') }] },
      { q: `${GEN(v.name)} saksısı ne renkti?`, ans: v.toyColor, pool: COLORS, kind: 'color', pot: true },
      { q: `İlk sabah filiz çıkmadığını görünce ${v.name} nasıl hissetti?`, ans: EMOS[3], pool: EMOS },
      { q: `${ACC(v.name)} hangi hayvan izliyordu?`, ans: v.animal, pool: ANIMALS },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Sabırlı olmalı ve emek vermeliyiz.' }, pool: [{ id: 'l2', label: 'Bitkileri sulamamalıyız.' }, { id: 'l3', label: 'Tohumlar bir günde çiçek olur.' }, { id: 'l4', label: 'Saksılar karanlıkta durmalıdır.' }], textOnly: true }
    ]
  }),
  // 11) Doğum günü
  (v) => ({
    title: 'Sürpriz doğum günü',
    text: `Bugün ${GEN(v.friend)} doğum günüydü. ${v.name} ona sürpriz yapmak istedi. Annesiyle ${v.toyColor.adj} kâğıtlardan süsler kestiler. Üzerinde bir ${v.animal.label.toLocaleLowerCase('tr-TR')} resmi olan bir kart hazırladılar. Sonra bir pasta pişirdiler ve üstüne ${NUM[v.n]} tane mum diktiler. Arkadaşlar ${v.place.loc} toplanıp saklandı. ${v.friend} gelince hep birlikte “Sürpriz!” diye bağırdılar. ${v.friend} önce çok şaşırdı, sonra kahkahalarla güldü. Mumları üfledi ve gözlerini kapatıp bir dilek tuttu. Sonra herkes ona hep birlikte doğum günü şarkısı söyledi ve alkışladı. Arkadaşları hediyelerini verdi. Herkes pastadan yedi, yanında ${v.food.label.toLocaleLowerCase('tr-TR')} ${DE(v.food.label)} vardı. Akşam ${v.name} yatağına uzandı ve şöyle düşündü: “Arkadaşlarımızı mutlu etmek bizi de mutlu ediyor.”`,
    qs: [
      { q: `Kartta hangi hayvanın resmi vardı?`, ans: v.animal, pool: ANIMALS },
      { q: 'Pastanın üstünde kaç tane mum vardı?', ans: { id: 'n' + v.n, label: cap(NUM[v.n]), art: () => groupLayout(v.n, ART.candle('#60a5fa', { h: 0.5 }), { x: 8, y: 8, w: 84, h: 84 }, 0.42) }, pool: [2, 3, 4, 5].map(n => ({ id: 'n' + n, label: cap(NUM[n]), art: () => groupLayout(n, ART.candle('#60a5fa', { h: 0.5 }), { x: 8, y: 8, w: 84, h: 84 }, 0.42) })) },
      { q: `${v.friend} sürprizi görünce önce nasıl hissetti?`, ans: EMOS[3], pool: EMOS },
      { q: 'Pastanın yanında ne vardı?', ans: v.food, pool: FOODS },
      { q: 'Süsler ne renk kâğıttan kesildi?', ans: v.toyColor, pool: COLORS, kind: 'color' },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Arkadaşlarımızı mutlu etmek bizi de mutlu eder.' }, pool: [{ id: 'l2', label: 'Doğum günleri sıkıcıdır.' }, { id: 'l3', label: 'Hediyeleri kimseye vermemeliyiz.' }, { id: 'l4', label: 'Pastada hiç mum olmaz.' }], textOnly: true }
    ]
  }),
  // 12) Sıra beklemek
  (v) => ({
    title: 'Sıramı beklerim',
    text: `Hafta sonu ${v.name} ailesiyle ${v.place.dat} gitti. Hava ${v.weather.adj} idi. Orada salıncaklar, tahterevalli ve kocaman bir kaydırak vardı. Kaydırağın önünde uzun bir sıra vardı. ${v.name} hemen en öne geçmek istedi. Annesi “Herkes sırasını bekliyor, biz de beklemeliyiz” dedi. ${v.name} sıranın sonuna geçti. Önündeki çocuğun adı ${v.friend} idi. ${GEN(v.friend)} elinde ${v.toyColor.adj} bir ${v.toy.label.toLocaleLowerCase('tr-TR')} vardı. Beklerken tanıştılar, okullarını ve sevdikleri oyunları konuştular. Bir de yakınlarda dolaşan ${v.animal.acc} izlediler. Sıra, düşündüğünden çok daha çabuk geldi. İkisi de kaydıraktan neşeyle kaydı, sonra salıncakta sallandılar. Acıkınca ${v.name} çantasından ${v.food.acc} çıkarıp arkadaşıyla paylaştı. Annesi “Sıranı beklediğin için seninle gurur duyuyorum” dedi.`,
    qs: [
      { q: `${v.name} hafta sonu nereye gitti?`, ans: v.place, pool: PLACES },
      { q: `${GEN(v.friend)} oyuncağı ne renkti?`, ans: v.toyColor, pool: COLORS, kind: 'color', toy: v.toy },
      { q: 'Çocuklar beklerken hangi hayvanı izlediler?', ans: v.animal, pool: ANIMALS },
      { q: `${v.name} çantasından hangi yiyeceği çıkardı?`, ans: v.food, pool: FOODS },
      { q: 'O gün hava nasıldı?', ans: v.weather, pool: WEATHER },
      { q: 'Bu hikâyeden ne öğrendik?', ans: { id: 'l1', label: 'Sıramızı sabırla beklemeliyiz.' }, pool: [{ id: 'l2', label: 'Sıranın önüne geçmeliyiz.' }, { id: 'l3', label: 'Kaydırak sadece büyükler içindir.' }, { id: 'l4', label: 'Parkta arkadaş edinilmez.' }], textOnly: true }
    ]
  })
];

// Rengi gösteren resim: oyuncak / kutu / ışık / saksı ya da renk lekesi
const colorArt = (c, q) => {
  if (q.light) return `<rect x="34" y="8" width="32" height="84" rx="8" fill="#1e293b" ${S}/><circle cx="50" cy="30" r="10" fill="${c.id === 'kirmizi' ? c.hex : '#475569'}"/><circle cx="50" cy="70" r="10" fill="${c.hex}" ${S} stroke-width="1.5"/>`;
  if (q.bin) return `<path d="M24,30 L76,30 L70,90 L30,90 Z" fill="${c.hex}" ${S}/><rect x="20" y="22" width="60" height="10" rx="3" fill="${c.hex}" ${S}/><path d="M42,52 L50,44 L58,52 M50,44 L50,70" ${SN} stroke="#fff" stroke-width="3"/>`;
  if (q.pot) return ART2.flowerPot(c.hex);
  if (q.toy) return q.toy.art(c.hex);
  return `<circle cx="50" cy="50" r="34" fill="${c.hex}" ${S} stroke-width="3"/>`;
};

const pickWrong = (q, rng) => shuffle(q.pool.filter(p => p.id !== q.ans.id), rng).slice(0, 2);
const STORY_BG = '#f8fafc';
const optImage = (item, q) => card(put(q.kind === 'color' ? colorArt(item, q) : item.art(), 50, 50, 0.86), { bg: STORY_BG });

// mode: 'gorsel' (şıklar resim) | 'sesli' (şıklar sesli: yazı + telefon okur)
// parts: 2 | 3  -> hikâye başına soru sayısı
export const genStory = (mode, parts, salt) => (key, i) => {
  const storyNo = Math.floor(i / parts); const part = i % parts;
  const rng = makeRng(`${key}#story`, storyNo);
  const sk = SK[(storyNo + salt) % SK.length];
  // kahraman: aynı kurgu (sk) içinde 4 kalıbın 400 hikâyesinde hiç tekrar etmez
  const v0 = storyNo + salt;                                   // kurgu = v0 % 12, sıra = floor(v0 / 12) (0..8)
  const gIdx = (mode === 'sesli' ? 2 : 0) + (parts === 3 ? 1 : 0);
  const name = NAMES[(gIdx * 9 + Math.floor(v0 / 12) + (v0 % SK.length) * 3) % NAMES.length];
  const friend = pick(NAMES.filter(n => n !== name), rng);
  const animal = pick(ANIMALS, rng);
  const v = {
    name, friend, animal, pet: pick(animal.pets, rng), food: pick(FOODS, rng), place: pick(PLACES.filter(p => p.id !== 'okul'), rng),
    weather: pick(WEATHER.filter(w => w.id === 'gunesli' || w.id === 'ruzgarli'), rng), /* pikniğe / parka uygun hava */ toy: pick(TOYS.slice(0, 3), rng), toyColor: pick(COLORS, rng), n: 2 + Math.floor(rng() * 3)
  };
  const story = sk(v);
  // Sorular: hikâye sırasını koruyarak seç; görsel şıklarda "ne öğrendik" sorusu yok
  const pool = story.qs.filter(q => mode === 'sesli' || !q.textOnly);
  const start = storyNo % Math.max(1, pool.length - parts + 1);
  let chosen = pool.slice(start, start + parts);
  if (mode === 'sesli' && parts === 3 && !chosen.some(q => q.textOnly)) chosen = [...pool.filter(q => !q.textOnly).slice(start, start + 2), pool.find(q => q.textOnly)];
  const q = chosen[part] || pool[part];
  const qr = makeRng(`${key}#q`, i);
  const wrongs = pickWrong(q, qr);
  const intro = `Hikâyeyi dikkatle dinleyelim. Sonra sana ${NUM[parts]} soru soracağım.`;
  const storyId = `${key}-${storyNo + 1}`;
  const items = [q.ans, ...wrongs]; const order = shuffle([0, 1, 2], qr);
  const opts = order.map(k => {
    const it = items[k];
    if (mode === 'sesli' || q.textOnly) return { text: it.label, tts: it.label, image: '' };
    return optImage(it, q);
  });
  return {
    options: opts, correctIndex: order.indexOf(0),
    text: q.q, speak: q.q, tag: String(storyNo + 1),
    // giriş (ön ses 1) ve hikâye (ön ses 2) ayrı alanlarda: tekrar dinlemede sadece hikâye çalar
    fields: { storyId, storyIntro: intro, storyText: story.text, storyTitle: `${storyNo + 1}. ${story.title}`, storyPart: part + 1, storyTotal: parts }
  };
};
export const STORY_SKELETON_COUNT = SK.length;
